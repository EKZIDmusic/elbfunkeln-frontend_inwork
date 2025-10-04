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
    
    // Check if tables already exist by querying one of them
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

    // Create tables one by one using Supabase client
    const migrationSteps = [
      // Step 1: Create Categories
      async () => {
        console.log('Creating categories table...');
        await supabase.schema('public').query(`
          CREATE TABLE IF NOT EXISTS categories (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(200) NOT NULL,
            slug VARCHAR(200) UNIQUE NOT NULL,
            description TEXT,
            parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
            image_url VARCHAR(500),
            sort_order INTEGER DEFAULT 0,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `);
      },
      
      // Step 2: Create Products  
      async () => {
        console.log('Creating products table...');
        await supabase.schema('public').query(`
          CREATE TABLE IF NOT EXISTS products (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(300) NOT NULL,
            slug VARCHAR(300) UNIQUE NOT NULL,
            description TEXT,
            short_description VARCHAR(500),
            sku VARCHAR(100) UNIQUE NOT NULL,
            price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
            compare_price DECIMAL(10,2) CHECK (compare_price >= 0),
            cost_price DECIMAL(10,2) CHECK (cost_price >= 0),
            stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
            track_inventory BOOLEAN DEFAULT true,
            weight DECIMAL(8,2) CHECK (weight >= 0),
            dimensions JSONB,
            is_active BOOLEAN DEFAULT true,
            is_featured BOOLEAN DEFAULT false,
            meta_title VARCHAR(300),
            meta_description VARCHAR(500),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `);
      },
      
      // Step 3: Create basic supporting tables
      async () => {
        console.log('Creating supporting tables...');
        
        // Product Images
        await supabase.schema('public').query(`
          CREATE TABLE IF NOT EXISTS product_images (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            product_id UUID REFERENCES products(id) ON DELETE CASCADE,
            image_url VARCHAR(500) NOT NULL,
            alt_text VARCHAR(300),
            sort_order INTEGER DEFAULT 0,
            is_primary BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `);

        // Newsletter Subscribers
        await supabase.schema('public').query(`
          CREATE TABLE IF NOT EXISTS newsletter_subscribers (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            email VARCHAR(320) UNIQUE NOT NULL,
            first_name VARCHAR(100),
            status VARCHAR(20) DEFAULT 'subscribed' CHECK (status IN ('subscribed', 'unsubscribed', 'pending')),
            source VARCHAR(20) DEFAULT 'website' CHECK (source IN ('website', 'checkout', 'manual')),
            subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            unsubscribed_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `);
        
        // Contact Inquiries
        await supabase.schema('public').query(`
          CREATE TABLE IF NOT EXISTS contact_inquiries (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(200) NOT NULL,
            email VARCHAR(320) NOT NULL,
            subject VARCHAR(300) NOT NULL,
            message TEXT NOT NULL,
            phone VARCHAR(20),
            status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'closed')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `);
      }
    ];

    // Execute migration steps
    for (const step of migrationSteps) {
      await step();
    }

    console.log('✅ Core database tables created successfully');

    // Insert sample data
    await insertSampleData();

    return c.json({
      success: true,
      message: '🎉 Elbfunkeln core tables created successfully!',
      tables_created: [
        'categories', 'products', 'product_images', 
        'newsletter_subscribers', 'contact_inquiries'
      ],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Migration failed:', error);
    return c.json({
      success: false,
      error: 'Migration failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// ===============================================
// HELPER FUNCTIONS
// ===============================================

async function insertSampleData() {
  console.log('📦 Inserting sample Elbfunkeln data...');
  
  try {
    // Sample categories
    const { error: categoryError } = await supabase
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
      ], {
        onConflict: 'slug'
      });

    if (categoryError) {
      console.log('Sample categories warning:', categoryError.message);
    } else {
      console.log('✅ Sample categories inserted');
    }

    // Sample products
    const { error: productError } = await supabase
      .from('products')
      .upsert([
        {
          name: 'Eleganter Silberdraht Ring',
          slug: 'eleganter-silberdraht-ring',
          description: 'Handgefertigter Ring aus feinstem Silberdraht',
          short_description: 'Zeitloser Ring für jeden Anlass',
          sku: 'ELB-RING-001',
          price: 49.99,
          stock_quantity: 10,
          is_active: true,
          is_featured: true
        }
      ], {
        onConflict: 'slug'
      });

    if (productError) {
      console.log('Sample products warning:', productError.message);
    } else {
      console.log('✅ Sample products inserted');
    }

  } catch (error) {
    console.log('Sample data insertion warning:', error);
  }
}

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
      count: existingTables.length
    });

  } catch (error) {
    return c.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

export { migrationApp };