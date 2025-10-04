import { motion } from 'motion/react';
import { Building, Mail, Phone, MapPin, FileText, Globe } from 'lucide-react';

export function ImprintPage() {
  return (
    <div className="min-h-screen bg-elbfunkeln-beige py-8 pt-24">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Building className="w-8 h-8 text-elbfunkeln-lavender" />
            <h1 className="font-cormorant text-4xl text-elbfunkeln-green">
              Impressum
            </h1>
          </div>
          <p className="font-inter text-elbfunkeln-green/70">
            Angaben gemäß § 5 TMG
          </p>
        </motion.div>

        {/* Company Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <Building className="w-6 h-6 text-elbfunkeln-lavender" />
            <h2 className="font-cormorant text-2xl text-elbfunkeln-green">
              Anbieter
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-inter font-medium text-elbfunkeln-green mb-4">
                Firmeninformationen
              </h3>
              <div className="space-y-2">
                <div className="font-inter text-elbfunkeln-green/80">
                  <strong>Firmenname:</strong> Elbfunkeln
                </div>
                <div className="font-inter text-elbfunkeln-green/80">
                  <strong>Inhaberin:</strong> Maria Müller
                </div>
                <div className="font-inter text-elbfunkeln-green/80">
                  <strong>Rechtsform:</strong> Einzelunternehmen
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-inter font-medium text-elbfunkeln-green mb-4">
                Registrierung
              </h3>
              <div className="space-y-2">
                <div className="font-inter text-elbfunkeln-green/80">
                  <strong>Handelsregister:</strong> HRB 12345
                </div>
                <div className="font-inter text-elbfunkeln-green/80">
                  <strong>Registergericht:</strong> Amtsgericht Hamburg
                </div>
                <div className="font-inter text-elbfunkeln-green/80">
                  <strong>USt-IdNr.:</strong> DE123456789
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <Mail className="w-6 h-6 text-elbfunkeln-lavender" />
            <h2 className="font-cormorant text-2xl text-elbfunkeln-green">
              Kontaktdaten
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-elbfunkeln-lavender mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-inter font-medium text-elbfunkeln-green mb-1">
                    Anschrift
                  </h3>
                  <div className="font-inter text-elbfunkeln-green/80 leading-relaxed">
                    Elbstraße 123<br />
                    20359 Hamburg<br />
                    Deutschland
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-elbfunkeln-lavender mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-inter font-medium text-elbfunkeln-green mb-1">
                    Telefon
                  </h3>
                  <a 
                    href="tel:+4940123456789"
                    className="font-inter text-elbfunkeln-green/80 hover:text-elbfunkeln-lavender transition-colors"
                  >
                    +49 40 123 456 789
                  </a>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-elbfunkeln-lavender mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-inter font-medium text-elbfunkeln-green mb-1">
                    E-Mail
                  </h3>
                  <a 
                    href="mailto:info@elbfunkeln.de"
                    className="font-inter text-elbfunkeln-green/80 hover:text-elbfunkeln-lavender transition-colors"
                  >
                    info@elbfunkeln.de
                  </a>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-elbfunkeln-lavender mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-inter font-medium text-elbfunkeln-green mb-1">
                    Website
                  </h3>
                  <span className="font-inter text-elbfunkeln-green/80">
                    www.elbfunkeln.de
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Professional Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 mb-8"
        >
          <h2 className="font-cormorant text-2xl text-elbfunkeln-green mb-6">
            Berufsrechtliche Angaben
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-inter font-medium text-elbfunkeln-green mb-4">
                Tätigkeitsbereich
              </h3>
              <div className="space-y-2">
                <div className="font-inter text-elbfunkeln-green/80">
                  Handwerk von Drahtschmuck
                </div>
                <div className="font-inter text-elbfunkeln-green/80">
                  Online-Handel mit Schmuckwaren
                </div>
                <div className="font-inter text-elbfunkeln-green/80">
                  Maßanfertigungen und Reparaturen
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-inter font-medium text-elbfunkeln-green mb-4">
                Handwerkskammer
              </h3>
              <div className="space-y-2">
                <div className="font-inter text-elbfunkeln-green/80">
                  <strong>Kammer:</strong> Handwerkskammer Hamburg
                </div>
                <div className="font-inter text-elbfunkeln-green/80">
                  <strong>Registernummer:</strong> 12345678
                </div>
                <div className="font-inter text-elbfunkeln-green/80">
                  <strong>Berufsbezeichnung:</strong> Goldschmiedin
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Dispute Resolution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 mb-8"
        >
          <h2 className="font-cormorant text-2xl text-elbfunkeln-green mb-6">
            Streitschlichtung
          </h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-inter font-medium text-elbfunkeln-green mb-2">
                EU-Streitschlichtung
              </h3>
              <p className="font-inter text-sm text-elbfunkeln-green/80 leading-relaxed">
                Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: 
                <a 
                  href="https://ec.europa.eu/consumers/odr/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-elbfunkeln-lavender hover:underline ml-1"
                >
                  https://ec.europa.eu/consumers/odr/
                </a>
              </p>
            </div>
            
            <div>
              <h3 className="font-inter font-medium text-elbfunkeln-green mb-2">
                Verbraucherschlichtungsstelle
              </h3>
              <p className="font-inter text-sm text-elbfunkeln-green/80 leading-relaxed">
                Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer 
                Verbraucherschlichtungsstelle teilzunehmen.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Copyright */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-elbfunkeln-lavender/20 rounded-2xl p-8 text-center"
        >
          <FileText className="w-12 h-12 text-elbfunkeln-lavender mx-auto mb-4" />
          <h2 className="font-cormorant text-2xl text-elbfunkeln-green mb-4">
            Urheberrecht
          </h2>
          <p className="font-inter text-elbfunkeln-green/70 max-w-2xl mx-auto">
            Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen 
            dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art 
            der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen 
            Zustimmung des jeweiligen Autors bzw. Erstellers.
          </p>
        </motion.div>
      </div>
    </div>
  );
}