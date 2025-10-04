import { motion } from 'motion/react';
import { Home, Search, ArrowLeft, Gem, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { useRouter } from '../components/Router';

export function NotFoundPage() {
  const { navigateTo } = useRouter();

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gradient-to-br from-elbfunkeln-beige via-elbfunkeln-lavender/20 to-elbfunkeln-rose/10">
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
              {/* Main Gem */}
              <motion.div
                className="w-32 h-32 mx-auto mb-4 relative"
                animate={{ 
                  rotateY: [0, 360],
                  scale: [1, 1.05, 1]
                }}
                transition={{ 
                  rotateY: { duration: 4, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }}
              >
                <Gem className="w-full h-full text-elbfunkeln-green" />
              </motion.div>
              
              {/* Floating Sparkles */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  style={{
                    left: `${20 + (i * 20)}%`,
                    top: `${10 + (i % 2) * 60}%`,
                  }}
                  animate={{
                    y: [-10, 10, -10],
                    opacity: [0.4, 1, 0.4],
                    scale: [0.8, 1.2, 0.8]
                  }}
                  transition={{
                    duration: 2 + (i * 0.3),
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.2
                  }}
                >
                  <Sparkles className="w-4 h-4 text-elbfunkeln-rose" />
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
              404
            </h1>
            <h2 className="font-cormorant text-2xl md:text-3xl text-elbfunkeln-green mb-4">
              Seite nicht gefunden
            </h2>
            <p className="text-lg text-elbfunkeln-green/80 mb-2">
              Diese Seite scheint so einzigartig zu sein wie unsere Schmuckstücke –
            </p>
            <p className="text-lg text-elbfunkeln-green/80">
              leider etwas <em>zu</em> einzigartig, denn sie existiert nicht.
            </p>
          </motion.div>

          {/* Suggestion Cards */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="p-6 border-elbfunkeln-rose/20 hover:border-elbfunkeln-green/50 transition-colors cursor-pointer group">
              <div 
                className="text-center"
                onClick={() => navigateTo('shop')}
              >
                <div className="w-12 h-12 bg-elbfunkeln-beige/50 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-elbfunkeln-green/20 transition-colors">
                  <Gem className="w-6 h-6 text-elbfunkeln-green" />
                </div>
                <h3 className="font-cormorant text-lg text-elbfunkeln-green mb-2">
                  Schmuck entdecken
                </h3>
                <p className="text-sm text-elbfunkeln-green/70">
                  Stöbern Sie durch unsere handgefertigten Unikate
                </p>
              </div>
            </Card>

            <Card className="p-6 border-elbfunkeln-rose/20 hover:border-elbfunkeln-green/50 transition-colors cursor-pointer group">
              <div 
                className="text-center"
                onClick={() => navigateTo('search')}
              >
                <div className="w-12 h-12 bg-elbfunkeln-beige/50 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-elbfunkeln-green/20 transition-colors">
                  <Search className="w-6 h-6 text-elbfunkeln-green" />
                </div>
                <h3 className="font-cormorant text-lg text-elbfunkeln-green mb-2">
                  Suchen Sie etwas Bestimmtes?
                </h3>
                <p className="text-sm text-elbfunkeln-green/70">
                  Nutzen Sie unsere Suche, um das perfekte Stück zu finden
                </p>
              </div>
            </Card>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Button
              onClick={() => navigateTo('home')}
              className="bg-elbfunkeln-green text-white hover:bg-elbfunkeln-green/90 hover:scale-105 active:scale-95 transition-all duration-300"
            >
              <Home className="w-4 h-4 mr-2" />
              Zur Startseite
            </Button>
            
            <Button
              onClick={() => window.history.back()}
              variant="outline"
              className="border-elbfunkeln-rose/30 text-elbfunkeln-green hover:bg-elbfunkeln-rose/10 hover:scale-105 active:scale-95 transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück
            </Button>
          </motion.div>

          {/* Additional Help */}
          <motion.div
            className="mt-12 pt-8 border-t border-elbfunkeln-rose/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <p className="text-sm text-elbfunkeln-green/60 mb-4">
              Falls Sie weiterhin Probleme haben, kontaktieren Sie uns gerne:
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
              <button
                onClick={() => navigateTo('contact')}
                className="text-elbfunkeln-green hover:text-elbfunkeln-rose transition-colors"
              >
                📧 Kontakt aufnehmen
              </button>
              
              <span className="hidden sm:inline text-elbfunkeln-green/40">•</span>
              
              <a 
                href="mailto:info@elbfunkeln.de"
                className="text-elbfunkeln-green hover:text-elbfunkeln-rose transition-colors"
              >
                ✉️ info@elbfunkeln.de
              </a>
            </div>
          </motion.div>

          {/* Hidden Easter Egg */}
          <motion.div
            className="mt-8 opacity-20 hover:opacity-100 transition-opacity duration-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2 }}
            transition={{ duration: 1, delay: 2 }}
          >
            <p className="text-xs text-elbfunkeln-green/50">
              🕵️ Sie haben unser Easter Egg gefunden! Code: LOST404 für 4% Rabatt
            </p>
          </motion.div>
        </div>
      </div>

      {/* Background Decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute opacity-5"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              x: [-10, 10, -10],
              rotate: [0, 360]
            }}
            transition={{
              duration: 10 + (i * 2),
              repeat: Infinity,
              ease: "linear",
              delay: i * 0.5
            }}
          >
            <Gem className="w-16 h-16 text-elbfunkeln-green" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}