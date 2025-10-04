-- Schema Fix für Elbfunkeln E-Commerce
-- Diese SQL-Datei behebt die Beziehung zwischen products und categories

-- 1. Prüfe und erstelle categories Tabelle falls nötig
CREATE TABLE IF NOT EXISTS public.categories (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name varchar(255) NOT NULL,
    description text,
    slug varchar(255) UNIQUE NOT NULL,
    image_url text,
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Prüfe und erstelle products Tabelle falls nötig
CREATE TABLE IF NOT EXISTS public.products (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name varchar(255) NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
    is_active boolean DEFAULT true,
    stock_quantity integer DEFAULT 0,
    sku varchar(100) UNIQUE NOT NULL,
    weight numeric(8,2),
    dimensions varchar(255),
    materials text,
    care_instructions text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Prüfe und erstelle product_images Tabelle falls nötig
CREATE TABLE IF NOT EXISTS public.product_images (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
    image_url text NOT NULL,
    alt_text varchar(255),
    is_primary boolean DEFAULT false,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Füge Indizes hinzu für bessere Performance
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_is_primary ON public.product_images(is_primary);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON public.categories(is_active);

-- 5. Füge Trigger für updated_at hinzu
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger für categories
DROP TRIGGER IF EXISTS categories_updated_at ON public.categories;
CREATE TRIGGER categories_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Trigger für products
DROP TRIGGER IF EXISTS products_updated_at ON public.products;
CREATE TRIGGER products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 6. Füge Beispiel-Daten hinzu falls die Tabellen leer sind
INSERT INTO public.categories (id, name, description, slug, is_active, sort_order) 
VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', 'Ohrringe', 'Elegante handgefertigte Ohrringe aus Draht', 'ohrringe', true, 1),
    ('550e8400-e29b-41d4-a716-446655440002', 'Ringe', 'Filigrane Draht-Ringe für jeden Anlass', 'ringe', true, 2),
    ('550e8400-e29b-41d4-a716-446655440003', 'Armbänder', 'Zarte Draht-Armbänder mit besonderen Details', 'armbaender', true, 3),
    ('550e8400-e29b-41d4-a716-446655440004', 'Halsketten', 'Kunstvolle Halsketten aus feinem Draht', 'halsketten', true, 4),
    ('550e8400-e29b-41d4-a716-446655440005', 'Broschen', 'Einzigartige Draht-Broschen als Accessoires', 'broschen', true, 5)
ON CONFLICT (id) DO NOTHING;

-- Beispiel-Produkte
INSERT INTO public.products (id, name, description, price, category_id, sku, stock_quantity, materials, dimensions) 
VALUES 
    ('650e8400-e29b-41d4-a716-446655440001', 'Elegante Draht-Ohrringe "Morgentau"', 'Handgefertigte Ohrringe aus feinem Silberdraht mit Glasperlen', 45.99, '550e8400-e29b-41d4-a716-446655440001', 'ELB-OH-001', 15, 'Silberdraht, Glasperlen', '3cm x 1.5cm'),
    ('650e8400-e29b-41d4-a716-446655440002', 'Zarter Draht-Ring "Blütentanz"', 'Filigraner Ring aus vergoldetem Kupferdraht', 32.50, '550e8400-e29b-41d4-a716-446655440002', 'ELB-RI-001', 8, 'Vergoldeter Kupferdraht', 'Größe 54-58 verstellbar'),
    ('650e8400-e29b-41d4-a716-446655440003', 'Armband "Vintage Dreams"', 'Nostalgisches Armband mit Drahtgeflecht und Vintage-Perlen', 58.00, '550e8400-e29b-41d4-a716-446655440003', 'ELB-AR-001', 12, 'Kupferdraht, Vintage-Perlen', '18-22cm verstellbar'),
    ('650e8400-e29b-41d4-a716-446655440004', 'Halskette "Sternenhimmel"', 'Zarte Halskette mit Draht-Sternen', 67.90, '550e8400-e29b-41d4-a716-446655440004', 'ELB-HA-001', 6, 'Silberdraht, Kristalle', '45cm + 5cm Verlängerung'),
    ('650e8400-e29b-41d4-a716-446655440005', 'Brosche "Naturwunder"', 'Organische Brosche inspiriert von der Natur', 42.00, '550e8400-e29b-41d4-a716-446655440005', 'ELB-BR-001', 10, 'Bronzedraht, Natursteine', '5cm x 4cm')
ON CONFLICT (id) DO NOTHING;

-- Beispiel-Bilder
INSERT INTO public.product_images (product_id, image_url, alt_text, is_primary, sort_order) 
VALUES 
    ('650e8400-e29b-41d4-a716-446655440001', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&q=80', 'Elegante Draht-Ohrringe Morgentau', true, 1),
    ('650e8400-e29b-41d4-a716-446655440002', 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&q=80', 'Zarter Draht-Ring Blütentanz', true, 1),
    ('650e8400-e29b-41d4-a716-446655440003', 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&q=80', 'Armband Vintage Dreams', true, 1),
    ('650e8400-e29b-41d4-a716-446655440004', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&q=80', 'Halskette Sternenhimmel', true, 1),
    ('650e8400-e29b-41d4-a716-446655440005', 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=400&q=80', 'Brosche Naturwunder', true, 1)
ON CONFLICT DO NOTHING;

-- 7. RLS (Row Level Security) Policies - Öffentlicher Lesezugriff
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- Policies für categories
DROP POLICY IF EXISTS "Allow public read access to active categories" ON public.categories;
CREATE POLICY "Allow public read access to active categories" 
ON public.categories FOR SELECT 
USING (is_active = true);

-- Policies für products
DROP POLICY IF EXISTS "Allow public read access to active products" ON public.products;
CREATE POLICY "Allow public read access to active products" 
ON public.products FOR SELECT 
USING (is_active = true);

-- Policies für product_images
DROP POLICY IF EXISTS "Allow public read access to product images" ON public.product_images;
CREATE POLICY "Allow public read access to product images" 
ON public.product_images FOR SELECT 
USING (true);

-- Admin-Vollzugriff (für authentifizierte Service-Role)
DROP POLICY IF EXISTS "Allow admin full access to categories" ON public.categories;
CREATE POLICY "Allow admin full access to categories" 
ON public.categories FOR ALL 
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow admin full access to products" ON public.products;
CREATE POLICY "Allow admin full access to products" 
ON public.products FOR ALL 
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow admin full access to product images" ON public.product_images;
CREATE POLICY "Allow admin full access to product images" 
ON public.product_images FOR ALL 
USING (true)
WITH CHECK (true);

-- Kommentar zur Bestätigung des Schema-Fixes
COMMENT ON TABLE public.categories IS 'Kategorien für Elbfunkeln Produkte - Schema Fix angewandt';
COMMENT ON TABLE public.products IS 'Produkte für Elbfunkeln Shop - Foreign Key zu categories korrekt';
COMMENT ON TABLE public.product_images IS 'Produktbilder - Foreign Key zu products korrekt';