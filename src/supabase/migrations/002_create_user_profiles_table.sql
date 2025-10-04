-- ===============================================
-- Elbfunkeln User Profiles Table mit 2FA Support
-- ===============================================

-- User Profiles Tabelle (erweitert Supabase Auth)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basis-Informationen
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  display_name VARCHAR(200),
  phone VARCHAR(20),
  birth_date DATE,
  
  -- Rollen-System
  role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'shopowner', 'admin')),
  
  -- 2FA Einstellungen
  two_factor_enabled BOOLEAN DEFAULT false,
  two_factor_secret VARCHAR(32), -- Base32 encoded secret für TOTP
  backup_codes JSONB, -- Array von Backup-Codes
  two_factor_recovery_codes JSONB, -- Recovery codes für 2FA reset
  
  -- Zusätzliche Sicherheit
  password_changed_at TIMESTAMP WITH TIME ZONE,
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP WITH TIME ZONE,
  last_login_at TIMESTAMP WITH TIME ZONE,
  last_login_ip INET,
  
  -- Präferenzen
  preferred_language VARCHAR(10) DEFAULT 'de',
  marketing_consent BOOLEAN DEFAULT false,
  email_notifications BOOLEAN DEFAULT true,
  
  -- Avatar & Theme
  avatar_url VARCHAR(500),
  theme_preference VARCHAR(20) DEFAULT 'light' CHECK (theme_preference IN ('light', 'dark', 'auto')),
  
  -- Metadaten
  onboarding_completed BOOLEAN DEFAULT false,
  terms_accepted_at TIMESTAMP WITH TIME ZONE,
  privacy_accepted_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- User Sessions Tabelle (für erweiterte Session-Verwaltung)
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  device_name VARCHAR(200),
  device_type VARCHAR(50), -- 'mobile', 'desktop', 'tablet'
  browser_name VARCHAR(100),
  ip_address INET,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Activity Log (für Sicherheits-Audit)
CREATE TABLE IF NOT EXISTS user_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL, -- 'login', 'logout', 'password_change', '2fa_enable', etc.
  description TEXT,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN DEFAULT true,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Addresses (falls noch nicht vorhanden)
CREATE TABLE IF NOT EXISTS user_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(20) CHECK (type IN ('billing', 'shipping', 'both')),
  is_default BOOLEAN DEFAULT false,
  company VARCHAR(200),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  street VARCHAR(200) NOT NULL,
  house_number VARCHAR(20),
  address_line_2 VARCHAR(200),
  postal_code VARCHAR(20) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100),
  country VARCHAR(5) DEFAULT 'DE',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===============================================
-- INDEXES für Performance
-- ===============================================

-- User Profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_2fa ON user_profiles(two_factor_enabled);

-- User Sessions
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);

-- User Activity Log
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_action ON user_activity_log(action_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_created ON user_activity_log(created_at);

-- User Addresses
CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON user_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_addresses_type ON user_addresses(type);

-- ===============================================
-- RLS POLICIES (Row Level Security)
-- ===============================================

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile" ON user_profiles 
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles 
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile" ON user_profiles 
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage all profiles" ON user_profiles;
CREATE POLICY "Admins can manage all profiles" ON user_profiles 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_profiles up WHERE up.user_id = auth.uid() AND up.role IN ('admin', 'shopowner'))
  );

-- User Sessions Policies
DROP POLICY IF EXISTS "Users can view own sessions" ON user_sessions;
CREATE POLICY "Users can view own sessions" ON user_sessions 
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can manage own sessions" ON user_sessions;
CREATE POLICY "Users can manage own sessions" ON user_sessions 
  FOR ALL USING (user_id = auth.uid());

-- User Activity Log Policies
DROP POLICY IF EXISTS "Users can view own activity" ON user_activity_log;
CREATE POLICY "Users can view own activity" ON user_activity_log 
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "System can insert activity" ON user_activity_log;
CREATE POLICY "System can insert activity" ON user_activity_log 
  FOR INSERT WITH CHECK (true);

-- User Addresses Policies
DROP POLICY IF EXISTS "Users can manage own addresses" ON user_addresses;
CREATE POLICY "Users can manage own addresses" ON user_addresses 
  FOR ALL USING (user_id = auth.uid());

-- ===============================================
-- TRIGGERS für updated_at
-- ===============================================

-- Function für updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_addresses_updated_at 
  BEFORE UPDATE ON user_addresses 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===============================================
-- FUNCTIONS für 2FA und Sicherheit
-- ===============================================

-- Function to generate backup codes
CREATE OR REPLACE FUNCTION generate_backup_codes(user_uuid UUID)
RETURNS JSONB AS $$
DECLARE
    codes JSONB := '[]'::JSONB;
    code TEXT;
    i INTEGER;
BEGIN
    FOR i IN 1..10 LOOP
        code := encode(gen_random_bytes(4), 'hex');
        codes := codes || to_jsonb(code);
    END LOOP;
    
    UPDATE user_profiles 
    SET backup_codes = codes
    WHERE user_id = user_uuid;
    
    RETURN codes;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log user activity
CREATE OR REPLACE FUNCTION log_user_activity(
    user_uuid UUID,
    action_type_param VARCHAR(50),
    description_param TEXT DEFAULT NULL,
    ip_param INET DEFAULT NULL,
    user_agent_param TEXT DEFAULT NULL,
    success_param BOOLEAN DEFAULT true,
    metadata_param JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO user_activity_log (
        user_id, action_type, description, ip_address, user_agent, success, metadata
    ) VALUES (
        user_uuid, action_type_param, description_param, ip_param, user_agent_param, success_param, metadata_param
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===============================================
-- SAMPLE DATA
-- ===============================================

-- Default admin user profile (falls auth.users bereits existiert)
INSERT INTO user_profiles (
    user_id, 
    first_name, 
    last_name, 
    display_name, 
    role,
    onboarding_completed,
    terms_accepted_at,
    privacy_accepted_at
) 
SELECT 
    id,
    'Admin',
    'User',
    'Elbfunkeln Admin',
    'admin',
    true,
    NOW(),
    NOW()
FROM auth.users 
WHERE email = 'admin@elbfunkeln.de'
ON CONFLICT (user_id) DO NOTHING;

-- ===============================================
-- SUCCESS MESSAGE
-- ===============================================

DO $$
BEGIN
  RAISE NOTICE '🔐 Elbfunkeln User Security Tables erfolgreich erstellt!';
  RAISE NOTICE '👥 user_profiles: Erweiterte Benutzerprofile mit 2FA';
  RAISE NOTICE '🔑 user_sessions: Session-Management';
  RAISE NOTICE '📋 user_activity_log: Sicherheits-Audit-Log';
  RAISE NOTICE '🏠 user_addresses: Benutzeradressen';
  RAISE NOTICE '🛡️ RLS Policies aktiviert für alle Tabellen';
  RAISE NOTICE '🚀 Bereit für sichere User-Verwaltung mit 2FA!';
END $$;