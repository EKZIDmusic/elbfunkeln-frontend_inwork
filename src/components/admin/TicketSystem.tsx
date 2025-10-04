import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Ticket, Search, Eye, RefreshCw, Calendar,
  MessageSquare, Clock, AlertCircle, CheckCircle, 
  XCircle, Mail, Phone, User, Package,
  ArrowUp, ArrowDown, Minus, Plus, Send,
  Flag, Star, Archive, Filter
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

interface TicketMessage {
  id: string;
  sender: 'customer' | 'admin';
  sender_name: string;
  message: string;
  timestamp: string;
  attachments?: string[];
}

interface OrderTicket {
  id: string;
  order_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  subject: string;
  category: 'order_status' | 'payment' | 'shipping' | 'return' | 'complaint' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
  created_at: string;
  updated_at: string;
  assigned_to?: string;
  tags: string[];
  messages: TicketMessage[];
  order_total?: number;
  auto_notifications: boolean;
}

// Mock data für Demo-Zwecke
const mockTickets: OrderTicket[] = [
  {
    id: 'TIC-001',
    order_id: 'ORD-12345',
    customer_name: 'Anna Müller',
    customer_email: 'anna.mueller@email.com',
    customer_phone: '+49 170 1234567',
    subject: 'Wo ist meine Bestellung?',
    category: 'order_status',
    priority: 'medium',
    status: 'open',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z',
    tags: ['versand', 'tracking'],
    order_total: 89.99,
    auto_notifications: true,
    messages: [
      {
        id: 'msg-1',
        sender: 'customer',
        sender_name: 'Anna Müller',
        message: 'Hallo, ich habe vor 3 Tagen bestellt, aber noch keine Versandbestätigung erhalten. Könnten Sie mir bitte den Status mitteilen?',
        timestamp: '2024-01-15T10:30:00Z'
      }
    ]
  },
  {
    id: 'TIC-002',
    order_id: 'ORD-12346',
    customer_name: 'Maria Schmidt',
    customer_email: 'maria.schmidt@email.com',
    subject: 'Zahlung fehlgeschlagen',
    category: 'payment',
    priority: 'high',
    status: 'in_progress',
    created_at: '2024-01-14T15:45:00Z',
    updated_at: '2024-01-15T09:20:00Z',
    assigned_to: 'admin',
    tags: ['zahlung', 'paypal'],
    order_total: 129.99,
    auto_notifications: true,
    messages: [
      {
        id: 'msg-2',
        sender: 'customer',
        sender_name: 'Maria Schmidt',
        message: 'Meine PayPal-Zahlung wurde abgelehnt, obwohl mein Konto gedeckt ist. Was kann ich tun?',
        timestamp: '2024-01-14T15:45:00Z'
      },
      {
        id: 'msg-3',
        sender: 'admin',
        sender_name: 'Admin',
        message: 'Hallo Frau Schmidt, wir überprüfen das Problem mit PayPal. In der Zwischenzeit können Sie auch per Überweisung bezahlen.',
        timestamp: '2024-01-15T09:20:00Z'
      }
    ]
  },
  {
    id: 'TIC-003',
    order_id: 'ORD-12347',
    customer_name: 'Lisa Weber',
    customer_email: 'lisa.weber@email.com',
    subject: 'Produkt beschädigt erhalten',
    category: 'complaint',
    priority: 'urgent',
    status: 'resolved',
    created_at: '2024-01-12T08:15:00Z',
    updated_at: '2024-01-14T16:30:00Z',
    assigned_to: 'admin',
    tags: ['beschädigung', 'retour', 'ersatz'],
    order_total: 149.99,
    auto_notifications: true,
    messages: [
      {
        id: 'msg-4',
        sender: 'customer',
        sender_name: 'Lisa Weber',
        message: 'Die Kette kam mit einem gebrochenen Verschluss an. Können Sie Ersatz senden?',
        timestamp: '2024-01-12T08:15:00Z'
      },
      {
        id: 'msg-5',
        sender: 'admin',
        sender_name: 'Admin',
        message: 'Es tut uns sehr leid! Wir senden Ihnen sofort kostenlosen Ersatz. Tracking-Nummer folgt per E-Mail.',
        timestamp: '2024-01-14T16:30:00Z'
      }
    ]
  }
];

export function TicketSystem() {
  const [tickets, setTickets] = useState<OrderTicket[]>(mockTickets);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState<OrderTicket | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [autoNotify, setAutoNotify] = useState(true);

  // Filter tickets
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = searchQuery === '' || 
      ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.customer_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.order_id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || ticket.status === selectedStatus;
    const matchesPriority = selectedPriority === 'all' || ticket.priority === selectedPriority;
    const matchesCategory = selectedCategory === 'all' || ticket.category === selectedCategory;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const getStatusLabel = (status: string) => {
    const statusLabels: Record<string, string> = {
      open: 'Offen',
      in_progress: 'In Bearbeitung',
      waiting_customer: 'Wartet auf Kunde',
      resolved: 'Gelöst',
      closed: 'Geschlossen'
    };
    return statusLabels[status] || status;
  };

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      open: 'bg-red-100 text-red-800 border-red-200',
      in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
      waiting_customer: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      resolved: 'bg-green-100 text-green-800 border-green-200',
      closed: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    
    return (
      <Badge className={statusStyles[status] || statusStyles.open}>
        {getStatusLabel(status)}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityStyles: Record<string, string> = {
      low: 'bg-gray-100 text-gray-800 border-gray-200',
      medium: 'bg-blue-100 text-blue-800 border-blue-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      urgent: 'bg-red-100 text-red-800 border-red-200'
    };

    const priorityLabels: Record<string, string> = {
      low: 'Niedrig',
      medium: 'Mittel',
      high: 'Hoch',
      urgent: 'Dringend'
    };
    
    return (
      <Badge className={priorityStyles[priority] || priorityStyles.medium}>
        {priorityLabels[priority] || priority}
      </Badge>
    );
  };

  const getCategoryLabel = (category: string) => {
    const categoryLabels: Record<string, string> = {
      order_status: 'Bestellstatus',
      payment: 'Zahlung',
      shipping: 'Versand',
      return: 'Retour',
      complaint: 'Beschwerde',
      general: 'Allgemein'
    };
    return categoryLabels[category] || category;
  };

  const handleStatusUpdate = (ticketId: string, newStatus: OrderTicket['status']) => {
    setTickets(tickets.map(t => 
      t.id === ticketId 
        ? { ...t, status: newStatus, updated_at: new Date().toISOString() }
        : t
    ));
    
    // Automatische E-Mail-Benachrichtigung
    const ticket = tickets.find(t => t.id === ticketId);
    if (ticket && ticket.auto_notifications) {
      setTimeout(() => {
        alert(`E-Mail-Benachrichtigung an ${ticket.customer_name} gesendet: Status geändert zu "${getStatusLabel(newStatus)}"`);
      }, 500);
    }
  };

  const handlePriorityUpdate = (ticketId: string, newPriority: OrderTicket['priority']) => {
    setTickets(tickets.map(t => 
      t.id === ticketId 
        ? { ...t, priority: newPriority, updated_at: new Date().toISOString() }
        : t
    ));
  };

  const sendMessage = () => {
    if (!selectedTicket || !newMessage.trim()) return;

    const message: TicketMessage = {
      id: `msg-${Date.now()}`,
      sender: 'admin',
      sender_name: 'Admin',
      message: newMessage,
      timestamp: new Date().toISOString()
    };

    const updatedTicket = {
      ...selectedTicket,
      messages: [...selectedTicket.messages, message],
      updated_at: new Date().toISOString(),
      status: 'in_progress' as const
    };

    setTickets(tickets.map(t => t.id === selectedTicket.id ? updatedTicket : t));
    setSelectedTicket(updatedTicket);
    setNewMessage('');

    // Automatische E-Mail-Benachrichtigung
    if (autoNotify) {
      setTimeout(() => {
        alert(`E-Mail-Benachrichtigung an ${selectedTicket.customer_name} gesendet`);
      }, 500);
    }
  };

  // Calculate stats
  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    urgent: tickets.filter(t => t.priority === 'urgent').length,
    avgResponseTime: '2.5h'
  };

  return (
    <div className="space-y-6">
      {/* Ticket Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
              <p className="text-sm text-gray-600">Dringend</p>
              <p className="text-2xl font-semibold text-orange-600">{stats.urgent}</p>
            </div>
            <Flag className="h-8 w-8 text-orange-600" />
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
          
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Status</SelectItem>
              <SelectItem value="open">Offen</SelectItem>
              <SelectItem value="in_progress">In Bearbeitung</SelectItem>
              <SelectItem value="waiting_customer">Wartet auf Kunde</SelectItem>
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

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Kategorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle</SelectItem>
              <SelectItem value="order_status">Bestellstatus</SelectItem>
              <SelectItem value="payment">Zahlung</SelectItem>
              <SelectItem value="shipping">Versand</SelectItem>
              <SelectItem value="return">Retour</SelectItem>
              <SelectItem value="complaint">Beschwerde</SelectItem>
              <SelectItem value="general">Allgemein</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Aktualisieren
        </Button>
      </div>

      {/* Tickets Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticket-ID</TableHead>
              <TableHead>Kunde</TableHead>
              <TableHead>Betreff</TableHead>
              <TableHead>Kategorie</TableHead>
              <TableHead>Priorität</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Letzte Aktivität</TableHead>
              <TableHead>Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTickets.map((ticket) => (
              <TableRow key={ticket.id} className={ticket.priority === 'urgent' ? 'bg-red-50' : ''}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">{ticket.id}</span>
                    {ticket.priority === 'urgent' && <Flag className="h-4 w-4 text-red-500" />}
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-semibold">{ticket.customer_name}</div>
                    <div className="text-sm text-gray-500">{ticket.customer_email}</div>
                    {ticket.order_id && (
                      <div className="text-xs text-gray-400">Bestellung: {ticket.order_id}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-48 truncate font-medium">{ticket.subject}</div>
                  <div className="text-sm text-gray-500">
                    {ticket.messages.length} Nachrichten
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{getCategoryLabel(ticket.category)}</Badge>
                </TableCell>
                <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                <TableCell>{getStatusBadge(ticket.status)}</TableCell>
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
                      onClick={() => {
                        setSelectedTicket(ticket);
                        setShowDetailsDialog(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    <Select 
                      value={ticket.status} 
                      onValueChange={(value: OrderTicket['status']) => handleStatusUpdate(ticket.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Offen</SelectItem>
                        <SelectItem value="in_progress">In Bearbeitung</SelectItem>
                        <SelectItem value="waiting_customer">Wartet auf Kunde</SelectItem>
                        <SelectItem value="resolved">Gelöst</SelectItem>
                        <SelectItem value="closed">Geschlossen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TableCell>
              </TableRow>
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

      {/* Ticket Details Dialog */}
      {selectedTicket && (
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden" aria-describedby="ticket-details-description">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <span>Ticket {selectedTicket.id}</span>
                {getPriorityBadge(selectedTicket.priority)}
                {getStatusBadge(selectedTicket.status)}
              </DialogTitle>
            </DialogHeader>
            <div id="ticket-details-description" className="sr-only">
              Details für Ticket {selectedTicket.id} mit Kundeninformationen und Nachrichtenverlauf
            </div>
            
            <div className="grid grid-cols-3 gap-6 h-full">
              {/* Ticket Info */}
              <div className="space-y-4">
                <Card className="p-4">
                  <h3 className="font-semibold mb-3">Ticket Informationen</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-500">Erstellt:</span> {new Date(selectedTicket.created_at).toLocaleDateString('de-DE')}</div>
                    <div><span className="text-gray-500">Kategorie:</span> {getCategoryLabel(selectedTicket.category)}</div>
                    <div><span className="text-gray-500">Bestellung:</span> {selectedTicket.order_id}</div>
                    {selectedTicket.order_total && (
                      <div><span className="text-gray-500">Bestellwert:</span> {selectedTicket.order_total.toFixed(2)}€</div>
                    )}
                  </div>
                </Card>

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
                  </div>
                </Card>

                <Card className="p-4">
                  <h3 className="font-semibold mb-3">Priorität ändern</h3>
                  <Select 
                    value={selectedTicket.priority} 
                    onValueChange={(value: OrderTicket['priority']) => {
                      handlePriorityUpdate(selectedTicket.id, value);
                      setSelectedTicket({...selectedTicket, priority: value});
                    }}
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
                </Card>
              </div>
              
              {/* Messages */}
              <div className="col-span-2 flex flex-col h-[60vh]">
                <div className="mb-4">
                  <h3 className="font-semibold">{selectedTicket.subject}</h3>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                  {selectedTicket.messages.map((message) => (
                    <div 
                      key={message.id} 
                      className={`flex ${message.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] rounded-lg p-3 ${
                        message.sender === 'admin' 
                          ? 'bg-elbfunkeln-lavender/20 text-right' 
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
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}