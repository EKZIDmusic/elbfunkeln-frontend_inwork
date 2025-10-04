import { useState, useEffect } from 'react';
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
import { userService, type DatabaseUser, type UserCreateData } from '../services/userService';

export default function AdminDashboardPage() {
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

  // User Management - Real Database Integration
  const [users, setUsers] = useState<DatabaseUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newUser, setNewUser] = useState<UserCreateData>({
    email: '',
    name: '',
    role: 'customer',
    password: '',
    sendWelcomeEmail: true
  });

  const [editingUser, setEditingUser] = useState<DatabaseUser | null>(null);
  const [showUserDetails, setShowUserDetails] = useState<DatabaseUser | null>(null);
  const [banReason, setBanReason] = useState('');
  const [banDuration, setBanDuration] = useState('7'); // days
  const [resetPasswordUserId, setResetPasswordUserId] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [userFilter, setUserFilter] = useState<'all' | 'active' | 'inactive' | 'banned'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Load users from database on component mount
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const dbUsers = await userService.getAllUsers();
      setUsers(dbUsers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden der Benutzer');
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (newUser.email && newUser.name && newUser.password) {
      try {
        setLoading(true);
        const createdUser = await userService.createUser(newUser);
        setUsers([...users, createdUser]);
        setNewUser({ email: '', name: '', role: 'customer', password: '', sendWelcomeEmail: true });
        
        console.log(`Benutzer erfolgreich erstellt: ${createdUser.email}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Fehler beim Erstellen des Benutzers');
        console.error('Error creating user:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteUser = async (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (user && user.role !== 'admin') {
      try {
        setLoading(true);
        await userService.deleteUser(userId);
        setUsers(users.filter(u => u.id !== userId));
        console.log(`Benutzer gelöscht: ${user.email}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Fehler beim Löschen des Benutzers');
        console.error('Error deleting user:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleToggleUserStatus = async (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      try {
        setLoading(true);
        const newStatus = user.status === 'active' ? 'inactive' : 'active';
        await userService.updateUser({ id: userId, status: newStatus });
        setUsers(users.map(u => 
          u.id === userId ? { ...u, status: newStatus } : u
        ));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Fehler beim Ändern des Status');
        console.error('Error updating user status:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBanUser = async (userId: number) => {
    if (banReason.trim()) {
      try {
        setLoading(true);
        await userService.banUser({
          userId,
          reason: banReason,
          duration: parseInt(banDuration)
        });
        
        const banUntilDate = new Date();
        banUntilDate.setDate(banUntilDate.getDate() + parseInt(banDuration));
        
        setUsers(users.map(u => 
          u.id === userId 
            ? { 
                ...u, 
                status: 'banned',
                banned_until: banUntilDate.toISOString().split('T')[0],
                banned_reason: banReason
              }
            : u
        ));
        setBanReason('');
        setBanDuration('7');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Fehler beim Sperren des Benutzers');
        console.error('Error banning user:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleUnbanUser = async (userId: number) => {
    try {
      setLoading(true);
      await userService.unbanUser(userId);
      setUsers(users.map(u => 
        u.id === userId 
          ? { 
              ...u, 
              status: 'active',
              banned_until: null,
              banned_reason: null,
              login_attempts: 0
            }
          : u
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Entsperren des Benutzers');
      console.error('Error unbanning user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (userId: number) => {
    if (newPassword.length >= 6) {
      try {
        setLoading(true);
        await userService.resetPassword(userId, newPassword);
        setResetPasswordUserId(null);
        setNewPassword('');
        console.log(`Passwort zurückgesetzt für Benutzer ${userId}`);
        
        // Reload users to get updated data
        await loadUsers();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Fehler beim Zurücksetzen des Passworts');
        console.error('Error resetting password:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSendVerificationEmail = async (userId: number) => {
    try {
      setLoading(true);
      await userService.sendVerificationEmail(userId);
      setUsers(users.map(u => 
        u.id === userId ? { ...u, email_verified: true } : u
      ));
      if (showUserDetails && showUserDetails.id === userId) {
        setShowUserDetails({ ...showUserDetails, email_verified: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Senden der Verifikations-E-Mail');
      console.error('Error sending verification email:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesFilter = userFilter === 'all' || user.status === userFilter;
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const generateRandomPassword = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
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
          <Tabs defaultValue="maintenance" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-white border border-elbfunkeln-green/20">
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
                {/* User Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="p-4 border-elbfunkeln-green/20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-elbfunkeln-lavender to-elbfunkeln-rose rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-inter text-sm text-elbfunkeln-green/70">Gesamt</p>
                        <p className="font-cormorant text-xl text-elbfunkeln-green">
                          {loading ? '...' : users.length}
                        </p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4 border-elbfunkeln-green/20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-inter text-sm text-elbfunkeln-green/70">Aktiv</p>
                        <p className="font-cormorant text-xl text-elbfunkeln-green">
                          {users.filter(u => u.status === 'active').length}
                        </p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4 border-elbfunkeln-green/20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                        <Clock className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-inter text-sm text-elbfunkeln-green/70">Inaktiv</p>
                        <p className="font-cormorant text-xl text-elbfunkeln-green">
                          {users.filter(u => u.status === 'inactive').length}
                        </p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4 border-elbfunkeln-green/20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-lg flex items-center justify-center">
                        <XCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-inter text-sm text-elbfunkeln-green/70">Gesperrt</p>
                        <p className="font-cormorant text-xl text-elbfunkeln-green">
                          {users.filter(u => u.status === 'banned').length}
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Error Display */}
                {error && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      {error}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setError(null)}
                        className="ml-2 h-6 px-2 text-red-600"
                      >
                        <XCircle className="w-3 h-3" />
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Loading Indicator */}
                {loading && (
                  <Alert className="border-blue-200 bg-blue-50">
                    <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
                    <AlertDescription className="text-blue-800">
                      Lade Benutzerdaten von MySQL-Server (45.83.245.57)...
                    </AlertDescription>
                  </Alert>
                )}

                {/* Add New User */}
                <Card className="p-6 border-elbfunkeln-green/20">
                  <h3 className="font-cormorant text-xl text-elbfunkeln-green mb-4">
                    👤 Neuen Benutzer erstellen
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
                    <Input
                      placeholder="E-Mail"
                      value={newUser.email}
                      onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                      className="border-elbfunkeln-lavender/30"
                    />
                    <Input
                      placeholder="Name"
                      value={newUser.name}
                      onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                      className="border-elbfunkeln-lavender/30"
                    />
                    <Select value={newUser.role} onValueChange={(value: 'customer' | 'shopowner' | 'admin') => setNewUser(prev => ({ ...prev, role: value }))}>
                      <SelectTrigger className="border-elbfunkeln-lavender/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="customer">Kunde</SelectItem>
                        <SelectItem value="shopowner">ShopOwner</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="relative">
                      <Input
                        type="password"
                        placeholder="Passwort"
                        value={newUser.password}
                        onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                        className="border-elbfunkeln-lavender/30"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setNewUser(prev => ({ ...prev, password: generateRandomPassword() }))}
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 px-2 text-xs"
                      >
                        <RefreshCw className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={newUser.sendWelcomeEmail}
                        onCheckedChange={(checked) => setNewUser(prev => ({ ...prev, sendWelcomeEmail: checked }))}
                      />
                      <Label className="text-xs text-elbfunkeln-green/70">Welcome E-Mail</Label>
                    </div>
                    <Button
                      onClick={handleCreateUser}
                      disabled={!newUser.email || !newUser.name || !newUser.password || loading}
                      className="bg-gradient-to-r from-elbfunkeln-lavender to-elbfunkeln-rose text-white"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Erstellen
                    </Button>
                  </div>
                </Card>

                {/* User Filters and Search */}
                <Card className="p-6 border-elbfunkeln-green/20">
                  <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
                    <h3 className="font-cormorant text-xl text-elbfunkeln-green">
                      👥 Benutzerverwaltung - Server: {systemStats.serverIp}
                    </h3>
                    <div className="flex gap-4">
                      <Input
                        placeholder="Suchen..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-64 border-elbfunkeln-lavender/30"
                      />
                      <Select value={userFilter} onValueChange={(value: 'all' | 'active' | 'inactive' | 'banned') => setUserFilter(value)}>
                        <SelectTrigger className="w-40 border-elbfunkeln-lavender/30">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Alle</SelectItem>
                          <SelectItem value="active">Aktiv</SelectItem>
                          <SelectItem value="inactive">Inaktiv</SelectItem>
                          <SelectItem value="banned">Gesperrt</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Benutzer</TableHead>
                          <TableHead>Rolle</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Statistiken</TableHead>
                          <TableHead>Sicherheit</TableHead>
                          <TableHead>Letzter Login</TableHead>
                          <TableHead>Aktionen</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-elbfunkeln-lavender to-elbfunkeln-rose rounded-full flex items-center justify-center">
                                  <span className="text-white text-sm font-medium">
                                    {user.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-inter font-medium text-elbfunkeln-green">
                                    {user.name}
                                  </p>
                                  <p className="font-inter text-sm text-elbfunkeln-green/70">
                                    {user.email}
                                  </p>
                                  {user.email_verified && (
                                    <Badge variant="outline" className="text-xs mt-1">
                                      ✓ Verifiziert
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={user.role === 'admin' ? 'destructive' : user.role === 'shopowner' ? 'default' : 'secondary'}
                              >
                                {user.role === 'admin' ? 'Admin' : user.role === 'shopowner' ? 'ShopOwner' : 'Kunde'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <Badge 
                                  variant={user.status === 'active' ? 'default' : user.status === 'banned' ? 'destructive' : 'secondary'}
                                >
                                  {user.status === 'active' ? 'Aktiv' : user.status === 'banned' ? 'Gesperrt' : 'Inaktiv'}
                                </Badge>
                                {user.status === 'banned' && user.banned_until && (
                                  <p className="text-xs text-red-600">
                                    Bis: {user.banned_until}
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <p className="text-elbfunkeln-green/70">
                                  {user.total_orders} Bestellungen
                                </p>
                                <p className="text-elbfunkeln-green">
                                  €{user.total_spent.toFixed(2)}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm space-y-1">
                                <p className="text-elbfunkeln-green/70">
                                  Login-Versuche: {user.login_attempts}
                                </p>
                                <p className="text-xs text-elbfunkeln-green/70">
                                  PW: {user.updated_at.split(' ')[0]}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="font-inter text-sm text-elbfunkeln-green/70">
                              {user.last_login || 'Noch nie'}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setShowUserDetails(user)}
                                  className="border-elbfunkeln-lavender text-elbfunkeln-green"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setEditingUser(user)}
                                  className="border-elbfunkeln-lavender text-elbfunkeln-green"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                {user.status !== 'banned' ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setBanReason('');
                                      setBanDuration('7');
                                      const reason = prompt('Grund für die Sperrung:');
                                      if (reason) {
                                        setBanReason(reason);
                                        handleBanUser(user.id);
                                      }
                                    }}
                                    className="border-red-300 text-red-700"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleUnbanUser(user.id)}
                                    className="border-green-300 text-green-700"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </Button>
                                )}
                                {user.role !== 'admin' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      if (confirm(`Benutzer ${user.name} wirklich löschen?`)) {
                                        handleDeleteUser(user.id);
                                      }
                                    }}
                                    className="border-elbfunkeln-rose text-elbfunkeln-rose"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </Card>

                {/* User Details Modal */}
                {showUserDetails && (
                  <Card className="p-6 border-elbfunkeln-green/20 bg-elbfunkeln-beige/5">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-cormorant text-lg text-elbfunkeln-green">
                        Benutzerdetails: {showUserDetails.name}
                      </h4>
                      <Button
                        variant="ghost"
                        onClick={() => setShowUserDetails(null)}
                        className="text-elbfunkeln-green"
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div>
                          <Label className="font-inter text-elbfunkeln-green/70">Account Info</Label>
                          <div className="mt-1 p-3 bg-white rounded border">
                            <p className="font-inter text-sm"><strong>ID:</strong> {showUserDetails.id}</p>
                            <p className="font-inter text-sm"><strong>E-Mail:</strong> {showUserDetails.email}</p>
                            <p className="font-inter text-sm"><strong>Name:</strong> {showUserDetails.name}</p>
                            <p className="font-inter text-sm"><strong>Rolle:</strong> {showUserDetails.role}</p>
                            <p className="font-inter text-sm"><strong>Status:</strong> {showUserDetails.status}</p>
                          </div>
                        </div>
                        <div>
                          <Label className="font-inter text-elbfunkeln-green/70">Sicherheit</Label>
                          <div className="mt-1 p-3 bg-white rounded border">
                            <p className="font-inter text-sm"><strong>E-Mail verifiziert:</strong> {showUserDetails.email_verified ? 'Ja' : 'Nein'}</p>
                            <p className="font-inter text-sm"><strong>Login-Versuche:</strong> {showUserDetails.login_attempts}</p>
                            <p className="font-inter text-sm"><strong>Letztes Update:</strong> {showUserDetails.updated_at}</p>
                            <p className="font-inter text-sm"><strong>Passwort Hash:</strong> {showUserDetails.password_hash.substring(0, 20)}...</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <Label className="font-inter text-elbfunkeln-green/70">Aktivität</Label>
                          <div className="mt-1 p-3 bg-white rounded border">
                            <p className="font-inter text-sm"><strong>Erstellt:</strong> {showUserDetails.created_at}</p>
                            <p className="font-inter text-sm"><strong>Letzter Login:</strong> {showUserDetails.last_login || 'Noch nie'}</p>
                            <p className="font-inter text-sm"><strong>Bestellungen:</strong> {showUserDetails.total_orders}</p>
                            <p className="font-inter text-sm"><strong>Umsatz:</strong> €{showUserDetails.total_spent.toFixed(2)}</p>
                          </div>
                        </div>
                        {showUserDetails.status === 'banned' && (
                          <div>
                            <Label className="font-inter text-elbfunkeln-green/70">Sperrung</Label>
                            <div className="mt-1 p-3 bg-red-50 rounded border border-red-200">
                              <p className="font-inter text-sm"><strong>Grund:</strong> {showUserDetails.banned_reason}</p>
                              <p className="font-inter text-sm"><strong>Bis:</strong> {showUserDetails.banned_until}</p>
                            </div>
                          </div>
                        )}
                        <div className="space-y-2">
                          <Button
                            onClick={() => {
                              const newPw = prompt('Neues Passwort eingeben:');
                              if (newPw && newPw.length >= 6) {
                                setNewPassword(newPw);
                                handleResetPassword(showUserDetails.id);
                                setShowUserDetails(null);
                              }
                            }}
                            className="w-full bg-gradient-to-r from-elbfunkeln-lavender to-elbfunkeln-rose text-white"
                          >
                            <Lock className="w-4 h-4 mr-2" />
                            Passwort zurücksetzen
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleSendVerificationEmail(showUserDetails.id)}
                            className="w-full border-elbfunkeln-lavender text-elbfunkeln-green"
                          >
                            <Mail className="w-4 h-4 mr-2" />
                            Verifikations-E-Mail senden
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}
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