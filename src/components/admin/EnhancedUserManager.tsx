import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  Shield, 
  Key, 
  Ban, 
  CheckCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  Calendar,
  Mail,
  Phone
} from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '../ui/dropdown-menu';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '../ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { useAuth } from '../AuthContext';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  phone?: string;
  role: 'customer' | 'shopowner' | 'admin';
  status: 'active' | 'inactive' | 'banned' | 'pending';
  email_verified: boolean;
  marketing_consent: boolean;
  total_orders: number;
  total_spent: number;
  last_login?: string;
  created_at: string;
}

interface SecurityLog {
  id: string;
  user_id: string;
  event_type: string;
  event_description: string;
  success: boolean;
  ip_address: string;
  created_at: string;
}

// TODO: Implement user management in new MariaDB API
const API_BASE_URL = ''; // Disabled - not implemented in new API

export function EnhancedUserManager() {
  const { accessToken, user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [passwordResetData, setPasswordResetData] = useState({
    userId: '',
    newPassword: '',
    showPassword: false
  });

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter, statusFilter]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would fetch from the user management API
      // For now, we'll use mock data that includes our demo users
      const mockUsers: UserProfile[] = [
        {
          id: 'admin-1',
          email: 'admin@elbfunkeln.de',
          first_name: 'System',
          last_name: 'Administrator',
          display_name: 'System Administrator',
          role: 'admin',
          status: 'active',
          email_verified: true,
          marketing_consent: false,
          total_orders: 0,
          total_spent: 0,
          last_login: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          created_at: '2022-01-01T00:00:00Z'
        },
        {
          id: 'owner-1',
          email: 'owner@elbfunkeln.de',
          first_name: 'Anna',
          last_name: 'Schmidt',
          display_name: 'Anna Schmidt',
          phone: '+49 40 123 456 789',
          role: 'shopowner',
          status: 'active',
          email_verified: true,
          marketing_consent: true,
          total_orders: 0,
          total_spent: 0,
          last_login: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          created_at: '2022-01-15T00:00:00Z'
        },
        {
          id: 'customer-1',
          email: 'sarah.mueller@example.com',
          first_name: 'Sarah',
          last_name: 'Müller',
          display_name: 'Sarah Müller',
          phone: '+49 40 987 654 321',
          role: 'customer',
          status: 'active',
          email_verified: true,
          marketing_consent: true,
          total_orders: 7,
          total_spent: 425.50,
          last_login: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          created_at: '2022-03-15T00:00:00Z'
        }
      ];

      setUsers(mockUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      setMessage('❌ Fehler beim Laden der Benutzer.');
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    setFilteredUsers(filtered);
  };

  const loadUserSecurityLogs = async (userId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/admin/user-security-logs/${userId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSecurityLogs(data.logs || []);
      } else {
        // Mock security logs for demo
        const mockLogs: SecurityLog[] = [
          {
            id: '1',
            user_id: userId,
            event_type: 'login',
            event_description: 'Successful login',
            success: true,
            ip_address: '192.168.1.100',
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '2',
            user_id: userId,
            event_type: 'password_change',
            event_description: 'Password changed by user',
            success: true,
            ip_address: '192.168.1.100',
            created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
          }
        ];
        setSecurityLogs(mockLogs);
      }
    } catch (error) {
      console.error('Error loading security logs:', error);
    }
  };

  const handleResetPassword = async () => {
    if (!passwordResetData.newPassword || passwordResetData.newPassword.length < 6) {
      setMessage('❌ Das Passwort muss mindestens 6 Zeichen lang sein.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/admin/reset-user-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          userId: passwordResetData.userId,
          newPassword: passwordResetData.newPassword
        })
      });

      if (response.ok) {
        setMessage('✅ Passwort erfolgreich zurückgesetzt!');
        setPasswordResetData({ userId: '', newPassword: '', showPassword: false });
      } else {
        const error = await response.json();
        setMessage(`❌ Fehler: ${error.error || 'Unbekannter Fehler'}`);
      }
    } catch (error) {
      console.error('Password reset error:', error);
      setMessage('❌ Verbindungsfehler beim Zurücksetzen des Passworts.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserStatus = async (userId: string, newStatus: UserProfile['status']) => {
    setIsLoading(true);
    try {
      // In a real implementation, this would call the API
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      ));
      setMessage(`✅ Benutzerstatus erfolgreich auf "${newStatus}" geändert.`);
    } catch (error) {
      console.error('Status update error:', error);
      setMessage('❌ Fehler beim Aktualisieren des Status.');
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'shopowner': return 'bg-blue-100 text-blue-800';
      case 'customer': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-yellow-100 text-yellow-800';
      case 'banned': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-cormorant text-2xl text-elbfunkeln-green">
            Benutzer-Verwaltung 👥
          </h2>
          <p className="font-inter text-sm text-elbfunkeln-green/70">
            Verwalte Benutzerkonten, Rollen und Sicherheit
          </p>
        </div>
        <Badge variant="outline" className="border-elbfunkeln-lavender">
          {filteredUsers.length} Benutzer
        </Badge>
      </div>

      {/* Message Display */}
      {message && (
        <Alert className={message.startsWith('✅') ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          <AlertDescription className={message.startsWith('✅') ? 'text-green-700' : 'text-red-700'}>
            {message}
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card className="p-6 border-0 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label className="font-inter text-elbfunkeln-green">Suchen</Label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-elbfunkeln-green/40" />
              <Input
                placeholder="Name oder E-Mail..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-elbfunkeln-lavender/30"
              />
            </div>
          </div>
          <div>
            <Label className="font-inter text-elbfunkeln-green">Rolle</Label>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="mt-1 border-elbfunkeln-lavender/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Rollen</SelectItem>
                <SelectItem value="admin">Administrator</SelectItem>
                <SelectItem value="shopowner">Shop-Owner</SelectItem>
                <SelectItem value="customer">Kunde</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="font-inter text-elbfunkeln-green">Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="mt-1 border-elbfunkeln-lavender/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="active">Aktiv</SelectItem>
                <SelectItem value="inactive">Inaktiv</SelectItem>
                <SelectItem value="banned">Gesperrt</SelectItem>
                <SelectItem value="pending">Ausstehend</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button
              onClick={loadUsers}
              disabled={isLoading}
              className="w-full bg-elbfunkeln-green text-white hover:bg-elbfunkeln-rose"
            >
              {isLoading ? 'Lädt...' : 'Aktualisieren'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Benutzer</TableHead>
              <TableHead>Rolle</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Bestellungen</TableHead>
              <TableHead>Letzte Anmeldung</TableHead>
              <TableHead>Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium text-elbfunkeln-green">
                      {user.display_name || `${user.first_name} ${user.last_name}`}
                    </div>
                    <div className="text-sm text-elbfunkeln-green/60 flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {user.email}
                    </div>
                    {user.phone && (
                      <div className="text-sm text-elbfunkeln-green/60 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {user.phone}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getRoleBadgeColor(user.role)}>
                    {user.role === 'admin' ? 'Administrator' :
                     user.role === 'shopowner' ? 'Shop-Owner' : 'Kunde'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusBadgeColor(user.status)}>
                    {user.status === 'active' ? 'Aktiv' :
                     user.status === 'inactive' ? 'Inaktiv' :
                     user.status === 'banned' ? 'Gesperrt' : 'Ausstehend'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{user.total_orders} Bestellungen</div>
                    <div className="text-elbfunkeln-green/60">€{user.total_spent.toFixed(2)}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-elbfunkeln-green/60 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {user.last_login ? 
                      new Date(user.last_login).toLocaleDateString('de-DE') : 
                      'Nie'
                    }
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedUser(user);
                          loadUserSecurityLogs(user.id);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Details anzeigen
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setPasswordResetData(prev => ({ ...prev, userId: user.id }));
                        }}
                      >
                        <Key className="w-4 h-4 mr-2" />
                        Passwort zurücksetzen
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {user.status === 'active' ? (
                        <DropdownMenuItem
                          onClick={() => updateUserStatus(user.id, 'inactive')}
                          className="text-yellow-600"
                        >
                          <Ban className="w-4 h-4 mr-2" />
                          Deaktivieren
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() => updateUserStatus(user.id, 'active')}
                          className="text-green-600"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Aktivieren
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => updateUserStatus(user.id, 'banned')}
                        className="text-red-600"
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        Sperren
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Password Reset Dialog */}
      <Dialog open={!!passwordResetData.userId} onOpenChange={(open) => 
        !open && setPasswordResetData({ userId: '', newPassword: '', showPassword: false })
      }>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Passwort zurücksetzen</DialogTitle>
            <DialogDescription>
              Erstelle ein neues Passwort für den ausgewählten Benutzer.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="newPassword">Neues Passwort</Label>
              <div className="relative mt-1">
                <Input
                  id="newPassword"
                  type={passwordResetData.showPassword ? 'text' : 'password'}
                  value={passwordResetData.newPassword}
                  onChange={(e) => setPasswordResetData(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="pr-10"
                  placeholder="Mindestens 6 Zeichen"
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setPasswordResetData(prev => ({ ...prev, showPassword: !prev.showPassword }))}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-elbfunkeln-green/40"
                >
                  {passwordResetData.showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordResetData({ userId: '', newPassword: '', showPassword: false })}>
              Abbrechen
            </Button>
            <Button 
              onClick={handleResetPassword}
              disabled={isLoading || !passwordResetData.newPassword}
            >
              {isLoading ? 'Wird zurückgesetzt...' : 'Passwort zurücksetzen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Details Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Benutzer-Details: {selectedUser?.display_name}</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              {/* User Info */}
              <Card className="p-4">
                <h3 className="font-medium text-elbfunkeln-green mb-3">Grundinformationen</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><strong>E-Mail:</strong> {selectedUser.email}</div>
                  <div><strong>Telefon:</strong> {selectedUser.phone || 'Nicht angegeben'}</div>
                  <div><strong>Rolle:</strong> {selectedUser.role}</div>
                  <div><strong>Status:</strong> {selectedUser.status}</div>
                  <div><strong>E-Mail verifiziert:</strong> {selectedUser.email_verified ? 'Ja' : 'Nein'}</div>
                  <div><strong>Marketing-Einwilligung:</strong> {selectedUser.marketing_consent ? 'Ja' : 'Nein'}</div>
                  <div><strong>Mitglied seit:</strong> {new Date(selectedUser.created_at).toLocaleDateString('de-DE')}</div>
                  <div><strong>Letzte Anmeldung:</strong> {selectedUser.last_login ? new Date(selectedUser.last_login).toLocaleDateString('de-DE') : 'Nie'}</div>
                </div>
              </Card>

              {/* Security Logs */}
              <Card className="p-4">
                <h3 className="font-medium text-elbfunkeln-green mb-3">Sicherheitsprotokolle</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {securityLogs.map((log) => (
                    <div key={log.id} className="text-sm border-b border-elbfunkeln-lavender/20 pb-2">
                      <div className="flex justify-between">
                        <span className={log.success ? 'text-green-700' : 'text-red-700'}>
                          {log.event_type}: {log.event_description}
                        </span>
                        <span className="text-elbfunkeln-green/60">
                          {new Date(log.created_at).toLocaleDateString('de-DE')}
                        </span>
                      </div>
                      <div className="text-elbfunkeln-green/50">IP: {log.ip_address}</div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}