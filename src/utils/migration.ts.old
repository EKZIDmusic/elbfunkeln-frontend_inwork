import { projectId, publicAnonKey } from './supabase/info';

export interface MigrationStatus {
  tablesExist: boolean;
  existingTables: string[];
  count: number;
}

export interface MigrationResult {
  success: boolean;
  message?: string;
  error?: string;
  details?: string;
  existing?: boolean;
  tables_created?: string[];
  timestamp?: string;
}

/**
 * Check if the required Elbfunkeln e-commerce tables exist in Supabase
 */
export async function checkDatabaseStatus(): Promise<MigrationStatus> {
  try {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-0a65d7a9/migrate/check-tables`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.warn(`Migration check failed: HTTP ${response.status}`);
      // Return safe default if check fails
      return {
        tablesExist: false,
        existingTables: [],
        count: 0
      };
    }

    const result = await response.json();
    return {
      tablesExist: result.tables_exist || false,
      existingTables: result.existing_tables || [],
      count: result.count || 0
    };
  } catch (error) {
    console.error('Error checking database status:', error);
    // Return safe default on error
    return {
      tablesExist: false,
      existingTables: [],
      count: 0
    };
  }
}

/**
 * Run the automated database migration to create all Elbfunkeln tables
 */
export async function runDatabaseMigration(): Promise<MigrationResult> {
  try {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-0a65d7a9/migrate/create-tables`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const result = await response.json();
    
    if (!response.ok) {
      console.error('Migration failed:', result);
      return {
        success: false,
        error: result.error || `HTTP ${response.status}`,
        details: result.details || result.message || 'Migration failed'
      };
    }

    return result;
  } catch (error) {
    console.error('Error running database migration:', error);
    return {
      success: false,
      error: 'Network error',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Required tables for Elbfunkeln e-commerce system (Core tables)
 */
export const REQUIRED_TABLES = [
  'categories',
  'products',
  'product_images',
  'newsletter_subscribers',
  'contact_inquiries'
];

/**
 * Get table information for display
 */
export function getTableInfo() {
  return [
    { name: 'categories', description: 'Drahtschmuck-Kategorien' },
    { name: 'products', description: 'Elbfunkeln Produkte' },
    { name: 'product_images', description: 'Produktbilder' },
    { name: 'newsletter_subscribers', description: 'Newsletter-Abonnenten' },
    { name: 'contact_inquiries', description: 'Kontaktanfragen' }
  ];
}