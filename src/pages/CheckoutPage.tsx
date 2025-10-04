import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CreditCard, Truck, MapPin, User, Mail, Phone,
  ShoppingBag, ArrowLeft, Check, Lock, AlertCircle,
  Package, Calendar, Clock, Euro, Gift, Tag,
  Edit, Trash2, Plus, Minus, Shield
} from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Progress } from '../components/ui/progress';
import { useRouter } from '../components/Router';
import { useCart } from '../components/CartContext';
import { useAuth } from '../components/AuthContext';
import { validateDiscountCode, useDiscountCode } from '../services/discountService';

interface ShippingAddress {
  firstName: string;
  lastName: string;
  company?: string;
  street: string;
  houseNumber: string;
  zipCode: string;
  city: string;
  country: string;
  phone?: string;
}

interface BillingAddress extends ShippingAddress {
  sameAsShipping: boolean;
}

interface PaymentMethod {
  type: 'credit_card' | 'paypal' | 'bank_transfer' | 'klarna' | 'apple_pay';
  label: string;
  icon: React.ReactNode;
  description: string;
  processingTime: string;
}

const paymentMethods: PaymentMethod[] = [
  {
    type: 'credit_card',
    label: 'Kreditkarte',
    icon: <CreditCard className="h-5 w-5" />,
    description: 'Visa, MasterCard, American Express',
    processingTime: 'Sofort'
  },
  {
    type: 'paypal',
    label: 'PayPal',
    icon: <Shield className="h-5 w-5" />,
    description: 'Schnell und sicher mit PayPal',
    processingTime: 'Sofort'
  },
  {
    type: 'klarna',
    label: 'Klarna',
    icon: <Clock className="h-5 w-5" />,
    description: 'Kauf auf Rechnung - 14 Tage Zahlungsziel',
    processingTime: '1-2 Werktage'
  },
  {
    type: 'bank_transfer',
    label: 'Banküberweisung',
    icon: <Package className="h-5 w-5" />,
    description: 'Überweisung auf unser Konto',
    processingTime: '2-3 Werktage'
  }
];

const shippingOptions = [
  {
    id: 'standard',
    name: 'Standard Versand',
    price: 4.99,
    duration: '3-5 Werktage',
    icon: <Truck className="h-4 w-4" />,
    description: 'Kostenloser Versand ab 50€'
  },
  {
    id: 'express',
    name: 'Express Versand',
    price: 9.99,
    duration: '1-2 Werktage',
    icon: <Package className="h-4 w-4" />,
    description: 'Schnelle Lieferung'
  },
  {
    id: 'premium',
    name: 'Premium Versand',
    price: 14.99,
    duration: 'Nächster Werktag',
    icon: <Clock className="h-4 w-4" />,
    description: 'Über Nacht Lieferung'
  }
];

export function CheckoutPage() {
  const { navigateTo } = useRouter();
  const { items: cart, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const total = getTotalPrice();
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  // Shipping Address
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    firstName: '',
    lastName: '',
    company: '',
    street: '',
    houseNumber: '',
    zipCode: '',
    city: '',
    country: 'Deutschland',
    phone: ''
  });

  // Billing Address
  const [billingAddress, setBillingAddress] = useState<BillingAddress>({
    firstName: '',
    lastName: '',
    company: '',
    street: '',
    houseNumber: '',
    zipCode: '',
    city: '',
    country: 'Deutschland',
    phone: '',
    sameAsShipping: true
  });

  // Payment & Shipping
  const [selectedPayment, setSelectedPayment] = useState<string>('credit_card');
  const [selectedShipping, setSelectedShipping] = useState<string>('standard');
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  // Credit Card Details
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    name: ''
  });

  // Discount Code
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; amount: number; type: 'fixed' | 'percentage' } | null>(null);

  // Gift Options
  const [isGift, setIsGift] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');

  // Auto-populate user data if logged in
  useEffect(() => {
    if (user) {
      setShippingAddress(prev => ({
        ...prev,
        firstName: user.firstName || user.name?.split(' ')[0] || '',
        lastName: user.lastName || user.name?.split(' ')[1] || '',
        company: '',
        street: user.address?.street || '',
        houseNumber: user.address?.houseNumber || '',
        zipCode: user.address?.zipCode || '',
        city: user.address?.city || '',
        country: user.address?.country || 'Deutschland',
        phone: user.phone || ''
      }));
      setBillingAddress(prev => ({
        ...prev,
        firstName: user.firstName || user.name?.split(' ')[0] || '',
        lastName: user.lastName || user.name?.split(' ')[1] || '',
        company: '',
        street: user.address?.street || '',
        houseNumber: user.address?.houseNumber || '',
        zipCode: user.address?.zipCode || '',
        city: user.address?.city || '',
        country: user.address?.country || 'Deutschland',
        phone: user.phone || '',
        sameAsShipping: true
      }));
    }
  }, [user]);

  const selectedShippingOption = shippingOptions.find(option => option.id === selectedShipping);
  const shippingCost = selectedShippingOption?.price || 0;
  const finalTotal = total + shippingCost - (appliedDiscount?.amount || 0);

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return cart && cart.length > 0;
      case 2:
        const requiredShippingFields = ['firstName', 'lastName', 'street', 'houseNumber', 'zipCode', 'city'];
        const shippingValid = requiredShippingFields.every(field => 
          shippingAddress[field as keyof ShippingAddress]?.toString().trim() !== ''
        );
        
        if (!billingAddress.sameAsShipping) {
          const requiredBillingFields = ['firstName', 'lastName', 'street', 'houseNumber', 'zipCode', 'city'];
          const billingValid = requiredBillingFields.every(field => 
            billingAddress[field as keyof BillingAddress]?.toString().trim() !== ''
          );
          return shippingValid && billingValid;
        }
        return shippingValid;
      case 3:
        return selectedShipping !== '';
      case 4:
        if (selectedPayment === 'credit_card') {
          return !!(cardDetails.number && cardDetails.expiryMonth && 
                   cardDetails.expiryYear && cardDetails.cvv && cardDetails.name);
        }
        return true;
      case 5:
        return agreeToTerms;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const applyDiscount = async () => {
    try {
      // Get cart categories for validation (fallback to empty array if no category)
      const cartCategories = (cart || []).map(item => {
        // CartItem interface doesn't have category, so we need to handle this
        return 'category' in item ? item.category : '';
      }).filter(Boolean);
      
      // Validate discount code using the service
      const validation = await validateDiscountCode(discountCode, total, cartCategories);
      
      if (validation.valid && validation.discountAmount) {
        setAppliedDiscount({ 
          code: discountCode, 
          amount: validation.discountAmount, 
          type: validation.discount!.type 
        });
        setDiscountCode('');
      } else {
        alert(validation.error || 'Ungültiger Gutscheincode');
      }
    } catch (error) {
      console.error('Error applying discount:', error);
      alert('Fehler beim Anwenden des Gutscheincodes');
    }
  };

  const removeDiscount = () => {
    setAppliedDiscount(null);
  };

  const processPayment = async () => {
    setIsProcessing(true);
    
    try {
      // Use discount code if applied
      if (appliedDiscount) {
        await useDiscountCode(appliedDiscount.code);
      }
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate order ID
      const orderId = 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      
      // Clear cart
      clearCart();

      // Navigate to success page
      navigateTo('order-success', { orderId });
      
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Zahlung fehlgeschlagen. Bitte versuchen Sie es erneut.');
    } finally {
      setIsProcessing(false);
    }
  };

  const steps = [
    { number: 1, title: 'Warenkorb', description: 'Artikel überprüfen' },
    { number: 2, title: 'Adresse', description: 'Versand- & Rechnungsadresse' },
    { number: 3, title: 'Versand', description: 'Versandart wählen' },
    { number: 4, title: 'Zahlung', description: 'Zahlungsart wählen' },
    { number: 5, title: 'Bestätigung', description: 'Bestellung abschließen' }
  ];

  if ((!cart || cart.length === 0) && currentStep === 1) {
    return (
      <div className="min-h-screen pt-24">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <ShoppingBag className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-cormorant text-elbfunkeln-green mb-2">Ihr Warenkorb ist leer</h2>
            <p className="text-gray-600 mb-6">Entdecken Sie unsere wunderschönen Schmuckstücke</p>
            <Button onClick={() => navigateTo('shop')} className="bg-gradient-to-r from-elbfunkeln-green to-elbfunkeln-rose text-white hover:from-elbfunkeln-rose hover:to-elbfunkeln-green py-3 px-6 rounded-full shadow-lg">
              Zum Shop
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigateTo('cart')}
            className="text-elbfunkeln-green hover:bg-elbfunkeln-green/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück zum Warenkorb
          </Button>
          <div>
            <h1 className="text-3xl font-cormorant text-elbfunkeln-green">Kasse</h1>
            <p className="text-gray-600">Schließen Sie Ihre Bestellung ab</p>
          </div>
        </div>

        {/* Progress Bar */}
        <Card className="p-6 mb-8 border-elbfunkeln-lavender/20">
          <div className="flex items-start justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex flex-col items-center flex-1">
                <div className="flex items-center w-full">
                  <motion.div 
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                      currentStep >= step.number 
                        ? 'bg-elbfunkeln-green border-elbfunkeln-green text-white' 
                        : 'border-gray-300 text-gray-500'
                    } mx-auto`}
                    animate={{
                      scale: currentStep === step.number ? [1, 1.1, 1] : 1,
                      backgroundColor: currentStep >= step.number ? 'var(--elbfunkeln-green)' : 'transparent'
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {currentStep > step.number ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1 }}
                      >
                        <Check className="h-5 w-5" />
                      </motion.div>
                    ) : (
                      <span>{step.number}</span>
                    )}
                  </motion.div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 ml-4 transition-colors ${
                      currentStep > step.number ? 'bg-elbfunkeln-green' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
                <div className="text-center mt-3">
                  <h3 className={`font-cormorant text-sm font-medium ${
                    currentStep >= step.number ? 'text-elbfunkeln-green' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </h3>
                  <p className={`text-xs mt-1 ${
                    currentStep >= step.number ? 'text-elbfunkeln-green/70' : 'text-gray-400'
                  }`}>
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
            {/* Step 1: Cart Review */}
            {currentStep === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="space-y-6"
              >
                <Card className="p-6 border-elbfunkeln-lavender/20">
                  <h3 className="font-cormorant text-xl text-elbfunkeln-green mb-4">Ihre Bestellung</h3>
                  <div className="space-y-4">
                    {(cart || []).map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-gray-600">{item.price.toFixed(2)}€</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">×{item.quantity}</p>
                          <p className="text-sm text-gray-600">{(item.price * item.quantity).toFixed(2)}€</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Step 2: Address */}
            {currentStep === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="space-y-6"
              >
                <Card className="p-6 border-elbfunkeln-lavender/20">
                  <h3 className="font-cormorant text-xl text-elbfunkeln-green mb-4 flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Versandadresse
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-elbfunkeln-green mb-2">Vorname *</label>
                      <Input
                        value={shippingAddress.firstName}
                        onChange={(e) => setShippingAddress({...shippingAddress, firstName: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-elbfunkeln-green mb-2">Nachname *</label>
                      <Input
                        value={shippingAddress.lastName}
                        onChange={(e) => setShippingAddress({...shippingAddress, lastName: e.target.value})}
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-elbfunkeln-green mb-2">Firma (optional)</label>
                      <Input
                        value={shippingAddress.company}
                        onChange={(e) => setShippingAddress({...shippingAddress, company: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-elbfunkeln-green mb-2">Straße *</label>
                      <Input
                        value={shippingAddress.street}
                        onChange={(e) => setShippingAddress({...shippingAddress, street: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-elbfunkeln-green mb-2">Hausnummer *</label>
                      <Input
                        value={shippingAddress.houseNumber}
                        onChange={(e) => setShippingAddress({...shippingAddress, houseNumber: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-elbfunkeln-green mb-2">PLZ *</label>
                      <Input
                        value={shippingAddress.zipCode}
                        onChange={(e) => setShippingAddress({...shippingAddress, zipCode: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-elbfunkeln-green mb-2">Stadt *</label>
                      <Input
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-elbfunkeln-green mb-2">Land *</label>
                      <Select value={shippingAddress.country} onValueChange={(value) => setShippingAddress({...shippingAddress, country: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Deutschland">Deutschland</SelectItem>
                          <SelectItem value="Österreich">Österreich</SelectItem>
                          <SelectItem value="Schweiz">Schweiz</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-elbfunkeln-green mb-2">Telefon (optional)</label>
                      <Input
                        value={shippingAddress.phone}
                        onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})}
                        placeholder="+49 123 456789"
                      />
                    </div>
                  </div>
                </Card>

                <Card className="p-6 border-elbfunkeln-rose/20">
                  <h3 className="font-cormorant text-xl text-elbfunkeln-green mb-4 flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Rechnungsadresse
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        checked={billingAddress.sameAsShipping}
                        onCheckedChange={(checked) => setBillingAddress({...billingAddress, sameAsShipping: !!checked})}
                      />
                      <label className="text-sm">Rechnungsadresse entspricht der Versandadresse</label>
                    </div>
                    
                    {!billingAddress.sameAsShipping && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-elbfunkeln-green mb-2">Vorname *</label>
                          <Input
                            value={billingAddress.firstName}
                            onChange={(e) => setBillingAddress({...billingAddress, firstName: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-elbfunkeln-green mb-2">Nachname *</label>
                          <Input
                            value={billingAddress.lastName}
                            onChange={(e) => setBillingAddress({...billingAddress, lastName: e.target.value})}
                            required
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-elbfunkeln-green mb-2">Firma (optional)</label>
                          <Input
                            value={billingAddress.company}
                            onChange={(e) => setBillingAddress({...billingAddress, company: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-elbfunkeln-green mb-2">Straße *</label>
                          <Input
                            value={billingAddress.street}
                            onChange={(e) => setBillingAddress({...billingAddress, street: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-elbfunkeln-green mb-2">Hausnummer *</label>
                          <Input
                            value={billingAddress.houseNumber}
                            onChange={(e) => setBillingAddress({...billingAddress, houseNumber: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-elbfunkeln-green mb-2">PLZ *</label>
                          <Input
                            value={billingAddress.zipCode}
                            onChange={(e) => setBillingAddress({...billingAddress, zipCode: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-elbfunkeln-green mb-2">Stadt *</label>
                          <Input
                            value={billingAddress.city}
                            onChange={(e) => setBillingAddress({...billingAddress, city: e.target.value})}
                            required
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-elbfunkeln-green mb-2">Land *</label>
                          <Select value={billingAddress.country} onValueChange={(value) => setBillingAddress({...billingAddress, country: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Deutschland">Deutschland</SelectItem>
                              <SelectItem value="Österreich">Österreich</SelectItem>
                              <SelectItem value="Schweiz">Schweiz</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Gift Options */}
                <Card className="p-6 border-elbfunkeln-rose/20">
                  <h3 className="font-cormorant text-xl text-elbfunkeln-green mb-4 flex items-center gap-2">
                    <Gift className="h-5 w-5" />
                    Geschenk-Optionen
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        checked={isGift}
                        onCheckedChange={setIsGift}
                      />
                      <label className="text-sm">Dies ist ein Geschenk</label>
                    </div>
                    
                    {isGift && (
                      <div>
                        <label className="block text-sm font-medium mb-2">Geschenknachricht</label>
                        <Textarea
                          value={giftMessage}
                          onChange={(e) => setGiftMessage(e.target.value)}
                          placeholder="Fügen Sie eine persönliche Nachricht hinzu..."
                          rows={3}
                        />
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Step 3: Shipping */}
            {currentStep === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="space-y-6"
              >
                <Card className="p-6 border-elbfunkeln-lavender/20">
                  <h3 className="font-cormorant text-xl text-elbfunkeln-green mb-4 flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Versandart wählen
                  </h3>
                  <div className="space-y-3">
                    {shippingOptions.map((option) => (
                      <div 
                        key={option.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          selectedShipping === option.id 
                            ? 'border-elbfunkeln-green bg-elbfunkeln-green/5' 
                            : 'border-gray-200 hover:border-elbfunkeln-green/50'
                        }`}
                        onClick={() => setSelectedShipping(option.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded ${selectedShipping === option.id ? 'bg-elbfunkeln-green text-white' : 'bg-gray-100'}`}>
                              {option.icon}
                            </div>
                            <div>
                              <h4 className="font-medium">{option.name}</h4>
                              <p className="text-sm text-gray-600">{option.description}</p>
                              <p className="text-xs text-gray-500">{option.duration}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{option.price === 0 ? 'Kostenlos' : `${option.price.toFixed(2)}€`}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Step 4: Payment */}
            {currentStep === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="space-y-6"
              >
                <Card className="p-6 border-elbfunkeln-lavender/20">
                  <h3 className="font-cormorant text-xl text-elbfunkeln-green mb-4 flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Zahlungsart wählen
                  </h3>
                  <div className="space-y-3 mb-6">
                    {paymentMethods.map((method) => (
                      <div 
                        key={method.type}
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          selectedPayment === method.type 
                            ? 'border-elbfunkeln-green bg-elbfunkeln-green/5' 
                            : 'border-gray-200 hover:border-elbfunkeln-green/50'
                        }`}
                        onClick={() => setSelectedPayment(method.type)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded ${selectedPayment === method.type ? 'bg-elbfunkeln-green text-white' : 'bg-gray-100'}`}>
                              {method.icon}
                            </div>
                            <div>
                              <h4 className="font-medium">{method.label}</h4>
                              <p className="text-sm text-gray-600">{method.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={selectedPayment === method.type ? 'default' : 'secondary'}>
                              {method.processingTime}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {selectedPayment === 'credit_card' && (
                    <Card className="p-4 bg-gray-50 border-gray-200">
                      <h4 className="font-medium mb-4">Kreditkarten-Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium mb-2">Kartennummer *</label>
                          <Input
                            value={cardDetails.number}
                            onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})}
                            placeholder="1234 5678 9012 3456"
                            required
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium mb-2">Karteninhaber *</label>
                          <Input
                            value={cardDetails.name}
                            onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
                            placeholder="Max Mustermann"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Monat *</label>
                          <Select value={cardDetails.expiryMonth} onValueChange={(value) => setCardDetails({...cardDetails, expiryMonth: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="MM" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({length: 12}, (_, i) => (
                                <SelectItem key={i + 1} value={String(i + 1).padStart(2, '0')}>
                                  {String(i + 1).padStart(2, '0')}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Jahr *</label>
                          <Select value={cardDetails.expiryYear} onValueChange={(value) => setCardDetails({...cardDetails, expiryYear: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="YYYY" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({length: 10}, (_, i) => {
                                const year = new Date().getFullYear() + i;
                                return (
                                  <SelectItem key={year} value={year.toString()}>
                                    {year}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">CVV *</label>
                          <Input
                            value={cardDetails.cvv}
                            onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
                            placeholder="123"
                            maxLength={4}
                            required
                          />
                        </div>
                      </div>
                    </Card>
                  )}
                </Card>
              </motion.div>
            )}

            {/* Step 5: Confirmation */}
            {currentStep === 5 && (
              <motion.div
                key="step-5"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="space-y-6"
              >
                <Card className="p-6 border-elbfunkeln-lavender/20">
                  <h3 className="font-cormorant text-xl text-elbfunkeln-green mb-4 flex items-center gap-2">
                    <Check className="h-5 w-5" />
                    Bestellung bestätigen
                  </h3>
                  
                  <div className="space-y-6">
                    {/* Order Summary */}
                    <div>
                      <h4 className="font-medium mb-3">Bestellübersicht</h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        {(cart || []).map((item) => (
                          <div key={item.id} className="flex justify-between items-center py-2">
                            <span>{item.name} × {item.quantity}</span>
                            <span>{(item.price * item.quantity).toFixed(2)}€</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Addresses */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Versandadresse</h4>
                        <div className="bg-gray-50 p-4 rounded-lg text-sm">
                          <p>{shippingAddress.firstName} {shippingAddress.lastName}</p>
                          <p>{shippingAddress.street} {shippingAddress.houseNumber}</p>
                          <p>{shippingAddress.zipCode} {shippingAddress.city}</p>
                          <p>{shippingAddress.country}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Rechnungsadresse</h4>
                        <div className="bg-gray-50 p-4 rounded-lg text-sm">
                          {billingAddress.sameAsShipping ? (
                            <p className="text-gray-600">Wie Versandadresse</p>
                          ) : (
                            <>
                              <p>{billingAddress.firstName} {billingAddress.lastName}</p>
                              <p>{billingAddress.street} {billingAddress.houseNumber}</p>
                              <p>{billingAddress.zipCode} {billingAddress.city}</p>
                              <p>{billingAddress.country}</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Shipping & Payment */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Versandart</h4>
                        <div className="bg-gray-50 p-4 rounded-lg text-sm">
                          <p>{selectedShippingOption?.name}</p>
                          <p className="text-gray-600">{selectedShippingOption?.duration}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Zahlungsart</h4>
                        <div className="bg-gray-50 p-4 rounded-lg text-sm">
                          <p>{paymentMethods.find(m => m.type === selectedPayment)?.label}</p>
                        </div>
                      </div>
                    </div>

                    {/* Terms */}
                    <div className="space-y-4">
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          checked={agreeToTerms}
                          onCheckedChange={setAgreeToTerms}
                        />
                        <label className="text-sm">
                          Ich habe die <a href="/terms" className="text-elbfunkeln-green hover:underline">AGB</a> und 
                          <a href="/privacy" className="text-elbfunkeln-green hover:underline ml-1">Datenschutzerklärung</a> gelesen und akzeptiere sie.
                        </label>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-8 mt-8 border-t border-elbfunkeln-green/20">
              <Button 
                variant="outline" 
                onClick={prevStep}
                disabled={currentStep === 1}
                size="lg"
                className="min-w-[140px] h-12 border-2 border-elbfunkeln-green text-elbfunkeln-green hover:bg-elbfunkeln-green/10 font-medium px-8 py-3 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="h-4 w-4 mr-3" />
                Zurück
              </Button>
              {currentStep < 5 ? (
                <Button 
                  onClick={nextStep}
                  disabled={!validateStep(currentStep)}
                  size="lg"
                  className="min-w-[140px] h-12 bg-elbfunkeln-green hover:bg-elbfunkeln-green/90 font-medium px-8 py-3 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Weiter
                  <ArrowLeft className="h-4 w-4 ml-3 rotate-180" />
                </Button>
              ) : (
                <Button 
                  onClick={processPayment}
                  disabled={!validateStep(currentStep) || isProcessing}
                  size="lg"
                  className="min-w-[140px] h-12 bg-elbfunkeln-green hover:bg-elbfunkeln-green/90 font-medium px-8 py-3 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-3"></div>
                      Verarbeitung...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-3" />
                      Jetzt kaufen
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <Card className="p-6 border-elbfunkeln-lavender/20">
                <h3 className="font-cormorant text-xl text-elbfunkeln-green mb-4">Bestellübersicht</h3>
                
                <div className="space-y-3 mb-4">
                  {(cart || []).map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.name} × {item.quantity}</span>
                      <span>{(item.price * item.quantity).toFixed(2)}€</span>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Zwischensumme</span>
                    <span>{total.toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Versand</span>
                    <span>{shippingCost === 0 ? 'Kostenlos' : `${shippingCost.toFixed(2)}€`}</span>
                  </div>
                  {appliedDiscount && (
                    <div className="flex justify-between text-elbfunkeln-green">
                      <span>Rabatt ({appliedDiscount.code})</span>
                      <span>-{appliedDiscount.amount.toFixed(2)}€</span>
                    </div>
                  )}
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between font-medium text-lg">
                  <span>Gesamt</span>
                  <span>{finalTotal.toFixed(2)}€</span>
                </div>

                {/* Discount Code */}
                <div className="mt-6 space-y-3">
                  <h4 className="font-medium">Gutscheincode</h4>
                  {appliedDiscount ? (
                    <div className="flex items-center justify-between p-3 bg-elbfunkeln-green/10 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-elbfunkeln-green" />
                        <span className="text-sm font-medium">{appliedDiscount.code}</span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={removeDiscount}>
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value)}
                        placeholder="Code eingeben"
                        className="text-sm"
                      />
                      <Button onClick={applyDiscount} variant="outline" size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Security Info */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Shield className="h-4 w-4" />
                    <span>SSL-verschlüsselte Übertragung</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}