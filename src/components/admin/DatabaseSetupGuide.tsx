import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Database, Copy, ExternalLink, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';

export function DatabaseSetupGuide() {
  const sqlScript = `-- Elbfunkeln E-Commerce Database Schema (UUID FIXED)
-- Execute this in your Supabase SQL Editor
-- Fixes: Consistent UUID generation with gen_random_uuid()

-- Enable UUID extension (for compatibility)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CATEGORIES
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

-- 2. PRODUCTS
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(300) NOT NULL,
  slug VARCHAR(300) UNIQUE NOT NULL,
  description TEXT,
  short_description VARCHAR(500),
  sku VARCHAR(100) UNIQUE NOT NULL,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  compare_price DECIMAL(10,2) CHECK (compare_price >= 0),
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

-- 3. PRODUCT IMAGES
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  image_url VARCHAR(500) NOT NULL,
  alt_text VARCHAR(300),
  sort_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. NEWSLETTER SUBSCRIBERS
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

-- 5. CONTACT INQUIRIES
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

-- 6. ORDERS (Basic structure)
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status VARCHAR(30) DEFAULT 'pending',
  total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
  customer_email VARCHAR(320) NOT NULL,
  customer_name VARCHAR(200) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample data
INSERT INTO categories (name, slug, description, sort_order) VALUES
('Ringe', 'ringe', 'Handgefertigte Drahtschmuck-Ringe', 1),
('Ohrringe', 'ohrringe', 'Elegante Drahtschmuck-Ohrringe', 2),
('Armbänder', 'armbaender', 'Zarte Drahtschmuck-Armbänder', 3)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, short_description, sku, price, stock_quantity, is_active, is_featured) VALUES
('Eleganter Silberdraht Ring', 'eleganter-silberdraht-ring', 'Handgefertigter Ring aus feinstem Silberdraht mit zeitlosem Design. Perfekt für jeden Anlass.', 'Zeitloser Ring für jeden Anlass', 'ELB-RING-001', 49.99, 10, true, true),
('Zarte Draht-Ohrringe', 'zarte-draht-ohrringe', 'Filigrane Ohrringe aus Draht, perfekt für den eleganten Look.', 'Filigrane Eleganz', 'ELB-OHRRINGE-001', 34.99, 15, true, true),
('Minimalistisches Armband', 'minimalistisches-armband', 'Schlichtes und elegantes Armband aus Draht.', 'Minimalistisch & elegant', 'ELB-ARMBAND-001', 29.99, 20, true, false)
ON CONFLICT (slug) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Enable RLS (Row Level Security)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (PostgreSQL 13+ compatible)
DROP POLICY IF EXISTS "Products public read" ON products;
CREATE POLICY "Products public read" ON products FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Categories public read" ON categories;
CREATE POLICY "Categories public read" ON categories FOR SELECT USING (is_active = true);

-- Success message
SELECT 'Elbfunkeln database setup completed successfully! 🎉' as status;`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlScript);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Manuelle Datenbank-Einrichtung
          </CardTitle>
          <CardDescription>
            Falls die automatische Migration nicht funktioniert, können Sie die Tabellen manuell erstellen.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Empfohlene Lösung:</strong> Kopieren Sie das SQL-Script und führen Sie es in der Supabase SQL Editor aus.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <h4 className="font-medium">Schritt-für-Schritt Anleitung:</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Öffnen Sie Ihr <strong>Supabase Dashboard</strong></li>
              <li>Gehen Sie zu <strong>"SQL Editor"</strong></li>
              <li>Erstellen Sie eine <strong>"New Query"</strong></li>
              <li>Kopieren Sie das SQL-Script unten</li>
              <li>Fügen Sie es in den SQL Editor ein</li>
              <li>Klicken Sie <strong>"Run"</strong></li>
            </ol>
          </div>

          <div className="flex gap-2">
            <Button onClick={copyToClipboard} variant="outline" className="flex items-center gap-2">
              <Copy className="h-4 w-4" />
              SQL Script kopieren
            </Button>
            <Button 
              onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
              variant="outline" 
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Supabase Dashboard öffnen
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SQL Script für Elbfunkeln E-Commerce</CardTitle>
          <CardDescription>
            Erstellt alle grundlegenden Tabellen mit Sample-Daten
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">6 Tabellen</Badge>
              <Badge variant="secondary">Sample-Daten</Badge>
              <Badge variant="secondary">Indizes</Badge>
              <Badge variant="secondary">RLS Policies</Badge>
            </div>
            
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto max-h-96">
              {sqlScript}
            </pre>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Was wird erstellt?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Core Tabellen:</h4>
              <ul className="text-sm space-y-1">
                <li>✅ <strong>categories</strong> - Produktkategorien</li>
                <li>✅ <strong>products</strong> - Elbfunkeln Produkte</li>
                <li>✅ <strong>product_images</strong> - Produktbilder</li>
                <li>✅ <strong>orders</strong> - Bestellungen</li>
                <li>✅ <strong>newsletter_subscribers</strong> - Newsletter</li>
                <li>✅ <strong>contact_inquiries</strong> - Kontaktanfragen</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Sample-Daten:</h4>
              <ul className="text-sm space-y-1">
                <li>🔗 3 Drahtschmuck-Kategorien</li>
                <li>💍 3 Beispiel-Produkte</li>
                <li>⚡ Performance-Indizes</li>
                <li>🔐 Row Level Security</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}