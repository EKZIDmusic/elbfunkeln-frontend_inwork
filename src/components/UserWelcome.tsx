import { motion } from 'motion/react';
import { UserPlus, Heart, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { useRouter } from './Router';
import { useAuth } from './AuthContext';

export function UserWelcome() {
  const { navigateTo } = useRouter();
  const { isLoggedIn, user } = useAuth();

  if (isLoggedIn()) {
    return (
      <section className="py-12 bg-gradient-to-r from-elbfunkeln-beige/30 via-white to-elbfunkeln-lavender/20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
              <div className="p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="inline-block mb-4"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-elbfunkeln-lavender to-elbfunkeln-rose rounded-full flex items-center justify-center mx-auto shadow-lg">
                    <Heart className="w-8 h-8 text-white fill-white" />
                  </div>
                </motion.div>
                
                <h2 className="font-cormorant text-3xl text-elbfunkeln-green mb-4">
                  Willkommen zurück, {user?.name?.split(' ')[0] || 'lieber Kunde'}! 💎
                </h2>
                
                <p className="font-inter text-lg text-elbfunkeln-green/80 mb-6">
                  Wir freuen uns, dass du wieder da bist. Entdecke unsere neuesten handgefertigten Schmuckstücke 
                  oder besuche dein Kundenkonto für exklusive Angebote.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={() => navigateTo('shop')}
                    className="bg-gradient-to-r from-elbfunkeln-lavender to-elbfunkeln-rose text-white hover:from-elbfunkeln-rose hover:to-elbfunkeln-lavender px-6"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Neue Kollektionen entdecken
                  </Button>
                  <Button
                    onClick={() => navigateTo('account')}
                    variant="outline"
                    className="border-elbfunkeln-lavender text-elbfunkeln-green hover:bg-elbfunkeln-lavender hover:text-white px-6"
                  >
                    Mein Konto besuchen
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-gradient-to-r from-elbfunkeln-beige/30 via-white to-elbfunkeln-lavender/20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
            <div className="grid md:grid-cols-2 gap-8 p-8">
              {/* Left Content */}
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-elbfunkeln-lavender/20 p-2 rounded-full">
                      <UserPlus className="w-6 h-6 text-elbfunkeln-green" />
                    </div>
                    <h2 className="font-cormorant text-3xl text-elbfunkeln-green">
                      Werde Teil der Familie! ✨
                    </h2>
                  </div>
                  
                  <p className="font-inter text-lg text-elbfunkeln-green/80 leading-relaxed">
                    Erstelle dein kostenloses Konto und genieße exklusive Vorteile als Teil der Elbfunkeln-Community.
                  </p>
                </motion.div>

                {/* Benefits */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  viewport={{ once: true }}
                  className="space-y-3"
                >
                  {[
                    { icon: Heart, text: 'Persönliche Wunschliste für deine Lieblingsstücke 💕' },
                    { icon: Sparkles, text: 'Exklusive Vorab-Einblicke in neue Kollektionen ✨' },
                    { icon: UserPlus, text: 'Schnellere Bestellabwicklung & Bestellhistorie 📦' }
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <benefit.icon className="w-5 h-5 text-elbfunkeln-lavender" />
                      <span className="font-inter text-sm text-elbfunkeln-green/80">
                        {benefit.text}
                      </span>
                    </div>
                  ))}
                </motion.div>
              </div>

              {/* Right Content - CTA */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                className="flex flex-col justify-center space-y-6"
              >
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    viewport={{ once: true }}
                    className="inline-block mb-4"
                  >
                    <div className="w-20 h-20 bg-gradient-to-br from-elbfunkeln-lavender to-elbfunkeln-rose rounded-full flex items-center justify-center mx-auto shadow-lg">
                      <UserPlus className="w-10 h-10 text-white" />
                    </div>
                  </motion.div>
                  
                  <h3 className="font-cormorant text-2xl text-elbfunkeln-green mb-4">
                    Kostenlos registrieren
                  </h3>
                  
                  <p className="font-inter text-sm text-elbfunkeln-green/70 mb-6">
                    Nur wenige Schritte zu deinem persönlichen Schmuck-Erlebnis
                  </p>
                </div>
                
                <div className="space-y-3">
                  <Button
                    onClick={() => navigateTo('register')}
                    className="w-full bg-gradient-to-r from-elbfunkeln-lavender to-elbfunkeln-rose text-white hover:from-elbfunkeln-rose hover:to-elbfunkeln-lavender py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <UserPlus className="w-5 h-5 mr-2" />
                    Jetzt kostenlos registrieren
                  </Button>
                  
                  <p className="text-center text-xs text-elbfunkeln-green/60">
                    Bereits ein Konto?{' '}
                    <button
                      onClick={() => navigateTo('login')}
                      className="text-elbfunkeln-lavender hover:text-elbfunkeln-rose underline font-medium"
                    >
                      Hier anmelden
                    </button>
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-4 right-4 text-elbfunkeln-lavender/30 text-6xl">
              ✨
            </div>
            <div className="absolute bottom-4 left-4 text-elbfunkeln-rose/30 text-4xl">
              💎
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}