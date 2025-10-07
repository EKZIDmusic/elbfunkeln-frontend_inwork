# Produktarchiv Integration - Zusammenfassung

## Übersicht
Gelöschte Produkte werden jetzt archiviert (Soft-Delete) statt permanent gelöscht. Sie können im Produktarchiv-Tab wiederhergestellt werden.

---

## ✅ Bereits implementiert (Frontend)

### 1. API Service erweitert
**Datei: `src/services/apiService.ts`**
- ✅ `Product` Interface um `isDeleted` und `deletedAt` Felder erweitert
- ✅ Neue Archiv-Endpoints hinzugefügt:
  - `getArchived()` - Archivierte Produkte abrufen
  - `restore(id)` - Produkt wiederherstellen
  - `permanentDelete(id)` - Permanent löschen (Admin)

### 2. ProductArchive Komponente erstellt
**Datei: `src/components/admin/ProductArchive.tsx`**
- ✅ Zeigt archivierte Produkte in einer Tabelle
- ✅ Suchfunktion und Kategoriefilter
- ✅ Wiederherstellen-Button (Grün)
- ✅ Permanent-Löschen-Button (Rot, Admin)
- ✅ Grayscale-Bilder für archivierte Produkte
- ✅ Zeigt Löschdatum an

---

## 📋 Integration in Dashboard/ProductManager

### Option A: Als neuer Tab im ProductManager

**Datei: `src/components/admin/ProductManager.tsx` oder `EnhancedProductManager.tsx`**

```tsx
import { ProductArchive } from './ProductArchive';
import { Archive } from 'lucide-react';

// Im Return-Bereich Tabs hinzufügen:
<Tabs defaultValue="products" className="w-full">
  <TabsList>
    <TabsTrigger value="products">
      <Package className="h-4 w-4 mr-2" />
      Aktive Produkte
    </TabsTrigger>
    <TabsTrigger value="archive">
      <Archive className="h-4 w-4 mr-2" />
      Produktarchiv
    </TabsTrigger>
  </TabsList>

  <TabsContent value="products">
    {/* Existierender ProductManager Code */}
  </TabsContent>

  <TabsContent value="archive">
    <ProductArchive />
  </TabsContent>
</Tabs>
```

### Option B: Als separater Tab im AdminDashboard

**Datei: `src/pages/AdminDashboardPage.tsx`**

```tsx
import { ProductManager } from '../components/admin/ProductManager';
import { ProductArchive } from '../components/admin/ProductArchive';
import { Package, Archive } from 'lucide-react';

// Tabs erweitern (aktuell: database, maintenance, users, logs, security)
<TabsList className="grid w-full grid-cols-6">
  {/* ... existierende Tabs ... */}

  <TabsTrigger value="products" className="flex items-center gap-2">
    <Package className="w-4 h-4" />
    Produkte
  </TabsTrigger>

  <TabsTrigger value="archive" className="flex items-center gap-2">
    <Archive className="w-4 h-4" />
    Archiv
  </TabsTrigger>
</TabsList>

{/* ... existierende TabsContent ... */}

<TabsContent value="products">
  <ProductManager />
</TabsContent>

<TabsContent value="archive">
  <ProductArchive />
</TabsContent>
```

---

## 🔧 Backend-Änderungen erforderlich

**Siehe: `BACKEND_PRODUCT_ARCHIVE.md`**

### Zusammenfassung:
1. **Prisma Schema**: `isDeleted` und `deletedAt` Felder hinzufügen
2. **Migration**: `npx prisma migrate dev --name add-product-soft-delete`
3. **Service**: `findAll()` nur nicht-gelöschte, `remove()` setzt `isDeleted=true`
4. **Neue Methoden**: `findArchived()`, `restore()`, `permanentDelete()`
5. **Controller**: Neue Endpoints `/archived`, `/:id/restore`, `/:id/permanent`

---

## 🎯 Erwartetes Verhalten

### Produkt löschen (Shop Owner)
```
DELETE /api/products/:id
→ Produkt wird archiviert (isDeleted=true, deletedAt=now())
→ Verschwindet aus ProductManager
→ Erscheint im ProductArchive
```

### Produkt wiederherstellen (Shop Owner)
```
POST /api/products/:id/restore
→ isDeleted=false, deletedAt=null
→ Produkt erscheint wieder in ProductManager
→ Verschwindet aus ProductArchive
```

### Permanent löschen (Admin)
```
DELETE /api/products/:id/permanent
→ Produkt wird endgültig aus Datenbank gelöscht
→ NICHT RÜCKGÄNGIG MACHBAR
```

---

## 🎨 UI Features

### ProductArchive Komponente:
- ✅ **Statistik-Karten**: Anzahl archivierter Produkte
- ✅ **Info-Banner**: Erklärt Archiv-Funktion
- ✅ **Suchfeld**: Durchsucht archivierte Produkte
- ✅ **Kategoriefilter**: Filtert nach Kategorie
- ✅ **Tabelle mit**:
  - Produktbild (Grayscale)
  - Name & Beschreibung
  - Kategorie-Badge
  - Preis
  - Löschdatum (formatiert)
  - Aktionen: Wiederherstellen, Permanent löschen
- ✅ **Empty State**: "Archiv ist leer" wenn keine Produkte

### Bestätigungsdialoge:
- Wiederherstellen: "Produkt 'X' wiederherstellen?"
- Permanent löschen: "⚠️ WARNUNG: NICHT RÜCKGÄNGIG MACHBAR"

---

## 📦 Abhängigkeiten

Alle bereits im Projekt vorhanden:
- `motion/react` - Animationen
- `lucide-react` - Icons
- `sonner@2.0.3` - Toast-Benachrichtigungen
- UI-Komponenten: `Card`, `Button`, `Table`, `Badge`, etc.

---

## 🚀 Nächste Schritte

1. **Backend implementieren** (siehe `BACKEND_PRODUCT_ARCHIVE.md`)
2. **Tab in Dashboard/ProductManager einfügen** (Option A oder B oben)
3. **Testen**:
   - Produkt löschen → Erscheint im Archiv
   - Produkt wiederherstellen → Erscheint wieder in Produktliste
   - Permanent löschen (Admin) → Endgültig weg

---

## 💡 Empfehlung

**Option A** (Tab im ProductManager) ist benutzerfreundlicher:
- Shop Owner sieht beides an einem Ort
- Weniger Navigation nötig
- Logische Gruppierung: "Produkte" = Aktiv + Archiv

**Option B** (Separater Tab) ist sinnvoll wenn:
- Dashboard bereits viele Tabs hat
- Archiv selten gebraucht wird
- Admin-Dashboard-Struktur bevorzugt wird
