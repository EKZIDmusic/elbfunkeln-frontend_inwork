import { motion } from 'motion/react';
import { Package, Clock, MapPin, Euro, CheckCircle } from 'lucide-react';

export function ShippingPage() {
  const shippingOptions = [
    {
      name: 'Standard Versand',
      price: '4,99 €',
      duration: '3-5 Werktage',
      icon: Package,
      description: 'Sicherer Versand mit DHL'
    },
    {
      name: 'Express Versand',
      price: '9,99 €',
      duration: '1-2 Werktage',
      icon: Clock,
      description: 'Schnelle Lieferung mit DHL Express'
    },
    {
      name: 'Kostenloser Versand',
      price: 'Kostenlos',
      duration: '3-5 Werktage',
      icon: CheckCircle,
      description: 'Ab 50 € Bestellwert'
    }
  ];

  const shippingCountries = [
    'Deutschland',
    'Österreich',
    'Schweiz',
    'Niederlande',
    'Belgien',
    'Luxemburg',
    'Frankreich',
    'Italien'
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
            Versand & Lieferung
          </h1>
          <p className="font-inter text-elbfunkeln-green/70 max-w-2xl mx-auto">
            Wir versenden Ihren handgemachten Drahtschmuck sicher und sorgfältig verpackt direkt zu Ihnen nach Hause.
          </p>
        </motion.div>

        {/* Shipping Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 mb-8"
        >
          <h2 className="font-cormorant text-2xl text-elbfunkeln-green mb-6">
            Versandoptionen
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {shippingOptions.map((option, index) => (
              <motion.div
                key={option.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-3 mb-4">
                  <option.icon className="w-6 h-6 text-elbfunkeln-lavender" />
                  <h3 className="font-cormorant text-lg text-elbfunkeln-green">
                    {option.name}
                  </h3>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-inter text-sm text-elbfunkeln-green/70">Preis:</span>
                    <span className="font-inter font-medium text-elbfunkeln-green">{option.price}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-inter text-sm text-elbfunkeln-green/70">Dauer:</span>
                    <span className="font-inter font-medium text-elbfunkeln-green">{option.duration}</span>
                  </div>
                  <p className="font-inter text-sm text-elbfunkeln-green/60 mt-3">
                    {option.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Shipping Countries */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <MapPin className="w-6 h-6 text-elbfunkeln-lavender" />
            <h2 className="font-cormorant text-2xl text-elbfunkeln-green">
              Lieferländer
            </h2>
          </div>
          
          <div className="grid md:grid-cols-4 gap-3">
            {shippingCountries.map((country, index) => (
              <motion.div
                key={country}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                className="bg-elbfunkeln-lavender/20 rounded-lg p-3 text-center"
              >
                <span className="font-inter text-sm text-elbfunkeln-green">
                  {country}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8"
        >
          <h2 className="font-cormorant text-2xl text-elbfunkeln-green mb-6">
            Wichtige Informationen
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-elbfunkeln-lavender mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-inter font-medium text-elbfunkeln-green">
                  Sorgfältige Verpackung
                </h3>
                <p className="font-inter text-sm text-elbfunkeln-green/70">
                  Jeder Schmuck wird liebevoll in recycelbare Materialien verpackt und mit unserem Elbfunkeln-Siegel versehen.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-elbfunkeln-lavender mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-inter font-medium text-elbfunkeln-green">
                  Versandverfolgung
                </h3>
                <p className="font-inter text-sm text-elbfunkeln-green/70">
                  Sie erhalten eine Tracking-Nummer per E-Mail, sobald Ihre Bestellung versendet wurde.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-elbfunkeln-lavender mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-inter font-medium text-elbfunkeln-green">
                  Bearbeitungszeit
                </h3>
                <p className="font-inter text-sm text-elbfunkeln-green/70">
                  Da unsere Schmuckstücke handgefertigt sind, beträgt die Bearbeitungszeit 1-3 Werktage vor Versand.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}