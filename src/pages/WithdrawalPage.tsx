import { motion } from 'motion/react';
import { RotateCcw, Clock, FileText, Mail, AlertCircle } from 'lucide-react';

export function WithdrawalPage() {
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
            <RotateCcw className="w-8 h-8 text-elbfunkeln-lavender" />
            <h1 className="font-cormorant text-4xl text-elbfunkeln-green">
              Widerrufsrecht
            </h1>
          </div>
          <p className="font-inter text-elbfunkeln-green/70">
            Ihre Rechte bei Online-Bestellungen
          </p>
        </motion.div>

        {/* Withdrawal Right */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-6 h-6 text-elbfunkeln-lavender" />
            <h2 className="font-cormorant text-2xl text-elbfunkeln-green">
              Widerrufsbelehrung
            </h2>
          </div>
          
          <div className="bg-elbfunkeln-lavender/20 rounded-xl p-6 mb-6">
            <h3 className="font-cormorant text-xl text-elbfunkeln-green mb-4">
              Widerrufsrecht
            </h3>
            <p className="font-inter text-elbfunkeln-green/80 leading-relaxed">
              Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen. 
              Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag, an dem Sie oder ein von Ihnen benannter Dritter, 
              der nicht der Beförderer ist, die Waren in Besitz genommen haben bzw. hat.
            </p>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-cormorant text-lg text-elbfunkeln-green mb-2">
                Ausübung des Widerrufsrechts
              </h3>
              <p className="font-inter text-sm text-elbfunkeln-green/80 leading-relaxed">
                Um Ihr Widerrufsrecht auszuüben, müssen Sie uns (Elbfunkeln, Elbstraße 123, 20359 Hamburg, 
                Telefon: +49 40 123 456 789, E-Mail: widerruf@elbfunkeln.de) mittels einer eindeutigen 
                Erklärung (z.B. ein mit der Post versandter Brief, Telefax oder E-Mail) über Ihren 
                Entschluss, diesen Vertrag zu widerrufen, informieren.
              </p>
            </div>
            
            <div>
              <h3 className="font-cormorant text-lg text-elbfunkeln-green mb-2">
                Widerrufsfrist
              </h3>
              <p className="font-inter text-sm text-elbfunkeln-green/80 leading-relaxed">
                Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die 
                Ausübung des Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Consequences of Withdrawal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 mb-8"
        >
          <h2 className="font-cormorant text-2xl text-elbfunkeln-green mb-6">
            Folgen des Widerrufs
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-cormorant text-lg text-elbfunkeln-green mb-3">
                Rückzahlung
              </h3>
              <p className="font-inter text-sm text-elbfunkeln-green/80 leading-relaxed">
                Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen 
                erhalten haben, einschließlich der Lieferkosten (mit Ausnahme der zusätzlichen Kosten, 
                die sich daraus ergeben, dass Sie eine andere Art der Lieferung als die von uns 
                angebotene, günstigste Standardlieferung gewählt haben), unverzüglich und spätestens 
                binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über Ihren 
                Widerruf dieses Vertrags bei uns eingegangen ist.
              </p>
            </div>
            
            <div>
              <h3 className="font-cormorant text-lg text-elbfunkeln-green mb-3">
                Rückgabe der Waren
              </h3>
              <p className="font-inter text-sm text-elbfunkeln-green/80 leading-relaxed">
                Sie haben die Waren unverzüglich und in jedem Fall spätestens binnen vierzehn Tagen 
                ab dem Tag, an dem Sie uns über den Widerruf dieses Vertrags unterrichten, an uns 
                zurückzusenden oder zu übergeben. Die Frist ist gewahrt, wenn Sie die Waren vor 
                Ablauf der Frist von vierzehn Tagen absenden.
              </p>
            </div>
            
            <div>
              <h3 className="font-cormorant text-lg text-elbfunkeln-green mb-3">
                Rücksendungskosten
              </h3>
              <p className="font-inter text-sm text-elbfunkeln-green/80 leading-relaxed">
                Wir tragen die Kosten der Rücksendung der Waren. Sie müssen für einen etwaigen 
                Wertverlust der Waren nur aufkommen, wenn dieser Wertverlust auf einen zur Prüfung 
                der Beschaffenheit, Eigenschaften und Funktionsweise der Waren nicht notwendigen 
                Umgang mit ihnen zurückzuführen ist.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Exclusions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <AlertCircle className="w-6 h-6 text-elbfunkeln-rose" />
            <h2 className="font-cormorant text-2xl text-elbfunkeln-green">
              Ausschluss des Widerrufsrechts
            </h2>
          </div>
          
          <p className="font-inter text-sm text-elbfunkeln-green/80 leading-relaxed mb-4">
            Das Widerrufsrecht besteht nicht bei folgenden Verträgen:
          </p>
          
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-elbfunkeln-rose mt-1 flex-shrink-0" />
              <span className="font-inter text-sm text-elbfunkeln-green/80">
                Verträge zur Lieferung von Waren, die nach Kundenspezifikation angefertigt werden 
                oder eindeutig auf die persönlichen Bedürfnisse zugeschnitten sind
              </span>
            </li>
            <li className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-elbfunkeln-rose mt-1 flex-shrink-0" />
              <span className="font-inter text-sm text-elbfunkeln-green/80">
                Verträge zur Lieferung von Waren, die schnell verderben können oder 
                deren Verfallsdatum schnell überschritten würde
              </span>
            </li>
            <li className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-elbfunkeln-rose mt-1 flex-shrink-0" />
              <span className="font-inter text-sm text-elbfunkeln-green/80">
                Verträge zur Lieferung versiegelter Waren, die aus Gründen des Gesundheitsschutzes 
                oder der Hygiene nicht zur Rückgabe geeignet sind
              </span>
            </li>
          </ul>
        </motion.div>

        {/* Withdrawal Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-6 h-6 text-elbfunkeln-lavender" />
            <h2 className="font-cormorant text-2xl text-elbfunkeln-green">
              Muster-Widerrufsformular
            </h2>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-6 border-l-4 border-elbfunkeln-lavender">
            <p className="font-inter text-sm text-elbfunkeln-green/80 leading-relaxed mb-4">
              Wenn Sie den Vertrag widerrufen wollen, dann füllen Sie bitte dieses Formular aus 
              und senden Sie es zurück:
            </p>
            
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <p className="font-inter text-sm text-elbfunkeln-green/80 leading-relaxed">
                <strong>An:</strong><br />
                Elbfunkeln<br />
                Elbstraße 123<br />
                20359 Hamburg<br />
                E-Mail: widerruf@elbfunkeln.de<br /><br />
                
                <strong>Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag 
                über den Kauf der folgenden Waren (*)/ die Erbringung der folgenden Dienstleistung (*):</strong><br /><br />
                
                _________________________________________________<br /><br />
                
                <strong>Bestellt am (*)/erhalten am (*):</strong><br />
                _________________________________________________<br /><br />
                
                <strong>Name des/der Verbraucher(s):</strong><br />
                _________________________________________________<br /><br />
                
                <strong>Anschrift des/der Verbraucher(s):</strong><br />
                _________________________________________________<br /><br />
                
                <strong>Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier):</strong><br />
                _________________________________________________<br /><br />
                
                <strong>Datum:</strong><br />
                _________________________________________________<br /><br />
                
                (*) Unzutreffendes streichen.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Contact for Withdrawal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-elbfunkeln-lavender/20 rounded-2xl p-8 text-center"
        >
          <Mail className="w-12 h-12 text-elbfunkeln-lavender mx-auto mb-4" />
          <h2 className="font-cormorant text-2xl text-elbfunkeln-green mb-4">
            Widerruf einreichen
          </h2>
          <p className="font-inter text-elbfunkeln-green/70 mb-6 max-w-2xl mx-auto">
            Sie können Ihren Widerruf ganz einfach per E-Mail, Post oder Telefon bei uns einreichen. 
            Wir bearbeiten Ihren Widerruf umgehend und informieren Sie über die weiteren Schritte.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="mailto:widerruf@elbfunkeln.de"
              className="bg-elbfunkeln-green text-white px-6 py-3 rounded-xl font-inter hover:bg-elbfunkeln-green/90 transition-colors flex items-center gap-2 justify-center"
            >
              <Mail className="w-5 h-5" />
              E-Mail Widerruf
            </a>
            <a 
              href="tel:+4940123456789"
              className="bg-white text-elbfunkeln-green px-6 py-3 rounded-xl font-inter hover:bg-white/90 transition-colors flex items-center gap-2 justify-center border border-elbfunkeln-green/20"
            >
              <RotateCcw className="w-5 h-5" />
              Telefonischer Widerruf
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}