import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, UserPlus, Mail, Lock, X, 
  ShoppingBag, Shield, Clock, CheckCircle, Phone, UserCheck 
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Separator } from './ui/separator';
import { useAuth } from './AuthContext';
import { Checkbox } from './ui/checkbox';

interface LoginGuestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
  onGuestCheckout: () => void;
}

export function LoginGuestDialog({ 
  isOpen, 
  onClose, 
  onLoginSuccess, 
  onGuestCheckout 
}: LoginGuestDialogProps) {
  const { login, register } = useAuth();
  const [currentView, setCurrentView] = useState<'choice' | 'login' | 'register'>('choice');
  
  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  
  // Registration state
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regMarketingConsent, setRegMarketingConsent] = useState(false);
  const [registerError, setRegisterError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setLoginError('Bitte füllen Sie alle Felder aus');
      return;
    }

    setIsLoading(true);
    setLoginError('');

    try {
      const success = await login(email, password);
      if (success) {
        onLoginSuccess();
      } else {
        setLoginError('Ungültige E-Mail oder Passwort');
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!regFirstName || !regLastName || !regEmail || !regPassword) {
      setRegisterError('Bitte füllen Sie alle Pflichtfelder aus');
      return;
    }

    if (regPassword !== regPasswordConfirm) {
      setRegisterError('Die Passwörter stimmen nicht überein');
      return;
    }

    if (regPassword.length < 6) {
      setRegisterError('Das Passwort muss mindestens 6 Zeichen lang sein');
      return;
    }

    setIsLoading(true);
    setRegisterError('');

    try {
      const success = await register({
        email: regEmail,
        password: regPassword,
        firstName: regFirstName,
        lastName: regLastName,
        phone: regPhone || undefined,
        marketingConsent: regMarketingConsent
      });
      
      if (success) {
        onLoginSuccess();
      } else {
        setRegisterError('Registrierung fehlgeschlagen. Diese E-Mail-Adresse ist möglicherweise bereits registriert.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setRegisterError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetDialog = () => {
    setCurrentView('choice');
    setEmail('');
    setPassword('');
    setLoginError('');
    setRegFirstName('');
    setRegLastName('');
    setRegEmail('');
    setRegPassword('');
    setRegPasswordConfirm('');
    setRegPhone('');
    setRegMarketingConsent(false);
    setRegisterError('');
    setIsLoading(false);
  };

  const handleClose = () => {
    resetDialog();
    onClose();
  };

  const benefits = [
    {
      icon: <Clock className="h-5 w-5 text-elbfunkeln-green" />,
      title: 'Schnellere Bestellung',
      description: 'Ihre gespeicherten Adress- und Zahlungsdaten werden automatisch ausgefüllt'
    },
    {
      icon: <Shield className="h-5 w-5 text-elbfunkeln-lavender" />,
      title: 'Bestellhistorie',
      description: 'Verfolgen Sie alle Ihre Bestellungen und Lieferungen an einem Ort'
    },
    {
      icon: <CheckCircle className="h-5 w-5 text-elbfunkeln-rose" />,
      title: 'Exklusive Vorteile',
      description: 'Erhalten Sie als Kunde spezielle Angebote und frühen Zugang zu neuen Kollektionen'
    }
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="bg-white border-elbfunkeln-green/20 relative overflow-hidden">
            {/* Close Button */}
            <Button
              variant="ghost"
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>

            <AnimatePresence mode="wait">
              {currentView === 'choice' ? (
                // Initial Choice Screen
                <motion.div
                  key="choice"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="p-8"
                >
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-elbfunkeln-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShoppingBag className="h-8 w-8 text-elbfunkeln-green" />
                    </div>
                    <h2 className="font-cormorant text-3xl text-elbfunkeln-green mb-2">
                      Zur Kasse gehen
                    </h2>
                    <p className="text-gray-600">
                      Möchten Sie sich anmelden, um Ihre gespeicherten Daten zu verwenden?
                    </p>
                  </div>

                  {/* Benefits */}
                  <div className="mb-8 space-y-4">
                    <h3 className="font-medium text-elbfunkeln-green text-center mb-4">
                      Vorteile eines Kundenkontos:
                    </h3>
                    {benefits.map((benefit, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          {benefit.icon}
                        </div>
                        <div>
                          <h4 className="font-medium text-sm mb-1">{benefit.title}</h4>
                          <p className="text-xs text-gray-600">{benefit.description}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Button
                      onClick={() => setCurrentView('login')}
                      className="w-full bg-elbfunkeln-green hover:bg-[#5a5a52] text-white h-12 border border-elbfunkeln-green"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Anmelden und zur Kasse
                    </Button>
                    
                    <Button
                      onClick={() => setCurrentView('register')}
                      variant="outline"
                      className="w-full border-2 border-[#9bb0ff] text-[#7a8bff] hover:bg-[#9bb0ff]/15 hover:border-[#7a8bff] h-12 bg-white"
                    >
                      <UserCheck className="h-4 w-4 mr-2" />
                      Registrieren und zur Kasse
                    </Button>
                    
                    <Button
                      onClick={onGuestCheckout}
                      variant="outline"
                      className="w-full border-2 border-[#8f5a5a] text-[#8f5a5a] hover:bg-[#8f5a5a]/15 hover:border-[#7a4848] h-12 bg-white"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Als Gast bestellen
                    </Button>
                  </div>

                  <p className="text-xs text-gray-500 text-center mt-4">
                    Sie können sich auch nach der Bestellung registrieren
                  </p>
                </motion.div>
              ) : currentView === 'login' ? (
                // Login Form
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="p-8"
                >
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-elbfunkeln-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="h-8 w-8 text-elbfunkeln-green" />
                    </div>
                    <h2 className="font-cormorant text-2xl text-elbfunkeln-green mb-2">
                      Anmelden
                    </h2>
                    <p className="text-gray-600">
                      Melden Sie sich an, um Ihre gespeicherten Daten zu verwenden
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-elbfunkeln-green mb-2">
                        E-Mail-Adresse
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="ihre@email.de"
                          className="pl-10 bg-white border-elbfunkeln-green/40 focus:border-elbfunkeln-green border-2"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-elbfunkeln-green mb-2">
                        Passwort
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Ihr Passwort"
                          className="pl-10 bg-white border-elbfunkeln-green/40 focus:border-elbfunkeln-green border-2"
                          onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                        />
                      </div>
                    </div>

                    {loginError && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="p-3 bg-red-50 border border-red-200 rounded-lg"
                      >
                        <p className="text-red-700 text-sm">{loginError}</p>
                      </motion.div>
                    )}

                    <div className="space-y-3 pt-2">
                      <Button
                        onClick={handleLogin}
                        disabled={isLoading}
                        className="w-full bg-elbfunkeln-green hover:bg-elbfunkeln-green/90 text-white h-12"
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Anmelden...
                          </>
                        ) : (
                          <>
                            <User className="h-4 w-4 mr-2" />
                            Anmelden und zur Kasse
                          </>
                        )}
                      </Button>

                      <Separator className="my-4" />

                      <Button
                        onClick={() => setCurrentView('choice')}
                        variant="outline"
                        className="w-full border-2 border-gray-400 text-gray-700 hover:bg-gray-100 hover:border-gray-500"
                      >
                        Zurück
                      </Button>

                      <Button
                        onClick={onGuestCheckout}
                        variant="ghost"
                        className="w-full text-[#8f5a5a] hover:bg-[#8f5a5a]/15 font-medium"
                      >
                        Oder als Gast bestellen
                      </Button>
                    </div>
                  </div>

                  {/* Demo Credentials */}
                  <div className="mt-6 p-4 bg-elbfunkeln-beige/30 rounded-lg">
                    <h4 className="font-medium text-sm text-elbfunkeln-green mb-2">Demo-Zugangsdaten:</h4>
                    <div className="text-xs space-y-1 text-gray-600">
                      <p><strong>Kunde:</strong> sarah.mueller@example.com / customer123</p>
                      <p><strong>Shop Owner:</strong> owner@elbfunkeln.de / owner123</p>
                      <p><strong>Admin:</strong> admin@elbfunkeln.de / admin123</p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                // Registration Form
                <motion.div
                  key="register"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="p-8"
                >
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-[#9bb0ff]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <UserCheck className="h-8 w-8 text-[#7a8bff]" />
                    </div>
                    <h2 className="font-cormorant text-2xl text-elbfunkeln-green mb-2">
                      Registrieren
                    </h2>
                    <p className="text-gray-600">
                      Erstellen Sie ein Konto für schnellere zukünftige Bestellungen
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-elbfunkeln-green mb-2">
                          Vorname *
                        </label>
                        <Input
                          value={regFirstName}
                          onChange={(e) => setRegFirstName(e.target.value)}
                          placeholder="Ihr Vorname"
                          className="bg-white border-elbfunkeln-green/50 focus:border-elbfunkeln-green border-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-elbfunkeln-green mb-2">
                          Nachname *
                        </label>
                        <Input
                          value={regLastName}
                          onChange={(e) => setRegLastName(e.target.value)}
                          placeholder="Ihr Nachname"
                          className="bg-white border-elbfunkeln-green/50 focus:border-elbfunkeln-green border-2"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-elbfunkeln-green mb-2">
                        E-Mail-Adresse *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="email"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="ihre@email.de"
                          className="pl-10 bg-white border-elbfunkeln-green/50 focus:border-elbfunkeln-green border-2"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-elbfunkeln-green mb-2">
                        Telefonnummer (optional)
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="tel"
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          placeholder="+49 123 456789"
                          className="pl-10 bg-white border-elbfunkeln-green/50 focus:border-elbfunkeln-green border-2"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-elbfunkeln-green mb-2">
                        Passwort *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="password"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="Mindestens 6 Zeichen"
                          className="pl-10 bg-white border-elbfunkeln-green/50 focus:border-elbfunkeln-green border-2"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-elbfunkeln-green mb-2">
                        Passwort wiederholen *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="password"
                          value={regPasswordConfirm}
                          onChange={(e) => setRegPasswordConfirm(e.target.value)}
                          placeholder="Passwort bestätigen"
                          className="pl-10 bg-white border-elbfunkeln-green/30 focus:border-elbfunkeln-green"
                          onKeyPress={(e) => e.key === 'Enter' && handleRegister()}
                        />
                      </div>
                    </div>

                    <div className="flex items-start space-x-2 pt-2">
                      <Checkbox
                        id="marketing"
                        checked={regMarketingConsent}
                        onCheckedChange={(checked) => setRegMarketingConsent(checked as boolean)}
                        className="mt-1"
                      />
                      <label htmlFor="marketing" className="text-sm text-gray-600 leading-tight">
                        Ich möchte über neue Kollektionen und exklusive Angebote per E-Mail informiert werden.
                      </label>
                    </div>

                    {registerError && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="p-3 bg-red-50 border border-red-200 rounded-lg"
                      >
                        <p className="text-red-700 text-sm">{registerError}</p>
                      </motion.div>
                    )}

                    <div className="space-y-3 pt-2">
                      <Button
                        onClick={handleRegister}
                        disabled={isLoading}
                        className="w-full bg-[#7a8bff] hover:bg-[#6b7aff] text-white h-12 border border-[#7a8bff]"
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Registrieren...
                          </>
                        ) : (
                          <>
                            <UserCheck className="h-4 w-4 mr-2" />
                            Registrieren und zur Kasse
                          </>
                        )}
                      </Button>

                      <Separator className="my-4" />

                      <Button
                        onClick={() => setCurrentView('choice')}
                        variant="outline"
                        className="w-full border-2 border-gray-400 text-gray-700 hover:bg-gray-100 hover:border-gray-500"
                      >
                        Zurück
                      </Button>

                      <Button
                        onClick={onGuestCheckout}
                        variant="ghost"
                        className="w-full text-[#8f5a5a] hover:bg-[#8f5a5a]/15 font-medium"
                      >
                        Oder als Gast bestellen
                      </Button>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 text-center mt-4">
                    Mit der Registrierung stimmen Sie unseren Nutzungsbedingungen und der Datenschutzerklärung zu.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}