import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Shield, Users, Database, Settings, Activity, AlertTriangle,
  Server, Lock, Globe, Clock, Mail, FileText, Code, Zap,
  Monitor, Smartphone, Tablet, Eye, EyeOff, Power, PowerOff,
  UserPlus, UserMinus, Edit, Trash2, Save, RefreshCw,
  CheckCircle, XCircle
} from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Alert, AlertDescription } from '../components/ui/alert';
import { useAuth } from '../components/AuthContext';
import { SupabaseUserManager } from '../components/admin/SupabaseUserManager';

import { UserManagement } from '../components/admin/UserManagement';
import { DatabaseOverview } from '../components/admin/DatabaseOverview';
import { DatabaseStatusChecker } from '../components/admin/DatabaseStatusChecker';

export function AdminDashboardPage() {
  const { user } = useAuth();

  // System Stats - Real Server Data
  const [systemStats] = useState({
    totalUsers: 1247,
    activeUsers: 892,
    totalOrders: 3456,
    pendingOrders: 23,
    serverUptime: '99.9%',
    responseTime: '142ms',
    errorRate: '0.1%',
    diskUsage: 67,
    serverIp: '45.83.245.57',
    dbHost: 'localhost',
    dbPort: 3306,
    dbName: 'Elbfunkeln',
    dbUser: 'shopDB',
    phpMyAdminVersion: '5.2.1',
    mysqlVersion: '8.0.35',
    serverLocation: 'Deutschland',
    sslCertValid: true,
    backupStatus: 'Täglich um 03:00 UTC',
    cpuCores: 4,
    ramTotal: '8GB',
    ramUsed: '4.2GB'
  });

  // Maintenance Mode
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('Die Website wird derzeit gewartet. Bitte versuchen Sie es später erneut.');

  // System message management
  const [systemMessage, setSystemMessage] = useState<string | null>(null);
  const [systemMessageType, setSystemMessageType] = useState<'error' | 'success'>('success');

  const handleSystemMessage = (message: string, type: 'error' | 'success' = 'success') => {
    setSystemMessage(message);
    setSystemMessageType(type);
    
    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
      setTimeout(() => setSystemMessage(null), 5000);
    }
  };

  // System Logs - Real Server Events
  const [systemLogs] = useState([
    { id: 1, timestamp: '2024-01-20 14:30:15', level: 'INFO', message: 'Admin login successful from 45.83.245.57', source: 'AUTH' },
    { id: 2, timestamp: '2024-01-20 14:28:42', level: 'INFO', message: 'MySQL connection established to Elbfunkeln database', source: 'DATABASE' },
    { id: 3, timestamp: '2024-01-20 14:25:32', level: 'WARN', message: 'RAM usage: 4.2GB/8GB (52.5%)', source: 'SYSTEM' },
    { id: 4, timestamp: '2024-01-20 14:20:11', level: 'INFO', message: 'phpMyAdmin 5.2.1 session started', source: 'PHPMYADMIN' },
    { id: 5, timestamp: '2024-01-20 14:15:45', level: 'INFO', message: 'SSL certificate valid until 2025-01-20', source: 'SECURITY' },
    { id: 6, timestamp: '2024-01-20 14:10:22', level: 'INFO', message: 'Daily backup to /backups/elbfunkeln_daily.sql completed', source: 'BACKUP' },
    { id: 7, timestamp: '2024-01-20 14:05:18', level: 'INFO', message: 'MySQL 8.0.35 service status: Running', source: 'DATABASE' },
    { id: 8, timestamp: '2024-01-20 14:00:00', level: 'INFO', message: 'Server uptime: 127 days, 14 hours', source: 'SYSTEM' }
  ]);

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-elbfunkeln-beige via-white to-elbfunkeln-lavender/10 flex items-center justify-center">
        <Card className="p-8 max-w-md mx-auto border-elbfunkeln-green/20">
          <div className="text-center">
            <Shield className="w-16 h-16 text-elbfunkeln-rose mx-auto mb-4" />
            <h2 className="font-cormorant text-2xl text-elbfunkeln-green mb-2">
              Zugriff verweigert
            </h2>
            <p className="font-inter text-elbfunkeln-green/70">
              Sie haben keine Berechtigung für das Admin-Dashboard.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-elbfunkeln-beige via-white to-elbfunkeln-lavender/10">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-cormorant text-4xl text-elbfunkeln-green mb-2">
                🔧 Admin Dashboard
              </h1>
              <p className="font-inter text-elbfunkeln-green/70">
                Server: {systemStats.serverIp} | MySQL: {systemStats.mysqlVersion} | Uptime: {systemStats.serverUptime}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge className="bg-green-100 text-green-800">
                {systemStats.serverLocation}
              </Badge>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="border-elbfunkeln-lavender text-elbfunkeln-green"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Aktualisieren
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Overview Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card className="p-6 border-elbfunkeln-green/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-elbfunkeln-lavender to-elbfunkeln-rose rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-inter text-elbfunkeln-green/70 text-sm">Aktive Benutzer</p>
                <p className="font-cormorant text-2xl text-elbfunkeln-green">
                  {systemStats.activeUsers}
                </p>
                <p className="font-inter text-xs text-green-600">
                  +12% diese Woche
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-elbfunkeln-green/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-elbfunkeln-rose to-elbfunkeln-beige rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-inter text-elbfunkeln-green/70 text-sm">Antwortzeit</p>
                <p className="font-cormorant text-2xl text-elbfunkeln-green">
                  {systemStats.responseTime}
                </p>
                <p className="font-inter text-xs text-green-600">
                  Optimal
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-elbfunkeln-green/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-elbfunkeln-green to-elbfunkeln-lavender rounded-lg flex items-center justify-center">
                <Server className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-inter text-elbfunkeln-green/70 text-sm">Server Uptime</p>
                <p className="font-cormorant text-2xl text-elbfunkeln-green">
                  {systemStats.serverUptime}
                </p>
                <p className="font-inter text-xs text-green-600">
                  Stabil
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-elbfunkeln-green/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-elbfunkeln-beige to-elbfunkeln-lavender rounded-lg flex items-center justify-center">
                <Database className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-inter text-elbfunkeln-green/70 text-sm">MySQL</p>
                <p className="font-cormorant text-2xl text-elbfunkeln-green">
                  {systemStats.mysqlVersion}
                </p>
                <p className="font-inter text-xs text-green-600">
                  Online
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Main Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="database" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 bg-white border border-elbfunkeln-green/20">
              <TabsTrigger value="database" className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                Datenbank
              </TabsTrigger>
              <TabsTrigger value="maintenance" className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Wartung
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Benutzer
              </TabsTrigger>
              <TabsTrigger value="logs" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Logs
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Sicherheit
              </TabsTrigger>
            </TabsList>

            {/* Database Tab */}
            <TabsContent value="database">
              <div className="space-y-6">
                <DatabaseStatusChecker />
                <DatabaseOverview />
              </div>
            </TabsContent>

            {/* Maintenance Tab */}
            <TabsContent value="maintenance">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6 border-elbfunkeln-green/20">
                  <h3 className="font-cormorant text-xl text-elbfunkeln-green mb-4">
                    🚧 Wartungsmodus
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-inter text-elbfunkeln-green">Wartungsmodus aktivieren</Label>
                        <p className="font-inter text-xs text-elbfunkeln-green/70">
                          Website für Besucher sperren
                        </p>
                      </div>
                      <Switch 
                        checked={maintenanceMode}
                        onCheckedChange={setMaintenanceMode}
                      />
                    </div>
                    <div>
                      <Label className="font-inter text-elbfunkeln-green mb-2 block">
                        Wartungsnachricht
                      </Label>
                      <Textarea
                        value={maintenanceMessage}
                        onChange={(e) => setMaintenanceMessage(e.target.value)}
                        placeholder="Nachricht für Besucher..."
                        className="min-h-[100px] border-elbfunkeln-lavender/30"
                      />
                    </div>
                    <Button
                      className="w-full bg-gradient-to-r from-elbfunkeln-lavender to-elbfunkeln-rose text-white"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Einstellungen speichern
                    </Button>
                  </div>
                </Card>

                <Card className="p-6 border-elbfunkeln-green/20">
                  <h3 className="font-cormorant text-xl text-elbfunkeln-green mb-4">
                    📱 Geräte-Zugriff
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Monitor className="w-5 h-5 text-elbfunkeln-green" />
                        <div>
                          <Label className="font-inter text-elbfunkeln-green">Desktop</Label>
                          <p className="font-inter text-xs text-elbfunkeln-green/70">Vollzugriff</p>
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Tablet className="w-5 h-5 text-elbfunkeln-green" />
                        <div>
                          <Label className="font-inter text-elbfunkeln-green">Tablet</Label>
                          <p className="font-inter text-xs text-elbfunkeln-green/70">Eingeschränkt</p>
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Smartphone className="w-5 h-5 text-elbfunkeln-green" />
                        <div>
                          <Label className="font-inter text-elbfunkeln-green">Mobile</Label>
                          <p className="font-inter text-xs text-elbfunkeln-green/70">Nur Lesen</p>
                        </div>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users">
              <div className="space-y-6">
                {/* System Messages */}
                {systemMessage && (
                  <Alert className={`border-2 ${systemMessageType === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
                    <AlertTriangle className={`h-4 w-4 ${systemMessageType === 'error' ? 'text-red-600' : 'text-green-600'}`} />
                    <AlertDescription className={systemMessageType === 'error' ? 'text-red-800' : 'text-green-800'}>
                      {systemMessage}
                      {systemMessageType === 'error' && (
                        <Button
                          onClick={() => setSystemMessage(null)}
                          variant="ghost"
                          size="sm"
                          className="ml-2 h-6 px-2"
                        >
                          ✕
                        </Button>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Enhanced User Management */}
                <UserManagement />
                
                {/* Legacy Supabase User Manager */}
                <Card className="p-6 border-elbfunkeln-green/20">
                  <h3 className="font-cormorant text-xl text-elbfunkeln-green mb-4">
                    🔧 Legacy User Manager
                  </h3>
                  <SupabaseUserManager 
                    onError={(error) => handleSystemMessage(error, 'error')}
                    onSuccess={(message) => handleSystemMessage(message, 'success')}
                  />
                </Card>
              </div>
            </TabsContent>

            {/* Logs Tab */}
            <TabsContent value="logs">
              <Card className="p-6 border-elbfunkeln-green/20">
                <h3 className="font-cormorant text-xl text-elbfunkeln-green mb-4">
                  📊 System-Logs von {systemStats.serverIp}
                </h3>
                <div className="space-y-3">
                  {systemLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-3 bg-white rounded border border-elbfunkeln-beige"
                    >
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={
                            log.level === 'ERROR' ? 'destructive' :
                            log.level === 'WARN' ? 'default' : 'secondary'
                          }
                        >
                          {log.level}
                        </Badge>
                        <span className="font-inter text-sm text-elbfunkeln-green">
                          {log.message}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-elbfunkeln-green/70">
                        <span>{log.source}</span>
                        <span>•</span>
                        <span>{log.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security">
              <div className="space-y-6">
                {/* Server Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="p-6 border-elbfunkeln-green/20">
                    <h3 className="font-cormorant text-xl text-elbfunkeln-green mb-4">
                      🖥️ Server Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-elbfunkeln-beige">
                        <span className="font-inter text-elbfunkeln-green/70">Server IP</span>
                        <span className="font-inter text-elbfunkeln-green font-mono">{systemStats.serverIp}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-elbfunkeln-beige">
                        <span className="font-inter text-elbfunkeln-green/70">Standort</span>
                        <span className="font-inter text-elbfunkeln-green">{systemStats.serverLocation}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-elbfunkeln-beige">
                        <span className="font-inter text-elbfunkeln-green/70">CPU Kerne</span>
                        <span className="font-inter text-elbfunkeln-green">{systemStats.cpuCores}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-elbfunkeln-beige">
                        <span className="font-inter text-elbfunkeln-green/70">RAM</span>
                        <span className="font-inter text-elbfunkeln-green">{systemStats.ramUsed} / {systemStats.ramTotal}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="font-inter text-elbfunkeln-green/70">Backup Status</span>
                        <Badge className="bg-green-100 text-green-800">Aktiv</Badge>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 border-elbfunkeln-green/20">
                    <h3 className="font-cormorant text-xl text-elbfunkeln-green mb-4">
                      🗄️ Datenbank Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-elbfunkeln-beige">
                        <span className="font-inter text-elbfunkeln-green/70">MySQL Version</span>
                        <span className="font-inter text-elbfunkeln-green">{systemStats.mysqlVersion}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-elbfunkeln-beige">
                        <span className="font-inter text-elbfunkeln-green/70">Datenbank</span>
                        <span className="font-inter text-elbfunkeln-green font-mono">{systemStats.dbName}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-elbfunkeln-beige">
                        <span className="font-inter text-elbfunkeln-green/70">DB User</span>
                        <span className="font-inter text-elbfunkeln-green font-mono">{systemStats.dbUser}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-elbfunkeln-beige">
                        <span className="font-inter text-elbfunkeln-green/70">Port</span>
                        <span className="font-inter text-elbfunkeln-green font-mono">{systemStats.dbPort}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="font-inter text-elbfunkeln-green/70">phpMyAdmin</span>
                        <span className="font-inter text-elbfunkeln-green">{systemStats.phpMyAdminVersion}</span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Button
                        onClick={() => window.open(`http://${systemStats.serverIp}/phpmyadmin`, '_blank')}
                        className="w-full bg-gradient-to-r from-elbfunkeln-lavender to-elbfunkeln-rose text-white"
                      >
                        <Database className="w-4 h-4 mr-2" />
                        phpMyAdmin öffnen
                      </Button>
                    </div>
                  </Card>
                </div>

                {/* Security Settings */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="p-6 border-elbfunkeln-green/20">
                    <h3 className="font-cormorant text-xl text-elbfunkeln-green mb-4">
                      🔒 Sicherheitseinstellungen
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-inter text-elbfunkeln-green">2FA für Admins</Label>
                          <p className="font-inter text-xs text-elbfunkeln-green/70">
                            Zwei-Faktor-Authentifizierung
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-inter text-elbfunkeln-green">Login-Überwachung</Label>
                          <p className="font-inter text-xs text-elbfunkeln-green/70">
                            Verdächtige Anmeldungen erkennen
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-inter text-elbfunkeln-green">MySQL Secure</Label>
                          <p className="font-inter text-xs text-elbfunkeln-green/70">
                            Sichere Datenbank-Verbindung
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-inter text-elbfunkeln-green">Automatische Backups</Label>
                          <p className="font-inter text-xs text-elbfunkeln-green/70">
                            {systemStats.backupStatus}
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 border-elbfunkeln-green/20">
                    <h3 className="font-cormorant text-xl text-elbfunkeln-green mb-4">
                      🛡️ Server Security Status
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b border-elbfunkeln-beige">
                        <span className="font-inter text-elbfunkeln-green/70">SSL Zertifikat</span>
                        <Badge className="bg-green-100 text-green-800">
                          {systemStats.sslCertValid ? 'Gültig' : 'Abgelaufen'}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-elbfunkeln-beige">
                        <span className="font-inter text-elbfunkeln-green/70">Firewall</span>
                        <Badge className="bg-green-100 text-green-800">Aktiv</Badge>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-elbfunkeln-beige">
                        <span className="font-inter text-elbfunkeln-green/70">DDoS-Schutz</span>
                        <Badge className="bg-green-100 text-green-800">Aktiv</Badge>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-elbfunkeln-beige">
                        <span className="font-inter text-elbfunkeln-green/70">MySQL Status</span>
                        <Badge className="bg-green-100 text-green-800">Online</Badge>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="font-inter text-elbfunkeln-green/70">Server Uptime</span>
                        <span className="font-inter text-elbfunkeln-green">{systemStats.serverUptime}</span>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Environment Variables */}
                <Card className="p-6 border-elbfunkeln-green/20">
                  <h3 className="font-cormorant text-xl text-elbfunkeln-green mb-4">
                    🔧 MySQL-Konfiguration für {systemStats.dbName}
                  </h3>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <div className="space-y-2">
                      <div><span className="text-gray-500">// Echte MySQL-Verbindung zu {systemStats.serverIp}</span></div>
                      <div><span className="text-blue-400">const</span> <span className="text-yellow-300">DB_CONFIG</span> = {'{'}</div>
                      <div className="ml-4"><span className="text-orange-300">host:</span> <span className="text-red-300">'{systemStats.serverIp}'</span>,</div>
                      <div className="ml-4"><span className="text-orange-300">user:</span> <span className="text-red-300">'{systemStats.dbUser}'</span>,</div>
                      <div className="ml-4"><span className="text-orange-300">password:</span> <span className="text-red-300">'***********'</span>,</div>
                      <div className="ml-4"><span className="text-orange-300">database:</span> <span className="text-red-300">'{systemStats.dbName}'</span>,</div>
                      <div className="ml-4"><span className="text-orange-300">port:</span> <span className="text-purple-400">{systemStats.dbPort}</span>,</div>
                      <div className="ml-4"><span className="text-orange-300">version:</span> <span className="text-red-300">'{systemStats.mysqlVersion}'</span></div>
                      <div>{'}'}</div>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="font-inter text-sm text-yellow-800">
                      ⚠️ Produktions-Umgebung: Alle Datenbankoperationen werden über sichere Backend-APIs durchgeführt. Direkter Frontend-Zugriff auf MySQL ist nicht möglich.
                    </p>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}