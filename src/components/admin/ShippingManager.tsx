import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Truck, Package, MapPin, Clock, CheckCircle, AlertTriangle, 
  Plus, Edit, Trash2, Eye, Search, Filter, Download, Send,
  Plane, Ship, Car, Home, RefreshCw, RotateCcw, XCircle
} from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { Separator } from '../ui/separator';
import { 
  mockShippingMethods, mockShipments, mockReturnRequests,
  type ShippingMethod, type Shipment, type ReturnRequest 
} from '../../data/adminData';

export function ShippingManager() {
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>(mockShippingMethods);
  const [shipments, setShipments] = useState<Shipment[]>(mockShipments);
  const [returnRequests, setReturnRequests] = useState<ReturnRequest[]>(mockReturnRequests);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const getShippingStatusColor = (status: string) => {
    const colors = {
      preparing: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      shipped: 'bg-blue-100 text-blue-800 border-blue-200',
      in_transit: 'bg-purple-100 text-purple-800 border-purple-200',
      delivered: 'bg-green-100 text-green-800 border-green-200',
      returned: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getShippingStatusIcon = (status: string) => {
    const icons = {
      preparing: Package,
      shipped: Truck,
      in_transit: Plane,
      delivered: CheckCircle,
      returned: RotateCcw
    };
    const Icon = icons[status as keyof typeof icons] || Package;
    return <Icon size={14} />;
  };

  const getReturnStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const updateStatusFilter = (filter: string) => {
    setStatusFilter(filter);
  };

  const updateShipmentStatus = (shipmentId: string, newStatus: Shipment['status']) => {
    setShipments(prev => prev.map(shipment => 
      shipment.id === shipmentId ? { ...shipment, status: newStatus } : shipment
    ));
  };

  const updateReturnStatus = (returnId: string, newStatus: ReturnRequest['status']) => {
    setReturnRequests(prev => prev.map(request => 
      request.id === returnId ? { ...request, status: newStatus } : request
    ));
  };

  const addTrackingNumber = (shipmentId: string, trackingNumber: string) => {
    setShipments(prev => prev.map(shipment => 
      shipment.id === shipmentId 
        ? { ...shipment, trackingNumber, status: 'shipped', shippedDate: new Date().toISOString().split('T')[0] }
        : shipment
    ));
  };

  const filteredShipments = shipments.filter(shipment => {
    const matchesSearch = 
      shipment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.orderId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || shipment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredReturns = returnRequests.filter(request => {
    const matchesSearch = 
      request.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.orderId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { 
            label: 'Aktive Sendungen', 
            count: shipments.filter(s => ['preparing', 'shipped', 'in_transit'].includes(s.status)).length,
            color: 'blue-500', 
            icon: Truck 
          },
          { 
            label: 'Vorbereitung', 
            count: shipments.filter(s => s.status === 'preparing').length,
            color: 'yellow-500', 
            icon: Package 
          },
          { 
            label: 'Unterwegs', 
            count: shipments.filter(s => s.status === 'in_transit').length,
            color: 'purple-500', 
            icon: Plane 
          },
          { 
            label: 'Offene Retouren', 
            count: returnRequests.filter(r => r.status === 'pending').length,
            color: 'red-500', 
            icon: RotateCcw 
          }
        ].map((stat, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full bg-${stat.color}/10`}>
                <stat.icon className={`w-5 h-5 text-${stat.color}`} />
              </div>
              <div>
                <div className="text-2xl font-cormorant text-elbfunkeln-green">{stat.count}</div>
                <div className="text-sm text-elbfunkeln-green/60">{stat.label}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="shipments" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-elbfunkeln-beige/20">
          <TabsTrigger value="shipments" className="flex items-center gap-2">
            <Truck size={16} />
            Sendungen
          </TabsTrigger>
          <TabsTrigger value="returns" className="flex items-center gap-2">
            <RotateCcw size={16} />
            Retouren
          </TabsTrigger>
          <TabsTrigger value="methods" className="flex items-center gap-2">
            <Car size={16} />
            Versandarten
          </TabsTrigger>
        </TabsList>

        {/* Shipments Tab */}
        <TabsContent value="shipments">
          <Card>
            {/* Filters */}
            <div className="p-6 border-b border-elbfunkeln-lavender/20">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-elbfunkeln-green/40" />
                    <Input
                      placeholder="Sendungen suchen..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={updateStatusFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle Status</SelectItem>
                      <SelectItem value="preparing">Vorbereitung</SelectItem>
                      <SelectItem value="shipped">Versandt</SelectItem>
                      <SelectItem value="in_transit">Unterwegs</SelectItem>
                      <SelectItem value="delivered">Geliefert</SelectItem>
                      <SelectItem value="returned">Zurückgesandt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download size={16} className="mr-2" />
                    Export
                  </Button>
                  <Button className="bg-elbfunkeln-green text-white">
                    <Plus size={16} className="mr-2" />
                    Neue Sendung
                  </Button>
                </div>
              </div>
            </div>

            {/* Shipments Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sendung / Bestellung</TableHead>
                    <TableHead>Kunde</TableHead>
                    <TableHead>Versandart</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tracking</TableHead>
                    <TableHead>Datum</TableHead>
                    <TableHead>Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredShipments.map((shipment) => (
                    <TableRow key={shipment.id}>
                      <TableCell>
                        <div>
                          <div className="font-mono text-sm font-semibold text-elbfunkeln-green">
                            {shipment.id}
                          </div>
                          <div className="text-xs text-elbfunkeln-green/60">
                            Bestellung: {shipment.orderId}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-elbfunkeln-green">
                            {shipment.customerName}
                          </div>
                          <div className="text-xs text-elbfunkeln-green/60">
                            {shipment.customerEmail}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-elbfunkeln-green">
                          {shipment.shippingMethod}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={shipment.status}
                          onValueChange={(value) => updateShipmentStatus(shipment.id, value as Shipment['status'])}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue>
                              <Badge className={getShippingStatusColor(shipment.status)} variant="outline">
                                <div className="flex items-center gap-1">
                                  {getShippingStatusIcon(shipment.status)}
                                  <span className="capitalize">
                                    {shipment.status === 'in_transit' ? 'unterwegs' : shipment.status}
                                  </span>
                                </div>
                              </Badge>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="preparing">Vorbereitung</SelectItem>
                            <SelectItem value="shipped">Versandt</SelectItem>
                            <SelectItem value="in_transit">Unterwegs</SelectItem>
                            <SelectItem value="delivered">Geliefert</SelectItem>
                            <SelectItem value="returned">Zurückgesandt</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {shipment.trackingNumber ? (
                          <div className="text-sm">
                            <div className="font-mono font-semibold text-elbfunkeln-green">
                              {shipment.trackingNumber}
                            </div>
                            <Button variant="link" size="sm" className="p-0 h-auto text-xs">
                              Verfolgen
                            </Button>
                          </div>
                        ) : (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Plus size={12} className="mr-1" />
                                Tracking
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Tracking-Nummer hinzufügen</DialogTitle>
                                <DialogDescription>
                                  Fügen Sie eine Tracking-Nummer für diese Sendung hinzu
                                </DialogDescription>
                              </DialogHeader>
                              <TrackingDialog 
                                shipment={shipment}
                                onAddTracking={(tracking) => addTrackingNumber(shipment.id, tracking)}
                              />
                            </DialogContent>
                          </Dialog>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {shipment.shippedDate ? (
                            <div>
                              <div className="text-elbfunkeln-green">
                                Versandt: {new Date(shipment.shippedDate).toLocaleDateString('de-DE')}
                              </div>
                              {shipment.estimatedDelivery && (
                                <div className="text-xs text-elbfunkeln-green/60">
                                  Erwartet: {new Date(shipment.estimatedDelivery).toLocaleDateString('de-DE')}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-elbfunkeln-green/60">
                              Noch nicht versandt
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline">
                            <Eye size={14} />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit size={14} />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Send size={14} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* Returns Tab */}
        <TabsContent value="returns">
          <Card>
            <div className="p-6 border-b border-elbfunkeln-lavender/20">
              <h3 className="font-cormorant text-xl text-elbfunkeln-green mb-4">
                Retourenmanagement 📦↩️
              </h3>
              <div className="flex gap-4">
                <Input
                  placeholder="Retouren suchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {filteredReturns.map((returnRequest) => (
                  <Card key={returnRequest.id} className="p-4">
                    <div className="flex flex-col lg:flex-row gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="font-mono text-sm font-semibold text-elbfunkeln-green">
                            {returnRequest.id}
                          </div>
                          <Badge className={getReturnStatusColor(returnRequest.status)}>
                            {returnRequest.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div>
                            <div className="text-sm text-elbfunkeln-green/60">Kunde:</div>
                            <div className="font-medium text-elbfunkeln-green">
                              {returnRequest.customerName}
                            </div>
                            <div className="text-xs text-elbfunkeln-green/60">
                              {returnRequest.customerEmail}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-elbfunkeln-green/60">Bestellung:</div>
                            <div className="font-mono font-medium text-elbfunkeln-green">
                              {returnRequest.orderId}
                            </div>
                            <div className="text-xs text-elbfunkeln-green/60">
                              {new Date(returnRequest.requestDate).toLocaleDateString('de-DE')}
                            </div>
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <div className="text-sm text-elbfunkeln-green/60 mb-1">Grund:</div>
                          <div className="font-medium text-elbfunkeln-green mb-1">
                            {returnRequest.reason}
                          </div>
                          <div className="text-sm text-elbfunkeln-green/70">
                            {returnRequest.description}
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <div className="text-sm text-elbfunkeln-green/60 mb-2">Artikel:</div>
                          <div className="space-y-1">
                            {returnRequest.items.map((item, index) => (
                              <div key={index} className="flex justify-between items-center text-sm p-2 bg-elbfunkeln-beige/10 rounded">
                                <span className="text-elbfunkeln-green">
                                  {item.productName} x{item.quantity}
                                </span>
                                {item.condition && (
                                  <Badge variant="outline" className="text-xs">
                                    {item.condition}
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-sm text-elbfunkeln-green/60">Erstattungsbetrag: </span>
                            <span className="font-semibold text-elbfunkeln-green">
                              €{returnRequest.refundAmount.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        
                        {returnRequest.adminNotes && (
                          <div className="mt-3 p-3 bg-elbfunkeln-lavender/10 rounded-lg">
                            <div className="text-sm text-elbfunkeln-green/60 mb-1">Admin-Notizen:</div>
                            <div className="text-sm text-elbfunkeln-green">
                              {returnRequest.adminNotes}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-2 lg:w-32">
                        <Select
                          value={returnRequest.status}
                          onValueChange={(value) => updateReturnStatus(returnRequest.id, value as ReturnRequest['status'])}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Ausstehend</SelectItem>
                            <SelectItem value="approved">Genehmigt</SelectItem>
                            <SelectItem value="rejected">Abgelehnt</SelectItem>
                            <SelectItem value="processing">In Bearbeitung</SelectItem>
                            <SelectItem value="completed">Abgeschlossen</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button size="sm" variant="outline" className="w-full">
                          <Eye size={14} className="mr-1" />
                          Details
                        </Button>
                        <Button size="sm" variant="outline" className="w-full">
                          <Send size={14} className="mr-1" />
                          E-Mail
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Shipping Methods Tab */}
        <TabsContent value="methods">
          <Card>
            <div className="p-6 border-b border-elbfunkeln-lavender/20">
              <div className="flex justify-between items-center">
                <h3 className="font-cormorant text-xl text-elbfunkeln-green">
                  Versandarten verwalten 🚛
                </h3>
                <Button className="bg-elbfunkeln-green text-white">
                  <Plus size={16} className="mr-2" />
                  Neue Versandart
                </Button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {shippingMethods.map((method) => (
                  <Card key={method.id} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-cormorant text-lg text-elbfunkeln-green">
                          {method.name}
                        </h4>
                        <p className="text-sm text-elbfunkeln-green/70">
                          {method.description}
                        </p>
                      </div>
                      <Badge className={method.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {method.isActive ? 'Aktiv' : 'Inaktiv'}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-elbfunkeln-green/60">Preis:</span>
                        <span className="font-semibold text-elbfunkeln-green">
                          €{method.price.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-elbfunkeln-green/60">Lieferzeit:</span>
                        <span className="font-semibold text-elbfunkeln-green">
                          {method.estimatedDays}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-elbfunkeln-green/60">Tracking:</span>
                        <span className="font-semibold text-elbfunkeln-green">
                          {method.trackingEnabled ? 'Ja' : 'Nein'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Edit size={14} className="mr-1" />
                        Bearbeiten
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TrackingDialog({ shipment, onAddTracking }: { shipment: Shipment; onAddTracking: (tracking: string) => void }) {
  const [trackingNumber, setTrackingNumber] = useState('');

  const handleSubmit = () => {
    if (trackingNumber.trim()) {
      onAddTracking(trackingNumber.trim());
      setTrackingNumber('');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="tracking">Tracking-Nummer</Label>
        <Input
          id="tracking"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          placeholder="z.B. DHL123456789"
        />
      </div>
      <div className="text-sm text-elbfunkeln-green/70">
        <strong>Bestellung:</strong> {shipment.orderId}<br />
        <strong>Kunde:</strong> {shipment.customerName}<br />
        <strong>Versandart:</strong> {shipment.shippingMethod}
      </div>
      <div className="flex gap-2">
        <Button onClick={handleSubmit} disabled={!trackingNumber.trim()}>
          Tracking hinzufügen
        </Button>
      </div>
    </div>
  );
}