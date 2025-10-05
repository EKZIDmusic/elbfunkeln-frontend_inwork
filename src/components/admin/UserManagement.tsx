import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { toast } from 'sonner@2.0.3';
import { Shield, Users, Activity, Settings, Smartphone, Trash2, Eye, UserCheck, UserX, Clock } from 'lucide-react';

// Placeholder types until API is implemented
interface UserProfile {
  id: string;
  user_id: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  phone?: string;
  birth_date?: string;
  role: 'customer' | 'shopowner' | 'admin';
  two_factor_enabled: boolean;
  two_factor_secret?: string;
  backup_codes?: string[];
  preferred_language: string;
  marketing_consent: boolean;
  email_notifications: boolean;
  avatar_url?: string;
  theme_preference: 'light' | 'dark' | 'auto';
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

interface UserSession {
  id: string;
  user_id: string;
  session_token: string;
  device_name?: string;
  device_type?: string;
  browser_name?: string;
  ip_address?: string;
  user_agent?: string;
  is_active: boolean;
  last_used_at: string;
  expires_at: string;
  created_at: string;
}

interface UserActivityLog {
  id: string;
  user_id: string;
  action_type: string;
  description?: string;
  ip_address?: string;
  user_agent?: string;
  success: boolean;
  metadata?: any;
  created_at: string;
}

const elbfunkelnUserService = {
  getAllUsers: async (): Promise<UserProfile[]> => {
    console.log('TODO: Implement getAllUsers in API');
    return [];
  },
  getUserSessions: async (userId: string): Promise<UserSession[]> => {
    console.log('TODO: Implement getUserSessions in API');
    return [];
  },
  getUserActivity: async (userId: string, limit: number): Promise<UserActivityLog[]> => {
    console.log('TODO: Implement getUserActivity in API');
    return [];
  }
};

export function UserManagement() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [userSessions, setUserSessions] = useState<UserSession[]>([]);
  const [userActivity, setUserActivity] = useState<UserActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const usersData = await elbfunkelnUserService.getAllUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Fehler beim Laden der Benutzer');
    } finally {
      setLoading(false);
    }
  };

  const loadUserDetails = async (user: UserProfile) => {
    setSelectedUser(user);
    try {
      const [sessions, activity] = await Promise.all([
        elbfunkelnUserService.getUserSessions(user.user_id),
        elbfunkelnUserService.getUserActivity(user.user_id, 20)
      ]);
      setUserSessions(sessions);
      setUserActivity(activity);
    } catch (error) {
      console.error('Error loading user details:', error);
      toast.error('Fehler beim Laden der Benutzerdetails');
    }
  };

  const updateUserRole = async (userId: string, newRole: 'customer' | 'shopowner' | 'admin') => {
    try {
      const success = await elbfunkelnUserService.updateUserRole(userId, newRole);
      if (success) {
        toast.success('Benutzerrolle wurde aktualisiert');
        loadUsers();
        if (selectedUser?.user_id === userId) {
          setSelectedUser(prev => prev ? { ...prev, role: newRole } : null);
        }
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Fehler beim Aktualisieren der Rolle');
    }
  };

  const revokeAllSessions = async (userId: string) => {
    try {
      const success = await elbfunkelnUserService.revokeAllSessions(userId);
      if (success) {
        toast.success('Alle Sitzungen wurden beendet');
        if (selectedUser?.user_id === userId) {
          setUserSessions([]);
        }
      }
    } catch (error) {
      console.error('Error revoking sessions:', error);
      toast.error('Fehler beim Beenden der Sitzungen');
    }
  };

  const revokeSession = async (sessionId: string) => {
    try {
      const success = await elbfunkelnUserService.revokeSession(sessionId);
      if (success) {
        toast.success('Sitzung wurde beendet');
        setUserSessions(prev => prev.filter(s => s.id !== sessionId));
      }
    } catch (error) {
      console.error('Error revoking session:', error);
      toast.error('Fehler beim Beenden der Sitzung');
    }
  };

  const filteredUsers = users.filter(user =>
    `${user.first_name} ${user.last_name} ${user.display_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getUserStatusBadge = (user: UserProfile) => {
    if (user.role === 'admin') return <Badge variant="destructive">Admin</Badge>;
    if (user.role === 'shopowner') return <Badge variant="secondary">Shop Owner</Badge>;
    return <Badge variant="outline">Kunde</Badge>;
  };

  const formatLastLogin = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-cormorant">🔐 Benutzerverwaltung</h1>
          <p className="text-gray-600">Verwalten Sie Benutzer, Rollen und Sicherheitseinstellungen</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-elbfunkeln-green" />
            <span className="text-sm text-gray-600">{users.length} Benutzer</span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="w-full max-w-sm">
        <Input
          placeholder="Benutzer suchen..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Alle Benutzer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedUser?.id === user.id 
                      ? 'border-elbfunkeln-lavender bg-elbfunkeln-lavender/10' 
                      : 'hover:border-gray-300'
                  }`}
                  onClick={() => loadUserDetails(user)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {user.display_name || `${user.first_name} ${user.last_name}`}
                        </span>
                        {getUserStatusBadge(user)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        ID: {user.user_id.substring(0, 8)}...
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {user.two_factor_enabled && (
                        <Shield className="h-4 w-4 text-green-600" title="2FA aktiviert" />
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          loadUserDetails(user);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* User Details */}
        {selectedUser ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Benutzerdetails
              </CardTitle>
              <CardDescription>
                {selectedUser.display_name || `${selectedUser.first_name} ${selectedUser.last_name}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="profile">Profil</TabsTrigger>
                  <TabsTrigger value="sessions">Sitzungen</TabsTrigger>
                  <TabsTrigger value="activity">Aktivität</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Vorname</Label>
                      <Input value={selectedUser.first_name || ''} disabled />
                    </div>
                    <div>
                      <Label>Nachname</Label>
                      <Input value={selectedUser.last_name || ''} disabled />
                    </div>
                  </div>

                  <div>
                    <Label>Anzeigename</Label>
                    <Input value={selectedUser.display_name || ''} disabled />
                  </div>

                  <div>
                    <Label>Rolle</Label>
                    <Select
                      value={selectedUser.role}
                      onValueChange={(value) => updateUserRole(selectedUser.user_id, value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="customer">Kunde</SelectItem>
                        <SelectItem value="shopowner">Shop Owner</SelectItem>
                        <SelectItem value="admin">Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>2FA Status</Label>
                      <div className="flex items-center gap-2">
                        {selectedUser.two_factor_enabled ? (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            <Shield className="h-3 w-3 mr-1" />
                            Aktiviert
                          </Badge>
                        ) : (
                          <Badge variant="outline">Deaktiviert</Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <UserX className="h-4 w-4 mr-2" />
                          Alle Sitzungen beenden
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Alle Sitzungen beenden?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Dies wird den Benutzer von allen Geräten abmelden. Diese Aktion kann nicht rückgängig gemacht werden.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => revokeAllSessions(selectedUser.user_id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Beenden
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TabsContent>

                <TabsContent value="sessions" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {userSessions.length} aktive Sitzung(en)
                    </span>
                    {userSessions.length > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => revokeAllSessions(selectedUser.user_id)}
                      >
                        Alle beenden
                      </Button>
                    )}
                  </div>

                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {userSessions.map((session) => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Smartphone className="h-4 w-4 text-gray-500" />
                          <div>
                            <div className="text-sm">
                              {session.device_name || session.device_type || 'Unbekanntes Gerät'}
                            </div>
                            <div className="text-xs text-gray-500">
                              Zuletzt aktiv: {formatLastLogin(session.last_used_at)}
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => revokeSession(session.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}

                    {userSessions.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        Keine aktiven Sitzungen
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="activity" className="space-y-4">
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {userActivity.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center gap-3 p-3 border rounded-lg"
                      >
                        <Activity className="h-4 w-4 text-gray-500" />
                        <div className="flex-1">
                          <div className="text-sm">{activity.description}</div>
                          <div className="text-xs text-gray-500">
                            {formatLastLogin(activity.created_at)}
                          </div>
                        </div>
                        <Badge variant={activity.success ? "default" : "destructive"}>
                          {activity.action_type}
                        </Badge>
                      </div>
                    ))}

                    {userActivity.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        Keine Aktivitäten gefunden
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex items-center justify-center h-96">
              <div className="text-center text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Wählen Sie einen Benutzer aus, um Details anzuzeigen</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}