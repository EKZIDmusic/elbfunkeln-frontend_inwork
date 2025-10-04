import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { 
  accountSettingsService,
  type CompleteAccountSettings,
  type CommunicationSettings,
  type ShippingPaymentSettings,
  type SecuritySettings,
  type PrivacySettings,
  type DeliveryAddress,
  type PaymentMethod,
  defaultAccountSettings
} from '../services/accountSettingsService';

export function useAccountSettings() {
  const { user, isLoggedIn, accessToken } = useAuth();
  const [settings, setSettings] = useState<CompleteAccountSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Einstellungen laden
  const loadSettings = useCallback(async () => {
    if (!user?.id || !isLoggedIn()) return;

    setLoading(true);
    setError(null);

    try {
      const accountSettings = await accountSettingsService.getAccountSettings(user.id, accessToken || undefined);
      setSettings(accountSettings);
      setLastSyncTime(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Fehler beim Laden der Einstellungen';
      setError(errorMessage);
      console.error('Error loading account settings:', err);
      
      // Fallback zu Default-Einstellungen
      const fallbackSettings: CompleteAccountSettings = {
        ...defaultAccountSettings,
        userId: user.id,
        lastUpdated: new Date().toISOString()
      };
      setSettings(fallbackSettings);
    } finally {
      setLoading(false);
    }
  }, [user?.id, isLoggedIn, accessToken]);

  // Automatisches Laden beim Mount oder User-Wechsel
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Alle Einstellungen speichern
  const updateAllSettings = useCallback(async (newSettings: CompleteAccountSettings): Promise<boolean> => {
    if (!user?.id) return false;

    setLoading(true);
    setError(null);

    try {
      const success = await accountSettingsService.updateAccountSettings(newSettings, accessToken || undefined);
      if (success) {
        setSettings(newSettings);
        setLastSyncTime(new Date());
      }
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Fehler beim Speichern der Einstellungen';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.id, accessToken]);

  // Kommunikationseinstellungen aktualisieren
  const updateCommunicationSettings = useCallback(async (communicationSettings: CommunicationSettings): Promise<boolean> => {
    if (!user?.id || !settings) return false;

    setLoading(true);
    setError(null);

    try {
      const success = await accountSettingsService.updateCommunicationSettings(user.id, communicationSettings, accessToken || undefined);
      if (success) {
        const updatedSettings = {
          ...settings,
          communication: communicationSettings,
          lastUpdated: new Date().toISOString(),
          version: settings.version + 1
        };
        setSettings(updatedSettings);
        setLastSyncTime(new Date());
      }
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Fehler beim Speichern der Kommunikationseinstellungen';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.id, settings, accessToken]);

  // Versand- und Zahlungseinstellungen aktualisieren
  const updateShippingPaymentSettings = useCallback(async (shippingPaymentSettings: ShippingPaymentSettings): Promise<boolean> => {
    if (!user?.id || !settings) return false;

    setLoading(true);
    setError(null);

    try {
      const success = await accountSettingsService.updateShippingPaymentSettings(user.id, shippingPaymentSettings, accessToken || undefined);
      if (success) {
        const updatedSettings = {
          ...settings,
          shippingPayment: shippingPaymentSettings,
          lastUpdated: new Date().toISOString(),
          version: settings.version + 1
        };
        setSettings(updatedSettings);
        setLastSyncTime(new Date());
      }
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Fehler beim Speichern der Versand-/Zahlungseinstellungen';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.id, settings, accessToken]);

  // Sicherheitseinstellungen aktualisieren
  const updateSecuritySettings = useCallback(async (securitySettings: SecuritySettings): Promise<boolean> => {
    if (!user?.id || !settings) return false;

    setLoading(true);
    setError(null);

    try {
      const success = await accountSettingsService.updateSecuritySettings(user.id, securitySettings, accessToken || undefined);
      if (success) {
        const updatedSettings = {
          ...settings,
          security: securitySettings,
          lastUpdated: new Date().toISOString(),
          version: settings.version + 1
        };
        setSettings(updatedSettings);
        setLastSyncTime(new Date());
      }
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Fehler beim Speichern der Sicherheitseinstellungen';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.id, settings, accessToken]);

  // Datenschutzeinstellungen aktualisieren
  const updatePrivacySettings = useCallback(async (privacySettings: PrivacySettings): Promise<boolean> => {
    if (!user?.id || !settings) return false;

    setLoading(true);
    setError(null);

    try {
      const success = await accountSettingsService.updatePrivacySettings(user.id, privacySettings, accessToken || undefined);
      if (success) {
        const updatedSettings = {
          ...settings,
          privacy: privacySettings,
          lastUpdated: new Date().toISOString(),
          version: settings.version + 1
        };
        setSettings(updatedSettings);
        setLastSyncTime(new Date());
      }
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Fehler beim Speichern der Datenschutzeinstellungen';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.id, settings, accessToken]);

  // Lieferadresse hinzufügen
  const addDeliveryAddress = useCallback(async (address: DeliveryAddress): Promise<DeliveryAddress | null> => {
    if (!user?.id || !settings) return null;

    setLoading(true);
    setError(null);

    try {
      const newAddress = await accountSettingsService.addDeliveryAddress(user.id, address);
      if (newAddress && settings) {
        const updatedAddresses = [...settings.shippingPayment.deliveryAddresses];
        
        // Falls es die erste Adresse ist oder als Standard markiert, andere als nicht-Standard setzen
        if (newAddress.isDefault) {
          updatedAddresses.forEach(addr => addr.isDefault = false);
        }
        
        updatedAddresses.push(newAddress);
        
        const updatedSettings = {
          ...settings,
          shippingPayment: {
            ...settings.shippingPayment,
            deliveryAddresses: updatedAddresses
          },
          lastUpdated: new Date().toISOString(),
          version: settings.version + 1
        };
        setSettings(updatedSettings);
        setLastSyncTime(new Date());
      }
      return newAddress;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Fehler beim Hinzufügen der Lieferadresse';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user?.id, settings]);

  // Lieferadresse löschen
  const deleteDeliveryAddress = useCallback(async (addressId: string): Promise<boolean> => {
    if (!user?.id || !settings) return false;

    setLoading(true);
    setError(null);

    try {
      const success = await accountSettingsService.deleteDeliveryAddress(user.id, addressId);
      if (success) {
        const updatedAddresses = settings.shippingPayment.deliveryAddresses.filter(
          addr => addr.id !== addressId
        );
        
        const updatedSettings = {
          ...settings,
          shippingPayment: {
            ...settings.shippingPayment,
            deliveryAddresses: updatedAddresses
          },
          lastUpdated: new Date().toISOString(),
          version: settings.version + 1
        };
        setSettings(updatedSettings);
        setLastSyncTime(new Date());
      }
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Fehler beim Löschen der Lieferadresse';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.id, settings]);

  // Zahlungsmethode hinzufügen
  const addPaymentMethod = useCallback(async (paymentMethod: PaymentMethod): Promise<PaymentMethod | null> => {
    if (!user?.id || !settings) return null;

    setLoading(true);
    setError(null);

    try {
      const newPaymentMethod = await accountSettingsService.addPaymentMethod(user.id, paymentMethod);
      if (newPaymentMethod) {
        const updatedPaymentMethods = [...settings.shippingPayment.paymentMethods];
        
        // Falls es die erste Zahlungsmethode ist oder als Standard markiert
        if (newPaymentMethod.isDefault) {
          updatedPaymentMethods.forEach(method => method.isDefault = false);
        }
        
        updatedPaymentMethods.push(newPaymentMethod);
        
        const updatedSettings = {
          ...settings,
          shippingPayment: {
            ...settings.shippingPayment,
            paymentMethods: updatedPaymentMethods
          },
          lastUpdated: new Date().toISOString(),
          version: settings.version + 1
        };
        setSettings(updatedSettings);
        setLastSyncTime(new Date());
      }
      return newPaymentMethod;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Fehler beim Hinzufügen der Zahlungsmethode';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user?.id, settings]);

  // Zahlungsmethode löschen
  const deletePaymentMethod = useCallback(async (paymentMethodId: string): Promise<boolean> => {
    if (!user?.id || !settings) return false;

    setLoading(true);
    setError(null);

    try {
      const success = await accountSettingsService.deletePaymentMethod(user.id, paymentMethodId);
      if (success) {
        const updatedPaymentMethods = settings.shippingPayment.paymentMethods.filter(
          method => method.id !== paymentMethodId
        );
        
        const updatedSettings = {
          ...settings,
          shippingPayment: {
            ...settings.shippingPayment,
            paymentMethods: updatedPaymentMethods
          },
          lastUpdated: new Date().toISOString(),
          version: settings.version + 1
        };
        setSettings(updatedSettings);
        setLastSyncTime(new Date());
      }
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Fehler beim Löschen der Zahlungsmethode';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.id, settings]);

  // Account deaktivieren
  const deactivateAccount = useCallback(async (reason?: string): Promise<boolean> => {
    if (!user?.id) return false;

    setLoading(true);
    setError(null);

    try {
      const success = await accountSettingsService.deactivateAccount(user.id, reason);
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Fehler beim Deaktivieren des Accounts';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Account-Löschung anfordern
  const requestAccountDeletion = useCallback(async (reason?: string): Promise<boolean> => {
    if (!user?.id) return false;

    setLoading(true);
    setError(null);

    try {
      const success = await accountSettingsService.requestAccountDeletion(user.id, reason);
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Fehler beim Anfordern der Account-Löschung';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Login-Aktivitäten abrufen
  const getLoginActivities = useCallback(async () => {
    if (!user?.id) return [];

    try {
      return await accountSettingsService.getLoginActivities(user.id);
    } catch (err) {
      console.error('Error fetching login activities:', err);
      return [];
    }
  }, [user?.id]);

  // Daten-Export anfordern
  const requestDataExport = useCallback(async (): Promise<boolean> => {
    if (!user?.id) return false;

    setLoading(true);
    setError(null);

    try {
      const success = await accountSettingsService.requestDataExport(user.id);
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Fehler beim Anfordern des Daten-Exports';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Fehler zurücksetzen
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Einstellungen manuell synchronisieren
  const syncSettings = useCallback(async (): Promise<boolean> => {
    if (!user?.id || !settings) return false;

    setLoading(true);
    setError(null);

    try {
      const syncedSettings = await accountSettingsService.syncAccountSettings(user.id, settings);
      setSettings(syncedSettings);
      setLastSyncTime(new Date());
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Fehler beim Synchronisieren der Einstellungen';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.id, settings]);

  return {
    // Zustand
    settings,
    loading,
    error,
    lastSyncTime,
    
    // Aktionen
    loadSettings,
    updateAllSettings,
    updateCommunicationSettings,
    updateShippingPaymentSettings,
    updateSecuritySettings,
    updatePrivacySettings,
    
    // Adressen & Zahlung
    addDeliveryAddress,
    deleteDeliveryAddress,
    addPaymentMethod,
    deletePaymentMethod,
    
    // Account-Management
    deactivateAccount,
    requestAccountDeletion,
    getLoginActivities,
    requestDataExport,
    
    // Utility
    clearError,
    syncSettings
  };
}