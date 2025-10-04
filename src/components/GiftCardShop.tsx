import { useState } from 'react';
import { motion } from 'motion/react';
import { Gift, Mail, Send, Star, Check, CreditCard } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Checkbox } from './ui/checkbox';
import { useGiftCards } from './GiftCardContext';
import { useAuth } from './AuthContext';
import { useRouter } from './Router';
import { toast } from 'sonner@2.0.3';

interface GiftCardPurchaseData {
  value: number;
  recipientEmail?: string;
  recipientName?: string;
  personalMessage?: string;
  deliveryMethod: 'digital' | 'postal';
  deliveryAddress?: {
    name: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

export function GiftCardShop() {
  const { user } = useAuth();
  const { navigateTo } = useRouter();
  const { getGiftCardTemplates, purchaseGiftCard, isLoading } = useGiftCards();

  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [customValue, setCustomValue] = useState<string>('');
  const [purchaseData, setPurchaseData] = useState<GiftCardPurchaseData>({
    value: 0,
    deliveryMethod: 'digital'
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [isForSelf, setIsForSelf] = useState(true);

  const templates = getGiftCardTemplates();

  const handleTemplateSelect = (templateId: string, value: number) => {
    setSelectedTemplate(templateId);
    setCustomValue('');
    setPurchaseData(prev => ({ ...prev, value }));
  };

  const handleCustomValue = (value: string) => {
    const numValue = parseFloat(value);
    if (numValue >= 10 && numValue <= 100) {
      setSelectedTemplate('custom');
      setCustomValue(value);
      setPurchaseData(prev => ({ ...prev, value: numValue }));
    }
  };

  const handlePurchase = async () => {
    if (!user) {
      toast.error('Sie müssen angemeldet sein, um eine Gutscheinkarte zu kaufen');
      navigateTo('login');
      return;
    }

    if (purchaseData.value < 10 || purchaseData.value > 100) {
      toast.error('Der Gutscheinwert muss zwischen 10€ und 100€ liegen');
      return;
    }

    try {
      await purchaseGiftCard({
        value: purchaseData.value,
        remainingValue: purchaseData.value,
        expiresAt: new Date(Date.now() + (365 * 24 * 60 * 60 * 1000)).toISOString(),
        recipientEmail: isForSelf ? user.email : purchaseData.recipientEmail,
        recipientName: isForSelf ? user.name : purchaseData.recipientName,
        personalMessage: purchaseData.personalMessage,
        deliveryMethod: purchaseData.deliveryMethod,
        deliveryAddress: purchaseData.deliveryAddress
      });

      // Navigate to success page or account page
      toast.success('Gutscheinkarte erfolgreich erstellt!');
      navigateTo('account');
      
    } catch (error) {
      console.error('Error purchasing gift card:', error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="font-cormorant text-2xl text-elbfunkeln-green mb-2">
          Wählen Sie Ihren Gutschein
        </h2>
        <p className="text-elbfunkeln-green/70">
          Verschenken Sie die Freude an handgefertigtem Schmuck
        </p>
      </div>

      {/* Predefined Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <motion.div
            key={template.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card 
              className={`cursor-pointer transition-all duration-200 ${
                selectedTemplate === template.id
                  ? 'ring-2 ring-elbfunkeln-green border-elbfunkeln-green'
                  : 'border-elbfunkeln-rose/20 hover:border-elbfunkeln-green/50'
              }`}
              onClick={() => handleTemplateSelect(template.id, template.value)}
            >
              <div className="p-4">
                <div className="aspect-video bg-gradient-to-br from-elbfunkeln-beige to-elbfunkeln-lavender/30 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                  <img 
                    src={template.image}
                    alt={template.name}
                    className="w-full h-full object-cover"
                  />
                  {template.isPopular && (
                    <Badge className="absolute top-2 right-2 bg-elbfunkeln-green text-white">
                      <Star className="w-3 h-3 mr-1" />
                      Beliebt
                    </Badge>
                  )}
                </div>
                
                <div className="text-center">
                  <h3 className="font-cormorant text-lg text-elbfunkeln-green mb-1">
                    {template.name}
                  </h3>
                  <p className="text-sm text-elbfunkeln-green/70 mb-2">
                    {template.description}
                  </p>
                  <div className="font-cormorant text-xl text-elbfunkeln-green">
                    {formatPrice(template.value)}
                  </div>
                </div>
                
                {selectedTemplate === template.id && (
                  <div className="mt-3 flex justify-center">
                    <div className="w-6 h-6 bg-elbfunkeln-green rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Custom Amount */}
      <Card className={`p-4 ${selectedTemplate === 'custom' ? 'ring-2 ring-elbfunkeln-green border-elbfunkeln-green' : 'border-elbfunkeln-rose/20'}`}>
        <div className="text-center mb-4">
          <h3 className="font-cormorant text-lg text-elbfunkeln-green mb-2">
            Individueller Betrag
          </h3>
          <p className="text-sm text-elbfunkeln-green/70">
            Wählen Sie einen Betrag zwischen 10€ und 100€
          </p>
        </div>
        
        <div className="max-w-xs mx-auto">
          <div className="relative">
            <Input
              type="number"
              placeholder="Betrag eingeben"
              value={customValue}
              onChange={(e) => handleCustomValue(e.target.value)}
              min="10"
              max="100"
              step="1"
              className="text-center text-lg border-elbfunkeln-rose/30 focus:border-elbfunkeln-green"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-elbfunkeln-green/70">
              €
            </span>
          </div>
        </div>
      </Card>

      <div className="flex justify-center">
        <Button
          onClick={() => setCurrentStep(2)}
          disabled={!selectedTemplate || purchaseData.value < 10}
          className="bg-elbfunkeln-green text-white hover:bg-elbfunkeln-green/90 px-8"
        >
          Weiter
          <Send className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="font-cormorant text-2xl text-elbfunkeln-green mb-2">
          Empfänger & Nachricht
        </h2>
        <p className="text-elbfunkeln-green/70">
          Gutschein über {formatPrice(purchaseData.value)}
        </p>
      </div>

      {/* For Self or Others */}
      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={isForSelf}
              onChange={setIsForSelf}
              id="for-self"
            />
            <label htmlFor="for-self" className="text-elbfunkeln-green">
              Für mich selbst
            </label>
          </div>

          {!isForSelf && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-elbfunkeln-green mb-2">
                    Name des Empfängers
                  </label>
                  <Input
                    placeholder="Max Mustermann"
                    value={purchaseData.recipientName || ''}
                    onChange={(e) => setPurchaseData(prev => ({ 
                      ...prev, 
                      recipientName: e.target.value 
                    }))}
                    className="border-elbfunkeln-rose/30 focus:border-elbfunkeln-green"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-elbfunkeln-green mb-2">
                    E-Mail des Empfängers
                  </label>
                  <Input
                    type="email"
                    placeholder="empfaenger@email.de"
                    value={purchaseData.recipientEmail || ''}
                    onChange={(e) => setPurchaseData(prev => ({ 
                      ...prev, 
                      recipientEmail: e.target.value 
                    }))}
                    className="border-elbfunkeln-rose/30 focus:border-elbfunkeln-green"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </Card>

      {/* Personal Message */}
      <Card className="p-4">
        <label className="block text-sm font-medium text-elbfunkeln-green mb-2">
          Persönliche Nachricht (optional)
        </label>
        <Textarea
          placeholder="Hier können Sie eine persönliche Nachricht hinterlassen..."
          value={purchaseData.personalMessage || ''}
          onChange={(e) => setPurchaseData(prev => ({ 
            ...prev, 
            personalMessage: e.target.value 
          }))}
          className="border-elbfunkeln-rose/30 focus:border-elbfunkeln-green"
          rows={4}
        />
      </Card>

      {/* Delivery Method */}
      <Card className="p-4">
        <label className="block text-sm font-medium text-elbfunkeln-green mb-4">
          Versandart
        </label>
        <RadioGroup
          value={purchaseData.deliveryMethod}
          onValueChange={(value: 'digital' | 'postal') => 
            setPurchaseData(prev => ({ ...prev, deliveryMethod: value }))
          }
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="digital" id="digital" />
            <label htmlFor="digital" className="flex items-center gap-2 cursor-pointer">
              <Mail className="w-4 h-4 text-elbfunkeln-green" />
              <span>Digital per E-Mail (kostenlos)</span>
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="postal" id="postal" />
            <label htmlFor="postal" className="flex items-center gap-2 cursor-pointer">
              <Gift className="w-4 h-4 text-elbfunkeln-green" />
              <span>Per Post (+ 2,95€ Versandkosten)</span>
            </label>
          </div>
        </RadioGroup>

        {purchaseData.deliveryMethod === 'postal' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 space-y-4"
          >
            <div className="text-sm text-elbfunkeln-green/70 mb-3">
              Lieferadresse
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Vollständiger Name"
                value={purchaseData.deliveryAddress?.name || ''}
                onChange={(e) => setPurchaseData(prev => ({
                  ...prev,
                  deliveryAddress: {
                    ...prev.deliveryAddress,
                    name: e.target.value,
                    street: prev.deliveryAddress?.street || '',
                    city: prev.deliveryAddress?.city || '',
                    postalCode: prev.deliveryAddress?.postalCode || '',
                    country: prev.deliveryAddress?.country || 'Deutschland'
                  }
                }))}
                className="border-elbfunkeln-rose/30 focus:border-elbfunkeln-green"
              />
              
              <Input
                placeholder="Straße und Hausnummer"
                value={purchaseData.deliveryAddress?.street || ''}
                onChange={(e) => setPurchaseData(prev => ({
                  ...prev,
                  deliveryAddress: {
                    ...prev.deliveryAddress,
                    name: prev.deliveryAddress?.name || '',
                    street: e.target.value,
                    city: prev.deliveryAddress?.city || '',
                    postalCode: prev.deliveryAddress?.postalCode || '',
                    country: prev.deliveryAddress?.country || 'Deutschland'
                  }
                }))}
                className="border-elbfunkeln-rose/30 focus:border-elbfunkeln-green"
              />
              
              <Input
                placeholder="PLZ"
                value={purchaseData.deliveryAddress?.postalCode || ''}
                onChange={(e) => setPurchaseData(prev => ({
                  ...prev,
                  deliveryAddress: {
                    ...prev.deliveryAddress,
                    name: prev.deliveryAddress?.name || '',
                    street: prev.deliveryAddress?.street || '',
                    city: prev.deliveryAddress?.city || '',
                    postalCode: e.target.value,
                    country: prev.deliveryAddress?.country || 'Deutschland'
                  }
                }))}
                className="border-elbfunkeln-rose/30 focus:border-elbfunkeln-green"
              />
              
              <Input
                placeholder="Stadt"
                value={purchaseData.deliveryAddress?.city || ''}
                onChange={(e) => setPurchaseData(prev => ({
                  ...prev,
                  deliveryAddress: {
                    ...prev.deliveryAddress,
                    name: prev.deliveryAddress?.name || '',
                    street: prev.deliveryAddress?.street || '',
                    city: e.target.value,
                    postalCode: prev.deliveryAddress?.postalCode || '',
                    country: prev.deliveryAddress?.country || 'Deutschland'
                  }
                }))}
                className="border-elbfunkeln-rose/30 focus:border-elbfunkeln-green"
              />
            </div>
          </motion.div>
        )}
      </Card>

      <div className="flex gap-4 justify-center">
        <Button
          onClick={() => setCurrentStep(1)}
          variant="outline"
          className="border-elbfunkeln-rose/30"
        >
          Zurück
        </Button>
        
        <Button
          onClick={() => setCurrentStep(3)}
          className="bg-elbfunkeln-green text-white hover:bg-elbfunkeln-green/90"
        >
          Zur Bezahlung
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => {
    const shippingCost = purchaseData.deliveryMethod === 'postal' ? 2.95 : 0;
    const totalCost = purchaseData.value + shippingCost;

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="font-cormorant text-2xl text-elbfunkeln-green mb-2">
            Bestellung bestätigen
          </h2>
          <p className="text-elbfunkeln-green/70">
            Überprüfen Sie Ihre Bestellung
          </p>
        </div>

        {/* Order Summary */}
        <Card className="p-6">
          <h3 className="font-cormorant text-lg text-elbfunkeln-green mb-4">
            Bestellübersicht
          </h3>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Gutscheinwert:</span>
              <span className="font-medium">{formatPrice(purchaseData.value)}</span>
            </div>
            
            <div className="flex justify-between">
              <span>Versand ({purchaseData.deliveryMethod === 'digital' ? 'Digital' : 'Post'}):</span>
              <span className="font-medium">{shippingCost > 0 ? formatPrice(shippingCost) : 'Kostenlos'}</span>
            </div>
            
            <div className="border-t border-elbfunkeln-rose/20 pt-3">
              <div className="flex justify-between font-medium text-lg">
                <span>Gesamtbetrag:</span>
                <span>{formatPrice(totalCost)}</span>
              </div>
            </div>
          </div>
          
          {purchaseData.personalMessage && (
            <div className="mt-4 p-3 bg-elbfunkeln-beige/30 rounded">
              <div className="text-sm font-medium text-elbfunkeln-green mb-1">
                Persönliche Nachricht:
              </div>
              <div className="text-sm text-elbfunkeln-green/80">
                "{purchaseData.personalMessage}"
              </div>
            </div>
          )}
        </Card>

        <div className="flex gap-4 justify-center">
          <Button
            onClick={() => setCurrentStep(2)}
            variant="outline"
            className="border-elbfunkeln-rose/30"
          >
            Zurück
          </Button>
          
          <Button
            onClick={handlePurchase}
            disabled={isLoading}
            className="bg-elbfunkeln-green text-white hover:bg-elbfunkeln-green/90 px-8"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            {isLoading ? 'Wird erstellt...' : 'Jetzt kaufen'}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-cormorant text-3xl md:text-4xl text-elbfunkeln-green mb-4">
              🎁 Gutscheinkarten
            </h1>
            <p className="text-lg text-elbfunkeln-green/80">
              Das perfekte Geschenk für Schmuckliebhaber
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step <= currentStep 
                      ? 'bg-elbfunkeln-green text-white' 
                      : 'bg-elbfunkeln-beige text-elbfunkeln-green'
                  }`}>
                    {step < currentStep ? <Check className="w-5 h-5" /> : step}
                  </div>
                  {step < 3 && (
                    <div className={`w-12 h-1 mx-2 ${
                      step < currentStep ? 'bg-elbfunkeln-green' : 'bg-elbfunkeln-beige'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
          </motion.div>
        </div>
      </div>
    </div>
  );
}