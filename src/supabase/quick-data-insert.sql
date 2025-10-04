-- ===============================================
-- ELBFUNKELN - SCHNELLE DATENBEFÜLLUNG
-- Zum direkten Ausführen im Supabase SQL Editor
-- ===============================================

-- 1. KATEGORIEN
INSERT INTO categories (id, name, description, slug, image_url, is_active, sort_order) VALUES 
(gen_random_uuid(), 'Ohrringe', 'Handgefertigte Draht-Ohrringe', 'ohrringe', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400', true, 1),
(gen_random_uuid(), 'Halsketten', 'Elegante Draht-Halsketten', 'halsketten', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400', true, 2),
(gen_random_uuid(), 'Armbänder', 'Filigrane Draht-Armbänder', 'armbaender', 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400', true, 3),
(gen_random_uuid(), 'Ringe', 'Kunstvolle Draht-Ringe', 'ringe', 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400', true, 4),
(gen_random_uuid(), 'Sets', 'Aufeinander abgestimmte Schmuck-Sets', 'sets', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400', true, 5)
ON CONFLICT (slug) DO NOTHING;

-- 2. PRODUKTE (mit festen Kategorie-Referenzen)
INSERT INTO products (id, name, description, price, category_id, is_active, stock_quantity, sku, materials) VALUES 
(gen_random_uuid(), 'Spiralen-Ohrringe "Elbe"', 'Handgeformte Spiralen aus 925er Silberdraht mit Perlenakzenten', 45.00, (SELECT id FROM categories WHERE slug = 'ohrringe' LIMIT 1), true, 8, 'ELB-OH-001', '925er Silberdraht'),
(gen_random_uuid(), 'Blüten-Hänger "Hamburg"', 'Filigrane Blütenmotive aus Kupferdraht mit goldener Beschichtung', 52.00, (SELECT id FROM categories WHERE slug = 'ohrringe' LIMIT 1), true, 5, 'ELB-OH-002', 'Kupferdraht vergoldet'),
(gen_random_uuid(), 'Herz-Anhänger "Speicherstadt"', 'Romantischer Herzanhänger aus verschlungenem Silberdraht', 78.00, (SELECT id FROM categories WHERE slug = 'halsketten' LIMIT 1), true, 6, 'ELB-HL-001', '925er Silberdraht'),
(gen_random_uuid(), 'Infinity-Kette "Elbe Eternal"', 'Symbol der Unendlichkeit aus kunstvollem Drahtgeflecht', 95.00, (SELECT id FROM categories WHERE slug = 'halsketten' LIMIT 1), true, 4, 'ELB-HL-002', '925er Silberdraht'),
(gen_random_uuid(), 'Charm-Armband "Blankenese"', 'Elastisches Drahtarmband mit verschiedenen Anhängern', 42.00, (SELECT id FROM categories WHERE slug = 'armbaender' LIMIT 1), true, 10, 'ELB-AR-001', 'Silberdraht'),
(gen_random_uuid(), 'Spiralring "Elbphilharmonie"', 'Kunstvoller Spiralring inspiriert von Hamburger Architektur', 34.00, (SELECT id FROM categories WHERE slug = 'ringe' LIMIT 1), true, 15, 'ELB-RI-001', 'Silberdraht'),
(gen_random_uuid(), 'Brautschmuck-Set "Hanseatisch"', 'Komplettes Set für die Hochzeit: Ohrringe, Halskette, Armband', 298.00, (SELECT id FROM categories WHERE slug = 'sets' LIMIT 1), true, 3, 'ELB-SET-001', '925er Silberdraht')
ON CONFLICT (sku) DO NOTHING;

-- 3. PRODUKTBILDER
INSERT INTO product_images (id, product_id, image_url, alt_text, is_primary, sort_order) VALUES 
(gen_random_uuid(), (SELECT id FROM products WHERE sku = 'ELB-OH-001'), 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800', 'Spiralen-Ohrringe Elbe', true, 1),
(gen_random_uuid(), (SELECT id FROM products WHERE sku = 'ELB-OH-002'), 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800', 'Blüten-Hänger Hamburg', true, 1),
(gen_random_uuid(), (SELECT id FROM products WHERE sku = 'ELB-HL-001'), 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800', 'Herz-Anhänger Speicherstadt', true, 1),
(gen_random_uuid(), (SELECT id FROM products WHERE sku = 'ELB-HL-002'), 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800', 'Infinity-Kette Elbe Eternal', true, 1),
(gen_random_uuid(), (SELECT id FROM products WHERE sku = 'ELB-AR-001'), 'https://images.unsplash.com/photo-1624206112918-f140f087f9b5?w=800', 'Charm-Armband Blankenese', true, 1),
(gen_random_uuid(), (SELECT id FROM products WHERE sku = 'ELB-RI-001'), 'https://images.unsplash.com/photo-1603561596112-db932d2f95d6?w=800', 'Spiralring Elbphilharmonie', true, 1),
(gen_random_uuid(), (SELECT id FROM products WHERE sku = 'ELB-SET-001'), 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800', 'Brautschmuck-Set Hanseatisch', true, 1)
ON CONFLICT DO NOTHING;

-- 4. NEWSLETTER-ABONNENTEN
INSERT INTO newsletter_subscribers (id, email, first_name, last_name, subscribed_at, is_active, source) VALUES 
(gen_random_uuid(), 'sarah.mueller@example.com', 'Sarah', 'Müller', NOW() - INTERVAL '30 days', true, 'website'),
(gen_random_uuid(), 'anna.weber@gmail.com', 'Anna', 'Weber', NOW() - INTERVAL '25 days', true, 'website'),
(gen_random_uuid(), 'thomas.mueller@web.de', 'Thomas', 'Müller', NOW() - INTERVAL '20 days', true, 'social_media'),
(gen_random_uuid(), 'lisa.hoffmann@outlook.de', 'Lisa', 'Hoffmann', NOW() - INTERVAL '15 days', true, 'website'),
(gen_random_uuid(), 'newsletter@hamburg-magazin.de', 'Redaktion', 'Hamburg Magazin', NOW() - INTERVAL '10 days', true, 'partnership'),
(gen_random_uuid(), 'schmuck.fan@lover.de', 'Jessica', 'Klein', NOW() - INTERVAL '5 days', true, 'referral'),
(gen_random_uuid(), 'handmade@artlover.com', 'David', 'Kunst', NOW() - INTERVAL '3 days', true, 'website'),
(gen_random_uuid(), 'elbfunkeln.fan@gmail.com', 'Petra', 'Goldschmidt', NOW() - INTERVAL '1 day', true, 'instagram')
ON CONFLICT (email) DO NOTHING;

-- 5. KONTAKT-ANFRAGEN
INSERT INTO contact_inquiries (id, name, email, subject, message, status, created_at) VALUES 
(gen_random_uuid(), 'Julia Becker', 'julia.becker@email.de', 'Frage zu Ringgrößen', 'Hallo, können Sie mir bei der Bestimmung meiner Ringgröße helfen?', 'open', NOW() - INTERVAL '2 days'),
(gen_random_uuid(), 'Markus Hansen', 'markus.hansen@web.de', 'Sonderanfertigung', 'Wäre es möglich, ein individuelles Schmuckset anzufertigen?', 'in_progress', NOW() - INTERVAL '5 days'),
(gen_random_uuid(), 'Elena Rodriguez', 'elena.r@gmail.com', 'Reparatur-Service', 'Mein Drahtarmband ist leider beschädigt worden. Bieten Sie Reparaturen an?', 'resolved', NOW() - INTERVAL '8 days'),
(gen_random_uuid(), 'Peter Schneider', 'p.schneider@firma.de', 'Großbestellung', 'Wir interessieren uns für eine Großbestellung. Gibt es Mengenrabatte?', 'open', NOW() - INTERVAL '1 day'),
(gen_random_uuid(), 'Sophie Wagner', 'sophie.w@outlook.com', 'Geschenkverpackung', 'Bieten Sie auch besondere Geschenkverpackungen an?', 'resolved', NOW() - INTERVAL '10 days')
ON CONFLICT DO NOTHING;

-- 6. KEY-VALUE STORE GRUNDEINSTELLUNGEN
INSERT INTO kv_store_0a65d7a9 (key, value) VALUES 
('site_settings', '{"maintenance_mode": false, "site_title": "Elbfunkeln - Handgefertigter Drahtschmuck", "tagline": "Einzigartige Schmuckstücke aus Hamburg"}'),
('shop_settings', '{"currency": "EUR", "tax_rate": 0.19, "free_shipping_threshold": 75.00, "default_shipping_cost": 4.99}'),
('contact_info', '{"email": "info@elbfunkeln.de", "phone": "+49 40 12345678", "address": "Elbchaussee 123, 22763 Hamburg", "business_hours": "Mo-Fr 10-18 Uhr, Sa 10-16 Uhr"}'),
('social_media', '{"instagram": "@elbfunkeln_hamburg", "facebook": "ElbfunkelnHamburg", "pinterest": "elbfunkeln"}'),
('newsletter_stats', '{"total_subscribers": 8, "last_campaign_open_rate": 0.65, "last_campaign_sent": "2024-01-15"}'),
('analytics', '{"monthly_visitors": 2847, "conversion_rate": 0.034, "avg_order_value": 125.73, "top_product": "ELB-HL-002"}')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- ERFOLGSMELDUNG
SELECT 
  '🎉 Elbfunkeln Basisdaten erfolgreich eingefügt!' as message,
  (SELECT COUNT(*) FROM categories) as kategorien,
  (SELECT COUNT(*) FROM products) as produkte,
  (SELECT COUNT(*) FROM product_images) as produktbilder,
  (SELECT COUNT(*) FROM newsletter_subscribers) as newsletter,
  (SELECT COUNT(*) FROM contact_inquiries) as kontaktanfragen,
  (SELECT COUNT(*) FROM kv_store_0a65d7a9) as konfiguration;