// Analytics Configuration - Client-side environment variables
interface AnalyticsConfig {
  GA_MEASUREMENT_ID?: string;
  FB_PIXEL_ID?: string;
  HOTJAR_ID?: string;
}

// Client-side analytics configuration
// Diese können später über Admin-Panel oder Environment-Variablen gesetzt werden
const getAnalyticsConfig = (): AnalyticsConfig => {
  // Versuche aus localStorage zu laden (für Admin-konfigurierte Werte)
  try {
    const stored = localStorage.getItem('elbfunkeln:analytics-config');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn('Could not load analytics config from localStorage');
  }

  // Fallback zu Demo/Development IDs (können später entfernt werden)
  return {
    GA_MEASUREMENT_ID: undefined, // 'G-XXXXXXXXXX'
    FB_PIXEL_ID: undefined, // '1234567890'
    HOTJAR_ID: undefined // '3456789'
  };
};

// Analytics Initialization - Safe setup für Google Analytics und Facebook Pixel
export function initializeAnalytics() {
  if (typeof window === 'undefined') return;

  const config = getAnalyticsConfig();

  // Google Analytics Setup
  const GA_MEASUREMENT_ID = config.GA_MEASUREMENT_ID;
  if (GA_MEASUREMENT_ID && GA_MEASUREMENT_ID.startsWith('G-')) {
    (window as any).GA_MEASUREMENT_ID = GA_MEASUREMENT_ID;
    
    // Google Analytics 4 Script laden
    const gaScript = document.createElement('script');
    gaScript.async = true;
    gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(gaScript);

    // Google Analytics konfigurieren
    (window as any).dataLayer = (window as any).dataLayer || [];
    function gtag(...args: any[]) {
      (window as any).dataLayer.push(args);
    }
    (window as any).gtag = gtag;
    
    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID, {
      page_title: document.title,
      page_location: window.location.href
    });
    
    console.log('✅ Google Analytics initialized:', GA_MEASUREMENT_ID);
  } else {
    console.log('⚠️ Google Analytics ID not configured - tracking disabled');
  }

  // Facebook Pixel Setup
  const FB_PIXEL_ID = config.FB_PIXEL_ID;
  if (FB_PIXEL_ID && FB_PIXEL_ID.length > 5) {
    (window as any).FB_PIXEL_ID = FB_PIXEL_ID;
    
    // Facebook Pixel Script
    !(function(f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
      if (f.fbq) return;
      n = f.fbq = function() {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

    (window as any).fbq('init', FB_PIXEL_ID);
    (window as any).fbq('track', 'PageView');
    
    console.log('✅ Facebook Pixel initialized:', FB_PIXEL_ID);
  } else {
    console.log('⚠️ Facebook Pixel ID not configured - tracking disabled');
  }

  // Hotjar Setup
  const HOTJAR_ID = config.HOTJAR_ID;
  if (HOTJAR_ID && HOTJAR_ID.length > 3) {
    (function(h: any, o: any, t: any, j: any, a?: any, r?: any) {
      h.hj = h.hj || function() {
        (h.hj.q = h.hj.q || []).push(arguments);
      };
      h._hjSettings = { hjid: parseInt(HOTJAR_ID), hjsv: 6 };
      a = o.getElementsByTagName('head')[0];
      r = o.createElement('script');
      r.async = 1;
      r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;
      a.appendChild(r);
    })(window, document, 'https://static.hotjar.com/c/hotjar-', '.js?sv=');
    
    console.log('✅ Hotjar initialized:', HOTJAR_ID);
  } else {
    console.log('⚠️ Hotjar ID not configured - tracking disabled');
  }
}

// Hilfsfunktion zum Setzen der Analytics-Konfiguration (für Admin-Panel)
export function setAnalyticsConfig(config: AnalyticsConfig) {
  try {
    localStorage.setItem('elbfunkeln:analytics-config', JSON.stringify(config));
    console.log('📊 Analytics configuration saved');
    return true;
  } catch (e) {
    console.error('Failed to save analytics configuration:', e);
    return false;
  }
}

// Hilfsfunktion zum Laden der aktuellen Konfiguration
export function getCurrentAnalyticsConfig(): AnalyticsConfig {
  return getAnalyticsConfig();
}

// Safe initialization function mit Error Handling
export function safeInitializeAnalytics() {
  try {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initializeAnalytics);
    } else {
      initializeAnalytics();
    }
  } catch (error) {
    console.error('Analytics initialization error:', error);
  }
}