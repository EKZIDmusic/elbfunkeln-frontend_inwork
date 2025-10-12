// Service für echte Produktintegration zwischen Admin und Website
import apiService, { Product as ApiProduct } from './apiService';
import { products as staticProducts } from '../data/products';

// Fallback functions for compatibility
const getProducts = async () => {
  const response = await apiService.products.getAll();
  return response.data;
};

const createProduct = async (product: any) => {
  const productData = {
    name: product.name,
    description: product.description,
    price: Number(product.price),
    discountPrice: product.discountPrice ? Number(product.discountPrice) : undefined,
    sku: product.sku,
    stock: Number(product.stock),
    categoryId: product.categoryId,
    isActive: product.isActive ?? true,
    isFeatured: product.isFeatured ?? false,
    giftboxavailable: product.giftboxavailable ?? false,
  };

  return await apiService.admin.products.create(productData);
};

const updateProduct = async (id: string, product: any) => {
  const productData = {
    name: product.name,
    description: product.description,
    price: product.price ? Number(product.price) : undefined,
    discountPrice: product.discountPrice ? Number(product.discountPrice) : undefined,
    sku: product.sku,
    stock: product.stock ? Number(product.stock) : undefined,
    categoryId: product.categoryId,
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    giftboxavailable: product.giftboxavailable,
  };

  return await apiService.admin.products.update(id, productData);
};

const deleteProduct = async (id: string) => {
  await apiService.admin.products.delete(id);
  return true;
};

type SupabaseProduct = ApiProduct;

// Erweiterte Produktattribute
export interface ProductAttribute {
  id: string;
  name: string;
  type: 'text' | 'number' | 'select' | 'boolean' | 'color' | 'size';
  value: any;
  options?: string[];
  required: boolean;
  displayOrder: number;
}

export interface ProductColor {
  id: string;
  name: string;
  hexCode: string;
  available: boolean;
  stockQuantity: number;
}

export interface ProductSize {
  id: string;
  name: string;
  value: string; // z.B. "52", "M", "16cm"
  type: 'ring' | 'chain' | 'general';
  available: boolean;
  stockQuantity: number;
}

export interface ProductDimension {
  id: string;
  name: string;
  value: number;
  unit: 'cm' | 'mm' | 'inch';
  type: 'length' | 'width' | 'height' | 'diameter' | 'thickness';
}

// Produkttyp für die Website (erweitert mit zusätzlichen Feldern)
export interface WebsiteProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  category: string;
  description: string;
  detailed_description?: string;
  care_instructions?: string;
  isNew: boolean;
  isSale: boolean;
  inStock: boolean;
  materials?: string[];
  dimensions?: string;
  // Supabase-spezifische Felder
  image_url: string;
  stock: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  // Erweiterte Attribute
  customAttributes?: ProductAttribute[];
  colors?: ProductColor[];
  sizes?: ProductSize[];
  productDimensions?: ProductDimension[];
  tags?: string[];
  seoTitle?: string;
  seoDescription?: string;
  salePrice?: number;
  weight?: number;
  careInstructions?: string;
  giftWrappingAvailable?: boolean;
  // Gutschein-spezifische Felder
  variants?: { name: string; price: number; available: boolean }[];
}

// Konvertiert statische Produktdaten zu WebsiteProduct Format
function convertStaticToWebsiteProduct(staticProduct: any): WebsiteProduct {
  return {
    id: staticProduct.id,
    name: staticProduct.name,
    price: staticProduct.price,
    originalPrice: staticProduct.originalPrice,
    image: staticProduct.image,
    images: staticProduct.images || [staticProduct.image],
    category: staticProduct.category,
    description: staticProduct.description,
    detailed_description: staticProduct.description,
    care_instructions: staticProduct.care_instructions,
    isNew: staticProduct.isNew || false,
    isSale: staticProduct.isSale || false,
    inStock: staticProduct.inStock !== false,
    materials: staticProduct.materials || [],
    dimensions: staticProduct.dimensions,
    // Supabase-spezifische Felder mit Fallback-Werten
    image_url: staticProduct.image,
    stock: staticProduct.inStock ? 10 : 0,
    status: 'active' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    tags: staticProduct.tags || [],
    weight: staticProduct.weight ? parseFloat(staticProduct.weight) : undefined,
    careInstructions: staticProduct.care_instructions,
    variants: staticProduct.variants || []
  };
}

// Helper-Funktion zum Laden erweiterter Produktdaten
function getStoredProductEnhancements(productId: string): any {
  try {
    const stored = localStorage.getItem(`elbfunkeln:product-enhancements:${productId}`);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

// Konvertiert Supabase-Produkt zu Website-Produkt
function convertToWebsiteProduct(supabaseProduct: SupabaseProduct): WebsiteProduct {
  const isNew = new Date(supabaseProduct.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Neue Produkte = letzten 30 Tage

  // Lade erweiterte Attribute aus localStorage
  const enhancements = getStoredProductEnhancements(supabaseProduct.id);

  // Bestimme isSale basierend auf salePrice oder expliziter Markierung
  const isSale = enhancements.isSale || (enhancements.salePrice && enhancements.salePrice < supabaseProduct.price);

  // Bilder: Verwende enhancements.images falls vorhanden, sonst supabaseProduct.images, sonst Fallback
  const productImages = enhancements.images && enhancements.images.length > 0
    ? enhancements.images.map((img: any) => img.url)
    : supabaseProduct.images && supabaseProduct.images.length > 0
    ? supabaseProduct.images.map(img => img.url)
    : [supabaseProduct.image_url];

  // Hauptbild: Erstes Bild aus dem Array
  const primaryImage = productImages[0] || supabaseProduct.image_url;

  return {
    id: supabaseProduct.id,
    name: supabaseProduct.name,
    price: supabaseProduct.price,
    originalPrice: isSale ? supabaseProduct.price : undefined,
    image: primaryImage,
    images: productImages,
    category: supabaseProduct.category,
    description: supabaseProduct.description,
    detailed_description: supabaseProduct.detailed_description || enhancements.detailed_description,
    care_instructions: supabaseProduct.care_instructions || enhancements.care_instructions,
    isNew: enhancements.isNew || isNew,
    isSale,
    inStock: supabaseProduct.stock > 0 && supabaseProduct.status === 'active',
    materials: enhancements.materials || ['Handgefertigter Draht'], // Default-Material
    dimensions: enhancements.dimensions || 'Individuelle Größe',
    // Supabase-spezifisch
    image_url: primaryImage,
    stock: supabaseProduct.stock,
    status: supabaseProduct.status,
    created_at: supabaseProduct.created_at,
    updated_at: supabaseProduct.updated_at,
    // Erweiterte Attribute
    customAttributes: enhancements.customAttributes || [],
    colors: enhancements.colors || [],
    sizes: enhancements.sizes || [],
    productDimensions: enhancements.dimensions || [],
    tags: enhancements.tags || [],
    seoTitle: enhancements.seoTitle,
    seoDescription: enhancements.seoDescription,
    salePrice: enhancements.salePrice,
    weight: enhancements.weight,
    careInstructions: supabaseProduct.care_instructions || enhancements.careInstructions,
    giftWrappingAvailable: enhancements.giftWrappingAvailable || false
  };
}

// Lädt alle aktiven Produkte für die Website
export async function getWebsiteProducts(): Promise<WebsiteProduct[]> {
  try {
    const supabaseProducts = await getProducts();
    
    // Nur aktive Produkte für die Website anzeigen (Stock wird nicht mehr als Filter verwendet)
    const activeProducts = supabaseProducts.filter(product => 
      product.status === 'active'
    );
    
    console.log('🌐 Filtered website products:', activeProducts.length, 'active products');
    
    return activeProducts.map(convertToWebsiteProduct);
  } catch (error) {
    console.error('Error loading website products:', error);
    return [];
  }
}

// Lädt einzelnes Produkt für Produktdetailseite (erweitert um statische Produkte)
export async function getWebsiteProduct(id: string): Promise<WebsiteProduct | null> {
  try {
    // Erst in Supabase-Produkten suchen
    const supabaseProducts = await getWebsiteProducts();
    const supabaseProduct = supabaseProducts.find(product => product.id === id);
    
    if (supabaseProduct) {
      return supabaseProduct;
    }
    
    // Dann in statischen Produkten suchen
    const staticProduct = staticProducts.find(product => product.id === id);
    if (staticProduct) {
      return convertStaticToWebsiteProduct(staticProduct);
    }
    
    return null;
  } catch (error) {
    console.error('Error loading website product:', error);
    
    // Fallback: Nur in statischen Produkten suchen
    const staticProduct = staticProducts.find(product => product.id === id);
    if (staticProduct) {
      return convertStaticToWebsiteProduct(staticProduct);
    }
    
    return null;
  }
}

// Lädt Produkte nach Kategorie (erweitert um statische Produkte)
export async function getWebsiteProductsByCategory(category: string): Promise<WebsiteProduct[]> {
  try {
    // Supabase-Produkte
    const supabaseProducts = await getWebsiteProducts();
    
    // Statische Produkte
    const convertedStaticProducts = staticProducts.map(convertStaticToWebsiteProduct);
    
    // Kombiniere beide Datenquellen
    const allProducts = [...supabaseProducts, ...convertedStaticProducts];
    
    if (category === 'all' || category === 'Alle Produkte') {
      return allProducts;
    }
    
    return allProducts.filter(product => product.category === category);
  } catch (error) {
    console.error('Error loading products by category:', error);
    
    // Fallback: Nur statische Produkte
    const convertedStaticProducts = staticProducts.map(convertStaticToWebsiteProduct);
    
    if (category === 'all' || category === 'Alle Produkte') {
      return convertedStaticProducts;
    }
    
    return convertedStaticProducts.filter(product => product.category === category);
  }
}

// Sucht Produkte
export async function searchWebsiteProducts(query: string): Promise<WebsiteProduct[]> {
  try {
    const products = await getWebsiteProducts();
    const lowercaseQuery = query.toLowerCase();
    
    return products.filter(product =>
      product.name.toLowerCase().includes(lowercaseQuery) ||
      product.description.toLowerCase().includes(lowercaseQuery) ||
      product.category.toLowerCase().includes(lowercaseQuery) ||
      (product.materials && product.materials.some(material => 
        material.toLowerCase().includes(lowercaseQuery)
      )) ||
      (product.tags && product.tags.some(tag =>
        tag.toLowerCase().includes(lowercaseQuery)
      )) ||
      (product.customAttributes && product.customAttributes.some(attr =>
        attr.name.toLowerCase().includes(lowercaseQuery) ||
        String(attr.value).toLowerCase().includes(lowercaseQuery)
      ))
    );
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
}

// Hilfsfunktion zum Filtern von Produkten nach Attributen
export async function filterProductsByAttributes(filters: Record<string, any>): Promise<WebsiteProduct[]> {
  try {
    const products = await getWebsiteProducts();
    
    return products.filter(product => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true; // Leere Filter ignorieren
        
        switch (key) {
          case 'category':
            return product.category === value;
          case 'priceRange':
            const [min, max] = value;
            return product.price >= min && product.price <= max;
          case 'materials':
            return product.materials?.some(material => 
              material.toLowerCase().includes(value.toLowerCase())
            );
          case 'sizes':
            return product.sizes?.some(size => size.value === value && size.available);
          case 'colors':
            return product.colors?.some(color => color.name === value && color.available);
          case 'isNew':
            return product.isNew === value;
          case 'isSale':
            return product.isSale === value;
          case 'inStock':
            return product.inStock === value;
          default:
            // Custom Attribute
            return product.customAttributes?.some(attr => 
              attr.name.toLowerCase() === key.toLowerCase() && 
              String(attr.value).toLowerCase().includes(String(value).toLowerCase())
            );
        }
      });
    });
  } catch (error) {
    console.error('Error filtering products by attributes:', error);
    return [];
  }
}

// Export der Admin-Funktionen für Produktmanagement
export { createProduct, updateProduct, deleteProduct };
export type { SupabaseProduct as AdminProduct };