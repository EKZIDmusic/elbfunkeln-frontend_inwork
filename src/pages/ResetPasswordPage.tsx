import { useState } from 'react';
import { motion } from 'motion/react';
import { Key, Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { useAuth } from '../components/AuthContext';
import { useRouter } from '../components/Router';

export function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [showResetForm, setShowResetForm] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false
  });
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { resetPassword, updatePassword } = useAuth();
  const { navigateTo } = useRouter();

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (!email) {
      setError('❌ Bitte gib deine E-Mail-Adresse ein.');
      setIsLoading(false);
      return;
    }

    try {
      const success = await resetPassword(email);
      
      if (success) {
        setSuccess('✅ Reset-E-Mail wurde gesendet! Prüfe dein Postfach und folge den Anweisungen.');
        setShowResetForm(true);
      } else {
        setError('❌ E-Mail-Adresse nicht gefunden oder anderer Fehler aufgetreten.');
      }
    } catch (err) {
      console.error('Reset request error:', err);
      setError('❌ Verbindungsfehler. Bitte versuche es später erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validierung
    if (!passwordData.newPassword || passwordData.newPassword.length < 6) {
      setError('❌ Das Passwort muss mindestens 6 Zeichen lang sein.');
      setIsLoading(false);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('❌ Die Passwörter stimmen nicht überein.');
      setIsLoading(false);
      return;
    }

    try {
      const success = await updatePassword(passwordData.newPassword);
      
      if (success) {
        setSuccess('✅ Passwort erfolgreich geändert! Du wirst zur Anmeldung weitergeleitet...');
        
        // Weiterleitung nach 2 Sekunden
        setTimeout(() => {
          navigateTo('login');
        }, 2000);
      } else {
        setError('❌ Fehler beim Ändern des Passworts. Bitte versuche es erneut.');
      }
    } catch (err) {
      console.error('Password update error:', err);
      setError('❌ Verbindungsfehler. Bitte versuche es später erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-24">
      <div className="container mx-auto px-4">
        <motion.div
          className="max-w-md mx-auto"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              className="inline-block mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-elbfunkeln-green to-elbfunkeln-rose rounded-full flex items-center justify-center mx-auto shadow-lg">
                {success && showResetForm ? (
                  <CheckCircle className="w-10 h-10 text-white" />
                ) : (
                  <Key className="w-10 h-10 text-white" />
                )}
              </div>
            </motion.div>
            <h1 className="font-cormorant text-3xl text-elbfunkeln-green mb-2">
              Passwort zurücksetzen 🔑
            </h1>
            <p className="font-inter text-elbfunkeln-green/70">
              {!showResetForm 
                ? 'Gib deine E-Mail-Adresse ein, um ein neues Passwort zu erstellen'
                : 'Erstelle ein neues, sicheres Passwort für dein Konto'
              }
            </p>
          </div>

          {/* Reset Request Form */}
          {!showResetForm && (
            <Card className="p-8 border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <form onSubmit={handleRequestReset} className="space-y-6">
                {/* Email Field */}
                <div>
                  <Label htmlFor="email" className="font-inter text-elbfunkeln-green mb-2 block">
                    E-Mail-Adresse
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-elbfunkeln-green/30 focus:border-elbfunkeln-green"
                    placeholder="deine@email.de"
                    required
                  />
                </div>

                {/* Error/Success Message */}
                {(error || success) && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Alert className={success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                      <AlertDescription className={success ? 'text-green-700' : 'text-red-700'}>
                        {error || success}
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}

                {/* Submit Button */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="submit"
                    className="w-full bg-elbfunkeln-green text-white hover:bg-elbfunkeln-green/90 py-3 disabled:opacity-50"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Wird gesendet...
                      </div>
                    ) : (
                      <>
                        <Key className="w-5 h-5 mr-2" />
                        Reset-E-Mail senden
                      </>
                    )}
                  </Button>
                </motion.div>
              </form>
            </Card>
          )}

          {/* Password Update Form */}
          {showResetForm && (
            <Card className="p-8 border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <form onSubmit={handlePasswordUpdate} className="space-y-6">
                {/* New Password */}
                <div>
                  <Label htmlFor="newPassword" className="font-inter text-elbfunkeln-green mb-2 block">
                    Neues Passwort
                  </Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="pr-10 border-elbfunkeln-green/30 focus:border-elbfunkeln-green"
                      placeholder="Mindestens 6 Zeichen"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-elbfunkeln-green/40 hover:text-elbfunkeln-green transition-colors"
                    >
                      {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <Label htmlFor="confirmPassword" className="font-inter text-elbfunkeln-green mb-2 block">
                    Passwort bestätigen
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="pr-10 border-elbfunkeln-green/30 focus:border-elbfunkeln-green"
                      placeholder="Passwort wiederholen"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-elbfunkeln-green/40 hover:text-elbfunkeln-green transition-colors"
                    >
                      {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Error/Success Message */}
                {(error || success) && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Alert className={success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                      <AlertDescription className={success ? 'text-green-700' : 'text-red-700'}>
                        {error || success}
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}

                {/* Submit Button */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-elbfunkeln-green to-elbfunkeln-rose text-white hover:from-elbfunkeln-rose hover:to-elbfunkeln-green py-3 rounded-full shadow-lg disabled:opacity-50"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Wird gespeichert...
                      </div>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Passwort speichern
                      </>
                    )}
                  </Button>
                </motion.div>
              </form>
            </Card>
          )}

          {/* Back Navigation */}
          <div className="text-center mt-6">
            <Button
              variant="ghost"
              onClick={() => navigateTo('login')}
              className="text-elbfunkeln-green hover:text-elbfunkeln-rose"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück zur Anmeldung
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}