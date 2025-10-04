import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  UserPlus, Mail, Lock, Eye, EyeOff, 
  Star, Shield, Clock, Gift, CheckCircle, X 
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { useAuth } from './AuthContext';

interface GuestRegistrationOfferProps {
  isOpen: boolean;
  onClose: () => void;
  onRegistrationSuccess: () => void;
}

export function GuestRegistrationOffer({ 
  isOpen, 
  onClose, 
  onRegistrationSuccess 
}: GuestRegistrationOfferProps) {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    marketingConsent: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const benefits = [
    {
      icon: <Clock className="h-5 w-5 text-elbfunkeln-green" />,
      title: 'Schnellere zukünftige Bestellungen',
      description: 'Adress- und Zahlungsdaten werden gespeichert'
    },
    {
      icon: <Shield className="h-5 w-5 text-elbfunkeln-lavender" />,
      title: 'Bestellhistorie & Tracking',
      description: 'Verfolgen Sie alle Ihre Bestellungen'
    },
    {
      icon: <Gift className="h-5 w-5 text-elbfunkeln-rose" />,
      title: 'Exklusive Angebote',
      description: 'Erste Information über neue Kollektionen'
    },
    {
      icon: <Star className="h-5 w-5 text-elbfunkeln-green" />,
      title: '10% Willkommensrabatt',
      description: 'Für Ihre nächste Bestellung'
    }
  ];

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Vorname ist erforderlich';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Nachname ist erforderlich';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-Mail ist erforderlich';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Ungültige E-Mail-Adresse';
    }

    if (!formData.password) {
      newErrors.password = 'Passwort ist erforderlich';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Passwort muss mindestens 6 Zeichen lang sein';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwörter stimmen nicht überein';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      const success = await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        marketingConsent: formData.marketingConsent
      });

      if (success) {
        onRegistrationSuccess();
      } else {
        setErrors({ 
          general: 'Registrierung fehlgeschlagen. Diese E-Mail ist möglicherweise bereits registriert.' 
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ 
        general: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      marketingConsent: false
    });
    setErrors({});
    setIsLoading(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

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
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-3xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="bg-white border-elbfunkeln-green/20 relative">
            {/* Close Button */}
            <Button
              variant="ghost"
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>

            <div className="p-8">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-elbfunkeln-green/20 to-elbfunkeln-lavender/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserPlus className="h-10 w-10 text-elbfunkeln-green" />
                </div>
                <h2 className="font-cormorant text-3xl text-elbfunkeln-green mb-2">
                  Konto erstellen
                </h2>
                <p className="text-gray-600 max-w-md mx-auto">
                  Erstellen Sie jetzt Ihr Konto und profitieren Sie von exklusiven Vorteilen für zukünftige Bestellungen.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Benefits */}
                <div>
                  <h3 className="font-cormorant text-xl text-elbfunkeln-green mb-4">
                    Ihre Vorteile:
                  </h3>
                  <div className="space-y-4">
                    {benefits.map((benefit, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="flex items-start gap-3 p-4 bg-gradient-to-r from-elbfunkeln-beige/30 to-elbfunkeln-lavender/20 rounded-lg"
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

                  <div className="mt-6 p-4 bg-elbfunkeln-green/10 rounded-lg border border-elbfunkeln-green/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Gift className="h-5 w-5 text-elbfunkeln-green" />
                      <span className="font-medium text-elbfunkeln-green">Willkommensgeschenk</span>
                    </div>
                    <p className="text-sm text-elbfunkeln-green/80">
                      Erhalten Sie 10% Rabatt auf Ihre nächste Bestellung!
                    </p>
                  </div>
                </div>

                {/* Registration Form */}
                <div>
                  <h3 className="font-cormorant text-xl text-elbfunkeln-green mb-4">
                    Registrierung:
                  </h3>
                  
                  {errors.general && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg"
                    >
                      <p className="text-red-700 text-sm">{errors.general}</p>
                    </motion.div>
                  )}

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-elbfunkeln-green mb-2">
                          Vorname *
                        </label>
                        <Input
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          placeholder="Max"
                          className={errors.firstName ? 'border-red-300' : ''}
                        />
                        {errors.firstName && (
                          <p className="text-red-600 text-xs mt-1">{errors.firstName}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-elbfunkeln-green mb-2">
                          Nachname *
                        </label>
                        <Input
                          value={formData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          placeholder="Mustermann"
                          className={errors.lastName ? 'border-red-300' : ''}
                        />
                        {errors.lastName && (
                          <p className="text-red-600 text-xs mt-1">{errors.lastName}</p>
                        )}
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
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="max@example.com"
                          className={`pl-10 ${errors.email ? 'border-red-300' : ''}`}
                        />
                      </div>
                      {errors.email && (
                        <p className="text-red-600 text-xs mt-1">{errors.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-elbfunkeln-green mb-2">
                        Passwort *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          placeholder="Mindestens 6 Zeichen"
                          className={`pl-10 pr-10 ${errors.password ? 'border-red-300' : ''}`}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-1 top-1/2 transform -translate-y-1/2 hover:bg-transparent"
                        >
                          {showPassword ? 
                            <EyeOff className="h-4 w-4 text-gray-400" /> : 
                            <Eye className="h-4 w-4 text-gray-400" />
                          }
                        </Button>
                      </div>
                      {errors.password && (
                        <p className="text-red-600 text-xs mt-1">{errors.password}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-elbfunkeln-green mb-2">
                        Passwort bestätigen *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                          placeholder="Passwort wiederholen"
                          className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-red-300' : ''}`}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-1 top-1/2 transform -translate-y-1/2 hover:bg-transparent"
                        >
                          {showConfirmPassword ? 
                            <EyeOff className="h-4 w-4 text-gray-400" /> : 
                            <Eye className="h-4 w-4 text-gray-400" />
                          }
                        </Button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-red-600 text-xs mt-1">{errors.confirmPassword}</p>
                      )}
                    </div>

                    <div className="flex items-start space-x-2 pt-2">
                      <Checkbox 
                        checked={formData.marketingConsent}
                        onCheckedChange={(checked) => handleInputChange('marketingConsent', !!checked)}
                        className="mt-1"
                      />
                      <label className="text-sm text-gray-600">
                        Ich möchte per E-Mail über neue Kollektionen und exklusive Angebote informiert werden.
                      </label>
                    </div>

                    <div className="space-y-3 pt-4">
                      <Button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="w-full bg-elbfunkeln-green hover:bg-elbfunkeln-green/90 text-white h-12"
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Konto wird erstellt...
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Jetzt Konto erstellen
                          </>
                        )}
                      </Button>

                      <Button
                        onClick={handleClose}
                        variant="outline"
                        className="w-full border-gray-300 text-gray-600 hover:bg-gray-50"
                      >
                        Vielleicht später
                      </Button>
                    </div>

                    <p className="text-xs text-gray-500 text-center">
                      Mit der Registrierung akzeptieren Sie unsere{' '}
                      <a href="/terms" className="text-elbfunkeln-green hover:underline">AGB</a> und{' '}
                      <a href="/privacy" className="text-elbfunkeln-green hover:underline">Datenschutzerklärung</a>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}