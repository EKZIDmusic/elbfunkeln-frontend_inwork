import { useState } from 'react';
import { motion } from 'motion/react';
import { Bug, User, Database, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { useAuth } from '../AuthContext';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { createClient } from '@supabase/supabase-js';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-0a65d7a9`;

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

export function RegistrationDebugger() {
  const { register } = useAuth();
  const [testUser, setTestUser] = useState({
    email: 'test@elbfunkeln.de',
    password: 'test123',
    firstName: 'Test',
    lastName: 'User'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const addResult = (type: 'success' | 'error' | 'info', title: string, details: any) => {
    setResults(prev => [...prev, {
      id: Date.now(),
      type,
      title,
      details: typeof details === 'string' ? details : JSON.stringify(details, null, 2),
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const clearResults = () => setResults([]);

  const testServerConnection = async () => {
    try {
      addResult('info', 'Testing Server Connection', 'Checking if server is reachable...');
      
      const response = await fetch(`${API_BASE_URL}/health`);
      const data = await response.json();
      
      if (response.ok) {
        addResult('success', 'Server Connection ✅', data);
      } else {
        addResult('error', 'Server Connection ❌', `Status: ${response.status}`);
      }
    } catch (error) {
      addResult('error', 'Server Connection ❌', error);
    }
  };

  const testDirectSupabaseAuth = async () => {
    try {
      addResult('info', 'Testing Direct Supabase Auth', 'Attempting direct Supabase signup...');
      
      const { data, error } = await supabase.auth.signUp({
        email: testUser.email,
        password: testUser.password,
        options: {
          data: {
            first_name: testUser.firstName,
            last_name: testUser.lastName,
            name: `${testUser.firstName} ${testUser.lastName}`,
            role: 'customer'
          }
        }
      });

      if (error) {
        addResult('error', 'Direct Supabase Auth ❌', error);
      } else {
        addResult('success', 'Direct Supabase Auth ✅', {
          userId: data.user?.id,
          email: data.user?.email,
          confirmed: !!data.session
        });
      }
    } catch (error) {
      addResult('error', 'Direct Supabase Auth ❌', error);
    }
  };

  const testServerRegistration = async () => {
    try {
      addResult('info', 'Testing Server Registration API', 'Testing /auth/register endpoint...');
      
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password,
          firstName: testUser.firstName,
          lastName: testUser.lastName,
          phone: '+49 123 456 789',
          marketingConsent: true
        })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        addResult('success', 'Server Registration API ✅', data);
      } else {
        addResult('error', 'Server Registration API ❌', data);
      }
    } catch (error) {
      addResult('error', 'Server Registration API ❌', error);
    }
  };

  const testAuthContextRegistration = async () => {
    try {
      addResult('info', 'Testing AuthContext Registration', 'Using register() function from context...');
      
      const success = await register({
        email: testUser.email,
        password: testUser.password,
        firstName: testUser.firstName,
        lastName: testUser.lastName,
        phone: '+49 123 456 789',
        marketingConsent: true
      });

      if (success) {
        addResult('success', 'AuthContext Registration ✅', 'Registration completed successfully');
      } else {
        addResult('error', 'AuthContext Registration ❌', 'Registration failed');
      }
    } catch (error) {
      addResult('error', 'AuthContext Registration ❌', error);
    }
  };

  const runAllTests = async () => {
    setIsLoading(true);
    clearResults();
    
    // Generate unique test email
    const timestamp = Date.now();
    const uniqueEmail = `test-${timestamp}@elbfunkeln.de`;
    setTestUser(prev => ({ ...prev, email: uniqueEmail }));
    
    await testServerConnection();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testServerRegistration();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testAuthContextRegistration();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test with different email for direct Supabase
    const uniqueEmail2 = `test-direct-${timestamp}@elbfunkeln.de`;
    setTestUser(prev => ({ ...prev, email: uniqueEmail2 }));
    await testDirectSupabaseAuth();
    
    setIsLoading(false);
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <Database className="w-4 h-4 text-blue-600" />;
    }
  };

  const getResultBadgeColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-cormorant text-2xl text-elbfunkeln-green flex items-center gap-2">
            <Bug className="w-6 h-6" />
            Registrierungs-Debugger 🐛
          </h2>
          <p className="font-inter text-sm text-elbfunkeln-green/70">
            Teste die verschiedenen Registrierungs-Endpunkte und -Methoden
          </p>
        </div>
      </div>

      {/* Test Configuration */}
      <Card className="p-6 border-0 shadow-lg">
        <h3 className="font-inter text-lg text-elbfunkeln-green mb-4">Test-Konfiguration</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="testEmail">Test E-Mail</Label>
            <Input
              id="testEmail"
              value={testUser.email}
              onChange={(e) => setTestUser(prev => ({ ...prev, email: e.target.value }))}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="testPassword">Test Passwort</Label>
            <Input
              id="testPassword"
              type="password"
              value={testUser.password}
              onChange={(e) => setTestUser(prev => ({ ...prev, password: e.target.value }))}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="testFirstName">Vorname</Label>
            <Input
              id="testFirstName"
              value={testUser.firstName}
              onChange={(e) => setTestUser(prev => ({ ...prev, firstName: e.target.value }))}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="testLastName">Nachname</Label>
            <Input
              id="testLastName"
              value={testUser.lastName}
              onChange={(e) => setTestUser(prev => ({ ...prev, lastName: e.target.value }))}
              className="mt-1"
            />
          </div>
        </div>
      </Card>

      {/* Test Controls */}
      <Card className="p-6 border-0 shadow-lg">
        <div className="flex flex-wrap gap-4">
          <Button
            onClick={runAllTests}
            disabled={isLoading}
            className="bg-elbfunkeln-green text-white hover:bg-elbfunkeln-rose"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Teste alle...
              </>
            ) : (
              <>
                <Bug className="w-4 h-4 mr-2" />
                Alle Tests ausführen
              </>
            )}
          </Button>
          
          <Separator orientation="vertical" className="h-6" />
          
          <Button variant="outline" onClick={testServerConnection} disabled={isLoading}>
            Server-Verbindung
          </Button>
          <Button variant="outline" onClick={testServerRegistration} disabled={isLoading}>
            Server-Registrierung
          </Button>
          <Button variant="outline" onClick={testAuthContextRegistration} disabled={isLoading}>
            AuthContext
          </Button>
          <Button variant="outline" onClick={testDirectSupabaseAuth} disabled={isLoading}>
            Direkte Supabase Auth
          </Button>
          
          <Separator orientation="vertical" className="h-6" />
          
          <Button variant="outline" onClick={clearResults}>
            Ergebnisse löschen
          </Button>
        </div>
      </Card>

      {/* Test Results */}
      {results.length > 0 && (
        <Card className="p-6 border-0 shadow-lg">
          <h3 className="font-inter text-lg text-elbfunkeln-green mb-4">Test-Ergebnisse</h3>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {results.map((result) => (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-elbfunkeln-lavender/20 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getResultIcon(result.type)}
                    <span className="font-medium text-elbfunkeln-green">{result.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getResultBadgeColor(result.type)}>
                      {result.type}
                    </Badge>
                    <span className="text-xs text-elbfunkeln-green/60">{result.timestamp}</span>
                  </div>
                </div>
                <pre className="text-sm bg-elbfunkeln-beige/20 p-2 rounded overflow-x-auto">
                  {result.details}
                </pre>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* Environment Info */}
      <Card className="p-6 border-0 shadow-lg">
        <h3 className="font-inter text-lg text-elbfunkeln-green mb-4">Umgebungs-Informationen</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Project ID:</strong><br />
            <code className="bg-elbfunkeln-beige/20 px-2 py-1 rounded">{projectId}</code>
          </div>
          <div>
            <strong>API Base URL:</strong><br />
            <code className="bg-elbfunkeln-beige/20 px-2 py-1 rounded text-xs">{API_BASE_URL}</code>
          </div>
          <div>
            <strong>Anon Key (first 20 chars):</strong><br />
            <code className="bg-elbfunkeln-beige/20 px-2 py-1 rounded">{publicAnonKey.substring(0, 20)}...</code>
          </div>
          <div>
            <strong>Current Time:</strong><br />
            <code className="bg-elbfunkeln-beige/20 px-2 py-1 rounded">{new Date().toISOString()}</code>
          </div>
        </div>
      </Card>
    </div>
  );
}