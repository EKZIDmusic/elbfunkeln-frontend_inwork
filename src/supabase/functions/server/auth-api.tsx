import { Hono } from 'npm:hono';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Initialize admin users
app.post('/init-admin-users', async (c) => {
  try {
    console.log('🔧 Initializing admin users...');

    const adminUsers = [
      {
        email: 'admin@elbfunkeln.de',
        password: 'admin123',
        user_metadata: {
          name: 'System Administrator',
          first_name: 'System',
          last_name: 'Administrator',
          role: 'admin'
        }
      },
      {
        email: 'owner@elbfunkeln.de',
        password: 'owner123',
        user_metadata: {
          name: 'Anna Schmidt',
          first_name: 'Anna',
          last_name: 'Schmidt',
          role: 'shopowner'
        }
      },
      {
        email: 'sarah.mueller@example.com',
        password: 'customer123',
        user_metadata: {
          name: 'Sarah Müller',
          first_name: 'Sarah',
          last_name: 'Müller',
          role: 'customer'
        }
      }
    ];

    const results = [];

    for (const userData of adminUsers) {
      try {
        const { data, error } = await supabase.auth.admin.createUser({
          email: userData.email,
          password: userData.password,
          user_metadata: userData.user_metadata,
          email_confirm: true
        });

        if (error) {
          console.log(`User ${userData.email} might already exist:`, error.message);
          results.push({ email: userData.email, status: 'exists', error: error.message });
        } else {
          console.log(`✅ Created user: ${userData.email}`);
          results.push({ email: userData.email, status: 'created', id: data.user?.id });
        }
      } catch (userError) {
        console.error(`Error creating user ${userData.email}:`, userError);
        results.push({ email: userData.email, status: 'error', error: userError.message });
      }
    }

    return c.json({ 
      success: true, 
      message: 'Admin users initialization completed',
      results 
    });

  } catch (error) {
    console.error('Init admin users error:', error);
    return c.json({ 
      success: false, 
      error: error.message 
    }, 500);
  }
});

// Create user profile
app.post('/create-user-profile', async (c) => {
  try {
    const body = await c.req.json();
    const { userId, email, firstName, lastName, phone, marketingConsent } = body;

    // Store in KV store for demo purposes
    const userProfile = {
      id: userId,
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

    await kv.set(`user_profile:${userId}`, userProfile);
    await kv.set(`user_email:${email}`, userId);

    console.log(`✅ User profile created for: ${email}`);
    return c.json({ success: true, profile: userProfile });

  } catch (error) {
    console.error('Create user profile error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Update user profile
app.post('/update-user-profile', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'No authorization token' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    
    // Get existing profile
    const existingProfile = await kv.get(`user_profile:${user.id}`);
    if (!existingProfile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    // Update profile
    const updatedProfile = {
      ...existingProfile,
      ...body,
      updated_at: new Date().toISOString()
    };

    await kv.set(`user_profile:${user.id}`, updatedProfile);

    console.log(`✅ User profile updated for: ${user.email}`);
    return c.json({ success: true, profile: updatedProfile });

  } catch (error) {
    console.error('Update user profile error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Log security event
app.post('/log-security-event', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'No authorization token' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const { eventType, description, success = true, metadata = {} } = body;

    const logEntry = {
      id: crypto.randomUUID(),
      user_id: user.id,
      event_type: eventType,
      event_description: description,
      success,
      ip_address: c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown',
      user_agent: c.req.header('User-Agent') || 'unknown',
      metadata,
      created_at: new Date().toISOString()
    };

    // Store security log
    await kv.set(`security_log:${logEntry.id}`, logEntry);
    
    // Also store a user-specific log for easy retrieval
    const userLogs = await kv.get(`user_security_logs:${user.id}`) || [];
    userLogs.push(logEntry.id);
    
    // Keep only last 100 log entries per user
    if (userLogs.length > 100) {
      userLogs.splice(0, userLogs.length - 100);
    }
    
    await kv.set(`user_security_logs:${user.id}`, userLogs);

    console.log(`🔒 Security event logged: ${eventType} for ${user.email}`);
    return c.json({ success: true, logId: logEntry.id });

  } catch (error) {
    console.error('Log security event error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Admin: Reset user password
app.post('/admin/reset-user-password', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'No authorization token' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Check if user is admin
    const userProfile = await kv.get(`user_profile:${user.id}`);
    if (!userProfile || !['admin', 'shopowner'].includes(userProfile.role)) {
      return c.json({ error: 'Insufficient permissions' }, 403);
    }

    const body = await c.req.json();
    const { userId, newPassword } = body;

    // Update user password via Supabase Admin API
    const { data, error: updateError } = await supabase.auth.admin.updateUserById(userId, {
      password: newPassword
    });

    if (updateError) {
      console.error('Password reset error:', updateError);
      return c.json({ error: updateError.message }, 400);
    }

    // Log the admin action
    const logEntry = {
      id: crypto.randomUUID(),
      user_id: userId,
      admin_user_id: user.id,
      event_type: 'admin_password_reset',
      event_description: `Password reset by admin ${user.email}`,
      success: true,
      ip_address: c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown',
      user_agent: c.req.header('User-Agent') || 'unknown',
      created_at: new Date().toISOString()
    };

    await kv.set(`security_log:${logEntry.id}`, logEntry);

    console.log(`🔑 Admin password reset completed for user: ${userId}`);
    return c.json({ success: true, message: 'Password reset successfully' });

  } catch (error) {
    console.error('Admin password reset error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get user security logs (for admin)
app.get('/admin/user-security-logs/:userId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'No authorization token' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Check if user is admin
    const userProfile = await kv.get(`user_profile:${user.id}`);
    if (!userProfile || !['admin', 'shopowner'].includes(userProfile.role)) {
      return c.json({ error: 'Insufficient permissions' }, 403);
    }

    const userId = c.req.param('userId');
    const userLogIds = await kv.get(`user_security_logs:${userId}`) || [];
    
    const logs = [];
    for (const logId of userLogIds) {
      const log = await kv.get(`security_log:${logId}`);
      if (log) {
        logs.push(log);
      }
    }

    // Sort by created_at descending
    logs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return c.json({ success: true, logs });

  } catch (error) {
    console.error('Get user security logs error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

export default app;