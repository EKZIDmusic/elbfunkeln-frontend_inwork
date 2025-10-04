import { useState } from 'react';
import { motion } from 'motion/react';
import { UserPlus, Eye, EyeOff, User, Lock, Mail, Phone } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Checkbox } from '../components/ui/checkbox';
import { useAuth } from '../components/AuthContext';
import { useRouter } from '../components/Router';
import registrationImage from 'figma:asset/55a30cac4dd6965b1b3e46d7856bd1796e58b305.png';

export function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptMarketing, setAcceptMarketing] = useState(false);
  
  const { register } = useAuth();
  const { navigateTo } = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validierung
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError('Bitte fülle alle Pflichtfelder aus.');
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Die Passwörter stimmen nicht überein.');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Das Passwort muss mindestens 6 Zeichen lang sein.');
      setIsLoading(false);
      return;
    }

    if (!acceptTerms) {
      setError('Bitte akzeptiere die Nutzungsbedingungen.');
      setIsLoading(false);
      return;
    }

    try {
      const success = await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        marketingConsent: acceptMarketing
      });

      if (success) {
        setError('✅ Registrierung erfolgreich! Dein Konto wurde erstellt und du wirst weitergeleitet...');
        
        // Small delay to show success message
        setTimeout(() => {
          navigateTo('account');
        }, 1500);
      } else {
        setError('Registrierung fehlgeschlagen. Möglicherweise existiert bereits ein Konto mit dieser E-Mail-Adresse.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Verbindungsfehler. Bitte versuche es später erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-elbfunkeln-beige flex items-center justify-center pt-24 pb-12">
      <div className="container mx-auto px-4">
        <motion.div
          className="max-w-lg mx-auto"
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
              <div className="w-20 h-20 bg-elbfunkeln-green rounded-full flex items-center justify-center mx-auto shadow-lg">
                <UserPlus className="w-10 h-10 text-white" />
              </div>
            </motion.div>
            <h1 className="font-cormorant text-3xl text-elbfunkeln-green mb-2">
              Konto erstellen ✨
            </h1>
            <p className="font-inter text-elbfunkeln-green/80 leading-relaxed">
              Werde Teil der Elbfunkeln-Community und entdecke unsere handgefertigten Schmuckstücke
            </p>
          </div>

          {/* Registration Form */}
          <Card className="p-8 border-0 shadow-xl bg-white">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="font-inter text-elbfunkeln-green mb-2 block">
                    Vorname *
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-elbfunkeln-green/40" />
                    <Input
                      id="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="pl-10 bg-white border-elbfunkeln-green/30 focus:border-elbfunkeln-green"
                      placeholder="Anna"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="lastName" className="font-inter text-elbfunkeln-green mb-2 block">
                    Nachname *
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-elbfunkeln-green/40" />
                    <Input
                      id="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="pl-10 bg-white border-elbfunkeln-green/30 focus:border-elbfunkeln-green"
                      placeholder="Mustermann"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Email Field */}
              <div>
                <Label htmlFor="email" className="font-inter text-elbfunkeln-green mb-2 block">
                  E-Mail-Adresse *
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-elbfunkeln-green/40" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="pl-10 bg-white border-elbfunkeln-green/30 focus:border-elbfunkeln-green"
                    placeholder="anna@beispiel.de"
                    required
                  />
                </div>
              </div>

              {/* Phone Field */}
              <div>
                <Label htmlFor="phone" className="font-inter text-elbfunkeln-green mb-2 block">
                  Telefonnummer (optional)
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-elbfunkeln-green/40" />
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="pl-10 bg-white border-elbfunkeln-green/30 focus:border-elbfunkeln-green"
                    placeholder="+49 123 456 789"
                  />
                </div>
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="password" className="font-inter text-elbfunkeln-green mb-2 block">
                    Passwort *
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-elbfunkeln-green/40" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="pl-10 pr-10 bg-white border-elbfunkeln-green/30 focus:border-elbfunkeln-green"
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-elbfunkeln-green/40 hover:text-elbfunkeln-green transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="confirmPassword" className="font-inter text-elbfunkeln-green mb-2 block">
                    Passwort bestätigen *
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-elbfunkeln-green/40" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className="pl-10 pr-10 bg-white border-elbfunkeln-green/30 focus:border-elbfunkeln-green"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-elbfunkeln-green/40 hover:text-elbfunkeln-green transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="acceptTerms"
                    checked={acceptTerms}
                    onCheckedChange={setAcceptTerms}
                    className="mt-1"
                  />
                  <Label htmlFor="acceptTerms" className="text-sm text-elbfunkeln-green leading-relaxed">
                    Ich akzeptiere die{' '}
                    <button
                      type="button"
                      className="text-elbfunkeln-green hover:text-elbfunkeln-rose underline"
                      onClick={() => navigateTo('terms')}
                    >
                      Nutzungsbedingungen
                    </button>{' '}
                    und{' '}
                    <button
                      type="button"
                      className="text-elbfunkeln-green hover:text-elbfunkeln-rose underline"
                      onClick={() => navigateTo('privacy')}
                    >
                      Datenschutzerklärung
                    </button>
                    .*
                  </Label>
                </div>
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="acceptMarketing"
                    checked={acceptMarketing}
                    onCheckedChange={setAcceptMarketing}
                    className="mt-1"
                  />
                  <Label htmlFor="acceptMarketing" className="text-sm text-elbfunkeln-green leading-relaxed">
                    Ich möchte den Newsletter erhalten und über neue Kollektionen und Angebote informiert werden. (optional)
                  </Label>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Alert className={error.startsWith('✅') ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                    <AlertDescription className={error.startsWith('✅') ? 'text-green-700' : 'text-red-700'}>
                      {error}
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
                      Konto wird erstellt...
                    </div>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5 mr-2" />
                      Konto erstellen
                    </>
                  )}
                </Button>
              </motion.div>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-elbfunkeln-green/70">
                <button
                  type="button"
                  onClick={() => navigateTo('login')}
                  className="text-elbfunkeln-green hover:text-elbfunkeln-rose underline"
                >
                  hier anmelden
                </button>
              </p>
            </div>
          </Card>

          {/* Back to Shop */}
          <div className="text-center mt-6">
            <Button
              variant="ghost"
              onClick={() => navigateTo('home')}
              className="text-elbfunkeln-green hover:text-elbfunkeln-rose"
            >
              ← Zurück zum Shop
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}