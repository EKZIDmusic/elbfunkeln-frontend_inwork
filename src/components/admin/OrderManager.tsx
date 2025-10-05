// Vereinfachter Bestellungsmanager für Elbfunkeln Admin-Dashboard
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
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
import { useAuth } from '../AuthContext';
import apiService, { Order as ApiOrder } from '../../services/apiService';
import { toast } from 'sonner@2.0.3';

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

export function OrderManager() {
  const { accessToken } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  // Load orders on mount
  useEffect(() => {
    if (accessToken) {
      loadOrders();
    }
  }, [accessToken]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const apiOrders = await apiService.admin.orders.getAll();

      // Transform API orders to component format
      const transformedOrders: Order[] = apiOrders.map(order => ({
        id: order.id,
        customer_name: `${order.user?.firstName || ''} ${order.user?.lastName || ''}`.trim() || 'Unbekannt',
        customer_email: order.user?.email || 'Keine E-Mail',
        status: order.status.toLowerCase() as Order['status'],
        created_at: order.createdAt,
        total: order.totalAmount,
        items: order.items.map(item => ({
          id: item.id,
          product_name: item.product?.name || 'Unbekanntes Produkt',
          quantity: item.quantity,
          price: item.price
        }))
      }));

      setOrders(transformedOrders);
      toast.success('Bestellungen erfolgreich geladen');
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Fehler beim Laden der Bestellungen');
    } finally {
      setLoading(false);
    }
  };

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
  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    try {
      setLoading(true);

      await apiService.admin.orders.updateStatus(orderId, { status: newStatus.toUpperCase() as any });

      // Update local state
      setOrders(orders.map(o =>
        o.id === orderId ? { ...o, status: newStatus } : o
      ));

      toast.success(`Bestellstatus erfolgreich auf "${getStatusLabel(newStatus)}" geändert`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Fehler beim Ändern des Bestellstatus');
    } finally {
      setLoading(false);
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

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-5 w-5 animate-spin text-elbfunkeln-green" />
          <span className="text-elbfunkeln-green">Lade Bestellungen...</span>
        </div>
      </div>
    );
  }

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
          onClick={loadData} 
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
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Bestelldetails - {selectedOrder.id}</DialogTitle>
            </DialogHeader>
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
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}