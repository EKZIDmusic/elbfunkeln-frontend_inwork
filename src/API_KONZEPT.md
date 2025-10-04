# 🛍️ Elbfunkeln E-Commerce API Konzept

## 📋 Übersicht

REST-API für das Elbfunkeln E-Commerce-System mit Fokus auf handgemachten Drahtschmuck. Die API ist in mehrere Module aufgeteilt und unterstützt verschiedene Benutzerrollen (Kunden, Shop-Owner, Admin).

**Base URL:** `https://${projectId}.supabase.co/functions/v1/make-server-0a65d7a9`

---

## 🔐 1. Authentifizierung & Benutzerverwaltung

### 1.1 Authentifizierung
```
POST /auth/register          - Benutzerregistrierung
POST /auth/login             - Benutzeranmeldung  
POST /auth/logout            - Benutzerabmeldung
POST /auth/refresh           - Token erneuern
POST /auth/reset-password    - Passwort zurücksetzen
POST /auth/verify-email      - E-Mail-Verifizierung
```

### 1.2 Benutzerprofil
```
GET    /users/profile        - Benutzerprofil abrufen
PUT    /users/profile        - Benutzerprofil aktualisieren
DELETE /users/profile        - Benutzerkonto löschen
GET    /users/orders         - Bestellhistorie
GET    /users/favorites      - Favoriten abrufen
POST   /users/favorites      - Favorit hinzufügen
DELETE /users/favorites/{id} - Favorit entfernen
```

### 1.3 Admin Benutzerverwaltung
```
GET    /admin/users          - Alle Benutzer (Admin)
GET    /admin/users/{id}     - Benutzer Details (Admin)
PUT    /admin/users/{id}     - Benutzer bearbeiten (Admin)
DELETE /admin/users/{id}     - Benutzer löschen (Admin)
POST   /admin/users/{id}/ban - Benutzer sperren (Admin)
```

---

## 🛍️ 2. Produktverwaltung & Shop

### 2.1 Produktkatalog (Öffentlich)
```
GET /products                - Alle Produkte
GET /products/{id}           - Produktdetails
GET /products/featured       - Featured Produkte
GET /products/categories     - Kategorien
GET /products/search         - Produktsuche
```

### 2.2 Produktverwaltung (Admin/Shop-Owner)
```
POST   /admin/products       - Produkt erstellen
PUT    /admin/products/{id}  - Produkt aktualisieren
DELETE /admin/products/{id}  - Produkt löschen
POST   /admin/products/{id}/images - Produktbilder hochladen
DELETE /admin/products/{id}/images/{imageId} - Produktbild löschen
```

### 2.3 Inventar & Lagerbestand
```
GET /admin/inventory         - Lagerbestand anzeigen
PUT /admin/inventory/{id}    - Lagerbestand aktualisieren
GET /admin/inventory/low     - Niedrige Bestände
```

---

## 🛒 3. Warenkorb & Checkout

### 3.1 Warenkorb
```
GET    /cart                 - Warenkorb abrufen
POST   /cart/items           - Artikel hinzufügen
PUT    /cart/items/{id}      - Artikelmenge ändern
DELETE /cart/items/{id}      - Artikel entfernen
DELETE /cart                 - Warenkorb leeren
```

### 3.2 Checkout & Bestellungen
```
POST /checkout/validate      - Bestellung validieren
POST /checkout/payment       - Zahlung verarbeiten
POST /orders                 - Bestellung erstellen
GET  /orders/{id}            - Bestelldetails
PUT  /orders/{id}/cancel     - Bestellung stornieren
```

### 3.3 Bestellverwaltung (Admin)
```
GET    /admin/orders         - Alle Bestellungen
PUT    /admin/orders/{id}    - Bestellstatus ändern
GET    /admin/orders/stats   - Bestellstatistiken
POST   /admin/orders/{id}/refund - Rückerstattung
```

---

## 🎫 4. Gutschein-System

### 4.1 Gutscheine (Öffentlich)
```
GET  /gift-cards/templates   - Verfügbare Gutschein-Templates
POST /gift-cards/purchase    - Gutschein kaufen
GET  /gift-cards/validate/{code} - Gutschein validieren
```

### 4.2 Gutscheinverwaltung (Admin)
```
GET    /admin/gift-cards     - Alle Gutscheine
POST   /admin/gift-cards     - Gutschein erstellen
PUT    /admin/gift-cards/{id} - Gutschein bearbeiten
DELETE /admin/gift-cards/{id} - Gutschein deaktivieren
GET    /admin/gift-cards/stats - Gutschein-Statistiken
```

---

## 🎟️ 5. Ticket-System

### 5.1 Tickets (Benutzer)
```
GET  /tickets               - Meine Tickets
POST /tickets               - Ticket erstellen
GET  /tickets/{id}          - Ticket Details
POST /tickets/{id}/messages - Nachricht hinzufügen
PUT  /tickets/{id}/close    - Ticket schließen
```

### 5.2 Ticket-Management (Admin/Support)
```
GET  /admin/tickets         - Alle Tickets
PUT  /admin/tickets/{id}    - Ticket bearbeiten
POST /admin/tickets/{id}/assign - Ticket zuweisen
GET  /admin/tickets/stats   - Ticket-Statistiken
```

---

## 📧 6. Newsletter & E-Mail-Automation

### 6.1 Newsletter
```
POST /newsletter/subscribe   - Newsletter abonnieren
POST /newsletter/unsubscribe - Newsletter abbestellen
GET  /newsletter/preferences - Präferenzen abrufen
PUT  /newsletter/preferences - Präferenzen ändern
```

### 6.2 E-Mail-Kampagnen (Admin)
```
GET    /admin/newsletter/subscribers - Abonnenten
POST   /admin/newsletter/campaigns  - Kampagne erstellen
GET    /admin/newsletter/campaigns  - Kampagnen anzeigen
POST   /admin/newsletter/send       - Kampagne senden
GET    /admin/newsletter/stats      - Newsletter-Statistiken
```

---

## 💰 7. Rabatt & Gutschein-System

### 7.1 Rabattcodes
```
POST /discounts/validate     - Rabattcode validieren
POST /discounts/apply        - Rabatt anwenden
```

### 7.2 Rabattmanagement (Admin)
```
GET    /admin/discounts      - Alle Rabatte
POST   /admin/discounts      - Rabatt erstellen
PUT    /admin/discounts/{id} - Rabatt bearbeiten
DELETE /admin/discounts/{id} - Rabatt löschen
GET    /admin/discounts/usage - Rabatt-Nutzungsstatistiken
```

---

## 📊 8. Analytics & Tracking

### 8.1 Analytics
```
POST /analytics/track        - Event tracken
GET  /analytics/metrics      - Grundlegende Metriken
```

### 8.2 Analytics-Dashboard (Admin)
```
GET /admin/analytics/dashboard    - Dashboard-Daten
GET /admin/analytics/sales        - Verkaufsstatistiken
GET /admin/analytics/traffic      - Traffic-Statistiken
GET /admin/analytics/conversion   - Conversion-Metriken
GET /admin/analytics/products     - Produktperformance
```

---

## 🔍 9. Suche & Filter

### 9.1 Suche
```
GET /search/products         - Produktsuche
GET /search/suggestions      - Suchvorschläge
GET /search/autocomplete     - Autocomplete
```

### 9.2 Filter & Kategorien
```
GET /categories              - Kategorien
GET /filters                 - Verfügbare Filter
GET /products/filter         - Produkte filtern
```

---

## 🚚 10. Versand & Rücksendungen

### 10.1 Versand
```
GET /shipping/options        - Versandoptionen
GET /shipping/calculate      - Versandkosten berechnen
POST /shipping/track         - Sendungsverfolgung
```

### 10.2 Rücksendungen
```
POST /returns/request        - Rücksendung anfordern
GET  /returns/{id}           - Rücksendung-Status
PUT  /returns/{id}           - Rücksendung bearbeiten
```

---

## 🍪 11. Cookie-Consent & DSGVO

### 11.1 Cookie-Management
```
GET  /cookies/preferences    - Cookie-Präferenzen
PUT  /cookies/preferences    - Cookie-Präferenzen setzen
POST /cookies/consent        - Einwilligung speichern
```

### 11.2 DSGVO-Compliance
```
GET    /gdpr/data-export     - Datenenexport anfordern
DELETE /gdpr/data-deletion   - Datenlöschung anfordern
GET    /gdpr/privacy-policy  - Datenschutzerklärung
```

---

## 📱 12. System & Maintenance

### 12.1 System-Status
```
GET /health                  - API-Health-Check
GET /version                 - API-Version
GET /status/database         - Datenbank-Status
```

### 12.2 Admin-Tools
```
GET  /admin/logs             - System-Logs
POST /admin/maintenance      - Wartungsmodus
GET  /admin/stats            - System-Statistiken
```

---

## 🔑 Authentifizierung & Autorisierung

### Authorization Header
```
Authorization: Bearer {access_token}
```

### Benutzerrollen
- **Customer** - Grundlegende Shop-Funktionen
- **Shop-Owner** - Produktverwaltung, Bestellungen
- **Admin** - Vollzugriff auf alle Funktionen

---

## 📋 Standard-HTTP-Status-Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Unprocessable Entity
- `500` - Internal Server Error

---

---

## 💳 13. Stripe-Zahlungsintegration

### 13.1 Payment Intents
```
POST /payments/create-intent     - Payment Intent erstellen
GET  /payments/intent/{id}       - Payment Intent Status
POST /payments/confirm           - Zahlung bestätigen
POST /payments/cancel            - Zahlung stornieren
```

### 13.2 Stripe Webhooks
```
POST /webhooks/stripe           - Stripe Events verarbeiten
```

### 13.3 Zahlungsmethoden
```
GET  /payments/methods          - Verfügbare Zahlungsmethoden
POST /payments/save-method      - Zahlungsmethode speichern
GET  /payments/saved-methods    - Gespeicherte Zahlungsmethoden
DELETE /payments/methods/{id}   - Zahlungsmethode löschen
```

**Unterstützte Zahlungen:**
- Kreditkarten (Visa, Mastercard, American Express)
- SEPA-Lastschrift
- Sofort/Klarna
- Apple Pay / Google Pay

---

## 🚚 14. DHL-Versandintegration

### 14.1 DHL API Integration
```
POST /shipping/dhl/label        - Versandlabel erstellen
GET  /shipping/dhl/track/{id}   - Sendungsverfolgung
POST /shipping/dhl/pickup       - Abholung anfordern
GET  /shipping/dhl/services     - Verfügbare Services
```

### 14.2 Versandkostenkalkulation
```
POST /shipping/calculate        - Versandkosten berechnen
GET  /shipping/zones            - Versandzonen Deutschland
POST /shipping/validate-address - Adresse validieren
```

**DHL Services:**
- DHL Paket (Standard)
- DHL Express (Premium)
- DHL GoGreen (CO2-neutral)
- Packstation-Lieferung
- Wunschzustellung

---

## 🇩🇪 15. Deutschland-spezifische Features

### 15.1 Steuerberechnung
```
GET /tax/rates                  - Deutsche MwSt-Sätze (19%, 7%)
POST /tax/calculate             - Steuer berechnen
GET /tax/invoice/{id}           - Rechnung generieren
```

### 15.2 Rechtliche Compliance
```
GET /legal/terms                - AGB
GET /legal/privacy              - Datenschutzerklärung
GET /legal/imprint              - Impressum
GET /legal/withdrawal           - Widerrufsrecht
GET /legal/gdpr-export          - DSGVO-Datenexport
```

### 15.3 Deutsche Sprachunterstützung
```
GET /i18n/de                    - Deutsche Übersetzungen
POST /i18n/validate             - Texte validieren
```

---

## 📱 16. Social Media Integration

### 16.1 Social Login
```
POST /auth/social/google        - Google-Anmeldung
POST /auth/social/facebook      - Facebook-Anmeldung
POST /auth/social/instagram     - Instagram-Anmeldung
GET  /auth/social/callback      - OAuth-Callback
```

### 16.2 Social Sharing
```
POST /social/share/product      - Produkt teilen
GET  /social/og-data/{id}       - Open Graph Daten
POST /social/instagram/post     - Automatisches Posting
```

### 16.3 Social Commerce
```
GET /social/instagram/products  - Instagram Shopping Katalog
POST /social/facebook/catalog   - Facebook Shop Update
GET /social/analytics           - Social Media Metriken
```

---

## 📊 17. Buchhaltungsintegration

### 17.1 Rechnungswesen
```
POST /accounting/invoice        - Rechnung erstellen
GET  /accounting/invoices       - Rechnungen abrufen
POST /accounting/export/datev   - DATEV-Export
POST /accounting/export/csv     - CSV-Export für Buchhaltung
```

### 17.2 Steuerberater-Integration
```
GET  /accounting/tax-report     - Steuerreport generieren
POST /accounting/vat-return     - Umsatzsteuervoranmeldung
GET  /accounting/profit-loss    - GuV-Rechnung
```

### 17.3 Fibu-Software-Schnittstellen
```
POST /integrations/lexoffice    - Lexoffice Sync
POST /integrations/sevdesk      - SevDesk Sync
POST /integrations/fastbill     - FastBill Sync
```

---

## 📈 18. KPI & Business Intelligence

### 18.1 Sales KPIs
```
GET /kpis/sales/revenue         - Umsatz-KPIs
GET /kpis/sales/conversion      - Conversion-Rate
GET /kpis/sales/avg-order       - Durchschnittlicher Bestellwert
GET /kpis/sales/customer-ltv    - Customer Lifetime Value
```

### 18.2 Marketing KPIs
```
GET /kpis/marketing/traffic     - Traffic-Analyse
GET /kpis/marketing/sources     - Traffic-Quellen
GET /kpis/marketing/campaigns   - Kampagnen-Performance
GET /kpis/marketing/roi         - Marketing ROI
```

### 18.3 Operational KPIs
```
GET /kpis/operations/inventory  - Lagerbestand-KPIs
GET /kpis/operations/shipping   - Versand-Performance
GET /kpis/operations/returns    - Retourenquote
GET /kpis/operations/support    - Support-Metriken
```

### 18.4 Dashboard & Reporting
```
GET /dashboard/executive        - Management Dashboard
GET /dashboard/sales            - Sales Dashboard
GET /dashboard/operations       - Operations Dashboard
POST /reports/generate          - Custom Reports erstellen
GET /reports/scheduled          - Geplante Reports
```

---

## 🔧 19. Detaillierte API-Spezifikationen

### 19.1 Stripe Payment Intent Beispiel
```json
POST /payments/create-intent
{
  "amount": 4990,
  "currency": "eur",
  "order_id": "order_123",
  "customer_id": "cust_456",
  "payment_method_types": ["card", "sepa_debit", "sofort"],
  "metadata": {
    "order_number": "ELB-2024-001",
    "customer_email": "kunde@example.com"
  }
}

Response:
{
  "client_secret": "pi_1234567890_secret_abcdef",
  "payment_intent_id": "pi_1234567890",
  "status": "requires_payment_method"
}
```

### 19.2 DHL Label Creation Beispiel
```json
POST /shipping/dhl/label
{
  "sender": {
    "name": "Elbfunkeln",
    "street": "Musterstraße 1",
    "zip": "12345",
    "city": "Hamburg",
    "country": "DE"
  },
  "receiver": {
    "name": "Max Mustermann",
    "street": "Beispielweg 2",
    "zip": "54321",
    "city": "Berlin",
    "country": "DE"
  },
  "package": {
    "weight": 500,
    "length": 20,
    "width": 15,
    "height": 5
  },
  "service": "DHL_PAKET",
  "reference": "ELB-2024-001"
}
```

### 19.3 KPI Dashboard Response Beispiel
```json
GET /dashboard/executive
{
  "period": "last_30_days",
  "revenue": {
    "total": 25840.50,
    "growth": 15.2,
    "currency": "EUR"
  },
  "orders": {
    "total": 128,
    "growth": 8.7,
    "avg_value": 201.88
  },
  "customers": {
    "new": 45,
    "returning": 83,
    "retention_rate": 64.8
  },
  "traffic": {
    "sessions": 5420,
    "conversion_rate": 2.36,
    "bounce_rate": 35.2
  },
  "top_products": [
    {
      "id": "prod_123",
      "name": "Drahtring Silber",
      "sales": 24,
      "revenue": 1200.00
    }
  ]
}
```

---

## 🛠️ 20. Implementation Guidelines

### 20.1 Stripe Integration
- **Webhook-Verarbeitung:** Alle Stripe-Events asynchron verarbeiten
- **Idempotenz:** Duplicate-Prevention für Zahlungen
- **3D Secure:** Automatische Behandlung für EU-Kunden
- **Fehlerbehandlung:** Graceful Degradation bei Stripe-Ausfällen

### 20.2 DHL Integration
- **Staging-Umgebung:** DHL-Entwickler-API für Tests nutzen
- **Label-Generierung:** PDF-Labels automatisch generieren und speichern
- **Tracking-Updates:** Automatische Benachrichtigungen bei Statusänderungen
- **Fehlerbehandlung:** Fallback auf manuelle Versandlabel

### 20.3 Sicherheit & Performance
- **Rate Limiting:** 1000 Requests/Minute pro User
- **Caching:** Redis für KPI-Daten (TTL: 15 Minuten)
- **Monitoring:** Umfassende Logging für alle Payments und Shipments
- **Backup:** Tägliche Backups aller kritischen Daten

---

## 📋 Next Steps für Implementation

### Phase 1: Core E-Commerce (4 Wochen)
- ✅ Authentifizierung & Benutzer-Management
- ✅ Produktkatalog & Shop-Funktionen
- ✅ Warenkorb & Grundlegendes Checkout
- 🔄 Stripe-Payment-Integration

### Phase 2: Advanced Features (3 Wochen)
- 🔄 DHL-Versandintegration
- 🔄 Ticket-System & Support
- 🔄 Newsletter & E-Mail-Automation
- 🔄 Gutschein-System

### Phase 3: Analytics & Integration (2 Wochen)
- 🔄 KPI-Dashboard & Reporting
- 🔄 Social Media Integration
- 🔄 Buchhaltungsintegration
- 🔄 DSGVO-Compliance

Soll ich mit der Implementation der Stripe-Integration beginnen?