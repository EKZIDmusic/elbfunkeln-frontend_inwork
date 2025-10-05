# Elbfunkeln API Dokumentation

**Base URL:** `http://localhost:3000/api`
**Swagger Dokumentation:** `http://localhost:3000/api/docs`

---

## 🔐 Authentication

### Register (Registrierung)
**POST** `/auth/register`

**Body:**
```json
{
  "email": "string (E-Mail-Format)",
  "password": "string (min. 6 Zeichen)",
  "firstName": "string",
  "lastName": "string"
}
```

**Response:**
```json
{
  "access_token": "string (JWT)",
  "user": {
    "id": "uuid",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "role": "CUSTOMER"
  }
}
```

---

### Login (Anmeldung)
**POST** `/auth/login`

**Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "access_token": "string (JWT)",
  "user": {
    "id": "uuid",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "role": "CUSTOMER"
  }
}
```

---

### Get Profile (Profil abrufen)
**GET** `/auth/profile`

**Headers:**
```
Authorization: Bearer {JWT-Token}
```

**Response:**
```json
{
  "userId": "uuid",
  "email": "string",
  "role": "CUSTOMER"
}
```

---

## 🛍️ Products (Produkte)

### Get All Products (Alle Produkte abrufen)
**GET** `/products`

**Query Parameters (optional):**
- `page`: number (Default: 1)
- `limit`: number (Default: 20)
- `categoryId`: uuid
- `search`: string

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "string",
      "description": "string",
      "price": "decimal (10,2)",
      "discountPrice": "decimal (10,2) | null",
      "sku": "string",
      "stock": "number",
      "isActive": "boolean",
      "isFeatured": "boolean",
      "giftboxavailable": "boolean",
      "categoryId": "uuid",
      "category": {
        "id": "uuid",
        "name": "string",
        "slug": "string"
      },
      "images": [
        {
          "id": "uuid",
          "url": "string",
          "alt": "string",
          "isPrimary": "boolean"
        }
      ],
      "reviews": [],
      "createdAt": "ISO 8601",
      "updatedAt": "ISO 8601"
    }
  ],
  "total": "number",
  "page": "number",
  "limit": "number"
}
```

---

### Get Featured Products (Empfohlene Produkte)
**GET** `/products/featured`

**Response:** Wie "Get All Products" (nur gefiltert nach `isFeatured: true`)

---

### Search Products (Produkte suchen)
**GET** `/products/search?q={Suchbegriff}`

**Query Parameters:**
- `q`: string (required)

**Response:** Wie "Get All Products"

---

### Get Product by ID (Einzelnes Produkt)
**GET** `/products/{id}`

**Response:**
```json
{
  "id": "uuid",
  "name": "string",
  "description": "string",
  "price": "decimal (10,2)",
  "discountPrice": "decimal (10,2) | null",
  "sku": "string",
  "stock": "number",
  "isActive": "boolean",
  "isFeatured": "boolean",
  "giftboxavailable": "boolean",
  "categoryId": "uuid",
  "category": {
    "id": "uuid",
    "name": "string",
    "slug": "string",
    "description": "string | null"
  },
  "images": [
    {
      "id": "uuid",
      "url": "string",
      "alt": "string",
      "isPrimary": "boolean"
    }
  ],
  "reviews": [
    {
      "id": "uuid",
      "rating": "number (1-5)",
      "comment": "string",
      "userId": "uuid",
      "createdAt": "ISO 8601"
    }
  ],
  "createdAt": "ISO 8601",
  "updatedAt": "ISO 8601"
}
```

---

## 📂 Categories (Kategorien)

### Get All Categories (Alle Kategorien)
**GET** `/categories`

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "string",
    "slug": "string",
    "description": "string | null",
    "parentId": "uuid | null",
    "children": [],
    "createdAt": "ISO 8601"
  }
]
```

---

### Get Category by ID (Einzelne Kategorie)
**GET** `/categories/{id}`

**Response:**
```json
{
  "id": "uuid",
  "name": "string",
  "slug": "string",
  "description": "string | null",
  "parentId": "uuid | null",
  "products": [],
  "children": [],
  "createdAt": "ISO 8601"
}
```

---

## 🛒 Cart (Warenkorb)

**Authentifizierung erforderlich** (alle Endpoints)

### Get Cart (Warenkorb abrufen)
**GET** `/cart`

**Headers:**
```
Authorization: Bearer {JWT-Token}
```

**Response:**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "items": [
    {
      "id": "uuid",
      "productId": "uuid",
      "quantity": "number",
      "product": {
        "id": "uuid",
        "name": "string",
        "price": "decimal (10,2)",
        "discountPrice": "decimal (10,2) | null",
        "images": [],
        "stock": "number"
      },
      "createdAt": "ISO 8601"
    }
  ],
  "createdAt": "ISO 8601",
  "updatedAt": "ISO 8601"
}
```

---

### Add Item to Cart (Artikel hinzufügen)
**POST** `/cart/items`

**Headers:**
```
Authorization: Bearer {JWT-Token}
```

**Body:**
```json
{
  "productId": "uuid",
  "quantity": "number (min: 1)"
}
```

**Response:**
```json
{
  "id": "uuid",
  "cartId": "uuid",
  "productId": "uuid",
  "quantity": "number",
  "product": {},
  "createdAt": "ISO 8601"
}
```

---

### Update Cart Item (Menge ändern)
**PUT** `/cart/items/{id}`

**Headers:**
```
Authorization: Bearer {JWT-Token}
```

**Body:**
```json
{
  "quantity": "number (min: 1)"
}
```

**Response:** Aktualisiertes CartItem

---

### Remove Cart Item (Artikel entfernen)
**DELETE** `/cart/items/{id}`

**Headers:**
```
Authorization: Bearer {JWT-Token}
```

**Response:**
```json
{
  "message": "Item removed from cart"
}
```

---

### Clear Cart (Warenkorb leeren)
**DELETE** `/cart`

**Headers:**
```
Authorization: Bearer {JWT-Token}
```

**Response:**
```json
{
  "message": "Cart cleared"
}
```

---

## 📦 Orders (Bestellungen)

**Authentifizierung erforderlich** (alle Endpoints)

### Create Order (Bestellung erstellen)
**POST** `/orders`

**Headers:**
```
Authorization: Bearer {JWT-Token}
```

**Body:**
```json
{
  "addressId": "uuid",
  "items": [
    {
      "productId": "uuid",
      "quantity": "number"
    }
  ],
  "notes": "string (optional)"
}
```

**Response:**
```json
{
  "id": "uuid",
  "orderNumber": "string (z.B. ORD-20250104-001)",
  "userId": "uuid",
  "addressId": "uuid",
  "status": "PENDING",
  "paymentStatus": "PENDING",
  "shippingStatus": "PENDING",
  "subtotal": "decimal (10,2)",
  "tax": "decimal (10,2)",
  "shipping": "decimal (10,2)",
  "discount": "decimal (10,2)",
  "total": "decimal (10,2)",
  "notes": "string | null",
  "trackingNumber": "string | null",
  "stripePaymentId": "string | null",
  "discountCode": "string | null",
  "items": [
    {
      "id": "uuid",
      "productId": "uuid",
      "quantity": "number",
      "price": "decimal (10,2)",
      "product": {}
    }
  ],
  "address": {},
  "createdAt": "ISO 8601",
  "updatedAt": "ISO 8601"
}
```

---

### Get User Orders (Meine Bestellungen)
**GET** `/orders`

**Headers:**
```
Authorization: Bearer {JWT-Token}
```

**Response:**
```json
[
  {
    "id": "uuid",
    "orderNumber": "string",
    "status": "PENDING | PAID | PROCESSING | SHIPPED | DELIVERED | CANCELLED | REFUNDED",
    "paymentStatus": "PENDING | COMPLETED | FAILED | REFUNDED",
    "shippingStatus": "PENDING | LABEL_CREATED | PICKED_UP | IN_TRANSIT | OUT_FOR_DELIVERY | DELIVERED | FAILED",
    "total": "decimal (10,2)",
    "items": [],
    "createdAt": "ISO 8601"
  }
]
```

---

### Get Order Details (Bestelldetails)
**GET** `/orders/{id}`

**Headers:**
```
Authorization: Bearer {JWT-Token}
```

**Response:** Vollständige Bestelldetails (wie "Create Order")

---

### Cancel Order (Bestellung stornieren)
**PUT** `/orders/{id}/cancel`

**Headers:**
```
Authorization: Bearer {JWT-Token}
```

**Response:**
```json
{
  "id": "uuid",
  "status": "CANCELLED",
  "...": "..."
}
```

---

## 🎁 Gift Cards (Geschenkkarten)

### Get Gift Card by Code (Geschenkkarte prüfen)
**GET** `/gift-cards/{code}`

**Response:**
```json
{
  "id": "uuid",
  "code": "string",
  "amount": "decimal (10,2)",
  "balance": "decimal (10,2)",
  "isActive": "boolean",
  "expiresAt": "ISO 8601 | null",
  "createdAt": "ISO 8601"
}
```

---

## 📧 Newsletter

### Subscribe (Newsletter abonnieren)
**POST** `/newsletter/subscribe`

**Body:**
```json
{
  "email": "string (E-Mail-Format)"
}
```

**Response:**
```json
{
  "id": "uuid",
  "email": "string",
  "isActive": "boolean",
  "createdAt": "ISO 8601"
}
```

---

### Unsubscribe (Newsletter abbestellen)
**DELETE** `/newsletter/{email}`

**Response:**
```json
{
  "message": "Unsubscribed successfully"
}
```

---

## 📊 Enums (Status-Werte)

### UserRole
- `CUSTOMER`
- `SHOP_OWNER`
- `ADMIN`

### OrderStatus
- `PENDING` (Ausstehend)
- `PAID` (Bezahlt)
- `PROCESSING` (In Bearbeitung)
- `SHIPPED` (Versendet)
- `DELIVERED` (Zugestellt)
- `CANCELLED` (Storniert)
- `REFUNDED` (Erstattet)

### PaymentStatus
- `PENDING` (Ausstehend)
- `COMPLETED` (Abgeschlossen)
- `FAILED` (Fehlgeschlagen)
- `REFUNDED` (Erstattet)

### ShippingStatus
- `PENDING` (Ausstehend)
- `LABEL_CREATED` (Label erstellt)
- `PICKED_UP` (Abgeholt)
- `IN_TRANSIT` (Unterwegs)
- `OUT_FOR_DELIVERY` (Wird zugestellt)
- `DELIVERED` (Zugestellt)
- `FAILED` (Fehlgeschlagen)

---

## 🔑 Authentifizierung

Für geschützte Endpoints muss im Header das JWT-Token mitgesendet werden:

```
Authorization: Bearer {JWT-Token}
```

Das Token erhält man nach erfolgreicher Registration oder Login.

---

## 🎨 Wichtige Hinweise für die Webseite

### Produktdarstellung
- **giftboxavailable**: Boolean - zeigt an, ob das Produkt mit Geschenkbox erhältlich ist
- **discountPrice**: Falls vorhanden, sollte der reduzierte Preis angezeigt werden
- **isFeatured**: Featured Produkte können prominent angezeigt werden
- **stock**: Lagerbestand prüfen vor "In den Warenkorb"-Button

### Warenkorb-Flow
1. Produkt in Warenkorb legen: POST `/cart/items`
2. Warenkorb anzeigen: GET `/cart`
3. Menge ändern: PUT `/cart/items/{id}`
4. Artikel entfernen: DELETE `/cart/items/{id}`
5. Bestellung erstellen: POST `/orders`

### Bilder
- Jedes Produkt kann mehrere Bilder haben
- `isPrimary: true` markiert das Hauptbild
- Alle Bilder haben eine `url` und optional `alt`-Text

### Preisberechnung
Bei Bestellungen werden folgende Werte berechnet:
- **subtotal**: Summe aller Artikel
- **tax**: Steuer (MwSt.)
- **shipping**: Versandkosten
- **discount**: Rabatt (falls Code verwendet)
- **total**: Endsumme
