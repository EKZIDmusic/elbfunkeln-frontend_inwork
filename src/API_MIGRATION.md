# API Migration - Elbfunkeln

## Übersicht

Die Elbfunkeln-Website wurde vollständig von Mock-Daten auf die echte API umgestellt.

**API Base URL:** `http://api.elbfunkeln.de/api`
**Swagger Dokumentation:** `http://api.elbfunkeln.de/api/docs`

## Durchgeführte Änderungen

### 1. Neuer API Service (`/services/apiService.ts`)

Ein zentraler Service wurde erstellt, der alle API-Endpunkte abdeckt:

- **Authentication**: Login, Register, Profile
- **Products**: GetAll, GetFeatured, Search, GetById
- **Categories**: GetAll, GetById
- **Cart**: Get, AddItem, UpdateItem, RemoveItem, Clear
- **Orders**: Create, GetAll, GetById, Cancel
- **Gift Cards**: GetByCode
- **Newsletter**: Subscribe, Unsubscribe

### 2. Aktualisierte Contexts

#### AuthContext (`/components/AuthContext.tsx`)
- ✅ Entfernung aller Supabase-Bezüge
- ✅ Entfernung aller Demo/Fallback-User
- ✅ Verwendung der echten API für Login/Register
- ✅ JWT-Token-Verwaltung mit localStorage
- ✅ Automatische Token-Validierung beim App-Start

#### CartContext (`/components/CartContext.tsx`)
- ✅ Integration mit Cart API
- ✅ Alle Warenkorb-Operationen über API
- ✅ Automatisches Laden des Warenkorbs nach Login
- ✅ Synchronisierung mit Backend
- ✅ Favoriten bleiben lokal (localStorage)

#### SearchContext (`/components/SearchContext.tsx`)
- ✅ Verwendung der API-Suche
- ✅ Debouncing für bessere Performance
- ✅ Echte Suchergebnisse von der API

#### GiftCardContext (`/components/GiftCardContext.tsx`)
- ✅ Vereinfachung auf API-Integration
- ✅ Validierung über API
- ✅ Entfernung lokaler Mock-Daten

### 3. Aktualisierte Seiten

#### ShopPage (`/pages/ShopPage.tsx`)
- ✅ Laden von Produkten über API
- ✅ Laden von Kategorien über API
- ✅ Filterung und Sortierung mit API-Daten
- ✅ Entfernung statischer Produktdaten

#### ProductDetailPage (`/pages/ProductDetailPage.tsx`)
- ✅ Laden von Produktdetails über API
- ✅ Anzeige von Produktbildern aus API
- ✅ Anzeige von Reviews aus API
- ✅ Related Products über Kategorie-ID
- ✅ Gift Box Option basierend auf `giftboxavailable`

#### HomePage (`/components/HomePage.tsx`)
- ✅ Featured Products über API
- ✅ Kategorien über API

### 4. Aktualisierte Komponenten

#### ProductGrid (`/components/ProductGrid.tsx`)
- ✅ Laden von Featured Products über API
- ✅ Entfernung statischer Daten

#### CategorySelector (`/components/CategorySelector.tsx`)
- ✅ Laden von Kategorien über API
- ✅ Dynamische Kategorie-Anzeige

#### Newsletter (`/components/Newsletter.tsx`)
- ✅ Newsletter-Anmeldung über API
- ✅ Entfernung alter Service-Referenzen

### 5. Statische Daten entfernt

#### `/data/products.ts`
- ✅ Alle Mock-Produkte entfernt
- ✅ Datei als deprecated markiert
- ✅ Leere Arrays für Rückwärtskompatibilität

## API-Integration Details

### Authentication Flow

```typescript
// Login
const response = await apiService.auth.login({ email, password });
// -> { access_token, user: { id, email, firstName, lastName, role } }

// Register
const response = await apiService.auth.register({ email, password, firstName, lastName });
// -> { access_token, user: { id, email, firstName, lastName, role } }

// Get Profile (validates token)
const profile = await apiService.auth.getProfile();
// -> { userId, email, role }
```

### Product Flow

```typescript
// Get all products (with pagination)
const response = await apiService.products.getAll({ page: 1, limit: 20 });
// -> { data: Product[], total, page, limit }

// Get featured products
const response = await apiService.products.getFeatured();
// -> { data: Product[], ... }

// Search products
const response = await apiService.products.search(query);
// -> { data: Product[], ... }

// Get single product
const product = await apiService.products.getById(id);
// -> Product
```

### Cart Flow

```typescript
// Get cart (requires authentication)
const cart = await apiService.cart.get();
// -> { id, userId, items: CartItem[], ... }

// Add to cart
const item = await apiService.cart.addItem({ productId, quantity });
// -> CartItem

// Update quantity
const item = await apiService.cart.updateItem(itemId, { quantity });
// -> CartItem

// Remove from cart
await apiService.cart.removeItem(itemId);
// -> { message }

// Clear cart
await apiService.cart.clear();
// -> { message }
```

### Order Flow

```typescript
// Create order (requires authentication)
const order = await apiService.orders.create({
  addressId: 'uuid',
  items: [{ productId: 'uuid', quantity: 1 }],
  notes: 'Optional notes'
});
// -> Order (with calculated subtotal, tax, shipping, total)

// Get user orders
const orders = await apiService.orders.getAll();
// -> Order[]

// Get order details
const order = await apiService.orders.getById(orderId);
// -> Order
```

## Datenmodelle

### Product
```typescript
{
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice: number | null;
  sku: string;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  giftboxavailable: boolean;
  categoryId: string;
  category: Category;
  images: ProductImage[];
  reviews: ProductReview[];
  createdAt: string;
  updatedAt: string;
}
```

### Category
```typescript
{
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  children: Category[];
  createdAt: string;
}
```

### User Roles
```typescript
type UserRole = 'CUSTOMER' | 'SHOP_OWNER' | 'ADMIN';
```

### Order Status
```typescript
type OrderStatus = 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
type ShippingStatus = 'PENDING' | 'LABEL_CREATED' | 'PICKED_UP' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'FAILED';
```

## Authentifizierung

Alle geschützten Endpunkte erfordern einen JWT-Token im Header:

```
Authorization: Bearer {JWT-Token}
```

Der Token wird automatisch von `apiService` verwaltet:
- Gespeichert in `localStorage` unter dem Key `auth_token`
- Automatisch bei allen authentifizierten Requests mitgesendet
- Bei Login/Register automatisch gesetzt
- Bei Logout automatisch entfernt

## Fehlerbehandlung

Alle API-Calls werfen Fehler, die mit try/catch behandelt werden sollten:

```typescript
try {
  const products = await apiService.products.getAll();
  // Success
} catch (error) {
  console.error('Error loading products:', error);
  // Error handling (toast notification, etc.)
}
```

## Noch zu implementieren

Die folgenden Features sind in der API-Dokumentation vorhanden, aber noch nicht vollständig in der UI implementiert:

1. **Adressen-Verwaltung** - Für Checkout benötigt
2. **Bestellverwaltung** - Checkout-Prozess mit Stripe
3. **Password Reset** - Forgot Password Flow
4. **Profile Update** - Vollständige Profilverwaltung
5. **Rabattcodes** - Discount Code System im Checkout

## Migration Checklist

- ✅ API Service erstellt
- ✅ AuthContext migriert
- ✅ CartContext migriert
- ✅ SearchContext migriert
- ✅ GiftCardContext migriert
- ✅ ShopPage migriert
- ✅ ProductDetailPage migriert
- ✅ ProductGrid migriert
- ✅ CategorySelector migriert
- ✅ Newsletter migriert
- ✅ Statische Daten entfernt
- ⏳ CheckoutPage (benötigt Adressen-API)
- ⏳ AccountPage (benötigt erweiterte Profile-API)
- ⏳ Admin-Komponenten (separate Migration)

## Testing

Zum Testen der Integration:

1. Starte die Anwendung
2. Versuche dich zu registrieren: `/register`
3. Melde dich an: `/login`
4. Browse Produkte: `/shop`
5. Füge Produkte zum Warenkorb hinzu
6. Überprüfe den Warenkorb: `/cart`

## Bekannte Einschränkungen

- Die API muss unter `http://api.elbfunkeln.de/api` erreichbar sein
- Für Development kann die URL in `/services/apiService.ts` angepasst werden
- CORS muss auf der API-Seite korrekt konfiguriert sein
- Produktbilder müssen absolute URLs sein

## Support

Bei Problemen mit der API-Integration:
1. Prüfe die Browser-Konsole auf Fehler
2. Prüfe die Network-Tab in den DevTools
3. Verifiziere die API-Erreichbarkeit
4. Prüfe die Swagger-Dokumentation: `http://api.elbfunkeln.de/api/docs`
