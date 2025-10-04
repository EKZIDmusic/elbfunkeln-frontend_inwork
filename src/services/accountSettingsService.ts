import { projectId, publicAnonKey } from '../utils/supabase/info';

// Types für alle Account-Einstellungen
export interface NewsletterSettings {
  newProducts: boolean;
  specialOffers: boolean;
  careTips: boolean;
  frequency?: 'daily' | 'weekly' | 'monthly'; // Für zukünftige Erweiterung
}

export interface EmailNotificationSettings {
  orderConfirmations: boolean;
  shippingNotifications: boolean;
  returns: boolean;
  customerSupport: boolean;
}

export interface CommunicationSettings {
  newsletter: NewsletterSettings;
  emailNotifications: EmailNotificationSettings;
}

export interface DeliveryAddress {
  id?: string;
  label?: string; // z.B. "Zuhause", "Büro"
  firstName: string;
  lastName: string;
  street: string;
  houseNumber: string;
  zipCode: string;
  city: string;
  country: string;
  isDefault: boolean;
}

export interface PaymentMethod {
  id?: string;
  type: 'credit_card' | 'paypal' | 'sepa' | 'bank_transfer';
  label?: string; // z.B. "Hauptkarte", "Backup"
  lastFourDigits?: string; // Für Kreditkarten
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  // Sensible Daten werden nicht hier gespeichert!
}

export interface ShippingPaymentSettings {
  deliveryAddresses: DeliveryAddress[];
  paymentMethods: PaymentMethod[];
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  loginNotifications: boolean;
  lastPasswordChange?: string;
}

export interface PrivacySettings {
  dataProcessingConsent: boolean;
  marketingConsent: boolean;
  analyticsConsent: boolean;
  cookiePreferences: {
    necessary: boolean; // Immer true
    analytics: boolean;
    marketing: boolean;
    personalization: boolean;
  };
}

export interface AccountManagementSettings {
  accountStatus: 'active' | 'suspended' | 'deactivated';
  deleteRequestDate?: string;
  deactivationReason?: string;
}

export interface PreferenceSettings {
  language: 'de' | 'en' | 'fr';
  currency: 'EUR' | 'USD' | 'GBP';
  timezone?: string;
  favoriteCategories: string[];
}

export interface CompleteAccountSettings {
  userId: string;
  communication: CommunicationSettings;
  shippingPayment: ShippingPaymentSettings;
  security: SecuritySettings;
  privacy: PrivacySettings;
  accountManagement: AccountManagementSettings;
  preferences?: PreferenceSettings; // Optional, da wir es entfernt haben
  lastUpdated: string;
  version: number; // Für Versionierung der Einstellungen
}

// Default-Einstellungen
export const defaultAccountSettings: Omit<CompleteAccountSettings, 'userId' | 'lastUpdated'> = {
  communication: {
    newsletter: {
      newProducts: false,
      specialOffers: true,
      careTips: false
    },
    emailNotifications: {
      orderConfirmations: true,
      shippingNotifications: true,
      returns: true,
      customerSupport: true
    }
  },
  shippingPayment: {
    deliveryAddresses: [],
    paymentMethods: []
  },
  security: {
    twoFactorEnabled: false,
    loginNotifications: true
  },
  privacy: {
    dataProcessingConsent: true,
    marketingConsent: false,
    analyticsConsent: false,
    cookiePreferences: {
      necessary: true,
      analytics: false,
      marketing: false,
      personalization: false
    }
  },
  accountManagement: {
    accountStatus: 'active'
  },
  version: 1
};

class AccountSettingsService {
  private baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-0a65d7a9`;

  private async makeRequest(endpoint: string, options: RequestInit = {}, accessToken?: string) {
    // For fallback users, don't make API calls
    if (accessToken === 'fallback-token') {
      throw new Error('Fallback mode - using local storage');
    }

    // If no accessToken is provided, don't make API calls - use local storage
    if (!accessToken) {
      throw new Error('No access token provided - using local storage');
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        ...options.headers
      }
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`API Error (${response.status}): ${errorData}`);
    }

    return response.json();
  }

  private getLocalStorageKey(userId: string): string {
    return `elbfunkeln_account_settings_${userId}`;
  }

  private getLocalSettings(userId: string): CompleteAccountSettings {
    const stored = localStorage.getItem(this.getLocalStorageKey(userId));
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('Error parsing stored settings:', error);
      }
    }
    
    return {
      ...defaultAccountSettings,
      userId,
      lastUpdated: new Date().toISOString()
    };
  }

  private saveLocalSettings(settings: CompleteAccountSettings): void {
    localStorage.setItem(
      this.getLocalStorageKey(settings.userId), 
      JSON.stringify(settings)
    );
  }

  // Alle Einstellungen abrufen
  async getAccountSettings(userId: string, accessToken?: string): Promise<CompleteAccountSettings> {
    try {
      // For fallback users, use localStorage
      if (accessToken === 'fallback-token') {
        return this.getLocalSettings(userId);
      }

      return await this.makeRequest(`/account-settings/${userId}`, {}, accessToken);
    } catch (error) {
      console.error('Error fetching account settings:', error);
      // Fallback zu Local Storage oder Default-Einstellungen
      return this.getLocalSettings(userId);
    }
  }

  // Alle Einstellungen speichern
  async updateAccountSettings(settings: CompleteAccountSettings, accessToken?: string): Promise<boolean> {
    try {
      const updatedSettings = {
        ...settings,
        lastUpdated: new Date().toISOString(),
        version: settings.version + 1
      };

      // For fallback users, save locally
      if (accessToken === 'fallback-token') {
        this.saveLocalSettings(updatedSettings);
        return true;
      }

      await this.makeRequest(`/account-settings/${settings.userId}`, {
        method: 'PUT',
        body: JSON.stringify(updatedSettings)
      }, accessToken);
      
      // Also save locally as backup
      this.saveLocalSettings(updatedSettings);
      return true;
    } catch (error) {
      console.error('Error updating account settings:', error);
      
      // Fallback to local storage
      if (accessToken === 'fallback-token') {
        const updatedSettings = {
          ...settings,
          lastUpdated: new Date().toISOString(),
          version: settings.version + 1
        };
        this.saveLocalSettings(updatedSettings);
        return true;
      }
      
      return false;
    }
  }

  // Einzelne Bereiche aktualisieren
  async updateCommunicationSettings(userId: string, settings: CommunicationSettings, accessToken?: string): Promise<boolean> {
    try {
      // For fallback users, update locally
      if (accessToken === 'fallback-token') {
        const currentSettings = this.getLocalSettings(userId);
        const updatedSettings = {
          ...currentSettings,
          communication: settings,
          lastUpdated: new Date().toISOString(),
          version: currentSettings.version + 1
        };
        this.saveLocalSettings(updatedSettings);
        return true;
      }

      await this.makeRequest(`/account-settings/${userId}/communication`, {
        method: 'PATCH',
        body: JSON.stringify(settings)
      }, accessToken);
      return true;
    } catch (error) {
      console.error('Error updating communication settings:', error);
      
      // Fallback to local storage
      if (accessToken === 'fallback-token') {
        const currentSettings = this.getLocalSettings(userId);
        const updatedSettings = {
          ...currentSettings,
          communication: settings,
          lastUpdated: new Date().toISOString(),
          version: currentSettings.version + 1
        };
        this.saveLocalSettings(updatedSettings);
        return true;
      }
      
      return false;
    }
  }

  async updateShippingPaymentSettings(userId: string, settings: ShippingPaymentSettings, accessToken?: string): Promise<boolean> {
    try {
      // For fallback users, update locally
      if (accessToken === 'fallback-token') {
        const currentSettings = this.getLocalSettings(userId);
        const updatedSettings = {
          ...currentSettings,
          shippingPayment: settings,
          lastUpdated: new Date().toISOString(),
          version: currentSettings.version + 1
        };
        this.saveLocalSettings(updatedSettings);
        return true;
      }

      await this.makeRequest(`/account-settings/${userId}/shipping-payment`, {
        method: 'PATCH',
        body: JSON.stringify(settings)
      }, accessToken);
      return true;
    } catch (error) {
      console.error('Error updating shipping/payment settings:', error);
      
      // Fallback to local storage
      if (accessToken === 'fallback-token') {
        const currentSettings = this.getLocalSettings(userId);
        const updatedSettings = {
          ...currentSettings,
          shippingPayment: settings,
          lastUpdated: new Date().toISOString(),
          version: currentSettings.version + 1
        };
        this.saveLocalSettings(updatedSettings);
        return true;
      }
      
      return false;
    }
  }

  async updateSecuritySettings(userId: string, settings: SecuritySettings, accessToken?: string): Promise<boolean> {
    try {
      // For fallback users, update locally
      if (accessToken === 'fallback-token') {
        const currentSettings = this.getLocalSettings(userId);
        const updatedSettings = {
          ...currentSettings,
          security: settings,
          lastUpdated: new Date().toISOString(),
          version: currentSettings.version + 1
        };
        this.saveLocalSettings(updatedSettings);
        return true;
      }

      await this.makeRequest(`/account-settings/${userId}/security`, {
        method: 'PATCH',
        body: JSON.stringify(settings)
      }, accessToken);
      return true;
    } catch (error) {
      console.error('Error updating security settings:', error);
      
      // Fallback to local storage
      if (accessToken === 'fallback-token') {
        const currentSettings = this.getLocalSettings(userId);
        const updatedSettings = {
          ...currentSettings,
          security: settings,
          lastUpdated: new Date().toISOString(),
          version: currentSettings.version + 1
        };
        this.saveLocalSettings(updatedSettings);
        return true;
      }
      
      return false;
    }
  }

  async updatePrivacySettings(userId: string, settings: PrivacySettings, accessToken?: string): Promise<boolean> {
    try {
      // For fallback users, update locally
      if (accessToken === 'fallback-token') {
        const currentSettings = this.getLocalSettings(userId);
        const updatedSettings = {
          ...currentSettings,
          privacy: settings,
          lastUpdated: new Date().toISOString(),
          version: currentSettings.version + 1
        };
        this.saveLocalSettings(updatedSettings);
        return true;
      }

      await this.makeRequest(`/account-settings/${userId}/privacy`, {
        method: 'PATCH',
        body: JSON.stringify(settings)
      }, accessToken);
      return true;
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      
      // Fallback to local storage
      if (accessToken === 'fallback-token') {
        const currentSettings = this.getLocalSettings(userId);
        const updatedSettings = {
          ...currentSettings,
          privacy: settings,
          lastUpdated: new Date().toISOString(),
          version: currentSettings.version + 1
        };
        this.saveLocalSettings(updatedSettings);
        return true;
      }
      
      return false;
    }
  }

  // Lieferadressen verwalten
  async addDeliveryAddress(userId: string, address: DeliveryAddress): Promise<DeliveryAddress | null> {
    try {
      return await this.makeRequest(`/account-settings/${userId}/delivery-addresses`, {
        method: 'POST',
        body: JSON.stringify(address)
      });
    } catch (error) {
      console.error('Error adding delivery address:', error);
      return null;
    }
  }

  async updateDeliveryAddress(userId: string, addressId: string, address: DeliveryAddress): Promise<boolean> {
    try {
      await this.makeRequest(`/account-settings/${userId}/delivery-addresses/${addressId}`, {
        method: 'PUT',
        body: JSON.stringify(address)
      });
      return true;
    } catch (error) {
      console.error('Error updating delivery address:', error);
      return false;
    }
  }

  async deleteDeliveryAddress(userId: string, addressId: string): Promise<boolean> {
    try {
      await this.makeRequest(`/account-settings/${userId}/delivery-addresses/${addressId}`, {
        method: 'DELETE'
      });
      return true;
    } catch (error) {
      console.error('Error deleting delivery address:', error);
      return false;
    }
  }

  // Zahlungsmethoden verwalten
  async addPaymentMethod(userId: string, paymentMethod: PaymentMethod): Promise<PaymentMethod | null> {
    try {
      return await this.makeRequest(`/account-settings/${userId}/payment-methods`, {
        method: 'POST',
        body: JSON.stringify(paymentMethod)
      });
    } catch (error) {
      console.error('Error adding payment method:', error);
      return null;
    }
  }

  async deletePaymentMethod(userId: string, paymentMethodId: string): Promise<boolean> {
    try {
      await this.makeRequest(`/account-settings/${userId}/payment-methods/${paymentMethodId}`, {
        method: 'DELETE'
      });
      return true;
    } catch (error) {
      console.error('Error deleting payment method:', error);
      return false;
    }
  }

  // Account-Management
  async deactivateAccount(userId: string, reason?: string): Promise<boolean> {
    try {
      await this.makeRequest(`/account-settings/${userId}/deactivate`, {
        method: 'POST',
        body: JSON.stringify({ reason })
      });
      return true;
    } catch (error) {
      console.error('Error deactivating account:', error);
      return false;
    }
  }

  async requestAccountDeletion(userId: string, reason?: string): Promise<boolean> {
    try {
      await this.makeRequest(`/account-settings/${userId}/delete-request`, {
        method: 'POST',
        body: JSON.stringify({ reason })
      });
      return true;
    } catch (error) {
      console.error('Error requesting account deletion:', error);
      return false;
    }
  }

  // Login-Aktivitäten abrufen
  async getLoginActivities(userId: string): Promise<any[]> {
    try {
      return await this.makeRequest(`/account-settings/${userId}/login-activities`);
    } catch (error) {
      console.error('Error fetching login activities:', error);
      return [];
    }
  }

  // Daten-Export anfordern
  async requestDataExport(userId: string): Promise<boolean> {
    try {
      await this.makeRequest(`/account-settings/${userId}/data-export`, {
        method: 'POST'
      });
      return true;
    } catch (error) {
      console.error('Error requesting data export:', error);
      return false;
    }
  }

  // Bulk-Synchronisation für Offline-Unterstützung
  async syncAccountSettings(userId: string, localSettings: CompleteAccountSettings): Promise<CompleteAccountSettings> {
    try {
      return await this.makeRequest(`/account-settings/${userId}/sync`, {
        method: 'POST',
        body: JSON.stringify(localSettings)
      });
    } catch (error) {
      console.error('Error syncing account settings:', error);
      throw error;
    }
  }
}

export const accountSettingsService = new AccountSettingsService();