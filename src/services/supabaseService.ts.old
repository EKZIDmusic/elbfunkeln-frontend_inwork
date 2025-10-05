import { supabase } from '../utils/supabase/client';
import { 
  productErrorHandler, 
  orderErrorHandler, 
  userErrorHandler, 
  newsletterErrorHandler 
} from '../utils/supabase/errorHandler';

// Types
export interface Product {
  id: string;
  name: string;
  description: string;
  detailed_description?: string;
  care_instructions?: string;
  price: number;
  image_url: string;
  category: string;
  stock: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'shopowner' | 'admin';
  status: 'active' | 'inactive' | 'banned';
  email_verified: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
  login_attempts: number;
  banned_until?: string | null;
  banned_reason?: string | null;
  total_orders: number;
  total_spent: number;
}

export interface Newsletter {
  id: string;
  email: string;
  name?: string;
  status: 'subscribed' | 'unsubscribed';
  subscribed_at: string;
  source: string;
}

// Demo Data with graceful fallbacks
const demoProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Elegante Draht-Ohrringe "Morgentau"',
    description: 'Handgefertigte Ohrringe aus feinem Silberdraht mit Glasperlen',
    detailed_description: 'Diese Ohrringe sind nicht nur schön, sondern auch sehr komfortabel.',
    care_instructions: 'Wischen Sie die Ohrringe mit einem feinen Tuch.',
    price: 45.99,
    image_url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=300&q=80',
    category: 'Ohrringe',
    stock: 15,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'prod-2',
    name: 'Zarter Draht-Ring "Blütentanz"',
    description: 'Filigraner Ring aus vergoldetem Kupferdraht',
    price: 32.50,
    image_url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=300&q=80',
    category: 'Ringe',
    stock: 8,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'prod-3',
    name: 'Armband "Vintage Dreams"',
    description: 'Nostalgisches Armband mit Drahtgeflecht und Vintage-Perlen',
    price: 58.00,
    image_url: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=300&q=80',
    category: 'Armbänder',
    stock: 12,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const demoUsers: User[] = [
  {
    id: 'admin-1',
    email: 'admin@elbfunkeln.de',
    name: 'System Administrator',
    role: 'admin',
    status: 'active',
    email_verified: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_login: new Date().toISOString(),
    login_attempts: 0,
    banned_until: null,
    banned_reason: null,
    total_orders: 0,
    total_spent: 0
  },
  {
    id: 'owner-1',
    email: 'owner@elbfunkeln.de',
    name: 'Anna Schmidt',
    role: 'shopowner',
    status: 'active',
    email_verified: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_login: new Date().toISOString(),
    login_attempts: 0,
    banned_until: null,
    banned_reason: null,
    total_orders: 15,
    total_spent: 1250.80
  },
  {
    id: 'customer-1',
    email: 'sarah.mueller@example.com',
    name: 'Sarah Müller',
    role: 'customer',
    status: 'active',
    email_verified: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_login: new Date().toISOString(),
    login_attempts: 0,
    banned_until: null,
    banned_reason: null,
    total_orders: 3,
    total_spent: 189.50
  }
];

const demoOrders: Order[] = [
  {
    id: 'order-1',
    customer_id: 'customer-1',
    customer_name: 'Sarah Müller',
    customer_email: 'sarah.mueller@example.com',
    status: 'delivered',
    total: 45.99,
    items: [{
      product_id: 'prod-1',
      product_name: 'Elegante Draht-Ohrringe "Morgentau"',
      quantity: 1,
      price: 45.99
    }],
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    updated_at: new Date().toISOString()
  },
  {
    id: 'order-2',
    customer_id: 'customer-1',
    customer_name: 'Sarah Müller',
    customer_email: 'sarah.mueller@example.com',
    status: 'processing',
    total: 90.50,
    items: [
      {
        product_id: 'prod-2',
        product_name: 'Zarter Draht-Ring "Blütentanz"',
        quantity: 1,
        price: 32.50
      },
      {
        product_id: 'prod-3',
        product_name: 'Armband "Vintage Dreams"',
        quantity: 1,
        price: 58.00
      }
    ],
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    updated_at: new Date().toISOString()
  }
];

const demoNewsletterSubscribers: Newsletter[] = [
  {
    id: 'news-1',
    email: 'sarah.mueller@example.com',
    name: 'Sarah Müller',
    status: 'subscribed',
    subscribed_at: new Date().toISOString(),
    source: 'website'
  },
  {
    id: 'news-2',
    email: 'maria.wagner@example.com',
    name: 'Maria Wagner',
    status: 'subscribed',
    subscribed_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    source: 'facebook'
  }
];

// Local storage helpers for graceful fallback
const getFromStorage = (key: string): any => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const setToStorage = (key: string, value: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to storage:', error);
  }
};

// Helper to handle Supabase errors gracefully
const handleSupabaseError = (error: any, fallbackData: any, operation: string) => {
  console.warn(`Supabase error in ${operation}, using fallback data:`, error);
  return fallbackData;
};

// Service Functions with Graceful Fallbacks

// Products
export async function getProducts(): Promise<Product[]> {
  try {
    // Try to get from local storage first
    const stored = getFromStorage('elbfunkeln:products');
    if (stored) {
      console.log('📦 Products from localStorage:', stored);
      return stored;
    }

    // Try Supabase with fallback - check if table exists
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*');

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        // Filter active products if status column exists
        const activeProducts = data.filter(product => !product.hasOwnProperty('status') || product.status === 'active');
        console.log('📦 Products from Supabase:', activeProducts);
        return activeProducts;
      }
    } catch (supabaseError) {
      productErrorHandler(supabaseError);
    }
    
    // Fallback to demo data and store it
    setToStorage('elbfunkeln:products', demoProducts);
    console.log('📦 Using demo products:', demoProducts);
    return demoProducts;
  } catch (error) {
    console.error('Error getting products:', error);
    return demoProducts;
  }
}

export async function createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
  try {
    const newProduct: Product = {
      ...product,
      id: `prod-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Try Supabase first
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([newProduct])
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        return data;
      }
    } catch (supabaseError) {
      console.warn('Supabase product creation failed, using localStorage:', supabaseError);
    }
    
    // Fallback to localStorage
    const products = await getProducts();
    const updatedProducts = [newProduct, ...products];
    setToStorage('elbfunkeln:products', updatedProducts);
    
    return newProduct;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
  try {
    const updatedData = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    // Try Supabase first
    try {
      const { data, error } = await supabase
        .from('products')
        .update(updatedData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        return data;
      }
    } catch (supabaseError) {
      console.warn('Supabase product update failed, using localStorage:', supabaseError);
    }

    // Fallback to localStorage
    const products = await getProducts();
    const index = products.findIndex(p => p.id === id);
    
    if (index === -1) {
      throw new Error('Product not found');
    }
    
    const updatedProduct = {
      ...products[index],
      ...updatedData
    };
    
    products[index] = updatedProduct;
    setToStorage('elbfunkeln:products', products);
    
    return updatedProduct;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
}

export async function deleteProduct(id: string): Promise<void> {
  try {
    // Try Supabase first
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }
      return;
    } catch (supabaseError) {
      console.warn('Supabase product deletion failed, using localStorage:', supabaseError);
    }

    // Fallback to localStorage
    const products = await getProducts();
    const filteredProducts = products.filter(p => p.id !== id);
    setToStorage('elbfunkeln:products', filteredProducts);
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
}

// Orders
export async function getOrders(): Promise<Order[]> {
  try {
    const stored = getFromStorage('elbfunkeln:orders');
    if (stored) {
      return stored;
    }

    // Try Supabase with fallback - check if table exists
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*');

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        return data;
      }
    } catch (supabaseError) {
      orderErrorHandler(supabaseError);
    }
    
    setToStorage('elbfunkeln:orders', demoOrders);
    return demoOrders;
  } catch (error) {
    console.error('Error getting orders:', error);
    return demoOrders;
  }
}

export async function updateOrderStatus(id: string, status: Order['status']): Promise<Order> {
  try {
    const updatedData = {
      status,
      updated_at: new Date().toISOString()
    };

    // Try Supabase first
    try {
      const { data, error } = await supabase
        .from('orders')
        .update(updatedData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        return data;
      }
    } catch (supabaseError) {
      console.warn('Supabase order update failed, using localStorage:', supabaseError);
    }

    // Fallback to localStorage
    const orders = await getOrders();
    const index = orders.findIndex(o => o.id === id);
    
    if (index === -1) {
      throw new Error('Order not found');
    }
    
    const updatedOrder = {
      ...orders[index],
      ...updatedData
    };
    
    orders[index] = updatedOrder;
    setToStorage('elbfunkeln:orders', orders);
    
    return updatedOrder;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
}

// Users
export async function getUsers(): Promise<User[]> {
  try {
    const stored = getFromStorage('elbfunkeln:users');
    if (stored) {
      return stored;
    }

    // Try Supabase with fallback
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*');

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        return data;
      }
    } catch (supabaseError) {
      userErrorHandler(supabaseError);
    }
    
    setToStorage('elbfunkeln:users', demoUsers);
    return demoUsers;
  } catch (error) {
    console.error('Error getting users:', error);
    return demoUsers;
  }
}

export async function getUserStats() {
  try {
    const users = await getUsers();
    
    return {
      total: users.length,
      active: users.filter(u => u.status === 'active').length,
      inactive: users.filter(u => u.status === 'inactive').length,
      banned: users.filter(u => u.status === 'banned').length,
      newThisMonth: users.filter(u => {
        const userDate = new Date(u.created_at);
        const now = new Date();
        return userDate.getMonth() === now.getMonth() && userDate.getFullYear() === now.getFullYear();
      }).length,
      byRole: {
        admin: users.filter(u => u.role === 'admin').length,
        shopowner: users.filter(u => u.role === 'shopowner').length,
        customer: users.filter(u => u.role === 'customer').length,
      }
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    return {
      total: 0,
      active: 0,
      inactive: 0,
      banned: 0,
      newThisMonth: 0,
      byRole: { admin: 0, shopowner: 0, customer: 0 }
    };
  }
}

// Newsletter
export async function getNewsletterSubscribers(): Promise<Newsletter[]> {
  try {
    const stored = getFromStorage('elbfunkeln:newsletter');
    if (stored) {
      return stored;
    }

    // Try Supabase with fallback - check if table exists
    try {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('*');

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        // Filter by status if column exists, otherwise return all
        const activeSubscribers = data.filter(sub => !sub.hasOwnProperty('is_active') || sub.is_active !== false);
        return activeSubscribers;
      }
    } catch (supabaseError) {
      newsletterErrorHandler(supabaseError);
    }
    
    setToStorage('elbfunkeln:newsletter', demoNewsletterSubscribers);
    return demoNewsletterSubscribers;
  } catch (error) {
    console.error('Error getting newsletter subscribers:', error);
    return demoNewsletterSubscribers;
  }
}

export async function addNewsletterSubscriber(email: string, name?: string, source: string = 'website'): Promise<Newsletter> {
  try {
    const newSubscriber: Newsletter = {
      id: `news-${Date.now()}`,
      email,
      name,
      status: 'subscribed',
      subscribed_at: new Date().toISOString(),
      source
    };

    // Try Supabase first
    try {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .insert([newSubscriber])
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        return data;
      }
    } catch (supabaseError) {
      console.warn('Supabase newsletter subscription failed, using localStorage:', supabaseError);
    }

    // Fallback to localStorage
    const subscribers = await getNewsletterSubscribers();
    
    // Check if already subscribed
    const existing = subscribers.find(s => s.email === email);
    if (existing) {
      throw new Error('Email already subscribed');
    }
    
    const updatedSubscribers = [newSubscriber, ...subscribers];
    setToStorage('elbfunkeln:newsletter', updatedSubscribers);
    
    return newSubscriber;
  } catch (error) {
    console.error('Error adding newsletter subscriber:', error);
    throw error;
  }
}

// Analytics
export async function getAnalyticsData() {
  try {
    const [products, orders, users, newsletter] = await Promise.all([
      getProducts(),
      getOrders(),
      getUsers(),
      getNewsletterSubscribers()
    ]);

    const now = new Date();
    const thisMonth = orders.filter(o => {
      const orderDate = new Date(o.created_at);
      return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
    });

    const lastMonth = orders.filter(o => {
      const orderDate = new Date(o.created_at);
      const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1);
      return orderDate.getMonth() === lastMonthDate.getMonth() && orderDate.getFullYear() === lastMonthDate.getFullYear();
    });

    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const thisMonthRevenue = thisMonth.reduce((sum, order) => sum + order.total, 0);
    const lastMonthRevenue = lastMonth.reduce((sum, order) => sum + order.total, 0);

    return {
      overview: {
        totalRevenue,
        totalOrders: orders.length,
        totalProducts: products.length,
        totalCustomers: users.filter(u => u.role === 'customer').length,
        revenueChange: lastMonthRevenue > 0 ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100) : 0,
        ordersChange: lastMonth.length > 0 ? ((thisMonth.length - lastMonth.length) / lastMonth.length * 100) : 0
      },
      recentOrders: orders.slice(0, 5),
      topProducts: products.slice(0, 3),
      newsletterSubscribers: newsletter.length
    };
  } catch (error) {
    console.error('Error getting analytics data:', error);
    return {
      overview: {
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: 0,
        totalCustomers: 0,
        revenueChange: 0,
        ordersChange: 0
      },
      recentOrders: [],
      topProducts: [],
      newsletterSubscribers: 0
    };
  }
}