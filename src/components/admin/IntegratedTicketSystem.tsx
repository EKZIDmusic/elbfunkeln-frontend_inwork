import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'motion/react';
import { 
  Ticket, Search, Eye, RefreshCw, Calendar,
  MessageSquare, Clock, AlertCircle, CheckCircle, 
  XCircle, Mail, Phone, User, Package,
  ArrowUp, ArrowDown, Minus, Plus, Send,
  Flag, Star, Archive, Filter, ShoppingCart,
  RotateCcw, CreditCard, Truck, DollarSign,
  Edit, Trash2, FileText, Download
} from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Textarea } from '../ui/textarea';
import { useAuth } from '../AuthContext';
import { ticketService, useTicketService } from '../../services/ticketService';

interface TicketMessage {
  id: string;
  sender: 'customer' | 'admin' | 'system';
  sender_name: string;
  message: string;
  timestamp: string;
  attachments?: string[];
}

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
  sku?: string;
}

interface UnifiedTicket {
  id: string;
  ticket_number: string;
  type: 'order' | 'return' | 'support' | 'complaint' | 'payment';
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  subject: string;
  category: 'order_status' | 'payment' | 'shipping' | 'return' | 'complaint' | 'general' | 'technical' | 'product_question';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
  updated_at: string;
  assigned_to?: string;
  tags: string[];
  messages: TicketMessage[];
  
  // Order-spezifische Felder
  order_id?: string;
  order_total?: number;
  order_items?: OrderItem[];
  payment_status?: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
  tracking_number?: string;
  shipping_address?: string;
  
  // Return-spezifische Felder
  return_reason?: string;
  return_status?: 'requested' | 'approved' | 'declined' | 'received' | 'refunded';
  refund_amount?: number;
  return_items?: OrderItem[];
  
  auto_notifications: boolean;
}

// Performance: Memoized constants für Labels und Styles
const TYPE_LABELS: Record<string, string> = {
  order: 'Bestellung',
  return: 'Retour',
  support: 'Support',
  complaint: 'Beschwerde',
  payment: 'Zahlung'
};

const TYPE_ICONS: Record<string, React.ElementType> = {
  order: ShoppingCart,
  return: RotateCcw,
  support: MessageSquare,
  complaint: AlertCircle,
  payment: CreditCard
};

const TYPE_STYLES: Record<string, string> = {
  order: 'bg-blue-100 text-blue-800 border-blue-200',
  return: 'bg-orange-100 text-orange-800 border-orange-200',
  support: 'bg-purple-100 text-purple-800 border-purple-200',
  complaint: 'bg-red-100 text-red-800 border-red-200',
  payment: 'bg-green-100 text-green-800 border-green-200'
};

const STATUS_LABELS: Record<string, string> = {
  open: 'Offen',
  in_progress: 'In Bearbeitung',
  waiting_customer: 'Wartet auf Kunde',
  resolved: 'Gelöst',
  closed: 'Geschlossen',
  shipped: 'Versendet',
  delivered: 'Zugestellt',
  cancelled: 'Storniert'
};

const STATUS_STYLES: Record<string, string> = {
  open: 'bg-red-100 text-red-800 border-red-200',
  in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
  waiting_customer: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  resolved: 'bg-green-100 text-green-800 border-green-200',
  closed: 'bg-gray-100 text-gray-800 border-gray-200',
  shipped: 'bg-purple-100 text-purple-800 border-purple-200',
  delivered: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200'
};

const PRIORITY_STYLES: Record<string, string> = {
  low: 'bg-gray-100 text-gray-800 border-gray-200',
  medium: 'bg-blue-100 text-blue-800 border-blue-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  urgent: 'bg-red-100 text-red-800 border-red-200'
};

const PRIORITY_LABELS: Record<string, string> = {
  low: 'Niedrig',
  medium: 'Mittel',
  high: 'Hoch',
  urgent: 'Dringend'
};

const CATEGORY_LABELS: Record<string, string> = {
  order_status: 'Bestellstatus',
  payment: 'Zahlung',
  shipping: 'Versand',
  return: 'Retour',
  complaint: 'Beschwerde',
  general: 'Allgemein',
  technical: 'Technisch',
  product_question: 'Produktfrage'
};

// Helper function for status labels
const getStatusLabel = (status: string) => {
  return STATUS_LABELS[status] || status;
};

// Performance: Memoized Badge Components
const TypeBadge = React.memo(({ type }: { type: string }) => {
  const Icon = TYPE_ICONS[type] || MessageSquare;
  
  return (
    <Badge className={`${TYPE_STYLES[type] || TYPE_STYLES.support} flex items-center gap-1`}>
      <Icon className="h-4 w-4" />
      {TYPE_LABELS[type] || type}
    </Badge>
  );
});

const StatusBadge = React.memo(({ status }: { status: string }) => {
  return (
    <Badge className={STATUS_STYLES[status] || STATUS_STYLES.open}>
      {STATUS_LABELS[status] || status}
    </Badge>
  );
});

const PriorityBadge = React.memo(({ priority }: { priority: string }) => {
  return (
    <Badge className={PRIORITY_STYLES[priority] || PRIORITY_STYLES.medium}>
      {PRIORITY_LABELS[priority] || priority}
    </Badge>
  );
});

// Performance: Memoized Ticket Row Component
const TicketRow = React.memo(({ 
  ticket, 
  onStatusUpdate, 
  onViewTicket 
}: { 
  ticket: UnifiedTicket;
  onStatusUpdate: (ticketId: string, newStatus: string) => void;
  onViewTicket: (ticket: UnifiedTicket) => void;
}) => {
  return (
    <TableRow className={ticket.priority === 'urgent' ? 'bg-red-50' : ''}>
      <TableCell>
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm">{ticket.ticket_number}</span>
          {ticket.priority === 'urgent' && <Flag className="h-4 w-4 text-red-500" />}
        </div>
        {ticket.order_id && (
          <div className="text-xs text-gray-400">#{ticket.order_id}</div>
        )}
      </TableCell>
      <TableCell><TypeBadge type={ticket.type} /></TableCell>
      <TableCell>
        <div>
          <div className="font-semibold">{ticket.customer_name}</div>
          <div className="text-sm text-gray-500">{ticket.customer_email}</div>
          {ticket.order_total && (
            <div className="text-xs text-gray-400">{ticket.order_total.toFixed(2)}€</div>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="max-w-48 truncate font-medium">{ticket.subject}</div>
        <div className="text-sm text-gray-500">
          {ticket.messages.length} Nachrichten
        </div>
      </TableCell>
      <TableCell><PriorityBadge priority={ticket.priority} /></TableCell>
      <TableCell><StatusBadge status={ticket.status} /></TableCell>
      <TableCell>
        <div className="text-sm">
          {new Date(ticket.updated_at).toLocaleDateString('de-DE')}
        </div>
        <div className="text-xs text-gray-500">
          {new Date(ticket.updated_at).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onViewTicket(ticket)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          
          <Select 
            value={ticket.status} 
            onValueChange={(value) => onStatusUpdate(ticket.id, value)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Offen</SelectItem>
              <SelectItem value="in_progress">In Bearbeitung</SelectItem>
              <SelectItem value="waiting_customer">Wartet auf Kunde</SelectItem>
              {ticket.type === 'order' && (
                <>
                  <SelectItem value="shipped">Versendet</SelectItem>
                  <SelectItem value="delivered">Zugestellt</SelectItem>
                </>
              )}
              <SelectItem value="resolved">Gelöst</SelectItem>
              <SelectItem value="closed">Geschlossen</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </TableCell>
    </TableRow>
  );
});

// Performance: Memoized Message Component
const MessageBubble = React.memo(({ message }: { message: TicketMessage }) => {
  return (
    <div className={`flex ${message.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] rounded-lg p-3 ${
        message.sender === 'admin' 
          ? 'bg-elbfunkeln-lavender/20 text-right' 
          : message.sender === 'system'
          ? 'bg-gray-100 border-l-4 border-blue-500'
          : 'bg-gray-100'
      }`}>
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm">{message.sender_name}</span>
          <span className="text-xs text-gray-500">
            {new Date(message.timestamp).toLocaleString('de-DE')}
          </span>
        </div>
        <p className="text-sm">{message.message}</p>
      </div>
    </div>
  );
});

// Mock data für Demo-Zwecke
const mockTickets: UnifiedTicket[] = [
  {
    id: 'TIC-001',
    ticket_number: 'TIC-001',
    type: 'order',
    customer_name: 'Anna Müller',
    customer_email: 'anna.mueller@email.com',
    customer_phone: '+49 170 1234567',
    subject: 'Neue Bestellung - Silber Armband Luna',
    category: 'order_status',
    priority: 'medium',
    status: 'in_progress',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T14:20:00Z',
    tags: ['new_order', 'silber', 'armband'],
    order_id: 'ORD-12345',
    order_total: 89.99,
    payment_status: 'paid',
    shipping_address: 'Musterstraße 123, 20095 Hamburg',
    order_items: [
      { id: '1', product_name: 'Silber Armband "Luna"', quantity: 1, price: 89.99, sku: 'SB-LUNA-001' }
    ],
    auto_notifications: true,
    messages: [
      {
        id: 'msg-1',
        sender: 'system',
        sender_name: 'System',
        message: 'Neue Bestellung eingegangen. Zahlung erfolgreich über PayPal.',
        timestamp: '2024-01-15T10:30:00Z'
      },
      {
        id: 'msg-2',
        sender: 'admin',
        sender_name: 'Admin',
        message: 'Bestellung wird bearbeitet. Versand erfolgt morgen.',
        timestamp: '2024-01-15T14:20:00Z'
      }
    ]
  },
  {
    id: 'TIC-002',
    ticket_number: 'TIC-002',
    type: 'return',
    customer_name: 'Maria Schmidt',
    customer_email: 'maria.schmidt@email.com',
    subject: 'Retourenantrag - Gold Ohrringe defekt',
    category: 'return',
    priority: 'high',
    status: 'open',
    created_at: '2024-01-14T15:45:00Z',
    updated_at: '2024-01-14T15:45:00Z',
    tags: ['return', 'defekt', 'ohrringe'],
    order_id: 'ORD-12346',
    order_total: 129.99,
    return_reason: 'Produkt defekt - Verschluss gebrochen',
    return_status: 'requested',
    refund_amount: 129.99,
    return_items: [
      { id: '2', product_name: 'Gold Ohrringe "Stella"', quantity: 1, price: 129.99, sku: 'GO-STELLA-001' }
    ],
    auto_notifications: true,
    messages: [
      {
        id: 'msg-3',
        sender: 'customer',
        sender_name: 'Maria Schmidt',
        message: 'Die Ohrringe kamen mit einem gebrochenen Verschluss an. Ich möchte sie zurücksenden.',
        timestamp: '2024-01-14T15:45:00Z'
      }
    ]
  },
  {
    id: 'TIC-003',
    ticket_number: 'TIC-003',
    type: 'support',
    customer_name: 'Lisa Weber',
    customer_email: 'lisa.weber@email.com',
    subject: 'Frage zur Pflege von Silberschmuck',
    category: 'product_question',
    priority: 'low',
    status: 'resolved',
    created_at: '2024-01-12T08:15:00Z',
    updated_at: '2024-01-13T16:30:00Z',
    tags: ['pflege', 'silber', 'beratung'],
    auto_notifications: true,
    messages: [
      {
        id: 'msg-4',
        sender: 'customer',
        sender_name: 'Lisa Weber',
        message: 'Wie pflege ich am besten mein Silber Armband? Läuft es an?',
        timestamp: '2024-01-12T08:15:00Z'
      },
      {
        id: 'msg-5',
        sender: 'admin',
        sender_name: 'Admin',
        message: 'Silberschmuck sollte trocken und luftdicht gelagert werden. Bei Anlaufen einfach mit einem Silberputztuch reinigen.',
        timestamp: '2024-01-13T16:30:00Z'
      }
    ]
  },
  {
    id: 'TIC-004',
    ticket_number: 'TIC-004',
    type: 'payment',
    customer_name: 'Tom Fischer',
    customer_email: 'tom.fischer@email.com',
    subject: 'Zahlungsproblem - PayPal Fehler',
    category: 'payment',
    priority: 'urgent',
    status: 'waiting_customer',
    created_at: '2024-01-10T14:20:00Z',
    updated_at: '2024-01-11T09:15:00Z',
    tags: ['payment', 'paypal', 'fehler'],
    order_id: 'ORD-12348',
    order_total: 79.99,
    payment_status: 'failed',
    auto_notifications: true,
    messages: [
      {
        id: 'msg-6',
        sender: 'customer',
        sender_name: 'Tom Fischer',
        message: 'Meine PayPal-Zahlung wurde abgelehnt. Wie kann ich bezahlen?',
        timestamp: '2024-01-10T14:20:00Z'
      },
      {
        id: 'msg-7',
        sender: 'admin',
        sender_name: 'Admin',
        message: 'Sie können auch per Überweisung oder Kreditkarte bezahlen. Soll ich Ihnen die Bankdaten senden?',
        timestamp: '2024-01-11T09:15:00Z'
      }
    ]
  }
];

export function IntegratedTicketSystem() {
  // Nutze den Ticket-Service
  const { 
    tickets, 
    refreshTickets, 
    updateTicketStatus: serviceUpdateStatus, 
    addMessageToTicket,
    getTicketStats
  } = useTicketService();
  
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState<UnifiedTicket | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [autoNotify, setAutoNotify] = useState(true);

  // Performance: Debounced search
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Initialize with mock data and load tickets
  useEffect(() => {
    // Initialize mock data if needed
    ticketService.initializeMockData();
    
    // Add mock tickets to service if none exist
    if (tickets.length === 0) {
      mockTickets.forEach(mockTicket => {
        if (mockTicket.type === 'order' && mockTicket.order_items) {
          ticketService.createOrderTicket({
            orderId: mockTicket.order_id || '',
            customerName: mockTicket.customer_name,
            customerEmail: mockTicket.customer_email,
            customerPhone: mockTicket.customer_phone,
            orderTotal: mockTicket.order_total || 0,
            orderItems: mockTicket.order_items,
            shippingAddress: mockTicket.shipping_address || '',
            paymentStatus: mockTicket.payment_status || 'pending'
          });
        } else if (mockTicket.type === 'return' && mockTicket.return_items) {
          ticketService.createReturnTicket({
            orderId: mockTicket.order_id || '',
            customerName: mockTicket.customer_name,
            customerEmail: mockTicket.customer_email,
            returnReason: mockTicket.return_reason || '',
            returnItems: mockTicket.return_items,
            refundAmount: mockTicket.refund_amount || 0
          });
        } else if (mockTicket.type === 'support') {
          ticketService.createSupportTicket({
            customerName: mockTicket.customer_name,
            customerEmail: mockTicket.customer_email,
            customerPhone: mockTicket.customer_phone,
            subject: mockTicket.subject,
            message: mockTicket.messages[0]?.message || '',
            category: mockTicket.category as any,
            priority: mockTicket.priority
          });
        }
      });
    }
    
    refreshTickets();
  }, []);

  // Refresh tickets periodically
  useEffect(() => {
    refreshTickets();
  }, [refreshTickets]);

  // Performance: Memoized filtered tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      const matchesSearch = debouncedSearchQuery === '' || 
        ticket.ticket_number.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        ticket.customer_email.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        ticket.customer_name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        ticket.subject.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        (ticket.order_id && ticket.order_id.toLowerCase().includes(debouncedSearchQuery.toLowerCase()));
      
      const matchesType = selectedType === 'all' || ticket.type === selectedType;
      const matchesStatus = selectedStatus === 'all' || ticket.status === selectedStatus;
      const matchesPriority = selectedPriority === 'all' || ticket.priority === selectedPriority;
      const matchesCategory = selectedCategory === 'all' || ticket.category === selectedCategory;
      
      return matchesSearch && matchesType && matchesStatus && matchesPriority && matchesCategory;
    });
  }, [tickets, debouncedSearchQuery, selectedType, selectedStatus, selectedPriority, selectedCategory]);

  // Performance: Memoized stats
  const stats = useMemo(() => ({
    ...getTicketStats(),
    avgResponseTime: '2.1h'
  }), [getTicketStats]);

  const handleStatusUpdate = (ticketId: string, newStatus: any) => {
    const success = serviceUpdateStatus(ticketId, newStatus);
    if (success) {
      refreshTickets();
      
      // Automatische E-Mail-Benachrichtigung
      const ticket = tickets.find(t => t.id === ticketId);
      if (ticket && ticket.auto_notifications) {
        setTimeout(() => {
          alert(`E-Mail-Benachrichtigung an ${ticket.customer_name} gesendet: Status geändert zu "${getStatusLabel(newStatus)}"`);
        }, 500);
      }
    }
  };

  const handlePriorityUpdate = (ticketId: string, newPriority: any) => {
    // Priority update würde über den Service implementiert werden
    // Für jetzt nur lokales Update
    refreshTickets();
  };

  const handleViewTicket = useCallback((ticket: UnifiedTicket) => {
    setSelectedTicket(ticket);
    setShowDetailsDialog(true);
  }, []);

  const sendMessage = () => {
    if (!selectedTicket || !newMessage.trim()) return;

    const success = addMessageToTicket(selectedTicket.id, {
      sender: 'admin',
      sender_name: 'Admin',
      message: newMessage
    });

    if (success) {
      refreshTickets();
      // Update selected ticket with new data
      const updatedTickets = ticketService.getAllTickets();
      const updatedTicket = updatedTickets.find(t => t.id === selectedTicket.id);
      if (updatedTicket) {
        setSelectedTicket(updatedTicket);
      }
      setNewMessage('');

      // Automatische E-Mail-Benachrichtigung
      if (autoNotify) {
        setTimeout(() => {
          alert(`E-Mail-Benachrichtigung an ${selectedTicket.customer_name} gesendet`);
        }, 500);
      }
    }
  };

  // Calculate stats using service
  const stats = {
    ...getTicketStats(),
    avgResponseTime: '2.1h'
  };

  return (
    <div className="space-y-6">
      {/* Ticket Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <Card className="p-4 border-0 bg-gradient-to-br from-white to-elbfunkeln-beige/20 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Gesamt Tickets</p>
              <p className="text-2xl font-semibold text-elbfunkeln-lavender">{stats.total}</p>
            </div>
            <Ticket className="h-8 w-8 text-elbfunkeln-lavender" />
          </div>
        </Card>
        
        <Card className="p-4 border-0 bg-gradient-to-br from-white to-elbfunkeln-beige/20 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Bearbeitung</p>
              <p className="text-2xl font-semibold text-blue-600">{stats.inProgress}</p>
            </div>
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
        </Card>
        
        <Card className="p-4 border-0 bg-gradient-to-br from-white to-elbfunkeln-beige/20 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Bestellungen</p>
              <p className="text-2xl font-semibold text-orange-600">{stats.orders}</p>
            </div>
            <ShoppingCart className="h-8 w-8 text-orange-600" />
          </div>
        </Card>
        
        <Card className="p-4 border-0 bg-gradient-to-br from-white to-elbfunkeln-beige/20 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Retouren</p>
              <p className="text-2xl font-semibold text-purple-600">{stats.returns}</p>
            </div>
            <RotateCcw className="h-8 w-8 text-purple-600" />
          </div>
        </Card>
        
        <Card className="p-4 border-0 bg-gradient-to-br from-white to-elbfunkeln-beige/20 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ø Antwortzeit</p>
              <p className="text-2xl font-semibold text-green-600">{stats.avgResponseTime}</p>
            </div>
            <Clock className="h-8 w-8 text-green-600" />
          </div>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-1 gap-2 flex-wrap">
          <div className="relative flex-1 min-w-60">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tickets suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Typ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Typen</SelectItem>
              <SelectItem value="order">Bestellungen</SelectItem>
              <SelectItem value="return">Retouren</SelectItem>
              <SelectItem value="support">Support</SelectItem>
              <SelectItem value="complaint">Beschwerden</SelectItem>
              <SelectItem value="payment">Zahlungen</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Status</SelectItem>
              <SelectItem value="open">Offen</SelectItem>
              <SelectItem value="in_progress">In Bearbeitung</SelectItem>
              <SelectItem value="waiting_customer">Wartet auf Kunde</SelectItem>
              <SelectItem value="shipped">Versendet</SelectItem>
              <SelectItem value="delivered">Zugestellt</SelectItem>
              <SelectItem value="resolved">Gelöst</SelectItem>
              <SelectItem value="closed">Geschlossen</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedPriority} onValueChange={setSelectedPriority}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Priorität" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle</SelectItem>
              <SelectItem value="urgent">Dringend</SelectItem>
              <SelectItem value="high">Hoch</SelectItem>
              <SelectItem value="medium">Mittel</SelectItem>
              <SelectItem value="low">Niedrig</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              // Demo: Neue Bestellung simulieren
              ticketService.createOrderTicket({
                orderId: `ORD-${Date.now()}`,
                customerName: 'Demo Kunde',
                customerEmail: 'demo@beispiel.de',
                customerPhone: '+49 123 456789',
                orderTotal: 99.99,
                orderItems: [
                  { id: 'demo-1', product_name: 'Demo Armband "Elegant"', quantity: 1, price: 99.99, sku: 'DEMO-001' }
                ],
                shippingAddress: 'Demostraße 123, 12345 Demostadt',
                paymentStatus: 'paid'
              });
              refreshTickets();
              alert('Demo-Bestellung erstellt! Neues Ticket wurde automatisch angelegt.');
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Demo Bestellung
          </Button>
          
          <Button variant="outline" size="sm" onClick={refreshTickets}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Aktualisieren
          </Button>
        </div>
      </div>

      {/* Tickets Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticket</TableHead>
              <TableHead>Typ</TableHead>
              <TableHead>Kunde</TableHead>
              <TableHead>Betreff</TableHead>
              <TableHead>Priorität</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Letzte Aktivität</TableHead>
              <TableHead>Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTickets.map((ticket) => (
              <TicketRow 
                key={ticket.id} 
                ticket={ticket} 
                onStatusUpdate={handleStatusUpdate}
                onViewTicket={handleViewTicket}
              />
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Vergrößerter Ticket Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-6xl w-full h-[90vh] max-h-[90vh] overflow-hidden">
          <DialogHeader className="pb-4 border-b">
            <DialogTitle className="flex items-center gap-3">
              <span className="font-cormorant text-2xl">
                Ticket {selectedTicket?.ticket_number}
              </span>
              {selectedTicket && (
                <>
                  <TypeBadge type={selectedTicket.type} />
                  <StatusBadge status={selectedTicket.status} />
                  <PriorityBadge priority={selectedTicket.priority} />
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {selectedTicket && (
            <div className="flex-1 overflow-hidden">
              <Tabs defaultValue="overview" className="h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-4 mb-4">
                  <TabsTrigger value="overview">Übersicht</TabsTrigger>
                  <TabsTrigger value="messages">Nachrichten</TabsTrigger>
                  <TabsTrigger value="order">Bestellung</TabsTrigger>
                  <TabsTrigger value="actions">Aktionen</TabsTrigger>
                </TabsList>
                
                <div className="flex-1 overflow-hidden">
                  <TabsContent value="overview" className="h-full overflow-y-auto">
                    <div className="space-y-6 p-1">
                      {/* Kundeninformationen */}
                      <Card className="p-6">
                        <h3 className="font-cormorant text-xl mb-4 text-elbfunkeln-green">Kundeninformationen</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <User className="h-5 w-5 text-elbfunkeln-green" />
                              <div>
                                <p className="font-medium">{selectedTicket.customer_name}</p>
                                <p className="text-sm text-gray-500">Name</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <Mail className="h-5 w-5 text-elbfunkeln-green" />
                              <div>
                                <p className="font-medium">{selectedTicket.customer_email}</p>
                                <p className="text-sm text-gray-500">E-Mail</p>
                              </div>
                            </div>
                            
                            {selectedTicket.customer_phone && (
                              <div className="flex items-center gap-3">
                                <Phone className="h-5 w-5 text-elbfunkeln-green" />
                                <div>
                                  <p className="font-medium">{selectedTicket.customer_phone}</p>
                                  <p className="text-sm text-gray-500">Telefon</p>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <div className="space-y-3">
                            <div>
                              <p className="font-medium">{selectedTicket.subject}</p>
                              <p className="text-sm text-gray-500">Betreff</p>
                            </div>
                            
                            <div>
                              <p className="font-medium">{CATEGORY_LABELS[selectedTicket.category]}</p>
                              <p className="text-sm text-gray-500">Kategorie</p>
                            </div>
                            
                            <div className="flex gap-2">
                              {selectedTicket.tags.map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </Card>

                      {/* Ticket Details */}
                      <Card className="p-6">
                        <h3 className="font-cormorant text-xl mb-4 text-elbfunkeln-green">Ticket Details</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                          <div>
                            <p className="font-medium">{new Date(selectedTicket.created_at).toLocaleDateString('de-DE')}</p>
                            <p className="text-sm text-gray-500">Erstellt am</p>
                          </div>
                          
                          <div>
                            <p className="font-medium">{new Date(selectedTicket.updated_at).toLocaleDateString('de-DE')}</p>
                            <p className="text-sm text-gray-500">Zuletzt bearbeitet</p>
                          </div>
                          
                          <div>
                            <p className="font-medium">{selectedTicket.messages.length}</p>
                            <p className="text-sm text-gray-500">Nachrichten</p>
                          </div>
                          
                          <div>
                            <p className="font-medium">{selectedTicket.auto_notifications ? 'Aktiv' : 'Inaktiv'}</p>
                            <p className="text-sm text-gray-500">Auto-Benachrichtigung</p>
                          </div>
                        </div>
                      </Card>

                      {/* Bestellinformationen falls vorhanden */}
                      {selectedTicket.order_id && (
                        <Card className="p-6">
                          <h3 className="font-cormorant text-xl mb-4 text-elbfunkeln-green">Bestellinformationen</h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                              <p className="font-medium">#{selectedTicket.order_id}</p>
                              <p className="text-sm text-gray-500">Bestell-ID</p>
                            </div>
                            
                            {selectedTicket.order_total && (
                              <div>
                                <p className="font-medium">{selectedTicket.order_total.toFixed(2)}€</p>
                                <p className="text-sm text-gray-500">Bestellwert</p>
                              </div>
                            )}
                            
                            {selectedTicket.payment_status && (
                              <div>
                                <Badge className={selectedTicket.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                                  {selectedTicket.payment_status}
                                </Badge>
                                <p className="text-sm text-gray-500 mt-1">Zahlungsstatus</p>
                              </div>
                            )}
                          </div>
                          
                          {selectedTicket.shipping_address && (
                            <div className="mt-4">
                              <p className="font-medium">Lieferadresse:</p>
                              <p className="text-sm text-gray-600">{selectedTicket.shipping_address}</p>
                            </div>
                          )}
                        </Card>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="messages" className="h-full overflow-y-auto">
                    <div className="space-y-4 p-1">
                      <div className="flex-1 space-y-4 max-h-96 overflow-y-auto border rounded-lg p-4">
                        {selectedTicket.messages.map((message) => (
                          <MessageBubble key={message.id} message={message} />
                        ))}
                      </div>
                      
                      {/* Nachricht senden */}
                      <Card className="p-6">
                        <h3 className="font-cormorant text-xl mb-4 text-elbfunkeln-green">Antwort verfassen</h3>
                        <div className="space-y-4">
                          <Textarea
                            placeholder="Ihre Antwort..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            className="min-h-32 resize-none"
                          />
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id="autoNotify"
                                checked={autoNotify}
                                onChange={(e) => setAutoNotify(e.target.checked)}
                                className="rounded"
                              />
                              <label htmlFor="autoNotify" className="text-sm">
                                Kunde benachrichtigen
                              </label>
                            </div>
                            
                            <Button 
                              onClick={sendMessage}
                              disabled={!newMessage.trim()}
                              className="bg-elbfunkeln-green hover:bg-elbfunkeln-green/90"
                            >
                              <Send className="h-4 w-4 mr-2" />
                              Senden
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="order" className="h-full overflow-y-auto">
                    <div className="space-y-6 p-1">
                      {selectedTicket.order_items && selectedTicket.order_items.length > 0 ? (
                        <>
                          <Card className="p-6">
                            <h3 className="font-cormorant text-xl mb-4 text-elbfunkeln-green">Bestellpositionen</h3>
                            <div className="space-y-3">
                              {selectedTicket.order_items.map((item) => (
                                <div key={item.id} className="flex justify-between items-center p-4 border rounded-lg">
                                  <div className="flex-1">
                                    <p className="font-medium">{item.product_name}</p>
                                    {item.sku && <p className="text-sm text-gray-500">SKU: {item.sku}</p>}
                                  </div>
                                  
                                  <div className="text-center">
                                    <p className="font-medium">{item.quantity}x</p>
                                    <p className="text-sm text-gray-500">Menge</p>
                                  </div>
                                  
                                  <div className="text-right">
                                    <p className="font-medium">{item.price.toFixed(2)}€</p>
                                    <p className="text-sm text-gray-500">Einzelpreis</p>
                                  </div>
                                  
                                  <div className="text-right">
                                    <p className="font-medium">{(item.price * item.quantity).toFixed(2)}€</p>
                                    <p className="text-sm text-gray-500">Gesamt</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </Card>
                          
                          {selectedTicket.tracking_number && (
                            <Card className="p-6">
                              <h3 className="font-cormorant text-xl mb-4 text-elbfunkeln-green">Versandinformationen</h3>
                              <div className="flex items-center gap-3">
                                <Truck className="h-5 w-5 text-elbfunkeln-green" />
                                <div>
                                  <p className="font-medium">{selectedTicket.tracking_number}</p>
                                  <p className="text-sm text-gray-500">Sendungsnummer</p>
                                </div>
                              </div>
                            </Card>
                          )}
                        </>
                      ) : (
                        <Card className="p-6">
                          <p className="text-center text-gray-500">Keine Bestellinformationen verfügbar</p>
                        </Card>
                      )}
                      
                      {/* Return Items für Retour-Tickets */}
                      {selectedTicket.return_items && selectedTicket.return_items.length > 0 && (
                        <Card className="p-6">
                          <h3 className="font-cormorant text-xl mb-4 text-elbfunkeln-green">Retour-Artikel</h3>
                          <div className="space-y-3">
                            {selectedTicket.return_items.map((item) => (
                              <div key={item.id} className="flex justify-between items-center p-4 border rounded-lg bg-orange-50">
                                <div>
                                  <p className="font-medium">{item.product_name}</p>
                                  {item.sku && <p className="text-sm text-gray-500">SKU: {item.sku}</p>}
                                </div>
                                
                                <div>
                                  <p className="font-medium">{item.quantity}x</p>
                                </div>
                                
                                <div>
                                  <p className="font-medium">{(item.price * item.quantity).toFixed(2)}€</p>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {selectedTicket.return_reason && (
                            <div className="mt-4 p-4 bg-orange-50 rounded-lg">
                              <p className="font-medium mb-2">Retour-Grund:</p>
                              <p className="text-sm">{selectedTicket.return_reason}</p>
                            </div>
                          )}
                          
                          {selectedTicket.refund_amount && (
                            <div className="mt-4 p-4 bg-green-50 rounded-lg">
                              <p className="font-medium">Rückerstattungsbetrag: {selectedTicket.refund_amount.toFixed(2)}€</p>
                            </div>
                          )}
                        </Card>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="actions" className="h-full overflow-y-auto">
                    <div className="space-y-6 p-1">
                      <Card className="p-6">
                        <h3 className="font-cormorant text-xl mb-4 text-elbfunkeln-green">Status & Priorität</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium mb-2">Status ändern</label>
                            <Select
                              value={selectedTicket.status}
                              onValueChange={(value) => handleStatusUpdate(selectedTicket.id, value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="open">Offen</SelectItem>
                                <SelectItem value="in_progress">In Bearbeitung</SelectItem>
                                <SelectItem value="waiting_customer">Wartet auf Kunde</SelectItem>
                                {selectedTicket.type === 'order' && (
                                  <>
                                    <SelectItem value="shipped">Versendet</SelectItem>
                                    <SelectItem value="delivered">Zugestellt</SelectItem>
                                  </>
                                )}
                                <SelectItem value="resolved">Gelöst</SelectItem>
                                <SelectItem value="closed">Geschlossen</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-2">Priorität ändern</label>
                            <Select
                              value={selectedTicket.priority}
                              onValueChange={(value) => handlePriorityUpdate(selectedTicket.id, value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Niedrig</SelectItem>
                                <SelectItem value="medium">Mittel</SelectItem>
                                <SelectItem value="high">Hoch</SelectItem>
                                <SelectItem value="urgent">Dringend</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </Card>
                      
                      <Card className="p-6">
                        <h3 className="font-cormorant text-xl mb-4 text-elbfunkeln-green">Schnellaktionen</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <Button
                            variant="outline"
                            onClick={() => {
                              // Demo: Rückruf vereinbaren
                              alert('Rückruf für ' + selectedTicket.customer_name + ' geplant');
                            }}
                          >
                            <Phone className="h-4 w-4 mr-2" />
                            Rückruf planen
                          </Button>
                          
                          <Button
                            variant="outline"
                            onClick={() => {
                              // Demo: E-Mail senden
                              alert('E-Mail an ' + selectedTicket.customer_email + ' gesendet');
                            }}
                          >
                            <Mail className="h-4 w-4 mr-2" />
                            E-Mail senden
                          </Button>
                          
                          {selectedTicket.type === 'order' && (
                            <Button
                              variant="outline"
                              onClick={() => {
                                // Demo: Sendungsverfolgung
                                alert('Sendungsverfolgung für Bestellung #' + selectedTicket.order_id);
                              }}
                            >
                              <Truck className="h-4 w-4 mr-2" />
                              Sendung verfolgen
                            </Button>
                          )}
                          
                          {selectedTicket.type === 'return' && (
                            <Button
                              variant="outline"
                              onClick={() => {
                                // Demo: Rückerstattung
                                alert('Rückerstattung von ' + selectedTicket.refund_amount + '€ eingeleitet');
                              }}
                            >
                              <DollarSign className="h-4 w-4 mr-2" />
                              Rückerstattung
                            </Button>
                          )}
                          
                          <Button
                            variant="outline"
                            onClick={() => {
                              // Demo: PDF Export
                              alert('Ticket-PDF wird erstellt');
                            }}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            PDF Export
                          </Button>
                          
                          <Button
                            variant="outline"
                            onClick={() => {
                              // Demo: Archivieren
                              alert('Ticket archiviert');
                            }}
                          >
                            <Archive className="h-4 w-4 mr-2" />
                            Archivieren
                          </Button>
                        </div>
                      </Card>
                      
                      {/* Ticket schließen */}
                      <Card className="p-6 border-red-200">
                        <h3 className="font-cormorant text-xl mb-4 text-red-600">Ticket schließen</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Schließen Sie dieses Ticket, wenn alle Probleme gelöst wurden.
                        </p>
                        <Button
                          variant="destructive"
                          onClick={() => {
                            handleStatusUpdate(selectedTicket.id, 'closed');
                            setShowDetailsDialog(false);
                          }}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Ticket schließen
                        </Button>
                      </Card>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}