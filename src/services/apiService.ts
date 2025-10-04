/**
 * Elbfunkeln API Service
 * Zentrale API-Kommunikation mit http://api.elbfunkeln.de/api
 */

const API_BASE_URL = 'http://api.elbfunkeln.de/api';

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// Helper function to create headers
const createHeaders = (includeAuth: boolean = false): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
};

// Helper function for API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {},
  requireAuth: boolean = false
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = createHeaders(requireAuth);
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${response.statusText}`);
  }
  
  return response.json();
}

// ============================================================================
// AUTHENTICATION
// ============================================================================

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'CUSTOMER' | 'SHOP_OWNER' | 'ADMIN';
  };
}

export interface UserProfile {
  userId: string;
  email: string;
  role: 'CUSTOMER' | 'SHOP_OWNER' | 'ADMIN';
}

export const authApi = {
  register: (data: RegisterData) =>
    apiCall<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  login: (data: LoginData) =>
    apiCall<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  getProfile: () =>
    apiCall<UserProfile>('/auth/profile', {}, true),
};

// ============================================================================
// PRODUCTS
// ============================================================================

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
}

export interface ProductReview {
  id: string;
  rating: number;
  comment: string;
  userId: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  parentId?: string | null;
  children?: Category[];
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number | null;
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

export interface ProductsResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
}

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  categoryId?: string;
  search?: string;
}

export const productsApi = {
  getAll: (params?: ProductQueryParams) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.categoryId) queryParams.append('categoryId', params.categoryId);
    if (params?.search) queryParams.append('search', params.search);
    
    const queryString = queryParams.toString();
    const endpoint = `/products${queryString ? `?${queryString}` : ''}`;
    
    return apiCall<ProductsResponse>(endpoint);
  },
  
  getFeatured: () =>
    apiCall<ProductsResponse>('/products/featured'),
  
  search: (query: string) =>
    apiCall<ProductsResponse>(`/products/search?q=${encodeURIComponent(query)}`),
  
  getById: (id: string) =>
    apiCall<Product>(`/products/${id}`),
};

// ============================================================================
// CATEGORIES
// ============================================================================

export const categoriesApi = {
  getAll: () =>
    apiCall<Category[]>('/categories'),
  
  getById: (id: string) =>
    apiCall<Category>(`/categories/${id}`),
};

// ============================================================================
// CART
// ============================================================================

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: Product;
  createdAt: string;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}

export interface AddToCartData {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemData {
  quantity: number;
}

export const cartApi = {
  get: () =>
    apiCall<Cart>('/cart', {}, true),
  
  addItem: (data: AddToCartData) =>
    apiCall<CartItem>('/cart/items', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true),
  
  updateItem: (itemId: string, data: UpdateCartItemData) =>
    apiCall<CartItem>(`/cart/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, true),
  
  removeItem: (itemId: string) =>
    apiCall<{ message: string }>(`/cart/items/${itemId}`, {
      method: 'DELETE',
    }, true),
  
  clear: () =>
    apiCall<{ message: string }>('/cart', {
      method: 'DELETE',
    }, true),
};

// ============================================================================
// ORDERS
// ============================================================================

export type OrderStatus = 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
export type ShippingStatus = 'PENDING' | 'LABEL_CREATED' | 'PICKED_UP' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'FAILED';

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product: Product;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  addressId: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  shippingStatus: ShippingStatus;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  notes?: string | null;
  trackingNumber?: string | null;
  stripePaymentId?: string | null;
  discountCode?: string | null;
  items: OrderItem[];
  address: any;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderData {
  addressId: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  notes?: string;
}

export const ordersApi = {
  create: (data: CreateOrderData) =>
    apiCall<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true),
  
  getAll: () =>
    apiCall<Order[]>('/orders', {}, true),
  
  getById: (id: string) =>
    apiCall<Order>(`/orders/${id}`, {}, true),
  
  cancel: (id: string) =>
    apiCall<Order>(`/orders/${id}/cancel`, {
      method: 'PUT',
    }, true),
};

// ============================================================================
// GIFT CARDS
// ============================================================================

export interface GiftCard {
  id: string;
  code: string;
  amount: number;
  balance: number;
  isActive: boolean;
  expiresAt?: string | null;
  createdAt: string;
}

export const giftCardsApi = {
  getByCode: (code: string) =>
    apiCall<GiftCard>(`/gift-cards/${code}`),
};

// ============================================================================
// NEWSLETTER
// ============================================================================

export interface NewsletterSubscription {
  id: string;
  email: string;
  isActive: boolean;
  createdAt: string;
}

export interface SubscribeNewsletterData {
  email: string;
}

export const newsletterApi = {
  subscribe: (data: SubscribeNewsletterData) =>
    apiCall<NewsletterSubscription>('/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  unsubscribe: (email: string) =>
    apiCall<{ message: string }>(`/newsletter/${encodeURIComponent(email)}`, {
      method: 'DELETE',
    }),
};

// ============================================================================
// UTILITIES
// ============================================================================

export const setAuthToken = (token: string) => {
  localStorage.setItem('auth_token', token);
};

export const removeAuthToken = () => {
  localStorage.removeItem('auth_token');
};

export default {
  auth: authApi,
  products: productsApi,
  categories: categoriesApi,
  cart: cartApi,
  orders: ordersApi,
  giftCards: giftCardsApi,
  newsletter: newsletterApi,
  setAuthToken,
  removeAuthToken,
};
