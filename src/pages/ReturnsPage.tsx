import { motion } from 'motion/react';
import { RotateCcw, Clock, Shield, CheckCircle, Package } from 'lucide-react';

export function ReturnsPage() {
  const returnSteps = [
    {
      step: 1,
      title: 'Rücksendung anmelden',
      description: 'Kontaktieren Sie uns per E-Mail oder Telefon binnen 14 Tagen',
      icon: RotateCcw
    },
    {
      step: 2,
      title: 'Artikel verpacken',
      description: 'Originalverpackung und alle Zubehörteile beilegen',
      icon: Package
    },
    {
      step: 3,
      title: 'Kostenloser Rückversand',
      description: 'Wir senden Ihnen ein kostenloses Rücksendeetikett',
      icon: Shield
    },
    {
      step: 4,
      title: 'Erstattung erhalten',
      description: 'Geld zurück binnen 7-14 Werktagen nach Wareneingang',
      icon: CheckCircle
    }
  ];

  const conditions = [
    'Artikel muss ungetragen und im Originalzustand sein',
    'Originalverpackung und Echtheitszertifikat müssen beiliegen',
    'Rücksendung muss binnen 14 Tagen nach Erhalt erfolgen',
    'Personalisierte oder maßgefertigte Artikel sind von der Rückgabe ausgeschlossen'
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
          <h1 className="font-cormorant text-4xl text-elbfunkeln-green mb-4">
            Rückgabe & Umtausch
          </h1>
          <p className="font-inter text-elbfunkeln-green/70 max-w-2xl mx-auto">
            Ihre Zufriedenheit ist uns wichtig. Hier erfahren Sie alles über unser unkompliziertes Rückgabeverfahren.
          </p>
        </motion.div>

        {/* Return Policy Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-elbfunkeln-lavender/20 rounded-2xl p-8 mb-8 text-center"
        >
          <Clock className="w-12 h-12 text-elbfunkeln-lavender mx-auto mb-4" />
          <h2 className="font-cormorant text-2xl text-elbfunkeln-green mb-2">
            14 Tage Rückgaberecht
          </h2>
          <p className="font-inter text-elbfunkeln-green/70">
            Kostenlose Rücksendung und volle Erstattung bei Nichtgefallen
          </p>
        </motion.div>

        {/* Return Process */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 mb-8"
        >
          <h2 className="font-cormorant text-2xl text-elbfunkeln-green mb-8 text-center">
            So einfach funktioniert die Rückgabe
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {returnSteps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="text-center"
              >
                <div className="bg-elbfunkeln-lavender/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <step.icon className="w-8 h-8 text-elbfunkeln-lavender" />
                </div>
                <div className="bg-elbfunkeln-green text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-3 text-sm font-medium">
                  {step.step}
                </div>
                <h3 className="font-cormorant text-lg text-elbfunkeln-green mb-2">
                  {step.title}
                </h3>
                <p className="font-inter text-sm text-elbfunkeln-green/70">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Return Conditions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 mb-8"
        >
          <h2 className="font-cormorant text-2xl text-elbfunkeln-green mb-6">
            Rückgabebedingungen
          </h2>
          
          <div className="space-y-4">
            {conditions.map((condition, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-start gap-3"
              >
                <CheckCircle className="w-5 h-5 text-elbfunkeln-lavender mt-1 flex-shrink-0" />
                <span className="font-inter text-elbfunkeln-green/80">
                  {condition}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8"
        >
          <h2 className="font-cormorant text-2xl text-elbfunkeln-green mb-6">
            Rückgabe anmelden
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-cormorant text-lg text-elbfunkeln-green mb-4">
                Kontakt
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="font-inter text-sm text-elbfunkeln-green/70">E-Mail:</span>
                  <a href="mailto:rueckgabe@elbfunkeln.de" className="block font-inter text-elbfunkeln-green hover:text-elbfunkeln-lavender transition-colors">
                    rueckgabe@elbfunkeln.de
                  </a>
                </div>
                <div>
                  <span className="font-inter text-sm text-elbfunkeln-green/70">Telefon:</span>
                  <a href="tel:+4940123456789" className="block font-inter text-elbfunkeln-green hover:text-elbfunkeln-lavender transition-colors">
                    +49 40 123 456 789
                  </a>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-cormorant text-lg text-elbfunkeln-green mb-4">
                Rücksendeadresse
              </h3>
              <div className="font-inter text-elbfunkeln-green/80 text-sm leading-relaxed">
                Elbfunkeln<br />
                Rücksendungen<br />
                Elbstraße 123<br />
                20359 Hamburg<br />
                Deutschland
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}