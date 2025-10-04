// User Service für MySQL-Datenbankverbindung
// WICHTIG: In Produktion muss dies über eine sichere Backend-API erfolgen

export interface DatabaseUser {
  id: number;
  email: string;
  name: string;
  password_hash: string;
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

// MySQL Database Configuration (aus Environment Variables)
const DB_CONFIG = {
  host: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_DB_HOST) || '45.83.245.57',
  user: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_DB_USER) || 'shopDB',
  password: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_DB_PASSWORD) || 'YOUR_DB_PASSWORD',
  database: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_DB_NAME) || 'Elbfunkeln',
  port: Number((typeof import.meta !== 'undefined' && import.meta.env?.VITE_DB_PORT) || 3306),
};

// Passwort-Hashing (in Produktion bcrypt verwenden)
export const hashPassword = async (password: string): Promise<string> => {
  // Simulation - in Produktion bcrypt.hash() verwenden
  const salt = Math.random().toString(36).substring(2, 15);
  return `$2b$10$${salt}${btoa(password).substring(0, 22)}`;
};

// Simulate MySQL queries (In production, use actual MySQL connection)
class UserService {
  private apiBase = '/api'; // Backend API endpoint
  
  // Alle Benutzer abrufen
  async getAllUsers(): Promise<DatabaseUser[]> {
    try {
      // Simulation einer MySQL-Abfrage
      // SELECT * FROM users ORDER BY created_at DESC;
      
      // Mock-Response für Entwicklung - ersetzen durch echte API-Calls
      const mockUsers: DatabaseUser[] = [
        {
          id: 1,
          email: 'admin@elbfunkeln.de',
          name: 'System Admin',
          password_hash: '$2b$10$hashedPassword123',
          role: 'admin',
          status: 'active',
          email_verified: true,
          created_at: '2024-01-01 00:00:00',
          updated_at: '2024-01-20 14:30:00',
          last_login: '2024-01-20 14:30:15',
          login_attempts: 0,
          banned_until: null,
          banned_reason: null,
          total_orders: 0,
          total_spent: 0
        },
        {
          id: 2,
          email: 'owner@elbfunkeln.de',
          name: 'Anna Schmidt',
          password_hash: '$2b$10$hashedPassword456',
          role: 'shopowner',
          status: 'active',
          email_verified: true,
          created_at: '2024-01-01 00:00:00',
          updated_at: '2024-01-20 12:15:00',
          last_login: '2024-01-20 12:15:30',
          login_attempts: 0,
          banned_until: null,
          banned_reason: null,
          total_orders: 0,
          total_spent: 0
        }
      ];

      // Zusätzliche Benutzer aus einer simulierten DB-Abfrage laden
      const additionalUsers = await this.fetchUsersFromDatabase();
      
      return [...mockUsers, ...additionalUsers];
    } catch (error) {
      console.error('Fehler beim Laden der Benutzer:', error);
      throw new Error('Konnte Benutzer nicht laden');
    }
  }

  // Simulierte Datenbankabfrage
  private async fetchUsersFromDatabase(): Promise<DatabaseUser[]> {
    // In Produktion: Echter MySQL-Call über Backend-API
    /*
    const query = `
      SELECT 
        id, email, name, password_hash, role, status, email_verified,
        created_at, updated_at, last_login, login_attempts, 
        banned_until, banned_reason, total_orders, total_spent
      FROM users 
      WHERE deleted_at IS NULL 
      ORDER BY created_at DESC
    `;
    */
    
    // Mock-Daten für Entwicklung
    return [
      {
        id: 3,
        email: 'sarah.mueller@example.com',
        name: 'Sarah Müller',
        password_hash: '$2b$10$hashedPassword789',
        role: 'customer',
        status: 'active',
        email_verified: true,
        created_at: '2024-01-15 10:30:00',
        updated_at: '2024-01-19 18:45:00',
        last_login: '2024-01-19 18:45:22',
        login_attempts: 0,
        banned_until: null,
        banned_reason: null,
        total_orders: 7,
        total_spent: 299.50
      },
      {
        id: 4,
        email: 'max.mustermann@example.com',
        name: 'Max Mustermann',
        password_hash: '$2b$10$hashedPasswordABC',
        role: 'customer',
        status: 'banned',
        email_verified: false,
        created_at: '2024-01-10 15:20:00',
        updated_at: '2024-01-18 09:30:00',
        last_login: '2024-01-18 09:30:45',
        login_attempts: 5,
        banned_until: '2024-02-01 00:00:00',
        banned_reason: 'Verdächtige Aktivitäten',
        total_orders: 2,
        total_spent: 89.90
      }
    ];
  }

  // Neuen Benutzer erstellen
  async createUser(userData: UserCreateData): Promise<DatabaseUser> {
    try {
      const hashedPassword = await hashPassword(userData.password);
      
      // SQL: INSERT INTO users (email, name, password_hash, role, status, email_verified, created_at)
      // VALUES (?, ?, ?, ?, 'active', ?, NOW())
      
      const newUser: DatabaseUser = {
        id: Date.now(), // In Produktion: Auto-increment ID aus DB
        email: userData.email,
        name: userData.name,
        password_hash: hashedPassword,
        role: userData.role,
        status: 'active',
        email_verified: userData.sendWelcomeEmail,
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
        updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
        last_login: null,
        login_attempts: 0,
        banned_until: null,
        banned_reason: null,
        total_orders: 0,
        total_spent: 0
      };

      if (userData.sendWelcomeEmail) {
        await this.sendWelcomeEmail(userData.email, userData.name);
      }

      console.log('Neuer Benutzer erstellt:', newUser);
      return newUser;
    } catch (error) {
      console.error('Fehler beim Erstellen des Benutzers:', error);
      throw new Error('Konnte Benutzer nicht erstellen');
    }
  }

  // Benutzer aktualisieren
  async updateUser(userData: UserUpdateData): Promise<DatabaseUser> {
    try {
      // SQL: UPDATE users SET ... WHERE id = ?
      
      console.log('Benutzer aktualisiert:', userData);
      
      // Mock-Response - in Produktion echte DB-Abfrage
      const updatedUser = await this.getUserById(userData.id);
      return {
        ...updatedUser,
        ...userData,
        updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Benutzers:', error);
      throw new Error('Konnte Benutzer nicht aktualisieren');
    }
  }

  // Benutzer löschen (Soft Delete)
  async deleteUser(userId: number): Promise<void> {
    try {
      // SQL: UPDATE users SET deleted_at = NOW() WHERE id = ?
      console.log('Benutzer gelöscht (soft delete):', userId);
    } catch (error) {
      console.error('Fehler beim Löschen des Benutzers:', error);
      throw new Error('Konnte Benutzer nicht löschen');
    }
  }

  // Benutzer sperren
  async banUser(banData: BanUserData): Promise<void> {
    try {
      const banUntil = new Date();
      banUntil.setDate(banUntil.getDate() + banData.duration);
      
      // SQL: UPDATE users SET status = 'banned', banned_until = ?, banned_reason = ? WHERE id = ?
      
      console.log('Benutzer gesperrt:', {
        userId: banData.userId,
        reason: banData.reason,
        until: banUntil.toISOString()
      });
    } catch (error) {
      console.error('Fehler beim Sperren des Benutzers:', error);
      throw new Error('Konnte Benutzer nicht sperren');
    }
  }

  // Benutzer entsperren
  async unbanUser(userId: number): Promise<void> {
    try {
      // SQL: UPDATE users SET status = 'active', banned_until = NULL, banned_reason = NULL WHERE id = ?
      
      console.log('Benutzer entsperrt:', userId);
    } catch (error) {
      console.error('Fehler beim Entsperren des Benutzers:', error);
      throw new Error('Konnte Benutzer nicht entsperren');
    }
  }

  // Passwort zurücksetzen
  async resetPassword(userId: number, newPassword: string): Promise<void> {
    try {
      const hashedPassword = await hashPassword(newPassword);
      
      // SQL: UPDATE users SET password_hash = ?, updated_at = NOW(), login_attempts = 0 WHERE id = ?
      
      await this.sendPasswordResetEmail(userId);
      console.log('Passwort zurückgesetzt für Benutzer:', userId);
    } catch (error) {
      console.error('Fehler beim Zurücksetzen des Passworts:', error);
      throw new Error('Konnte Passwort nicht zurücksetzen');
    }
  }

  // Benutzer nach ID abrufen
  async getUserById(userId: number): Promise<DatabaseUser> {
    const users = await this.getAllUsers();
    const user = users.find(u => u.id === userId);
    if (!user) {
      throw new Error('Benutzer nicht gefunden');
    }
    return user;
  }

  // E-Mail-Verifizierung senden
  async sendVerificationEmail(userId: number): Promise<void> {
    try {
      const user = await this.getUserById(userId);
      console.log(`Verifikations-E-Mail gesendet an: ${user.email}`);
      
      // In Produktion: Echte E-Mail-Versendung implementieren
    } catch (error) {
      console.error('Fehler beim Senden der Verifikations-E-Mail:', error);
      throw new Error('Konnte E-Mail nicht senden');
    }
  }

  // Welcome E-Mail senden
  private async sendWelcomeEmail(email: string, name: string): Promise<void> {
    console.log(`Welcome E-Mail gesendet an: ${email} (${name})`);
    // In Produktion: Echte E-Mail-Versendung implementieren
  }

  // Passwort-Reset E-Mail senden
  private async sendPasswordResetEmail(userId: number): Promise<void> {
    const user = await this.getUserById(userId);
    console.log(`Passwort-Reset E-Mail gesendet an: ${user.email}`);
    // In Produktion: Echte E-Mail-Versendung implementieren
  }

  // Benutzer-Statistiken abrufen
  async getUserStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    banned: number;
    newThisMonth: number;
  }> {
    try {
      const users = await this.getAllUsers();
      
      const stats = {
        total: users.length,
        active: users.filter(u => u.status === 'active').length,
        inactive: users.filter(u => u.status === 'inactive').length,
        banned: users.filter(u => u.status === 'banned').length,
        newThisMonth: users.filter(u => {
          const created = new Date(u.created_at);
          const now = new Date();
          return created.getMonth() === now.getMonth() && 
                 created.getFullYear() === now.getFullYear();
        }).length
      };

      return stats;
    } catch (error) {
      console.error('Fehler beim Laden der Benutzer-Statistiken:', error);
      throw new Error('Konnte Statistiken nicht laden');
    }
  }
}

export const userService = new UserService();