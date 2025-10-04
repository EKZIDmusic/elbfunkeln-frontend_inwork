import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle, Package, Truck, Mail, Calendar, 
  Home, ShoppingBag, FileText, Heart, Download, UserPlus
} from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { useRouter } from '../components/Router';
import { useAuth } from '../components/AuthContext';
import { GuestRegistrationOffer } from '../components/GuestRegistrationOffer';

export function OrderSuccessPage() {
  const { navigateTo, getParams } = useRouter();
  const { isLoggedIn, user } = useAuth();
  const params = getParams();
  const orderId = params?.orderId || 'ORD-12345';
  const [showRegistrationOffer, setShowRegistrationOffer] = useState(false);

  // Mock order data
  const orderDetails = {
    orderId,
    orderDate: new Date().toLocaleDateString('de-DE'),
    estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('de-DE'),
    customerEmail: 'kunde@example.com',
    total: 149.97,
    items: [
      { id: 1, name: 'Silber Armband "Luna"', quantity: 1, price: 89.99 },
      { id: 2, name: 'Gold Ohrringe "Stella"', quantity: 1, price: 59.98 }
    ],
    shippingAddress: {
      name: 'Max Mustermann',
      street: 'Musterstraße 123',
      city: '12345 Hamburg',
      country: 'Deutschland'
    },
    paymentMethod: 'Kreditkarte',
    shipping: 'Standard Versand'
  };

  // Auto-scroll to top on mount and check if we should show registration offer
  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Show registration offer for guests after a short delay
    if (!isLoggedIn()) {
      const timer = setTimeout(() => {
        setShowRegistrationOffer(true);
      }, 3000); // Show after 3 seconds
      
      return () => clearTimeout(timer);
    }
  }, [isLoggedIn]);

  const handleRegistrationSuccess = () => {
    setShowRegistrationOffer(false);
    // You could show a success message here
  };

  return (
    <div className="min-h-screen pt-24">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-4xl font-cormorant text-elbfunkeln-green mb-2">
              Vielen Dank für Ihre Bestellung!
            </h1>
            <p className="text-gray-600 text-lg">
              Ihre Bestellung wurde erfolgreich aufgegeben und wird bearbeitet.
            </p>
            <div className="mt-4">
              <Badge className="bg-elbfunkeln-green/10 text-elbfunkeln-green border-elbfunkeln-green/20">
                Bestell-Nr.: {orderId}
              </Badge>
            </div>
          </motion.div>

          {/* Order Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <Card className="p-6 border-elbfunkeln-lavender/20">
              <h2 className="text-xl font-cormorant text-elbfunkeln-green mb-6">Bestellstatus</h2>
              <div className="flex items-center justify-between">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-green-600">Bestätigt</span>
                  <span className="text-xs text-gray-500">Heute</span>
                </div>
                
                <div className="flex-1 h-0.5 bg-gray-200 mx-4">
                  <div className="h-full bg-elbfunkeln-green w-1/3"></div>
                </div>
                
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-elbfunkeln-lavender/20 rounded-full flex items-center justify-center mb-2">
                    <Package className="w-6 h-6 text-elbfunkeln-lavender" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Verpackt</span>
                  <span className="text-xs text-gray-500">1-2 Tage</span>
                </div>
                
                <div className="flex-1 h-0.5 bg-gray-200 mx-4"></div>
                
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                    <Truck className="w-6 h-6 text-gray-400" />
                  </div>
                  <span className="text-sm font-medium text-gray-400">Versendet</span>
                  <span className="text-xs text-gray-500">3-5 Tage</span>
                </div>
                
                <div className="flex-1 h-0.5 bg-gray-200 mx-4"></div>
                
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                    <Home className="w-6 h-6 text-gray-400" />
                  </div>
                  <span className="text-sm font-medium text-gray-400">Zugestellt</span>
                  <span className="text-xs text-gray-500">{orderDetails.estimatedDelivery}</span>
                </div>
              </div>
            </Card>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Details */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="lg:col-span-2 space-y-6"
            >
              {/* Order Items */}
              <Card className="p-6 border-elbfunkeln-green/20">
                <h3 className="text-lg font-cormorant text-elbfunkeln-green mb-4">Bestellte Artikel</h3>
                <div className="space-y-4">
                  {orderDetails.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-16 h-16 bg-elbfunkeln-beige/50 rounded flex items-center justify-center">
                        <Package className="w-8 h-8 text-elbfunkeln-green" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-gray-600">Menge: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{item.price.toFixed(2)}€</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Separator className="my-4" />
                
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Gesamtbetrag:</span>
                  <span className="font-semibold text-lg">{orderDetails.total.toFixed(2)}€</span>
                </div>
              </Card>

              {/* Shipping & Billing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6 border-elbfunkeln-rose/20">
                  <h3 className="text-lg font-cormorant text-elbfunkeln-green mb-4">Versandadresse</h3>
                  <div className="text-sm space-y-1">
                    <p className="font-medium">{orderDetails.shippingAddress.name}</p>
                    <p>{orderDetails.shippingAddress.street}</p>
                    <p>{orderDetails.shippingAddress.city}</p>
                    <p>{orderDetails.shippingAddress.country}</p>
                  </div>
                </Card>

                <Card className="p-6 border-elbfunkeln-lavender/20">
                  <h3 className="text-lg font-cormorant text-elbfunkeln-green mb-4">Zahlungs- & Versandart</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Zahlung:</span>
                      <span className="font-medium">{orderDetails.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Versand:</span>
                      <span className="font-medium">{orderDetails.shipping}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Lieferung:</span>
                      <span className="font-medium">{orderDetails.estimatedDelivery}</span>
                    </div>
                  </div>
                </Card>
              </div>
            </motion.div>

            {/* Next Steps Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-6"
            >
              {/* Email Confirmation */}
              <Card className="p-6 border-elbfunkeln-green/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-elbfunkeln-green/10 rounded-full flex items-center justify-center">
                    <Mail className="w-5 h-5 text-elbfunkeln-green" />
                  </div>
                  <div>
                    <h3 className="font-medium">E-Mail Bestätigung</h3>
                    <p className="text-sm text-gray-600">Wird in Kürze gesendet</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Sie erhalten eine Bestätigungs-E-Mail an {orderDetails.customerEmail} mit allen Details.
                </p>
              </Card>

              {/* Tracking Info */}
              <Card className="p-6 border-elbfunkeln-lavender/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-elbfunkeln-lavender/20 rounded-full flex items-center justify-center">
                    <Truck className="w-5 h-5 text-elbfunkeln-lavender" />
                  </div>
                  <div>
                    <h3 className="font-medium">Sendungsverfolgung</h3>
                    <p className="text-sm text-gray-600">Kommt nach dem Versand</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Sobald Ihre Bestellung versendet wurde, erhalten Sie eine Tracking-Nummer.
                </p>
              </Card>

              {/* Account Access - only show for logged in users */}
              {isLoggedIn() ? (
                <Card className="p-6 border-elbfunkeln-rose/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-elbfunkeln-rose/20 rounded-full flex items-center justify-center">
                      <FileText className="w-5 h-5 text-elbfunkeln-rose" />
                    </div>
                    <div>
                      <h3 className="font-medium">Mein Konto</h3>
                      <p className="text-sm text-gray-600">Bestellungen verwalten</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Verfolgen Sie alle Ihre Bestellungen in Ihrem Kundenkonto.
                  </p>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => navigateTo('account')}
                    className="w-full border-elbfunkeln-rose text-elbfunkeln-rose hover:bg-elbfunkeln-rose/10"
                  >
                    Zu meinem Konto
                  </Button>
                </Card>
              ) : (
                <Card className="p-6 border-elbfunkeln-green/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-elbfunkeln-green/20 rounded-full flex items-center justify-center">
                      <UserPlus className="w-5 h-5 text-elbfunkeln-green" />
                    </div>
                    <div>
                      <h3 className="font-medium">Konto erstellen</h3>
                      <p className="text-sm text-gray-600">Vorteile sichern</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Erstellen Sie ein Konto für exklusive Angebote und einfachere zukünftige Bestellungen.
                  </p>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setShowRegistrationOffer(true)}
                    className="w-full border-elbfunkeln-green text-elbfunkeln-green hover:bg-elbfunkeln-green/10"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Jetzt registrieren
                  </Button>
                </Card>
              )}

              {/* Quick Actions */}
              <Card className="p-6">
                <h3 className="font-medium mb-4">Was möchten Sie als nächstes tun?</h3>
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    onClick={() => navigateTo('shop')}
                    className="w-full justify-start border-elbfunkeln-green text-elbfunkeln-green hover:bg-elbfunkeln-green/10"
                  >
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Weitershoppen
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => navigateTo('favorites')}
                    className="w-full justify-start border-elbfunkeln-rose text-elbfunkeln-rose hover:bg-elbfunkeln-rose/10"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Meine Favoriten
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => window.print()}
                    className="w-full justify-start"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Rechnung drucken
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Support Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-8"
          >
            <Card className="p-6 bg-gradient-to-r from-elbfunkeln-beige/20 via-elbfunkeln-lavender/20 to-elbfunkeln-rose/20 border-0">
              <div className="text-center">
                <h3 className="font-cormorant text-xl text-elbfunkeln-green mb-2">
                  Fragen zu Ihrer Bestellung?
                </h3>
                <p className="text-gray-600 mb-4">
                  Unser Kundenservice hilft Ihnen gerne weiter.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button 
                    variant="outline"
                    onClick={() => navigateTo('contact')}
                    className="border-elbfunkeln-green text-elbfunkeln-green hover:bg-elbfunkeln-green/10"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Kontakt aufnehmen
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => navigateTo('shipping')}
                    className="border-elbfunkeln-lavender text-elbfunkeln-lavender hover:bg-elbfunkeln-lavender/10"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Versandinfos
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Guest Registration Offer Modal */}
          <GuestRegistrationOffer
            isOpen={showRegistrationOffer}
            onClose={() => setShowRegistrationOffer(false)}
            onRegistrationSuccess={handleRegistrationSuccess}
          />
        </div>
      </div>
    </div>
  );
}