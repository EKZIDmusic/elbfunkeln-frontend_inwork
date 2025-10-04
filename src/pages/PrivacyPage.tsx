import { motion } from 'motion/react';
import { Shield, Lock, Eye, Users, Mail, AlertCircle } from 'lucide-react';

export function PrivacyPage() {
  const dataTypes = [
    {
      icon: Users,
      title: 'Persönliche Daten',
      description: 'Name, Adresse, E-Mail, Telefonnummer',
      purpose: 'Zur Bestellabwicklung und Kundenbetreuung'
    },
    {
      icon: Eye,
      title: 'Nutzungsverhalten',
      description: 'Besuchte Seiten, Verweildauer, Klicks',
      purpose: 'Zur Verbesserung unseres Online-Angebots'
    },
    {
      icon: Lock,
      title: 'Zahlungsdaten',
      description: 'Rechnungsadresse, gewählte Zahlungsart',
      purpose: 'Zur sicheren Abwicklung von Zahlungen'
    }
  ];

  const rights = [
    'Auskunft über gespeicherte Daten',
    'Berichtigung falscher Daten',
    'Löschung nicht mehr benötigter Daten',
    'Einschränkung der Datenverarbeitung',
    'Datenübertragbarkeit',
    'Widerspruch gegen Datenverarbeitung'
  ];

  const cookies = [
    {
      type: 'Notwendige Cookies',
      description: 'Für die Grundfunktionen der Website erforderlich',
      duration: 'Session',
      required: true
    },
    {
      type: 'Funktionale Cookies',
      description: 'Speichern Ihre Einstellungen und Präferenzen',
      duration: '30 Tage',
      required: false
    },
    {
      type: 'Analytische Cookies',
      description: 'Helfen uns, die Website-Nutzung zu verstehen',
      duration: '2 Jahre',
      required: false
    }
  ];

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
            <Shield className="w-8 h-8 text-elbfunkeln-lavender" />
            <h1 className="font-cormorant text-4xl text-elbfunkeln-green">
              Datenschutzerklärung
            </h1>
          </div>
          <p className="font-inter text-elbfunkeln-green/70">
            Ihr Datenschutz ist uns wichtig. Hier erfahren Sie, wie wir Ihre Daten verarbeiten und schützen.
          </p>
        </motion.div>

        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 mb-8"
        >
          <h2 className="font-cormorant text-2xl text-elbfunkeln-green mb-4">
            Verantwortlicher
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="font-inter text-elbfunkeln-green/80 space-y-1">
                <div className="font-medium">Elbfunkeln</div>
                <div>Inhaberin: Maria Müller</div>
                <div>Elbstraße 123</div>
                <div>20359 Hamburg</div>
                <div>Deutschland</div>
              </div>
            </div>
            <div>
              <div className="font-inter text-elbfunkeln-green/80 space-y-1">
                <div>E-Mail: datenschutz@elbfunkeln.de</div>
                <div>Telefon: +49 40 123 456 789</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Data Collection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 mb-8"
        >
          <h2 className="font-cormorant text-2xl text-elbfunkeln-green mb-6">
            Welche Daten wir sammeln
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {dataTypes.map((dataType, index) => (
              <motion.div
                key={dataType.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-md"
              >
                <div className="bg-elbfunkeln-lavender/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <dataType.icon className="w-6 h-6 text-elbfunkeln-lavender" />
                </div>
                
                <h3 className="font-cormorant text-lg text-elbfunkeln-green mb-2 text-center">
                  {dataType.title}
                </h3>
                <p className="font-inter text-sm text-elbfunkeln-green/70 mb-3 text-center">
                  {dataType.description}
                </p>
                <p className="font-inter text-xs text-elbfunkeln-green/60 text-center">
                  {dataType.purpose}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Your Rights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 mb-8"
        >
          <h2 className="font-cormorant text-2xl text-elbfunkeln-green mb-6">
            Ihre Rechte
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            {rights.map((right, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-center gap-3 p-3 rounded-lg bg-elbfunkeln-lavender/10"
              >
                <Shield className="w-5 h-5 text-elbfunkeln-lavender flex-shrink-0" />
                <span className="font-inter text-sm text-elbfunkeln-green">
                  {right}
                </span>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-elbfunkeln-rose/20 rounded-xl">
            <p className="font-inter text-sm text-elbfunkeln-green/70">
              Zur Ausübung Ihrer Rechte kontaktieren Sie uns unter datenschutz@elbfunkeln.de. 
              Wir bearbeiten Ihre Anfrage innerhalb von 30 Tagen.
            </p>
          </div>
        </motion.div>

        {/* Cookies */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 mb-8"
        >
          <h2 className="font-cormorant text-2xl text-elbfunkeln-green mb-6">
            Cookies und Tracking
          </h2>
          
          <div className="space-y-4">
            {cookies.map((cookie, index) => (
              <motion.div
                key={cookie.type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-md"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-cormorant text-lg text-elbfunkeln-green">
                    {cookie.type}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-inter ${
                    cookie.required 
                      ? 'bg-elbfunkeln-rose/20 text-elbfunkeln-rose' 
                      : 'bg-elbfunkeln-lavender/20 text-elbfunkeln-lavender'
                  }`}>
                    {cookie.required ? 'Erforderlich' : 'Optional'}
                  </span>
                </div>
                
                <p className="font-inter text-sm text-elbfunkeln-green/70 mb-2">
                  {cookie.description}
                </p>
                <p className="font-inter text-xs text-elbfunkeln-green/60">
                  Speicherdauer: {cookie.duration}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Data Security */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-6 h-6 text-elbfunkeln-lavender" />
            <h2 className="font-cormorant text-2xl text-elbfunkeln-green">
              Datensicherheit
            </h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-elbfunkeln-lavender mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-inter font-medium text-elbfunkeln-green mb-1">
                  SSL-Verschlüsselung
                </h3>
                <p className="font-inter text-sm text-elbfunkeln-green/70">
                  Alle Datenübertragungen werden mit modernster SSL-Technologie verschlüsselt.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-elbfunkeln-lavender mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-inter font-medium text-elbfunkeln-green mb-1">
                  Sichere Server
                </h3>
                <p className="font-inter text-sm text-elbfunkeln-green/70">
                  Ihre Daten werden auf sicheren Servern in Deutschland gespeichert.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-elbfunkeln-lavender mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-inter font-medium text-elbfunkeln-green mb-1">
                  Regelmäßige Updates
                </h3>
                <p className="font-inter text-sm text-elbfunkeln-green/70">
                  Unsere Sicherheitsmaßnahmen werden kontinuierlich überwacht und aktualisiert.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-elbfunkeln-lavender/20 rounded-2xl p-8 text-center"
        >
          <Mail className="w-12 h-12 text-elbfunkeln-lavender mx-auto mb-4" />
          <h2 className="font-cormorant text-2xl text-elbfunkeln-green mb-4">
            Fragen zum Datenschutz?
          </h2>
          <p className="font-inter text-elbfunkeln-green/70 mb-6 max-w-2xl mx-auto">
            Bei Fragen zu dieser Datenschutzerklärung oder zur Verarbeitung Ihrer personenbezogenen Daten 
            kontaktieren Sie uns gerne direkt.
          </p>
          
          <a 
            href="mailto:datenschutz@elbfunkeln.de"
            className="bg-elbfunkeln-green text-white px-8 py-3 rounded-xl font-inter hover:bg-elbfunkeln-green/90 transition-colors inline-flex items-center gap-2"
          >
            <Mail className="w-5 h-5" />
            datenschutz@elbfunkeln.de
          </a>
        </motion.div>
      </div>
    </div>
  );
}