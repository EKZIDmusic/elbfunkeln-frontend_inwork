import { useState } from 'react';
import { motion } from 'motion/react';
import { LogIn, Eye, EyeOff, User, Lock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { useAuth } from '../components/AuthContext';
import { useRouter } from '../components/Router';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const { navigateTo } = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const success = await login(email, password);
      if (success) {
        setError('✅ Anmeldung erfolgreich! Du wirst weitergeleitet...');
        
        // Small delay to show success message
        setTimeout(() => {
          // Check user role and redirect accordingly
          if (email === 'admin@elbfunkeln.de') {
            navigateTo('admin-dashboard');
          } else if (email === 'owner@elbfunkeln.de') {
            navigateTo('admin');
          } else {
            navigateTo('account');
          }
        }, 1000);
      } else {
        setError('❌ Ungültige Anmeldedaten. Bitte versuche es erneut.');
      }
    } catch (err) {
      console.error('Login error:', err);
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
                <LogIn className="w-10 h-10 text-white" />
              </div>
            </motion.div>
            <h1 className="font-cormorant text-3xl text-elbfunkeln-green mb-2">
              Anmeldung 🔐
            </h1>
            <p className="font-inter text-elbfunkeln-green/70">
              Melde dich an, um auf dein Konto zuzugreifen
            </p>
          </div>

          {/* Login Form */}
          <Card className="p-8 border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <Label htmlFor="email" className="font-inter text-elbfunkeln-green mb-2 block">
                  E-Mail-Adresse
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-elbfunkeln-lavender" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 border-elbfunkeln-green/30 focus:border-elbfunkeln-green"
                    placeholder="deine@email.de"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <Label htmlFor="password" className="font-inter text-elbfunkeln-green mb-2 block">
                  Passwort
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-elbfunkeln-rose" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 border-elbfunkeln-green/30 focus:border-elbfunkeln-green"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-elbfunkeln-green hover:text-elbfunkeln-lavender transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Alert className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-700">
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
                      Wird angemeldet...
                    </div>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5 mr-2" />
                      Anmelden
                    </>
                  )}
                </Button>
              </motion.div>
            </form>

            {/* Register Link */}
            <div className="mt-6 text-center">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigateTo('register')}
                className="w-full text-elbfunkeln-green hover:text-elbfunkeln-rose hover:bg-elbfunkeln-green/10"
              >
                jetzt registrieren
              </Button>
              <p className="text-sm text-elbfunkeln-green/70 mt-2">
                <button
                  type="button"
                  onClick={() => navigateTo('reset-password')}
                  className="text-elbfunkeln-green hover:text-elbfunkeln-rose font-medium underline"
                >
                  hier zurücksetzen
                </button>
              </p>
            </div>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-elbfunkeln-beige/20 rounded-lg">
              <h4 className="font-inter text-sm text-elbfunkeln-green mb-2">
                📝 Demo-Anmeldedaten:
              </h4>
              <div className="space-y-1 text-xs text-elbfunkeln-green/70">
                <div>🛡️ Admin: admin@elbfunkeln.de / admin123</div>
                <div>👩‍💼 ShopOwner: owner@elbfunkeln.de / owner123</div>
                <div>👤 Kunde: sarah.mueller@example.com / customer123</div>
              </div>
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