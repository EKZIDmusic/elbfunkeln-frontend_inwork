import { motion } from 'motion/react';
import { Ruler, Users, MessageCircle, Lightbulb } from 'lucide-react';

export function SizeGuidePage() {
  const ringSizes = [
    { size: '15.7mm', german: '49', us: '5', uk: 'J' },
    { size: '16.5mm', german: '52', us: '6', uk: 'L' },
    { size: '17.3mm', german: '54', us: '7', uk: 'N' },
    { size: '18.1mm', german: '57', us: '8', uk: 'P' },
    { size: '18.9mm', german: '59', us: '9', uk: 'R' },
    { size: '19.8mm', german: '62', us: '10', uk: 'T' },
    { size: '20.6mm', german: '65', us: '11', uk: 'V' },
    { size: '21.4mm', german: '67', us: '12', uk: 'X' }
  ];

  const braceletSizes = [
    { size: 'XS', length: '16-17cm', description: 'Sehr schmale Handgelenke' },
    { size: 'S', length: '17-18cm', description: 'Schmale Handgelenke' },
    { size: 'M', length: '18-19cm', description: 'Normale Handgelenke' },
    { size: 'L', length: '19-20cm', description: 'Kräftige Handgelenke' },
    { size: 'XL', length: '20-21cm', description: 'Sehr kräftige Handgelenke' }
  ];

  const necklaceSizes = [
    { length: '40cm', style: 'Choker', description: 'Eng am Hals anliegend' },
    { length: '45cm', style: 'Kurze Kette', description: 'Klassische kurze Halskette' },
    { length: '50cm', style: 'Princess', description: 'Beliebte Standardlänge' },
    { length: '60cm', style: 'Matinee', description: 'Elegante mittlere Länge' },
    { length: '70cm', style: 'Opera', description: 'Lange, elegante Kette' },
    { length: '90cm', style: 'Rope', description: 'Sehr lange Kette, kann doppelt getragen werden' }
  ];

  return (
    <div className="min-h-screen bg-elbfunkeln-beige py-8 pt-24">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-cormorant text-4xl text-elbfunkeln-green mb-4">
            Größenberatung
          </h1>
          <p className="font-inter text-elbfunkeln-green/70 max-w-2xl mx-auto">
            Finden Sie die perfekte Größe für Ihren handgemachten Drahtschmuck. Unsere Größentabellen helfen Ihnen bei der richtigen Auswahl.
          </p>
        </motion.div>

        {/* Ring Sizes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <Ruler className="w-6 h-6 text-elbfunkeln-lavender" />
            <h2 className="font-cormorant text-2xl text-elbfunkeln-green">
              Ringgrößen
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-elbfunkeln-green/20">
                  <th className="font-inter text-left py-3 px-2 text-elbfunkeln-green">Innendurchmesser</th>
                  <th className="font-inter text-left py-3 px-2 text-elbfunkeln-green">Deutsche Größe</th>
                  <th className="font-inter text-left py-3 px-2 text-elbfunkeln-green">US Größe</th>
                  <th className="font-inter text-left py-3 px-2 text-elbfunkeln-green">UK Größe</th>
                </tr>
              </thead>
              <tbody>
                {ringSizes.map((ring, index) => (
                  <motion.tr
                    key={ring.size}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.05 }}
                    className="border-b border-elbfunkeln-green/10 hover:bg-elbfunkeln-lavender/10"
                  >
                    <td className="font-inter py-3 px-2 text-elbfunkeln-green">{ring.size}</td>
                    <td className="font-inter py-3 px-2 text-elbfunkeln-green font-medium">{ring.german}</td>
                    <td className="font-inter py-3 px-2 text-elbfunkeln-green">{ring.us}</td>
                    <td className="font-inter py-3 px-2 text-elbfunkeln-green">{ring.uk}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-6 p-4 bg-elbfunkeln-lavender/20 rounded-xl">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-elbfunkeln-lavender mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-inter font-medium text-elbfunkeln-green mb-2">
                  Tipp: Ring richtig messen
                </h3>
                <p className="font-inter text-sm text-elbfunkeln-green/70">
                  Messen Sie Ihren Finger am Abend, da er dann etwas dicker ist. Der Ring sollte über den Knöchel gleiten, aber nicht zu locker sitzen.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bracelet Sizes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 mb-8"
        >
          <h2 className="font-cormorant text-2xl text-elbfunkeln-green mb-6">
            Armbandgrößen
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {braceletSizes.map((bracelet, index) => (
              <motion.div
                key={bracelet.size}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="bg-white rounded-xl p-4 shadow-md"
              >
                <div className="text-center">
                  <div className="bg-elbfunkeln-lavender/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                    <span className="font-cormorant text-lg text-elbfunkeln-green font-medium">
                      {bracelet.size}
                    </span>
                  </div>
                  <h3 className="font-inter font-medium text-elbfunkeln-green mb-1">
                    {bracelet.length}
                  </h3>
                  <p className="font-inter text-sm text-elbfunkeln-green/70">
                    {bracelet.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-elbfunkeln-rose/20 rounded-xl">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-elbfunkeln-rose mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-inter font-medium text-elbfunkeln-green mb-2">
                  Tipp: Handgelenk richtig messen
                </h3>
                <p className="font-inter text-sm text-elbfunkeln-green/70">
                  Messen Sie Ihr Handgelenk mit einem Maßband an der schmalsten Stelle. Für einen lockeren Sitz addieren Sie 1-2cm zur gemessenen Länge.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Necklace Sizes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 mb-8"
        >
          <h2 className="font-cormorant text-2xl text-elbfunkeln-green mb-6">
            Kettenlängen
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {necklaceSizes.map((necklace, index) => (
              <motion.div
                key={necklace.length}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-md"
              >
                <h3 className="font-cormorant text-lg text-elbfunkeln-green mb-2">
                  {necklace.length} - {necklace.style}
                </h3>
                <p className="font-inter text-sm text-elbfunkeln-green/70">
                  {necklace.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Personal Consultation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-elbfunkeln-lavender/20 rounded-2xl p-8 text-center"
        >
          <Users className="w-12 h-12 text-elbfunkeln-lavender mx-auto mb-4" />
          <h2 className="font-cormorant text-2xl text-elbfunkeln-green mb-4">
            Persönliche Beratung
          </h2>
          <p className="font-inter text-elbfunkeln-green/70 mb-6 max-w-2xl mx-auto">
            Sind Sie sich unsicher über die richtige Größe? Kontaktieren Sie uns für eine persönliche Beratung. 
            Wir helfen Ihnen gerne bei der Auswahl der perfekten Größe für Ihren Schmuck.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="mailto:beratung@elbfunkeln.de"
              className="bg-elbfunkeln-green text-white px-6 py-3 rounded-xl font-inter hover:bg-elbfunkeln-green/90 transition-colors flex items-center gap-2 justify-center"
            >
              <MessageCircle className="w-5 h-5" />
              E-Mail Beratung
            </a>
            <a 
              href="tel:+4940123456789"
              className="bg-white text-elbfunkeln-green px-6 py-3 rounded-xl font-inter hover:bg-white/90 transition-colors flex items-center gap-2 justify-center border border-elbfunkeln-green/20"
            >
              <MessageCircle className="w-5 h-5" />
              Telefonische Beratung
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}