import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useAnalytics } from './AnalyticsContext';
import { toast } from 'sonner@2.0.3';

// Typen für Newsletter-Automation
interface BackInStockSubscription {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  email: string;
  createdAt: string;
  notified: boolean;
}

interface PriceAlertSubscription {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  currentPrice: number;
  targetPrice: number;
  email: string;
  createdAt: string;
  active: boolean;
}

interface AbandonedCart {
  id: string;
  userId?: string;
  email: string;
  sessionId: string;
  items: Array<{
    productId: string;
    productName: string;
    price: number;
    quantity: number;
    image?: string;
  }>;
  totalValue: number;
  createdAt: string;
  lastReminderSent?: string;
  reminderCount: number;
  recovered: boolean;
}

interface NewsletterStats {
  backInStockSubscriptions: number;
  priceAlertSubscriptions: number;
  abandonedCarts: number;
  recoveryRate: number;
}

interface NewsletterAutomationContextType {
  // Back in Stock
  subscribeToBackInStock: (productId: string, productName: string) => Promise<void>;
  unsubscribeFromBackInStock: (productId: string) => Promise<void>;
  isSubscribedToBackInStock: (productId: string) => boolean;
  getBackInStockSubscriptions: () => BackInStockSubscription[];
  
  // Price Alerts
  subscribeToPriceAlert: (productId: string, productName: string, currentPrice: number, targetPrice: number) => Promise<void>;
  unsubscribeFromPriceAlert: (productId: string) => Promise<void>;
  getPriceAlertSubscriptions: () => PriceAlertSubscription[];
  
  // Abandoned Cart
  saveAbandonedCart: (cartItems: any[], totalValue: number) => Promise<void>;
  getAbandonedCarts: () => AbandonedCart[];
  markCartAsRecovered: (cartId: string) => Promise<void>;
  
  // Statistics
  getNewsletterStats: () => NewsletterStats;
  
  // Loading states
  isLoading: boolean;
}

const NewsletterAutomationContext = createContext<NewsletterAutomationContextType | undefined>(undefined);

export function useNewsletterAutomation() {
  const context = useContext(NewsletterAutomationContext);
  if (context === undefined) {
    throw new Error('useNewsletterAutomation must be used within a NewsletterAutomationProvider');
  }
  return context;
}

interface NewsletterAutomationProviderProps {
  children: ReactNode;
}

export function NewsletterAutomationProvider({ children }: NewsletterAutomationProviderProps) {
  const { user } = useAuth();
  const { trackCustomEvent } = useAnalytics();
  
  const [backInStockSubscriptions, setBackInStockSubscriptions] = useState<BackInStockSubscription[]>([]);
  const [priceAlertSubscriptions, setPriceAlertSubscriptions] = useState<PriceAlertSubscription[]>([]);
  const [abandonedCarts, setAbandonedCarts] = useState<AbandonedCart[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Storage-Keys
  const BACK_IN_STOCK_KEY = 'elbfunkeln_back_in_stock_subscriptions';
  const PRICE_ALERT_KEY = 'elbfunkeln_price_alert_subscriptions';
  const ABANDONED_CART_KEY = 'elbfunkeln_abandoned_carts';

  // Lade gespeicherte Daten beim Start
  useEffect(() => {
    loadStoredData();
  }, []);

  // Speichere Daten bei Änderungen
  useEffect(() => {
    localStorage.setItem(BACK_IN_STOCK_KEY, JSON.stringify(backInStockSubscriptions));
  }, [backInStockSubscriptions]);

  useEffect(() => {
    localStorage.setItem(PRICE_ALERT_KEY, JSON.stringify(priceAlertSubscriptions));
  }, [priceAlertSubscriptions]);

  useEffect(() => {
    localStorage.setItem(ABANDONED_CART_KEY, JSON.stringify(abandonedCarts));
  }, [abandonedCarts]);

  const loadStoredData = () => {
    try {
      // Back in Stock Subscriptions
      const storedBackInStock = localStorage.getItem(BACK_IN_STOCK_KEY);
      if (storedBackInStock) {
        setBackInStockSubscriptions(JSON.parse(storedBackInStock));
      }

      // Price Alert Subscriptions
      const storedPriceAlerts = localStorage.getItem(PRICE_ALERT_KEY);
      if (storedPriceAlerts) {
        setPriceAlertSubscriptions(JSON.parse(storedPriceAlerts));
      }

      // Abandoned Carts
      const storedAbandonedCarts = localStorage.getItem(ABANDONED_CART_KEY);
      if (storedAbandonedCarts) {
        setAbandonedCarts(JSON.parse(storedAbandonedCarts));
      }
    } catch (error) {
      console.error('Error loading newsletter automation data:', error);
    }
  };

  // Back in Stock Functions
  const subscribeToBackInStock = async (productId: string, productName: string) => {
    if (!user?.email) {
      toast.error('Sie müssen angemeldet sein, um Benachrichtigungen zu erhalten');
      return;
    }

    setIsLoading(true);
    try {
      const subscription: BackInStockSubscription = {
        id: `bis_${productId}_${user.id}_${Date.now()}`,
        userId: user.id,
        productId,
        productName,
        email: user.email,
        createdAt: new Date().toISOString(),
        notified: false
      };

      setBackInStockSubscriptions(prev => {
        // Entferne existierende Subscription für das gleiche Produkt
        const filtered = prev.filter(sub => !(sub.productId === productId && sub.userId === user.id));
        return [...filtered, subscription];
      });

      // Analytics Event
      trackCustomEvent('back_in_stock_subscribe', {
        product_id: productId,
        product_name: productName
      });

      toast.success(`Sie werden benachrichtigt, wenn "${productName}" wieder verfügbar ist`);
    } catch (error) {
      console.error('Error subscribing to back in stock:', error);
      toast.error('Fehler beim Einrichten der Benachrichtigung');
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribeFromBackInStock = async (productId: string) => {
    if (!user?.id) return;

    setBackInStockSubscriptions(prev => 
      prev.filter(sub => !(sub.productId === productId && sub.userId === user.id))
    );

    trackCustomEvent('back_in_stock_unsubscribe', {
      product_id: productId
    });

    toast.success('Benachrichtigung deaktiviert');
  };

  const isSubscribedToBackInStock = (productId: string): boolean => {
    if (!user?.id) return false;
    return backInStockSubscriptions.some(sub => 
      sub.productId === productId && sub.userId === user.id && !sub.notified
    );
  };

  // Price Alert Functions
  const subscribeToPriceAlert = async (
    productId: string, 
    productName: string, 
    currentPrice: number, 
    targetPrice: number
  ) => {
    if (!user?.email) {
      toast.error('Sie müssen angemeldet sein, um Preisalarme zu erhalten');
      return;
    }

    if (targetPrice >= currentPrice) {
      toast.error('Der Zielpreis muss niedriger als der aktuelle Preis sein');
      return;
    }

    setIsLoading(true);
    try {
      const subscription: PriceAlertSubscription = {
        id: `pa_${productId}_${user.id}_${Date.now()}`,
        userId: user.id,
        productId,
        productName,
        currentPrice,
        targetPrice,
        email: user.email,
        createdAt: new Date().toISOString(),
        active: true
      };

      setPriceAlertSubscriptions(prev => {
        // Entferne existierende Subscription für das gleiche Produkt
        const filtered = prev.filter(sub => !(sub.productId === productId && sub.userId === user.id));
        return [...filtered, subscription];
      });

      trackCustomEvent('price_alert_subscribe', {
        product_id: productId,
        product_name: productName,
        current_price: currentPrice,
        target_price: targetPrice
      });

      toast.success(`Preisalarm für "${productName}" bei ${targetPrice}€ eingerichtet`);
    } catch (error) {
      console.error('Error subscribing to price alert:', error);
      toast.error('Fehler beim Einrichten des Preisalarms');
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribeFromPriceAlert = async (productId: string) => {
    if (!user?.id) return;

    setPriceAlertSubscriptions(prev => 
      prev.filter(sub => !(sub.productId === productId && sub.userId === user.id))
    );

    trackCustomEvent('price_alert_unsubscribe', {
      product_id: productId
    });

    toast.success('Preisalarm deaktiviert');
  };

  // Abandoned Cart Functions
  const saveAbandonedCart = async (cartItems: any[], totalValue: number) => {
    if (cartItems.length === 0) return;

    try {
      const sessionId = getSessionId();
      const email = user?.email || getGuestEmail();
      
      if (!email) return; // Keine E-Mail verfügbar

      const abandonedCart: AbandonedCart = {
        id: `ac_${sessionId}_${Date.now()}`,
        userId: user?.id,
        email,
        sessionId,
        items: cartItems.map(item => ({
          productId: item.id,
          productName: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        totalValue,
        createdAt: new Date().toISOString(),
        reminderCount: 0,
        recovered: false
      };

      setAbandonedCarts(prev => {
        // Entferne alte Carts für die gleiche Session
        const filtered = prev.filter(cart => cart.sessionId !== sessionId);
        return [...filtered, abandonedCart];
      });

      // Plane automatische E-Mail-Erinnerungen
      scheduleAbandonedCartReminders(abandonedCart.id);

      trackCustomEvent('abandoned_cart_saved', {
        cart_value: totalValue,
        item_count: cartItems.length
      });

    } catch (error) {
      console.error('Error saving abandoned cart:', error);
    }
  };

  const markCartAsRecovered = async (cartId: string) => {
    setAbandonedCarts(prev => 
      prev.map(cart => 
        cart.id === cartId ? { ...cart, recovered: true } : cart
      )
    );

    trackCustomEvent('abandoned_cart_recovered', {
      cart_id: cartId
    });
  };

  // Helper Functions
  const getSessionId = (): string => {
    let sessionId = localStorage.getItem('elbfunkeln_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('elbfunkeln_session_id', sessionId);
    }
    return sessionId;
  };

  const getGuestEmail = (): string | null => {
    return localStorage.getItem('elbfunkeln_guest_email');
  };

  const scheduleAbandonedCartReminders = (cartId: string) => {
    // In einer echten Anwendung würde dies über einen Backend-Service laufen
    // Hier simulieren wir es mit setTimeout für Demo-Zwecke
    
    // Erste Erinnerung nach 1 Stunde
    setTimeout(() => {
      sendAbandonedCartReminder(cartId, 1);
    }, 60 * 60 * 1000);

    // Zweite Erinnerung nach 24 Stunden
    setTimeout(() => {
      sendAbandonedCartReminder(cartId, 2);
    }, 24 * 60 * 60 * 1000);

    // Dritte Erinnerung nach 72 Stunden
    setTimeout(() => {
      sendAbandonedCartReminder(cartId, 3);
    }, 72 * 60 * 60 * 1000);
  };

  const sendAbandonedCartReminder = (cartId: string, reminderNumber: number) => {
    setAbandonedCarts(prev => 
      prev.map(cart => {
        if (cart.id === cartId && !cart.recovered) {
          trackCustomEvent('abandoned_cart_reminder_sent', {
            cart_id: cartId,
            reminder_number: reminderNumber,
            cart_value: cart.totalValue
          });

          return {
            ...cart,
            lastReminderSent: new Date().toISOString(),
            reminderCount: reminderNumber
          };
        }
        return cart;
      })
    );
  };

  // Statistics
  const getNewsletterStats = (): NewsletterStats => {
    const recoveredCarts = abandonedCarts.filter(cart => cart.recovered).length;
    const totalCarts = abandonedCarts.length;
    
    return {
      backInStockSubscriptions: backInStockSubscriptions.length,
      priceAlertSubscriptions: priceAlertSubscriptions.filter(sub => sub.active).length,
      abandonedCarts: totalCarts,
      recoveryRate: totalCarts > 0 ? (recoveredCarts / totalCarts) * 100 : 0
    };
  };

  const getBackInStockSubscriptions = () => backInStockSubscriptions;
  const getPriceAlertSubscriptions = () => priceAlertSubscriptions;
  const getAbandonedCarts = () => abandonedCarts;

  return (
    <NewsletterAutomationContext.Provider value={{
      subscribeToBackInStock,
      unsubscribeFromBackInStock,
      isSubscribedToBackInStock,
      getBackInStockSubscriptions,
      subscribeToPriceAlert,
      unsubscribeFromPriceAlert,
      getPriceAlertSubscriptions,
      saveAbandonedCart,
      getAbandonedCarts,
      markCartAsRecovered,
      getNewsletterStats,
      isLoading
    }}>
      {children}
    </NewsletterAutomationContext.Provider>
  );
}