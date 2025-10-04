import { motion } from 'motion/react';
import { Droplets, Sun, Shield, Sparkles, AlertTriangle, CheckCircle } from 'lucide-react';

export function CareTipsPage() {
  const careTips = [
    {
      icon: Droplets,
      title: 'Reinigung',
      tips: [
        'Verwenden Sie warmes Wasser und milde Seife',
        'Sanft mit einer weichen Zahnbürste reinigen',
        'Gründlich abspülen und vorsichtig trockentupfen',
        'Niemals aggressive Chemikalien verwenden'
      ],
      color: 'elbfunkeln-lavender'
    },
    {
      icon: Shield,
      title: 'Aufbewahrung',
      tips: [
        'In separaten Schmuckkästchen oder Beuteln lagern',
        'Vor Feuchtigkeit und direkter Sonneneinstrahlung schützen',
        'Nicht mit anderen Schmuckstücken zusammen lagern',
        'Luftdichte Behälter für längere Lagerung verwenden'
      ],
      color: 'elbfunkeln-rose'
    },
    {
      icon: Sun,
      title: 'Vermeiden',
      tips: [
        'Kontakt mit Parfüm, Cremes und Chemikalien',
        'Tragen beim Sport oder schwerer körperlicher Arbeit',
        'Extreme Temperaturen und Feuchtigkeit',
        'Starke Stöße oder Zugkräfte am Draht'
      ],
      color: 'elbfunkeln-green'
    }
  ];

  const materials = [
    {
      name: 'Silberdraht',
      description: 'Edler 925er Silberdraht für hochwertige Schmuckstücke',
      care: [
        'Regelmäßig mit Silberputztuch polieren',
        'Bei Anlaufen spezielle Silberreiniger verwenden',
        'Luftdicht lagern um Oxidation zu verhindern'
      ]
    },
    {
      name: 'Kupferdraht',
      description: 'Warmer Kupferton für rustikale und natürliche Designs',
      care: [
        'Patina ist natürlich und erwünscht',
        'Mit Zitronensaft und Salz reinigen',
        'Schutzlack verhindert weitere Oxidation'
      ]
    },
    {
      name: 'Edelstahldraht',
      description: 'Rostfreier und besonders langlebiger Draht',
      care: [
        'Sehr pflegeleicht und robust',
        'Mit warmem Wasser und Seife reinigen',
        'Keine besonderen Lagerungsanforderungen'
      ]
    }
  ];

  const dosDonts = {
    dos: [
      'Schmuck vor dem Duschen oder Schwimmen abnehmen',
      'Regelmäßig auf Beschädigungen prüfen',
      'Bei Problemen sofort professionelle Hilfe suchen',
      'Schmuck als letztes anziehen und als erstes abnehmen'
    ],
    donts: [
      'Niemals mit Ultraschallreinigern behandeln',
      'Nicht in der Spülmaschine reinigen',
      'Keine Bleichmittel oder Ammoniak verwenden',
      'Nicht grob am Draht ziehen oder verbiegen'
    ]
  };

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
            Pflege-Tipps
          </h1>
          <p className="font-inter text-elbfunkeln-green/70 max-w-2xl mx-auto">
            Damit Ihr handgemachter Drahtschmuck lange schön bleibt, haben wir die wichtigsten Pflege- und Aufbewahrungstipps für Sie zusammengestellt.
          </p>
        </motion.div>

        {/* Main Care Tips */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {careTips.map((tip, index) => (
            <motion.div
              key={tip.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8"
            >
              <div className={`bg-${tip.color}/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6`}>
                <tip.icon className={`w-8 h-8 text-${tip.color}`} />
              </div>
              
              <h2 className="font-cormorant text-2xl text-elbfunkeln-green mb-6 text-center">
                {tip.title}
              </h2>
              
              <ul className="space-y-3">
                {tip.tips.map((tipText, tipIndex) => (
                  <motion.li
                    key={tipIndex}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 + tipIndex * 0.05 }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle className={`w-5 h-5 text-${tip.color} mt-1 flex-shrink-0`} />
                    <span className="font-inter text-sm text-elbfunkeln-green/80">
                      {tipText}
                    </span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Material Specific Care */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 mb-8"
        >
          <h2 className="font-cormorant text-2xl text-elbfunkeln-green mb-8 text-center">
            Materialspezifische Pflege
          </h2>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {materials.map((material, index) => (
              <motion.div
                key={material.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-md"
              >
                <h3 className="font-cormorant text-xl text-elbfunkeln-green mb-3">
                  {material.name}
                </h3>
                <p className="font-inter text-sm text-elbfunkeln-green/70 mb-4">
                  {material.description}
                </p>
                
                <div className="space-y-2">
                  {material.care.map((carePoint, careIndex) => (
                    <div key={careIndex} className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-elbfunkeln-lavender mt-1 flex-shrink-0" />
                      <span className="font-inter text-sm text-elbfunkeln-green/80">
                        {carePoint}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Do's and Don'ts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 mb-8"
        >
          <h2 className="font-cormorant text-2xl text-elbfunkeln-green mb-8 text-center">
            Do's & Don'ts
          </h2>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Do's */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <h3 className="font-cormorant text-xl text-elbfunkeln-green">
                  Das sollten Sie tun
                </h3>
              </div>
              
              <div className="space-y-3">
                {dosDonts.dos.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.05 }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <span className="font-inter text-sm text-elbfunkeln-green/80">
                      {item}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
            
            {/* Don'ts */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <AlertTriangle className="w-6 h-6 text-red-500" />
                <h3 className="font-cormorant text-xl text-elbfunkeln-green">
                  Das sollten Sie vermeiden
                </h3>
              </div>
              
              <div className="space-y-3">
                {dosDonts.donts.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.05 }}
                    className="flex items-start gap-3"
                  >
                    <AlertTriangle className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                    <span className="font-inter text-sm text-elbfunkeln-green/80">
                      {item}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Professional Care */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-elbfunkeln-lavender/20 rounded-2xl p-8 text-center"
        >
          <Sparkles className="w-12 h-12 text-elbfunkeln-lavender mx-auto mb-4" />
          <h2 className="font-cormorant text-2xl text-elbfunkeln-green mb-4">
            Professionelle Pflege
          </h2>
          <p className="font-inter text-elbfunkeln-green/70 mb-6 max-w-2xl mx-auto">
            Bei größeren Beschädigungen oder speziellen Pflegefragen stehen wir Ihnen gerne zur Verfügung. 
            Wir bieten professionelle Reinigung und Reparaturen für Ihren Elbfunkeln Schmuck an.
          </p>
          
          <a 
            href="mailto:pflege@elbfunkeln.de"
            className="bg-elbfunkeln-green text-white px-8 py-3 rounded-xl font-inter hover:bg-elbfunkeln-green/90 transition-colors inline-flex items-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            Professionelle Pflege anfragen
          </a>
        </motion.div>
      </div>
    </div>
  );
}