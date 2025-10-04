import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CookieConsent {
  essential: boolean;    // Immer true, kann nicht deaktiviert werden
  analytics: boolean;    // Google Analytics, Hotjar, etc.
  marketing: boolean;    // Google Ads, Facebook Pixel, etc.
  preferences: boolean;  // Benutzereinstellungen, Sprache, etc.
}

interface CookieConsentContextType {
  consent: CookieConsent | null;
  hasConsent: boolean;
  showBanner: boolean;
  showPreferences: boolean;
  acceptAll: () => void;
  acceptEssential: () => void;
  updateConsent: (newConsent: Partial<CookieConsent>) => void;
  showPreferencesDialog: () => void;
  hidePreferencesDialog: () => void;
  resetConsent: () => void;
  getConsentString: () => string;
  isConsentGiven: (category: keyof CookieConsent) => boolean;
}

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

export function useCookieConsent() {
  const context = useContext(CookieConsentContext);
  if (context === undefined) {
    throw new Error('useCookieConsent must be used within a CookieConsentProvider');
  }
  return context;
}

interface CookieConsentProviderProps {
  children: ReactNode;
}

const CONSENT_STORAGE_KEY = 'elbfunkeln_cookie_consent';
const CONSENT_VERSION = '1.0';
const CONSENT_EXPIRY_DAYS = 365;

// Standard Cookie Kategorien nach DSGVO
const DEFAULT_CONSENT: CookieConsent = {
  essential: true,
  analytics: false,
  marketing: false,
  preferences: false
};

export function CookieConsentProvider({ children }: CookieConsentProviderProps) {
  const [consent, setConsent] = useState<CookieConsent | null>(null);
  const [hasConsent, setHasConsent] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferencesDialog] = useState(false);

  // Lade gespeicherte Einwilligung beim Start
  useEffect(() => {
    loadStoredConsent();
  }, []);

  // Google Consent Mode v2 Integration
  useEffect(() => {
    if (consent && hasConsent) {
      updateGoogleConsentMode(consent);
    }
  }, [consent, hasConsent]);

  const loadStoredConsent = () => {
    try {
      const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        
        // Prüfe Version und Ablaufzeit
        const isValid = data.version === CONSENT_VERSION && 
                       data.expiry > Date.now();
        
        if (isValid && data.consent) {
          setConsent(data.consent);
          setHasConsent(true);
          setShowBanner(false);
          console.log('📋 Cookie-Einwilligung geladen:', data.consent);
        } else {
          // Abgelaufen oder ungültige Version
          resetConsent();
        }
      } else {
        // Keine gespeicherte Einwilligung gefunden
        setShowBanner(true);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Cookie-Einwilligung:', error);
      resetConsent();
    }
  };

  const storeConsent = (newConsent: CookieConsent) => {
    try {
      const data = {
        consent: newConsent,
        version: CONSENT_VERSION,
        timestamp: Date.now(),
        expiry: Date.now() + (CONSENT_EXPIRY_DAYS * 24 * 60 * 60 * 1000)
      };
      
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(data));
      console.log('💾 Cookie-Einwilligung gespeichert:', newConsent);
    } catch (error) {
      console.error('Fehler beim Speichern der Cookie-Einwilligung:', error);
    }
  };

  const acceptAll = () => {
    const fullConsent: CookieConsent = {
      essential: true,
      analytics: true,
      marketing: true,
      preferences: true
    };
    
    setConsent(fullConsent);
    setHasConsent(true);
    setShowBanner(false);
    setShowPreferencesDialog(false);
    storeConsent(fullConsent);
    
    // Lade Analytics/Marketing-Scripts
    loadAnalyticsScripts(fullConsent);
  };

  const acceptEssential = () => {
    const essentialConsent: CookieConsent = {
      essential: true,
      analytics: false,
      marketing: false,
      preferences: false
    };
    
    setConsent(essentialConsent);
    setHasConsent(true);
    setShowBanner(false);
    setShowPreferencesDialog(false);
    storeConsent(essentialConsent);
  };

  const updateConsent = (newConsent: Partial<CookieConsent>) => {
    const updatedConsent: CookieConsent = {
      ...DEFAULT_CONSENT,
      ...consent,
      ...newConsent,
      essential: true // Essential ist immer true
    };
    
    setConsent(updatedConsent);
    setHasConsent(true);
    setShowBanner(false);
    setShowPreferencesDialog(false);
    storeConsent(updatedConsent);
    
    // Lade oder entferne Scripts basierend auf neuer Einwilligung
    loadAnalyticsScripts(updatedConsent);
  };

  const showPreferencesDialog = () => {
    setShowPreferencesDialog(true);
  };

  const hidePreferencesDialog = () => {
    setShowPreferencesDialog(false);
  };

  const resetConsent = () => {
    localStorage.removeItem(CONSENT_STORAGE_KEY);
    setConsent(null);
    setHasConsent(false);
    setShowBanner(true);
    setShowPreferencesDialog(false);
    
    // Reset Google Consent Mode
    updateGoogleConsentMode(DEFAULT_CONSENT);
  };

  const getConsentString = (): string => {
    if (!consent) return '';
    
    return Object.entries(consent)
      .filter(([key, value]) => value === true)
      .map(([key]) => key)
      .join(',');
  };

  const isConsentGiven = (category: keyof CookieConsent): boolean => {
    return consent?.[category] === true;
  };

  // Google Consent Mode v2 Integration
  const updateGoogleConsentMode = (consentData: CookieConsent) => {
    // Nur ausführen wenn gtag verfügbar ist
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        'analytics_storage': consentData.analytics ? 'granted' : 'denied',
        'ad_storage': consentData.marketing ? 'granted' : 'denied',
        'ad_user_data': consentData.marketing ? 'granted' : 'denied',
        'ad_personalization': consentData.marketing ? 'granted' : 'denied',
        'functionality_storage': consentData.preferences ? 'granted' : 'denied',
        'personalization_storage': consentData.preferences ? 'granted' : 'denied',
        'security_storage': 'granted' // Essential ist immer granted
      });
      
      console.log('🔄 Google Consent Mode aktualisiert:', consentData);
    }
  };

  // Analytics und Marketing Scripts laden
  const loadAnalyticsScripts = (consentData: CookieConsent) => {
    // Google Analytics
    if (consentData.analytics && !document.querySelector('#google-analytics')) {
      const script = document.createElement('script');
      script.id = 'google-analytics';
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID';
      document.head.appendChild(script);
      
      script.onload = () => {
        (window as any).dataLayer = (window as any).dataLayer || [];
        function gtag(...args: any[]) {
          (window as any).dataLayer.push(args);
        }
        (window as any).gtag = gtag;
        
        gtag('js', new Date());
        gtag('config', 'GA_MEASUREMENT_ID', {
          page_title: document.title,
          page_location: window.location.href
        });
        
        console.log('📊 Google Analytics geladen');
      };
    }
    
    // Hotjar (falls Analytics erlaubt)
    if (consentData.analytics && !document.querySelector('#hotjar-script')) {
      const script = document.createElement('script');
      script.id = 'hotjar-script';
      script.innerHTML = `
        (function(h,o,t,j,a,r){
          h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
          h._hjSettings={hjid:YOUR_HOTJAR_ID,hjsv:6};
          a=o.getElementsByTagName('head')[0];
          r=o.createElement('script');r.async=1;
          r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
          a.appendChild(r);
        })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
      `;
      document.head.appendChild(script);
      console.log('🔥 Hotjar geladen');
    }
    
    // Facebook Pixel (falls Marketing erlaubt)
    if (consentData.marketing && !document.querySelector('#facebook-pixel')) {
      const script = document.createElement('script');
      script.id = 'facebook-pixel';
      script.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', 'YOUR_PIXEL_ID');
        fbq('track', 'PageView');
      `;
      document.head.appendChild(script);
      console.log('📘 Facebook Pixel geladen');
    }
  };

  return (
    <CookieConsentContext.Provider value={{
      consent,
      hasConsent,
      showBanner,
      showPreferences,
      acceptAll,
      acceptEssential,
      updateConsent,
      showPreferencesDialog,
      hidePreferencesDialog,
      resetConsent,
      getConsentString,
      isConsentGiven
    }}>
      {children}
    </CookieConsentContext.Provider>
  );
}