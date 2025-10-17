# Integration Guide - Bild-Upload Komponente

## Quick Start

Die Bild-Upload-Komponente ist **bereits vollständig integriert** in:
- ✅ EnhancedProductManager
- ✅ ProductManager

Keine weitere Konfiguration erforderlich!

## Sofort loslegen

### 1. Admin-Panel öffnen
Navigiere zu deiner Shop-Verwaltung:
```
https://deine-domain.de/admin
```

### 2. Produktverwaltung öffnen
Wähle eine der beiden Optionen:
- **Erweiterte Produktverwaltung** (EnhancedProductManager)
- **Standard Produktverwaltung** (ProductManager)

### 3. Produkt bearbeiten
- Klicke auf "Bearbeiten" bei einem bestehenden Produkt
- Der Dialog öffnet sich mit dem neuen Abschnitt "Bild-Upload"

### 4. Bild hochladen
- Ziehe ein Bild per Drag & Drop in den Upload-Bereich
- ODER klicke auf "Datei auswählen"
- Füge optional einen Alt-Text hinzu
- Klicke auf "Hochladen"

**Fertig!** Das Bild ist jetzt hochgeladen und wird auf deiner Website angezeigt.

## Dateien die geändert wurden

### Neue Dateien
```
src/components/admin/ProductImageUpload.tsx
```

### Geänderte Dateien
```
src/components/admin/EnhancedProductManager.tsx
src/components/admin/ProductManager.tsx
src/services/apiService.ts
```

## Backend-Anforderungen

Stelle sicher, dass dein Backend folgende Endpoints bereitstellt:

### 1. Upload-Endpoint
```typescript
POST /api/admin/products/:id/images/upload

Content-Type: multipart/form-data
Authorization: Bearer <token>

Body:
- file: File (required)
- alt: string (optional)
- isPrimary: boolean (optional)

Response:
{
  "id": "uuid",
  "url": "/api/images/uuid",
  "alt": "string",
  "isPrimary": boolean,
  "mimeType": "string",
  "createdAt": "ISO date string"
}
```

### 2. Liste der Bilder
```typescript
GET /api/admin/products/:id/images

Authorization: Bearer <token>

Response: ProductImage[]
```

### 3. Bild löschen
```typescript
DELETE /api/admin/products/:productId/images/:imageId

Authorization: Bearer <token>

Response: { "message": "success" }
```

### 4. Hauptbild setzen
```typescript
PUT /api/admin/products/:productId/images/:imageId/primary

Authorization: Bearer <token>

Response: ProductImage (updated)
```

### 5. Öffentlicher Bildabruf
```typescript
GET /api/images/:imageId

No authentication required

Response: Image file (binary)
```

## Umgebungsvariablen

Die Komponente nutzt:
```typescript
const API_BASE_URL = 'https://api.elbfunkeln.de/api';
```

Wenn du eine andere API-URL nutzt, ändere diese in:
- `src/components/admin/ProductImageUpload.tsx` (Zeile 7)

## Authentifizierung

Die Komponente holt automatisch den JWT Token aus:
```typescript
localStorage.getItem('auth_token')
```

Stelle sicher, dass:
1. Der Token nach dem Login gespeichert wird
2. Der Token das Format `Bearer <token>` im Header hat
3. Der Token die nötigen Admin-Berechtigungen hat

## Testen

### 1. Funktionaler Test

Teste folgende Szenarien:

**Upload:**
- [ ] Datei per Drag & Drop hochladen
- [ ] Datei über Dialog auswählen
- [ ] Ungültiges Format hochladen (sollte Fehler zeigen)
- [ ] Zu große Datei hochladen (sollte Fehler zeigen)
- [ ] Alt-Text hinzufügen
- [ ] Als Hauptbild markieren

**Verwaltung:**
- [ ] Alle Bilder eines Produkts anzeigen
- [ ] Hauptbild ist markiert (lila Badge)
- [ ] Hauptbild ändern
- [ ] Bild löschen
- [ ] Nach Upload automatisch neu laden

**UI/UX:**
- [ ] Drag & Drop Highlight funktioniert
- [ ] Upload-Progress wird angezeigt
- [ ] Toast-Benachrichtigungen erscheinen
- [ ] Responsive Design (Mobile/Desktop)

### 2. Fehlerbehandlung testen

- [ ] Upload ohne Authentifizierung (401)
- [ ] Upload bei nicht existierendem Produkt (404)
- [ ] Netzwerk-Fehler simulieren
- [ ] Zu große Datei (413)

### 3. Browser-Kompatibilität

Teste in:
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

## Styling anpassen

Wenn du das Styling ändern möchtest:

### Farben ändern
In `ProductImageUpload.tsx`:
```typescript
// Ersetze:
className="bg-elbfunkeln-green"
className="text-elbfunkeln-lavender"
className="border-elbfunkeln-green/30"

// Mit deinen eigenen Farben
```

### Schriftarten ändern
```typescript
className="font-cormorant"  // Überschriften
className="font-inter"      // Fließtext
```

## Debugging

### Browser Console

Öffne die Browser-Console (F12) und prüfe:

1. **Netzwerk-Tab:**
   - Werden die Requests gesendet?
   - Welchen Status-Code gibt's zurück?
   - Ist der Authorization Header gesetzt?

2. **Console-Tab:**
   - Gibt es JavaScript-Fehler?
   - Werden die richtigen Daten geladen?

### Häufige Probleme

**Problem:** Token ist nicht definiert
```typescript
// Lösung: Prüfe, ob der Login-Flow den Token speichert
console.log(localStorage.getItem('auth_token'));
```

**Problem:** CORS-Fehler
```typescript
// Lösung: Backend muss CORS für deine Domain erlauben
// Access-Control-Allow-Origin: https://deine-domain.de
```

**Problem:** Bilder werden nicht angezeigt
```typescript
// Lösung: Prüfe die Bild-URL
console.log(`${API_BASE_URL}/images/${imageId}`);
```

## Performance-Optimierung

### Empfehlungen:

1. **Bildkomprimierung:**
   - Nutze TinyPNG vor dem Upload
   - Empfohlene Größe: < 500 KB pro Bild

2. **Caching:**
   - Browser cached Bilder automatisch
   - CDN nutzen für bessere Performance

3. **Lazy Loading:**
   - Bilder werden erst geladen, wenn sichtbar
   - Bereits implementiert via `loading="lazy"`

## Sicherheit

### Bereits implementiert:

- ✅ JWT-Authentifizierung
- ✅ Dateiformat-Validierung
- ✅ Dateigröße-Limit
- ✅ CSRF-Schutz durch Token
- ✅ Input-Sanitization

### Zusätzliche Empfehlungen:

1. **Rate Limiting im Backend:**
   - Max. 10 Uploads pro Minute pro User
   - Verhindert Spam

2. **Virus-Scan:**
   - Scanne hochgeladene Dateien
   - Nutze z.B. ClamAV

3. **Storage-Limits:**
   - Setze Limits pro User/Produkt
   - Überwache Speicherplatz

## Produktion-Deployment

### Checklist vor dem Deploy:

- [ ] Alle Tests bestanden
- [ ] Backend-Endpoints verfügbar
- [ ] API-URL korrekt konfiguriert
- [ ] HTTPS aktiviert
- [ ] CORS richtig konfiguriert
- [ ] Authentifizierung funktioniert
- [ ] Bildordner hat Schreibrechte
- [ ] Backup-Strategie vorhanden
- [ ] Monitoring aktiviert
- [ ] Error-Logging eingerichtet

### Deployment-Schritte:

1. **Build erstellen:**
   ```bash
   npm run build
   ```

2. **Tests durchführen:**
   ```bash
   npm test
   ```

3. **Deployment:**
   ```bash
   # Je nach deinem Hosting
   npm run deploy
   ```

4. **Verifizierung:**
   - Teste Upload im Produktiv-System
   - Prüfe Bild-Anzeige auf der Website
   - Verifiziere alle CRUD-Operations

## Support & Dokumentation

- **Ausführliche Anleitung:** [BILD_UPLOAD_ANLEITUNG.md](./BILD_UPLOAD_ANLEITUNG.md)
- **API-Dokumentation:** Backend-Repository
- **UI-Komponenten:** Shadcn/ui Dokumentation

## Mitwirken

Wenn du Verbesserungen vornehmen möchtest:

1. Teste gründlich
2. Dokumentiere Änderungen
3. Erstelle einen Pull Request
4. Beschreibe die Änderungen im Changelog

## Lizenz

Dieses Projekt nutzt die gleiche Lizenz wie dein Hauptprojekt.

---

**Bei Fragen: Schau in die ausführliche Dokumentation oder kontaktiere den Support!**
