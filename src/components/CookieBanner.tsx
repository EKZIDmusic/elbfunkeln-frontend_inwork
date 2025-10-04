import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cookie, Settings, X, Check, Info, Shield, BarChart, Target, User } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { useCookieConsent, CookieConsent } from './CookieConsentContext';

export function CookieBanner() {
  const {
    showBanner,
    showPreferences,
    acceptAll,
    acceptEssential,
    updateConsent,
    showPreferencesDialog,
    hidePreferencesDialog,
    consent
  } = useCookieConsent();

  const [tempConsent, setTempConsent] = useState<CookieConsent>({
    essential: true,
    analytics: false,
    marketing: false,
    preferences: false
  });

  const handleSavePreferences = () => {
    updateConsent(tempConsent);
  };

  const cookieCategories = [
    {
      key: 'essential' as keyof CookieConsent,
      title: 'Essenziell',
      description: 'Diese Cookies sind für das Funktionieren der Website erforderlich und können nicht deaktiviert werden.',
      icon: Shield,
      required: true,
      examples: 'Anmeldung, Warenkorb, Sicherheit'
    },
    {
      key: 'analytics' as keyof CookieConsent,
      title: 'Statistik',
      description: 'Diese Cookies helfen uns zu verstehen, wie Besucher mit unserer Website interagieren.',
      icon: BarChart,
      required: false,
      examples: 'Google Analytics, Hotjar, Seitenabrufe'
    },
    {
      key: 'marketing' as keyof CookieConsent,
      title: 'Marketing',
      description: 'Diese Cookies werden verwendet, um relevante Werbung anzuzeigen und Marketing-Kampagnen zu messen.',
      icon: Target,
      required: false,
      examples: 'Google Ads, Facebook Pixel, Remarketing'
    },
    {
      key: 'preferences' as keyof CookieConsent,
      title: 'Einstellungen',
      description: 'Diese Cookies speichern Ihre Präferenzen und personalisieren Ihr Erlebnis.',
      icon: User,
      required: false,
      examples: 'Sprache, Design-Präferenzen, Favoriten'
    }
  ];

  return (
    <>
      {/* Cookie Banner */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed bottom-0 left-0 right-0 z-50 p-4"
          >
            <Card className="mx-auto max-w-4xl bg-white border border-elbfunkeln-rose/20 shadow-lg">
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-elbfunkeln-beige/50 rounded-full flex items-center justify-center">
                      <Cookie className="w-6 h-6 text-elbfunkeln-green" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-cormorant text-lg text-elbfunkeln-green mb-2">
                      🍪 Cookies & Datenschutz
                    </h3>
                    <p className="text-sm text-elbfunkeln-green/80 mb-4">
                      Wir verwenden Cookies, um Ihnen das bestmögliche Erlebnis auf unserer Website zu bieten. 
                      Einige Cookies sind essenziell für das Funktionieren der Seite, während andere uns helfen, 
                      die Website zu verbessern und Ihnen relevante Inhalte zu zeigen.
                    </p>
                    
                    {/* Compact Cookie Categories Preview */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {cookieCategories.map(category => {
                        const Icon = category.icon;
                        return (
                          <div
                            key={category.key}
                            className="flex items-center gap-1 px-2 py-1 bg-elbfunkeln-beige/30 rounded-full text-xs"
                          >
                            <Icon className="w-3 h-3 text-elbfunkeln-green" />
                            <span className="text-elbfunkeln-green/80">{category.title}</span>
                            {category.required && (
                              <span className="text-elbfunkeln-rose">*</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={acceptAll}
                        className="bg-elbfunkeln-green text-white hover:bg-elbfunkeln-green/90 flex-1"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Alle akzeptieren
                      </Button>
                      
                      <Button
                        onClick={acceptEssential}
                        variant="outline"
                        className="border-elbfunkeln-rose/30 text-elbfunkeln-green hover:bg-elbfunkeln-beige/20 flex-1"
                      >
                        Nur essenzielle
                      </Button>
                      
                      <Button
                        onClick={showPreferencesDialog}
                        variant="outline"
                        className="border-elbfunkeln-green/30 text-elbfunkeln-green hover:bg-elbfunkeln-green/10"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Einstellungen
                      </Button>
                    </div>
                    
                    <p className="text-xs text-elbfunkeln-green/60 mt-3">
                      Weitere Informationen finden Sie in unserer{' '}
                      <a href="/privacy" className="underline hover:text-elbfunkeln-rose">
                        Datenschutzerklärung
                      </a>
                      .
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cookie Preferences Dialog */}
      <AnimatePresence>
        {showPreferences && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                hidePreferencesDialog();
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-hidden"
            >
              <Card className="bg-white">
                <div className="p-6 border-b border-elbfunkeln-rose/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-elbfunkeln-beige/50 rounded-full flex items-center justify-center">
                        <Settings className="w-5 h-5 text-elbfunkeln-green" />
                      </div>
                      <div>
                        <h2 className="font-cormorant text-xl text-elbfunkeln-green">
                          Cookie-Einstellungen
                        </h2>
                        <p className="text-sm text-elbfunkeln-green/70">
                          Wählen Sie, welche Cookies Sie zulassen möchten
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={hidePreferencesDialog}
                      variant="ghost"
                      size="sm"
                      className="text-elbfunkeln-rose hover:bg-elbfunkeln-rose/10"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
                
                <div className="max-h-[60vh] overflow-y-auto p-6">
                  <div className="space-y-6">
                    {cookieCategories.map((category) => {
                      const Icon = category.icon;
                      const isChecked = tempConsent[category.key];
                      
                      return (
                        <div key={category.key} className="border border-elbfunkeln-rose/10 rounded-lg p-4">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 bg-elbfunkeln-beige/30 rounded-full flex items-center justify-center">
                                <Icon className="w-5 h-5 text-elbfunkeln-green" />
                              </div>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="font-medium text-elbfunkeln-green">
                                  {category.title}
                                  {category.required && (
                                    <span className="text-elbfunkeln-rose ml-1">*</span>
                                  )}
                                </h3>
                                
                                <Checkbox
                                  checked={isChecked}
                                  disabled={category.required}
                                  onChange={(checked) => {
                                    if (!category.required) {
                                      setTempConsent(prev => ({
                                        ...prev,
                                        [category.key]: checked
                                      }));
                                    }
                                  }}
                                />
                              </div>
                              
                              <p className="text-sm text-elbfunkeln-green/80 mb-2">
                                {category.description}
                              </p>
                              
                              <div className="flex items-center gap-2 text-xs text-elbfunkeln-green/60">
                                <Info className="w-3 h-3" />
                                <span>Beispiele: {category.examples}</span>
                              </div>
                              
                              {category.required && (
                                <p className="text-xs text-elbfunkeln-rose mt-1">
                                  * Diese Cookies sind erforderlich und können nicht deaktiviert werden.
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="mt-6 p-4 bg-elbfunkeln-beige/20 rounded-lg">
                    <h4 className="font-medium text-elbfunkeln-green mb-2">
                      💡 Warum verwenden wir Cookies?
                    </h4>
                    <ul className="text-sm text-elbfunkeln-green/80 space-y-1">
                      <li>• Sicherstellung der Website-Funktionalität</li>
                      <li>• Verbesserung der Benutzererfahrung</li>
                      <li>• Bereitstellung relevanter Inhalte</li>
                      <li>• Analyse der Website-Nutzung</li>
                    </ul>
                  </div>
                </div>
                
                <div className="p-6 border-t border-elbfunkeln-rose/10">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={handleSavePreferences}
                      className="bg-elbfunkeln-green text-white hover:bg-elbfunkeln-green/90 flex-1"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Einstellungen speichern
                    </Button>
                    
                    <Button
                      onClick={() => {
                        setTempConsent({
                          essential: true,
                          analytics: true,
                          marketing: true,
                          preferences: true
                        });
                        handleSavePreferences();
                      }}
                      variant="outline"
                      className="border-elbfunkeln-rose/30 text-elbfunkeln-green hover:bg-elbfunkeln-beige/20"
                    >
                      Alle akzeptieren
                    </Button>
                    
                    <Button
                      onClick={hidePreferencesDialog}
                      variant="ghost"
                      className="text-elbfunkeln-green/70 hover:bg-elbfunkeln-green/10"
                    >
                      Abbrechen
                    </Button>
                  </div>
                  
                  <p className="text-xs text-elbfunkeln-green/60 mt-3 text-center">
                    Sie können Ihre Einstellungen jederzeit in der{' '}
                    <a href="/privacy" className="underline hover:text-elbfunkeln-rose">
                      Datenschutzerklärung
                    </a>
                    {' '}ändern.
                  </p>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}