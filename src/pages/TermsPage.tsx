import { motion } from 'motion/react';
import { FileText, Calendar, Shield, AlertCircle } from 'lucide-react';

export function TermsPage() {
  const sections = [
    {
      title: '1. Geltungsbereich',
      content: [
        'Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Bestellungen über den Online-Shop von Elbfunkeln.',
        'Geschäftspartner ist Elbfunkeln, Elbstraße 123, 20359 Hamburg.',
        'Mit der Bestellung erkennt der Kunde diese AGB als verbindlich an.'
      ]
    },
    {
      title: '2. Vertragsschluss',
      content: [
        'Die Darstellung der Produkte im Online-Shop stellt kein rechtlich bindendes Angebot dar.',
        'Durch das Absenden einer Bestellung gibt der Kunde ein verbindliches Angebot zum Kauf der bestellten Waren ab.',
        'Der Vertrag kommt mit der Versendung der Auftragsbestätigung durch Elbfunkeln zustande.'
      ]
    },
    {
      title: '3. Preise und Zahlungsbedingungen',
      content: [
        'Alle Preise verstehen sich inklusive der gesetzlichen Mehrwertsteuer.',
        'Die Versandkosten sind gesondert ausgewiesen und werden zusätzlich berechnet.',
        'Die Zahlung erfolgt wahlweise per Vorkasse, PayPal, Kreditkarte oder auf Rechnung (bei entsprechender Bonität).'
      ]
    },
    {
      title: '4. Lieferung und Versand',
      content: [
        'Die Lieferung erfolgt innerhalb Deutschlands und in ausgewählte EU-Länder.',
        'Die Lieferzeit beträgt in der Regel 3-5 Werktage nach Zahlungseingang.',
        'Handgefertigte Einzelstücke können eine längere Bearbeitungszeit von bis zu 10 Werktagen haben.'
      ]
    },
    {
      title: '5. Widerrufsrecht',
      content: [
        'Verbrauchern steht ein 14-tägiges Widerrufsrecht zu.',
        'Die Widerrufsfrist beginnt mit dem Tag der Warenlieferung.',
        'Individuell angefertigte oder personalisierte Waren sind vom Widerrufsrecht ausgeschlossen.'
      ]
    },
    {
      title: '6. Gewährleistung',
      content: [
        'Für alle Produkte gelten die gesetzlichen Gewährleistungsbestimmungen.',
        'Bei handgefertigten Produkten sind kleine Unregelmäßigkeiten charakteristisch und kein Mangel.',
        'Reklamationen sind unverzüglich nach Entdeckung des Mangels zu melden.'
      ]
    },
    {
      title: '7. Datenschutz',
      content: [
        'Die Verarbeitung personenbezogener Daten erfolgt nach den Bestimmungen der DSGVO.',
        'Detaillierte Informationen finden Sie in unserer Datenschutzerklärung.',
        'Kundendaten werden ausschließlich zur Vertragsabwicklung verwendet.'
      ]
    },
    {
      title: '8. Schlussbestimmungen',
      content: [
        'Es gilt deutsches Recht unter Ausschluss des UN-Kaufrechts.',
        'Erfüllungsort und Gerichtsstand ist Hamburg.',
        'Sollten einzelne Bestimmungen unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.'
      ]
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
            <FileText className="w-8 h-8 text-elbfunkeln-lavender" />
            <h1 className="font-cormorant text-4xl text-elbfunkeln-green">
              Allgemeine Geschäftsbedingungen
            </h1>
          </div>
          <p className="font-inter text-elbfunkeln-green/70">
            Gültig ab 1. Januar 2024
          </p>
        </motion.div>

        {/* Company Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-elbfunkeln-lavender" />
            <h2 className="font-cormorant text-2xl text-elbfunkeln-green">
              Anbieter
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-inter font-medium text-elbfunkeln-green mb-2">
                Firmeninformationen
              </h3>
              <div className="font-inter text-sm text-elbfunkeln-green/80 space-y-1">
                <div>Elbfunkeln</div>
                <div>Inhaberin: Maria Müller</div>
                <div>Elbstraße 123</div>
                <div>20359 Hamburg</div>
                <div>Deutschland</div>
              </div>
            </div>
            
            <div>
              <h3 className="font-inter font-medium text-elbfunkeln-green mb-2">
                Kontaktdaten
              </h3>
              <div className="font-inter text-sm text-elbfunkeln-green/80 space-y-1">
                <div>Telefon: +49 40 123 456 789</div>
                <div>E-Mail: info@elbfunkeln.de</div>
                <div>USt-IdNr.: DE123456789</div>
                <div>Handelsregister: HRB 12345</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Terms Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8"
            >
              <h2 className="font-cormorant text-xl text-elbfunkeln-green mb-4">
                {section.title}
              </h2>
              
              <div className="space-y-3">
                {section.content.map((paragraph, pIndex) => (
                  <p
                    key={pIndex}
                    className="font-inter text-sm text-elbfunkeln-green/80 leading-relaxed"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Important Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-elbfunkeln-lavender/20 rounded-2xl p-6 mt-8"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-elbfunkeln-lavender mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-inter font-medium text-elbfunkeln-green mb-2">
                Wichtiger Hinweis
              </h3>
              <p className="font-inter text-sm text-elbfunkeln-green/70">
                Diese AGB können jederzeit ohne vorherige Ankündigung geändert werden. 
                Die zum Zeitpunkt der Bestellung gültigen Bedingungen sind maßgeblich. 
                Bei Fragen zu diesen Geschäftsbedingungen kontaktieren Sie uns gerne.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Last Updated */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="text-center mt-8"
        >
          <div className="flex items-center justify-center gap-2 text-elbfunkeln-green/60">
            <Calendar className="w-4 h-4" />
            <span className="font-inter text-sm">
              Letzte Aktualisierung: 1. Januar 2024
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}