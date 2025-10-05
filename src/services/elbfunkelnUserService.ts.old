// Elbfunkeln User Service mit 2FA und erweiterten Sicherheitsfeatures
import { supabase } from '../utils/supabase/client';
import { toast } from 'sonner@2.0.3';

export interface UserProfile {
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

export interface UserSession {
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

export interface UserActivityLog {
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

export interface UserAddress {
  id: string;
  user_id: string;
  type: 'billing' | 'shipping' | 'both';
  is_default: boolean;
  company?: string;
  first_name?: string;
  last_name?: string;
  street: string;
  house_number?: string;
  address_line_2?: string;
  postal_code: string;
  city: string;
  state?: string;
  country: string;
  created_at: string;
  updated_at: string;
}

class ElbfunkelnUserService {
  // ===============================================
  // USER PROFILE MANAGEMENT
  // ===============================================

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Profile doesn't exist
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  async createUserProfile(profile: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert([profile])
        .select()
        .single();

      if (error) throw error;

      await this.logUserActivity(
        profile.user_id!,
        'profile_created',
        'User profile created'
      );

      return data;
    } catch (error) {
      console.error('Error creating user profile:', error);
      toast.error('Fehler beim Erstellen des Benutzerprofils');
      return null;
    }
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      await this.logUserActivity(
        userId,
        'profile_updated',
        'User profile updated'
      );

      return data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      toast.error('Fehler beim Aktualisieren des Profils');
      return null;
    }
  }

  // ===============================================
  // 2FA MANAGEMENT
  // ===============================================

  async generateTwoFactorSecret(userId: string): Promise<string | null> {
    try {
      // Generate base32 secret for TOTP
      const secret = this.generateBase32Secret();
      
      const { error } = await supabase
        .from('user_profiles')
        .update({ two_factor_secret: secret })
        .eq('user_id', userId);

      if (error) throw error;

      await this.logUserActivity(
        userId,
        '2fa_secret_generated',
        '2FA secret generated'
      );

      return secret;
    } catch (error) {
      console.error('Error generating 2FA secret:', error);
      toast.error('Fehler beim Generieren des 2FA-Secrets');
      return null;
    }
  }

  async enableTwoFactor(userId: string, verificationCode: string): Promise<boolean> {
    try {
      // In a real implementation, verify the TOTP code here
      const isValid = await this.verifyTOTPCode(userId, verificationCode);
      
      if (!isValid) {
        toast.error('Ungültiger Bestätigungscode');
        return false;
      }

      // Generate backup codes
      const { data: backupCodes } = await supabase
        .rpc('generate_backup_codes', { user_uuid: userId });

      const { error } = await supabase
        .from('user_profiles')
        .update({ two_factor_enabled: true })
        .eq('user_id', userId);

      if (error) throw error;

      await this.logUserActivity(
        userId,
        '2fa_enabled',
        '2FA authentication enabled'
      );

      toast.success('2FA wurde erfolgreich aktiviert!');
      return true;
    } catch (error) {
      console.error('Error enabling 2FA:', error);
      toast.error('Fehler beim Aktivieren der 2FA');
      return false;
    }
  }

  async disableTwoFactor(userId: string, password: string): Promise<boolean> {
    try {
      // In real implementation, verify password here
      
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          two_factor_enabled: false,
          two_factor_secret: null,
          backup_codes: null
        })
        .eq('user_id', userId);

      if (error) throw error;

      await this.logUserActivity(
        userId,
        '2fa_disabled',
        '2FA authentication disabled'
      );

      toast.success('2FA wurde deaktiviert');
      return true;
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      toast.error('Fehler beim Deaktivieren der 2FA');
      return false;
    }
  }

  async verifyTOTPCode(userId: string, code: string): Promise<boolean> {
    // This is a simplified implementation
    // In production, use a proper TOTP library like 'otplib'
    try {
      const profile = await this.getUserProfile(userId);
      if (!profile?.two_factor_secret) {
        return false;
      }

      // Simulate TOTP verification
      // In real implementation: return totp.verify({ token: code, secret: profile.two_factor_secret });
      return code.length === 6 && /^\d+$/.test(code);
    } catch (error) {
      console.error('Error verifying TOTP code:', error);
      return false;
    }
  }

  // ===============================================
  // SESSION MANAGEMENT
  // ===============================================

  async createUserSession(session: Partial<UserSession>): Promise<UserSession | null> {
    try {
      const sessionData = {
        ...session,
        session_token: this.generateSessionToken(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      };

      const { data, error } = await supabase
        .from('user_sessions')
        .insert([sessionData])
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error creating user session:', error);
      return null;
    }
  }

  async getUserSessions(userId: string): Promise<UserSession[]> {
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user sessions:', error);
      return [];
    }
  }

  async revokeSession(sessionId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .update({ is_active: false })
        .eq('id', sessionId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error revoking session:', error);
      return false;
    }
  }

  async revokeAllSessions(userId: string, exceptCurrent?: string): Promise<boolean> {
    try {
      let query = supabase
        .from('user_sessions')
        .update({ is_active: false })
        .eq('user_id', userId);

      if (exceptCurrent) {
        query = query.neq('id', exceptCurrent);
      }

      const { error } = await query;

      if (error) throw error;

      await this.logUserActivity(
        userId,
        'sessions_revoked',
        'All user sessions revoked'
      );

      return true;
    } catch (error) {
      console.error('Error revoking all sessions:', error);
      return false;
    }
  }

  // ===============================================
  // ADDRESS MANAGEMENT
  // ===============================================

  async getUserAddresses(userId: string): Promise<UserAddress[]> {
    try {
      const { data, error } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user addresses:', error);
      return [];
    }
  }

  async createUserAddress(address: Partial<UserAddress>): Promise<UserAddress | null> {
    try {
      const { data, error } = await supabase
        .from('user_addresses')
        .insert([address])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating user address:', error);
      toast.error('Fehler beim Erstellen der Adresse');
      return null;
    }
  }

  async updateUserAddress(addressId: string, updates: Partial<UserAddress>): Promise<UserAddress | null> {
    try {
      const { data, error } = await supabase
        .from('user_addresses')
        .update(updates)
        .eq('id', addressId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user address:', error);
      toast.error('Fehler beim Aktualisieren der Adresse');
      return null;
    }
  }

  async deleteUserAddress(addressId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_addresses')
        .delete()
        .eq('id', addressId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting user address:', error);
      toast.error('Fehler beim Löschen der Adresse');
      return false;
    }
  }

  // ===============================================
  // ACTIVITY LOGGING
  // ===============================================

  async logUserActivity(
    userId: string,
    actionType: string,
    description?: string,
    metadata?: any
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .rpc('log_user_activity', {
          user_uuid: userId,
          action_type_param: actionType,
          description_param: description,
          metadata_param: metadata
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error logging user activity:', error);
      return false;
    }
  }

  async getUserActivity(userId: string, limit: number = 50): Promise<UserActivityLog[]> {
    try {
      const { data, error } = await supabase
        .from('user_activity_log')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user activity:', error);
      return [];
    }
  }

  // ===============================================
  // UTILITY FUNCTIONS
  // ===============================================

  private generateBase32Secret(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 32; i++) {
      secret += chars[Math.floor(Math.random() * chars.length)];
    }
    return secret;
  }

  private generateSessionToken(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  // ===============================================
  // ADMIN FUNCTIONS
  // ===============================================

  async getAllUsers(limit: number = 100, offset: number = 0): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching all users:', error);
      return [];
    }
  }

  async updateUserRole(userId: string, role: 'customer' | 'shopowner' | 'admin'): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ role })
        .eq('user_id', userId);

      if (error) throw error;

      await this.logUserActivity(
        userId,
        'role_changed',
        `Role changed to ${role}`
      );

      return true;
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Fehler beim Aktualisieren der Benutzerrolle');
      return false;
    }
  }

  async getUserStats(userId: string): Promise<any> {
    try {
      const [profile, sessions, activity] = await Promise.all([
        this.getUserProfile(userId),
        this.getUserSessions(userId),
        this.getUserActivity(userId, 10)
      ]);

      return {
        profile,
        activeSessions: sessions.length,
        recentActivity: activity
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return null;
    }
  }
}

export const elbfunkelnUserService = new ElbfunkelnUserService();