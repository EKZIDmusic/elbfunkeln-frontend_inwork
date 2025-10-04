import { motion } from 'motion/react';
import { AlertTriangle, RefreshCw, Home, Mail, Wrench, Zap } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { useRouter } from '../components/Router';
import { useState } from 'react';

export function ServerErrorPage() {
  const { navigateTo } = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gradient-to-br from-elbfunkeln-beige via-elbfunkeln-rose/10 to-elbfunkeln-lavender/20">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          {/* Animated Error Icon */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
          >
            <div className="relative inline-block">
              {/* Main Error Icon */}
              <motion.div
                className="w-32 h-32 mx-auto mb-4 relative"
                animate={{ 
                  rotate: [0, -5, 5, -5, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{ 
                  rotate: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                  scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                }}
              >
                <div className="w-full h-full bg-gradient-to-br from-elbfunkeln-rose to-elbfunkeln-lavender rounded-full flex items-center justify-center shadow-lg">
                  <AlertTriangle className="w-16 h-16 text-white" />
                </div>
              </motion.div>
              
              {/* Floating Tools */}
              {[Wrench, Zap, RefreshCw].map((Icon, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  style={{
                    left: `${20 + (i * 25)}%`,
                    top: `${15 + (i % 2) * 50}%`,
                  }}
                  animate={{
                    y: [-15, 15, -15],
                    opacity: [0.3, 0.8, 0.3],
                    rotate: [0, 360]
                  }}
                  transition={{
                    duration: 3 + (i * 0.5),
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.3
                  }}
                >
                  <Icon className="w-5 h-5 text-elbfunkeln-green" />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Error Message */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h1 className="font-cormorant text-6xl md:text-8xl text-elbfunkeln-green mb-4">
              500
            </h1>
            <h2 className="font-cormorant text-2xl md:text-3xl text-elbfunkeln-green mb-4">
              Serverprobleme
            </h2>
            <p className="text-lg text-elbfunkeln-green/80 mb-2">
              Unser Server ist gerade so verwirrt wie ein Draht ohne Form –
            </p>
            <p className="text-lg text-elbfunkeln-green/80">
              aber wir arbeiten bereits daran, alles wieder in Ordnung zu bringen!
            </p>
          </motion.div>

          {/* Status Information */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="p-6 border-elbfunkeln-rose/20 bg-white/80 backdrop-blur-sm">
              <h3 className="font-cormorant text-lg text-elbfunkeln-green mb-4">
                Was ist passiert?
              </h3>
              <div className="space-y-3 text-sm text-elbfunkeln-green/80">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-elbfunkeln-rose rounded-full"></div>
                  <span>Ein technisches Problem ist aufgetreten</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-elbfunkeln-lavender rounded-full"></div>
                  <span>Unser Team wurde automatisch benachrichtigt</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-elbfunkeln-green rounded-full"></div>
                  <span>Wir arbeiten an einer schnellen Lösung</span>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Suggestion Cards */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card className="p-6 border-elbfunkeln-rose/20 hover:border-elbfunkeln-green/50 transition-colors cursor-pointer group">
              <div 
                className="text-center"
                onClick={handleRefresh}
              >
                <div className="w-12 h-12 bg-elbfunkeln-beige/50 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-elbfunkeln-green/20 transition-colors">
                  <RefreshCw className={`w-6 h-6 text-elbfunkeln-green ${isRefreshing ? 'animate-spin' : ''}`} />
                </div>
                <h3 className="font-cormorant text-lg text-elbfunkeln-green mb-2">
                  Seite neu laden
                </h3>
                <p className="text-sm text-elbfunkeln-green/70">
                  Manchmal hilft ein einfacher Neustart
                </p>
              </div>
            </Card>

            <Card className="p-6 border-elbfunkeln-rose/20 hover:border-elbfunkeln-green/50 transition-colors cursor-pointer group">
              <div 
                className="text-center"
                onClick={() => navigateTo('contact')}
              >
                <div className="w-12 h-12 bg-elbfunkeln-beige/50 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-elbfunkeln-green/20 transition-colors">
                  <Mail className="w-6 h-6 text-elbfunkeln-green" />
                </div>
                <h3 className="font-cormorant text-lg text-elbfunkeln-green mb-2">
                  Problem melden
                </h3>
                <p className="text-sm text-elbfunkeln-green/70">
                  Lassen Sie uns wissen, was schiefgelaufen ist
                </p>
              </div>
            </Card>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Button
              onClick={() => navigateTo('home')}
              className="bg-elbfunkeln-green text-white hover:bg-elbfunkeln-green/90 hover:scale-105 active:scale-95 transition-all duration-300"
            >
              <Home className="w-4 h-4 mr-2" />
              Zur Startseite
            </Button>
            
            <Button
              onClick={handleRefresh}
              variant="outline"
              disabled={isRefreshing}
              className="border-elbfunkeln-rose/30 text-elbfunkeln-green hover:bg-elbfunkeln-rose/10 hover:scale-105 active:scale-95 transition-all duration-300"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Lädt...' : 'Erneut versuchen'}
            </Button>
          </motion.div>

          {/* Progress Indicator */}
          <motion.div
            className="mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
          >
            <div className="bg-elbfunkeln-beige/50 rounded-full h-2 w-full max-w-md mx-auto overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-elbfunkeln-green to-elbfunkeln-lavender"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              />
            </div>
            <p className="text-xs text-elbfunkeln-green/60 mt-2">
              Automatische Wiederherstellung läuft...
            </p>
          </motion.div>

          {/* Additional Information */}
          <motion.div
            className="mt-12 pt-8 border-t border-elbfunkeln-rose/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.2 }}
          >
            <h4 className="font-cormorant text-lg text-elbfunkeln-green mb-4">
              Warum passiert das?
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-elbfunkeln-green/70">
              <div className="text-center">
                <div className="w-8 h-8 bg-elbfunkeln-beige/50 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Zap className="w-4 h-4 text-elbfunkeln-green" />
                </div>
                <p>Hohe Serverauslastung</p>
              </div>
              
              <div className="text-center">
                <div className="w-8 h-8 bg-elbfunkeln-beige/50 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Wrench className="w-4 h-4 text-elbfunkeln-green" />
                </div>
                <p>Wartungsarbeiten</p>
              </div>
              
              <div className="text-center">
                <div className="w-8 h-8 bg-elbfunkeln-beige/50 rounded-full flex items-center justify-center mx-auto mb-2">
                  <RefreshCw className="w-4 h-4 text-elbfunkeln-green" />
                </div>
                <p>Temporäre Störung</p>
              </div>
            </div>

            <div className="mt-6 text-xs text-elbfunkeln-green/50">
              <p>Fehler-ID: ELB-{Date.now().toString().slice(-8)}</p>
              <p>Zeitpunkt: {new Date().toLocaleString('de-DE')}</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Background Animation */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute opacity-5"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-30, 30, -30],
              x: [-20, 20, -20],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 15 + (i * 3),
              repeat: Infinity,
              ease: "linear",
              delay: i * 0.8
            }}
          >
            <AlertTriangle className="w-20 h-20 text-elbfunkeln-rose" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}