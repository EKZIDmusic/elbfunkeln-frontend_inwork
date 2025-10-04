-- ===============================================
-- Elbfunkeln Testdaten - Vollständige Shop-Inhalte
-- ===============================================

-- ===============================================
-- 1. KATEGORIEN für Drahtschmuck
-- ===============================================

INSERT INTO categories (id, name, description, slug, image_url, is_active, sort_order) VALUES 
  (gen_random_uuid(), 'Ohrringe', 'Handgefertigte Draht-Ohrringe in verschiedenen Designs', 'ohrringe', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400', true, 1),
  (gen_random_uuid(), 'Halsketten', 'Elegante Draht-Halsketten und Anhänger', 'halsketten', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400', true, 2),
  (gen_random_uuid(), 'Armbänder', 'Filigrane Draht-Armbänder für jeden Anlass', 'armbaender', 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400', true, 3),
  (gen_random_uuid(), 'Ringe', 'Kunstvolle Draht-Ringe in verschiedenen Größen', 'ringe', 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400', true, 4),
  (gen_random_uuid(), 'Sets', 'Aufeinander abgestimmte Schmuck-Sets', 'sets', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400', true, 5),
  (gen_random_uuid(), 'Broschen', 'Dekorative Draht-Broschen und Anstecknadeln', 'broschen', 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=400', true, 6);

-- ===============================================
-- 2. PRODUKTE mit realistischen Drahtschmuck-Designs
-- ===============================================

-- Ohrringe
INSERT INTO products (id, name, description, price, category_id, is_active, stock_quantity, sku, weight, dimensions, materials, care_instructions, created_by) VALUES 
  (gen_random_uuid(), 'Spiralen-Ohrringe "Elbe"', 'Handgeformte Spiralen aus 925er Silberdraht mit zarten Perlenakzenten. Jedes Paar ist ein Unikat.', 45.00, (SELECT id FROM categories WHERE slug = 'ohrringe' LIMIT 1), true, 8, 'ELB-OH-001', 4.5, '3cm x 1.5cm', '925er Silberdraht, Süßwasserperlen', 'Mit weichem Tuch reinigen, trocken lagern', (SELECT user_id FROM user_profiles WHERE role = 'shopowner' LIMIT 1)),
  
  (gen_random_uuid(), 'Blüten-Hänger "Hamburg"', 'Filigrane Blütenmotive aus Kupferdraht mit goldener Beschichtung. Perfekt für romantische Anlässe.', 52.00, (SELECT id FROM categories WHERE slug = 'ohrringe' LIMIT 1), true, 5, 'ELB-OH-002', 6.2, '4cm x 2cm', 'Kupferdraht vergoldet, Kristallperlen', 'Vor Feuchtigkeit schützen, mit Schmucktuch polieren', (SELECT user_id FROM user_profiles WHERE role = 'shopowner' LIMIT 1)),
  
  (gen_random_uuid(), 'Minimalist Hoops "Alster"', 'Schlichte Kreolen aus mattem Silberdraht. Zeitlos elegant und alltagstauglich.', 38.00, (SELECT id FROM categories WHERE slug = 'ohrringe' LIMIT 1), true, 12, 'ELB-OH-003', 3.8, '2.5cm Durchmesser', '925er Silberdraht matt', 'Regelmäßig mit Silberputztuch reinigen', (SELECT user_id FROM user_profiles WHERE role = 'shopowner' LIMIT 1));

-- Halsketten
INSERT INTO products (id, name, description, price, category_id, is_active, stock_quantity, sku, weight, dimensions, materials, care_instructions, created_by) VALUES 
  (gen_random_uuid(), 'Herz-Anhänger "Speicherstadt"', 'Romantischer Herzanhänger aus verschlungenem Silberdraht mit funkelndem Zirkonia.', 78.00, (SELECT id FROM categories WHERE slug = 'halsketten' LIMIT 1), true, 6, 'ELB-HL-001', 12.4, '45cm Kette, 2.5cm Anhänger', '925er Silberdraht, Zirkonia, Silberkette', 'Vor dem Duschen abnehmen, trocken aufbewahren', (SELECT user_id FROM user_profiles WHERE role = 'shopowner' LIMIT 1)),
  
  (gen_random_uuid(), 'Infinity-Kette "Elbe Eternal"', 'Symbol der Unendlichkeit aus kunstvollem Drahtgeflecht. Ein bedeutungsvolles Geschenk.', 95.00, (SELECT id FROM categories WHERE slug = 'halsketten' LIMIT 1), true, 4, 'ELB-HL-002', 15.8, '50cm Kette, 3cm Anhänger', '925er Silberdraht, Roségold-Akzente', 'Mit Silberpflegemittel behandeln, einzeln aufbewahren', (SELECT user_id FROM user_profiles WHERE role = 'shopowner' LIMIT 1)),
  
  (gen_random_uuid(), 'Vintage-Medaillon "Hafencity"', 'Aufklappbares Medaillon mit traditionellem Drahtornament. Platz für zwei kleine Fotos.', 125.00, (SELECT id FROM categories WHERE slug = 'halsketten' LIMIT 1), true, 3, 'ELB-HL-003', 22.1, '55cm Kette, 4cm Medaillon', 'Messing antik, Silberdraht, Glas', 'Vorsichtig öffnen, vor Stößen schützen', (SELECT user_id FROM user_profiles WHERE role = 'shopowner' LIMIT 1));

-- Armbänder
INSERT INTO products (id, name, description, price, category_id, is_active, stock_quantity, sku, weight, dimensions, materials, care_instructions, created_by) VALUES 
  (gen_random_uuid(), 'Charm-Armband "Blankenese"', 'Elastisches Drahtarmband mit verschiedenen Anhängern. Individuell erweiterbar.', 42.00, (SELECT id FROM categories WHERE slug = 'armbaender' LIMIT 1), true, 10, 'ELB-AR-001', 8.7, '18cm (dehnbar)', 'Silberdraht, Edelstahl, Charms', 'Nicht zu stark dehnen, trocken lagern', (SELECT user_id FROM user_profiles WHERE role = 'shopowner' LIMIT 1)),
  
  (gen_random_uuid(), 'Geflochtenes Armband "Stintfang"', 'Dreifach geflochtener Draht in Kupfer und Silber. Maritimer Stil.', 56.00, (SELECT id FROM categories WHERE slug = 'armbaender' LIMIT 1), true, 7, 'ELB-AR-002', 11.3, '19cm mit Verlängerung', 'Kupferdraht, Silberdraht, Magnetverschluss', 'Vor Salzwasser schützen, regelmäßig polieren', (SELECT user_id FROM user_profiles WHERE role = 'shopowner' LIMIT 1)),
  
  (gen_random_uuid(), 'Tennis-Armband "Elbe Glitz"', 'Elegantes Tennisarmband mit Drahtfassungen für Kristallsteine.', 89.00, (SELECT id FROM categories WHERE slug = 'armbaender' LIMIT 1), true, 5, 'ELB-AR-003', 14.2, '17.5cm', '925er Silberdraht, Swarovski Kristalle', 'Professionelle Reinigung empfohlen', (SELECT user_id FROM user_profiles WHERE role = 'shopowner' LIMIT 1));

-- Ringe
INSERT INTO products (id, name, description, price, category_id, is_active, stock_quantity, sku, weight, dimensions, materials, care_instructions, created_by) VALUES 
  (gen_random_uuid(), 'Spiralring "Elbphilharmonie"', 'Kunstvoller Spiralring inspiriert von Hamburger Architektur. Größe verstellbar.', 34.00, (SELECT id FROM categories WHERE slug = 'ringe' LIMIT 1), true, 15, 'ELB-RI-001', 3.2, 'Größe 52-58 verstellbar', 'Silberdraht, minimale Politur', 'Vorsichtig anpassen, nicht zu oft biegen', (SELECT user_id FROM user_profiles WHERE role = 'shopowner' LIMIT 1)),
  
  (gen_random_uuid(), 'Verlobungsring "Ewige Liebe"', 'Romantischer Ring mit verschlungenen Drähten und zentralem Diamant.', 245.00, (SELECT id FROM categories WHERE slug = 'ringe' LIMIT 1), true, 2, 'ELB-RI-002', 5.8, 'Verschiedene Größen', '750er Weißgold-Draht, 0.25ct Diamant', 'Professionelle Pflege, sichere Aufbewahrung', (SELECT user_id FROM user_profiles WHERE role = 'shopowner' LIMIT 1)),
  
  (gen_random_uuid(), 'Stapelring-Set "Michel"', 'Drei aufeinander abgestimmte Ringe zum Kombinieren. Hamburg-Design.', 67.00, (SELECT id FROM categories WHERE slug = 'ringe' LIMIT 1), true, 8, 'ELB-RI-003', 7.1, 'Set in einer Größe', 'Roségold-Draht, Silberdraht, Kupferdraht', 'Einzeln lagern, vor Verfärbung schützen', (SELECT user_id FROM user_profiles WHERE role = 'shopowner' LIMIT 1));

-- Sets
INSERT INTO products (id, name, description, price, category_id, is_active, stock_quantity, sku, weight, dimensions, materials, care_instructions, created_by) VALUES 
  (gen_random_uuid(), 'Brautschmuck-Set "Hanseatisch"', 'Komplettes Set für die Hochzeit: Ohrringe, Halskette, Armband in einheitlichem Design.', 298.00, (SELECT id FROM categories WHERE slug = 'sets' LIMIT 1), true, 3, 'ELB-SET-001', 45.6, 'Verschiedene Teile', '925er Silberdraht, Perlen, Kristalle', 'In Samtbox aufbewahren, vor großen Anlässen prüfen', (SELECT user_id FROM user_profiles WHERE role = 'shopowner' LIMIT 1)),
  
  (gen_random_uuid(), 'Everyday-Set "Alster Casual"', 'Alltagstaugliches Set aus drei Basics in roségold. Perfekt zum Kombinieren.', 156.00, (SELECT id FROM categories WHERE slug = 'sets' LIMIT 1), true, 6, 'ELB-SET-002', 28.3, 'Ring, Ohrringe, Armband', 'Roségold-beschichteter Draht', 'Regelmäßig polieren, zusammen lagern', (SELECT user_id FROM user_profiles WHERE role = 'shopowner' LIMIT 1));

-- ===============================================
-- 3. PRODUKT-BILDER
-- ===============================================

-- Bilder für Spiralen-Ohrringe
INSERT INTO product_images (id, product_id, image_url, alt_text, is_primary, sort_order) VALUES 
  (gen_random_uuid(), (SELECT id FROM products WHERE sku = 'ELB-OH-001'), 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800', 'Spiralen-Ohrringe Elbe Hauptansicht', true, 1),
  (gen_random_uuid(), (SELECT id FROM products WHERE sku = 'ELB-OH-001'), 'https://images.unsplash.com/photo-1634026011866-7d1e3c3a3281?w=800', 'Spiralen-Ohrringe Elbe Detailansicht', false, 2);

-- Bilder für Blüten-Hänger
INSERT INTO product_images (id, product_id, image_url, alt_text, is_primary, sort_order) VALUES 
  (gen_random_uuid(), (SELECT id FROM products WHERE sku = 'ELB-OH-002'), 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800', 'Blüten-Hänger Hamburg Hauptansicht', true, 1),
  (gen_random_uuid(), (SELECT id FROM products WHERE sku = 'ELB-OH-002'), 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=800', 'Blüten-Hänger Hamburg getragen', false, 2);

-- Bilder für weitere Produkte
INSERT INTO product_images (id, product_id, image_url, alt_text, is_primary, sort_order) VALUES 
  (gen_random_uuid(), (SELECT id FROM products WHERE sku = 'ELB-OH-003'), 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800', 'Minimalist Hoops Alster', true, 1),
  (gen_random_uuid(), (SELECT id FROM products WHERE sku = 'ELB-HL-001'), 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800', 'Herz-Anhänger Speicherstadt', true, 1),
  (gen_random_uuid(), (SELECT id FROM products WHERE sku = 'ELB-HL-002'), 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800', 'Infinity-Kette Elbe Eternal', true, 1),
  (gen_random_uuid(), (SELECT id FROM products WHERE sku = 'ELB-AR-001'), 'https://images.unsplash.com/photo-1624206112918-f140f087f9b5?w=800', 'Charm-Armband Blankenese', true, 1),
  (gen_random_uuid(), (SELECT id FROM products WHERE sku = 'ELB-RI-001'), 'https://images.unsplash.com/photo-1603561596112-db932d2f95d6?w=800', 'Spiralring Elbphilharmonie', true, 1),
  (gen_random_uuid(), (SELECT id FROM products WHERE sku = 'ELB-SET-001'), 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800', 'Brautschmuck-Set Hanseatisch', true, 1);

-- ===============================================
-- 4. BENUTZER-PROFILE
-- ===============================================

-- Admin User
INSERT INTO user_profiles (
  user_id, first_name, last_name, display_name, role, 
  two_factor_enabled, preferred_language, marketing_consent, 
  email_notifications, onboarding_completed, terms_accepted_at, privacy_accepted_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@elbfunkeln.de' LIMIT 1),
  'System', 'Administrator', 'Elbfunkeln Admin', 'admin',
  true, 'de', false, true, true, NOW(), NOW()
) ON CONFLICT (user_id) DO UPDATE SET
  role = EXCLUDED.role,
  onboarding_completed = EXCLUDED.onboarding_completed;

-- Shop Owner
INSERT INTO user_profiles (
  user_id, first_name, last_name, display_name, role,
  phone, two_factor_enabled, preferred_language, marketing_consent,
  email_notifications, onboarding_completed, terms_accepted_at, privacy_accepted_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'owner@elbfunkeln.de' LIMIT 1),
  'Marina', 'Schmidt', 'Marina Schmidt - Elbfunkeln', 'shopowner',
  '+49 40 12345678', true, 'de', true, true, true, NOW(), NOW()
) ON CONFLICT (user_id) DO UPDATE SET
  role = EXCLUDED.role,
  onboarding_completed = EXCLUDED.onboarding_completed;

-- Test Customer
INSERT INTO user_profiles (
  user_id, first_name, last_name, display_name, role,
  phone, birth_date, preferred_language, marketing_consent,
  email_notifications, onboarding_completed, terms_accepted_at, privacy_accepted_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'sarah.mueller@example.com' LIMIT 1),
  'Sarah', 'Müller', 'Sarah M.', 'customer',
  '+49 40 98765432', '1992-06-15', 'de', true, true, true, NOW(), NOW()
) ON CONFLICT (user_id) DO UPDATE SET
  onboarding_completed = EXCLUDED.onboarding_completed;

-- Weitere Test-Kunden
INSERT INTO auth.users (id, email) VALUES 
  (gen_random_uuid(), 'anna.weber@gmail.com'),
  (gen_random_uuid(), 'thomas.mueller@web.de'),
  (gen_random_uuid(), 'lisa.hoffmann@outlook.de'),
  (gen_random_uuid(), 'michael.schneider@gmx.de')
ON CONFLICT (email) DO NOTHING;

INSERT INTO user_profiles (user_id, first_name, last_name, display_name, role, preferred_language, marketing_consent, email_notifications, onboarding_completed, terms_accepted_at, privacy_accepted_at) VALUES 
  ((SELECT id FROM auth.users WHERE email = 'anna.weber@gmail.com'), 'Anna', 'Weber', 'Anna W.', 'customer', 'de', true, true, true, NOW(), NOW()),
  ((SELECT id FROM auth.users WHERE email = 'thomas.mueller@web.de'), 'Thomas', 'Müller', 'Thomas M.', 'customer', 'de', false, true, true, NOW(), NOW()),
  ((SELECT id FROM auth.users WHERE email = 'lisa.hoffmann@outlook.de'), 'Lisa', 'Hoffmann', 'Lisa H.', 'customer', 'de', true, false, true, NOW(), NOW()),
  ((SELECT id FROM auth.users WHERE email = 'michael.schneider@gmx.de'), 'Michael', 'Schneider', 'Michael S.', 'customer', 'de', true, true, false, NOW(), NOW())
ON CONFLICT (user_id) DO NOTHING;

-- ===============================================
-- 5. BENUTZER-ADRESSEN
-- ===============================================

INSERT INTO user_addresses (user_id, type, is_default, first_name, last_name, street, house_number, postal_code, city, country) VALUES 
  ((SELECT user_id FROM user_profiles WHERE display_name = 'Sarah M.'), 'both', true, 'Sarah', 'Müller', 'Elbchaussee', '42', '22763', 'Hamburg', 'DE'),
  ((SELECT user_id FROM user_profiles WHERE display_name = 'Anna W.'), 'shipping', true, 'Anna', 'Weber', 'Reeperbahn', '15', '20359', 'Hamburg', 'DE'),
  ((SELECT user_id FROM user_profiles WHERE display_name = 'Thomas M.'), 'billing', true, 'Thomas', 'Müller', 'Mönckebergstraße', '7', '20095', 'Hamburg', 'DE'),
  ((SELECT user_id FROM user_profiles WHERE display_name = 'Lisa H.'), 'both', true, 'Lisa', 'Hoffmann', 'Hafencity', '23', '20457', 'Hamburg', 'DE');

-- ===============================================
-- 6. NEWSLETTER-ABONNENTEN
-- ===============================================

INSERT INTO newsletter_subscribers (email, first_name, last_name, subscribed_at, is_active, source) VALUES 
  ('sarah.mueller@example.com', 'Sarah', 'Müller', NOW() - INTERVAL '30 days', true, 'website'),
  ('anna.weber@gmail.com', 'Anna', 'Weber', NOW() - INTERVAL '25 days', true, 'website'),
  ('thomas.mueller@web.de', 'Thomas', 'Müller', NOW() - INTERVAL '20 days', true, 'social_media'),
  ('lisa.hoffmann@outlook.de', 'Lisa', 'Hoffmann', NOW() - INTERVAL '15 days', true, 'website'),
  ('newsletter@hamburg-magazin.de', 'Redaktion', 'Hamburg Magazin', NOW() - INTERVAL '10 days', true, 'partnership'),
  ('schmuck.fan@lover.de', 'Jessica', 'Klein', NOW() - INTERVAL '5 days', true, 'referral'),
  ('handmade@artlover.com', 'David', 'Kunst', NOW() - INTERVAL '3 days', true, 'website'),
  ('elbfunkeln.fan@gmail.com', 'Petra', 'Goldschmidt', NOW() - INTERVAL '1 day', true, 'instagram');

-- ===============================================
-- 7. KONTAKT-ANFRAGEN
-- ===============================================

INSERT INTO contact_inquiries (name, email, subject, message, status, created_at) VALUES 
  ('Julia Becker', 'julia.becker@email.de', 'Frage zu Ringgrößen', 'Hallo, können Sie mir bei der Bestimmung meiner Ringgröße helfen? Ich würde gerne den Spiralring Elbphilharmonie bestellen.', 'open', NOW() - INTERVAL '2 days'),
  
  ('Markus Hansen', 'markus.hansen@web.de', 'Sonderanfertigung', 'Guten Tag, wäre es möglich, ein individuelles Schmuckset für meine Hochzeit anzufertigen? Wir heiraten im Juni und hätten gerne etwas Besonderes.', 'in_progress', NOW() - INTERVAL '5 days'),
  
  ('Elena Rodriguez', 'elena.r@gmail.com', 'Reparatur-Service', 'Mein Drahtarmband ist leider beschädigt worden. Bieten Sie auch Reparaturen an? Das Stück bedeutet mir sehr viel.', 'resolved', NOW() - INTERVAL '8 days'),
  
  ('Peter Schneider', 'p.schneider@firma.de', 'Großbestellung', 'Wir sind ein lokales Geschäft und interessieren uns für eine Großbestellung. Gibt es Mengenrabatte?', 'open', NOW() - INTERVAL '1 day'),
  
  ('Sophie Wagner', 'sophie.w@outlook.com', 'Geschenkverpackung', 'Bieten Sie auch besondere Geschenkverpackungen an? Ich möchte das Infinity-Kette als Valentinstagsgeschenk.', 'resolved', NOW() - INTERVAL '10 days');

-- ===============================================
-- 8. BESTELLUNGEN
-- ===============================================

-- Bestellung 1: Sarah Müller
DO $$
DECLARE 
  order_id UUID := gen_random_uuid();
  customer_id UUID := (SELECT user_id FROM user_profiles WHERE display_name = 'Sarah M.');
  shipping_addr_id UUID := (SELECT id FROM user_addresses WHERE user_id = customer_id AND type = 'both');
BEGIN
  INSERT INTO orders (
    id, customer_id, order_number, status, payment_status, payment_method,
    shipping_address_id, billing_address_id, subtotal, shipping_cost, 
    tax_amount, total_amount, currency, notes, created_at
  ) VALUES (
    order_id, customer_id, 'ELB-2024-001', 'shipped', 'paid', 'credit_card',
    shipping_addr_id, shipping_addr_id, 95.00, 4.99, 19.05, 119.04, 'EUR',
    'Schnelle Lieferung gewünscht - Geschenk für Freundin', NOW() - INTERVAL '7 days'
  );
  
  INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) VALUES 
    (order_id, (SELECT id FROM products WHERE sku = 'ELB-HL-002'), 1, 95.00, 95.00);
END $$;

-- Bestellung 2: Anna Weber  
DO $$
DECLARE 
  order_id UUID := gen_random_uuid();
  customer_id UUID := (SELECT user_id FROM user_profiles WHERE display_name = 'Anna W.');
  shipping_addr_id UUID := (SELECT id FROM user_addresses WHERE user_id = customer_id);
BEGIN
  INSERT INTO orders (
    id, customer_id, order_number, status, payment_status, payment_method,
    shipping_address_id, billing_address_id, subtotal, shipping_cost, 
    tax_amount, total_amount, currency, created_at
  ) VALUES (
    order_id, customer_id, 'ELB-2024-002', 'delivered', 'paid', 'paypal',
    shipping_addr_id, shipping_addr_id, 87.00, 0.00, 16.53, 103.53, 'EUR',
    NOW() - INTERVAL '12 days'
  );
  
  INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) VALUES 
    (order_id, (SELECT id FROM products WHERE sku = 'ELB-OH-002'), 1, 52.00, 52.00),
    (order_id, (SELECT id FROM products WHERE sku = 'ELB-RI-001'), 1, 34.00, 34.00);
END $$;

-- Bestellung 3: Thomas Müller
DO $$
DECLARE 
  order_id UUID := gen_random_uuid();
  customer_id UUID := (SELECT user_id FROM user_profiles WHERE display_name = 'Thomas M.');
  billing_addr_id UUID := (SELECT id FROM user_addresses WHERE user_id = customer_id);
BEGIN
  INSERT INTO orders (
    id, customer_id, order_number, status, payment_status, payment_method,
    billing_address_id, subtotal, shipping_cost, tax_amount, total_amount, 
    currency, notes, created_at
  ) VALUES (
    order_id, customer_id, 'ELB-2024-003', 'processing', 'paid', 'bank_transfer',
    billing_addr_id, 298.00, 0.00, 56.62, 354.62, 'EUR',
    'Brautschmuck für Hochzeit am 15. Juni - bitte sicher verpacken', NOW() - INTERVAL '2 days'
  );
  
  INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) VALUES 
    (order_id, (SELECT id FROM products WHERE sku = 'ELB-SET-001'), 1, 298.00, 298.00);
END $$;

-- ===============================================
-- 9. USER-AKTIVITÄTEN
-- ===============================================

-- Login-Aktivitäten
INSERT INTO user_activity_log (user_id, action_type, description, ip_address, success, created_at) VALUES 
  ((SELECT user_id FROM user_profiles WHERE display_name = 'Sarah M.'), 'login', 'Successful login via website', '192.168.1.100', true, NOW() - INTERVAL '1 hour'),
  ((SELECT user_id FROM user_profiles WHERE display_name = 'Anna W.'), 'login', 'Successful login via mobile app', '10.0.0.50', true, NOW() - INTERVAL '3 hours'),
  ((SELECT user_id FROM user_profiles WHERE display_name = 'Elbfunkeln Admin'), 'login', 'Admin login to dashboard', '192.168.1.1', true, NOW() - INTERVAL '30 minutes'),
  ((SELECT user_id FROM user_profiles WHERE display_name = 'Marina Schmidt - Elbfunkeln'), 'product_created', 'Created new product: Spiralen-Ohrringe Elbe', '192.168.1.10', true, NOW() - INTERVAL '2 days'),
  ((SELECT user_id FROM user_profiles WHERE display_name = 'Sarah M.'), 'order_placed', 'Placed order ELB-2024-001', '192.168.1.100', true, NOW() - INTERVAL '7 days'),
  ((SELECT user_id FROM user_profiles WHERE display_name = 'Thomas M.'), 'password_change', 'Password successfully changed', '85.223.45.67', true, NOW() - INTERVAL '5 days');

-- ===============================================
-- 10. KEY-VALUE STORE für App-Einstellungen
-- ===============================================

INSERT INTO kv_store_0a65d7a9 (key, value) VALUES 
  ('site_settings', '{"maintenance_mode": false, "site_title": "Elbfunkeln - Handgefertigter Drahtschmuck", "tagline": "Einzigartige Schmuckstücke aus Hamburg"}'),
  ('shop_settings', '{"currency": "EUR", "tax_rate": 0.19, "free_shipping_threshold": 75.00, "default_shipping_cost": 4.99}'),
  ('contact_info', '{"email": "info@elbfunkeln.de", "phone": "+49 40 12345678", "address": "Elbchaussee 123, 22763 Hamburg", "business_hours": "Mo-Fr 10-18 Uhr, Sa 10-16 Uhr"}'),
  ('social_media', '{"instagram": "@elbfunkeln_hamburg", "facebook": "ElbfunkelnHamburg", "pinterest": "elbfunkeln"}'),
  ('newsletter_stats', '{"total_subscribers": 8, "last_campaign_open_rate": 0.65, "last_campaign_sent": "2024-01-15"}'),
  ('analytics', '{"monthly_visitors": 2847, "conversion_rate": 0.034, "avg_order_value": 125.73, "top_product": "ELB-HL-002"}');

-- ===============================================
-- SUCCESS MESSAGE
-- ===============================================

DO $$
BEGIN
  RAISE NOTICE '🎉 Elbfunkeln Testdaten erfolgreich eingefügt!';
  RAISE NOTICE '📦 Kategorien: 6 Drahtschmuck-Kategorien';
  RAISE NOTICE '✨ Produkte: 11 handgefertigte Schmuckstücke';
  RAISE NOTICE '🖼️ Bilder: Produktfotos für alle Artikel';
  RAISE NOTICE '👥 Benutzer: Admin, Shop Owner, 5 Test-Kunden';
  RAISE NOTICE '🏠 Adressen: Hamburger Test-Adressen';
  RAISE NOTICE '📧 Newsletter: 8 Abonnenten';
  RAISE NOTICE '📞 Kontakt: 5 realistische Anfragen';
  RAISE NOTICE '🛒 Bestellungen: 3 Test-Bestellungen';
  RAISE NOTICE '📊 Aktivitäten: User-Logs und Statistiken';
  RAISE NOTICE '🚀 Shop ist bereit für den Betrieb!';
END $$;