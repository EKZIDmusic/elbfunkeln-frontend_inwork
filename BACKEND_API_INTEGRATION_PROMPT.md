# Backend API - UUID Foreign Key Validierung

## Problem
Das Frontend sendet jetzt **korrekte UUID-Werte** für `categoryId` (z.B. `"550e8400-e29b-41d4-a716-446655440000"`), aber die API akzeptiert noch Strings wie `"Ringe"`.

**Bitte füge UUID-Validierung hinzu**, damit die API fehlerhafte Anfragen ablehnt.

---

## Änderungen im Backend

### 1. DTO Validierung - UUID für categoryId

**Datei: `src/products/dto/create-product.dto.ts`**

Füge `@IsUUID('4')` Decorator für `categoryId` hinzu:

```typescript
import { IsUUID } from 'class-validator';

export class CreateProductDto {
  // ... existierende Felder

  @IsUUID('4', { message: 'categoryId muss eine gültige UUID sein' })
  categoryId: string;
}
```

**Datei: `src/products/dto/update-product.dto.ts`**

```typescript
import { IsUUID, IsOptional } from 'class-validator';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @IsOptional()
  @IsUUID('4', { message: 'categoryId muss eine gültige UUID sein' })
  categoryId?: string;
}
```

---

### 2. Service - Kategorie Existenz prüfen

**Datei: `src/products/products.service.ts`**

Füge eine Prüfung hinzu, ob die Kategorie existiert:

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';

async create(createProductDto: CreateProductDto) {
  // Prüfe, ob Kategorie existiert
  const category = await this.prisma.category.findUnique({
    where: { id: createProductDto.categoryId },
  });

  if (!category) {
    throw new NotFoundException(
      `Kategorie mit ID ${createProductDto.categoryId} nicht gefunden`
    );
  }

  // Erstelle das Produkt
  return this.prisma.product.create({
    data: createProductDto,
    include: { category: true },
  });
}

async update(id: string, updateProductDto: UpdateProductDto) {
  // Wenn categoryId aktualisiert wird, prüfe ob sie existiert
  if (updateProductDto.categoryId) {
    const category = await this.prisma.category.findUnique({
      where: { id: updateProductDto.categoryId },
    });

    if (!category) {
      throw new NotFoundException(
        `Kategorie mit ID ${updateProductDto.categoryId} nicht gefunden`
      );
    }
  }

  return this.prisma.product.update({
    where: { id },
    data: updateProductDto,
    include: { category: true },
  });
}
```

---

### 3. Controller - UUID in Route-Parametern

**Datei: `src/products/products.controller.ts`**

Füge `ParseUUIDPipe` für `:id` Parameter hinzu:

```typescript
import { ParseUUIDPipe } from '@nestjs/common';

@Get(':id')
findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
  return this.productsService.findOne(id);
}

@Patch(':id')
update(
  @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  @Body() updateProductDto: UpdateProductDto,
) {
  return this.productsService.update(id, updateProductDto);
}

@Delete(':id')
remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
  return this.productsService.remove(id);
}
```

---

## Erwartetes Verhalten

### ✅ Erfolgreiche Anfrage
```json
POST /api/products
{
  "name": "Eleganter Ring",
  "description": "Handgefertigter Ring",
  "price": 49.99,
  "stock": 10,
  "isActive": true,
  "categoryId": "550e8400-e29b-41d4-a716-446655440000"
}

→ 201 Created
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Eleganter Ring",
  "categoryId": "550e8400-e29b-41d4-a716-446655440000",
  "category": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Ringe"
  }
}
```

### ❌ String statt UUID
```json
POST /api/products
{
  "categoryId": "Ringe"
}

→ 400 Bad Request
{
  "message": "categoryId muss eine gültige UUID sein"
}
```

### ❌ Nicht-existierende Kategorie
```json
POST /api/products
{
  "categoryId": "550e8400-e29b-41d4-a716-999999999999"
}

→ 404 Not Found
{
  "message": "Kategorie mit ID 550e8400-e29b-41d4-a716-999999999999 nicht gefunden"
}
```

---

## Zusätzlich: Order & Review DTOs

Falls du Order oder Review Endpoints hast, füge auch dort UUID-Validierung hinzu:

**Orders:**
```typescript
export class CreateOrderDto {
  @IsUUID('4')
  userId: string;

  @IsArray()
  @IsUUID('4', { each: true })
  productIds: string[];
}
```

**Reviews:**
```typescript
export class CreateReviewDto {
  @IsUUID('4')
  userId: string;

  @IsUUID('4')
  productId: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  comment: string;
}
```

---

## Testing

1. **Postman/Insomnia:**
   - `categoryId: "Ringe"` → 400 Error
   - `categoryId: "550e8400-e29b-41d4-a716-446655440000"` → 201 Success
   - Nicht-existierende UUID → 404 Error

2. **Frontend:**
   - Produkt erstellen → Sollte erfolgreich sein
   - Network Tab → categoryId ist UUID

---

## Zusammenfassung

**3 Dateien ändern:**
1. ✅ `create-product.dto.ts` - `@IsUUID('4')` hinzufügen
2. ✅ `update-product.dto.ts` - `@IsUUID('4')` hinzufügen
3. ✅ `products.service.ts` - Kategorie-Existenz prüfen
4. ✅ `products.controller.ts` - `ParseUUIDPipe` für Parameter

**Keine neuen Dateien nötig!** Nur bestehende DTOs, Service und Controller aktualisieren.
