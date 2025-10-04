import { useState } from 'react';
import { motion } from 'motion/react';
import { Bell, BellOff, TrendingDown, AlertCircle, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { useNewsletterAutomation } from './NewsletterAutomationContext';
import { useAuth } from './AuthContext';
import { toast } from 'sonner@2.0.3';

interface ProductNotificationsProps {
  productId: string;
  productName: string;
  currentPrice: number;
  isInStock: boolean;
  className?: string;
}

export function ProductNotifications({ 
  productId, 
  productName, 
  currentPrice, 
  isInStock,
  className = ""
}: ProductNotificationsProps) {
  const { user } = useAuth();
  const {
    subscribeToBackInStock,
    unsubscribeFromBackInStock,
    isSubscribedToBackInStock,
    subscribeToPriceAlert,
    unsubscribeFromPriceAlert,
    getPriceAlertSubscriptions,
    isLoading
  } = useNewsletterAutomation();

  const [targetPrice, setTargetPrice] = useState<string>('');
  const [showPriceAlertDialog, setShowPriceAlertDialog] = useState(false);

  const isBackInStockSubscribed = isSubscribedToBackInStock(productId);
  const priceAlertSubscription = getPriceAlertSubscriptions().find(
    sub => sub.productId === productId && sub.active
  );

  const handleBackInStockToggle = async () => {
    if (!user) {
      toast.error('Sie müssen angemeldet sein, um Benachrichtigungen zu erhalten');
      return;
    }

    if (isBackInStockSubscribed) {
      await unsubscribeFromBackInStock(productId);
    } else {
      await subscribeToBackInStock(productId, productName);
    }
  };

  const handlePriceAlert = async () => {
    if (!user) {
      toast.error('Sie müssen angemeldet sein, um Preisalarme zu erhalten');
      return;
    }

    const target = parseFloat(targetPrice);
    if (isNaN(target) || target <= 0) {
      toast.error('Bitte geben Sie einen gültigen Preis ein');
      return;
    }

    if (target >= currentPrice) {
      toast.error('Der Zielpreis muss niedriger als der aktuelle Preis sein');
      return;
    }

    await subscribeToPriceAlert(productId, productName, currentPrice, target);
    setShowPriceAlertDialog(false);
    setTargetPrice('');
  };

  const handleRemovePriceAlert = async () => {
    await unsubscribeFromPriceAlert(productId);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Back in Stock Notification */}
      {!isInStock && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <Button
            onClick={handleBackInStockToggle}
            disabled={isLoading}
            variant={isBackInStockSubscribed ? "default" : "outline"}
            size="sm"
            className={`flex-1 ${
              isBackInStockSubscribed 
                ? 'bg-elbfunkeln-green text-white hover:bg-elbfunkeln-green/90' 
                : 'border-elbfunkeln-green/30 text-elbfunkeln-green hover:bg-elbfunkeln-green/10'
            }`}
          >
            {isBackInStockSubscribed ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Benachrichtigung aktiv
              </>
            ) : (
              <>
                <Bell className="w-4 h-4 mr-2" />
                Bei Verfügbarkeit benachrichtigen
              </>
            )}
          </Button>
          
          {isBackInStockSubscribed && (
            <Button
              onClick={handleBackInStockToggle}
              variant="ghost"
              size="sm"
              className="text-elbfunkeln-rose hover:text-elbfunkeln-rose/80 hover:bg-elbfunkeln-rose/10"
            >
              <BellOff className="w-4 h-4" />
            </Button>
          )}
        </motion.div>
      )}

      {/* Price Alert */}
      {isInStock && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          {priceAlertSubscription ? (
            <Card className="p-3 bg-elbfunkeln-beige/30 border-elbfunkeln-green/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-elbfunkeln-green" />
                  <span className="text-sm text-elbfunkeln-green">
                    Preisalarm bei {formatPrice(priceAlertSubscription.targetPrice)}
                  </span>
                </div>
                <Button
                  onClick={handleRemovePriceAlert}
                  variant="ghost"
                  size="sm"
                  className="text-elbfunkeln-rose hover:text-elbfunkeln-rose/80 hover:bg-elbfunkeln-rose/10 p-1"
                >
                  <BellOff className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ) : (
            <Dialog open={showPriceAlertDialog} onOpenChange={setShowPriceAlertDialog}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-elbfunkeln-rose/30 text-elbfunkeln-green hover:bg-elbfunkeln-rose/10"
                >
                  <TrendingDown className="w-4 h-4 mr-2" />
                  Preisalarm einrichten
                </Button>
              </DialogTrigger>
              
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-cormorant text-elbfunkeln-green">
                    Preisalarm für {productName}
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="text-sm text-elbfunkeln-green/80">
                    Aktueller Preis: <span className="font-medium">{formatPrice(currentPrice)}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-elbfunkeln-green">
                      Gewünschter Preis (€)
                    </label>
                    <Input
                      type="number"
                      placeholder="z.B. 25.00"
                      value={targetPrice}
                      onChange={(e) => setTargetPrice(e.target.value)}
                      max={currentPrice - 0.01}
                      step="0.01"
                      className="border-elbfunkeln-rose/30 focus:border-elbfunkeln-green"
                    />
                    <p className="text-xs text-elbfunkeln-green/60">
                      Sie werden benachrichtigt, wenn der Preis auf {targetPrice ? formatPrice(parseFloat(targetPrice)) : '—'} oder darunter fällt.
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={handlePriceAlert}
                      disabled={isLoading || !targetPrice || parseFloat(targetPrice) >= currentPrice}
                      className="flex-1 bg-elbfunkeln-green text-white hover:bg-elbfunkeln-green/90"
                    >
                      Preisalarm aktivieren
                    </Button>
                    <Button
                      onClick={() => {
                        setShowPriceAlertDialog(false);
                        setTargetPrice('');
                      }}
                      variant="outline"
                      className="border-elbfunkeln-rose/30"
                    >
                      Abbrechen
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </motion.div>
      )}

      {/* Login Prompt for Guests */}
      {!user && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3"
        >
          <Card className="p-3 bg-elbfunkeln-lavender/20 border-elbfunkeln-lavender/30">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-elbfunkeln-green mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-elbfunkeln-green mb-1">
                  Benachrichtigungen nur für angemeldete Kunden
                </p>
                <p className="text-elbfunkeln-green/70 text-xs">
                  Melden Sie sich an, um bei Verfügbarkeit und Preisänderungen benachrichtigt zu werden.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}