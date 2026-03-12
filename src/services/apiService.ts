/**
 * Elbfunkeln API Service
 * Zentrale API-Kommunikation mit https://api.elbfunkeln.de/api
 * MariaDB Backend via NestJS + Prisma
 */

const API_BASE_URL = 'https://api.elbfunkeln.de/api';

// Helper function to get auth token
const getAuthToken = (): string | null => {
  const token = localStorage.getItem('auth_token');
  console.log('📍 getAuthToken called, token exists:', !!token);
  return token;
};

// Helper function to create headers
const createHeaders = (includeAuth: boolean = false): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = getAuthToken();
    console.log('🔑 Creating headers with auth. Token:', token ? `${token.substring(0, 20)}...` : 'NULL');
    console.log('📦 localStorage content:', localStorage.getItem('auth_token') ? 'EXISTS' : 'MISSING');

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('✅ Authorization header set:', headers['Authorization']?.substring(0, 30) + '...');
    } else {
      console.error('❌ Auth required but no token found in localStorage');
    }
  }

  return headers;
};

// Helper function for API calls with automatic 401/403 handling
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

  // Handle 401 Unauthorized - Token is invalid/expired
  if (response.status === 401) {
    console.warn('🚨 401 Unauthorized - Removing invalid token and redirecting to login');

    // Clear auth data
    localStorage.removeItem('auth_token');
    localStorage.removeItem('elbfunkeln_user');

    // Trigger logout event for AuthContext to update
    window.dispatchEvent(new CustomEvent('auth:unauthorized'));

    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.');
  }

  // Handle 403 Forbidden - No admin rights
  if (response.status === 403) {
    console.warn('🚫 403 Forbidden - Insufficient permissions');
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Du hast keine Berechtigung für diese Aktion.');
  }

  // Handle 400 Bad Request - Validation errors
  if (response.status === 400) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Ungültige Anfrage.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${response.statusText}`);
  }

  return response.json();
}

// Transform functions to convert API data to proper types
const transformProduct = (product: any): Product => ({
  ...product,
  price: Number(product.price),
  discountPrice: product.discountPrice ? Number(product.discountPrice) : null,
  // Map legacy fields for compatibility
  status: product.isActive ? 'active' : 'inactive',
  image_url: product.images?.[0]?.url || product.image_url || '',
  created_at: product.createdAt || product.created_at,
  updated_at: product.updatedAt || product.updated_at,
});

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
  detailed_description?: string;
  care_instructions?: string;
  price: number;
  discountPrice?: number | null;
  sku: string;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  giftboxavailable: boolean;
  categoryId: string;
  category: Category | string; // Support both Category object and string
  images: ProductImage[];
  reviews: ProductReview[];
  isDeleted?: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  // Legacy/compatibility fields
  image_url?: string;
  status?: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
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
  getAll: async (params?: ProductQueryParams) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.categoryId) queryParams.append('categoryId', params.categoryId);
    if (params?.search) queryParams.append('search', params.search);

    const queryString = queryParams.toString();
    const endpoint = `/products${queryString ? `?${queryString}` : ''}`;

    const response = await apiCall<ProductsResponse>(endpoint);
    return {
      ...response,
      data: response.data.map(transformProduct),
    };
  },

  getFeatured: async () => {
    const response = await apiCall<ProductsResponse>('/products/featured');
    return {
      ...response,
      data: response.data.map(transformProduct),
    };
  },

  search: async (query: string) => {
    const response = await apiCall<ProductsResponse>(`/products/search?q=${encodeURIComponent(query)}`);
    return {
      ...response,
      data: response.data.map(transformProduct),
    };
  },

  getById: async (id: string) => {
    const product = await apiCall<Product>(`/products/${id}`);
    return transformProduct(product);
  },
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
// ANALYTICS
// ============================================================================

export interface AnalyticsStats {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  topProducts: Array<{
    productId: string;
    name: string;
    sales: number;
    revenue: number;
  }>;
}

export const analyticsApi = {
  getStats: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString();
    return apiCall<AnalyticsStats>(`/analytics/stats${query ? `?${query}` : ''}`, {}, true);
  },
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

export interface SendNewsletterData {
  subject: string;
  content: string;
  htmlContent?: string;
}

export interface NewsletterResult {
  total: number;
  sent: number;
  failed: number;
  errors: string[];
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

  getAll: () =>
    apiCall<NewsletterSubscription[]>('/newsletter', {}, true),

  send: (data: SendNewsletterData) =>
    apiCall<NewsletterResult>('/newsletter/send', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true),
};

// ============================================================================
// REVIEWS
// ============================================================================

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewData {
  productId: string;
  rating: number;
  comment: string;
}

export const reviewsApi = {
  getByProduct: (productId: string) =>
    apiCall<Review[]>(`/reviews/product/${productId}`),

  create: (data: CreateReviewData) =>
    apiCall<Review>('/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true),

  update: (id: string, data: Partial<CreateReviewData>) =>
    apiCall<Review>(`/reviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, true),

  delete: (id: string) =>
    apiCall<{ message: string }>(`/reviews/${id}`, {
      method: 'DELETE',
    }, true),
};

// ============================================================================
// TICKETS (Support)
// ============================================================================

export interface Ticket {
  id: string;
  userId: string;
  subject: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  createdAt: string;
  updatedAt: string;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  userId: string;
  message: string;
  isStaff: boolean;
  createdAt: string;
}

export interface CreateTicketData {
  subject: string;
  message: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

export const ticketsApi = {
  getAll: () =>
    apiCall<Ticket[]>('/tickets', {}, true),

  getById: (id: string) =>
    apiCall<Ticket>(`/tickets/${id}`, {}, true),

  create: (data: CreateTicketData) =>
    apiCall<Ticket>('/tickets', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true),

  addMessage: (ticketId: string, message: string) =>
    apiCall<TicketMessage>(`/tickets/${ticketId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    }, true),

  getMessages: (ticketId: string) =>
    apiCall<TicketMessage[]>(`/tickets/${ticketId}/messages`, {}, true),

  close: (id: string) =>
    apiCall<Ticket>(`/tickets/${id}/close`, {
      method: 'PUT',
    }, true),
};

// ============================================================================
// ADMIN - USER MANAGEMENT
// ============================================================================

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  phone?: string;
  role: 'CUSTOMER' | 'SHOP_OWNER' | 'ADMIN';
  status: 'active' | 'inactive' | 'banned';
  emailVerified: boolean;
  marketingConsent: boolean;
  twoFactorEnabled: boolean;
  totalOrders: number;
  totalSpent: number;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserSession {
  id: string;
  userId: string;
  deviceName?: string;
  deviceType?: string;
  browserName?: string;
  ipAddress?: string;
  isActive: boolean;
  lastUsedAt: string;
  expiresAt: string;
  createdAt: string;
}

export interface UserActivity {
  id: string;
  userId: string;
  actionType: string;
  description?: string;
  ipAddress?: string;
  success: boolean;
  metadata?: any;
  createdAt: string;
}

export interface UpdateUserRoleData {
  role: 'CUSTOMER' | 'SHOP_OWNER' | 'ADMIN';
}

export interface UpdateUserStatusData {
  status: 'active' | 'inactive' | 'banned';
}

export const adminUsersApi = {
  getAll: () =>
    apiCall<AdminUser[]>('/admin/users', {}, true),

  getById: (userId: string) =>
    apiCall<AdminUser>(`/admin/users/${userId}`, {}, true),

  updateRole: (userId: string, data: UpdateUserRoleData) =>
    apiCall<AdminUser>(`/admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, true),

  updateStatus: (userId: string, data: UpdateUserStatusData) =>
    apiCall<AdminUser>(`/admin/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, true),

  getSessions: (userId: string) =>
    apiCall<UserSession[]>(`/admin/users/${userId}/sessions`, {}, true),

  revokeSession: (sessionId: string) =>
    apiCall<{ message: string }>(`/admin/sessions/${sessionId}`, {
      method: 'DELETE',
    }, true),

  revokeAllSessions: (userId: string) =>
    apiCall<{ message: string }>(`/admin/users/${userId}/sessions`, {
      method: 'DELETE',
    }, true),

  getActivity: (userId: string, limit: number = 20) =>
    apiCall<UserActivity[]>(`/admin/users/${userId}/activity?limit=${limit}`, {}, true),
};

// ============================================================================
// ADMIN - PRODUCTS
// ============================================================================

export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  sku: string;
  stock: number;
  categoryId: string;
  isActive?: boolean;
  isFeatured?: boolean;
  giftboxavailable?: boolean;
}

export interface UpdateProductData extends Partial<CreateProductData> {}

export const adminProductsApi = {
  create: (data: CreateProductData) =>
    apiCall<Product>('/admin/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true),

  update: (id: string, data: UpdateProductData) =>
    apiCall<Product>(`/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, true),

  delete: (id: string) =>
    apiCall<{ message: string }>(`/admin/products/${id}`, {
      method: 'DELETE',
    }, true),

  // Archiv-Funktionen (Soft-Delete)
  getArchived: async () => {
    const products = await apiCall<Product[]>('/admin/products/archived', {}, true);
    return products.map(transformProduct);
  },

  restore: (id: string) =>
    apiCall<Product>(`/admin/products/${id}/restore`, {
      method: 'POST',
    }, true),

  permanentDelete: (id: string) =>
    apiCall<{ message: string }>(`/admin/products/${id}/permanent`, {
      method: 'DELETE',
    }, true),

  // Image Management
  uploadImage: async (productId: string, file: File, alt?: string, isPrimary?: boolean) => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Nicht authentifiziert');
    }

    const formData = new FormData();
    formData.append('file', file);
    if (alt) formData.append('alt', alt);
    if (isPrimary !== undefined) formData.append('isPrimary', isPrimary.toString());

    const response = await fetch(`${API_BASE_URL}/admin/products/${productId}/images/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Fehler beim Hochladen des Bildes');
    }

    return response.json();
  },

  getProductImages: (productId: string) =>
    apiCall<ProductImage[]>(`/admin/products/${productId}/images`, {}, true),

  deleteProductImage: (productId: string, imageId: string) =>
    apiCall<{ message: string }>(`/admin/products/${productId}/images/${imageId}`, {
      method: 'DELETE',
    }, true),

  setPrimaryImage: (productId: string, imageId: string) =>
    apiCall<ProductImage>(`/admin/products/${productId}/images/${imageId}/primary`, {
      method: 'PUT',
    }, true),
};

// ============================================================================
// ADMIN - ANALYTICS
// ============================================================================

export interface AdminStats {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  pendingOrders: number;
  newsletterSubscribers: number;
  pendingInquiries: number;
}

export const adminAnalyticsApi = {
  getStats: () =>
    apiCall<AdminStats>('/admin/analytics/stats', {}, true),
};

// ============================================================================
// CONTACT INQUIRIES
// ============================================================================

export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
}

export interface CreateContactInquiryData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export const contactApi = {
  create: (data: CreateContactInquiryData) =>
    apiCall<ContactInquiry>('/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getAll: () =>
    apiCall<ContactInquiry[]>('/admin/contact', {}, true),

  getById: (id: string) =>
    apiCall<ContactInquiry>(`/admin/contact/${id}`, {}, true),

  updateStatus: (id: string, status: ContactInquiry['status']) =>
    apiCall<ContactInquiry>(`/admin/contact/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }, true),
};

// ============================================================================
// GALLERY
// ============================================================================

export interface GalleryPostResponse {
  id: string;
  imageUrl: string;
  images: string[];
  title: string;
  description?: string;
  tags: string[];
  materials: string[];
  featured: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGalleryPostData {
  title: string;
  description?: string;
  images: string[];
  tags: string[];
  materials: string[];
}

export interface UpdateGalleryPostData {
  title?: string;
  description?: string;
  imageUrl?: string;
  images?: string[];
  tags?: string[];
  materials?: string[];
  featured?: boolean;
}

export interface GalleryUploadResponse {
  url: string;
}

export const galleryApi = {
  // Public endpoints
  getPublic: () =>
    apiCall<GalleryPostResponse[]>('/gallery/public'),

  // Admin endpoints (require auth)
  getAll: (params?: { sort?: string; search?: string; tag?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.sort) queryParams.append('sort', params.sort);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.tag) queryParams.append('tag', params.tag);
    const query = queryParams.toString();
    return apiCall<GalleryPostResponse[]>(`/gallery${query ? `?${query}` : ''}`, {}, true);
  },

  getById: (id: string) =>
    apiCall<GalleryPostResponse>(`/gallery/${id}`, {}, true),

  create: (data: CreateGalleryPostData) =>
    apiCall<GalleryPostResponse>('/gallery', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true),

  update: (id: string, data: UpdateGalleryPostData) =>
    apiCall<GalleryPostResponse>(`/gallery/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, true),

  delete: (id: string) =>
    apiCall<{ message: string }>(`/gallery/${id}`, {
      method: 'DELETE',
    }, true),

  bulkDelete: (ids: string[]) =>
    apiCall<{ message: string }>('/gallery/bulk', {
      method: 'DELETE',
      body: JSON.stringify({ ids }),
    }, true),

  toggleFeatured: (id: string) =>
    apiCall<{ featured: boolean }>(`/gallery/${id}/featured`, {
      method: 'PATCH',
    }, true),

  updateOrder: (id: string, newIndex: number) =>
    apiCall<{ message: string }>(`/gallery/${id}/order`, {
      method: 'PATCH',
      body: JSON.stringify({ newIndex }),
    }, true),

  getTags: () =>
    apiCall<string[]>('/gallery/tags', {}, true),

  getMaterials: () =>
    apiCall<string[]>('/gallery/materials', {}, true),

  uploadImage: async (file: File) => {
    const token = getAuthToken();
    if (!token) throw new Error('Nicht authentifiziert');

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/gallery/upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });

    if (response.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('elbfunkeln_user');
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      throw new Error('Sitzung abgelaufen.');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Fehler beim Hochladen des Bildes');
    }

    return response.json() as Promise<GalleryUploadResponse>;
  },
};

// ============================================================================
// UTILITIES
// ============================================================================

export const setAuthToken = (token: string) => {
  console.log('💾 setAuthToken called with token:', token ? `${token.substring(0, 20)}...` : 'NULL');
  localStorage.setItem('auth_token', token);
  console.log('✅ Token saved to localStorage');
  // Verify it was saved
  const saved = localStorage.getItem('auth_token');
  console.log('🔍 Verification - Token in storage:', saved ? 'YES' : 'NO');
};

export const removeAuthToken = () => {
  localStorage.removeItem('auth_token');
};

export default {
  auth: authApi,
  products: productsApi,
  categories: categoriesApi,
  analytics: analyticsApi,
  newsletter: newsletterApi,
  reviews: reviewsApi,
  tickets: ticketsApi,
  contact: contactApi,
  gallery: galleryApi,
  admin: {
    users: adminUsersApi,
    products: adminProductsApi,
    analytics: adminAnalyticsApi,
  },
  setAuthToken,
  removeAuthToken,
};
