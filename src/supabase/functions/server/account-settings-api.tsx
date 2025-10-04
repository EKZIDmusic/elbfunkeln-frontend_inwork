import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

// CORS für alle Routen aktivieren
app.use('*', cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}));

// Supabase Client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Utility-Funktionen
function generateSettingsKey(userId: string, section?: string): string {
  const baseKey = `account_settings:${userId}`;
  return section ? `${baseKey}:${section}` : baseKey;
}

async function getUserFromToken(authHeader: string | null) {
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header');
  }
  
  const token = authHeader.split(' ')[1];
  
  // Handle fallback tokens for demo users
  if (token === 'fallback-token') {
    throw new Error('Fallback token - use local storage');
  }
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    throw new Error('Invalid token or user not found');
  }
  
  return user;
}

function getDefaultSettings(userId: string) {
  return {
    userId,
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
    lastUpdated: new Date().toISOString(),
    version: 1
  };
}

// Routen

// GET /account-settings/:userId - Alle Einstellungen abrufen
app.get('/account-settings/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const authHeader = c.req.header('Authorization');
    
    // Benutzer authentifizieren
    const user = await getUserFromToken(authHeader);
    
    // Prüfen, ob der Benutzer berechtigt ist
    if (user.id !== userId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    // Einstellungen aus KV Store laden
    const settingsKey = generateSettingsKey(userId);
    const settings = await kv.get(settingsKey);
    
    if (!settings) {
      // Default-Einstellungen zurückgeben
      const defaultSettings = getDefaultSettings(userId);
      // Default-Einstellungen speichern
      await kv.set(settingsKey, defaultSettings);
      return c.json(defaultSettings);
    }
    
    return c.json(settings);
  } catch (error) {
    console.error('Error fetching account settings:', error);
    return c.json({ error: error.message }, 500);
  }
});

// PUT /account-settings/:userId - Alle Einstellungen aktualisieren
app.put('/account-settings/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const authHeader = c.req.header('Authorization');
    const settings = await c.req.json();
    
    // Benutzer authentifizieren
    const user = await getUserFromToken(authHeader);
    
    if (user.id !== userId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    // Timestamp und Version aktualisieren
    const updatedSettings = {
      ...settings,
      userId,
      lastUpdated: new Date().toISOString()
    };

    // In KV Store speichern
    const settingsKey = generateSettingsKey(userId);
    await kv.set(settingsKey, updatedSettings);
    
    return c.json({ success: true, settings: updatedSettings });
  } catch (error) {
    console.error('Error updating account settings:', error);
    return c.json({ error: error.message }, 500);
  }
});

// PATCH /account-settings/:userId/communication - Kommunikationseinstellungen
app.patch('/account-settings/:userId/communication', async (c) => {
  try {
    const userId = c.req.param('userId');
    const authHeader = c.req.header('Authorization');
    const communicationSettings = await c.req.json();
    
    const user = await getUserFromToken(authHeader);
    if (user.id !== userId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    // Aktuelle Einstellungen laden
    const settingsKey = generateSettingsKey(userId);
    let settings = await kv.get(settingsKey) || getDefaultSettings(userId);
    
    // Kommunikationseinstellungen aktualisieren
    settings = {
      ...settings,
      communication: communicationSettings,
      lastUpdated: new Date().toISOString(),
      version: (settings.version || 1) + 1
    };
    
    await kv.set(settingsKey, settings);
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error updating communication settings:', error);
    return c.json({ error: error.message }, 500);
  }
});

// PATCH /account-settings/:userId/shipping-payment - Versand & Zahlung
app.patch('/account-settings/:userId/shipping-payment', async (c) => {
  try {
    const userId = c.req.param('userId');
    const authHeader = c.req.header('Authorization');
    const shippingPaymentSettings = await c.req.json();
    
    const user = await getUserFromToken(authHeader);
    if (user.id !== userId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const settingsKey = generateSettingsKey(userId);
    let settings = await kv.get(settingsKey) || getDefaultSettings(userId);
    
    settings = {
      ...settings,
      shippingPayment: shippingPaymentSettings,
      lastUpdated: new Date().toISOString(),
      version: (settings.version || 1) + 1
    };
    
    await kv.set(settingsKey, settings);
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error updating shipping/payment settings:', error);
    return c.json({ error: error.message }, 500);
  }
});

// PATCH /account-settings/:userId/security - Sicherheitseinstellungen
app.patch('/account-settings/:userId/security', async (c) => {
  try {
    const userId = c.req.param('userId');
    const authHeader = c.req.header('Authorization');
    const securitySettings = await c.req.json();
    
    const user = await getUserFromToken(authHeader);
    if (user.id !== userId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const settingsKey = generateSettingsKey(userId);
    let settings = await kv.get(settingsKey) || getDefaultSettings(userId);
    
    settings = {
      ...settings,
      security: securitySettings,
      lastUpdated: new Date().toISOString(),
      version: (settings.version || 1) + 1
    };
    
    await kv.set(settingsKey, settings);
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error updating security settings:', error);
    return c.json({ error: error.message }, 500);
  }
});

// POST /account-settings/:userId/delivery-addresses - Lieferadresse hinzufügen
app.post('/account-settings/:userId/delivery-addresses', async (c) => {
  try {
    const userId = c.req.param('userId');
    const authHeader = c.req.header('Authorization');
    const address = await c.req.json();
    
    const user = await getUserFromToken(authHeader);
    if (user.id !== userId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const settingsKey = generateSettingsKey(userId);
    let settings = await kv.get(settingsKey) || getDefaultSettings(userId);
    
    // ID generieren
    const addressId = `addr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newAddress = { ...address, id: addressId };
    
    // Falls es die erste Adresse ist oder als Standard markiert, andere als nicht-Standard setzen
    if (address.isDefault || settings.shippingPayment.deliveryAddresses.length === 0) {
      settings.shippingPayment.deliveryAddresses = settings.shippingPayment.deliveryAddresses.map(addr => ({
        ...addr,
        isDefault: false
      }));
      newAddress.isDefault = true;
    }
    
    settings.shippingPayment.deliveryAddresses.push(newAddress);
    settings.lastUpdated = new Date().toISOString();
    settings.version = (settings.version || 1) + 1;
    
    await kv.set(settingsKey, settings);
    
    return c.json(newAddress);
  } catch (error) {
    console.error('Error adding delivery address:', error);
    return c.json({ error: error.message }, 500);
  }
});

// DELETE /account-settings/:userId/delivery-addresses/:addressId
app.delete('/account-settings/:userId/delivery-addresses/:addressId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const addressId = c.req.param('addressId');
    const authHeader = c.req.header('Authorization');
    
    const user = await getUserFromToken(authHeader);
    if (user.id !== userId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const settingsKey = generateSettingsKey(userId);
    let settings = await kv.get(settingsKey) || getDefaultSettings(userId);
    
    settings.shippingPayment.deliveryAddresses = settings.shippingPayment.deliveryAddresses.filter(
      addr => addr.id !== addressId
    );
    
    settings.lastUpdated = new Date().toISOString();
    settings.version = (settings.version || 1) + 1;
    
    await kv.set(settingsKey, settings);
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting delivery address:', error);
    return c.json({ error: error.message }, 500);
  }
});

// POST /account-settings/:userId/deactivate - Account deaktivieren
app.post('/account-settings/:userId/deactivate', async (c) => {
  try {
    const userId = c.req.param('userId');
    const authHeader = c.req.header('Authorization');
    const { reason } = await c.req.json();
    
    const user = await getUserFromToken(authHeader);
    if (user.id !== userId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const settingsKey = generateSettingsKey(userId);
    let settings = await kv.get(settingsKey) || getDefaultSettings(userId);
    
    settings.accountManagement = {
      ...settings.accountManagement,
      accountStatus: 'deactivated',
      deactivationReason: reason,
      deactivationDate: new Date().toISOString()
    };
    
    settings.lastUpdated = new Date().toISOString();
    settings.version = (settings.version || 1) + 1;
    
    await kv.set(settingsKey, settings);
    
    // Optional: Benutzer-Session beenden
    await supabase.auth.admin.signOut(userId);
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deactivating account:', error);
    return c.json({ error: error.message }, 500);
  }
});

// POST /account-settings/:userId/delete-request - Account-Löschung anfordern
app.post('/account-settings/:userId/delete-request', async (c) => {
  try {
    const userId = c.req.param('userId');
    const authHeader = c.req.header('Authorization');
    const { reason } = await c.req.json();
    
    const user = await getUserFromToken(authHeader);
    if (user.id !== userId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const settingsKey = generateSettingsKey(userId);
    let settings = await kv.get(settingsKey) || getDefaultSettings(userId);
    
    settings.accountManagement = {
      ...settings.accountManagement,
      deleteRequestDate: new Date().toISOString(),
      deleteRequestReason: reason
    };
    
    settings.lastUpdated = new Date().toISOString();
    settings.version = (settings.version || 1) + 1;
    
    await kv.set(settingsKey, settings);
    
    // TODO: E-Mail an Admin senden oder Job für verzögerte Löschung einrichten
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error requesting account deletion:', error);
    return c.json({ error: error.message }, 500);
  }
});

// GET /account-settings/:userId/login-activities - Login-Aktivitäten
app.get('/account-settings/:userId/login-activities', async (c) => {
  try {
    const userId = c.req.param('userId');
    const authHeader = c.req.header('Authorization');
    
    const user = await getUserFromToken(authHeader);
    if (user.id !== userId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    // Mock-Daten für Login-Aktivitäten
    // In der Realität würden diese aus Logs oder einer speziellen Tabelle kommen
    const activities = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        device: 'Chrome Browser',
        location: 'Hamburg, Deutschland',
        ipAddress: '192.168.1.1',
        successful: true
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        device: 'Mobile Safari',
        location: 'Hamburg, Deutschland',
        ipAddress: '192.168.1.2',
        successful: true
      }
    ];
    
    return c.json(activities);
  } catch (error) {
    console.error('Error fetching login activities:', error);
    return c.json({ error: error.message }, 500);
  }
});

// POST /account-settings/:userId/data-export - Daten-Export anfordern
app.post('/account-settings/:userId/data-export', async (c) => {
  try {
    const userId = c.req.param('userId');
    const authHeader = c.req.header('Authorization');
    
    const user = await getUserFromToken(authHeader);
    if (user.id !== userId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    // Export-Request in KV Store für Verarbeitung speichern
    const exportKey = `data_export_request:${userId}:${Date.now()}`;
    const exportRequest = {
      userId,
      requestedAt: new Date().toISOString(),
      status: 'pending',
      type: 'full_account_data'
    };
    
    await kv.set(exportKey, exportRequest);
    
    // TODO: Job für tatsächlichen Export einrichten
    
    return c.json({ success: true, message: 'Export-Anfrage wurde eingereicht. Sie erhalten eine E-Mail, sobald der Export verfügbar ist.' });
  } catch (error) {
    console.error('Error requesting data export:', error);
    return c.json({ error: error.message }, 500);
  }
});

// POST /account-settings/:userId/sync - Offline-Synchronisation
app.post('/account-settings/:userId/sync', async (c) => {
  try {
    const userId = c.req.param('userId');
    const authHeader = c.req.header('Authorization');
    const localSettings = await c.req.json();
    
    const user = await getUserFromToken(authHeader);
    if (user.id !== userId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const settingsKey = generateSettingsKey(userId);
    const serverSettings = await kv.get(settingsKey);
    
    if (!serverSettings) {
      // Wenn keine Server-Einstellungen existieren, lokale Einstellungen übernehmen
      await kv.set(settingsKey, localSettings);
      return c.json(localSettings);
    }
    
    // Conflict Resolution: Neueste Version gewinnt
    if (localSettings.version > serverSettings.version) {
      await kv.set(settingsKey, localSettings);
      return c.json(localSettings);
    } else {
      return c.json(serverSettings);
    }
  } catch (error) {
    console.error('Error syncing account settings:', error);
    return c.json({ error: error.message }, 500);
  }
});

export default app;