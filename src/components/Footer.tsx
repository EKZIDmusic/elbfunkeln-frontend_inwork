import { motion } from 'motion/react';
import { 
  Instagram, 
  Facebook, 
  Mail, 
  Phone, 
  MapPin, 
  Heart,
  Sparkles
} from 'lucide-react';
import { useRouter } from './Router';

const footerLinks = {
  shop: [
    { name: 'Ohrringe', category: 'ohrringe' },
    { name: 'Armbänder', category: 'armbaender' },
    { name: 'Ringe', category: 'ringe' },
    { name: 'Ketten', category: 'ketten' },
    { name: 'Sets', category: 'sets' },
    { name: 'Sale', category: 'sale' }
  ],
  service: [
    { name: 'Über uns', page: 'about' },
    { name: 'Kontakt', page: 'contact' },
    { name: 'Versand', page: 'shipping' },
    { name: 'Rückgabe', page: 'returns' },
    { name: 'Größenberatung', page: 'size-guide' },
    { name: 'Pflege-Tipps', page: 'care-tips' }
  ],
  legal: [
    { name: 'AGB', page: 'terms' },
    { name: 'Datenschutz', page: 'privacy' },
    { name: 'Impressum', page: 'imprint' },
    { name: 'Widerrufsrecht', page: 'withdrawal' }
  ]
};

export function Footer() {
  const { navigateTo } = useRouter();
  return (
    <footer className="bg-elbfunkeln-beige text-elbfunkeln-green border-t border-elbfunkeln-green/20">
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <div className="font-cormorant text-3xl text-elbfunkeln-green">
              ✨ Elbfunkeln
            </div>
            <p className="font-inter text-elbfunkeln-green/80 text-sm leading-relaxed">
              Handgemachter Drahtschmuck mit Liebe gefertigt. 
              Jedes Stück erzählt eine einzigartige Geschichte und 
              bringt deine Persönlichkeit zum Strahlen. 💫
            </p>
            
            {/* Social Media */}
            <div className="flex gap-4 pt-4">
              {[
                { icon: Instagram, href: '#', label: 'Instagram', color: 'elbfunkeln-rose' },
                { icon: Facebook, href: '#', label: 'Facebook', color: 'elbfunkeln-lavender' },
                { icon: Mail, href: '#', label: 'E-Mail', color: 'elbfunkeln-green' }
              ].map((social, index) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  className={`bg-elbfunkeln-green/10 p-3 rounded-full text-${social.color} hover:bg-${social.color} hover:text-white transition-all duration-300 animate-float-gentle`}
                  style={{ animationDelay: `${index * 0.2}s` }}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={social.label}
                >
                  <social.icon size={18} />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Shop Links */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h3 className="font-cormorant text-xl text-elbfunkeln-green mb-6">
              Shop
            </h3>
            <ul className="space-y-3">
              {footerLinks.shop.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => navigateTo('shop', { category: link.category })}
                    className="font-inter text-elbfunkeln-green/70 hover:text-elbfunkeln-rose transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Service Links */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="font-cormorant text-xl text-elbfunkeln-green mb-6">
              Service
            </h3>
            <ul className="space-y-3">
              {footerLinks.service.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => navigateTo(link.page as any)}
                    className="font-inter text-elbfunkeln-green/70 hover:text-elbfunkeln-rose transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h3 className="font-cormorant text-xl text-elbfunkeln-green mb-6">
              Kontakt
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-elbfunkeln-lavender mt-1 flex-shrink-0 animate-float-gentle" />
                <div className="font-inter text-elbfunkeln-green/70 text-sm">
                  Elbstraße 123<br />
                  20359 Hamburg 🏙️
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-elbfunkeln-rose flex-shrink-0 animate-float-gentle animate-delay-1" />
                <a 
                  href="tel:+4940123456789" 
                  className="font-inter text-elbfunkeln-green/70 hover:text-elbfunkeln-rose transition-colors text-sm"
                >
                  +49 40 123 456 789 📞
                </a>
              </div>
              
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-elbfunkeln-green flex-shrink-0 animate-float-gentle animate-delay-2" />
                <a 
                  href="mailto:hallo@elbfunkeln.de" 
                  className="font-inter text-elbfunkeln-green/70 hover:text-elbfunkeln-rose transition-colors text-sm"
                >
                  hallo@elbfunkeln.de 💌
                </a>
              </div>
            </div>

            {/* Opening Hours */}
            <div className="mt-6 p-4 bg-elbfunkeln-green/5 rounded-xl border border-elbfunkeln-green/10">
              <h4 className="font-cormorant text-elbfunkeln-green mb-2">
                Öffnungszeiten 🕐
              </h4>
              <div className="font-inter text-elbfunkeln-green/70 text-xs space-y-1">
                <div>Mo-Fr: 10:00 - 18:00</div>
                <div>Sa: 10:00 - 16:00</div>
                <div>So: Geschlossen</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="border-t border-elbfunkeln-green/20 mt-12 pt-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="font-inter text-elbfunkeln-green/60 text-sm text-center md:text-left">
              © 2024 Elbfunkeln. Alle Rechte vorbehalten. 
              <br className="md:hidden" />
              Handgefertigt mit <Heart className="inline w-4 h-4 text-elbfunkeln-rose mx-1" /> in Hamburg.
            </div>
            
            <div className="flex flex-wrap justify-center gap-6">
              {footerLinks.legal.map((link, index) => (
                <button
                  key={index}
                  onClick={() => navigateTo(link.page as any)}
                  className="font-inter text-elbfunkeln-green/60 hover:text-elbfunkeln-rose transition-colors text-sm"
                >
                  {link.name}
                </button>
              ))}
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="flex justify-center mt-8 space-x-4 text-elbfunkeln-lavender/40">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles size={20} />
            </motion.div>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              💎
            </motion.div>
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles size={16} />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}