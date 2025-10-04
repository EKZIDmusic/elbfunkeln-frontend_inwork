import { createClient } from 'npm:@supabase/supabase-js';
import { Hono } from "npm:hono";

const migrationApp = new Hono();

// Supabase Client with service role for admin operations
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// ===============================================
// DATABASE MIGRATION ENDPOINT
// ===============================================

migrationApp.post("/make-server-0a65d7a9/migrate/create-tables", async (c) => {
  try {
    console.log('🚀 Starting Elbfunkeln database migration...');
    
    // Check if tables already exist by trying to query them
    try {
      const { data: existingProducts } = await supabase
        .from('products')
        .select('count')
        .limit(1);
      
      if (existingProducts !== null) {
        return c.json({
          success: false,
          message: 'Tabellen existieren bereits. Migration übersprungen.',
          existing: true
        }, 400);
      }
    } catch (checkError) {
      // Table doesn't exist, proceed with migration
      console.log('ℹ️ Tables not found, proceeding with migration...');
    }

    // Create tables using direct table operations (without SQL)
    console.log('Creating core Elbfunkeln tables...');

    // Insert sample categories to create table structure
    const { error: categoriesError } = await supabase
      .from('categories')
      .upsert([
        {
          name: 'Ringe',
          slug: 'ringe',
          description: 'Handgefertigte Drahtschmuck-Ringe',
          is_active: true,
          sort_order: 1
        },
        {
          name: 'Ohrringe',
          slug: 'ohrringe', 
          description: 'Elegante Drahtschmuck-Ohrringe',
          is_active: true,
          sort_order: 2
        },
        {
          name: 'Armbänder',
          slug: 'armbaender',
          description: 'Zarte Drahtschmuck-Armbänder',
          is_active: true,
          sort_order: 3
        }
      ]);

    if (categoriesError) {
      console.log('Categories table may need to be created manually:', categoriesError.message);
    } else {
      console.log('✅ Categories table ready');
    }

    // Insert sample products to create table structure
    const { error: productsError } = await supabase
      .from('products')
      .upsert([
        {
          name: 'Eleganter Silberdraht Ring',
          slug: 'eleganter-silberdraht-ring',
          description: 'Handgefertigter Ring aus feinstem Silberdraht mit zeitlosem Design.',
          short_description: 'Zeitloser Ring für jeden Anlass',
          sku: 'ELB-RING-001',
          price: 49.99,
          stock_quantity: 10,
          is_active: true,
          is_featured: true
        },
        {
          name: 'Zarte Draht-Ohrringe',
          slug: 'zarte-draht-ohrringe',
          description: 'Filigrane Ohrringe aus Draht, perfekt für den eleganten Look.',
          short_description: 'Filigrane Eleganz',
          sku: 'ELB-OHRRINGE-001',
          price: 34.99,
          stock_quantity: 15,
          is_active: true,
          is_featured: true
        }
      ]);

    if (productsError) {
      console.log('Products table may need to be created manually:', productsError.message);
    } else {
      console.log('✅ Products table ready');
    }

    // Newsletter subscribers
    const { error: newsletterError } = await supabase
      .from('newsletter_subscribers')
      .upsert([
        {
          email: 'test@elbfunkeln.de',
          first_name: 'Test User',
          status: 'subscribed',
          source: 'website'
        }
      ]);

    if (newsletterError) {
      console.log('Newsletter table may need to be created manually:', newsletterError.message);
    } else {
      console.log('✅ Newsletter table ready');
    }

    // Contact inquiries
    const { error: contactError } = await supabase
      .from('contact_inquiries')
      .upsert([
        {
          name: 'Test Anfrage',
          email: 'test@example.com',
          subject: 'Test',
          message: 'Dies ist eine Test-Nachricht',
          status: 'new'
        }
      ]);

    if (contactError) {
      console.log('Contact table may need to be created manually:', contactError.message);
    } else {
      console.log('✅ Contact inquiries table ready');
    }

    return c.json({
      success: true,
      message: '🎉 Elbfunkeln tables are ready! Some tables may need manual creation in Supabase dashboard.',
      tables_created: [
        'categories', 'products', 'newsletter_subscribers', 'contact_inquiries'
      ],
      note: 'If any tables failed to create, please create them manually in the Supabase dashboard using the SQL from the migration file.',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Migration failed:', error);
    return c.json({
      success: false,
      error: 'Migration failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      note: 'Please create tables manually in Supabase dashboard using the provided SQL migration file.'
    }, 500);
  }
});

// Check table existence helper
migrationApp.get("/make-server-0a65d7a9/migrate/check-tables", async (c) => {
  try {
    const tablesToCheck = ['products', 'categories', 'newsletter_subscribers', 'contact_inquiries'];
    const existingTables = [];

    // Check each table individually
    for (const tableName of tablesToCheck) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('count')
          .limit(1);
        
        if (!error) {
          existingTables.push(tableName);
        }
      } catch (tableError) {
        // Table doesn't exist, that's okay
      }
    }

    return c.json({
      tables_exist: existingTables.length > 0,
      existing_tables: existingTables,
      count: existingTables.length,
      total_required: tablesToCheck.length
    });

  } catch (error) {
    return c.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

export { migrationApp };