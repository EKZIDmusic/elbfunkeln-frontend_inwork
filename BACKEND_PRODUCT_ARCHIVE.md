# Backend - Produktarchiv mit Soft-Delete

## Übersicht
Implementiere ein Soft-Delete System, bei dem gelöschte Produkte archiviert werden statt permanent gelöscht zu werden.

---

## 1. Prisma Schema Änderungen

**Datei: `prisma/schema.prisma`**

Füge zum `Product` Model hinzu:

```prisma
model Product {
  id          String   @id @default(uuid())
  name        String
  description String?
  price       Float
  stock       Int
  isActive    Boolean  @default(true)
  categoryId  String
  category    Category @relation(fields: [categoryId], references: [id])

  // Soft-Delete Felder
  isDeleted   Boolean  @default(false)
  deletedAt   DateTime?

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // ... andere Felder
}
```

**Nach dem Hinzufügen:**
```bash
npx prisma migrate dev --name add-product-soft-delete
```

---

## 2. Products Service - Soft-Delete Logik

**Datei: `src/products/products.service.ts`**

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

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

    return this.prisma.product.create({
      data: createProductDto,
      include: { category: true },
    });
  }

  // Zeige nur NICHT-gelöschte Produkte
  async findAll() {
    return this.prisma.product.findMany({
      where: { isDeleted: false },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  // NEUE METHODE: Zeige archivierte Produkte
  async findArchived() {
    return this.prisma.product.findMany({
      where: { isDeleted: true },
      include: { category: true },
      orderBy: { deletedAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        id,
        isDeleted: false // Nur nicht-gelöschte Produkte
      },
      include: { category: true },
    });

    if (!product) {
      throw new NotFoundException(`Produkt mit ID ${id} nicht gefunden`);
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    // Prüfe ob Produkt existiert und nicht gelöscht ist
    await this.findOne(id);

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

  // GEÄNDERT: Soft-Delete statt permanentem Löschen
  async remove(id: string) {
    // Prüfe ob Produkt existiert
    await this.findOne(id);

    return this.prisma.product.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
      include: { category: true },
    });
  }

  // NEUE METHODE: Produkt wiederherstellen
  async restore(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!product) {
      throw new NotFoundException(`Produkt mit ID ${id} nicht gefunden`);
    }

    if (!product.isDeleted) {
      throw new NotFoundException(`Produkt mit ID ${id} ist nicht archiviert`);
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
      include: { category: true },
    });
  }

  // NEUE METHODE: Permanent löschen (nur für Admins)
  async permanentDelete(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Produkt mit ID ${id} nicht gefunden`);
    }

    return this.prisma.product.delete({
      where: { id },
    });
  }
}
```

---

## 3. Products Controller - Neue Endpoints

**Datei: `src/products/products.controller.ts`**

```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SHOP_OWNER', 'ADMIN')
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  // NEUER ENDPOINT: Archivierte Produkte abrufen
  @Get('archived')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SHOP_OWNER', 'ADMIN')
  findArchived() {
    return this.productsService.findArchived();
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SHOP_OWNER', 'ADMIN')
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  // GEÄNDERT: Soft-Delete
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SHOP_OWNER', 'ADMIN')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.productsService.remove(id);
  }

  // NEUER ENDPOINT: Produkt wiederherstellen
  @Post(':id/restore')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SHOP_OWNER', 'ADMIN')
  restore(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.productsService.restore(id);
  }

  // NEUER ENDPOINT: Permanent löschen (nur Admin)
  @Delete(':id/permanent')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  permanentDelete(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.productsService.permanentDelete(id);
  }
}
```

---

## API Endpoints Übersicht

### Aktive Produkte
- `GET /api/products` - Alle aktiven (nicht-gelöschten) Produkte
- `GET /api/products/:id` - Ein aktives Produkt
- `POST /api/products` - Neues Produkt erstellen
- `PATCH /api/products/:id` - Produkt bearbeiten
- `DELETE /api/products/:id` - **Produkt archivieren** (Soft-Delete)

### Archiv
- `GET /api/products/archived` - Alle archivierten Produkte
- `POST /api/products/:id/restore` - Produkt wiederherstellen
- `DELETE /api/products/:id/permanent` - **Permanent löschen** (nur Admin)

---

## Testing mit Postman/Insomnia

### 1. Produkt archivieren
```
DELETE /api/products/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer <token>

→ 200 OK
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Eleganter Ring",
  "isDeleted": true,
  "deletedAt": "2025-10-07T10:30:00.000Z"
}
```

### 2. Archivierte Produkte abrufen
```
GET /api/products/archived
Authorization: Bearer <token>

→ 200 OK
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Eleganter Ring",
    "isDeleted": true,
    "deletedAt": "2025-10-07T10:30:00.000Z",
    "category": { ... }
  }
]
```

### 3. Produkt wiederherstellen
```
POST /api/products/123e4567-e89b-12d3-a456-426614174000/restore
Authorization: Bearer <token>

→ 200 OK
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Eleganter Ring",
  "isDeleted": false,
  "deletedAt": null
}
```

---

## Zusammenfassung

**Änderungen:**
1. ✅ Prisma Schema - `isDeleted` und `deletedAt` Felder
2. ✅ Migration erstellen - `npx prisma migrate dev`
3. ✅ Service - Soft-Delete Logik implementieren
4. ✅ Controller - Neue Endpoints hinzufügen

**Neue Endpoints:**
- `GET /api/products/archived` - Archiv abrufen
- `POST /api/products/:id/restore` - Wiederherstellen
- `DELETE /api/products/:id/permanent` - Permanent löschen (Admin)
