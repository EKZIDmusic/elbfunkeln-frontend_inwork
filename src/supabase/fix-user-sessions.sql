-- ===============================================
-- Fix User Sessions - Korrekte Spaltennamen
-- ===============================================

-- Check if user_sessions table has the correct columns and add if missing
DO $$ 
BEGIN
    -- Add last_used_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_sessions' 
        AND column_name = 'last_used_at'
    ) THEN
        ALTER TABLE user_sessions ADD COLUMN last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- Update existing sessions to have last_used_at
    UPDATE user_sessions SET last_used_at = created_at WHERE last_used_at IS NULL;
    
    RAISE NOTICE '✅ User sessions table fixed with last_used_at column';
END $$;

-- Ensure we have some test user sessions with all required columns
INSERT INTO user_sessions (
    user_id, session_token, device_name, device_type, browser_name, 
    ip_address, user_agent, is_active, last_used_at, expires_at
) VALUES 
    ('11111111-1111-1111-1111-111111111111', 'sess_' || encode(gen_random_bytes(16), 'hex'), 'iPhone 13', 'mobile', 'Safari Mobile', '192.168.1.100', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)', true, NOW() - INTERVAL '1 hour', NOW() + INTERVAL '29 days'),
    ('22222222-2222-2222-2222-222222222222', 'sess_' || encode(gen_random_bytes(16), 'hex'), 'MacBook Pro', 'desktop', 'Chrome', '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', true, NOW() - INTERVAL '3 hours', NOW() + INTERVAL '25 days'),
    ('33333333-3333-3333-3333-333333333333', 'sess_' || encode(gen_random_bytes(16), 'hex'), 'Windows PC', 'desktop', 'Firefox', '85.223.45.67', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0)', true, NOW() - INTERVAL '30 minutes', NOW() + INTERVAL '30 days')
ON CONFLICT (session_token) DO UPDATE SET 
    last_used_at = EXCLUDED.last_used_at,
    is_active = EXCLUDED.is_active;