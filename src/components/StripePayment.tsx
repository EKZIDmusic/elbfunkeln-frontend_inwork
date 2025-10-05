import { useState, useEffect } from 'react';
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Loader2, CreditCard, CheckCircle, XCircle } from 'lucide-react';
import apiService from '../services/apiService';

// Load Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

interface StripePaymentProps {
  orderId: string;
  amount: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function StripePayment({ orderId, amount, onSuccess, onError }: StripePaymentProps) {
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Initialize Stripe
  useEffect(() => {
    stripePromise.then((stripeInstance) => {
      setStripe(stripeInstance);
    });
  }, []);

  // Create Payment Intent
  const handleCreatePaymentIntent = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.payments.createPaymentIntent({
        orderId,
        amount,
        method: 'stripe',
      });

      setClientSecret(response.clientSecret);
      setPaymentIntentId(response.paymentIntentId);
    } catch (error: any) {
      const errorMessage = error.message || 'Fehler beim Erstellen der Zahlung';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Process Payment (Simplified - In production, use Stripe Elements)
  const handlePayment = async () => {
    if (!stripe || !clientSecret) {
      setError('Stripe ist nicht initialisiert');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // In production, you would use Stripe Elements here
      // For now, this is a simplified version

      // Simulate payment confirmation
      // In real implementation, use stripe.confirmCardPayment() with payment element

      setSuccess(true);
      onSuccess?.();
    } catch (error: any) {
      const errorMessage = error.message || 'Fehler bei der Zahlungsverarbeitung';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertDescription>
          Stripe ist nicht konfiguriert. Bitte setze VITE_STRIPE_PUBLIC_KEY in deiner .env Datei.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Stripe Zahlung
        </CardTitle>
        <CardDescription>
          Sichere Zahlung mit Kreditkarte über Stripe
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Amount Display */}
        <div className="rounded-lg bg-muted p-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Zu zahlender Betrag:</span>
            <span className="text-2xl font-bold">{amount.toFixed(2)}€</span>
          </div>
        </div>

        {/* Create Payment Intent */}
        {!clientSecret && (
          <Button
            onClick={handleCreatePaymentIntent}
            disabled={isLoading || !stripe}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Zahlung wird vorbereitet...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Zahlung initialisieren
              </>
            )}
          </Button>
        )}

        {/* Payment Form Area */}
        {clientSecret && !success && (
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                <strong>Demo-Modus:</strong> In der Produktion würde hier das Stripe Payment Element erscheinen.
                <br />
                <small className="text-muted-foreground">
                  Payment Intent ID: {paymentIntentId}
                </small>
              </AlertDescription>
            </Alert>

            {/* Placeholder for Stripe Elements */}
            <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
              <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Hier würde das Stripe Payment Element für Karteneingabe erscheinen.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Implementiere dies mit @stripe/react-stripe-js für die volle Funktionalität.
              </p>
            </div>

            <Button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Zahlung wird verarbeitet...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Jetzt bezahlen
                </>
              )}
            </Button>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <Alert>
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              Zahlung erfolgreich! Deine Bestellung wird verarbeitet.
            </AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Info */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>💡 <strong>Hinweis für die Produktion:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Installiere @stripe/react-stripe-js für Stripe Elements</li>
            <li>Verwende Elements Provider und Payment Element</li>
            <li>Implementiere stripe.confirmCardPayment() für echte Zahlungen</li>
            <li>Webhooks im Backend verarbeiten Zahlungsbestätigungen</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
