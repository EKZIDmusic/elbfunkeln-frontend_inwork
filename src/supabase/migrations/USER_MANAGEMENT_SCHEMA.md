# 🗄️ Supabase Tabellen-Schema für Benutzer-Management

## 📋 **Erforderliche Tabellen-Struktur**

### 🔐 **users_0a65d7a9** (Erweiterte Benutzer-Profile)

Diese Tabelle erweitert die Standard Supabase Auth-Tabelle um zusätzliche Elbfunkeln-spezifische Daten:

```sql
CREATE TABLE users_0a65d7a9 (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basis-Informationen
  email VARCHAR(255) NOT NULL UNIQUE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  display_name VARCHAR(200),
  phone VARCHAR(50),
  
  -- Benutzer-Status
  role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'shopowner', 'admin')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'banned', 'pending')),
  email_verified BOOLEAN DEFAULT false,
  
  -- Präferenzen
  marketing_consent BOOLEAN DEFAULT false,
  newsletter_subscribed BOOLEAN DEFAULT false,
  language VARCHAR(10) DEFAULT 'de',
  timezone VARCHAR(50) DEFAULT 'Europe/Berlin',
  
  -- Aktivitäts-Daten
  last_login TIMESTAMPTZ,
  login_count INTEGER DEFAULT 0,
  failed_login_attempts INTEGER DEFAULT 0,
  account_locked_until TIMESTAMPTZ,
  
  -- E-Commerce Daten
  total_orders INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0.00,
  loyalty_points INTEGER DEFAULT 0,
  
  -- Adress-Informationen
  billing_address JSONB,
  shipping_address JSONB,
  
  -- Metadaten
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  
  -- Indizes für Performance
  CONSTRAINT unique_active_email UNIQUE NULLS NOT DISTINCT (email, CASE WHEN deleted_at IS NULL THEN 1 END)
);

-- Indizes
CREATE INDEX idx_users_email ON users_0a65d7a9(email);
CREATE INDEX idx_users_role ON users_0a65d7a9(role);
CREATE INDEX idx_users_status ON users_0a65d7a9(status);
CREATE INDEX idx_users_created_at ON users_0a65d7a9(created_at);
```

### 🔄 **password_resets_0a65d7a9** (Passwort-Reset-Tokens)

```sql
CREATE TABLE password_resets_0a65d7a9 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users_0a65d7a9(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  
  -- Reset-Token Management
  token VARCHAR(255) NOT NULL UNIQUE,
  token_hash VARCHAR(255) NOT NULL,
  
  -- Zeitsteuerung
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  
  -- Sicherheits-Features
  ip_address INET,
  user_agent TEXT,
  attempts INTEGER DEFAULT 0,
  
  -- Status
  is_used BOOLEAN DEFAULT false,
  is_expired BOOLEAN GENERATED ALWAYS AS (expires_at < NOW()) STORED
);

-- Indizes
CREATE INDEX idx_password_resets_token ON password_resets_0a65d7a9(token);
CREATE INDEX idx_password_resets_user_id ON password_resets_0a65d7a9(user_id);
CREATE INDEX idx_password_resets_expires_at ON password_resets_0a65d7a9(expires_at);
```

### 📧 **user_sessions_0a65d7a9** (Session-Management)

```sql
CREATE TABLE user_sessions_0a65d7a9 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users_0a65d7a9(id) ON DELETE CASCADE,
  
  -- Session-Daten
  session_token VARCHAR(255) NOT NULL UNIQUE,
  refresh_token VARCHAR(255),
  
  -- Geräte-Information
  device_info JSONB,
  ip_address INET,
  user_agent TEXT,
  location JSONB,
  
  -- Zeitsteuerung
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  logout_at TIMESTAMPTZ
);

-- Indizes
CREATE INDEX idx_user_sessions_user_id ON user_sessions_0a65d7a9(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions_0a65d7a9(session_token);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions_0a65d7a9(expires_at);
```

### 🔒 **user_security_logs_0a65d7a9** (Sicherheits-Audit)

```sql
CREATE TABLE user_security_logs_0a65d7a9 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users_0a65d7a9(id) ON DELETE CASCADE,
  
  -- Event-Informationen
  event_type VARCHAR(50) NOT NULL, -- 'login', 'logout', 'password_change', 'password_reset', 'account_locked', etc.
  event_description TEXT,
  
  -- Kontext
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN DEFAULT true,
  
  -- Metadaten
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indizes
CREATE INDEX idx_security_logs_user_id ON user_security_logs_0a65d7a9(user_id);
CREATE INDEX idx_security_logs_event_type ON user_security_logs_0a65d7a9(event_type);
CREATE INDEX idx_security_logs_created_at ON user_security_logs_0a65d7a9(created_at);
```

## 🛡️ **Row Level Security (RLS) Policies**

### Users Tabelle
```sql
-- Benutzer können nur ihre eigenen Daten lesen/ändern
CREATE POLICY "Users can view own profile" ON users_0a65d7a9
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users_0a65d7a9
  FOR UPDATE USING (auth.uid() = id);

-- Admins können alle Benutzer verwalten
CREATE POLICY "Admins can manage all users" ON users_0a65d7a9
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM users_0a65d7a9 
      WHERE role IN ('admin', 'shopowner')
    )
  );
```

### Password Resets Tabelle
```sql
-- Nur System kann Password Reset Tokens erstellen
CREATE POLICY "System can manage password resets" ON password_resets_0a65d7a9
  FOR ALL USING (true);
```

## 🔧 **Trigger für automatische Updates**

### Updated_at Trigger
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users_0a65d7a9 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### User Profile Sync Trigger
```sql
-- Synchronisiert auth.users mit users_0a65d7a9
CREATE OR REPLACE FUNCTION sync_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO users_0a65d7a9 (
      id, email, first_name, last_name, display_name, 
      email_verified, created_at
    ) VALUES (
      NEW.id, 
      NEW.email,
      NEW.raw_user_meta_data->>'first_name',
      NEW.raw_user_meta_data->>'last_name',
      NEW.raw_user_meta_data->>'name',
      NEW.email_confirmed_at IS NOT NULL,
      NEW.created_at
    );
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE users_0a65d7a9 SET
      email = NEW.email,
      email_verified = NEW.email_confirmed_at IS NOT NULL,
      updated_at = NOW()
    WHERE id = NEW.id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION sync_user_profile();
```

## 📊 **Standard-Daten**

### Admin-Benutzer
```sql
-- Standard Admin und ShopOwner erstellen
INSERT INTO users_0a65d7a9 (
  id, email, first_name, last_name, display_name, role, status, 
  email_verified, created_at
) VALUES 
  (
    gen_random_uuid(), 
    'admin@elbfunkeln.de', 
    'System', 
    'Administrator', 
    'System Administrator',
    'admin', 
    'active', 
    true, 
    NOW()
  ),
  (
    gen_random_uuid(), 
    'owner@elbfunkeln.de', 
    'Anna', 
    'Schmidt', 
    'Anna Schmidt',
    'shopowner', 
    'active', 
    true, 
    NOW()
  );
```

## 🎯 **Funktionalitäten**

### 🔐 **Authentifizierung**
- Standard Supabase Auth für Login/Logout
- Erweiterte Profile in `users_0a65d7a9`
- Session-Management
- Automatische Synchronisation

### 🔄 **Passwort-Management**
- Self-Service Passwort-Reset
- Admin-gesteuerte Passwort-Resets
- Sichere Token-Generierung
- Audit-Logging

### 👥 **Benutzer-Verwaltung**
- Rollen-basierte Zugriffskontrolle
- Account-Status-Management
- Marketing-Präferenzen
- E-Commerce-Integration

### 📈 **Analytics & Monitoring**
- Login-Tracking
- Sicherheits-Audit-Logs
- Session-Monitoring
- Benutzer-Aktivitäts-Metriken

## 🚀 **Setup-Reihenfolge**

1. **Tabellen erstellen** (in dieser Reihenfolge)
2. **RLS Policies aktivieren**
3. **Trigger einrichten**
4. **Standard-Daten einfügen**
5. **API-Endpunkte testen**
6. **Frontend-Integration**

Diese Struktur bietet eine vollständige, sichere und skalierbare Benutzer-Management-Lösung für Elbfunkeln! 🌟