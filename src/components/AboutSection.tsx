import { motion } from 'motion/react';
import { Heart, Sparkles, Award, Users } from 'lucide-react';
import { Card } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';

const features = [
  {
    icon: Heart,
    title: 'Mit Liebe handgefertigt',
    description: 'Jedes Schmuckstück wird mit Hingabe und Sorgfalt in unserer Werkstatt kreiert.',
    color: 'elbfunkeln-rose'
  },
  {
    icon: Sparkles,
    title: 'Einzigartige Designs',
    description: 'Unsere Drahtkunst-Kollektionen sind einmalig und spiegeln deinen individuellen Stil wider.',
    color: 'elbfunkeln-lavender'
  },
  {
    icon: Award,
    title: 'Hochwertige Materialien 🏆',
    description: 'Wir verwenden nur die besten Drähte und Materialien für langanhaltende Schönheit.',
    color: 'elbfunkeln-green'
  },
  {
    icon: Users,
    title: 'Persönlicher Service 🤝',
    description: 'Unser Team berät dich gerne bei der Auswahl deines perfekten Schmuckstücks.',
    color: 'elbfunkeln-beige'
  }
];

export function AboutSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="font-cormorant text-4xl md:text-5xl text-elbfunkeln-green mb-6">
              Die Kunst des Drahtes 🎨
            </h2>
            <p className="font-inter text-lg text-elbfunkeln-green/80 mb-8 leading-relaxed">
              Willkommen bei Elbfunkeln! Seit 2018 kreieren wir einzigartige Schmuckstücke 
              aus Draht, die die Schönheit des Einfachen zelebrieren. Jedes Stück erzählt 
              eine Geschichte und wird mit traditionellen Techniken und modernem Design 
              von Hand gefertigt.
            </p>
            
            <div className="grid sm:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-4"
                >
                  <div className={`bg-${feature.color}/20 p-3 rounded-full animate-float-gentle`} style={{ animationDelay: `${index * 0.3}s` }}>
                    <feature.icon className={`w-6 h-6 text-${feature.color}`} />
                  </div>
                  <div>
                    <h3 className="font-cormorant text-xl text-elbfunkeln-green mb-2">
                      {feature.title}
                    </h3>
                    <p className="font-inter text-elbfunkeln-green/70 text-sm">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Image Content */}
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
                alt="Schmuckwerkstatt"
                className="w-full h-96 object-cover"
              />
              
              {/* Floating Stats Cards */}
              <motion.div
                className="absolute -top-6 -left-6"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                viewport={{ once: true }}
              >
                <Card className="bg-gradient-to-br from-white to-elbfunkeln-beige/20 backdrop-blur-sm p-4 shadow-xl hover:shadow-2xl transition-all duration-300 border-0">
                  <div className="text-center">
                    <div className="font-cormorant text-2xl text-elbfunkeln-green">500+ 😍</div>
                    <div className="font-inter text-xs text-elbfunkeln-green/70">Zufriedene Kunden</div>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                className="absolute -bottom-6 -right-6"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-gradient-to-br from-white to-elbfunkeln-beige/20 backdrop-blur-sm p-4 shadow-xl hover:shadow-2xl transition-all duration-300 border-0">
                  <div className="text-center">
                    <div className="font-cormorant text-2xl text-elbfunkeln-green">6 Jahre ⭐</div>
                    <div className="font-inter text-xs text-elbfunkeln-green/70">Handwerkskunst</div>
                  </div>
                </Card>
              </motion.div>
            </div>

            {/* Decorative Elements */}
            <motion.div
              className="absolute -z-10 top-10 right-10 w-32 h-32 bg-elbfunkeln-rose/20 rounded-full"
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
            
            <motion.div
              className="absolute -z-10 bottom-10 left-10 w-24 h-24 bg-elbfunkeln-lavender/20 rounded-full"
              animate={{ 
                scale: [1.2, 1, 1.2],
                rotate: [360, 180, 0]
              }}
              transition={{ 
                duration: 6,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}