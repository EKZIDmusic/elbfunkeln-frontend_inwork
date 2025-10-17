# Bild-Upload Komponente - Elbfunkeln Shop-Verwaltung

## Übersicht

Die neue Bild-Upload-Komponente ermöglicht es dir, Produktbilder direkt im Admin-Panel hochzuladen, zu verwalten und zu organisieren. Die Komponente ist vollständig in beide Produktverwaltungen (ProductManager und EnhancedProductManager) integriert.

## Features

### ✨ Hauptfunktionen

- **Drag & Drop Upload** - Ziehe Bilder einfach in den Upload-Bereich
- **Datei-Auswahl** - Oder wähle Dateien über den klassischen Dialog
- **Echtzeit-Vorschau** - Sehe das Bild vor dem Hochladen
- **Upload-Fortschritt** - Prozentanzeige während des Uploads
- **Alt-Text** - SEO-freundliche Bildbeschreibungen
- **Hauptbild-Markierung** - Setze ein Bild als primäres Produktbild
- **Bild-Verwaltung** - Liste aller hochgeladenen Bilder
- **Löschen** - Entferne unerwünschte Bilder
- **Hauptbild ändern** - Setze nachträglich ein anderes Bild als Hauptbild

### 🛡️ Validierung

- **Erlaubte Formate**: JPG, JPEG, PNG, GIF, WebP
- **Max. Dateigröße**: 5 MB
- **Empfohlene Größe**: Mindestens 800x800 Pixel
- **Format**: Quadratisch für beste Darstellung

## Integration

### 1. EnhancedProductManager

Die Komponente ist im erweiterten Produktmanager integriert:

**Zugriff:**
1. Öffne die erweiterte Produktverwaltung
2. Klicke auf den "Bearbeiten" Button bei einem Produkt
3. Im Dialog siehst du den Abschnitt "Bild-Upload"

**Hinweis:** Der Bild-Upload ist nur für **bestehende Produkte** verfügbar. Bei neuen Produkten wird zunächst das Produkt erstellt, dann können Bilder hochgeladen werden.

### 2. ProductManager

Auch im vereinfachten Produktmanager verfügbar:

**Zugriff:**
1. Öffne die Produktverwaltung
2. Klicke auf "Bearbeiten" bei einem Produkt
3. Scrolle zum Abschnitt "Produkt-Bilder"

## Verwendung

### Bild hochladen

#### Methode 1: Drag & Drop
1. Ziehe eine Bilddatei in den Upload-Bereich
2. Das Bild wird als Vorschau angezeigt
3. Füge optional einen Alt-Text hinzu (empfohlen für SEO)
4. Aktiviere "Als Hauptbild setzen", wenn dies das primäre Produktbild sein soll
5. Klicke auf "Hochladen"

#### Methode 2: Datei-Auswahl
1. Klicke auf "Datei auswählen"
2. Wähle ein Bild von deinem Computer
3. Folge den Schritten 3-5 von Methode 1

### Hochgeladene Bilder verwalten

#### Hauptbild setzen
- Klicke bei einem Bild auf "Als Hauptbild"
- Das aktuelle Hauptbild wird mit einem lila Badge markiert
- Es kann immer nur ein Hauptbild geben

#### Bild löschen
- Klicke auf den Papierkorb-Button bei einem Bild
- Bestätige die Löschung
- Das Bild wird permanent entfernt

### Best Practices

#### Empfehlungen für optimale Bildqualität:

1. **Auflösung**
   - Minimum: 800x800 Pixel
   - Empfohlen: 1200x1200 Pixel oder höher
   - Format: Quadratisch (1:1) für einheitliche Darstellung

2. **Dateigröße**
   - Komprimiere Bilder vor dem Upload
   - Nutze Tools wie TinyPNG oder Squoosh
   - Ziel: Unter 500 KB pro Bild

3. **Hintergrund**
   - Heller, neutraler Hintergrund (weiß/beige)
   - Gute Beleuchtung
   - Keine störenden Elemente

4. **Alt-Text**
   - Beschreibe das Bild präzise
   - Wichtig für SEO und Barrierefreiheit
   - Beispiel: "Elegante Draht-Ohrringe aus 925 Silber mit Perle"

5. **Reihenfolge**
   - Setze das beste Bild als Hauptbild
   - Zeige verschiedene Perspektiven
   - Detailaufnahmen für komplexe Produkte

## Technische Details

### API-Endpoints

Die Komponente nutzt folgende Endpoints:

```
POST   /api/admin/products/:id/images/upload
GET    /api/admin/products/:id/images
DELETE /api/admin/products/:productId/images/:imageId
PUT    /api/admin/products/:productId/images/:imageId/primary
GET    /api/images/:imageId (öffentlich)
```

### Authentifizierung

Alle Requests benötigen einen JWT Bearer Token:
```
Authorization: Bearer <dein_token>
```

Der Token wird automatisch aus `localStorage` geladen.

### Request-Format (Upload)

**Content-Type:** `multipart/form-data`

**Parameter:**
- `file` (required) - Die Bilddatei
- `alt` (optional) - Alt-Text für das Bild
- `isPrimary` (optional) - Boolean, ob Hauptbild

### Response-Format

```json
{
  "id": "uuid-des-bildes",
  "url": "/api/images/uuid-des-bildes",
  "alt": "Beschreibung des Bildes",
  "isPrimary": true,
  "mimeType": "image/jpeg",
  "createdAt": "2025-10-17T12:00:00.000Z"
}
```

### Bildanzeige

Bilder werden über folgenden Pfad angezeigt:
```
https://api.elbfunkeln.de/api/images/{image-id}
```

## Fehlerbehandlung

### Häufige Fehler

| Fehlercode | Bedeutung | Lösung |
|------------|-----------|--------|
| 400 | Ungültige Datei | Prüfe Format und Größe |
| 401 | Nicht authentifiziert | Melde dich neu an |
| 404 | Produkt nicht gefunden | Prüfe die Produkt-ID |
| 413 | Datei zu groß | Komprimiere das Bild |

### Fehlermeldungen

Die Komponente zeigt automatisch Toast-Benachrichtigungen:
- ✅ Erfolg: Grüner Toast
- ❌ Fehler: Roter Toast
- ⚠️ Warnung: Gelber Toast

## Komponenten-Architektur

### Dateistruktur

```
src/
├── components/
│   └── admin/
│       ├── ProductImageUpload.tsx      # Haupt-Upload-Komponente
│       ├── ProductManager.tsx          # Integriert Upload
│       └── EnhancedProductManager.tsx  # Integriert Upload
├── services/
│   └── apiService.ts                   # API-Funktionen erweitert
└── utils/
    └── validation.ts                   # Validierungsfunktionen
```

### Verwendete UI-Komponenten

- `Card` - Container für Inhalte
- `Button` - Interaktive Buttons
- `Input` - Texteingaben
- `Label` - Beschriftungen
- `Checkbox` - Hauptbild-Auswahl
- `Badge` - Status-Anzeigen
- `toast` (Sonner) - Benachrichtigungen

## Styling

Die Komponente nutzt dein bestehendes Design-System:

- **Farbschema**: Elbfunkeln Beige/Braun-Töne
- **Schriftarten**:
  - `font-cormorant` für Überschriften
  - `font-inter` für Fließtext
- **Farben**:
  - `elbfunkeln-green` für Primärfarbe
  - `elbfunkeln-lavender` für Akzente
  - `elbfunkeln-beige` für Hintergründe
  - `elbfunkeln-rose` für Sale-Badges

## Migration von imgur Links

Die alte Methode mit imgur Links bleibt als "Legacy" bestehen. Beide Systeme können parallel genutzt werden:

- **Neue Methode**: Upload über diese Komponente
- **Alte Methode**: Imgur Links manuell einfügen

**Empfehlung:** Nutze die neue Upload-Methode für:
- Bessere Performance
- Volle Kontrolle über Bilder
- SEO-Optimierung
- Einheitliche Verwaltung

## Troubleshooting

### Problem: Upload funktioniert nicht

**Lösung:**
1. Prüfe deine Internetverbindung
2. Stelle sicher, dass du angemeldet bist
3. Prüfe das Dateiformat und die Größe
4. Leere den Browser-Cache

### Problem: Bilder werden nicht angezeigt

**Lösung:**
1. Prüfe die Netzwerk-Console im Browser
2. Stelle sicher, dass die API erreichbar ist
3. Prüfe, ob das Bild erfolgreich hochgeladen wurde
4. Aktualisiere die Seite (F5)

### Problem: Hauptbild kann nicht gesetzt werden

**Lösung:**
1. Stelle sicher, dass mindestens ein Bild hochgeladen ist
2. Warte, bis der vorherige Request abgeschlossen ist
3. Aktualisiere die Produktliste

## Support

Bei Problemen oder Fragen:

1. Prüfe diese Dokumentation
2. Schaue in die Browser-Console für detaillierte Fehler
3. Kontaktiere den Support mit:
   - Screenshot des Problems
   - Browser und Version
   - Fehlermeldung aus der Console

## Changelog

### Version 1.0.0 (2025-10-17)
- Initiale Implementierung
- Drag & Drop Upload
- Bild-Verwaltung
- Hauptbild-Funktion
- Integration in beide Produktmanager
- Validierung und Fehlerbehandlung
- SEO-optimierte Alt-Texte

## Zukünftige Erweiterungen

Geplante Features:

- [ ] Bild-Cropping vor dem Upload
- [ ] Reihenfolge per Drag & Drop ändern
- [ ] Bulk-Upload (mehrere Bilder gleichzeitig)
- [ ] Bild-Editor (Filter, Helligkeit, etc.)
- [ ] Automatische Bildkomprimierung
- [ ] Wasserzeichen hinzufügen
- [ ] Bildgalerie mit Zoom
- [ ] Batch-Operations (mehrere Bilder löschen)

---

**Viel Erfolg beim Verwalten deiner Produktbilder! 🎨**
