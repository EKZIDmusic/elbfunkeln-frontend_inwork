import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  RotateCcw, Search, Eye, RefreshCw, Calendar,
  Package, AlertCircle, CheckCircle, XCircle, 
  CreditCard, Truck, ArrowLeft, FileText, 
  Mail, Download, Filter, Clock
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

interface ReturnItem {
  id: string;
  order_id: string;
  customer_name: string;
  customer_email: string;
  product_name: string;
  reason: string;
  status: 'requested' | 'approved' | 'shipped_back' | 'received' | 'refunded' | 'rejected';
  request_date: string;
  received_date?: string;
  refund_amount: number;
  original_price: number;
  condition: 'new' | 'good' | 'damaged' | 'defective';
  tracking_number?: string;
  notes: string;
  images?: string[];
}

// Mock data für Demo-Zwecke
const mockReturns: ReturnItem[] = [
  {
    id: 'RET-001',
    order_id: 'ORD-12345',
    customer_name: 'Anna Müller',
    customer_email: 'anna.mueller@email.com',
    product_name: 'Silber Armband "Luna"',
    reason: 'Größe passt nicht',
    status: 'requested',
    request_date: '2024-01-15',
    refund_amount: 89.99,
    original_price: 89.99,
    condition: 'new',
    notes: 'Kunde möchte eine andere Größe'
  },
  {
    id: 'RET-002',
    order_id: 'ORD-12346',
    customer_name: 'Maria Schmidt',
    customer_email: 'maria.schmidt@email.com',
    product_name: 'Gold Ohrringe "Stella"',
    reason: 'Defekt',
    status: 'approved',
    request_date: '2024-01-10',
    refund_amount: 129.99,
    original_price: 129.99,
    condition: 'defective',
    tracking_number: 'DHL123456789',
    notes: 'Ein Ohrring fehlt'
  },
  {
    id: 'RET-003',
    order_id: 'ORD-12347',
    customer_name: 'Lisa Weber',
    customer_email: 'lisa.weber@email.com',
    product_name: 'Roségold Kette "Harmony"',
    reason: 'Gefällt nicht',
    status: 'refunded',
    request_date: '2024-01-05',
    received_date: '2024-01-12',
    refund_amount: 149.99,
    original_price: 149.99,
    condition: 'good',
    notes: 'Vollständige Rückerstattung bearbeitet'
  }
];

export function ReturnManager() {
  const [returns, setReturns] = useState<ReturnItem[]>(mockReturns);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedReturn, setSelectedReturn] = useState<ReturnItem | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showProcessDialog, setShowProcessDialog] = useState(false);
  const [processNotes, setProcessNotes] = useState('');

  // Filter returns
  const filteredReturns = returns.filter(returnItem => {
    const matchesSearch = searchQuery === '' || 
      returnItem.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      returnItem.customer_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      returnItem.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      returnItem.product_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || returnItem.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusLabel = (status: string) => {
    const statusLabels: Record<string, string> = {
      requested: 'Angefragt',
      approved: 'Genehmigt',
      shipped_back: 'Zurückgesendet',
      received: 'Erhalten',
      refunded: 'Rückerstattet',
      rejected: 'Abgelehnt'
    };
    return statusLabels[status] || status;
  };

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      requested: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-blue-100 text-blue-800 border-blue-200',
      shipped_back: 'bg-purple-100 text-purple-800 border-purple-200',
      received: 'bg-orange-100 text-orange-800 border-orange-200',
      refunded: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200'
    };
    
    return (
      <Badge className={statusStyles[status] || statusStyles.requested}>
        {getStatusLabel(status)}
      </Badge>
    );
  };

  const getConditionBadge = (condition: string) => {
    const conditionStyles: Record<string, string> = {
      new: 'bg-green-100 text-green-800 border-green-200',
      good: 'bg-blue-100 text-blue-800 border-blue-200',
      damaged: 'bg-orange-100 text-orange-800 border-orange-200',
      defective: 'bg-red-100 text-red-800 border-red-200'
    };

    const conditionLabels: Record<string, string> = {
      new: 'Neuwertig',
      good: 'Gut',
      damaged: 'Beschädigt',
      defective: 'Defekt'
    };
    
    return (
      <Badge className={conditionStyles[condition] || conditionStyles.good}>
        {conditionLabels[condition] || condition}
      </Badge>
    );
  };

  const handleStatusUpdate = (returnId: string, newStatus: ReturnItem['status']) => {
    setReturns(returns.map(r => 
      r.id === returnId 
        ? { ...r, status: newStatus, received_date: newStatus === 'received' ? new Date().toISOString().split('T')[0] : r.received_date }
        : r
    ));
    
    // Automatische E-Mail-Benachrichtigung simulieren
    setTimeout(() => {
      alert(`E-Mail-Benachrichtigung an Kunde gesendet: Status geändert zu "${getStatusLabel(newStatus)}"`);
    }, 500);
  };

  const processRefund = (returnItem: ReturnItem) => {
    setSelectedReturn(returnItem);
    setShowProcessDialog(true);
  };

  const confirmRefund = () => {
    if (selectedReturn) {
      handleStatusUpdate(selectedReturn.id, 'refunded');
      setShowProcessDialog(false);
      setProcessNotes('');
      alert(`Rückerstattung von ${selectedReturn.refund_amount.toFixed(2)}€ wurde bearbeitet.`);
    }
  };

  // Calculate stats
  const stats = {
    total: returns.length,
    pending: returns.filter(r => ['requested', 'approved', 'shipped_back', 'received'].includes(r.status)).length,
    refunded: returns.filter(r => r.status === 'refunded').length,
    rejected: returns.filter(r => r.status === 'rejected').length,
    totalRefunded: returns.filter(r => r.status === 'refunded').reduce((sum, r) => sum + r.refund_amount, 0)
  };

  return (
    <div className="space-y-6">
      {/* Return Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-4 border-elbfunkeln-rose/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Gesamt Retouren</p>
              <p className="text-2xl font-semibold text-elbfunkeln-rose">{stats.total}</p>
            </div>
            <RotateCcw className="h-8 w-8 text-elbfunkeln-rose" />
          </div>
        </Card>
        
        <Card className="p-4 border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Bearbeitung</p>
              <p className="text-2xl font-semibold text-orange-600">{stats.pending}</p>
            </div>
            <Clock className="h-8 w-8 text-orange-600" />
          </div>
        </Card>
        
        <Card className="p-4 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rückerstattet</p>
              <p className="text-2xl font-semibold text-green-600">{stats.refunded}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </Card>
        
        <Card className="p-4 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Abgelehnt</p>
              <p className="text-2xl font-semibold text-red-600">{stats.rejected}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
        </Card>
        
        <Card className="p-4 border-elbfunkeln-green/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rückerstattungen</p>
              <p className="text-2xl font-semibold text-elbfunkeln-green">{stats.totalRefunded.toFixed(0)}€</p>
            </div>
            <CreditCard className="h-8 w-8 text-elbfunkeln-green" />
          </div>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Retouren suchen..."
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
              <SelectItem value="requested">Angefragt</SelectItem>
              <SelectItem value="approved">Genehmigt</SelectItem>
              <SelectItem value="shipped_back">Zurückgesendet</SelectItem>
              <SelectItem value="received">Erhalten</SelectItem>
              <SelectItem value="refunded">Rückerstattet</SelectItem>
              <SelectItem value="rejected">Abgelehnt</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Aktualisieren
          </Button>
        </div>
      </div>

      {/* Returns Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Retour-ID</TableHead>
              <TableHead>Kunde</TableHead>
              <TableHead>Produkt</TableHead>
              <TableHead>Grund</TableHead>
              <TableHead>Zustand</TableHead>
              <TableHead>Betrag</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Datum</TableHead>
              <TableHead>Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReturns.map((returnItem) => (
              <TableRow key={returnItem.id}>
                <TableCell>
                  <span className="font-mono text-sm">{returnItem.id}</span>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-semibold">{returnItem.customer_name}</div>
                    <div className="text-sm text-gray-500">{returnItem.customer_email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-40 truncate">{returnItem.product_name}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm max-w-32 truncate">{returnItem.reason}</div>
                </TableCell>
                <TableCell>{getConditionBadge(returnItem.condition)}</TableCell>
                <TableCell>
                  <span className="font-semibold">{returnItem.refund_amount.toFixed(2)}€</span>
                </TableCell>
                <TableCell>{getStatusBadge(returnItem.status)}</TableCell>
                <TableCell>
                  <div className="text-sm">
                    {new Date(returnItem.request_date).toLocaleDateString('de-DE')}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedReturn(returnItem);
                        setShowDetailsDialog(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    {returnItem.status === 'received' && (
                      <Button
                        size="sm"
                        onClick={() => processRefund(returnItem)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CreditCard className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Select 
                      value={returnItem.status} 
                      onValueChange={(value: ReturnItem['status']) => handleStatusUpdate(returnItem.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="requested">Angefragt</SelectItem>
                        <SelectItem value="approved">Genehmigt</SelectItem>
                        <SelectItem value="shipped_back">Zurückgesendet</SelectItem>
                        <SelectItem value="received">Erhalten</SelectItem>
                        <SelectItem value="refunded">Rückerstattet</SelectItem>
                        <SelectItem value="rejected">Abgelehnt</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {filteredReturns.length === 0 && (
        <div className="text-center py-8">
          <RotateCcw className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">Keine Retouren gefunden</p>
        </div>
      )}

      {/* Return Details Dialog */}
      {selectedReturn && (
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-3xl" aria-describedby="return-details-description">
            <DialogHeader>
              <DialogTitle>Retour Details - {selectedReturn.id}</DialogTitle>
            </DialogHeader>
            <div id="return-details-description" className="sr-only">
              Detailansicht für Retour {selectedReturn.id} mit Kundeninformationen und Verlauf
            </div>
            
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="timeline">Verlauf</TabsTrigger>
                <TabsTrigger value="communication">Kommunikation</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Kundeninformationen</h3>
                    <div className="space-y-2 text-sm">
                      <div><span className="text-gray-500">Name:</span> {selectedReturn.customer_name}</div>
                      <div><span className="text-gray-500">E-Mail:</span> {selectedReturn.customer_email}</div>
                      <div><span className="text-gray-500">Bestell-ID:</span> {selectedReturn.order_id}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-3">Retour Informationen</h3>
                    <div className="space-y-2 text-sm">
                      <div><span className="text-gray-500">Status:</span> {getStatusBadge(selectedReturn.status)}</div>
                      <div><span className="text-gray-500">Angefragt am:</span> {new Date(selectedReturn.request_date).toLocaleDateString('de-DE')}</div>
                      <div><span className="text-gray-500">Zustand:</span> {getConditionBadge(selectedReturn.condition)}</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Produkt & Grund</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div><span className="font-medium">Produkt:</span> {selectedReturn.product_name}</div>
                    <div><span className="font-medium">Grund:</span> {selectedReturn.reason}</div>
                    <div><span className="font-medium">Rückerstattung:</span> {selectedReturn.refund_amount.toFixed(2)}€</div>
                    {selectedReturn.tracking_number && (
                      <div><span className="font-medium">Tracking:</span> {selectedReturn.tracking_number}</div>
                    )}
                  </div>
                </div>
                
                {selectedReturn.notes && (
                  <div>
                    <h3 className="font-semibold mb-3">Notizen</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      {selectedReturn.notes}
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="timeline" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                    </div>
                    <div>
                      <div className="font-medium">Retour angefragt</div>
                      <div className="text-sm text-gray-500">{new Date(selectedReturn.request_date).toLocaleDateString('de-DE')}</div>
                    </div>
                  </div>
                  
                  {selectedReturn.status !== 'requested' && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">Retour genehmigt</div>
                        <div className="text-sm text-gray-500">Kunde wurde informiert</div>
                      </div>
                    </div>
                  )}
                  
                  {selectedReturn.received_date && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <Package className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium">Artikel erhalten</div>
                        <div className="text-sm text-gray-500">{new Date(selectedReturn.received_date).toLocaleDateString('de-DE')}</div>
                      </div>
                    </div>
                  )}
                  
                  {selectedReturn.status === 'refunded' && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <CreditCard className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium">Rückerstattung bearbeitet</div>
                        <div className="text-sm text-gray-500">{selectedReturn.refund_amount.toFixed(2)}€ erstattet</div>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="communication" className="space-y-4">
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Mail className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">E-Mail an Kunde</span>
                      <span className="text-sm text-gray-500">vor 2 Tagen</span>
                    </div>
                    <p className="text-sm">Retour-Anfrage bestätigt. Bitte senden Sie das Produkt an die angegebene Adresse zurück.</p>
                  </div>
                  
                  <div className="border border-gray-200 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Neue Nachricht senden</h4>
                    <Textarea placeholder="Nachricht an den Kunden..." className="mb-3" />
                    <Button size="sm">
                      <Mail className="w-4 h-4 mr-2" />
                      Senden
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}

      {/* Process Refund Dialog */}
      <Dialog open={showProcessDialog} onOpenChange={setShowProcessDialog}>
        <DialogContent aria-describedby="process-refund-description">
          <DialogHeader>
            <DialogTitle>Rückerstattung bearbeiten</DialogTitle>
          </DialogHeader>
          <div id="process-refund-description" className="sr-only">
            Dialog zum Bearbeiten einer Rückerstattung mit Kundeninformationen und Notizen
          </div>
          
          {selectedReturn && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-500">Kunde:</span> {selectedReturn.customer_name}</div>
                  <div><span className="text-gray-500">Produkt:</span> {selectedReturn.product_name}</div>
                  <div><span className="text-gray-500">Betrag:</span> {selectedReturn.refund_amount.toFixed(2)}€</div>
                  <div><span className="text-gray-500">Zustand:</span> {getConditionBadge(selectedReturn.condition)}</div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Interne Notizen</label>
                <Textarea 
                  value={processNotes}
                  onChange={(e) => setProcessNotes(e.target.value)}
                  placeholder="Notizen zur Rückerstattung..."
                />
              </div>
              
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setShowProcessDialog(false)}>
                  Abbrechen
                </Button>
                <Button onClick={confirmRefund} className="bg-green-600 hover:bg-green-700">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Rückerstattung bearbeiten
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}