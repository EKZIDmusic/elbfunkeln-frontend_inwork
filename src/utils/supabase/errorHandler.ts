// Enhanced Error Handler für Supabase mit besserer Benutzerfreundlichkeit

interface SupabaseError {
  code: string;
  message: string;
  details?: string;
  hint?: string;
}

interface ErrorConfig {
  showToUser: boolean;
  fallbackData?: any;
  logLevel: 'error' | 'warn' | 'info';
}

export function handleSupabaseError(
  error: SupabaseError | any,
  operation: string,
  config: ErrorConfig = { showToUser: false, logLevel: 'warn' }
) {
  // Enhanced error messages für bekannte Probleme
  const errorMappings: Record<string, string> = {
    '42703': 'Datenbankschema ist nicht vollständig eingerichtet',
    'PGRST200': 'Datenbanktabellen oder Beziehungen fehlen',
    '42P01': 'Erforderliche Datenbanktabelle existiert nicht',
    '42501': 'Keine Berechtigung für diese Datenbank-Operation',
    '23505': 'Datensatz existiert bereits',
    'PGRST116': 'Keine Daten gefunden'
  };

  const userFriendlyMessage = errorMappings[error.code] || 'Ein unbekannter Datenbankfehler ist aufgetreten';
  
  // Verschiedene Log-Level
  const logMessage = `Supabase ${operation} Error: ${error.message || error}`;
  
  switch (config.logLevel) {
    case 'error':
      console.error(logMessage, error);
      break;
    case 'warn':
      console.warn(logMessage, error);
      break;
    case 'info':
      console.info(logMessage, error);
      break;
  }

  // Strukturierte Fehlerinformation
  const errorInfo = {
    operation,
    code: error.code,
    message: error.message,
    userMessage: userFriendlyMessage,
    fallbackUsed: !!config.fallbackData,
    timestamp: new Date().toISOString()
  };

  // Fallback-Daten wenn konfiguriert
  if (config.fallbackData !== undefined) {
    console.log(`📦 Using fallback data for ${operation}`);
    return config.fallbackData;
  }

  return errorInfo;
}

// Spezifische Error Handler für verschiedene Services
export const productErrorHandler = (error: any) => 
  handleSupabaseError(error, 'product query', { 
    showToUser: false, 
    fallbackData: [],
    logLevel: 'warn'
  });

export const orderErrorHandler = (error: any) => 
  handleSupabaseError(error, 'order query', { 
    showToUser: false, 
    fallbackData: [],
    logLevel: 'error'
  });

export const userErrorHandler = (error: any) => 
  handleSupabaseError(error, 'user query', { 
    showToUser: false, 
    fallbackData: [],
    logLevel: 'warn'
  });

export const newsletterErrorHandler = (error: any) => 
  handleSupabaseError(error, 'newsletter query', { 
    showToUser: false, 
    fallbackData: [],
    logLevel: 'warn'
  });

// Database Status Check
export async function checkDatabaseStatus() {
  const checks = {
    products: false,
    orders: false,
    users: false,
    newsletter: false
  };

  try {
    const { supabase } = await import('./client');
    
    // Test products table
    try {
      await supabase.from('products').select('id').limit(1);
      checks.products = true;
    } catch (e) {
      console.warn('Products table not accessible:', e);
    }

    // Test orders table
    try {
      await supabase.from('orders').select('id').limit(1);
      checks.orders = true;
    } catch (e) {
      console.warn('Orders table not accessible:', e);
    }

    // Test user_profiles table
    try {
      await supabase.from('user_profiles').select('id').limit(1);
      checks.users = true;
    } catch (e) {
      console.warn('User profiles table not accessible:', e);
    }

    // Test newsletter_subscribers table
    try {
      await supabase.from('newsletter_subscribers').select('id').limit(1);
      checks.newsletter = true;
    } catch (e) {
      console.warn('Newsletter subscribers table not accessible:', e);
    }

    const allWorking = Object.values(checks).every(status => status);
    
    console.log('📊 Database Status Check:', {
      overall: allWorking ? '✅ Connected' : '⚠️ Partial/No Connection',
      details: checks
    });

    return {
      connected: allWorking,
      tables: checks,
      recommendFallback: !allWorking
    };
  } catch (error) {
    console.error('Database status check failed:', error);
    return {
      connected: false,
      tables: checks,
      recommendFallback: true
    };
  }
}