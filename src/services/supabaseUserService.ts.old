// Supabase User Service für Elbfunkeln E-Commerce
import { supabase } from '../utils/supabase/client';
import { projectId } from '../utils/supabase/info';

export interface DatabaseUser {
  id: number;
  email: string;
  name: string;
  password_hash?: string;
  role: 'customer' | 'shopowner' | 'admin';
  status: 'active' | 'inactive' | 'banned';
  email_verified: boolean;
  created_at: string;
  updated_at: string;
  last_login: string | null;
  login_attempts: number;
  banned_until: string | null;
  banned_reason: string | null;
  total_orders: number;
  total_spent: number;
}

export interface UserCreateData {
  email: string;
  name: string;
  password: string;
  role: 'customer' | 'shopowner' | 'admin';
  sendWelcomeEmail: boolean;
}

export interface UserUpdateData {
  id: number;
  email?: string;
  name?: string;
  role?: 'customer' | 'shopowner' | 'admin';
  status?: 'active' | 'inactive' | 'banned';
  email_verified?: boolean;
}

export interface BanUserData {
  userId: number;
  reason: string;
  duration: number; // Tage
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  banned: number;
  newThisMonth: number;
}

class SupabaseUserService {
  private apiBase = `https://${projectId}.supabase.co/functions/v1/make-server-0a65d7a9/api`;
  private accessToken: string | null = null;

  // Authentifizierung für Admin-Operationen
  async authenticate(email: string, password: string): Promise<string> {
    try {
      // First try to sign in with existing session
      let { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionData.session?.access_token) {
        this.accessToken = sessionData.session.access_token;
        return this.accessToken;
      }

      // Try to sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.log('Creating user account since sign in failed:', error.message);
        
        // If sign in fails, try to create the user
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: email === 'admin@elbfunkeln.de' ? 'System Admin' : 
                    email === 'owner@elbfunkeln.de' ? 'Anna Schmidt' : 
                    'User'
            }
          }
        });

        if (signUpError) {
          console.error('Sign up error:', signUpError);
          throw new Error('Konnte Benutzer nicht erstellen oder anmelden');
        }

        // Try to sign in again after creating account
        const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (retryError || !retryData.session?.access_token) {
          throw new Error('Authentifizierung nach Kontoerstellung fehlgeschlagen');
        }

        this.accessToken = retryData.session.access_token;
        return this.accessToken;
      }

      if (!data.session?.access_token) {
        throw new Error('Kein Access Token erhalten');
      }

      this.accessToken = data.session.access_token;
      return this.accessToken;
    } catch (error) {
      console.error('Fehler bei der Authentifizierung:', error);
      throw new Error('Authentifizierung fehlgeschlagen');
    }
  }

  // Aktuelle Session prüfen
  async checkSession(): Promise<string | null> {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error || !data.session?.access_token) {
        this.accessToken = null;
        return null;
      }

      this.accessToken = data.session.access_token;
      return this.accessToken;
    } catch (error) {
      console.error('Fehler beim Prüfen der Session:', error);
      this.accessToken = null;
      return null;
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      await supabase.auth.signOut();
      this.accessToken = null;
    } catch (error) {
      console.error('Logout-Fehler:', error);
    }
  }

  // API-Request Helper
  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    if (!this.accessToken) {
      throw new Error('Nicht authentifiziert - bitte zuerst anmelden');
    }

    const url = `${this.apiBase}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.accessToken}`,
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`API Error [${response.status}]:`, errorData);
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Alle Benutzer abrufen
  async getAllUsers(): Promise<DatabaseUser[]> {
    try {
      const response = await this.makeRequest('/users');
      return response.users || [];
    } catch (error) {
      console.error('Fehler beim Laden der Benutzer:', error);
      throw new Error('Konnte Benutzer nicht laden');
    }
  }

  // Benutzer nach ID abrufen
  async getUserById(userId: number): Promise<DatabaseUser> {
    try {
      const response = await this.makeRequest(`/users/${userId}`);
      return response.user;
    } catch (error) {
      console.error('Fehler beim Laden des Benutzers:', error);
      throw new Error('Benutzer nicht gefunden');
    }
  }

  // Neuen Benutzer erstellen
  async createUser(userData: UserCreateData): Promise<DatabaseUser> {
    try {
      const response = await this.makeRequest('/users', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      
      console.log('Neuer Benutzer erfolgreich erstellt:', response.user);
      return response.user;
    } catch (error) {
      console.error('Fehler beim Erstellen des Benutzers:', error);
      throw new Error('Konnte Benutzer nicht erstellen');
    }
  }

  // Benutzer aktualisieren
  async updateUser(userData: UserUpdateData): Promise<DatabaseUser> {
    try {
      const response = await this.makeRequest(`/users/${userData.id}`, {
        method: 'PUT',
        body: JSON.stringify(userData),
      });
      
      console.log('Benutzer erfolgreich aktualisiert:', response.user);
      return response.user;
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Benutzers:', error);
      throw new Error('Konnte Benutzer nicht aktualisieren');
    }
  }

  // Benutzer löschen (Soft Delete)
  async deleteUser(userId: number): Promise<void> {
    try {
      await this.makeRequest(`/users/${userId}`, {
        method: 'DELETE',
      });
      
      console.log('Benutzer erfolgreich gelöscht (soft delete):', userId);
    } catch (error) {
      console.error('Fehler beim Löschen des Benutzers:', error);
      throw new Error('Konnte Benutzer nicht löschen');
    }
  }

  // Benutzer sperren
  async banUser(banData: BanUserData): Promise<void> {
    try {
      await this.makeRequest(`/users/${banData.userId}/ban`, {
        method: 'POST',
        body: JSON.stringify({
          reason: banData.reason,
          duration: banData.duration,
        }),
      });
      
      console.log('Benutzer erfolgreich gesperrt:', banData);
    } catch (error) {
      console.error('Fehler beim Sperren des Benutzers:', error);
      throw new Error('Konnte Benutzer nicht sperren');
    }
  }

  // Benutzer entsperren
  async unbanUser(userId: number): Promise<void> {
    try {
      await this.makeRequest(`/users/${userId}/unban`, {
        method: 'POST',
      });
      
      console.log('Benutzer erfolgreich entsperrt:', userId);
    } catch (error) {
      console.error('Fehler beim Entsperren des Benutzers:', error);
      throw new Error('Konnte Benutzer nicht entsperren');
    }
  }

  // Passwort zurücksetzen
  async resetPassword(userId: number, newPassword: string): Promise<void> {
    try {
      await this.makeRequest(`/users/${userId}/reset-password`, {
        method: 'POST',
        body: JSON.stringify({ newPassword }),
      });
      
      console.log('Passwort erfolgreich zurückgesetzt für Benutzer:', userId);
    } catch (error) {
      console.error('Fehler beim Zurücksetzen des Passworts:', error);
      throw new Error('Konnte Passwort nicht zurücksetzen');
    }
  }

  // E-Mail-Verifizierung senden
  async sendVerificationEmail(userId: number): Promise<void> {
    try {
      await this.makeRequest(`/users/${userId}/send-verification`, {
        method: 'POST',
      });
      
      console.log('Verifikations-E-Mail erfolgreich gesendet für Benutzer:', userId);
    } catch (error) {
      console.error('Fehler beim Senden der Verifikations-E-Mail:', error);
      throw new Error('Konnte E-Mail nicht senden');
    }
  }

  // Benutzer-Statistiken abrufen
  async getUserStats(): Promise<UserStats> {
    try {
      const response = await this.makeRequest('/users/stats');
      return response.stats;
    } catch (error) {
      console.error('Fehler beim Laden der Benutzer-Statistiken:', error);
      throw new Error('Konnte Statistiken nicht laden');
    }
  }

  // Benutzer suchen und filtern
  async searchUsers(query: string, filters?: {
    role?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<DatabaseUser[]> {
    try {
      const users = await this.getAllUsers();
      
      let filteredUsers = users;

      // Textsuche
      if (query.trim()) {
        const searchQuery = query.toLowerCase();
        filteredUsers = filteredUsers.filter(user =>
          user.email.toLowerCase().includes(searchQuery) ||
          user.name.toLowerCase().includes(searchQuery)
        );
      }

      // Filter anwenden
      if (filters) {
        if (filters.role && filters.role !== 'all') {
          filteredUsers = filteredUsers.filter(user => user.role === filters.role);
        }

        if (filters.status && filters.status !== 'all') {
          filteredUsers = filteredUsers.filter(user => user.status === filters.status);
        }

        if (filters.dateFrom) {
          const fromDate = new Date(filters.dateFrom);
          filteredUsers = filteredUsers.filter(user => 
            new Date(user.created_at) >= fromDate
          );
        }

        if (filters.dateTo) {
          const toDate = new Date(filters.dateTo);
          toDate.setHours(23, 59, 59, 999); // Ende des Tages
          filteredUsers = filteredUsers.filter(user => 
            new Date(user.created_at) <= toDate
          );
        }
      }

      return filteredUsers;
    } catch (error) {
      console.error('Fehler bei der Benutzersuche:', error);
      throw new Error('Konnte Suchergebnisse nicht laden');
    }
  }
}

export const supabaseUserService = new SupabaseUserService();