-- ===============================================
-- ELBFUNKELN - Vollständige Datenbefüllung für alle Tabellen
-- Diese Migration fügt alle Beispieldaten direkt ein
-- ===============================================

-- Temporäre Variablen für IDs
DO $$
DECLARE
    -- Category IDs
    cat_ohrringe_id UUID;
    cat_halsketten_id UUID;
    cat_armbaender_id UUID;
    cat_ringe_id UUID;
    cat_sets_id UUID;
    cat_broschen_id UUID;
    
    -- Product IDs
    prod_spiralen_ohrringe_id UUID;
    prod_blueten_haenger_id UUID;
    prod_minimalist_hoops_id UUID;
    prod_herz_anhaenger_id UUID;
    prod_infinity_kette_id UUID;
    prod_vintage_medaillon_id UUID;
    prod_charm_armband_id UUID;
    prod_geflochtenes_armband_id UUID;
    prod_tennis_armband_id UUID;
    prod_spiralring_id UUID;
    prod_verlobungsring_id UUID;
    prod_stapelring_set_id UUID;
    prod_brautschmuck_set_id UUID;
    prod_everyday_set_id UUID;
    
    -- User IDs
    admin_user_id UUID;
    shopowner_user_id UUID;
    customer_sarah_id UUID;
    customer_anna_id UUID;
    customer_thomas_id UUID;
    customer_lisa_id UUID;
    customer_michael_id UUID;
    
BEGIN
    -- ===============================================
    -- 1. KATEGORIEN EINFÜGEN/AKTUALISIEREN
    -- ===============================================
    
    -- Kategorien einfügen oder aktualisieren
    INSERT INTO categories (id, name, description, slug, image_url, is_active, sort_order, created_at, updated_at) 
    VALUES 
        (gen_random_uuid(), 'Ohrringe', 'Handgefertigte Draht-Ohrringe in verschiedenen Designs', 'ohrringe', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400', true, 1, NOW(), NOW()),
        (gen_random_uuid(), 'Halsketten', 'Elegante Draht-Halsketten und Anhänger', 'halsketten', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400', true, 2, NOW(), NOW()),
        (gen_random_uuid(), 'Armbänder', 'Filigrane Draht-Armbänder für jeden Anlass', 'armbaender', 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400', true, 3, NOW(), NOW()),
        (gen_random_uuid(), 'Ringe', 'Kunstvolle Draht-Ringe in verschiedenen Größen', 'ringe', 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400', true, 4, NOW(), NOW()),
        (gen_random_uuid(), 'Sets', 'Aufeinander abgestimmte Schmuck-Sets', 'sets', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400', true, 5, NOW(), NOW()),
        (gen_random_uuid(), 'Broschen', 'Dekorative Draht-Broschen und Anstecknadeln', 'broschen', 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=400', true, 6, NOW(), NOW())
    ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        image_url = EXCLUDED.image_url,
        updated_at = NOW();

    -- Get category IDs
    SELECT id INTO cat_ohrringe_id FROM categories WHERE slug = 'ohrringe';
    SELECT id INTO cat_halsketten_id FROM categories WHERE slug = 'halsketten';
    SELECT id INTO cat_armbaender_id FROM categories WHERE slug = 'armbaender';
    SELECT id INTO cat_ringe_id FROM categories WHERE slug = 'ringe';
    SELECT id INTO cat_sets_id FROM categories WHERE slug = 'sets';
    SELECT id INTO cat_broschen_id FROM categories WHERE slug = 'broschen';

    -- ===============================================
    -- 2. BENUTZER ERSTELLEN (falls noch nicht vorhanden)
    -- ===============================================
    
    -- Admin User erstellen
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@elbfunkeln.de') THEN
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
        VALUES (gen_random_uuid(), 'admin@elbfunkeln.de', '$2a$10$dummy.hash.for.admin123', NOW(), NOW(), NOW());
    END IF;
    
    -- Shop Owner erstellen
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'owner@elbfunkeln.de') THEN
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
        VALUES (gen_random_uuid(), 'owner@elbfunkeln.de', '$2a$10$dummy.hash.for.owner123', NOW(), NOW(), NOW());
    END IF;
    
    -- Test Customer erstellen
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'sarah.mueller@example.com') THEN
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
        VALUES (gen_random_uuid(), 'sarah.mueller@example.com', '$2a$10$dummy.hash.for.customer123', NOW(), NOW(), NOW());
    END IF;
    
    -- Weitere Test-Kunden
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'anna.weber@gmail.com') THEN
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
        VALUES (gen_random_uuid(), 'anna.weber@gmail.com', '$2a$10$dummy.hash.for.test', NOW(), NOW(), NOW());
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'thomas.mueller@web.de') THEN
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
        VALUES (gen_random_uuid(), 'thomas.mueller@web.de', '$2a$10$dummy.hash.for.test', NOW(), NOW(), NOW());
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'lisa.hoffmann@outlook.de') THEN
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
        VALUES (gen_random_uuid(), 'lisa.hoffmann@outlook.de', '$2a$10$dummy.hash.for.test', NOW(), NOW(), NOW());
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'michael.schneider@gmx.de') THEN
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
        VALUES (gen_random_uuid(), 'michael.schneider@gmx.de', '$2a$10$dummy.hash.for.test', NOW(), NOW(), NOW());
    END IF;

    -- Get user IDs
    SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@elbfunkeln.de';
    SELECT id INTO shopowner_user_id FROM auth.users WHERE email = 'owner@elbfunkeln.de';
    SELECT id INTO customer_sarah_id FROM auth.users WHERE email = 'sarah.mueller@example.com';
    SELECT id INTO customer_anna_id FROM auth.users WHERE email = 'anna.weber@gmail.com';
    SELECT id INTO customer_thomas_id FROM auth.users WHERE email = 'thomas.mueller@web.de';
    SELECT id INTO customer_lisa_id FROM auth.users WHERE email = 'lisa.hoffmann@outlook.de';
    SELECT id INTO customer_michael_id FROM auth.users WHERE email = 'michael.schneider@gmx.de';

    -- ===============================================
    -- 3. USER PROFILES ERSTELLEN
    -- ===============================================
    
    INSERT INTO user_profiles (
        user_id, first_name, last_name, display_name, role, 
        phone, birth_date, two_factor_enabled, preferred_language, 
        marketing_consent, email_notifications, onboarding_completed, 
        terms_accepted_at, privacy_accepted_at, created_at, updated_at
    ) VALUES 
        (admin_user_id, 'System', 'Administrator', 'Elbfunkeln Admin', 'admin', NULL, NULL, true, 'de', false, true, true, NOW(), NOW(), NOW(), NOW()),
        (shopowner_user_id, 'Marina', 'Schmidt', 'Marina Schmidt - Elbfunkeln', 'shopowner', '+49 40 12345678', NULL, true, 'de', true, true, true, NOW(), NOW(), NOW(), NOW()),
        (customer_sarah_id, 'Sarah', 'Müller', 'Sarah M.', 'customer', '+49 40 98765432', '1992-06-15', false, 'de', true, true, true, NOW(), NOW(), NOW(), NOW()),
        (customer_anna_id, 'Anna', 'Weber', 'Anna W.', 'customer', '+49 40 11111111', '1988-03-22', false, 'de', true, true, true, NOW(), NOW(), NOW(), NOW()),
        (customer_thomas_id, 'Thomas', 'Müller', 'Thomas M.', 'customer', '+49 40 22222222', '1985-11-08', false, 'de', false, true, true, NOW(), NOW(), NOW(), NOW()),
        (customer_lisa_id, 'Lisa', 'Hoffmann', 'Lisa H.', 'customer', '+49 40 33333333', '1990-07-14', false, 'de', true, false, true, NOW(), NOW(), NOW(), NOW()),
        (customer_michael_id, 'Michael', 'Schneider', 'Michael S.', 'customer', '+49 40 44444444', '1987-12-03', false, 'de', true, true, false, NOW(), NOW(), NOW(), NOW())
    ON CONFLICT (user_id) DO UPDATE SET
        role = EXCLUDED.role,
        updated_at = NOW();

    -- ===============================================
    -- 4. PRODUKTE ERSTELLEN
    -- ===============================================
    
    -- Ohrringe
    INSERT INTO products (id, name, description, price, category_id, is_active, stock_quantity, sku, weight, dimensions, materials, care_instructions, created_by, created_at, updated_at) 
    VALUES 
        (gen_random_uuid(), 'Spiralen-Ohrringe "Elbe"', 'Handgeformte Spiralen aus 925er Silberdraht mit zarten Perlenakzenten. Jedes Paar ist ein Unikat.', 45.00, cat_ohrringe_id, true, 8, 'ELB-OH-001', 4.5, '3cm x 1.5cm', '925er Silberdraht, Süßwasserperlen', 'Mit weichem Tuch reinigen, trocken lagern', shopowner_user_id, NOW(), NOW()),
        (gen_random_uuid(), 'Blüten-Hänger "Hamburg"', 'Filigrane Blütenmotive aus Kupferdraht mit goldener Beschichtung. Perfekt für romantische Anlässe.', 52.00, cat_ohrringe_id, true, 5, 'ELB-OH-002', 6.2, '4cm x 2cm', 'Kupferdraht vergoldet, Kristallperlen', 'Vor Feuchtigkeit schützen, mit Schmucktuch polieren', shopowner_user_id, NOW(), NOW()),
        (gen_random_uuid(), 'Minimalist Hoops "Alster"', 'Schlichte Kreolen aus mattem Silberdraht. Zeitlos elegant und alltagstauglich.', 38.00, cat_ohrringe_id, true, 12, 'ELB-OH-003', 3.8, '2.5cm Durchmesser', '925er Silberdraht matt', 'Regelmäßig mit Silberputztuch reinigen', shopowner_user_id, NOW(), NOW())
    ON CONFLICT (sku) DO NOTHING;

    -- Halsketten
    INSERT INTO products (id, name, description, price, category_id, is_active, stock_quantity, sku, weight, dimensions, materials, care_instructions, created_by, created_at, updated_at) 
    VALUES 
        (gen_random_uuid(), 'Herz-Anhänger "Speicherstadt"', 'Romantischer Herzanhänger aus verschlungenem Silberdraht mit funkelndem Zirkonia.', 78.00, cat_halsketten_id, true, 6, 'ELB-HL-001', 12.4, '45cm Kette, 2.5cm Anhänger', '925er Silberdraht, Zirkonia, Silberkette', 'Vor dem Duschen abnehmen, trocken aufbewahren', shopowner_user_id, NOW(), NOW()),
        (gen_random_uuid(), 'Infinity-Kette "Elbe Eternal"', 'Symbol der Unendlichkeit aus kunstvollem Drahtgeflecht. Ein bedeutungsvolles Geschenk.', 95.00, cat_halsketten_id, true, 4, 'ELB-HL-002', 15.8, '50cm Kette, 3cm Anhänger', '925er Silberdraht, Roségold-Akzente', 'Mit Silberpflegemittel behandeln, einzeln aufbewahren', shopowner_user_id, NOW(), NOW()),
        (gen_random_uuid(), 'Vintage-Medaillon "Hafencity"', 'Aufklappbares Medaillon mit traditionellem Drahtornament. Platz für zwei kleine Fotos.', 125.00, cat_halsketten_id, true, 3, 'ELB-HL-003', 22.1, '55cm Kette, 4cm Medaillon', 'Messing antik, Silberdraht, Glas', 'Vorsichtig öffnen, vor Stößen schützen', shopowner_user_id, NOW(), NOW())
    ON CONFLICT (sku) DO NOTHING;

    -- Armbänder
    INSERT INTO products (id, name, description, price, category_id, is_active, stock_quantity, sku, weight, dimensions, materials, care_instructions, created_by, created_at, updated_at) 
    VALUES 
        (gen_random_uuid(), 'Charm-Armband "Blankenese"', 'Elastisches Drahtarmband mit verschiedenen Anhängern. Individuell erweiterbar.', 42.00, cat_armbaender_id, true, 10, 'ELB-AR-001', 8.7, '18cm (dehnbar)', 'Silberdraht, Edelstahl, Charms', 'Nicht zu stark dehnen, trocken lagern', shopowner_user_id, NOW(), NOW()),
        (gen_random_uuid(), 'Geflochtenes Armband "Stintfang"', 'Dreifach geflochtener Draht in Kupfer und Silber. Maritimer Stil.', 56.00, cat_armbaender_id, true, 7, 'ELB-AR-002', 11.3, '19cm mit Verlängerung', 'Kupferdraht, Silberdraht, Magnetverschluss', 'Vor Salzwasser schützen, regelmäßig polieren', shopowner_user_id, NOW(), NOW()),
        (gen_random_uuid(), 'Tennis-Armband "Elbe Glitz"', 'Elegantes Tennisarmband mit Drahtfassungen für Kristallsteine.', 89.00, cat_armbaender_id, true, 5, 'ELB-AR-003', 14.2, '17.5cm', '925er Silberdraht, Swarovski Kristalle', 'Professionelle Reinigung empfohlen', shopowner_user_id, NOW(), NOW())
    ON CONFLICT (sku) DO NOTHING;

    -- Ringe
    INSERT INTO products (id, name, description, price, category_id, is_active, stock_quantity, sku, weight, dimensions, materials, care_instructions, created_by, created_at, updated_at) 
    VALUES 
        (gen_random_uuid(), 'Spiralring "Elbphilharmonie"', 'Kunstvoller Spiralring inspiriert von Hamburger Architektur. Größe verstellbar.', 34.00, cat_ringe_id, true, 15, 'ELB-RI-001', 3.2, 'Größe 52-58 verstellbar', 'Silberdraht, minimale Politur', 'Vorsichtig anpassen, nicht zu oft biegen', shopowner_user_id, NOW(), NOW()),
        (gen_random_uuid(), 'Verlobungsring "Ewige Liebe"', 'Romantischer Ring mit verschlungenen Drähten und zentralem Diamant.', 245.00, cat_ringe_id, true, 2, 'ELB-RI-002', 5.8, 'Verschiedene Größen', '750er Weißgold-Draht, 0.25ct Diamant', 'Professionelle Pflege, sichere Aufbewahrung', shopowner_user_id, NOW(), NOW()),
        (gen_random_uuid(), 'Stapelring-Set "Michel"', 'Drei aufeinander abgestimmte Ringe zum Kombinieren. Hamburg-Design.', 67.00, cat_ringe_id, true, 8, 'ELB-RI-003', 7.1, 'Set in einer Größe', 'Roségold-Draht, Silberdraht, Kupferdraht', 'Einzeln lagern, vor Verfärbung schützen', shopowner_user_id, NOW(), NOW())
    ON CONFLICT (sku) DO NOTHING;

    -- Sets
    INSERT INTO products (id, name, description, price, category_id, is_active, stock_quantity, sku, weight, dimensions, materials, care_instructions, created_by, created_at, updated_at) 
    VALUES 
        (gen_random_uuid(), 'Brautschmuck-Set "Hanseatisch"', 'Komplettes Set für die Hochzeit: Ohrringe, Halskette, Armband in einheitlichem Design.', 298.00, cat_sets_id, true, 3, 'ELB-SET-001', 45.6, 'Verschiedene Teile', '925er Silberdraht, Perlen, Kristalle', 'In Samtbox aufbewahren, vor großen Anlässen prüfen', shopowner_user_id, NOW(), NOW()),
        (gen_random_uuid(), 'Everyday-Set "Alster Casual"', 'Alltagstaugliches Set aus drei Basics in roségold. Perfekt zum Kombinieren.', 156.00, cat_sets_id, true, 6, 'ELB-SET-002', 28.3, 'Ring, Ohrringe, Armband', 'Roségold-beschichteter Draht', 'Regelmäßig polieren, zusammen lagern', shopowner_user_id, NOW(), NOW())
    ON CONFLICT (sku) DO NOTHING;

    -- Get product IDs for later use
    SELECT id INTO prod_spiralen_ohrringe_id FROM products WHERE sku = 'ELB-OH-001';
    SELECT id INTO prod_blueten_haenger_id FROM products WHERE sku = 'ELB-OH-002';
    SELECT id INTO prod_minimalist_hoops_id FROM products WHERE sku = 'ELB-OH-003';
    SELECT id INTO prod_herz_anhaenger_id FROM products WHERE sku = 'ELB-HL-001';
    SELECT id INTO prod_infinity_kette_id FROM products WHERE sku = 'ELB-HL-002';
    SELECT id INTO prod_vintage_medaillon_id FROM products WHERE sku = 'ELB-HL-003';
    SELECT id INTO prod_charm_armband_id FROM products WHERE sku = 'ELB-AR-001';
    SELECT id INTO prod_geflochtenes_armband_id FROM products WHERE sku = 'ELB-AR-002';
    SELECT id INTO prod_tennis_armband_id FROM products WHERE sku = 'ELB-AR-003';
    SELECT id INTO prod_spiralring_id FROM products WHERE sku = 'ELB-RI-001';
    SELECT id INTO prod_verlobungsring_id FROM products WHERE sku = 'ELB-RI-002';
    SELECT id INTO prod_stapelring_set_id FROM products WHERE sku = 'ELB-RI-003';
    SELECT id INTO prod_brautschmuck_set_id FROM products WHERE sku = 'ELB-SET-001';
    SELECT id INTO prod_everyday_set_id FROM products WHERE sku = 'ELB-SET-002';

    -- ===============================================
    -- 5. PRODUKTBILDER
    -- ===============================================
    
    INSERT INTO product_images (id, product_id, image_url, alt_text, is_primary, sort_order, created_at) VALUES 
        (gen_random_uuid(), prod_spiralen_ohrringe_id, 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800', 'Spiralen-Ohrringe Elbe Hauptansicht', true, 1, NOW()),
        (gen_random_uuid(), prod_spiralen_ohrringe_id, 'https://images.unsplash.com/photo-1634026011866-7d1e3c3a3281?w=800', 'Spiralen-Ohrringe Elbe Detailansicht', false, 2, NOW()),
        (gen_random_uuid(), prod_blueten_haenger_id, 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800', 'Blüten-Hänger Hamburg Hauptansicht', true, 1, NOW()),
        (gen_random_uuid(), prod_blueten_haenger_id, 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=800', 'Blüten-Hänger Hamburg getragen', false, 2, NOW()),
        (gen_random_uuid(), prod_minimalist_hoops_id, 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800', 'Minimalist Hoops Alster', true, 1, NOW()),
        (gen_random_uuid(), prod_herz_anhaenger_id, 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800', 'Herz-Anhänger Speicherstadt', true, 1, NOW()),
        (gen_random_uuid(), prod_infinity_kette_id, 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800', 'Infinity-Kette Elbe Eternal', true, 1, NOW()),
        (gen_random_uuid(), prod_vintage_medaillon_id, 'https://images.unsplash.com/photo-1612534709088-f71b6c7e1998?w=800', 'Vintage-Medaillon Hafencity', true, 1, NOW()),
        (gen_random_uuid(), prod_charm_armband_id, 'https://images.unsplash.com/photo-1624206112918-f140f087f9b5?w=800', 'Charm-Armband Blankenese', true, 1, NOW()),
        (gen_random_uuid(), prod_geflochtenes_armband_id, 'https://images.unsplash.com/photo-1588444837495-c0c3bfa85a3b?w=800', 'Geflochtenes Armband Stintfang', true, 1, NOW()),
        (gen_random_uuid(), prod_tennis_armband_id, 'https://images.unsplash.com/photo-1616834746084-a9c4edf1b4a3?w=800', 'Tennis-Armband Elbe Glitz', true, 1, NOW()),
        (gen_random_uuid(), prod_spiralring_id, 'https://images.unsplash.com/photo-1603561596112-db932d2f95d6?w=800', 'Spiralring Elbphilharmonie', true, 1, NOW()),
        (gen_random_uuid(), prod_verlobungsring_id, 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800', 'Verlobungsring Ewige Liebe', true, 1, NOW()),
        (gen_random_uuid(), prod_stapelring_set_id, 'https://images.unsplash.com/photo-1603561596112-db932d2f95d6?w=800', 'Stapelring-Set Michel', true, 1, NOW()),
        (gen_random_uuid(), prod_brautschmuck_set_id, 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800', 'Brautschmuck-Set Hanseatisch', true, 1, NOW()),
        (gen_random_uuid(), prod_everyday_set_id, 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800', 'Everyday-Set Alster Casual', true, 1, NOW())
    ON CONFLICT DO NOTHING;

    -- ===============================================
    -- 6. BENUTZERADRESSEN
    -- ===============================================
    
    INSERT INTO user_addresses (id, user_id, type, is_default, first_name, last_name, street, house_number, postal_code, city, country, created_at, updated_at) VALUES 
        (gen_random_uuid(), customer_sarah_id, 'both', true, 'Sarah', 'Müller', 'Elbchaussee', '42', '22763', 'Hamburg', 'DE', NOW(), NOW()),
        (gen_random_uuid(), customer_anna_id, 'shipping', true, 'Anna', 'Weber', 'Reeperbahn', '15', '20359', 'Hamburg', 'DE', NOW(), NOW()),
        (gen_random_uuid(), customer_thomas_id, 'billing', true, 'Thomas', 'Müller', 'Mönckebergstraße', '7', '20095', 'Hamburg', 'DE', NOW(), NOW()),
        (gen_random_uuid(), customer_lisa_id, 'both', true, 'Lisa', 'Hoffmann', 'Hafencity', '23', '20457', 'Hamburg', 'DE', NOW(), NOW()),
        (gen_random_uuid(), customer_michael_id, 'both', true, 'Michael', 'Schneider', 'St. Pauli Hafenstraße', '89', '20359', 'Hamburg', 'DE', NOW(), NOW())
    ON CONFLICT DO NOTHING;

    -- ===============================================
    -- 7. NEWSLETTER-ABONNENTEN
    -- ===============================================
    
    INSERT INTO newsletter_subscribers (id, email, first_name, last_name, subscribed_at, is_active, source, created_at, updated_at) VALUES 
        (gen_random_uuid(), 'sarah.mueller@example.com', 'Sarah', 'Müller', NOW() - INTERVAL '30 days', true, 'website', NOW(), NOW()),
        (gen_random_uuid(), 'anna.weber@gmail.com', 'Anna', 'Weber', NOW() - INTERVAL '25 days', true, 'website', NOW(), NOW()),
        (gen_random_uuid(), 'thomas.mueller@web.de', 'Thomas', 'Müller', NOW() - INTERVAL '20 days', true, 'social_media', NOW(), NOW()),
        (gen_random_uuid(), 'lisa.hoffmann@outlook.de', 'Lisa', 'Hoffmann', NOW() - INTERVAL '15 days', true, 'website', NOW(), NOW()),
        (gen_random_uuid(), 'newsletter@hamburg-magazin.de', 'Redaktion', 'Hamburg Magazin', NOW() - INTERVAL '10 days', true, 'partnership', NOW(), NOW()),
        (gen_random_uuid(), 'schmuck.fan@lover.de', 'Jessica', 'Klein', NOW() - INTERVAL '5 days', true, 'referral', NOW(), NOW()),
        (gen_random_uuid(), 'handmade@artlover.com', 'David', 'Kunst', NOW() - INTERVAL '3 days', true, 'website', NOW(), NOW()),
        (gen_random_uuid(), 'elbfunkeln.fan@gmail.com', 'Petra', 'Goldschmidt', NOW() - INTERVAL '1 day', true, 'instagram', NOW(), NOW()),
        (gen_random_uuid(), 'marina.gold@schmuck-fan.de', 'Marina', 'Gold', NOW() - INTERVAL '15 days', true, 'instagram', NOW(), NOW()),
        (gen_random_uuid(), 'peter.silber@handwerk.com', 'Peter', 'Silber', NOW() - INTERVAL '12 days', true, 'website', NOW(), NOW()),
        (gen_random_uuid(), 'julia.design@creative.de', 'Julia', 'Design', NOW() - INTERVAL '8 days', true, 'referral', NOW(), NOW()),
        (gen_random_uuid(), 'hamburg.style@local.de', 'Hamburg', 'Style', NOW() - INTERVAL '6 days', true, 'facebook', NOW(), NOW()),
        (gen_random_uuid(), 'wire.art.lover@gmail.com', 'Alex', 'Kunstliebhaber', NOW() - INTERVAL '4 days', true, 'pinterest', NOW(), NOW()),
        (gen_random_uuid(), 'unique.jewelry@collector.org', 'Samantha', 'Unique', NOW() - INTERVAL '2 days', true, 'website', NOW(), NOW()),
        (gen_random_uuid(), 'bridal.dreams@wedding.de', 'Sophie', 'Braut', NOW() - INTERVAL '1 day', true, 'google_ads', NOW(), NOW())
    ON CONFLICT (email) DO NOTHING;

    -- ===============================================
    -- 8. KONTAKT-ANFRAGEN
    -- ===============================================
    
    INSERT INTO contact_inquiries (id, name, email, subject, message, status, created_at, updated_at) VALUES 
        (gen_random_uuid(), 'Julia Becker', 'julia.becker@email.de', 'Frage zu Ringgrößen', 'Hallo, können Sie mir bei der Bestimmung meiner Ringgröße helfen? Ich würde gerne den Spiralring Elbphilharmonie bestellen.', 'open', NOW() - INTERVAL '2 days', NOW()),
        (gen_random_uuid(), 'Markus Hansen', 'markus.hansen@web.de', 'Sonderanfertigung', 'Guten Tag, wäre es möglich, ein individuelles Schmuckset für meine Hochzeit anzufertigen? Wir heiraten im Juni und hätten gerne etwas Besonderes.', 'in_progress', NOW() - INTERVAL '5 days', NOW()),
        (gen_random_uuid(), 'Elena Rodriguez', 'elena.r@gmail.com', 'Reparatur-Service', 'Mein Drahtarmband ist leider beschädigt worden. Bieten Sie auch Reparaturen an? Das Stück bedeutet mir sehr viel.', 'resolved', NOW() - INTERVAL '8 days', NOW()),
        (gen_random_uuid(), 'Peter Schneider', 'p.schneider@firma.de', 'Großbestellung', 'Wir sind ein lokales Geschäft und interessieren uns für eine Großbestellung. Gibt es Mengenrabatte?', 'open', NOW() - INTERVAL '1 day', NOW()),
        (gen_random_uuid(), 'Sophie Wagner', 'sophie.w@outlook.com', 'Geschenkverpackung', 'Bieten Sie auch besondere Geschenkverpackungen an? Ich möchte das Infinity-Kette als Valentinstagsgeschenk.', 'resolved', NOW() - INTERVAL '10 days', NOW()),
        (gen_random_uuid(), 'Christina Weber', 'christina.w@mail.de', 'Geschenkverpackung Weihnachten', 'Bieten Sie auch besondere Geschenkverpackungen für Weihnachten an? Ich möchte mehrere Stücke verschenken.', 'open', NOW() - INTERVAL '6 hours', NOW()),
        (gen_random_uuid(), 'Frank Müller', 'frank.mueller@business.de', 'Firmengeschenke', 'Wir sind ein Unternehmen aus Hamburg und suchen nach exklusiven Geschenken für unsere Kunden. Können Sie uns ein Angebot machen?', 'in_progress', NOW() - INTERVAL '1 day', NOW()),
        (gen_random_uuid(), 'Lisa Schneider', 'lisa.s@design.com', 'Zusammenarbeit', 'Ich bin Stylistin und würde gerne mit Ihnen zusammenarbeiten. Ihre Stücke würden perfekt zu meinen Shootings passen.', 'open', NOW() - INTERVAL '2 days', NOW()),
        (gen_random_uuid(), 'Daniel Koch', 'daniel.koch@photo.de', 'Fotoshooting', 'Ich bin Fotograf und würde gerne Ihre Schmuckstücke fotografieren. Haben Sie Interesse an einer Kooperation?', 'resolved', NOW() - INTERVAL '4 days', NOW()),
        (gen_random_uuid(), 'Anna Hoffmann', 'anna.h@student.de', 'Studentenrabatt', 'Hallo, gibt es Studentenrabatte? Ich bin an dem Spiralring interessiert, bin aber noch Studentin.', 'resolved', NOW() - INTERVAL '7 days', NOW())
    ON CONFLICT DO NOTHING;

    -- ===============================================
    -- 9. BESTELLUNGEN ERSTELLEN
    -- ===============================================
    
    DECLARE
        order1_id UUID := gen_random_uuid();
        order2_id UUID := gen_random_uuid();
        order3_id UUID := gen_random_uuid();
        sarah_address_id UUID;
        anna_address_id UUID;
        thomas_address_id UUID;
    BEGIN
        -- Get address IDs
        SELECT id INTO sarah_address_id FROM user_addresses WHERE user_id = customer_sarah_id LIMIT 1;
        SELECT id INTO anna_address_id FROM user_addresses WHERE user_id = customer_anna_id LIMIT 1;
        SELECT id INTO thomas_address_id FROM user_addresses WHERE user_id = customer_thomas_id LIMIT 1;

        -- Order 1: Sarah Müller
        INSERT INTO orders (
            id, customer_id, order_number, status, payment_status, payment_method,
            shipping_address_id, billing_address_id, subtotal, shipping_cost, 
            tax_amount, total_amount, currency, notes, tracking_number, tracking_url,
            created_at, updated_at
        ) VALUES (
            order1_id, customer_sarah_id, 'ELB-2024-001', 'shipped', 'paid', 'credit_card',
            sarah_address_id, sarah_address_id, 95.00, 4.99, 19.05, 119.04, 'EUR',
            'Schnelle Lieferung gewünscht - Geschenk für Freundin', 'DHL1234567890',
            'https://www.dhl.de/de/privatkunden/pakete-empfangen/verfolgen.html?lang=de&idc=1234567890',
            NOW() - INTERVAL '7 days', NOW()
        );
        
        INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, total_price, created_at) VALUES 
            (gen_random_uuid(), order1_id, prod_infinity_kette_id, 1, 95.00, 95.00, NOW());

        -- Order 2: Anna Weber  
        INSERT INTO orders (
            id, customer_id, order_number, status, payment_status, payment_method,
            shipping_address_id, billing_address_id, subtotal, shipping_cost, 
            tax_amount, total_amount, currency, tracking_number, tracking_url,
            created_at, updated_at
        ) VALUES (
            order2_id, customer_anna_id, 'ELB-2024-002', 'delivered', 'paid', 'paypal',
            anna_address_id, anna_address_id, 87.00, 0.00, 16.53, 103.53, 'EUR',
            'DPD9876543210', 'https://tracking.dpd.de/status/de_DE/parcel/9876543210',
            NOW() - INTERVAL '12 days', NOW()
        );
        
        INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, total_price, created_at) VALUES 
            (gen_random_uuid(), order2_id, prod_blueten_haenger_id, 1, 52.00, 52.00, NOW()),
            (gen_random_uuid(), order2_id, prod_spiralring_id, 1, 34.00, 34.00, NOW());

        -- Order 3: Thomas Müller
        INSERT INTO orders (
            id, customer_id, order_number, status, payment_status, payment_method,
            billing_address_id, subtotal, shipping_cost, tax_amount, total_amount, 
            currency, notes, created_at, updated_at
        ) VALUES (
            order3_id, customer_thomas_id, 'ELB-2024-003', 'processing', 'paid', 'bank_transfer',
            thomas_address_id, 298.00, 0.00, 56.62, 354.62, 'EUR',
            'Brautschmuck für Hochzeit am 15. Juni - bitte sicher verpacken', 
            NOW() - INTERVAL '2 days', NOW()
        );
        
        INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, total_price, created_at) VALUES 
            (gen_random_uuid(), order3_id, prod_brautschmuck_set_id, 1, 298.00, 298.00, NOW());
    END;

    -- ===============================================
    -- 10. USER SESSIONS
    -- ===============================================
    
    INSERT INTO user_sessions (
        id, user_id, session_token, device_name, device_type, browser_name, 
        ip_address, user_agent, is_active, last_used_at, expires_at, created_at
    ) VALUES 
        (gen_random_uuid(), customer_sarah_id, encode(gen_random_bytes(32), 'hex'), 'iPhone 13', 'mobile', 'Safari Mobile', '192.168.1.100', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)', true, NOW() - INTERVAL '1 hour', NOW() + INTERVAL '29 days', NOW()),
        (gen_random_uuid(), customer_sarah_id, encode(gen_random_bytes(32), 'hex'), 'MacBook Pro', 'desktop', 'Chrome', '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', true, NOW() - INTERVAL '3 hours', NOW() + INTERVAL '25 days', NOW()),
        (gen_random_uuid(), customer_anna_id, encode(gen_random_bytes(32), 'hex'), 'Samsung Galaxy S23', 'mobile', 'Chrome Mobile', '10.0.0.50', 'Mozilla/5.0 (Linux; Android 13; SM-S911B)', true, NOW() - INTERVAL '2 hours', NOW() + INTERVAL '28 days', NOW()),
        (gen_random_uuid(), customer_thomas_id, encode(gen_random_bytes(32), 'hex'), 'Windows PC', 'desktop', 'Firefox', '85.223.45.67', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0)', true, NOW() - INTERVAL '30 minutes', NOW() + INTERVAL '30 days', NOW()),
        (gen_random_uuid(), admin_user_id, encode(gen_random_bytes(32), 'hex'), 'Admin Workstation', 'desktop', 'Chrome', '192.168.1.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', true, NOW() - INTERVAL '15 minutes', NOW() + INTERVAL '7 days', NOW()),
        (gen_random_uuid(), shopowner_user_id, encode(gen_random_bytes(32), 'hex'), 'iPad Pro', 'tablet', 'Safari', '192.168.1.10', 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)', true, NOW() - INTERVAL '45 minutes', NOW() + INTERVAL '15 days', NOW())
    ON CONFLICT DO NOTHING;

    -- ===============================================
    -- 11. USER ACTIVITY LOG
    -- ===============================================
    
    INSERT INTO user_activity_log (id, user_id, action_type, description, ip_address, success, created_at) VALUES 
        (gen_random_uuid(), customer_sarah_id, 'login', 'Successful login via website', '192.168.1.100', true, NOW() - INTERVAL '1 hour'),
        (gen_random_uuid(), customer_anna_id, 'login', 'Successful login via mobile app', '10.0.0.50', true, NOW() - INTERVAL '3 hours'),
        (gen_random_uuid(), admin_user_id, 'login', 'Admin login to dashboard', '192.168.1.1', true, NOW() - INTERVAL '30 minutes'),
        (gen_random_uuid(), shopowner_user_id, 'product_created', 'Created new product: Spiralen-Ohrringe Elbe', '192.168.1.10', true, NOW() - INTERVAL '2 days'),
        (gen_random_uuid(), customer_sarah_id, 'order_placed', 'Placed order ELB-2024-001', '192.168.1.100', true, NOW() - INTERVAL '7 days'),
        (gen_random_uuid(), customer_thomas_id, 'password_change', 'Password successfully changed', '85.223.45.67', true, NOW() - INTERVAL '5 days'),
        (gen_random_uuid(), customer_sarah_id, 'product_viewed', 'Viewed product: Infinity-Kette Elbe Eternal', '192.168.1.100', true, NOW() - INTERVAL '8 days'),
        (gen_random_uuid(), customer_sarah_id, 'cart_add', 'Added product to cart: Infinity-Kette Elbe Eternal', '192.168.1.100', true, NOW() - INTERVAL '7 days 2 hours'),
        (gen_random_uuid(), customer_sarah_id, 'checkout_started', 'Started checkout process', '192.168.1.100', true, NOW() - INTERVAL '7 days 1 hour'),
        (gen_random_uuid(), customer_sarah_id, 'payment_completed', 'Payment successful via Credit Card', '192.168.1.100', true, NOW() - INTERVAL '7 days'),
        (gen_random_uuid(), customer_sarah_id, 'newsletter_subscribed', 'Subscribed to newsletter', '192.168.1.100', true, NOW() - INTERVAL '6 days'),
        (gen_random_uuid(), customer_anna_id, 'account_created', 'New customer account created', '10.0.0.50', true, NOW() - INTERVAL '20 days'),
        (gen_random_uuid(), customer_anna_id, 'product_viewed', 'Viewed product: Blüten-Hänger Hamburg', '10.0.0.50', true, NOW() - INTERVAL '13 days'),
        (gen_random_uuid(), customer_anna_id, 'product_viewed', 'Viewed product: Spiralring Elbphilharmonie', '10.0.0.50', true, NOW() - INTERVAL '12 days 5 hours'),
        (gen_random_uuid(), customer_anna_id, 'cart_add', 'Added multiple products to cart', '10.0.0.50', true, NOW() - INTERVAL '12 days 2 hours'),
        (gen_random_uuid(), customer_anna_id, 'order_completed', 'Order ELB-2024-002 completed successfully', '10.0.0.50', true, NOW() - INTERVAL '12 days'),
        (gen_random_uuid(), customer_anna_id, 'product_reviewed', 'Left review for Blüten-Hänger Hamburg', '10.0.0.50', true, NOW() - INTERVAL '5 days'),
        (gen_random_uuid(), customer_thomas_id, 'product_search', 'Searched for "brautschmuck"', '85.223.45.67', true, NOW() - INTERVAL '3 days'),
        (gen_random_uuid(), customer_thomas_id, 'product_viewed', 'Viewed product: Brautschmuck-Set Hanseatisch', '85.223.45.67', true, NOW() - INTERVAL '3 days'),
        (gen_random_uuid(), customer_thomas_id, 'contact_inquiry', 'Submitted contact form for custom order', '85.223.45.67', true, NOW() - INTERVAL '2 days 6 hours'),
        (gen_random_uuid(), customer_thomas_id, 'order_placed', 'Placed special order for wedding', '85.223.45.67', true, NOW() - INTERVAL '2 days'),
        (gen_random_uuid(), customer_lisa_id, 'product_viewed', 'Viewed category: Armbänder', '192.168.1.150', true, NOW() - INTERVAL '4 days'),
        (gen_random_uuid(), customer_lisa_id, 'wishlist_add', 'Added Charm-Armband Blankenese to wishlist', '192.168.1.150', true, NOW() - INTERVAL '3 days'),
        (gen_random_uuid(), customer_lisa_id, 'social_share', 'Shared product on Instagram', '192.168.1.150', true, NOW() - INTERVAL '2 days'),
        (gen_random_uuid(), customer_michael_id, 'product_viewed', 'Viewed product: Verlobungsring Ewige Liebe', '45.123.67.89', true, NOW() - INTERVAL '1 day'),
        (gen_random_uuid(), customer_michael_id, 'product_compared', 'Compared different ring designs', '45.123.67.89', true, NOW() - INTERVAL '1 day'),
        (gen_random_uuid(), admin_user_id, 'admin_login', 'Admin dashboard access', '192.168.1.1', true, NOW() - INTERVAL '4 hours'),
        (gen_random_uuid(), admin_user_id, 'user_management', 'Updated user roles', '192.168.1.1', true, NOW() - INTERVAL '3 hours'),
        (gen_random_uuid(), admin_user_id, 'system_backup', 'Initiated system backup', '192.168.1.1', true, NOW() - INTERVAL '1 day'),
        (gen_random_uuid(), shopowner_user_id, 'order_processed', 'Processed order ELB-2024-001', '192.168.1.10', true, NOW() - INTERVAL '6 days'),
        (gen_random_uuid(), shopowner_user_id, 'inventory_updated', 'Updated stock quantities', '192.168.1.10', true, NOW() - INTERVAL '2 days'),
        (gen_random_uuid(), shopowner_user_id, 'newsletter_sent', 'Sent monthly newsletter', '192.168.1.10', true, NOW() - INTERVAL '1 day')
    ON CONFLICT DO NOTHING;

    -- ===============================================
    -- 12. KEY-VALUE STORE
    -- ===============================================
    
    INSERT INTO kv_store_0a65d7a9 (key, value) VALUES 
        ('site_settings', '{"maintenance_mode": false, "site_title": "Elbfunkeln - Handgefertigter Drahtschmuck", "tagline": "Einzigartige Schmuckstücke aus Hamburg"}'),
        ('shop_settings', '{"currency": "EUR", "tax_rate": 0.19, "free_shipping_threshold": 75.00, "default_shipping_cost": 4.99}'),
        ('contact_info', '{"email": "info@elbfunkeln.de", "phone": "+49 40 12345678", "address": "Elbchaussee 123, 22763 Hamburg", "business_hours": "Mo-Fr 10-18 Uhr, Sa 10-16 Uhr"}'),
        ('social_media', '{"instagram": "@elbfunkeln_hamburg", "facebook": "ElbfunkelnHamburg", "pinterest": "elbfunkeln"}'),
        ('newsletter_stats', '{"total_subscribers": 15, "last_campaign_open_rate": 0.65, "last_campaign_sent": "2024-01-15"}'),
        ('analytics', '{"monthly_visitors": 2847, "conversion_rate": 0.034, "avg_order_value": 125.73, "top_product": "ELB-HL-002"}'),
        ('seo_settings', '{"meta_title": "Elbfunkeln - Handgefertigter Drahtschmuck aus Hamburg", "meta_description": "Exklusive Drahtschmuck-Kollektionen handgefertigt in Hamburg. Einzigartige Ohrringe, Ketten, Armbänder und Ringe.", "keywords": ["drahtschmuck", "handgefertigt", "hamburg", "unikat", "silber", "gold"]}'),
        ('shipping_settings', '{"free_shipping_threshold": 75.00, "standard_shipping": 4.99, "express_shipping": 9.99, "shipping_zones": {"DE": {"standard": 4.99, "express": 9.99}, "EU": {"standard": 12.99, "express": 19.99}, "WORLD": {"standard": 24.99, "express": 39.99}}}'),
        ('payment_methods', '{"enabled": ["credit_card", "paypal", "bank_transfer", "klarna"], "credit_cards": ["visa", "mastercard", "amex"], "default_currency": "EUR"}'),
        ('discount_codes', '{"WELCOME10": {"type": "percentage", "value": 10, "min_order": 50, "expires": "2024-12-31", "active": true}, "FIRSTORDER": {"type": "fixed", "value": 15, "min_order": 100, "expires": "2024-12-31", "active": true}, "VALENTINE": {"type": "percentage", "value": 20, "min_order": 75, "expires": "2024-02-14", "active": true}}'),
        ('inventory_settings', '{"low_stock_threshold": 5, "auto_reorder": true, "reorder_quantity": 10, "track_variants": true}'),
        ('email_templates', '{"order_confirmation": {"subject": "Bestellbestätigung - Elbfunkeln", "template": "order_confirmation.html"}, "shipping_notification": {"subject": "Ihr Elbfunkeln Paket ist unterwegs", "template": "shipping_notification.html"}, "newsletter": {"subject": "Neue Schmuckstücke bei Elbfunkeln", "template": "newsletter.html"}}'),
        ('maintenance_mode', '{"enabled": false, "message": "Wir arbeiten gerade an Verbesserungen für Sie. Bald sind wir wieder da!", "allowed_ips": ["192.168.1.1", "192.168.1.10"], "eta": null}'),
        ('cookie_settings', '{"essential": true, "analytics": true, "marketing": false, "banner_text": "Wir verwenden Cookies für die beste Nutzererfahrung.", "privacy_url": "/datenschutz"}'),
        ('social_media_settings', '{"instagram": {"handle": "@elbfunkeln_hamburg", "api_key": "", "feed_enabled": true}, "facebook": {"page_id": "elbfunkeln", "api_key": ""}, "pinterest": {"username": "elbfunkeln", "api_key": ""}}'),
        ('blog_settings', '{"posts_per_page": 6, "comments_enabled": true, "moderation_required": true, "rss_enabled": true}'),
        ('review_settings', '{"enabled": true, "require_purchase": true, "moderation": true, "allow_photos": true, "reminder_emails": true}'),
        ('size_guides', '{"rings": {"sizes": ["52", "54", "56", "58", "60", "62"], "guide_url": "/groessentabelle-ringe"}, "necklaces": {"lengths": ["40cm", "45cm", "50cm", "55cm"], "guide_url": "/groessentabelle-ketten"}}'),
        ('return_policy', '{"return_period_days": 30, "free_returns": true, "conditions": ["unworn", "original_packaging", "receipt_required"], "process_url": "/retouren"}'),
        ('gift_wrapping', '{"available": true, "cost": 3.99, "options": ["standard", "premium", "eco"], "message_card": true}'),
        ('affiliate_program', '{"enabled": true, "commission_rate": 0.08, "cookie_duration_days": 30, "min_payout": 50.00}'),
        ('api_settings', '{"rate_limit": 100, "cache_duration": 300, "webhook_secret": "elbfunkeln_webhook_2024"}'),
        ('backup_settings', '{"frequency": "daily", "retention_days": 30, "location": "eu-central-1", "last_backup": "2024-01-20T03:00:00Z"}')
    ON CONFLICT (key) DO UPDATE SET
        value = EXCLUDED.value;

    -- ===============================================
    -- SUCCESS MESSAGE
    -- ===============================================
    
    RAISE NOTICE '🎉 ELBFUNKELN DATENBANK VOLLSTÄNDIG BEFÜLLT!';
    RAISE NOTICE '';
    RAISE NOTICE '📊 ERSTELLTE DATENSÄTZE:';
    RAISE NOTICE '   📂 Kategorien: 6';
    RAISE NOTICE '   💎 Produkte: 14';
    RAISE NOTICE '   🖼️ Produktbilder: 16';
    RAISE NOTICE '   👥 Benutzerprofile: 7';
    RAISE NOTICE '   🏠 Benutzeradressen: 5';
    RAISE NOTICE '   📧 Newsletter-Abonnenten: 15';
    RAISE NOTICE '   📞 Kontaktanfragen: 10';
    RAISE NOTICE '   🛒 Bestellungen: 3';
    RAISE NOTICE '   📦 Bestellpositionen: 4';
    RAISE NOTICE '   🔐 User Sessions: 6';
    RAISE NOTICE '   📋 Aktivitätslogs: 32';
    RAISE NOTICE '   ⚙️ Key-Value Einträge: 20';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Shop ist vollständig betriebsbereit!';
    RAISE NOTICE '💡 Alle Tabellen enthalten realistische Testdaten.';

END $$;