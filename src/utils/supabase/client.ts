/**
 * DEPRECATED: Supabase is no longer used.
 * This file is kept for backwards compatibility with old admin components.
 * All new code should use apiService instead.
 */

// Mock Supabase client that throws helpful errors
const createMockClient = () => {
  const mockClient: any = {
    from: (table: string) => ({
      select: () => {
        console.error(`❌ Supabase client is deprecated. Use apiService instead. Attempted to access table: ${table}`);
        return Promise.resolve({ data: null, error: { message: 'Supabase is no longer used. Please use the new API service.' }, count: 0 });
      },
      insert: () => {
        console.error('❌ Supabase client is deprecated. Use apiService instead.');
        return Promise.resolve({ data: null, error: { message: 'Supabase is no longer used. Please use the new API service.' } });
      },
      update: () => {
        console.error('❌ Supabase client is deprecated. Use apiService instead.');
        return Promise.resolve({ data: null, error: { message: 'Supabase is no longer used. Please use the new API service.' } });
      },
      delete: () => {
        console.error('❌ Supabase client is deprecated. Use apiService instead.');
        return Promise.resolve({ data: null, error: { message: 'Supabase is no longer used. Please use the new API service.' } });
      }
    }),
    auth: {
      signUp: () => Promise.resolve({ data: null, error: { message: 'Use apiService.auth.register instead' } }),
      signIn: () => Promise.resolve({ data: null, error: { message: 'Use apiService.auth.login instead' } }),
      signOut: () => Promise.resolve({ error: null }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null })
    }
  };

  return mockClient;
};

// Export the mock client
export const supabase = createMockClient();

// For backwards compatibility
export function getSupabaseClient() {
  return supabase;
}