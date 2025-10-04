import { createClient } from 'npm:@supabase/supabase-js';
import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { migrationApp } from "./migrate-database-sql.tsx";
import authApi from "./auth-api.tsx";
import accountSettingsApi from "./account-settings-api.tsx";
import * as kv from './kv_store.tsx';

const app = new Hono();

// Supabase Client Setup
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Enable logger for debugging
app.use('*', logger(console.log));

// Enable CORS for all routes
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-0a65d7a9/health", (c) => {
  return c.json({ 
    status: "ok", 
    service: "Elbfunkeln E-Commerce API - Supabase Only",
    timestamp: new Date().toISOString()
  });
});

// Auth Routes
app.post("/make-server-0a65d7a9/auth/signin", async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Sign in error:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({
      user: data.user,
      session: data.session
    });
  } catch (error) {
    console.error('Sign in error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.post("/make-server-0a65d7a9/auth/signout", async (c) => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Sign out error:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ message: 'Successfully signed out' });
  } catch (error) {
    console.error('Sign out error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.get("/make-server-0a65d7a9/auth/me", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      return c.json({ error: 'No authorization header' }, 401);
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return c.json({ error: 'Invalid token' }, 401);
    }

    return c.json({ user });
  } catch (error) {
    console.error('Auth me error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Mount migration routes
app.route("/", migrationApp);

// Mount auth routes
app.route("/make-server-0a65d7a9/auth", authApi);

// Mount account settings routes
app.route("/make-server-0a65d7a9", accountSettingsApi);

// Enhanced user registration endpoint
app.post("/make-server-0a65d7a9/auth/register", async (c) => {
  try {
    const { email, password, firstName, lastName, phone, marketingConsent } = await c.req.json();
    
    console.log(`🔐 Registering new user: ${email}`);

    // Basic email validation
    if (!email || !email.includes('@') || !email.includes('.')) {
      return c.json({ 
        error: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
        code: 400 
      }, 400);
    }

    // Password validation
    if (!password || password.length < 6) {
      return c.json({ 
        error: 'Das Passwort muss mindestens 6 Zeichen lang sein.',
        code: 400 
      }, 400);
    }

    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email.toLowerCase().trim(),
      password,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        name: `${firstName} ${lastName}`,
        phone: phone || null,
        role: 'customer',
        marketing_consent: marketingConsent || false
      },
      email_confirm: true // Auto-confirm email in development
    });

    if (authError) {
      console.error('Supabase auth registration error:', authError);
      return c.json({ 
        error: authError.message,
        code: authError.status || 400 
      }, authError.status || 400);
    }

    if (!authData.user) {
      return c.json({ error: 'User creation failed' }, 500);
    }

    // Create extended user profile in KV store
    const userProfile = {
      id: authData.user.id,
      email,
      first_name: firstName,
      last_name: lastName,
      display_name: `${firstName} ${lastName}`,
      phone: phone || null,
      role: 'customer',
      status: 'active',
      email_verified: true,
      marketing_consent: marketingConsent || false,
      newsletter_subscribed: marketingConsent || false,
      total_orders: 0,
      total_spent: 0.00,
      loyalty_points: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      await kv.set(`user_profile:${authData.user.id}`, userProfile);
      await kv.set(`user_email:${email}`, authData.user.id);
      console.log(`✅ User profile created in KV store for: ${email}`);
    } catch (kvError) {
      console.error('KV store error:', kvError);
      // Continue anyway - user is created in Supabase
    }

    // Log security event
    try {
      const logEntry = {
        id: crypto.randomUUID(),
        user_id: authData.user.id,
        event_type: 'registration',
        event_description: 'User account created',
        success: true,
        ip_address: c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown',
        user_agent: c.req.header('User-Agent') || 'unknown',
        created_at: new Date().toISOString()
      };

      await kv.set(`security_log:${logEntry.id}`, logEntry);
    } catch (logError) {
      console.error('Security log error:', logError);
    }

    console.log(`✅ User registration completed successfully: ${email}`);

    return c.json({
      success: true,
      user: authData.user,
      session: authData.session,
      profile: userProfile
    });

  } catch (error) {
    console.error('Registration error:', error);
    return c.json({ 
      error: 'Registration failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Initialize admin users with Supabase Auth
app.post("/make-server-0a65d7a9/auth/init-admin-users", async (c) => {
  try {
    console.log('🚀 Initializing Elbfunkeln admin users...');
    
    const adminUsers = [
      {
        email: 'admin@elbfunkeln.de',
        password: 'admin123',
        user_metadata: { 
          name: 'System Administrator',
          role: 'admin' 
        }
      },
      {
        email: 'owner@elbfunkeln.de',
        password: 'owner123',
        user_metadata: { 
          name: 'Anna Schmidt',
          role: 'shopowner' 
        }
      },
      {
        email: 'sarah.mueller@example.com',
        password: 'customer123',
        user_metadata: { 
          name: 'Sarah Müller',
          role: 'customer' 
        }
      }
    ];

    let createdCount = 0;
    for (const userData of adminUsers) {
      try {
        const { data, error } = await supabase.auth.admin.createUser({
          email: userData.email,
          password: userData.password,
          user_metadata: userData.user_metadata,
          email_confirm: true
        });

        if (error) {
          if (error.message.includes('already been registered') || error.message.includes('already exists')) {
            console.log(`ℹ️ User ${userData.email} already exists`);
          } else {
            console.error(`Error creating user ${userData.email}:`, error);
          }
        } else {
          console.log(`✅ User ${userData.email} created successfully`);
          createdCount++;
        }
      } catch (userError) {
        console.error(`Error creating user ${userData.email}:`, userError);
      }
    }

    return c.json({ 
      message: 'Admin users initialization completed',
      created: createdCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error initializing admin users:', error);
    return c.json({ 
      error: 'Failed to initialize admin users',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Global error handler
app.onError((err, c) => {
  console.error('API Error:', err);
  return c.json({
    error: 'Internal server error',
    message: err.message
  }, 500);
});

// Initialize system on startup
initializeSystem();

// Test endpoint for debugging
app.get("/make-server-0a65d7a9/test-registration", async (c) => {
  return c.json({
    message: "Registration endpoint is accessible",
    timestamp: new Date().toISOString(),
    environment: {
      hasSupabaseUrl: !!Deno.env.get('SUPABASE_URL'),
      hasServiceRoleKey: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
      supabaseUrl: Deno.env.get('SUPABASE_URL')?.substring(0, 30) + '...'
    }
  });
});

async function initializeSystem() {
  try {
    console.log('🚀 Initializing Elbfunkeln E-Commerce API (Supabase)...');
    
    // Create KV bucket if needed
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketName = 'make-0a65d7a9-elbfunkeln';
      const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
      
      if (!bucketExists) {
        const { error } = await supabase.storage.createBucket(bucketName, {
          public: false
        });
        
        if (error) {
          console.error('Error creating bucket:', error);
        } else {
          console.log('✅ Storage bucket created');
        }
      }
    } catch (bucketError) {
      console.error('Error with storage bucket:', bucketError);
    }
    
    console.log('🎉 Elbfunkeln API ready (Supabase mode)!');
  } catch (error) {
    console.error('❌ Error initializing system:', error);
  }
}

Deno.serve(app.fetch);