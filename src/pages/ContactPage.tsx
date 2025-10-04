import { useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, Phone, Mail, Clock, Send, MessageCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { elbfunkelnService } from '../services/elbfunkelnService';

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      return;
    }

    setIsLoading(true);
    try {
      const success = await elbfunkelnService.createContactInquiry({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message
      });

      if (success) {
        setIsSubmitted(true);
        setTimeout(() => {
          setIsSubmitted(false);
          setFormData({ name: '', email: '', subject: '', message: '' });
        }, 5000);
      }
    } catch (error) {
      console.error('Contact form submission failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen pt-24">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="font-cormorant text-4xl md:text-6xl text-elbfunkeln-green mb-6">
            Kontakt 💌
          </h1>
          <p className="font-inter text-xl text-elbfunkeln-green/80 max-w-3xl mx-auto leading-relaxed">
            Wir freuen uns auf deine Nachricht! Ob Fragen zu unseren Schmuckstücken, 
            individuelle Wünsche oder einfach ein nettes Gespräch - wir sind für dich da.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Form */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Card className="p-8 border-0 bg-gradient-to-br from-white to-elbfunkeln-beige/20 shadow-xl">
              <h2 className="font-cormorant text-2xl text-elbfunkeln-green mb-6">
                Schreib uns eine Nachricht ✨
              </h2>

              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name" className="font-inter text-elbfunkeln-green">
                        Name *
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="mt-1 border-elbfunkeln-green/30 focus:border-elbfunkeln-green bg-white"
                        placeholder="Dein Name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="font-inter text-elbfunkeln-green">
                        E-Mail *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="mt-1 border-elbfunkeln-green/30 focus:border-elbfunkeln-green bg-white"
                        placeholder="deine@email.de"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="subject" className="font-inter text-elbfunkeln-green">
                      Betreff
                    </Label>
                    <Select value={formData.subject} onValueChange={(value) => handleInputChange('subject', value)}>
                      <SelectTrigger className="mt-1 border-elbfunkeln-green/30 focus:border-elbfunkeln-green bg-white">
                        <SelectValue placeholder="Wähle ein Thema" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="product-question">Produktfrage 💍</SelectItem>
                        <SelectItem value="custom-order">Individueller Auftrag 🎨</SelectItem>
                        <SelectItem value="care-instructions">Pflegehinweise 🧼</SelectItem>
                        <SelectItem value="wholesale">Großhandel </SelectItem>
                        <SelectItem value="workshop">Workshop-Anfrage 👥</SelectItem>
                        <SelectItem value="feedback">Feedback 💬</SelectItem>
                        <SelectItem value="other">Sonstiges ✨</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="message" className="font-inter text-elbfunkeln-green">
                      Nachricht *
                    </Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      className="mt-1 border-elbfunkeln-green/30 focus:border-elbfunkeln-green min-h-32 bg-white"
                      placeholder="Erzähl uns, womit wir dir helfen können..."
                      required
                    />
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      type="submit"
                      disabled={isLoading}
                      className="w-full md:w-auto bg-gradient-to-r from-elbfunkeln-green to-elbfunkeln-rose text-white hover:from-elbfunkeln-rose hover:to-elbfunkeln-green py-3 rounded-full shadow-lg disabled:opacity-50"
                    >
                      <Send size={16} className="mr-2" />
                      {isLoading ? 'Wird gesendet...' : 'Nachricht senden'}
                    </Button>
                  </motion.div>

                  <p className="text-xs text-elbfunkeln-green/60 font-inter">
                    * Pflichtfelder. Wir behandeln deine Daten vertraulich und geben sie nicht weiter. 🔒
                  </p>
                </form>
              ) : (
                <motion.div
                  className="text-center py-12"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="text-6xl mb-4">🎉</div>
                  <h3 className="font-cormorant text-2xl text-elbfunkeln-green mb-4">
                    Vielen Dank!
                  </h3>
                  <p className="font-inter text-elbfunkeln-green/80">
                    Deine Nachricht ist bei uns angekommen. 
                    Wir melden uns innerhalb von 24 Stunden bei dir! ✨
                  </p>
                </motion.div>
              )}
            </Card>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {/* Contact Details */}
            <Card className="p-8 border-0 shadow-xl bg-gradient-to-br from-white to-elbfunkeln-beige/20 h-full">
              <h3 className="font-cormorant text-2xl text-elbfunkeln-green mb-6">
                Erreiche uns direkt 📞
              </h3>
              <div className="space-y-6">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-elbfunkeln-lavender mt-1 flex-shrink-0 animate-float-gentle" />
                  <div>
                    <div className="font-inter text-elbfunkeln-green mb-1">Adresse</div>
                    <div className="font-inter text-elbfunkeln-green/70">
                      Elbstraße 123<br />
                      20359 Hamburg<br />
                      Deutschland 🇩🇪
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-elbfunkeln-rose mt-1 flex-shrink-0 animate-float-gentle animate-delay-1" />
                  <div>
                    <div className="font-inter text-elbfunkeln-green mb-1">Telefon</div>
                    <a 
                      href="tel:+4940123456789"
                      className="font-inter text-elbfunkeln-green/70 hover:text-elbfunkeln-green transition-colors"
                    >
                      +49 40 123 456 789
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-elbfunkeln-green mt-1 flex-shrink-0 animate-float-gentle animate-delay-2" />
                  <div>
                    <div className="font-inter text-elbfunkeln-green mb-1">E-Mail</div>
                    <a 
                      href="mailto:hallo@elbfunkeln.de"
                      className="font-inter text-elbfunkeln-green/70 hover:text-elbfunkeln-green transition-colors"
                    >
                      hallo@elbfunkeln.de
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-elbfunkeln-beige mt-1 flex-shrink-0 animate-float-gentle animate-delay-3" />
                  <div>
                    <div className="font-inter text-elbfunkeln-green mb-1">Öffnungszeiten</div>
                    <div className="font-inter text-elbfunkeln-green/70 space-y-1">
                      <div>Mo-Fr: 10:00 - 18:00</div>
                      <div>Sa: 10:00 - 16:00</div>
                      <div>So: Geschlossen</div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}