import { motion } from 'motion/react';
import { Heart, Award, Users, Clock, Mail, MapPin, Phone } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useRouter } from '../components/Router';
import { elbfunkelnService } from '../services/elbfunkelnService';
import { useState } from 'react';

const teamMembers = [
  {
    name: 'Anna Schmidt',
    role: 'Gründerin & Chefdesignerin 🎨',
    image: 'https://images.unsplash.com/photo-1659032882703-f1e4983fe1b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2Z0JTIwamV3ZWxyeSUyMHdvcmtzcGFjZSUyMGNyYWZ0aW5nfGVufDF8fHx8MTc1NjA3NTk4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    description: 'Mit über 15 Jahren Erfahrung in der Schmuckherstellung bringt Anna ihre Leidenschaft für Drahtkunst in jedes Stück ein.'
  },
  {
    name: 'Marie Weber',
    role: 'Handwerksmeisterin ✨',
    image: 'https://images.unsplash.com/photo-1712828001446-0c3cef1f4e9a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYW5kbWFkZSUyMHdpcmUlMjBqZXdlbHJ5JTIwZWxlZ2FudHxlbnwxfHx8fDE3NTc2MDc1ODh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    description: 'Marie perfektioniert jede Technik und sorgt dafür, dass jedes Schmuckstück den höchsten Qualitätsstandards entspricht.'
  },
  {
    name: 'Lisa Müller',
    role: 'Kundenbetreuung 💝',
    image: 'https://images.unsplash.com/photo-1646222852531-51bd0de47a83?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZWxpY2F0ZSUyMGdvbGQlMjB3aXJlJTIwZWFycmluZ3N8ZW58MXx8fHwxNzU3NjA3NTkxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    description: 'Lisa hilft dir dabei, das perfekte Schmuckstück zu finden und steht dir mit persönlicher Beratung zur Seite.'
  }
];

const milestones = [
  { year: '2018', event: 'Gründung von Elbfunkeln in Hamburg 🏙️' },
  { year: '2019', event: 'Erste Online-Kollektion mit 12 Designs 🌟' },
  { year: '2020', event: 'Expansion der Produktlinie auf über 50 Artikel ✨' },
  { year: '2021', event: 'Auszeichnung "Hamburger Handwerkskunst" 🏆' },
  { year: '2022', event: 'Eröffnung des Ateliers für Workshops 🎨' },
  { year: '2023', event: 'Über 1000 zufriedene Kunden weltweit 🌍' },
  { year: '2024', event: 'Neue nachhaltige Materialkollektion 🌱' }
];

export function AboutPage() {
  const { navigateTo } = useRouter();
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const success = await elbfunkelnService.subscribeToNewsletter({
        email,
        first_name: firstName,
        source: 'about-page'
      });

      if (success) {
        setIsSubscribed(true);
        setTimeout(() => {
          setIsSubscribed(false);
          setEmail('');
          setFirstName('');
        }, 5000);
      }
    } catch (error) {
      console.error('Newsletter subscription failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="font-cormorant text-4xl md:text-6xl text-elbfunkeln-green mb-6">
            Über Elbfunkeln
          </h1>
          <p className="font-inter text-xl text-elbfunkeln-green/80 max-w-3xl mx-auto leading-relaxed">
            Seit 2018 erschaffen wir in Hamburg einzigartige Schmuckstücke aus Draht. 
            Jedes Stück erzählt eine Geschichte von Handwerkskunst, Leidenschaft und 
            der Schönheit des Einfachen.
          </p>
        </motion.div>

        {/* Story Section */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="font-cormorant text-3xl md:text-4xl text-elbfunkeln-green mb-6">
              Unsere Geschichte 📖
            </h2>
            <div className="space-y-4 font-inter text-elbfunkeln-green/80 leading-relaxed">
              <p>
                Alles begann 2018 in einer kleinen Werkstatt an der Elbe. Anna Schmidt, 
                eine leidenschaftliche Goldschmiedin, entdeckte ihre Liebe zur Drahtkunst 
                während eines Workshops in Italien. Die Einfachheit und gleichzeitige 
                Eleganz dieser jahrhundertealten Technik faszinierte sie sofort.
              </p>
              <p>
                Zurück in Hamburg experimentierte Anna mit verschiedenen Drähten und 
                Techniken, bis sie ihren einzigartigen Stil entwickelte. Die ersten 
                Schmuckstücke entstanden für Freunde und Familie - doch die Begeisterung 
                war so groß, dass schnell der Wunsch nach mehr aufkam.
              </p>
              <p>
                Heute ist Elbfunkeln ein Team von talentierten Handwerkern, die 
                gemeinsam die Tradition der Drahtkunst in die moderne Zeit tragen. 
                Jedes Schmuckstück wird nach wie vor von Hand gefertigt und ist ein 
                Unikat - genau wie die Person, die es trägt.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1659032882703-f1e4983fe1b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2Z0JTIwamV3ZWxyeSUyMHdvcmtzcGFjZSUyMGNyYWZ0aW5nfGVufDF8fHx8MTc1NzYwNzU5OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Elbfunkeln Werkstatt"
                className="w-full h-96 object-cover"
              />
            </div>
            
            {/* Decorative Elements */}
            <motion.div
              className="absolute -top-6 -right-6 w-24 h-24 bg-elbfunkeln-green/20 rounded-full"
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360]
              }}
              transition={{ 
                duration: 8,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </motion.div>
        </div>

        {/* Values Section */}
        <motion.div
          className="mb-24"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="font-cormorant text-3xl md:text-4xl text-elbfunkeln-green text-center mb-16">
            Unsere Werte 💎
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Heart,
                title: 'Handwerksliebe',
                description: 'Jedes Stück wird mit Hingabe und Sorgfalt von Hand gefertigt'
              },
              {
                icon: Award,
                title: 'Qualität',
                description: 'Nur die besten Materialien für langanhaltende Schönheit'
              },
              {
                icon: Users,
                title: 'Individualität',
                description: 'Einzigartige Designs für einzigartige Persönlichkeiten'
              },
              {
                icon: Clock,
                title: 'Tradition',
                description: 'Jahrhundertealte Techniken in modernem Design'
              }
            ].map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-8 text-center border-0 bg-gradient-to-br from-white to-elbfunkeln-beige/20 shadow-xl hover:shadow-2xl transition-all duration-300 h-full">
                  <div className="bg-elbfunkeln-green/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                    <value.icon className="w-8 h-8 text-elbfunkeln-green" />
                  </div>
                  <h3 className="font-cormorant text-xl text-elbfunkeln-green mb-4">
                    {value.title}
                  </h3>
                  <p className="font-inter text-elbfunkeln-green/70 leading-relaxed">
                    {value.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Team Section */}
        <motion.div
          className="mb-24"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="font-cormorant text-3xl md:text-4xl text-elbfunkeln-green text-center mb-16">
            Unser Team 👥
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <Card className="overflow-hidden border-0 bg-gradient-to-br from-white to-elbfunkeln-beige/20 shadow-xl hover:shadow-2xl transition-all duration-300 h-full">
                  <div className="relative h-64 overflow-hidden">
                    <ImageWithFallback
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-8">
                    <h3 className="font-cormorant text-xl text-elbfunkeln-green mb-3">
                      {member.name}
                    </h3>
                    <p className="font-inter text-elbfunkeln-green mb-4">
                      {member.role}
                    </p>
                    <p className="font-inter text-elbfunkeln-green/70 leading-relaxed">
                      {member.description}
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Newsletter Section */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Card className="max-w-2xl mx-auto p-6 border-0 shadow-lg bg-gradient-to-br from-white to-elbfunkeln-beige/20">
            {!isSubscribed ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Mail className="w-5 h-5 text-elbfunkeln-green" />
                    <h3 className="font-cormorant text-2xl text-elbfunkeln-green">
                      Newsletter ✨
                    </h3>
                  </div>
                  <p className="font-inter text-elbfunkeln-green/70 leading-relaxed">
                    Bleib auf dem Laufenden über neue Kollektionen, Geschichten aus unserem Atelier 
                    und exklusive Einblicke in die Welt der Drahtkunst.
                  </p>
                </div>

                <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                      type="text"
                      placeholder="Vorname (optional)"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="bg-white border-elbfunkeln-green/30 focus:border-elbfunkeln-green"
                    />
                    <Input
                      type="email"
                      placeholder="deine@email.de"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-white border-elbfunkeln-green/30 focus:border-elbfunkeln-green"
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full sm:w-auto bg-elbfunkeln-green text-white hover:bg-elbfunkeln-green/90 hover:scale-105 active:scale-95 transition-all duration-200 py-3 px-6 disabled:opacity-50"
                  >
                    {isLoading ? 'Wird angemeldet...' : 'Anmelden 💌'}
                  </Button>
                </form>
                
                <p className="text-xs text-elbfunkeln-green/50 font-inter">
                  Jederzeit abmeldbar. Datenschutz ist uns wichtig.
                </p>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-3"
              >
                <div className="text-3xl mb-2">✨</div>
                <h3 className="font-cormorant text-xl text-elbfunkeln-green">
                  Vielen Dank!
                </h3>
                <p className="font-inter text-sm text-elbfunkeln-green/70">
                  Du erhältst eine Bestätigung per E-Mail.
                </p>
              </motion.div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}