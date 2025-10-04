// Vereinfachte Supabase-Benutzerverwaltung für Elbfunkeln Admin-Dashboard
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, Search, Filter, Plus, Edit, Trash2, Ban, 
  Shield, Mail, Eye, RefreshCw, AlertTriangle,
  CheckCircle, XCircle, Clock, UserPlus, Settings
} from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { useAuth } from '../AuthContext';
import { getUsers, getUserStats, type User } from '../../services/supabaseService';

interface UserStats {
  total: number;
  active: number;
  inactive: number;
  banned: number;
  newThisMonth: number;
  byRole: {
    admin: number;
    shopowner: number;
    customer: number;
  };
}

interface UserCreateData {
  email: string;
  name: string;
  password: string;
  role: 'customer' | 'shopowner' | 'admin';
  sendWelcomeEmail: boolean;
}

interface SupabaseUserManagerProps {
  onError: (error: string) => void;
  onSuccess: (message: string) => void;
}

export function SupabaseUserManager({ onError, onSuccess }: SupabaseUserManagerProps) {
  const { accessToken } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  
  // Create User Form
  const [newUser, setNewUser] = useState<UserCreateData>({
    email: '',
    name: '',
    password: '',
    role: 'customer',
    sendWelcomeEmail: true
  });

  // Ban User Form
  const [banForm, setBanForm] = useState({
    reason: '',
    duration: 7
  });

  // Load data on mount
  useEffect(() => {
    if (accessToken) {
      loadData();
    }
  }, [accessToken]);

  const loadData = async () => {
    if (!accessToken) {
      onError('Nicht authentifiziert');
      return;
    }

    try {
      setLoading(true);
      
      console.log('🔧 Loading data with Supabase service...');
      
      // Load users and stats using the simplified service
      const [usersData, statsData] = await Promise.all([
        getUsers(),
        getUserStats()
      ]);
      
      setUsers(usersData || []);
      setStats(statsData || null);
      
      console.log('✅ Daten erfolgreich geladen:', usersData?.length, 'Benutzer');
      onSuccess('Daten erfolgreich geladen');
    } catch (error) {
      console.error('Error loading data:', error);
      onError(`Fehler beim Laden der Daten: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchQuery === '' || 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Create new user (demo function)
  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.name || !newUser.password) {
      onError('Bitte füllen Sie alle Pflichtfelder aus');
      return;
    }

    if (!accessToken) {
      onError('Nicht authentifiziert');
      return;
    }

    try {
      setLoading(true);
      
      // Simulate user creation for demo
      const newUserData: User = {
        id: `user-${Date.now()}`,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        status: 'active',
        email_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_login: null,
        login_attempts: 0,
        banned_until: null,
        banned_reason: null,
        total_orders: 0,
        total_spent: 0
      };

      setUsers([newUserData, ...users]);
      setNewUser({ email: '', name: '', password: '', role: 'customer', sendWelcomeEmail: true });
      setShowCreateDialog(false);
      onSuccess(`Benutzer ${newUserData.email} erfolgreich erstellt (Demo-Modus)`);
      
      // Update stats
      await loadStats();
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Fehler beim Erstellen des Benutzers');
    } finally {
      setLoading(false);
    }
  };

  // Delete user (demo function)
  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (!window.confirm(`Benutzer ${userEmail} wirklich löschen?`)) return;

    if (!accessToken) {
      onError('Nicht authentifiziert');
      return;
    }

    try {
      setLoading(true);
      
      setUsers(users.filter(u => u.id !== userId));
      onSuccess(`Benutzer ${userEmail} erfolgreich gelöscht (Demo-Modus)`);
      
      // Update stats
      await loadStats();
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Fehler beim Löschen des Benutzers');
    } finally {
      setLoading(false);
    }
  };

  // Toggle user status (demo function)
  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    if (!accessToken) {
      onError('Nicht authentifiziert');
      return;
    }

    try {
      setLoading(true);
      
      setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus as any } : u));
      onSuccess(`Benutzerstatus erfolgreich geändert (Demo-Modus)`);
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Fehler beim Ändern des Status');
    } finally {
      setLoading(false);
    }
  };

  // Ban user (demo function)
  const handleBanUser = async (userId: string) => {
    if (!banForm.reason.trim()) {
      onError('Bitte geben Sie einen Grund für die Sperrung an');
      return;
    }

    if (!accessToken) {
      onError('Nicht authentifiziert');
      return;
    }

    try {
      setLoading(true);
      
      const bannedUntil = new Date();
      bannedUntil.setDate(bannedUntil.getDate() + banForm.duration);
      
      setUsers(users.map(u => 
        u.id === userId 
          ? { 
              ...u, 
              status: 'banned',
              banned_until: bannedUntil.toISOString(),
              banned_reason: banForm.reason
            }
          : u
      ));
      
      setBanForm({ reason: '', duration: 7 });
      onSuccess(`Benutzer erfolgreich gesperrt (Demo-Modus)`);
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Fehler beim Sperren des Benutzers');
    } finally {
      setLoading(false);
    }
  };

  // Unban user (demo function)
  const handleUnbanUser = async (userId: string) => {
    if (!accessToken) {
      onError('Nicht authentifiziert');
      return;
    }

    try {
      setLoading(true);
      
      setUsers(users.map(u => 
        u.id === userId 
          ? { 
              ...u, 
              status: 'active',
              banned_until: null,
              banned_reason: null
            }
          : u
      ));
      onSuccess(`Benutzer erfolgreich entsperrt (Demo-Modus)`);
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Fehler beim Entsperren des Benutzers');
    } finally {
      setLoading(false);
    }
  };

  // Load stats only
  const loadStats = async () => {
    if (!accessToken) return;

    try {
      const statsData = await getUserStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // Generate random password
  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewUser({ ...newUser, password });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Aktiv</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Inaktiv</Badge>;
      case 'banned':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Gesperrt</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Admin</Badge>;
      case 'shopowner':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Shop Owner</Badge>;
      case 'customer':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Kunde</Badge>;
      default:
        return <Badge>{role}</Badge>;
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-5 w-5 animate-spin text-elbfunkeln-green" />
          <span className="text-elbfunkeln-green">Lade Benutzerdaten...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="p-4 border-elbfunkeln-green/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Gesamt</p>
                <p className="text-2xl font-semibold text-elbfunkeln-green">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-elbfunkeln-green" />
            </div>
          </Card>
          
          <Card className="p-4 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Aktiv</p>
                <p className="text-2xl font-semibold text-green-600">{stats.active}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </Card>
          
          <Card className="p-4 border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Inaktiv</p>
                <p className="text-2xl font-semibold text-gray-600">{stats.inactive}</p>
              </div>
              <XCircle className="h-8 w-8 text-gray-600" />
            </div>
          </Card>
          
          <Card className="p-4 border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Gesperrt</p>
                <p className="text-2xl font-semibold text-red-600">{stats.banned}</p>
              </div>
              <Ban className="h-8 w-8 text-red-600" />
            </div>
          </Card>
          
          <Card className="p-4 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Neu (Monat)</p>
                <p className="text-2xl font-semibold text-blue-600">{stats.newThisMonth}</p>
              </div>
              <UserPlus className="h-8 w-8 text-blue-600" />
            </div>
          </Card>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Benutzer suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Rollen</SelectItem>
              <SelectItem value="customer">Kunden</SelectItem>
              <SelectItem value="shopowner">Shop Owner</SelectItem>
              <SelectItem value="admin">Admins</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Status</SelectItem>
              <SelectItem value="active">Aktiv</SelectItem>
              <SelectItem value="inactive">Inaktiv</SelectItem>
              <SelectItem value="banned">Gesperrt</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={loadData} 
            variant="outline" 
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Aktualisieren
          </Button>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-elbfunkeln-green hover:bg-elbfunkeln-green/90">
                <Plus className="h-4 w-4 mr-2" />
                Benutzer erstellen
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Neuen Benutzer erstellen</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">E-Mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="benutzer@example.com"
                  />
                </div>
                
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder="Max Mustermann"
                  />
                </div>
                
                <div>
                  <Label htmlFor="role">Rolle</Label>
                  <Select value={newUser.role} onValueChange={(value: any) => setNewUser({ ...newUser, role: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer">Kunde</SelectItem>
                      <SelectItem value="shopowner">Shop Owner</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="password">Passwort</Label>
                  <div className="flex gap-2">
                    <Input
                      id="password"
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      placeholder="Mindestens 6 Zeichen"
                    />
                    <Button 
                      type="button" 
                      onClick={generatePassword}
                      variant="outline"
                      size="sm"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="welcome-email"
                    checked={newUser.sendWelcomeEmail}
                    onChange={(e) => setNewUser({ ...newUser, sendWelcomeEmail: e.target.checked })}
                  />
                  <Label htmlFor="welcome-email">Willkommens-E-Mail senden</Label>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={handleCreateUser}
                    disabled={loading}
                    className="flex-1"
                  >
                    Erstellen
                  </Button>
                  <Button 
                    onClick={() => setShowCreateDialog(false)}
                    variant="outline"
                    disabled={loading}
                  >
                    Abbrechen
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Benutzer</TableHead>
              <TableHead>Rolle</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Erstellt</TableHead>
              <TableHead>Letzter Login</TableHead>
              <TableHead>Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div>
                    <div className="font-semibold">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                    {!user.email_verified && (
                      <div className="text-xs text-orange-600 flex items-center mt-1">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        E-Mail nicht verifiziert
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>{getRoleBadge(user.role)}</TableCell>
                <TableCell>{getStatusBadge(user.status)}</TableCell>
                <TableCell>
                  <div className="text-sm">
                    {new Date(user.created_at).toLocaleDateString('de-DE')}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {user.last_login 
                      ? new Date(user.last_login).toLocaleDateString('de-DE')
                      : 'Nie'
                    }
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedUser(user);
                        setShowDetailsDialog(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleStatus(user.id, user.status)}
                    >
                      {user.status === 'active' ? 'Deaktivieren' : 'Aktivieren'}
                    </Button>
                    
                    {user.status !== 'banned' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleBanUser(user.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Ban className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {user.status === 'banned' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUnbanUser(user.id)}
                        className="text-green-600 hover:text-green-800"
                      >
                        Entsperren
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteUser(user.id, user.email)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {filteredUsers.length === 0 && !loading && (
        <div className="text-center py-8">
          <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">Keine Benutzer gefunden</p>
        </div>
      )}

      {/* User Details Dialog */}
      {selectedUser && (
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Benutzerdetails - {selectedUser.name}</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="general">Allgemein</TabsTrigger>
                <TabsTrigger value="orders">Bestellungen</TabsTrigger>
                <TabsTrigger value="security">Sicherheit</TabsTrigger>
              </TabsList>
              
              <TabsContent value="general" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>E-Mail</Label>
                    <p className="text-sm">{selectedUser.email}</p>
                  </div>
                  <div>
                    <Label>Name</Label>
                    <p className="text-sm">{selectedUser.name}</p>
                  </div>
                  <div>
                    <Label>Rolle</Label>
                    <p className="text-sm">{getRoleBadge(selectedUser.role)}</p>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <p className="text-sm">{getStatusBadge(selectedUser.status)}</p>
                  </div>
                  <div>
                    <Label>Registriert</Label>
                    <p className="text-sm">{new Date(selectedUser.created_at).toLocaleDateString('de-DE')}</p>
                  </div>
                  <div>
                    <Label>Letzter Login</Label>
                    <p className="text-sm">
                      {selectedUser.last_login 
                        ? new Date(selectedUser.last_login).toLocaleDateString('de-DE')
                        : 'Nie'
                      }
                    </p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="orders" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Gesamtbestellungen</Label>
                    <p className="text-2xl font-semibold">{selectedUser.total_orders}</p>
                  </div>
                  <div>
                    <Label>Gesamtumsatz</Label>
                    <p className="text-2xl font-semibold">{selectedUser.total_spent.toFixed(2)} €</p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="security" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>E-Mail verifiziert</Label>
                    <p className="text-sm">
                      {selectedUser.email_verified ? (
                        <Badge className="bg-green-100 text-green-800">Ja</Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800">Nein</Badge>
                      )}
                    </p>
                  </div>
                  <div>
                    <Label>Login-Versuche</Label>
                    <p className="text-sm">{selectedUser.login_attempts}</p>
                  </div>
                  {selectedUser.banned_until && (
                    <>
                      <div>
                        <Label>Gesperrt bis</Label>
                        <p className="text-sm">{new Date(selectedUser.banned_until).toLocaleDateString('de-DE')}</p>
                      </div>
                      <div>
                        <Label>Sperrgrund</Label>
                        <p className="text-sm">{selectedUser.banned_reason || 'Nicht angegeben'}</p>
                      </div>
                    </>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}