-- ===============================================
-- Elbfunkeln - Vervollständigung aller Tabellen
-- ===============================================

-- ===============================================
-- USER SESSIONS - Aktive Sitzungen
-- ===============================================

-- Sessions für Test-Benutzer erstellen
INSERT INTO user_sessions (
  user_id, session_token, device_name, device_type, browser_name, 
  ip_address, user_agent, is_active, last_used_at, expires_at
) VALUES 
  -- Sarah Müller Sessions
  ((SELECT user_id FROM user_profiles WHERE display_name = 'Sarah M.'), 
   encode(gen_random_bytes(32), 'hex'), 'iPhone 13', 'mobile', 'Safari Mobile',
   '192.168.1.100', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)', true, 
   NOW() - INTERVAL '1 hour', NOW() + INTERVAL '29 days'),
   
  ((SELECT user_id FROM user_profiles WHERE display_name = 'Sarah M.'), 
   encode(gen_random_bytes(32), 'hex'), 'MacBook Pro', 'desktop', 'Chrome',
   '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', true, 
   NOW() - INTERVAL '3 hours', NOW() + INTERVAL '25 days'),

  -- Anna Weber Sessions  
  ((SELECT user_id FROM user_profiles WHERE display_name = 'Anna W.'), 
   encode(gen_random_bytes(32), 'hex'), 'Samsung Galaxy S23', 'mobile', 'Chrome Mobile',
   '10.0.0.50', 'Mozilla/5.0 (Linux; Android 13; SM-S911B)', true, 
   NOW() - INTERVAL '2 hours', NOW() + INTERVAL '28 days'),

  -- Thomas Müller Sessions
  ((SELECT user_id FROM user_profiles WHERE display_name = 'Thomas M.'), 
   encode(gen_random_bytes(32), 'hex'), 'Windows PC', 'desktop', 'Firefox',
   '85.223.45.67', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0)', true, 
   NOW() - INTERVAL '30 minutes', NOW() + INTERVAL '30 days'),

  -- Admin Sessions
  ((SELECT user_id FROM user_profiles WHERE display_name = 'Elbfunkeln Admin'), 
   encode(gen_random_bytes(32), 'hex'), 'Admin Workstation', 'desktop', 'Chrome',
   '192.168.1.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', true, 
   NOW() - INTERVAL '15 minutes', NOW() + INTERVAL '7 days'),

  -- Shop Owner Sessions
  ((SELECT user_id FROM user_profiles WHERE display_name = 'Marina Schmidt - Elbfunkeln'), 
   encode(gen_random_bytes(32), 'hex'), 'iPad Pro', 'tablet', 'Safari',
   '192.168.1.10', 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)', true, 
   NOW() - INTERVAL '45 minutes', NOW() + INTERVAL '15 days');

-- ===============================================
-- ERWEITERTE USER ACTIVITY LOGS
-- ===============================================

INSERT INTO user_activity_log (user_id, action_type, description, ip_address, success, created_at) VALUES 
  -- Sarah Müller Aktivitäten
  ((SELECT user_id FROM user_profiles WHERE display_name = 'Sarah M.'), 'product_viewed', 'Viewed product: Infinity-Kette Elbe Eternal', '192.168.1.100', true, NOW() - INTERVAL '8 days'),
  ((SELECT user_id FROM user_profiles WHERE display_name = 'Sarah M.'), 'cart_add', 'Added product to cart: Infinity-Kette Elbe Eternal', '192.168.1.100', true, NOW() - INTERVAL '7 days 2 hours'),
  ((SELECT user_id FROM user_profiles WHERE display_name = 'Sarah M.'), 'checkout_started', 'Started checkout process', '192.168.1.100', true, NOW() - INTERVAL '7 days 1 hour'),
  ((SELECT user_id FROM user_profiles WHERE display_name = 'Sarah M.'), 'payment_completed', 'Payment successful via Credit Card', '192.168.1.100', true, NOW() - INTERVAL '7 days'),
  ((SELECT user_id FROM user_profiles WHERE display_name = 'Sarah M.'), 'newsletter_subscribed', 'Subscribed to newsletter', '192.168.1.100', true, NOW() - INTERVAL '6 days'),

  -- Anna Weber Aktivitäten  
  ((SELECT user_id FROM user_profiles WHERE display_name = 'Anna W.'), 'account_created', 'New customer account created', '10.0.0.50', true, NOW() - INTERVAL '20 days'),
  ((SELECT user_id FROM user_profiles WHERE display_name = 'Anna W.'), 'product_viewed', 'Viewed product: Blüten-Hänger Hamburg', '10.0.0.50', true, NOW() - INTERVAL '13 days'),
  ((SELECT user_id FROM user_profiles WHERE display_name = 'Anna W.'), 'product_viewed', 'Viewed product: Spiralring Elbphilharmonie', '10.0.0.50', true, NOW() - INTERVAL '12 days 5 hours'),
  ((SELECT user_id FROM user_profiles WHERE display_name = 'Anna W.'), 'cart_add', 'Added multiple products to cart', '10.0.0.50', true, NOW() - INTERVAL '12 days 2 hours'),
  ((SELECT user_id FROM user_profiles WHERE display_name = 'Anna W.'), 'order_completed', 'Order ELB-2024-002 completed successfully', '10.0.0.50', true, NOW() - INTERVAL '12 days'),
  ((SELECT user_id FROM user_profiles WHERE display_name = 'Anna W.'), 'product_reviewed', 'Left review for Blüten-Hänger Hamburg', '10.0.0.50', true, NOW() - INTERVAL '5 days'),

  -- Thomas Müller Aktivitäten
  ((SELECT user_id FROM user_profiles WHERE display_name = 'Thomas M.'), 'product_search', 'Searched for "brautschmuck"', '85.223.45.67', true, NOW() - INTERVAL '3 days'),
  ((SELECT user_id FROM user_profiles WHERE display_name = 'Thomas M.'), 'product_viewed', 'Viewed product: Brautschmuck-Set Hanseatisch', '85.223.45.67', true, NOW() - INTERVAL '3 days'),
  ((SELECT user_id FROM user_profiles WHERE display_name = 'Thomas M.'), 'contact_inquiry', 'Submitted contact form for custom order', '85.223.45.67', true, NOW() - INTERVAL '2 days 6 hours'),
  ((SELECT user_id FROM user_profiles WHERE display_name = 'Thomas M.'), 'order_placed', 'Placed special order for wedding', '85.223.45.67', true, NOW() - INTERVAL '2 days'),

  -- Lisa Hoffmann Aktivitäten
  ((SELECT user_id FROM user_profiles WHERE display_name = 'Lisa H.'), 'product_viewed', 'Viewed category: Armbänder', '192.168.1.150', true, NOW() - INTERVAL '4 days'),
  ((SELECT user_id FROM user_profiles WHERE display_name = 'Lisa H.'), 'wishlist_add', 'Added Charm-Armband Blankenese to wishlist', '192.168.1.150', true, NOW() - INTERVAL '3 days'),
  ((SELECT user_id FROM user_profiles WHERE display_name = 'Lisa H.'), 'social_share', 'Shared product on Instagram', '192.168.1.150', true, NOW() - INTERVAL '2 days'),

  -- Michael Schneider Aktivitäten
  ((SELECT user_id FROM user_profiles WHERE display_name = 'Michael S.'), 'product_viewed', 'Viewed product: Verlobungsring Ewige Liebe', '45.123.67.89', true, NOW() - INTERVAL '1 day'),
  ((SELECT user_id FROM user_profiles WHERE display_name = 'Michael S.'), 'product_compared', 'Compared different ring designs', '45.123.67.89', true, NOW() - INTERVAL '1 day'),

  -- Admin Aktivitäten
  ((SELECT user_id FROM user_profiles WHERE display_name = 'Elbfunkeln Admin'), 'admin_login', 'Admin dashboard access', '192.168.1.1', true, NOW() - INTERVAL '4 hours'),
  ((SELECT user_id FROM user_profiles WHERE display_name = 'Elbfunkeln Admin'), 'user_management', 'Updated user roles', '192.168.1.1', true, NOW() - INTERVAL '3 hours'),
  ((SELECT user_id FROM user_profiles WHERE display_name = 'Elbfunkeln Admin'), 'system_backup', 'Initiated system backup', '192.168.1.1', true, NOW() - INTERVAL '1 day'),

  -- Shop Owner Aktivitäten
  ((SELECT user_id FROM user_profiles WHERE display_name = 'Marina Schmidt - Elbfunkeln'), 'product_created', 'Created new product: Spiralen-Ohrringe Elbe', '192.168.1.10', true, NOW() - INTERVAL '5 days'),
  ((SELECT user_id FROM user_profiles WHERE display_name = 'Marina Schmidt - Elbfunkeln'), 'order_processed', 'Processed order ELB-2024-001', '192.168.1.10', true, NOW() - INTERVAL '6 days'),
  ((SELECT user_id FROM user_profiles WHERE display_name = 'Marina Schmidt - Elbfunkeln'), 'inventory_updated', 'Updated stock quantities', '192.168.1.10', true, NOW() - INTERVAL '2 days'),
  ((SELECT user_id FROM user_profiles WHERE display_name = 'Marina Schmidt - Elbfunkeln'), 'newsletter_sent', 'Sent monthly newsletter', '192.168.1.10', true, NOW() - INTERVAL '1 day');

-- ===============================================
-- ERWEITERTE KEY-VALUE STORE EINTRÄGE
-- ===============================================

INSERT INTO kv_store_0a65d7a9 (key, value) VALUES 
  -- SEO & Meta Einstellungen
  ('seo_settings', '{"meta_title": "Elbfunkeln - Handgefertigter Drahtschmuck aus Hamburg", "meta_description": "Exklusive Drahtschmuck-Kollektionen handgefertigt in Hamburg. Einzigartige Ohrringe, Ketten, Armbänder und Ringe.", "keywords": ["drahtschmuck", "handgefertigt", "hamburg", "unikat", "silber", "gold"]}'),
  
  -- Versand-Einstellungen
  ('shipping_settings', '{"free_shipping_threshold": 75.00, "standard_shipping": 4.99, "express_shipping": 9.99, "shipping_zones": {"DE": {"standard": 4.99, "express": 9.99}, "EU": {"standard": 12.99, "express": 19.99}, "WORLD": {"standard": 24.99, "express": 39.99}}}'),
  
  -- Zahlungsmethoden
  ('payment_methods', '{"enabled": ["credit_card", "paypal", "bank_transfer", "klarna"], "credit_cards": ["visa", "mastercard", "amex"], "default_currency": "EUR"}'),
  
  -- Rabatt-Codes
  ('discount_codes', '{"WELCOME10": {"type": "percentage", "value": 10, "min_order": 50, "expires": "2024-12-31", "active": true}, "FIRSTORDER": {"type": "fixed", "value": 15, "min_order": 100, "expires": "2024-12-31", "active": true}, "VALENTINE": {"type": "percentage", "value": 20, "min_order": 75, "expires": "2024-02-14", "active": true}}'),
  
  -- Lagerbestand-Einstellungen
  ('inventory_settings', '{"low_stock_threshold": 5, "auto_reorder": true, "reorder_quantity": 10, "track_variants": true}'),
  
  -- E-Mail-Templates
  ('email_templates', '{"order_confirmation": {"subject": "Bestellbestätigung - Elbfunkeln", "template": "order_confirmation.html"}, "shipping_notification": {"subject": "Ihr Elbfunkeln Paket ist unterwegs", "template": "shipping_notification.html"}, "newsletter": {"subject": "Neue Schmuckstücke bei Elbfunkeln", "template": "newsletter.html"}}'),
  
  -- Wartungsmodus
  ('maintenance_mode', '{"enabled": false, "message": "Wir arbeiten gerade an Verbesserungen für Sie. Bald sind wir wieder da!", "allowed_ips": ["192.168.1.1", "192.168.1.10"], "eta": null}'),
  
  -- Cookie-Einstellungen
  ('cookie_settings', '{"essential": true, "analytics": true, "marketing": false, "banner_text": "Wir verwenden Cookies für die beste Nutzererfahrung.", "privacy_url": "/datenschutz"}'),
  
  -- Social Media
  ('social_media_settings', '{"instagram": {"handle": "@elbfunkeln_hamburg", "api_key": "", "feed_enabled": true}, "facebook": {"page_id": "elbfunkeln", "api_key": ""}, "pinterest": {"username": "elbfunkeln", "api_key": ""}}'),
  
  -- Blog-Einstellungen
  ('blog_settings', '{"posts_per_page": 6, "comments_enabled": true, "moderation_required": true, "rss_enabled": true}'),
  
  -- Kundenbewertungen
  ('review_settings', '{"enabled": true, "require_purchase": true, "moderation": true, "allow_photos": true, "reminder_emails": true}'),
  
  -- Größentabellen
  ('size_guides', '{"rings": {"sizes": ["52", "54", "56", "58", "60", "62"], "guide_url": "/groessentabelle-ringe"}, "necklaces": {"lengths": ["40cm", "45cm", "50cm", "55cm"], "guide_url": "/groessentabelle-ketten"}}'),
  
  -- Retouren-Richtlinien
  ('return_policy', '{"return_period_days": 30, "free_returns": true, "conditions": ["unworn", "original_packaging", "receipt_required"], "process_url": "/retouren"}'),
  
  -- Geschenkverpackung
  ('gift_wrapping', '{"available": true, "cost": 3.99, "options": ["standard", "premium", "eco"], "message_card": true}'),
  
  -- Affiliate-Programm
  ('affiliate_program', '{"enabled": true, "commission_rate": 0.08, "cookie_duration_days": 30, "min_payout": 50.00}'),
  
  -- API-Einstellungen
  ('api_settings', '{"rate_limit": 100, "cache_duration": 300, "webhook_secret": "elbfunkeln_webhook_2024"}'),
  
  -- Backup-Einstellungen
  ('backup_settings', '{"frequency": "daily", "retention_days": 30, "location": "eu-central-1", "last_backup": "2024-01-20T03:00:00Z"}');

-- ===============================================
-- ZUSÄTZLICHE PRODUKTVARIANTEN & DATEN
-- ===============================================

-- Produktbewertungen (falls Tabelle existiert)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'product_reviews') THEN
    INSERT INTO product_reviews (product_id, user_id, rating, review_text, is_verified_purchase, created_at) VALUES 
      ((SELECT id FROM products WHERE sku = 'ELB-OH-002'), (SELECT user_id FROM user_profiles WHERE display_name = 'Anna W.'), 5, 'Absolut wunderschön! Die Qualität ist hervorragend und der Kundenservice war erstklassig.', true, NOW() - INTERVAL '5 days'),
      ((SELECT id FROM products WHERE sku = 'ELB-HL-002'), (SELECT user_id FROM user_profiles WHERE display_name = 'Sarah M.'), 5, 'Mein neues Lieblingsstück! Die Unendlichkeitskette ist so elegant und gut verarbeitet.', true, NOW() - INTERVAL '3 days'),
      ((SELECT id FROM products WHERE sku = 'ELB-RI-001'), (SELECT user_id FROM user_profiles WHERE display_name = 'Anna W.'), 4, 'Sehr schöner Ring, lässt sich gut anpassen. Würde ich weiterempfehlen!', true, NOW() - INTERVAL '4 days');
  END IF;
END $$;

-- FAQ-Einträge (falls Tabelle existiert)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'faq_entries') THEN
    INSERT INTO faq_entries (question, answer, category, sort_order, is_active) VALUES 
      ('Wie pflege ich meinen Drahtschmuck?', 'Drahtschmuck sollte trocken und getrennt aufbewahrt werden. Verwenden Sie ein weiches Tuch zur Reinigung und vermeiden Sie aggressive Chemikalien.', 'Pflege', 1, true),
      ('Können Ringe in der Größe angepasst werden?', 'Ja, die meisten unserer Drahtringe können innerhalb eines bestimmten Bereichs angepasst werden. Kontaktieren Sie uns für Details.', 'Größen', 2, true),
      ('Wie lange dauert der Versand?', 'Innerhalb Deutschlands beträgt die Lieferzeit 2-3 Werktage, ins EU-Ausland 5-7 Werktage.', 'Versand', 3, true),
      ('Bieten Sie Sonderanfertigungen an?', 'Ja, gerne erstellen wir individuelle Schmuckstücke nach Ihren Wünschen. Kontaktieren Sie uns für ein persönliches Beratungsgespräch.', 'Sonderanfertigung', 4, true),
      ('Ist mein Schmuck aus echtem Silber/Gold?', 'Ja, wir verwenden ausschließlich hochwertiges 925er Sterling Silber und 14K/18K Gold für unsere Schmuckstücke.', 'Material', 5, true);
  END IF;
END $$;

-- Blog-Posts (falls in Datenbank gespeichert)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'blog_posts') THEN
    INSERT INTO blog_posts (title, slug, excerpt, content, featured_image, author_id, category, tags, is_published, created_at) VALUES 
      ('Die Kunst des Drahtbiegens 🎨', 'kunst-des-drahtbiegens', 'Entdecke die jahrhundertealte Tradition der Drahtkunst und wie wir sie in moderne Schmuckstücke verwandeln.', 
       'Die Kunst des Drahtbiegens ist eine jahrtausendealte Handwerkstechnik, die wir bei Elbfunkeln mit moderner Ästhetik verbinden...', 
       'https://images.unsplash.com/photo-1659032882703-f1e4983fe1b8?w=800', 
       (SELECT user_id FROM user_profiles WHERE display_name = 'Marina Schmidt - Elbfunkeln'), 
       'Handwerk', '["drahtkunst", "handwerk", "tradition"]', true, NOW() - INTERVAL '15 days'),
       
      ('Pflegetipps für Drahtschmuck ✨', 'pflegetipps-drahtschmuck', 'So bleibt dein handgefertigter Schmuck lange schön und strahlend.',
       'Drahtschmuck benötigt besondere Pflege um seine Schönheit zu bewahren. Hier sind unsere wichtigsten Tipps...',
       'https://images.unsplash.com/photo-1712828001446-0c3cef1f4e9a?w=800',
       (SELECT user_id FROM user_profiles WHERE display_name = 'Marina Schmidt - Elbfunkeln'),
       'Pflege', '["pflege", "tipps", "schmuck"]', true, NOW() - INTERVAL '10 days'),
       
      ('Neue Frühlings-Kollektion 2024 🌸', 'fruehlings-kollektion-2024', 'Entdecke unsere neuesten Designs inspiriert von der Schönheit des Frühlings.',
       'Der Frühling bringt neue Inspiration und frische Farben. Unsere neue Kollektion spiegelt die Lebendigkeit der Jahreszeit wider...',
       'https://images.unsplash.com/photo-1646222852531-51bd0de47a83?w=800',
       (SELECT user_id FROM user_profiles WHERE display_name = 'Marina Schmidt - Elbfunkeln'),
       'Kollektionen', '["kollektion", "frühling", "neuheiten"]', true, NOW() - INTERVAL '5 days');
  END IF;
END $$;

-- ===============================================
-- ZUSÄTZLICHE BESTELLDETAILS
-- ===============================================

-- Tracking-Informationen für versendete Bestellungen
UPDATE orders SET 
  tracking_number = 'DHL1234567890',
  tracking_url = 'https://www.dhl.de/de/privatkunden/pakete-empfangen/verfolgen.html?lang=de&idc=1234567890'
WHERE order_number = 'ELB-2024-001';

UPDATE orders SET 
  tracking_number = 'DPD9876543210',
  tracking_url = 'https://tracking.dpd.de/status/de_DE/parcel/9876543210'
WHERE order_number = 'ELB-2024-002';

-- ===============================================
-- ZUSÄTZLICHE NEWSLETTER-ABONNENTEN
-- ===============================================

INSERT INTO newsletter_subscribers (email, first_name, last_name, subscribed_at, is_active, source) VALUES 
  ('marina.gold@schmuck-fan.de', 'Marina', 'Gold', NOW() - INTERVAL '15 days', true, 'instagram'),
  ('peter.silber@handwerk.com', 'Peter', 'Silber', NOW() - INTERVAL '12 days', true, 'website'),
  ('julia.design@creative.de', 'Julia', 'Design', NOW() - INTERVAL '8 days', true, 'referral'),
  ('hamburg.style@local.de', 'Hamburg', 'Style', NOW() - INTERVAL '6 days', true, 'facebook'),
  ('wire.art.lover@gmail.com', 'Alex', 'Kunstliebhaber', NOW() - INTERVAL '4 days', true, 'pinterest'),
  ('unique.jewelry@collector.org', 'Samantha', 'Unique', NOW() - INTERVAL '2 days', true, 'website'),
  ('bridal.dreams@wedding.de', 'Sophie', 'Braut', NOW() - INTERVAL '1 day', true, 'google_ads');

-- ===============================================
-- MEHR KONTAKT-ANFRAGEN
-- ===============================================

INSERT INTO contact_inquiries (name, email, subject, message, status, created_at) VALUES 
  ('Christina Weber', 'christina.w@mail.de', 'Geschenkverpackung', 'Bieten Sie auch besondere Geschenkverpackungen für Weihnachten an? Ich möchte mehrere Stücke verschenken.', 'open', NOW() - INTERVAL '6 hours'),
  
  ('Frank Müller', 'frank.mueller@business.de', 'Firmengeschenke', 'Wir sind ein Unternehmen aus Hamburg und suchen nach exklusiven Geschenken für unsere Kunden. Können Sie uns ein Angebot machen?', 'in_progress', NOW() - INTERVAL '1 day'),
  
  ('Lisa Schneider', 'lisa.s@design.com', 'Zusammenarbeit', 'Ich bin Stylistin und würde gerne mit Ihnen zusammenarbeiten. Ihre Stücke würden perfekt zu meinen Shootings passen.', 'open', NOW() - INTERVAL '2 days'),
  
  ('Daniel Koch', 'daniel.koch@photo.de', 'Fotoshooting', 'Ich bin Fotograf und würde gerne Ihre Schmuckstücke fotografieren. Haben Sie Interesse an einer Kooperation?', 'resolved', NOW() - INTERVAL '4 days'),
  
  ('Anna Hoffmann', 'anna.h@student.de', 'Studentenrabatt', 'Hallo, gibt es Studentenrabatte? Ich bin an dem Spiralring interessiert, bin aber noch Studentin.', 'resolved', NOW() - INTERVAL '7 days');

-- ===============================================
-- ERFOLGS-STATISTIKEN AKTUALISIEREN
-- ===============================================

-- Analytics-Daten aktualisieren
UPDATE kv_store_0a65d7a9 
SET value = jsonb_set(
  value::jsonb, 
  '{newsletter_subscribers}', 
  to_jsonb((SELECT COUNT(*) FROM newsletter_subscribers WHERE is_active = true))
)
WHERE key = 'newsletter_stats';

UPDATE kv_store_0a65d7a9 
SET value = jsonb_set(
  jsonb_set(
    jsonb_set(
      value::jsonb,
      '{total_orders}',
      to_jsonb((SELECT COUNT(*) FROM orders))
    ),
    '{total_revenue}',
    to_jsonb((SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE payment_status = 'paid'))
  ),
  '{total_customers}',
  to_jsonb((SELECT COUNT(*) FROM user_profiles WHERE role = 'customer'))
)
WHERE key = 'analytics';

-- ===============================================
-- SUCCESS MESSAGE
-- ===============================================

DO $$
BEGIN
  RAISE NOTICE '🎉 VOLLSTÄNDIGE Elbfunkeln-Datenbank erfolgreich befüllt!';
  RAISE NOTICE '👥 User Sessions: Aktive Sitzungen für alle Test-Benutzer';
  RAISE NOTICE '📊 Activity Logs: Umfangreiche Aktivitätsprotokolle';
  RAISE NOTICE '⚙️ Key-Value Store: Alle Shop-Einstellungen und Konfigurationen';
  RAISE NOTICE '📧 Newsletter: Insgesamt 15 Abonnenten';
  RAISE NOTICE '📞 Kontakt: 10 realistische Kundenanfragen';
  RAISE NOTICE '📦 Bestellungen: Vollständig mit Tracking-Informationen';
  RAISE NOTICE '🏪 Shop ist zu 100% betriebsbereit!';
  RAISE NOTICE '';
  RAISE NOTICE '📈 STATISTIKEN:';
  RAISE NOTICE '   • Produkte: ' || (SELECT COUNT(*) FROM products WHERE is_active = true);
  RAISE NOTICE '   • Kategorien: ' || (SELECT COUNT(*) FROM categories WHERE is_active = true);  
  RAISE NOTICE '   • Kunden: ' || (SELECT COUNT(*) FROM user_profiles WHERE role = 'customer');
  RAISE NOTICE '   • Bestellungen: ' || (SELECT COUNT(*) FROM orders);
  RAISE NOTICE '   • Newsletter: ' || (SELECT COUNT(*) FROM newsletter_subscribers WHERE is_active = true);
  RAISE NOTICE '   • Kontaktanfragen: ' || (SELECT COUNT(*) FROM contact_inquiries);
  RAISE NOTICE '   • Aktive Sessions: ' || (SELECT COUNT(*) FROM user_sessions WHERE is_active = true);
  RAISE NOTICE '   • Activity Logs: ' || (SELECT COUNT(*) FROM user_activity_log);
END $$;