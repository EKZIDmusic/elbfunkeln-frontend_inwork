import { useState } from 'react';
import { motion } from 'motion/react';
import { Mail } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import apiService from '../services/apiService';
import { toast } from 'sonner@2.0.3';

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      await apiService.newsletter.subscribe({ email });
      
      setIsSubscribed(true);
      toast.success('Newsletter-Anmeldung erfolgreich!', {
        description: 'Du erhältst ab jetzt unsere neuesten Updates.'
      });
      
      setTimeout(() => {
        setIsSubscribed(false);
        setEmail('');
      }, 5000);
    } catch (error: any) {
      console.error('Newsletter subscription failed:', error);
      toast.error('Anmeldung fehlgeschlagen', {
        description: error.message || 'Bitte versuche es später erneut.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <Card className="bg-gradient-to-br from-white to-elbfunkeln-beige/20 shadow-lg border-0 p-6">
            {!isSubscribed ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Mail className="w-5 h-5 text-elbfunkeln-green" />
                    <h3 className="font-cormorant text-elbfunkeln-green">
                      Newsletter
                    </h3>
                  </div>
                  <p className="font-inter text-elbfunkeln-green/70 leading-relaxed">
                    Bleib auf dem Laufenden über neue Kollektionen, Geschichten aus unserem Atelier 
                    und exklusive Einblicke in die Welt der Drahtkunst.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                      type="email"
                      placeholder="deine@email.de"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-white border-elbfunkeln-green/30 focus:border-elbfunkeln-green"
                      required
                    />
                    <Button 
                      type="submit"
                      disabled={isLoading}
                      className="w-full sm:w-auto bg-elbfunkeln-green text-white hover:bg-elbfunkeln-green/90 hover:scale-105 active:scale-95 transition-all duration-200 py-3 px-6 disabled:opacity-50"
                    >
                      {isLoading ? 'Wird angemeldet...' : 'Anmelden'}
                    </Button>
                  </div>
                </form>
                
                <p className="text-xs text-elbfunkeln-green/50 font-inter">
                  Jederzeit abmeldbar. Datenschutz ist uns wichtig.
                </p>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-4"
              >
                <div className="text-4xl mb-2">✓</div>
                <h3 className="font-cormorant text-elbfunkeln-green mb-2">
                  Vielen Dank!
                </h3>
                <p className="font-inter text-elbfunkeln-green/70">
                  Du wurdest erfolgreich für unseren Newsletter angemeldet.
                </p>
              </motion.div>
            )}
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
