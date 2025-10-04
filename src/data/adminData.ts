// Mock data for admin dashboard

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  priority: 'low' | 'medium' | 'high';
  notes?: string;
}

export interface DiscountCode {
  id: string;
  code: string;
  description: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrder: number;
  maxUses: number;
  currentUses: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  categories?: string[];
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  name?: string;
  subscribedAt: string;
  isActive: boolean;
  tags: string[];
}

export interface SaleEvent {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  discountPercentage: number;
  productIds: string[];
  isActive: boolean;
  bannerText?: string;
}

export const mockOrders: Order[] = [
  {
    id: 'EB-2024-001',
    customerName: 'Sarah Müller',
    customerEmail: 'sarah.mueller@example.com',
    date: '2024-01-15',
    status: 'pending',
    total: 87.00,
    priority: 'medium',
    items: [
      { productId: '1', productName: 'Zarte Draht-Ohrringe 🌸', quantity: 1, price: 45 },
      { productId: '3', productName: 'Eleganter Draht-Ring 💍', quantity: 1, price: 28 }
    ],
    shippingAddress: {
      street: 'Musterstraße 123',
      city: 'Hamburg',
      postalCode: '20359',
      country: 'Deutschland'
    },
    notes: 'Bitte vorsichtig verpacken - Geschenk!'
  },
  {
    id: 'EB-2024-002',
    customerName: 'Lisa Weber',
    customerEmail: 'lisa.weber@email.de',
    date: '2024-01-14',
    status: 'processing',
    total: 65.00,
    priority: 'high',
    items: [
      { productId: '4', productName: 'Handgefertigte Kette 🌟', quantity: 1, price: 65 }
    ],
    shippingAddress: {
      street: 'Elbufer 45',
      city: 'Hamburg',
      postalCode: '22767',
      country: 'Deutschland'
    }
  },
  {
    id: 'EB-2024-003',
    customerName: 'Marie Klein',
    customerEmail: 'marie.klein@gmail.com',
    date: '2024-01-13',
    status: 'shipped',
    total: 128.00,
    priority: 'low',
    items: [
      { productId: '2', productName: 'Minimalistisches Armband ✨', quantity: 2, price: 35 },
      { productId: '5', productName: 'Geometrische Ohrhänger 🔸', quantity: 1, price: 42 }
    ],
    shippingAddress: {
      street: 'Reeperbahn 1',
      city: 'Hamburg',
      postalCode: '20359',
      country: 'Deutschland'
    }
  }
];

export const mockDiscountCodes: DiscountCode[] = [
  {
    id: '1',
    code: 'WELCOME10',
    description: 'Willkommensrabatt für Neukunden',
    type: 'percentage',
    value: 10,
    minOrder: 30,
    maxUses: 100,
    currentUses: 45,
    validFrom: '2024-01-01',
    validUntil: '2024-12-31',
    isActive: true
  },
  {
    id: '2',
    code: 'SPRING2024',
    description: 'Frühlingskollektion Sale',
    type: 'percentage',
    value: 20,
    minOrder: 50,
    maxUses: 200,
    currentUses: 123,
    validFrom: '2024-03-01',
    validUntil: '2024-05-31',
    isActive: true,
    categories: ['Ohrringe', 'Ringe']
  },
  {
    id: '3',
    code: 'FREESHIP',
    description: 'Kostenloser Versand',
    type: 'fixed',
    value: 5.90,
    minOrder: 25,
    maxUses: 50,
    currentUses: 12,
    validFrom: '2024-01-15',
    validUntil: '2024-02-15',
    isActive: false
  }
];

export const mockNewsletterSubscribers: NewsletterSubscriber[] = [
  {
    id: '1',
    email: 'sarah.mueller@example.com',
    name: 'Sarah Müller',
    subscribedAt: '2024-01-01',
    isActive: true,
    tags: ['VIP', 'Stammkunde']
  },
  {
    id: '2',
    email: 'lisa.weber@email.de',
    name: 'Lisa Weber',
    subscribedAt: '2024-01-05',
    isActive: true,
    tags: ['Neukunde']
  },
  {
    id: '3',
    email: 'marie.klein@gmail.com',
    subscribedAt: '2024-01-10',
    isActive: false,
    tags: []
  }
];

export const mockSaleEvents: SaleEvent[] = [
  {
    id: '1',
    name: 'Valentinstag Sale 💕',
    description: '20% Rabatt auf alle Ohrringe und Ketten',
    startDate: '2024-02-10',
    endDate: '2024-02-15',
    discountPercentage: 20,
    productIds: ['1', '4', '5'],
    isActive: true,
    bannerText: 'Valentinstag Special: 20% auf Ohrringe & Ketten! 💕'
  },
  {
    id: '2',
    name: 'Frühlings-Erwachen 🌸',
    description: 'Neue Kollektion mit 15% Einführungsrabatt',
    startDate: '2024-03-01',
    endDate: '2024-03-31',
    discountPercentage: 15,
    productIds: ['2', '3', '6'],
    isActive: false,
    bannerText: 'Frühlingskollektion jetzt mit 15% Rabatt! 🌸'
  }
];

export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
  isActive: boolean;
  trackingEnabled: boolean;
}

export interface Shipment {
  id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  shippingMethod: string;
  trackingNumber?: string;
  status: 'preparing' | 'shipped' | 'in_transit' | 'delivered' | 'returned';
  shippedDate?: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  notes?: string;
  returnReason?: string;
  returnStatus?: 'requested' | 'approved' | 'in_process' | 'completed';
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  reason: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed';
  requestDate: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    condition?: string;
  }>;
  refundAmount: number;
  adminNotes?: string;
}

export interface AdminStats {
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  newsletterSubscribers: number;
  activeShipments: number;
  pendingReturns: number;
  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
  }>;
  revenueGrowth: number;
  orderGrowth: number;
}

export const mockShippingMethods: ShippingMethod[] = [
  {
    id: '1',
    name: 'Standard Versand',
    description: 'Deutsche Post Brief',
    price: 3.90,
    estimatedDays: '2-4 Werktage',
    isActive: true,
    trackingEnabled: false
  },
  {
    id: '2',
    name: 'DHL Paket',
    description: 'DHL Standardversand mit Tracking',
    price: 5.90,
    estimatedDays: '1-2 Werktage',
    isActive: true,
    trackingEnabled: true
  },
  {
    id: '3',
    name: 'Express Versand',
    description: 'DHL Express bis 12:00 Uhr',
    price: 12.90,
    estimatedDays: '1 Werktag',
    isActive: true,
    trackingEnabled: true
  }
];

export const mockShipments: Shipment[] = [
  {
    id: 'SH-001',
    orderId: 'EB-2024-001',
    customerName: 'Sarah Müller',
    customerEmail: 'sarah.mueller@example.com',
    shippingMethod: 'DHL Paket',
    trackingNumber: 'DHL123456789',
    status: 'shipped',
    shippedDate: '2024-01-16',
    estimatedDelivery: '2024-01-18',
    notes: 'Fragile - Handle with care'
  },
  {
    id: 'SH-002',
    orderId: 'EB-2024-002',
    customerName: 'Lisa Weber',
    customerEmail: 'lisa.weber@email.de',
    shippingMethod: 'Express Versand',
    trackingNumber: 'DHL987654321',
    status: 'in_transit',
    shippedDate: '2024-01-15',
    estimatedDelivery: '2024-01-16'
  },
  {
    id: 'SH-003',
    orderId: 'EB-2024-003',
    customerName: 'Marie Klein',
    customerEmail: 'marie.klein@gmail.com',
    shippingMethod: 'Standard Versand',
    status: 'preparing'
  }
];

export const mockReturnRequests: ReturnRequest[] = [
  {
    id: 'RT-001',
    orderId: 'EB-2024-001',
    customerName: 'Sarah Müller',
    customerEmail: 'sarah.mueller@example.com',
    reason: 'Größe passt nicht',
    description: 'Ring ist zu klein, benötige eine Nummer größer',
    status: 'pending',
    requestDate: '2024-01-17',
    items: [
      { productId: '3', productName: 'Eleganter Draht-Ring 💍', quantity: 1 }
    ],
    refundAmount: 28.00
  },
  {
    id: 'RT-002',
    orderId: 'EB-2024-004',
    customerName: 'Anna Schmidt',
    customerEmail: 'anna.schmidt@example.com',
    reason: 'Beschädigt angekommen',
    description: 'Kette war bereits beim Auspacken gebrochen',
    status: 'approved',
    requestDate: '2024-01-16',
    items: [
      { productId: '4', productName: 'Handgefertigte Kette 🌟', quantity: 1, condition: 'Beschädigt' }
    ],
    refundAmount: 65.00,
    adminNotes: 'Vollerstattung genehmigt, Ersatz wird vorbereitet'
  }
];

export const mockAdminStats: AdminStats = {
  totalOrders: 156,
  pendingOrders: 8,
  totalRevenue: 12450.75,
  totalCustomers: 89,
  newsletterSubscribers: 234,
  activeShipments: 12,
  pendingReturns: 3,
  topProducts: [
    { id: '1', name: 'Zarte Draht-Ohrringe 🌸', sales: 45 },
    { id: '4', name: 'Handgefertigte Kette 🌟', sales: 32 },
    { id: '2', name: 'Minimalistisches Armband ✨', sales: 28 }
  ],
  revenueGrowth: 15.2,
  orderGrowth: 8.7
};