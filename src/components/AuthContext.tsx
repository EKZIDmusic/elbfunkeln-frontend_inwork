import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import apiService, { setAuthToken, removeAuthToken } from '../services/apiService';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  role: 'CUSTOMER' | 'SHOP_OWNER' | 'ADMIN';
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  updatePassword: (newPassword: string) => Promise<boolean>;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  isAdmin: () => boolean;
  isShopOwner: () => boolean;
  isLoggedIn: () => boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

// Global reference to cart methods to avoid circular dependencies
let cartActions: {
  clearAllData: () => void;
  loadUserData: (userId: string) => void;
} | null = null;

export const setCartActions = (actions: { clearAllData: () => void; loadUserData: (userId: string) => void }) => {
  cartActions = actions;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const storedToken = localStorage.getItem('auth_token');
        const storedUser = localStorage.getItem('elbfunkeln_user');

        if (storedToken && storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setAccessTokenState(storedToken);
            setUser(parsedUser);

            // Verify token is still valid by getting profile
            try {
              const profile = await apiService.auth.getProfile();
              // Update user data from API
              const updatedUser: User = {
                id: profile.userId,
                email: profile.email,
                firstName: parsedUser.firstName || '',
                lastName: parsedUser.lastName || '',
                name: parsedUser.name || profile.email,
                role: profile.role,
              };
              setUser(updatedUser);
              localStorage.setItem('elbfunkeln_user', JSON.stringify(updatedUser));

              // Load user-specific cart data
              if (cartActions) {
                cartActions.loadUserData(profile.userId);
              }
            } catch (profileError) {
              // Token is invalid, clear session
              console.error('Token validation failed:', profileError);
              localStorage.removeItem('auth_token');
              localStorage.removeItem('elbfunkeln_user');
              setAccessTokenState(null);
              setUser(null);
            }
          } catch (error) {
            console.error('Error parsing stored user data:', error);
            localStorage.removeItem('auth_token');
            localStorage.removeItem('elbfunkeln_user');
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('elbfunkeln_user');
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  // Listen for 401 unauthorized events from API calls
  useEffect(() => {
    const handleUnauthorized = () => {
      console.log('🚨 Unauthorized event received - logging out user');
      setUser(null);
      setAccessTokenState(null);

      // Clear cart data
      if (cartActions) {
        cartActions.clearAllData();
      }

      toast.error('Sitzung abgelaufen', {
        description: 'Bitte melde dich erneut an.'
      });
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      console.log('🔐 Attempting login for:', email);
      
      const response = await apiService.auth.login({ email, password });
      
      if (response.access_token && response.user) {
        const mappedUser: User = {
          id: response.user.id,
          email: response.user.email,
          firstName: response.user.firstName,
          lastName: response.user.lastName,
          name: `${response.user.firstName} ${response.user.lastName}`,
          role: response.user.role,
        };
        
        setAccessTokenState(response.access_token);
        setUser(mappedUser);
        
        // Store in localStorage and API service
        setAuthToken(response.access_token);
        localStorage.setItem('elbfunkeln_user', JSON.stringify(mappedUser));
        
        // Load user-specific cart data
        if (cartActions) {
          cartActions.loadUserData(mappedUser.id);
        }
        
        console.log('✅ Login successful:', mappedUser.email);
        toast.success('Erfolgreich angemeldet!', {
          description: `Willkommen zurück, ${mappedUser.firstName}!`
        });
        
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error('Anmeldung fehlgeschlagen', {
        description: error.message || 'Bitte überprüfe deine Zugangsdaten.'
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    try {
      setLoading(true);
      
      console.log('🔐 Attempting registration for:', data.email);

      const response = await apiService.auth.register(data);
      
      if (response.access_token && response.user) {
        const mappedUser: User = {
          id: response.user.id,
          email: response.user.email,
          firstName: response.user.firstName,
          lastName: response.user.lastName,
          name: `${response.user.firstName} ${response.user.lastName}`,
          role: response.user.role,
        };
        
        setAccessTokenState(response.access_token);
        setUser(mappedUser);
        
        // Store in localStorage and API service
        setAuthToken(response.access_token);
        localStorage.setItem('elbfunkeln_user', JSON.stringify(mappedUser));
        
        // Load user-specific cart data
        if (cartActions) {
          cartActions.loadUserData(mappedUser.id);
        }
        
        console.log('✅ Registration successful:', mappedUser.email);
        toast.success('Registrierung erfolgreich!', {
          description: `Willkommen bei Elbfunkeln, ${mappedUser.firstName}!`
        });
        
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error('Registrierung fehlgeschlagen', {
        description: error.message || 'Bitte versuche es später erneut.'
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Starting logout process...');
      
      // Clear user state immediately
      setUser(null);
      setAccessTokenState(null);
      removeAuthToken();
      localStorage.removeItem('elbfunkeln_user');
      
      // Clear cart data
      if (cartActions) {
        cartActions.clearAllData();
      }
      
      console.log('✅ Logout completed successfully');
      
      toast.success('Du wurdest erfolgreich abgemeldet', {
        description: 'Bis bald! 👋'
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, ensure the user is logged out locally
      setUser(null);
      setAccessTokenState(null);
      removeAuthToken();
      localStorage.removeItem('elbfunkeln_user');
      
      if (cartActions) {
        cartActions.clearAllData();
      }
    }
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      // This would need to be implemented in the API
      console.log('Password reset requested for:', email);
      toast.info('Passwort-Reset-Funktion', {
        description: 'Diese Funktion wird derzeit implementiert.'
      });
      return false;
    } catch (error) {
      console.error('Password reset error:', error);
      return false;
    }
  };

  const updatePassword = async (newPassword: string): Promise<boolean> => {
    try {
      // This would need to be implemented in the API
      console.log('Password update requested');
      toast.info('Passwort-Update-Funktion', {
        description: 'Diese Funktion wird derzeit implementiert.'
      });
      return false;
    } catch (error) {
      console.error('Password update error:', error);
      return false;
    }
  };

  const updateProfile = async (profileData: Partial<User>): Promise<boolean> => {
    try {
      if (!user) {
        console.error('No user available');
        return false;
      }

      // Update locally for now
      const updatedUser = { ...user, ...profileData };
      setUser(updatedUser);
      localStorage.setItem('elbfunkeln_user', JSON.stringify(updatedUser));
      
      console.log('✅ Profile updated successfully');
      toast.success('Profil aktualisiert', {
        description: 'Deine Änderungen wurden gespeichert.'
      });
      
      return true;
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Profil-Update fehlgeschlagen', {
        description: 'Bitte versuche es später erneut.'
      });
      return false;
    }
  };

  const isAdmin = () => {
    return user?.role === 'ADMIN';
  };

  const isShopOwner = () => {
    return user?.role === 'SHOP_OWNER';
  };

  const isLoggedIn = () => {
    return user !== null && accessToken !== null;
  };

  return (
    <AuthContext.Provider value={{
      user,
      accessToken,
      login,
      register,
      logout,
      resetPassword,
      updatePassword,
      updateProfile,
      isAdmin,
      isShopOwner,
      isLoggedIn,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
}
