# 💳 Stripe Integration Guide für Elbfunkeln

## 📋 Übersicht

Detaillierte Implementierungsanleitung für die Stripe-Zahlungsintegration in der Elbfunkeln E-Commerce-Plattform.

---

## 🔑 1. Stripe Setup & Konfiguration

### 1.1 Erforderliche Stripe-Secrets
```bash
# Supabase Edge Function Environment Variables
STRIPE_SECRET_KEY=sk_test_...        # Stripe Secret Key
STRIPE_PUBLISHABLE_KEY=pk_test_...   # Stripe Publishable Key  
STRIPE_WEBHOOK_SECRET=whsec_...      # Webhook Signing Secret
```

### 1.2 Stripe-Konfiguration für Deutschland
```typescript
// Unterstützte Zahlungsmethoden für DE
const PAYMENT_METHODS = [
  'card',           // Kreditkarten
  'sepa_debit',     // SEPA-Lastschrift
  'sofort',         // Sofort/Klarna
  'giropay',        // Giropay
];

// Unterstützte Kreditkarten
const CARD_BRANDS = ['visa', 'mastercard', 'amex'];

// Deutsche MwSt
const VAT_RATE = 0.19; // 19% Standard
const VAT_RATE_REDUCED = 0.07; // 7% Ermäßigt
```

---

## 🏗️ 2. Backend Implementation (Supabase Edge Functions)

### 2.1 Payment API Endpoints

```typescript
// /supabase/functions/server/payment-api.tsx
import { Hono } from 'npm:hono';
import Stripe from 'npm:stripe';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
});

const app = new Hono();

// Payment Intent erstellen
app.post('/payments/create-intent', async (c) => {
  try {
    const { amount, currency = 'eur', order_id, customer_email } = await c.req.json();
    
    // MwSt berechnen
    const vatAmount = Math.round(amount * 0.19);
    const netAmount = amount - vatAmount;
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // Betrag in Cent
      currency,
      payment_method_types: ['card', 'sepa_debit', 'sofort'],
      metadata: {
        order_id,
        customer_email,
        vat_amount: vatAmount.toString(),
        net_amount: netAmount.toString(),
      },
      receipt_email: customer_email,
      description: `Elbfunkeln Bestellung #${order_id}`,
    });

    return c.json({
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id,
    });
  } catch (error) {
    console.error('Payment Intent Error:', error);
    return c.json({ error: error.message }, 400);
  }
});

// Payment Status prüfen
app.get('/payments/intent/:id', async (c) => {
  try {
    const { id } = c.req.param();
    const paymentIntent = await stripe.paymentIntents.retrieve(id);
    
    return c.json({
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      metadata: paymentIntent.metadata,
    });
  } catch (error) {
    return c.json({ error: error.message }, 404);
  }
});

// Stripe Webhooks verarbeiten
app.post('/webhooks/stripe', async (c) => {
  const sig = c.req.header('stripe-signature');
  const body = await c.req.text();
  
  try {
    const event = stripe.webhooks.constructEvent(
      body,
      sig!,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!
    );

    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object);
        break;
      case 'charge.dispute.created':
        await handleChargeback(event.data.object);
        break;
    }

    return c.json({ received: true });
  } catch (error) {
    console.error('Webhook Error:', error);
    return c.json({ error: error.message }, 400);
  }
});

export default app;
```

### 2.2 Webhook Event Handlers

```typescript
// Payment Success Handler
async function handlePaymentSuccess(paymentIntent: any) {
  const orderId = paymentIntent.metadata.order_id;
  
  // Bestellung als bezahlt markieren
  await updateOrderStatus(orderId, 'paid');
  
  // Rechnung generieren
  await generateInvoice(orderId, paymentIntent);
  
  // Bestätigungs-E-Mail senden
  await sendOrderConfirmation(orderId);
  
  // Lagerbestand reduzieren
  await updateInventory(orderId);
}

// Payment Failure Handler
async function handlePaymentFailure(paymentIntent: any) {
  const orderId = paymentIntent.metadata.order_id;
  
  await updateOrderStatus(orderId, 'payment_failed');
  await sendPaymentFailureEmail(orderId);
}

// Chargeback Handler
async function handleChargeback(charge: any) {
  const orderId = charge.metadata?.order_id;
  
  if (orderId) {
    await updateOrderStatus(orderId, 'disputed');
    await notifyAdminOfChargeback(orderId, charge);
  }
}
```

---

## 🎨 3. Frontend Integration

### 3.1 Stripe Elements Setup

```typescript
// components/StripeProvider.tsx
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export function StripeProvider({ children }: { children: React.ReactNode }) {
  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  );
}
```

### 3.2 Payment Form Component

```typescript
// components/PaymentForm.tsx
import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Button } from './ui/button';

interface PaymentFormProps {
  clientSecret: string;
  onSuccess: (paymentIntent: any) => void;
  onError: (error: string) => void;
}

export function PaymentForm({ clientSecret, onSuccess, onError }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });

      if (error) {
        onError(error.message || 'Zahlung fehlgeschlagen');
      } else if (paymentIntent?.status === 'succeeded') {
        onSuccess(paymentIntent);
      }
    } catch (err) {
      onError('Ein unerwarteter Fehler ist aufgetreten');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement 
        options={{
          layout: 'tabs',
          defaultValues: {
            billingDetails: {
              name: 'Max Mustermann',
              email: 'kunde@example.com',
            }
          }
        }}
      />
      
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing}
        className="w-full bg-elbfunkeln-green hover:bg-elbfunkeln-green/90"
      >
        {isProcessing ? 'Zahlung wird verarbeitet...' : 'Jetzt bezahlen'}
      </Button>
    </form>
  );
}
```

### 3.3 Enhanced Checkout Integration

```typescript
// pages/CheckoutPage.tsx - Enhanced with Stripe
import { useState, useEffect } from 'react';
import { PaymentForm } from '../components/PaymentForm';
import { StripeProvider } from '../components/StripeProvider';

export function CheckoutPage() {
  const [clientSecret, setClientSecret] = useState<string>('');
  const [orderTotal, setOrderTotal] = useState(0);
  const { cart } = useCart();

  useEffect(() => {
    if (cart.items.length > 0) {
      createPaymentIntent();
    }
  }, [cart]);

  const createPaymentIntent = async () => {
    try {
      const total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const totalInCents = Math.round(total * 100);
      
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalInCents,
          currency: 'eur',
          order_id: generateOrderId(),
          customer_email: user?.email,
        }),
      });

      const { client_secret } = await response.json();
      setClientSecret(client_secret);
      setOrderTotal(total);
    } catch (error) {
      console.error('Payment Intent Error:', error);
    }
  };

  const handlePaymentSuccess = (paymentIntent: any) => {
    // Zur Erfolgsseite weiterleiten
    navigateTo('order-success', { paymentIntentId: paymentIntent.id });
    clearCart();
  };

  const handlePaymentError = (error: string) => {
    toast.error(`Zahlung fehlgeschlagen: ${error}`);
  };

  if (!clientSecret) {
    return <div>Zahlung wird vorbereitet...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-cormorant text-3xl mb-8">Zahlung</h1>
        
        {/* Bestellübersicht */}
        <div className="bg-white p-6 rounded-lg mb-8">
          <h2 className="font-cormorant text-xl mb-4">Ihre Bestellung</h2>
          {cart.items.map(item => (
            <div key={item.id} className="flex justify-between py-2">
              <span>{item.name} (x{item.quantity})</span>
              <span>{(item.price * item.quantity).toFixed(2)} €</span>
            </div>
          ))}
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between font-semibold">
              <span>Gesamt (inkl. 19% MwSt)</span>
              <span>{orderTotal.toFixed(2)} €</span>
            </div>
          </div>
        </div>

        {/* Stripe Payment Form */}
        <div className="bg-white p-6 rounded-lg">
          <StripeProvider>
            <PaymentForm
              clientSecret={clientSecret}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          </StripeProvider>
        </div>
      </div>
    </div>
  );
}
```

---

## 🧪 4. Testing & Validation

### 4.1 Stripe Test Cards
```typescript
// Für Testing verwenden
const TEST_CARDS = {
  SUCCESS: '4242424242424242',
  DECLINE: '4000000000000002',
  INSUFFICIENT_FUNDS: '4000000000009995',
  SEPA: 'DE89370400440532013000', // IBAN für SEPA-Tests
};
```

### 4.2 Webhook Testing
```bash
# Stripe CLI für lokale Webhook-Tests
stripe listen --forward-to localhost:3000/webhooks/stripe
stripe trigger payment_intent.succeeded
```

---

## 🔒 5. Security Best Practices

### 5.1 Sensitive Data Handling
- ✅ Nie Stripe Secret Keys im Frontend verwenden
- ✅ Alle Zahlungsdaten über HTTPS übertragen
- ✅ Webhook-Signaturen immer validieren
- ✅ Payment Intents mit Metadata für Tracking

### 5.2 PCI Compliance
- ✅ Stripe Elements für Kartendaten verwenden
- ✅ Keine Kartendaten auf eigenen Servern speichern
- ✅ HTTPS für alle Zahlungsseiten verwenden

---

## 📊 6. Monitoring & Analytics

### 6.1 Payment Metrics
```typescript
// KPIs für Payment Tracking
interface PaymentMetrics {
  total_revenue: number;
  successful_payments: number;
  failed_payments: number;
  average_order_value: number;
  payment_method_breakdown: {
    card: number;
    sepa: number;
    sofort: number;
  };
  chargeback_rate: number;
}
```

### 6.2 Error Tracking
```typescript
// Stripe Error Kategorien
const STRIPE_ERROR_TYPES = {
  CARD_DECLINED: 'card_declined',
  INSUFFICIENT_FUNDS: 'insufficient_funds',
  PROCESSING_ERROR: 'processing_error',
  AUTHENTICATION_REQUIRED: 'authentication_required',
};
```

Soll ich mit der Implementation der Stripe-Integration beginnen und diese in Ihre bestehende Checkout-Seite integrieren?