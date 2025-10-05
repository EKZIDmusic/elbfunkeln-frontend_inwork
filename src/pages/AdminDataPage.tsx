import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { 
  ShoppingCart, 
  Users, 
  Mail, 
  MessageSquare, 
  Package, 
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';
import apiService, { Product, Order } from '../services/apiService';
import { useAuth } from '../components/AuthContext';
import { EnhancedUserManager } from '../components/admin/EnhancedUserManager';
import { RegistrationDebugger } from '../components/admin/RegistrationDebugger';

// Placeholder types until we implement these in apiService
interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  subject: string;
  status: string;
  created_at: string;
}

interface NewsletterSubscriber {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  subscribed_at: string;
  is_active: boolean;
  source?: string;
}

export function AdminDataPage() {
  const { isAdmin, isShopOwner } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    newsletterSubscribers: 0,
    pendingInquiries: 0
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);

  useEffect(() => {
    if (isAdmin() || isShopOwner()) {
      loadData();
    }
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load only data that exists in apiService
      const [productsResponse, ordersData] = await Promise.all([
        apiService.products.getAll({ limit: 10 }),
        apiService.orders.getAll()
      ]);

      setProducts(productsResponse.data);
      setOrders(ordersData);

      // Calculate stats from loaded data
      const totalRevenue = ordersData.reduce((sum, order) => sum + order.total, 0);
      setStats({
        totalProducts: productsResponse.total,
        totalOrders: ordersData.length,
        totalRevenue,
        newsletterSubscribers: 0, // TODO: Implement in API
        pendingInquiries: 0 // TODO: Implement in API
      });

      // Placeholders for not yet implemented features
      setInquiries([]);
      setSubscribers([]);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'pending': { label: 'Ausstehend', color: 'bg-yellow-100 text-yellow-800' },
      'confirmed': { label: 'Bestätigt', color: 'bg-blue-100 text-blue-800' },
      'processing': { label: 'In Bearbeitung', color: 'bg-orange-100 text-orange-800' },
      'shipped': { label: 'Versandt', color: 'bg-purple-100 text-purple-800' },
      'delivered': { label: 'Zugestellt', color: 'bg-green-100 text-green-800' },
      'cancelled': { label: 'Storniert', color: 'bg-red-100 text-red-800' },
      'open': { label: 'Offen', color: 'bg-yellow-100 text-yellow-800' },
      'in_progress': { label: 'In Bearbeitung', color: 'bg-blue-100 text-blue-800' },
      'resolved': { label: 'Gelöst', color: 'bg-green-100 text-green-800' },
      'closed': { label: 'Geschlossen', color: 'bg-gray-100 text-gray-800' }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, color: 'bg-gray-100 text-gray-800' };
    return <Badge className={statusInfo.color}>{statusInfo.label}</Badge>;
  };

  if (!isAdmin() && !isShopOwner()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-elbfunkeln-beige/30 via-white to-elbfunkeln-lavender/20">
        <div className="text-center">
          <h1 className="font-cormorant text-2xl text-elbfunkeln-green mb-4">
            Zugriff verweigert
          </h1>
          <p className="text-elbfunkeln-green/70">
            Sie haben keine Berechtigung für diesen Bereich.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-24 bg-gradient-to-br from-elbfunkeln-beige/30 via-white to-elbfunkeln-lavender/20">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 bg-gradient-to-br from-elbfunkeln-beige/30 via-white to-elbfunkeln-lavender/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="font-cormorant text-3xl text-elbfunkeln-green mb-2">
            🗄️ Elbfunkeln Datenverwaltung
          </h1>
          <p className="text-elbfunkeln-green/70">
            Übersicht über alle Shop-Daten und Verwaltungsfunktionen
          </p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="border-elbfunkeln-green/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-elbfunkeln-lavender to-elbfunkeln-rose rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-elbfunkeln-green/70 text-sm">Produkte</p>
                  <p className="font-cormorant text-2xl text-elbfunkeln-green">{stats.totalProducts}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-elbfunkeln-green/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-elbfunkeln-green to-elbfunkeln-beige rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-elbfunkeln-green/70 text-sm">Bestellungen</p>
                  <p className="font-cormorant text-2xl text-elbfunkeln-green">{stats.totalOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-elbfunkeln-green/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-elbfunkeln-rose to-elbfunkeln-lavender rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-elbfunkeln-green/70 text-sm">Umsatz</p>
                  <p className="font-cormorant text-xl text-elbfunkeln-green">{formatPrice(stats.totalRevenue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-elbfunkeln-green/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-elbfunkeln-beige to-elbfunkeln-green rounded-lg flex items-center justify-center">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-elbfunkeln-green/70 text-sm">Newsletter</p>
                  <p className="font-cormorant text-2xl text-elbfunkeln-green">{stats.newsletterSubscribers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-elbfunkeln-green/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-elbfunkeln-lavender to-elbfunkeln-beige rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-elbfunkeln-green/70 text-sm">Anfragen</p>
                  <p className="font-cormorant text-2xl text-elbfunkeln-green">{stats.pendingInquiries}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Data Tables */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Tabs defaultValue="products" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="products">Produkte ({products.length})</TabsTrigger>
              <TabsTrigger value="orders">Bestellungen ({orders.length})</TabsTrigger>
              <TabsTrigger value="inquiries">Anfragen ({inquiries.length})</TabsTrigger>
              <TabsTrigger value="newsletter">Newsletter ({subscribers.length})</TabsTrigger>
              <TabsTrigger value="users">👥 Benutzer</TabsTrigger>
              <TabsTrigger value="debug">🐛 Debug</TabsTrigger>
            </TabsList>

            {/* Products Tab */}
            <TabsContent value="products">
              <Card className="border-elbfunkeln-green/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-elbfunkeln-green">Produkte verwalten</CardTitle>
                    <Button size="sm" className="bg-elbfunkeln-lavender hover:bg-elbfunkeln-rose">
                      <Plus className="w-4 h-4 mr-2" />
                      Neues Produkt
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Bild</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Kategorie</TableHead>
                          <TableHead>Preis</TableHead>
                          <TableHead>Lager</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Aktionen</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {products.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell>
                              <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                                <img
                                  src={product.images?.[0]?.url || 'https://via.placeholder.com/48x48'}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>{product.category?.name || 'Unbekannt'}</TableCell>
                            <TableCell>{formatPrice(product.price)}</TableCell>
                            <TableCell>
                              <Badge className={product.stock > 5 ? 'bg-green-100 text-green-800' : product.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}>
                                {product.stock}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={product.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                {product.isActive ? 'Aktiv' : 'Inaktiv'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline">
                                  <Eye className="w-3 h-3" />
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders">
              <Card className="border-elbfunkeln-green/20">
                <CardHeader>
                  <CardTitle className="text-elbfunkeln-green">Bestellungen verwalten</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Bestellnummer</TableHead>
                          <TableHead>Kunde</TableHead>
                          <TableHead>Datum</TableHead>
                          <TableHead>Betrag</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Zahlung</TableHead>
                          <TableHead>Aktionen</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-mono">{order.orderNumber}</TableCell>
                            <TableCell>Kunde #{order.userId}</TableCell>
                            <TableCell>{formatDate(order.createdAt)}</TableCell>
                            <TableCell>{formatPrice(order.total)}</TableCell>
                            <TableCell>{getStatusBadge(order.status)}</TableCell>
                            <TableCell>{getStatusBadge(order.paymentStatus)}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline">
                                  <Eye className="w-3 h-3" />
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Edit className="w-3 h-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Inquiries Tab */}
            <TabsContent value="inquiries">
              <Card className="border-elbfunkeln-green/20">
                <CardHeader>
                  <CardTitle className="text-elbfunkeln-green">Kontaktanfragen</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>E-Mail</TableHead>
                          <TableHead>Betreff</TableHead>
                          <TableHead>Datum</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Aktionen</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {inquiries.map((inquiry) => (
                          <TableRow key={inquiry.id}>
                            <TableCell>{inquiry.name}</TableCell>
                            <TableCell>{inquiry.email}</TableCell>
                            <TableCell className="max-w-xs truncate">{inquiry.subject}</TableCell>
                            <TableCell>{formatDate(inquiry.created_at)}</TableCell>
                            <TableCell>{getStatusBadge(inquiry.status)}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline">
                                  <Eye className="w-3 h-3" />
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Edit className="w-3 h-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Newsletter Tab */}
            <TabsContent value="newsletter">
              <Card className="border-elbfunkeln-green/20">
                <CardHeader>
                  <CardTitle className="text-elbfunkeln-green">Newsletter-Abonnenten</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>E-Mail</TableHead>
                          <TableHead>Anmeldedatum</TableHead>
                          <TableHead>Quelle</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Aktionen</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {subscribers.map((subscriber) => (
                          <TableRow key={subscriber.id}>
                            <TableCell>
                              {subscriber.first_name && subscriber.last_name 
                                ? `${subscriber.first_name} ${subscriber.last_name}`
                                : subscriber.first_name || 'Unbekannt'
                              }
                            </TableCell>
                            <TableCell>{subscriber.email}</TableCell>
                            <TableCell>{formatDate(subscriber.subscribed_at)}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {subscriber.source || 'Unbekannt'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={subscriber.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                {subscriber.is_active ? 'Aktiv' : 'Inaktiv'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline">
                                  <Eye className="w-3 h-3" />
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Edit className="w-3 h-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users">
              <EnhancedUserManager />
            </TabsContent>

            {/* Debug Tab */}
            <TabsContent value="debug">
              <RegistrationDebugger />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}