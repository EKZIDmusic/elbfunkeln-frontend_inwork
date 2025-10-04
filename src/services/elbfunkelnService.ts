// Hauptservice für Elbfunkeln E-Commerce Funktionen
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

export interface Order {
  id: string;
  customer_id: string;
  order_number: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method?: string;
  shipping_address_id?: string;
  billing_address_id?: string;
  subtotal: number;
  shipping_cost: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  customer?: any;
  shipping_address?: any;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product?: Product;
}

export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  created_at: string;
  updated_at: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  subscribed_at: string;
  unsubscribed_at?: string;
  is_active: boolean;
  source?: string;
}

class ElbfunkelnService {
  // ===============================================
  // KATEGORIEN
  // ===============================================

  async getCategories(): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    try {
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
    } catch (error) {
      console.error('Error fetching category:', error);
      return null;
    }
  }

  // ===============================================
  // PRODUKTE
  // ===============================================

  async getProducts(options: {
    categoryId?: string;
    limit?: number;
    offset?: number;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
  } = {}): Promise<Product[]> {
    try {
      // First, get products without joins
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

      // Get categories separately
      const categoryIds = [...new Set(products.map(p => p.category_id).filter(Boolean))];
      let categoriesMap: { [key: string]: Category } = {};
      
      if (categoryIds.length > 0) {
        const { data: categories } = await supabase
          .from('categories')
          .select('*')
          .in('id', categoryIds);
        
        if (categories) {
          categoriesMap = categories.reduce((acc, cat) => ({ ...acc, [cat.id]: cat }), {});
        }
      }

      // Get images separately
      const productIds = products.map(p => p.id);
      let imagesMap: { [key: string]: ProductImage[] } = {};

      if (productIds.length > 0) {
        const { data: images } = await supabase
          .from('product_images')
          .select('*')
          .in('product_id', productIds)
          .order('sort_order');
        
        if (images) {
          imagesMap = images.reduce((acc, img) => {
            const productId = img.product_id;
            if (!acc[productId]) acc[productId] = [];
            acc[productId].push(img);
            return acc;
          }, {} as { [key: string]: ProductImage[] });
        }
      }

      // Combine data
      const enrichedProducts = products.map(product => ({
        ...product,
        category: categoriesMap[product.category_id] || null,
        images: (imagesMap[product.id] || []).sort((a: ProductImage, b: ProductImage) => {
          if (a.is_primary && !b.is_primary) return -1;
          if (!a.is_primary && b.is_primary) return 1;
          return a.sort_order - b.sort_order;
        })
      }));

      return enrichedProducts;
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }

  async getProductById(id: string): Promise<Product | null> {
    try {
      // Get product first
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

      // Get category separately
      let category = null;
      if (product.category_id) {
        const { data: categoryData } = await supabase
          .from('categories')
          .select('*')
          .eq('id', product.category_id)
          .single();
        category = categoryData;
      }

      // Get images separately
      const { data: images } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', id)
        .order('sort_order');

      // Sort images
      const sortedImages = (images || []).sort((a: ProductImage, b: ProductImage) => {
        if (a.is_primary && !b.is_primary) return -1;
        if (!a.is_primary && b.is_primary) return 1;
        return a.sort_order - b.sort_order;
      });

      return {
        ...product,
        category,
        images: sortedImages
      };
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  }

  async getProductBySku(sku: string): Promise<Product | null> {
    try {
      // Get product first
      const { data: product, error } = await supabase
        .from('products')
        .select('*')
        .eq('sku', sku)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      if (!product) return null;

      // Get category separately
      let category = null;
      if (product.category_id) {
        const { data: categoryData } = await supabase
          .from('categories')
          .select('*')
          .eq('id', product.category_id)
          .single();
        category = categoryData;
      }

      // Get images separately
      const { data: images } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', product.id)
        .order('sort_order');

      return {
        ...product,
        category,
        images: images || []
      };
    } catch (error) {
      console.error('Error fetching product by SKU:', error);
      return null;
    }
  }

  async getFeaturedProducts(limit: number = 6): Promise<Product[]> {
    // Für jetzt nehmen wir die neuesten Produkte
    return this.getProducts({ limit });
  }

  async getRelatedProducts(productId: string, categoryId: string, limit: number = 4): Promise<Product[]> {
    try {
      const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', categoryId)
        .eq('is_active', true)
        .neq('id', productId)
        .limit(limit);

      if (error) throw error;
      if (!products || products.length === 0) return [];

      // Get category
      let category = null;
      if (categoryId) {
        const { data: categoryData } = await supabase
          .from('categories')
          .select('*')
          .eq('id', categoryId)
          .single();
        category = categoryData;
      }

      // Get images for all products
      const productIds = products.map(p => p.id);
      let imagesMap: { [key: string]: ProductImage[] } = {};

      if (productIds.length > 0) {
        const { data: images } = await supabase
          .from('product_images')
          .select('*')
          .in('product_id', productIds)
          .order('sort_order');
        
        if (images) {
          imagesMap = images.reduce((acc, img) => {
            const productId = img.product_id;
            if (!acc[productId]) acc[productId] = [];
            acc[productId].push(img);
            return acc;
          }, {} as { [key: string]: ProductImage[] });
        }
      }

      return products.map(product => ({
        ...product,
        category,
        images: imagesMap[product.id] || []
      }));
    } catch (error) {
      console.error('Error fetching related products:', error);
      return [];
    }
  }

  // ===============================================
  // BESTELLUNGEN
  // ===============================================

  async createOrder(orderData: {
    customer_id: string;
    items: Array<{ product_id: string; quantity: number; unit_price: number }>;
    shipping_address_id?: string;
    billing_address_id?: string;
    payment_method?: string;
    notes?: string;
  }): Promise<Order | null> {
    try {
      // Calculate totals
      const subtotal = orderData.items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
      const shipping_cost = subtotal >= 75 ? 0 : 4.99; // Free shipping over 75€
      const tax_amount = subtotal * 0.19; // 19% VAT
      const total_amount = subtotal + shipping_cost + tax_amount;

      // Generate order number
      const order_number = `ELB-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          customer_id: orderData.customer_id,
          order_number,
          status: 'pending',
          payment_status: 'pending',
          payment_method: orderData.payment_method,
          shipping_address_id: orderData.shipping_address_id,
          billing_address_id: orderData.billing_address_id,
          subtotal,
          shipping_cost,
          tax_amount,
          total_amount,
          currency: 'EUR',
          notes: orderData.notes
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = orderData.items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.unit_price * item.quantity
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      toast.success('Bestellung wurde erfolgreich erstellt!');
      return order;
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Fehler beim Erstellen der Bestellung');
      return null;
    }
  }

  async getOrdersByCustomer(customerId: string): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(
            *,
            product:products(name, sku, images:product_images(*))
          )
        `)
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching customer orders:', error);
      return [];
    }
  }

  async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(
            *,
            product:products(*)
          ),
          customer:user_profiles(*),
          shipping_address:user_addresses!shipping_address_id(*),
          billing_address:user_addresses!billing_address_id(*)
        `)
        .eq('id', orderId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error fetching order:', error);
      return null;
    }
  }

  // ===============================================
  // KONTAKT & NEWSLETTER
  // ===============================================

  async createContactInquiry(inquiry: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('contact_inquiries')
        .insert([{
          ...inquiry,
          status: 'open'
        }]);

      if (error) throw error;
      
      toast.success('Ihre Nachricht wurde erfolgreich gesendet!');
      return true;
    } catch (error) {
      console.error('Error creating contact inquiry:', error);
      toast.error('Fehler beim Senden der Nachricht');
      return false;
    }
  }

  async subscribeToNewsletter(subscription: {
    email: string;
    first_name?: string;
    last_name?: string;
    source?: string;
  }): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert([{
          ...subscription,
          subscribed_at: new Date().toISOString(),
          is_active: true
        }]);

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast.info('Sie sind bereits für unseren Newsletter angemeldet!');
          return true;
        }
        throw error;
      }
      
      toast.success('Erfolgreich für den Newsletter angemeldet!');
      return true;
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      toast.error('Fehler bei der Newsletter-Anmeldung');
      return false;
    }
  }

  async unsubscribeFromNewsletter(email: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .update({
          is_active: false,
          unsubscribed_at: new Date().toISOString()
        })
        .eq('email', email);

      if (error) throw error;
      
      toast.success('Sie wurden erfolgreich vom Newsletter abgemeldet');
      return true;
    } catch (error) {
      console.error('Error unsubscribing from newsletter:', error);
      toast.error('Fehler beim Abmelden vom Newsletter');
      return false;
    }
  }

  // ===============================================
  // ADMIN FUNKTIONEN
  // ===============================================

  async getAllOrders(): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customer:user_profiles(first_name, last_name, display_name),
          items:order_items(
            *,
            product:products(name, sku)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching all orders:', error);
      return [];
    }
  }

  async getContactInquiries(): Promise<ContactInquiry[]> {
    try {
      const { data, error } = await supabase
        .from('contact_inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching contact inquiries:', error);
      return [];
    }
  }

  async getNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
    try {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .eq('is_active', true)
        .order('subscribed_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching newsletter subscribers:', error);
      return [];
    }
  }

  async updateOrderStatus(orderId: string, status: Order['status']): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;
      
      toast.success('Bestellstatus wurde aktualisiert');
      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Fehler beim Aktualisieren des Bestellstatus');
      return false;
    }
  }

  // ===============================================
  // STATISTIKEN
  // ===============================================

  async getShopStats(): Promise<{
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    newsletterSubscribers: number;
    pendingInquiries: number;
  }> {
    try {
      const [
        { count: totalProducts },
        { count: totalOrders },
        { data: orders },
        { count: newsletterSubscribers },
        { count: pendingInquiries }
      ] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('total_amount').eq('payment_status', 'paid'),
        supabase.from('newsletter_subscribers').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('contact_inquiries').select('*', { count: 'exact', head: true }).eq('status', 'open')
      ]);

      const totalRevenue = (orders || []).reduce((sum, order) => sum + order.total_amount, 0);

      return {
        totalProducts: totalProducts || 0,
        totalOrders: totalOrders || 0,
        totalRevenue,
        newsletterSubscribers: newsletterSubscribers || 0,
        pendingInquiries: pendingInquiries || 0
      };
    } catch (error) {
      console.error('Error fetching shop stats:', error);
      return {
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        newsletterSubscribers: 0,
        pendingInquiries: 0
      };
    }
  }
}

export const elbfunkelnService = new ElbfunkelnService();