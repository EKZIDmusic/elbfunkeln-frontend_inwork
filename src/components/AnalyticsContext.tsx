import { createContext, useContext, ReactNode, useEffect } from 'react';
import { useCookieConsent } from './CookieConsentContext';
import { safeInitializeAnalytics } from '../utils/analytics-init';

// E-Commerce Event Types (Enhanced für Google Analytics 4)
interface EcommerceItem {
  item_id: string;
  item_name: string;
  category: string;
  quantity: number;
  price: number;
  currency?: string;
  item_variant?: string;
  item_brand?: string;
  discount?: number;
}

interface EcommerceEvent {
  event_name: string;
  currency: string;
  value?: number;
  items: EcommerceItem[];
  transaction_id?: string;
  coupon?: string;
  shipping?: number;
  tax?: number;
}

interface AnalyticsContextType {
  // Core Tracking
  trackEvent: (eventName: string, parameters?: Record<string, any>) => void;
  trackPageView: (pageName: string, additionalData?: Record<string, any>) => void;
  
  // E-Commerce Events
  trackViewItem: (item: EcommerceItem) => void;
  trackViewItemList: (items: EcommerceItem[], listName?: string) => void;
  trackAddToCart: (item: EcommerceItem) => void;
  trackRemoveFromCart: (item: EcommerceItem) => void;
  trackBeginCheckout: (items: EcommerceItem[], value: number) => void;
  trackPurchase: (transactionId: string, items: EcommerceItem[], value: number, additionalData?: {
    coupon?: string;
    shipping?: number;
    tax?: number;
  }) => void;
  trackRefund: (transactionId: string, items?: EcommerceItem[], value?: number) => void;
  
  // Search & Engagement
  trackSearch: (searchQuery: string, results?: number) => void;
  trackSelectItem: (item: EcommerceItem, listName?: string) => void;
  trackSelectPromotion: (promotionId: string, promotionName?: string) => void;
  
  // User Engagement
  trackLogin: (method?: string) => void;
  trackSignUp: (method?: string) => void;
  trackShare: (contentType: string, itemId?: string) => void;
  
  // Custom Events
  trackNewsletterSignup: (source?: string) => void;
  trackWishlistAdd: (item: EcommerceItem) => void;
  trackFilterUsage: (filterType: string, filterValue: string) => void;
  
  // Conversion & Marketing
  trackLeadGeneration: (leadType: string, value?: number) => void;
  trackCustomEvent: (eventName: string, parameters: Record<string, any>) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}

interface AnalyticsProviderProps {
  children: ReactNode;
}

// Event naming conventions
const EVENT_NAMES = {
  // E-Commerce (GA4 Enhanced E-Commerce)
  VIEW_ITEM: 'view_item',
  VIEW_ITEM_LIST: 'view_item_list',
  ADD_TO_CART: 'add_to_cart',
  REMOVE_FROM_CART: 'remove_from_cart',
  BEGIN_CHECKOUT: 'begin_checkout',
  PURCHASE: 'purchase',
  REFUND: 'refund',
  
  // Search & Discovery
  SEARCH: 'search',
  SELECT_ITEM: 'select_item',
  SELECT_PROMOTION: 'select_promotion',
  
  // User Actions
  LOGIN: 'login',
  SIGN_UP: 'sign_up',
  SHARE: 'share',
  
  // Custom Events (mit elbfunkeln_ prefix)
  NEWSLETTER_SIGNUP: 'elbfunkeln_newsletter_signup',
  WISHLIST_ADD: 'elbfunkeln_wishlist_add',
  FILTER_USAGE: 'elbfunkeln_filter_usage',
  LEAD_GENERATION: 'generate_lead'
} as const;

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const { isConsentGiven } = useCookieConsent();

  // Initialize analytics when consent is given - commented out to avoid process.env error
  useEffect(() => {
    if (isConsentGiven('analytics') || isConsentGiven('marketing')) {
      // safeInitializeAnalytics(); // Disabled until environment variables are properly configured
      console.log('📊 Analytics consent given - ready for initialization');
    }
  }, [isConsentGiven]);

  // Core tracking function mit Consent-Prüfung
  const trackEvent = (eventName: string, parameters: Record<string, any> = {}) => {
    // Prüfe Analytics-Consent
    if (!isConsentGiven('analytics')) {
      console.log('📊 Analytics-Event blockiert (kein Consent):', eventName);
      return;
    }

    const eventData = {
      event: eventName,
      timestamp: new Date().toISOString(),
      page_location: window.location.href,
      page_title: document.title,
      ...parameters
    };

    // Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, parameters);
    }

    // Hotjar Events
    if (typeof window !== 'undefined' && (window as any).hj) {
      (window as any).hj('event', eventName);
    }

    // Facebook Pixel (nur bei Marketing-Consent und gültiger Pixel ID)
    if (isConsentGiven('marketing') && typeof window !== 'undefined' && (window as any).fbq && (window as any).FB_PIXEL_ID) {
      try {
        (window as any).fbq('trackCustom', eventName, parameters);
      } catch (error) {
        console.warn('Facebook Pixel error:', error);
      }
    }

    // Console Logging für Development
    console.log('📊 Analytics Event:', eventName, parameters);

    // Custom Analytics Backend (optional)
    sendToCustomAnalytics(eventData);
  };

  const trackPageView = (pageName: string, additionalData: Record<string, any> = {}) => {
    if (!isConsentGiven('analytics')) return;

    const pageData = {
      page_title: pageName,
      page_location: window.location.href,
      page_path: window.location.pathname,
      ...additionalData
    };

    if (typeof window !== 'undefined' && (window as any).gtag && (window as any).GA_MEASUREMENT_ID) {
      (window as any).gtag('config', (window as any).GA_MEASUREMENT_ID, {
        page_title: pageName,
        page_location: window.location.href,
        ...additionalData
      });
    }

    console.log('📄 Page View:', pageName, pageData);
  };

  // E-Commerce Events
  const trackViewItem = (item: EcommerceItem) => {
    trackEvent(EVENT_NAMES.VIEW_ITEM, {
      currency: 'EUR',
      value: item.price,
      items: [item]
    });
  };

  const trackViewItemList = (items: EcommerceItem[], listName: string = 'Product List') => {
    trackEvent(EVENT_NAMES.VIEW_ITEM_LIST, {
      item_list_name: listName,
      items: items
    });
  };

  const trackAddToCart = (item: EcommerceItem) => {
    trackEvent(EVENT_NAMES.ADD_TO_CART, {
      currency: 'EUR',
      value: item.price * item.quantity,
      items: [item]
    });
  };

  const trackRemoveFromCart = (item: EcommerceItem) => {
    trackEvent(EVENT_NAMES.REMOVE_FROM_CART, {
      currency: 'EUR',
      value: item.price * item.quantity,
      items: [item]
    });
  };

  const trackBeginCheckout = (items: EcommerceItem[], value: number) => {
    trackEvent(EVENT_NAMES.BEGIN_CHECKOUT, {
      currency: 'EUR',
      value: value,
      items: items
    });
  };

  const trackPurchase = (
    transactionId: string, 
    items: EcommerceItem[], 
    value: number,
    additionalData?: {
      coupon?: string;
      shipping?: number;
      tax?: number;
    }
  ) => {
    trackEvent(EVENT_NAMES.PURCHASE, {
      transaction_id: transactionId,
      currency: 'EUR',
      value: value,
      items: items,
      coupon: additionalData?.coupon,
      shipping: additionalData?.shipping || 0,
      tax: additionalData?.tax || 0
    });

    // Facebook Pixel Purchase Event
    if (isConsentGiven('marketing') && typeof window !== 'undefined' && (window as any).fbq && (window as any).FB_PIXEL_ID) {
      try {
        (window as any).fbq('track', 'Purchase', {
          value: value,
          currency: 'EUR',
          content_ids: items.map(item => item.item_id),
          content_type: 'product'
        });
      } catch (error) {
        console.warn('Facebook Pixel Purchase error:', error);
      }
    }
  };

  const trackRefund = (transactionId: string, items?: EcommerceItem[], value?: number) => {
    trackEvent(EVENT_NAMES.REFUND, {
      transaction_id: transactionId,
      currency: 'EUR',
      value: value,
      items: items
    });
  };

  // Search & Discovery
  const trackSearch = (searchQuery: string, results?: number) => {
    trackEvent(EVENT_NAMES.SEARCH, {
      search_term: searchQuery,
      search_results: results
    });
  };

  const trackSelectItem = (item: EcommerceItem, listName?: string) => {
    trackEvent(EVENT_NAMES.SELECT_ITEM, {
      item_list_name: listName,
      items: [item]
    });
  };

  const trackSelectPromotion = (promotionId: string, promotionName?: string) => {
    trackEvent(EVENT_NAMES.SELECT_PROMOTION, {
      promotion_id: promotionId,
      promotion_name: promotionName
    });
  };

  // User Engagement
  const trackLogin = (method: string = 'email') => {
    trackEvent(EVENT_NAMES.LOGIN, {
      method: method
    });
  };

  const trackSignUp = (method: string = 'email') => {
    trackEvent(EVENT_NAMES.SIGN_UP, {
      method: method
    });

    // Facebook Pixel CompleteRegistration
    if (isConsentGiven('marketing') && typeof window !== 'undefined' && (window as any).fbq && (window as any).FB_PIXEL_ID) {
      try {
        (window as any).fbq('track', 'CompleteRegistration');
      } catch (error) {
        console.warn('Facebook Pixel CompleteRegistration error:', error);
      }
    }
  };

  const trackShare = (contentType: string, itemId?: string) => {
    trackEvent(EVENT_NAMES.SHARE, {
      content_type: contentType,
      item_id: itemId
    });
  };

  // Custom Events
  const trackNewsletterSignup = (source: string = 'website') => {
    trackEvent(EVENT_NAMES.NEWSLETTER_SIGNUP, {
      source: source,
      timestamp: new Date().toISOString()
    });

    // Facebook Pixel Lead Event
    if (isConsentGiven('marketing') && typeof window !== 'undefined' && (window as any).fbq && (window as any).FB_PIXEL_ID) {
      try {
        (window as any).fbq('track', 'Lead', {
          content_name: 'Newsletter Signup'
        });
      } catch (error) {
        console.warn('Facebook Pixel Lead error:', error);
      }
    }
  };

  const trackWishlistAdd = (item: EcommerceItem) => {
    trackEvent(EVENT_NAMES.WISHLIST_ADD, {
      currency: 'EUR',
      value: item.price,
      items: [item]
    });

    // Facebook Pixel AddToWishlist
    if (isConsentGiven('marketing') && typeof window !== 'undefined' && (window as any).fbq && (window as any).FB_PIXEL_ID) {
      try {
        (window as any).fbq('track', 'AddToWishlist', {
          value: item.price,
          currency: 'EUR',
          content_ids: [item.item_id],
          content_type: 'product'
        });
      } catch (error) {
        console.warn('Facebook Pixel AddToWishlist error:', error);
      }
    }
  };

  const trackFilterUsage = (filterType: string, filterValue: string) => {
    trackEvent(EVENT_NAMES.FILTER_USAGE, {
      filter_type: filterType,
      filter_value: filterValue
    });
  };

  const trackLeadGeneration = (leadType: string, value?: number) => {
    trackEvent(EVENT_NAMES.LEAD_GENERATION, {
      lead_type: leadType,
      currency: 'EUR',
      value: value
    });
  };

  const trackCustomEvent = (eventName: string, parameters: Record<string, any>) => {
    trackEvent(`elbfunkeln_${eventName}`, parameters);
  };

  // Custom Analytics Backend
  const sendToCustomAnalytics = async (eventData: any) => {
    // Nur senden wenn Analytics-Consent gegeben wurde
    if (!isConsentGiven('analytics')) return;

    try {
      // Hier könnte ein Call an unser eigenes Analytics-Backend erfolgen
      // fetch('/api/analytics/track', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(eventData)
      // });
    } catch (error) {
      console.error('Custom Analytics Error:', error);
    }
  };

  return (
    <AnalyticsContext.Provider value={{
      trackEvent,
      trackPageView,
      trackViewItem,
      trackViewItemList,
      trackAddToCart,
      trackRemoveFromCart,
      trackBeginCheckout,
      trackPurchase,
      trackRefund,
      trackSearch,
      trackSelectItem,
      trackSelectPromotion,
      trackLogin,
      trackSignUp,
      trackShare,
      trackNewsletterSignup,
      trackWishlistAdd,
      trackFilterUsage,
      trackLeadGeneration,
      trackCustomEvent
    }}>
      {children}
    </AnalyticsContext.Provider>
  );
}