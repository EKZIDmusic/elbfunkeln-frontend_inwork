import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

// Single Supabase client instance - prevent multiple GoTrueClient instances
const supabaseUrl = `https://${projectId}.supabase.co`;

// Unique key for this specific application
const ELBFUNKELN_CLIENT_KEY = '__elbfunkeln_supabase_singleton';

// Create a truly global singleton that persists across hot reloads
function createSupabaseClient() {
  // Check if instance already exists globally
  if (typeof globalThis !== 'undefined' && (globalThis as any)[ELBFUNKELN_CLIENT_KEY]) {
    console.log('♻️ Reusing existing global Supabase client instance');
    return (globalThis as any)[ELBFUNKELN_CLIENT_KEY];
  }

  // Create new instance with unique storage key
  const client = createClient(supabaseUrl, publicAnonKey, {
    auth: {
      persistSession: true,
      storageKey: 'elbfunkeln-auth-session',
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      detectSessionInUrl: true,
      flowType: 'pkce',
      autoRefreshToken: true
    },
    global: {
      headers: {
        'x-application-name': 'elbfunkeln-webapp',
        'x-client-version': '1.0.0'
      }
    }
  });

  // Store globally to prevent multiple instances
  if (typeof globalThis !== 'undefined') {
    (globalThis as any)[ELBFUNKELN_CLIENT_KEY] = client;
  }

  console.log('🔄 Created new Supabase client instance');
  return client;
}

// Export the singleton instance
export const supabase = createSupabaseClient();

// For backwards compatibility
export function getSupabaseClient() {
  return supabase;
}