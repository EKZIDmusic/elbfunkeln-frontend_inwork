// Vereinfachter Bestellungsmanager für Elbfunkeln Admin-Dashboard
import React, { useState } from 'react';
import { 
  Package, Search, Eye, RefreshCw, Calendar,
  TrendingUp, DollarSign, ShoppingCart, Truck,
  Mail, MessageSquare, AlertCircle, CheckCircle
} from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
  total: number;
  items: OrderItem[];
}

// Mock data für Demo-Zwecke
const mockOrders: Order[] = [
  {
    id: 'ORD-12345',
    customer_name: 'Anna Müller',
    customer_email: 'anna.mueller@email.com',
    status: 'pending',
    created_at: '2024-01-15T10:30:00Z',
    total: 89.99,
    items: [
      { id: '1', product_name: 'Silber Armband "Luna"', quantity: 1, price: 89.99 }
    ]
  },
  {
    id: 'ORD-12346',
    customer_name: 'Maria Schmidt',
    customer_email: 'maria.schmidt@email.com',
    status: 'processing',
    created_at: '2024-01-14T15:45:00Z',
    total: 129.99,
    items: [
      { id: '2', product_name: 'Gold Ohrringe "Stella"', quantity: 1, price: 129.99 }
    ]
  },
  {
    id: 'ORD-12347',
    customer_name: 'Lisa Weber',
    customer_email: 'lisa.weber@email.com',
    status: 'shipped',
    created_at: '2024-01-12T08:15:00Z',
    total: 149.99,
    items: [
      { id: '3', product_name: 'Roségold Kette "Harmony"', quantity: 1, price: 149.99 }
    ]
  },
  {
    id: 'ORD-12348',
    customer_name: 'Tom Fischer',
    customer_email: 'tom.fischer@email.com',
    status: 'delivered',
    created_at: '2024-01-10T14:20:00Z',
    total: 79.99,
    items: [
      { id: '4', product_name: 'Silber Ring "Cosmos"', quantity: 1, price: 79.99 }
    ]
  }
];

export function OrderManagerSimple() {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchQuery === '' || 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Update order status
  const handleStatusUpdate = (orderId: string, newStatus: Order['status']) => {
    setOrders(orders.map(o => 
      o.id === orderId ? { ...o, status: newStatus } : o
    ));
    
    // Automatische Kundenbenachrichtigung simulieren
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setTimeout(() => {
        alert(`E-Mail-Benachrichtigung an ${order.customer_name} gesendet: Status geändert zu "${getStatusLabel(newStatus)}"`);
      }, 500);
    }
  };

  const getStatusLabel = (status: string) => {
    const statusLabels: Record<string, string> = {
      pending: 'Ausstehend',
      processing: 'In Bearbeitung',
      shipped: 'Versendet',
      delivered: 'Zugestellt',
      cancelled: 'Storniert'
    };
    return statusLabels[status] || status;
  };

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      processing: 'bg-blue-100 text-blue-800 border-blue-200',
      shipped: 'bg-purple-100 text-purple-800 border-purple-200',
      delivered: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    };
    
    return (
      <Badge className={statusStyles[status] || statusStyles.pending}>
        {getStatusLabel(status)}
      </Badge>
    );
  };

  // Calculate stats
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    totalRevenue: orders.reduce((sum, order) => sum + order.total, 0)
  };

  return (
    <div className="space-y-6">
      {/* Order Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-4 border-elbfunkeln-green/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Gesamt</p>
              <p className="text-2xl font-semibold text-elbfunkeln-green">{stats.total}</p>
            </div>
            <ShoppingCart className="h-8 w-8 text-elbfunkeln-green" />
          </div>
        </Card>
        
        <Card className="p-4 border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ausstehend</p>
              <p className="text-2xl font-semibold text-yellow-600">{stats.pending}</p>
            </div>
            <Calendar className="h-8 w-8 text-yellow-600" />
          </div>
        </Card>
        
        <Card className="p-4 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Bearbeitung</p>
              <p className="text-2xl font-semibold text-blue-600">{stats.processing}</p>
            </div>
            <Package className="h-8 w-8 text-blue-600" />
          </div>
        </Card>
        
        <Card className="p-4 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Versendet</p>
              <p className="text-2xl font-semibold text-purple-600">{stats.shipped}</p>
            </div>
            <Truck className="h-8 w-8 text-purple-600" />
          </div>
        </Card>
        
        <Card className="p-4 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Umsatz</p>
              <p className="text-2xl font-semibold text-green-600">{stats.totalRevenue.toFixed(2)} €</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Bestellungen suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Status</SelectItem>
              <SelectItem value="pending">Ausstehend</SelectItem>
              <SelectItem value="processing">In Bearbeitung</SelectItem>
              <SelectItem value="shipped">Versendet</SelectItem>
              <SelectItem value="delivered">Zugestellt</SelectItem>
              <SelectItem value="cancelled">Storniert</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={() => setLoading(!loading)} 
          variant="outline" 
          size="sm"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Aktualisieren
        </Button>
      </div>

      {/* Orders Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bestell-ID</TableHead>
              <TableHead>Kunde</TableHead>
              <TableHead>Artikel</TableHead>
              <TableHead>Betrag</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Datum</TableHead>
              <TableHead>Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <span className="font-mono text-sm">{order.id}</span>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-semibold">{order.customer_name}</div>
                    <div className="text-sm text-gray-500">{order.customer_email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {order.items.length} Artikel
                    {order.items.length > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        {order.items[0].product_name}
                        {order.items.length > 1 && ` +${order.items.length - 1} weitere`}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-semibold">{order.total.toFixed(2)} €</span>
                </TableCell>
                <TableCell>{getStatusBadge(order.status)}</TableCell>
                <TableCell>
                  <div className="text-sm">
                    {new Date(order.created_at).toLocaleDateString('de-DE')}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowDetailsDialog(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => alert(`E-Mail an ${order.customer_name} gesendet`)}
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                    
                    <Select 
                      value={order.status} 
                      onValueChange={(value: Order['status']) => handleStatusUpdate(order.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Ausstehend</SelectItem>
                        <SelectItem value="processing">In Bearbeitung</SelectItem>
                        <SelectItem value="shipped">Versendet</SelectItem>
                        <SelectItem value="delivered">Zugestellt</SelectItem>
                        <SelectItem value="cancelled">Storniert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {filteredOrders.length === 0 && !loading && (
        <div className="text-center py-8">
          <ShoppingCart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">Keine Bestellungen gefunden</p>
        </div>
      )}

      {/* Order Details Dialog */}
      {selectedOrder && (
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-2xl" aria-describedby="order-details-description">
            <DialogHeader>
              <DialogTitle>Bestelldetails - {selectedOrder.id}</DialogTitle>
            </DialogHeader>
            <div id="order-details-description" className="sr-only">
              Detailansicht für Bestellung {selectedOrder.id} mit Kundeninformationen und bestellten Artikeln
            </div>
            <div className="space-y-6">
              {/* Customer Information */}
              <div>
                <h3 className="font-semibold mb-2">Kundeninformationen</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Name:</span>
                    <p>{selectedOrder.customer_name}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">E-Mail:</span>
                    <p>{selectedOrder.customer_email}</p>
                  </div>
                </div>
              </div>

              {/* Order Information */}
              <div>
                <h3 className="font-semibold mb-2">Bestellinformationen</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <p>{getStatusBadge(selectedOrder.status)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Bestellt am:</span>
                    <p>{new Date(selectedOrder.created_at).toLocaleDateString('de-DE')}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Gesamtbetrag:</span>
                    <p className="font-semibold">{selectedOrder.total.toFixed(2)} €</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold mb-2">Bestellte Artikel</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-sm text-gray-500">Menge: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{item.price.toFixed(2)} €</p>
                        <p className="text-sm text-gray-500">à {(item.price / item.quantity).toFixed(2)} €</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => alert('Rechnung gesendet')}>
                  <Mail className="h-4 w-4 mr-2" />
                  Rechnung senden
                </Button>
                <Button variant="outline" onClick={() => alert('Tracking-Info gesendet')}>
                  <Truck className="h-4 w-4 mr-2" />
                  Tracking senden
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}