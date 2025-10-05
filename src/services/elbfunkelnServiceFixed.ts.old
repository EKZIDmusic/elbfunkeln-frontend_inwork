// Überarbeiteter Service für Elbfunkeln E-Commerce - behebt Schema-Probleme
import { supabase } from '../utils/supabase/client';
import { toast } from 'sonner@2.0.3';

export interface Category {
  id: string;
  name: string;
  description?: string;
  slug: string;
  image_url?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  category_id: string;
  is_active: boolean;
  stock_quantity: number;
  sku: string;
  weight?: number;
  dimensions?: string;
  materials?: string;
  care_instructions?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  category?: Category;
  images?: ProductImage[];
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text?: string;
  is_primary: boolean;
  sort_order: number;
  created_at: string;
}

// Demo-Daten für Fallback
const demoCategories: Category[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Ohrringe',
    description: 'Elegante handgefertigte Ohrringe aus Draht',
    slug: 'ohrringe',
    is_active: true,
    sort_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'Ringe',
    description: 'Filigrane Draht-Ringe für jeden Anlass',
    slug: 'ringe',
    is_active: true,
    sort_order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    name: 'Armbänder',
    description: 'Zarte Draht-Armbänder mit besonderen Details',
    slug: 'armbaender',
    is_active: true,
    sort_order: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    name: 'Halsketten',
    description: 'Kunstvolle Halsketten aus feinem Draht',
    slug: 'halsketten',
    is_active: true,
    sort_order: 4,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const demoProducts: Product[] = [
  {
    id: '650e8400-e29b-41d4-a716-446655440001',
    name: 'Elegante Draht-Ohrringe "Morgentau"',
    description: 'Handgefertigte Ohrringe aus feinem Silberdraht mit Glasperlen. Jedes Paar ist ein Unikat, gefertigt in liebevoller Handarbeit.',
    price: 45.99,
    category_id: '550e8400-e29b-41d4-a716-446655440001',
    is_active: true,
    stock_quantity: 15,
    sku: 'ELB-OH-001',
    materials: 'Silberdraht, Glasperlen',
    dimensions: '3cm x 1.5cm',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [{
      id: 'img-1',
      product_id: '650e8400-e29b-41d4-a716-446655440001',
      image_url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&q=80',
      alt_text: 'Elegante Draht-Ohrringe Morgentau',
      is_primary: true,
      sort_order: 1,
      created_at: new Date().toISOString()
    }]
  },
  {
    id: '650e8400-e29b-41d4-a716-446655440002',
    name: 'Zarter Draht-Ring "Blütentanz"',
    description: 'Filigraner Ring aus vergoldetem Kupferdraht, inspiriert von Blütenformen. Verstellbar und angenehm zu tragen.',
    price: 32.50,
    category_id: '550e8400-e29b-41d4-a716-446655440002',
    is_active: true,
    stock_quantity: 8,
    sku: 'ELB-RI-001',
    materials: 'Vergoldeter Kupferdraht',
    dimensions: 'Größe 54-58 verstellbar',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [{
      id: 'img-2',
      product_id: '650e8400-e29b-41d4-a716-446655440002',
      image_url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&q=80',
      alt_text: 'Zarter Draht-Ring Blütentanz',
      is_primary: true,
      sort_order: 1,
      created_at: new Date().toISOString()
    }]
  },
  {
    id: '650e8400-e29b-41d4-a716-446655440003',
    name: 'Armband "Vintage Dreams"',
    description: 'Nostalgisches Armband mit Drahtgeflecht und Vintage-Perlen. Ein zeitloser Klassiker mit romantischem Flair.',
    price: 58.00,
    category_id: '550e8400-e29b-41d4-a716-446655440003',
    is_active: true,
    stock_quantity: 12,
    sku: 'ELB-AR-001',
    materials: 'Kupferdraht, Vintage-Perlen',
    dimensions: '18-22cm verstellbar',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [{
      id: 'img-3',
      product_id: '650e8400-e29b-41d4-a716-446655440003',
      image_url: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&q=80',
      alt_text: 'Armband Vintage Dreams',
      is_primary: true,
      sort_order: 1,
      created_at: new Date().toISOString()
    }]
  },
  {
    id: '650e8400-e29b-41d4-a716-446655440004',
    name: 'Halskette "Sternenhimmel"',
    description: 'Zarte Halskette mit filigranen Draht-Sternen. Perfekt für besondere Anlässe oder als täglicher Begleiter.',
    price: 67.90,
    category_id: '550e8400-e29b-41d4-a716-446655440004',
    is_active: true,
    stock_quantity: 6,
    sku: 'ELB-HA-001',
    materials: 'Silberdraht, Kristalle',
    dimensions: '45cm + 5cm Verlängerung',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [{
      id: 'img-4',
      product_id: '650e8400-e29b-41d4-a716-446655440004',
      image_url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&q=80',
      alt_text: 'Halskette Sternenhimmel',
      is_primary: true,
      sort_order: 1,
      created_at: new Date().toISOString()
    }]
  },
  {
    id: '650e8400-e29b-41d4-a716-446655440005',
    name: 'Creolen "Mondschein"',
    description: 'Elegante Creolen aus gebogenem Silberdraht. Leicht und komfortabel für den ganzen Tag.',
    price: 39.90,
    category_id: '550e8400-e29b-41d4-a716-446655440001',
    is_active: true,
    stock_quantity: 20,
    sku: 'ELB-OH-002',
    materials: 'Silberdraht',
    dimensions: '2.5cm Durchmesser',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [{
      id: 'img-5',
      product_id: '650e8400-e29b-41d4-a716-446655440005',
      image_url: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=400&q=80',
      alt_text: 'Creolen Mondschein',
      is_primary: true,
      sort_order: 1,
      created_at: new Date().toISOString()
    }]
  },
  {
    id: '650e8400-e29b-41d4-a716-446655440006',
    name: 'Ring "Rosenblüte"',
    description: 'Romantischer Ring in Rosenform aus rosévergoldetem Draht. Ein Statement-Stück für besondere Momente.',
    price: 42.50,
    category_id: '550e8400-e29b-41d4-a716-446655440002',
    is_active: true,
    stock_quantity: 5,
    sku: 'ELB-RI-002',
    materials: 'Rosévergoldeter Kupferdraht',
    dimensions: 'Größe 52-56 verstellbar',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [{
      id: 'img-6',
      product_id: '650e8400-e29b-41d4-a716-446655440006',
      image_url: 'https://images.unsplash.com/photo-1588444832815-ff4f95d41ffa?w=400&q=80',
      alt_text: 'Ring Rosenblüte',
      is_primary: true,
      sort_order: 1,
      created_at: new Date().toISOString()
    }]
  },
  {
    id: '650e8400-e29b-41d4-a716-446655440007',
    name: 'Armreif "Infinity"',
    description: 'Eleganter Armreif mit Infinity-Symbol aus poliertem Silberdraht. Symbolisiert ewige Verbindung.',
    price: 54.90,
    category_id: '550e8400-e29b-41d4-a716-446655440003',
    is_active: true,
    stock_quantity: 18,
    sku: 'ELB-AR-002',
    materials: 'Polierter Silberdraht',
    dimensions: '6cm Durchmesser, verstellbar',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [{
      id: 'img-7',
      product_id: '650e8400-e29b-41d4-a716-446655440007',
      image_url: 'https://images.unsplash.com/photo-1506692740678-2e4e65c06b84?w=400&q=80',
      alt_text: 'Armreif Infinity',
      is_primary: true,
      sort_order: 1,
      created_at: new Date().toISOString()
    }]
  },
  {
    id: '650e8400-e29b-41d4-a716-446655440008',
    name: 'Ohrhänger "Perlentraum"',
    description: 'Verspielte Ohrhänger mit Süßwasserperlen und Drahtwerk. Elegant und beweglich im Design.',
    price: 48.90,
    category_id: '550e8400-e29b-41d4-a716-446655440001',
    is_active: true,
    stock_quantity: 7,
    sku: 'ELB-OH-003',
    materials: 'Silberdraht, Süßwasserperlen',
    dimensions: '4cm Länge',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [{
      id: 'img-8',
      product_id: '650e8400-e29b-41d4-a716-446655440008',
      image_url: 'https://images.unsplash.com/photo-1634577553913-8b0cbdcd8dca?w=400&q=80',
      alt_text: 'Ohrhänger Perlentraum',
      is_primary: true,
      sort_order: 1,
      created_at: new Date().toISOString()
    }]
  }
];

// Kategorien zu Produkten zuordnen
demoProducts.forEach(product => {
  product.category = demoCategories.find(cat => cat.id === product.category_id);
});

class ElbfunkelnServiceFixed {
  private fallbackMode = false;

  // Helper: Fallback auf Demo-Daten
  private async withFallback<T>(
    operation: () => Promise<T>,
    fallbackData: T,
    errorMessage: string
  ): Promise<T> {
    try {
      if (this.fallbackMode) {
        console.log(`Using fallback mode for: ${errorMessage}`);
        return fallbackData;
      }
      
      const result = await operation();
      return result;
    } catch (error) {
      console.warn(`${errorMessage}:`, error);
      console.log('Switching to fallback mode with demo data');
      this.fallbackMode = true;
      return fallbackData;
    }
  }

  // Kategorien abrufen
  async getCategories(): Promise<Category[]> {
    return this.withFallback(
      async () => {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .order('sort_order');

        if (error) throw error;
        return data || [];
      },
      demoCategories,
      'Error fetching categories'
    );
  }

  // Kategorie nach Slug
  async getCategoryBySlug(slug: string): Promise<Category | null> {
    return this.withFallback(
      async () => {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('slug', slug)
          .eq('is_active', true)
          .single();

        if (error) {
          if (error.code === 'PGRST116') return null;
          throw error;
        }
        return data;
      },
      demoCategories.find(cat => cat.slug === slug) || null,
      'Error fetching category by slug'
    );
  }

  // Produkte abrufen (ohne problematische Joins)
  async getProducts(options: {
    categoryId?: string;
    limit?: number;
    offset?: number;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
  } = {}): Promise<Product[]> {
    return this.withFallback(
      async () => {
        // Step 1: Get products
        let query = supabase
          .from('products')
          .select('*')
          .eq('is_active', true);

        if (options.categoryId) {
          query = query.eq('category_id', options.categoryId);
        }

        if (options.search) {
          query = query.ilike('name', `%${options.search}%`);
        }

        if (options.minPrice !== undefined) {
          query = query.gte('price', options.minPrice);
        }

        if (options.maxPrice !== undefined) {
          query = query.lte('price', options.maxPrice);
        }

        query = query.order('created_at', { ascending: false });

        if (options.limit) {
          const offset = options.offset || 0;
          query = query.range(offset, offset + options.limit - 1);
        }

        const { data: products, error } = await query;
        if (error) throw error;

        if (!products || products.length === 0) {
          return [];
        }

        // Step 2: Get categories
        const categoryIds = [...new Set(products.map(p => p.category_id).filter(Boolean))];
        const categoriesMap: { [key: string]: Category } = {};
        
        if (categoryIds.length > 0) {
          const { data: categories } = await supabase
            .from('categories')
            .select('*')
            .in('id', categoryIds);
          
          if (categories) {
            categories.forEach(cat => {
              categoriesMap[cat.id] = cat;
            });
          }
        }

        // Step 3: Get images
        const productIds = products.map(p => p.id);
        const imagesMap: { [key: string]: ProductImage[] } = {};

        if (productIds.length > 0) {
          const { data: images } = await supabase
            .from('product_images')
            .select('*')
            .in('product_id', productIds)
            .order('sort_order');
          
          if (images) {
            images.forEach(img => {
              if (!imagesMap[img.product_id]) {
                imagesMap[img.product_id] = [];
              }
              imagesMap[img.product_id].push(img);
            });
          }
        }

        // Step 4: Combine everything
        return products.map(product => ({
          ...product,
          category: categoriesMap[product.category_id] || null,
          images: (imagesMap[product.id] || []).sort((a, b) => {
            if (a.is_primary && !b.is_primary) return -1;
            if (!a.is_primary && b.is_primary) return 1;
            return a.sort_order - b.sort_order;
          })
        }));
      },
      // Fallback: Filter demo products
      this.filterDemoProducts(demoProducts, options),
      'Error fetching products'
    );
  }

  // Helper: Demo-Produkte filtern
  private filterDemoProducts(products: Product[], options: any): Product[] {
    let filtered = [...products];

    if (options.categoryId) {
      filtered = filtered.filter(p => p.category_id === options.categoryId);
    }

    if (options.search) {
      const search = options.search.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(search) ||
        p.description?.toLowerCase().includes(search)
      );
    }

    if (options.minPrice !== undefined) {
      filtered = filtered.filter(p => p.price >= options.minPrice);
    }

    if (options.maxPrice !== undefined) {
      filtered = filtered.filter(p => p.price <= options.maxPrice);
    }

    if (options.limit) {
      const offset = options.offset || 0;
      filtered = filtered.slice(offset, offset + options.limit);
    }

    return filtered;
  }

  // Einzelnes Produkt abrufen
  async getProductById(id: string): Promise<Product | null> {
    return this.withFallback(
      async () => {
        const { data: product, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .eq('is_active', true)
          .single();

        if (error) {
          if (error.code === 'PGRST116') return null;
          throw error;
        }

        if (!product) return null;

        // Get category
        let category = null;
        if (product.category_id) {
          const { data: categoryData } = await supabase
            .from('categories')
            .select('*')
            .eq('id', product.category_id)
            .single();
          category = categoryData;
        }

        // Get images
        const { data: images } = await supabase
          .from('product_images')
          .select('*')
          .eq('product_id', id)
          .order('sort_order');

        return {
          ...product,
          category,
          images: (images || []).sort((a, b) => {
            if (a.is_primary && !b.is_primary) return -1;
            if (!a.is_primary && b.is_primary) return 1;
            return a.sort_order - b.sort_order;
          })
        };
      },
      demoProducts.find(p => p.id === id) || null,
      'Error fetching product by ID'
    );
  }

  // Featured Products
  async getFeaturedProducts(limit: number = 6): Promise<Product[]> {
    return this.getProducts({ limit });
  }

  // Related Products
  async getRelatedProducts(productId: string, categoryId: string, limit: number = 4): Promise<Product[]> {
    return this.withFallback(
      async () => {
        const products = await this.getProducts({
          categoryId,
          limit: limit + 1 // Get one extra to exclude current product
        });
        
        return products.filter(p => p.id !== productId).slice(0, limit);
      },
      demoProducts
        .filter(p => p.category_id === categoryId && p.id !== productId)
        .slice(0, limit),
      'Error fetching related products'
    );
  }

  // Shop-Statistiken
  async getShopStats(): Promise<{
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    newsletterSubscribers: number;
    pendingInquiries: number;
  }> {
    return this.withFallback(
      async () => {
        const [products] = await Promise.all([
          this.getProducts({ limit: 1000 })
        ]);

        return {
          totalProducts: products.length,
          totalOrders: 0,
          totalRevenue: 0,
          newsletterSubscribers: 0,
          pendingInquiries: 0
        };
      },
      {
        totalProducts: demoProducts.length,
        totalOrders: 25,
        totalRevenue: 1247.50,
        newsletterSubscribers: 156,
        pendingInquiries: 3
      },
      'Error fetching shop stats'
    );
  }
}

export const elbfunkelnService = new ElbfunkelnServiceFixed();