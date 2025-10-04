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

export function IntegratedTicketSystemOptimized() {
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

  // Performance: Optimized callbacks
  const handleStatusUpdate = useCallback((ticketId: string, newStatus: string) => {
    const success = serviceUpdateStatus(ticketId, newStatus);
    if (success) {
      // Update selected ticket if it's the one being updated
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket(prev => prev ? {...prev, status: newStatus} : null);
      }
      
      // Automatische E-Mail-Benachrichtigung
      const ticket = tickets.find(t => t.id === ticketId);
      if (ticket && ticket.auto_notifications) {
        setTimeout(() => {
          alert(`E-Mail-Benachrichtigung an ${ticket.customer_name} gesendet: Status geändert zu "${STATUS_LABELS[newStatus]}"`);
        }, 500);
      }
    }
  }, [serviceUpdateStatus, selectedTicket, tickets]);

  const handleViewTicket = useCallback((ticket: UnifiedTicket) => {
    setSelectedTicket(ticket);
    setShowDetailsDialog(true);
  }, []);

  const sendMessage = useCallback(() => {
    if (!selectedTicket || !newMessage.trim()) return;

    const success = addMessageToTicket(selectedTicket.id, {
      sender: 'admin',
      sender_name: 'Admin',
      message: newMessage
    });

    if (success) {
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
  }, [selectedTicket, newMessage, addMessageToTicket, autoNotify]);

  const createDemoOrder = useCallback(() => {
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
    alert('Demo-Bestellung erstellt! Neues Ticket wurde automatisch angelegt.');
  }, []);

  // Initialize once
  useEffect(() => {
    ticketService.initializeMockData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Performance: Memoized Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <Card className="p-4 border-elbfunkeln-lavender/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Gesamt Tickets</p>
              <p className="text-2xl font-semibold text-elbfunkeln-lavender">{stats.total}</p>
            </div>
            <Ticket className="h-8 w-8 text-elbfunkeln-lavender" />
          </div>
        </Card>
        
        <Card className="p-4 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Offen</p>
              <p className="text-2xl font-semibold text-red-600">{stats.open}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
        </Card>
        
        <Card className="p-4 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Bearbeitung</p>
              <p className="text-2xl font-semibold text-blue-600">{stats.inProgress}</p>
            </div>
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
        </Card>
        
        <Card className="p-4 border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Bestellungen</p>
              <p className="text-2xl font-semibold text-orange-600">{stats.orders}</p>
            </div>
            <ShoppingCart className="h-8 w-8 text-orange-600" />
          </div>
        </Card>
        
        <Card className="p-4 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Retouren</p>
              <p className="text-2xl font-semibold text-purple-600">{stats.returns}</p>
            </div>
            <RotateCcw className="h-8 w-8 text-purple-600" />
          </div>
        </Card>
        
        <Card className="p-4 border-green-200">
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
            onClick={createDemoOrder}
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

      {filteredTickets.length === 0 && (
        <div className="text-center py-8">
          <Ticket className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">Keine Tickets gefunden</p>
        </div>
      )}

      {/* Performance: Conditional Dialog Rendering */}
      {selectedTicket && showDetailsDialog && (
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <span>Ticket {selectedTicket.ticket_number}</span>
                <TypeBadge type={selectedTicket.type} />
                <PriorityBadge priority={selectedTicket.priority} />
                <StatusBadge status={selectedTicket.status} />
              </DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="overview" className="h-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Übersicht</TabsTrigger>
                <TabsTrigger value="messages">Nachrichten</TabsTrigger>
                {selectedTicket.type === 'order' && <TabsTrigger value="order">Bestellung</TabsTrigger>}
                {selectedTicket.type === 'return' && <TabsTrigger value="return">Retour</TabsTrigger>}
                <TabsTrigger value="actions">Aktionen</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  {/* Ticket Info */}
                  <Card className="p-4">
                    <h3 className="font-semibold mb-3">Ticket Informationen</h3>
                    <div className="space-y-2 text-sm">
                      <div><span className="text-gray-500">Erstellt:</span> {new Date(selectedTicket.created_at).toLocaleDateString('de-DE')}</div>
                      <div><span className="text-gray-500">Typ:</span> {TYPE_LABELS[selectedTicket.type]}</div>
                      <div><span className="text-gray-500">Kategorie:</span> {CATEGORY_LABELS[selectedTicket.category]}</div>
                      {selectedTicket.order_id && (
                        <div><span className="text-gray-500">Bestellung:</span> {selectedTicket.order_id}</div>
                      )}
                      {selectedTicket.order_total && (
                        <div><span className="text-gray-500">Bestellwert:</span> {selectedTicket.order_total.toFixed(2)}€</div>
                      )}
                      {selectedTicket.payment_status && (
                        <div><span className="text-gray-500">Zahlung:</span> {selectedTicket.payment_status}</div>
                      )}
                    </div>
                  </Card>

                  {/* Kunde */}
                  <Card className="p-4">
                    <h3 className="font-semibold mb-3">Kunde</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span>{selectedTicket.customer_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span>{selectedTicket.customer_email}</span>
                      </div>
                      {selectedTicket.customer_phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span>{selectedTicket.customer_phone}</span>
                        </div>
                      )}
                      {selectedTicket.shipping_address && (
                        <div className="flex items-start gap-2">
                          <Truck className="h-4 w-4 text-gray-400 mt-0.5" />
                          <span>{selectedTicket.shipping_address}</span>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="messages" className="h-[60vh]">
                <div className="flex flex-col h-full">
                  <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                    {selectedTicket.messages.map((message) => (
                      <MessageBubble key={message.id} message={message} />
                    ))}
                  </div>
                  
                  {/* Reply */}
                  <div className="border-t pt-4">
                    <div className="flex items-start gap-3">
                      <Textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Antwort verfassen..."
                        className="flex-1"
                        rows={3}
                      />
                      <div className="flex flex-col gap-2">
                        <Button 
                          onClick={sendMessage}
                          disabled={!newMessage.trim()}
                          size="sm"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Senden
                        </Button>
                        <div className="flex items-center gap-2 text-xs">
                          <input 
                            type="checkbox" 
                            checked={autoNotify}
                            onChange={(e) => setAutoNotify(e.target.checked)}
                            className="rounded"
                          />
                          <span className="text-gray-500">Kunde benachrichtigen</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              {selectedTicket.type === 'order' && selectedTicket.order_items && (
                <TabsContent value="order" className="space-y-4">
                  <Card className="p-4">
                    <h3 className="font-semibold mb-3">Bestelldetails</h3>
                    <div className="space-y-4">
                      {selectedTicket.order_items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center border-b pb-2">
                          <div>
                            <div className="font-medium">{item.product_name}</div>
                            {item.sku && <div className="text-sm text-gray-500">SKU: {item.sku}</div>}
                          </div>
                          <div className="text-right">
                            <div>{item.quantity}x {item.price.toFixed(2)}€</div>
                            <div className="font-semibold">{(item.quantity * item.price).toFixed(2)}€</div>
                          </div>
                        </div>
                      ))}
                      <div className="pt-2 border-t">
                        <div className="flex justify-between font-semibold">
                          <span>Gesamtsumme:</span>
                          <span>{selectedTicket.order_total?.toFixed(2)}€</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </TabsContent>
              )}
              
              {selectedTicket.type === 'return' && (
                <TabsContent value="return" className="space-y-4">
                  <Card className="p-4">
                    <h3 className="font-semibold mb-3">Retourendetails</h3>
                    <div className="space-y-3">
                      <div><span className="text-gray-500">Grund:</span> {selectedTicket.return_reason}</div>
                      <div><span className="text-gray-500">Status:</span> {selectedTicket.return_status}</div>
                      {selectedTicket.refund_amount && (
                        <div><span className="text-gray-500">Erstattungsbetrag:</span> {selectedTicket.refund_amount.toFixed(2)}€</div>
                      )}
                    </div>
                    
                    {selectedTicket.return_items && (
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Retourierte Artikel:</h4>
                        {selectedTicket.return_items.map((item) => (
                          <div key={item.id} className="flex justify-between items-center border-b pb-2">
                            <div>
                              <div className="font-medium">{item.product_name}</div>
                              {item.sku && <div className="text-sm text-gray-500">SKU: {item.sku}</div>}
                            </div>
                            <div className="text-right">
                              <div>{item.quantity}x {item.price.toFixed(2)}€</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                </TabsContent>
              )}
              
              <TabsContent value="actions" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-4">
                    <h3 className="font-semibold mb-3">Status ändern</h3>
                    <Select 
                      value={selectedTicket.status} 
                      onValueChange={(value) => {
                        handleStatusUpdate(selectedTicket.id, value);
                        setSelectedTicket({...selectedTicket, status: value});
                      }}
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
                  </Card>

                  <Card className="p-4">
                    <h3 className="font-semibold mb-3">Schnellaktionen</h3>
                    <div className="space-y-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start"
                        onClick={() => alert('E-Mail an Kunden wird versendet...')}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        E-Mail senden
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start"
                        onClick={() => alert('Tracking-Nummer wird aktualisiert...')}
                      >
                        <Package className="h-4 w-4 mr-2" />
                        Tracking hinzufügen
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start"
                        onClick={() => alert('Erstattung wird bearbeitet...')}
                      >
                        <DollarSign className="h-4 w-4 mr-2" />
                        Erstattung
                      </Button>
                    </div>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}