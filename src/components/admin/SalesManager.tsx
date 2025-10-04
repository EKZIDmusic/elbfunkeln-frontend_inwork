import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Plus, Edit, Trash2, Eye, EyeOff, Calendar, Percent, 
  Megaphone, Tag, Clock, CheckCircle, XCircle, Search,
  Play, Pause, Square, AlertTriangle, Users, TrendingUp
} from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../ui/dialog';
import { Alert, AlertDescription } from '../ui/alert';
import { Separator } from '../ui/separator';
import { toast } from 'sonner@2.0.3';
import { mockSaleEvents, type SaleEvent } from '../../data/adminData';
import { products } from '../../data/products';

interface SaleFormData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  discountPercentage: number;
  productIds: string[];
  bannerText: string;
}

export function SalesManager() {
  const [saleEvents, setSaleEvents] = useState<SaleEvent[]>(mockSaleEvents);
  const [isAddingSale, setIsAddingSale] = useState(false);
  const [editingSale, setEditingSale] = useState<SaleEvent | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState<SaleFormData>({
    name: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    discountPercentage: 10,
    productIds: [],
    bannerText: ''
  });

  const filteredSales = saleEvents.filter(sale => {
    const matchesSearch = 
      sale.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && sale.isActive) ||
      (statusFilter === 'inactive' && !sale.isActive) ||
      (statusFilter === 'upcoming' && new Date(sale.startDate) > new Date()) ||
      (statusFilter === 'expired' && new Date(sale.endDate) < new Date());
    return matchesSearch && matchesStatus;
  });

  const handleSaveSale = () => {
    if (editingSale) {
      // Update existing sale
      setSaleEvents(prev => prev.map(s => 
        s.id === editingSale.id 
          ? { 
              ...s, 
              ...formData, 
              id: editingSale.id,
              isActive: isActiveSale(formData.startDate, formData.endDate)
            }
          : s
      ));
      setEditingSale(null);
      toast.success('Sale erfolgreich aktualisiert! 🎉');
    } else {
      // Add new sale
      const newSale: SaleEvent = {
        ...formData,
        id: (saleEvents.length + 1).toString(),
        isActive: isActiveSale(formData.startDate, formData.endDate)
      };
      setSaleEvents(prev => [...prev, newSale]);
      setIsAddingSale(false);
      toast.success('Neuer Sale erfolgreich erstellt! 🔥');
    }
    
    resetForm();
  };

  const handleEditSale = (sale: SaleEvent) => {
    setFormData({
      name: sale.name,
      description: sale.description,
      startDate: sale.startDate,
      endDate: sale.endDate,
      discountPercentage: sale.discountPercentage,
      productIds: sale.productIds,
      bannerText: sale.bannerText || ''
    });
    setEditingSale(sale);
  };

  const handleDeleteSale = (saleId: string) => {
    if (window.confirm('Möchten Sie diesen Sale wirklich löschen?')) {
      setSaleEvents(prev => prev.filter(s => s.id !== saleId));
      toast.success('Sale erfolgreich gelöscht!');
    }
  };

  const toggleSaleStatus = (saleId: string) => {
    setSaleEvents(prev => prev.map(s => 
      s.id === saleId ? { ...s, isActive: !s.isActive } : s
    ));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      discountPercentage: 10,
      productIds: [],
      bannerText: ''
    });
  };

  const handleCancel = () => {
    resetForm();
    setIsAddingSale(false);
    setEditingSale(null);
  };

  const isActiveSale = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    return now >= start && now <= end;
  };

  const getSaleStatus = (sale: SaleEvent) => {
    const now = new Date();
    const start = new Date(sale.startDate);
    const end = new Date(sale.endDate);
    
    if (now < start) return 'upcoming';
    if (now > end) return 'expired';
    if (sale.isActive) return 'active';
    return 'paused';
  };

  const getSaleStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800 border-green-200',
      paused: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      upcoming: 'bg-blue-100 text-blue-800 border-blue-200',
      expired: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getSaleStatusIcon = (status: string) => {
    const icons = {
      active: Play,
      paused: Pause,
      upcoming: Clock,
      expired: Square
    };
    const Icon = icons[status as keyof typeof icons] || Clock;
    return <Icon size={14} />;
  };

  const generateBannerText = () => {
    if (formData.name && formData.discountPercentage) {
      const text = `${formData.name}: ${formData.discountPercentage}% Rabatt! 🔥`;
      setFormData(prev => ({ ...prev, bannerText: text }));
    }
  };

  const getSelectedProductsText = () => {
    if (formData.productIds.length === 0) return 'Keine Produkte ausgewählt';
    if (formData.productIds.length === products.length) return 'Alle Produkte';
    return `${formData.productIds.length} Produkte ausgewählt`;
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { 
            label: 'Aktive Sales', 
            count: saleEvents.filter(s => getSaleStatus(s) === 'active').length,
            color: 'green-500', 
            icon: Play 
          },
          { 
            label: 'Geplante Sales', 
            count: saleEvents.filter(s => getSaleStatus(s) === 'upcoming').length,
            color: 'blue-500', 
            icon: Clock 
          },
          { 
            label: 'Pausierte Sales', 
            count: saleEvents.filter(s => getSaleStatus(s) === 'paused').length,
            color: 'yellow-500', 
            icon: Pause 
          },
          { 
            label: 'Ø Rabatt', 
            count: `${Math.round(saleEvents.reduce((sum, s) => sum + s.discountPercentage, 0) / saleEvents.length)}%`,
            color: 'purple-500', 
            icon: Percent 
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

      {/* Header with search and filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-elbfunkeln-green/40" />
            <Input
              placeholder="Sales suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 max-w-sm"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Status</SelectItem>
              <SelectItem value="active">Aktiv</SelectItem>
              <SelectItem value="paused">Pausiert</SelectItem>
              <SelectItem value="upcoming">Geplant</SelectItem>
              <SelectItem value="expired">Abgelaufen</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button 
          onClick={() => setIsAddingSale(true)}
          className="bg-elbfunkeln-rose text-white hover:bg-elbfunkeln-rose/90"
        >
          <Plus size={16} className="mr-2" />
          Neuer Sale
        </Button>
      </div>

      {/* Add/Edit Sale Form */}
      {(isAddingSale || editingSale) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="p-6 border-2 border-elbfunkeln-rose/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-cormorant text-xl text-elbfunkeln-green">
                {editingSale ? 'Sale bearbeiten' : 'Neuen Sale erstellen'}
              </h3>
              <Button variant="ghost" size="sm" onClick={handleCancel}>
                <XCircle size={16} />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Sale-Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="z.B. Valentinstag Sale 💕"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Beschreibung *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    placeholder="Beschreibung des Sales..."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Startdatum *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">Enddatum *</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="discountPercentage">Rabatt (%) *</Label>
                  <Input
                    id="discountPercentage"
                    type="number"
                    min="1"
                    max="99"
                    value={formData.discountPercentage || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, discountPercentage: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label>Produkte auswählen *</Label>
                  <div className="border rounded-lg p-4 max-h-48 overflow-y-auto">
                    <div className="flex items-center space-x-2 mb-3">
                      <input
                        type="checkbox"
                        id="selectAll"
                        checked={formData.productIds.length === products.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({ ...prev, productIds: products.map(p => p.id) }));
                          } else {
                            setFormData(prev => ({ ...prev, productIds: [] }));
                          }
                        }}
                        className="rounded border-elbfunkeln-lavender/30"
                      />
                      <Label htmlFor="selectAll" className="font-semibold">
                        Alle Produkte auswählen
                      </Label>
                    </div>
                    <Separator className="mb-3" />
                    <div className="space-y-2">
                      {products.map(product => (
                        <div key={product.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`product-${product.id}`}
                            checked={formData.productIds.includes(product.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData(prev => ({ 
                                  ...prev, 
                                  productIds: [...prev.productIds, product.id] 
                                }));
                              } else {
                                setFormData(prev => ({ 
                                  ...prev, 
                                  productIds: prev.productIds.filter(pid => pid !== product.id) 
                                }));
                              }
                            }}
                            className="rounded border-elbfunkeln-lavender/30"
                          />
                          <Label htmlFor={`product-${product.id}`} className="text-sm">
                            {product.name} (€{product.price})
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="text-sm text-elbfunkeln-green/60 mt-1">
                    {getSelectedProductsText()}
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label htmlFor="bannerText">Banner-Text</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generateBannerText}
                    >
                      <Megaphone size={14} className="mr-1" />
                      Generieren
                    </Button>
                  </div>
                  <Textarea
                    id="bannerText"
                    value={formData.bannerText}
                    onChange={(e) => setFormData(prev => ({ ...prev, bannerText: e.target.value }))}
                    rows={2}
                    placeholder="Text für den Sale-Banner..."
                  />
                </div>
                
                {/* Preview */}
                <div className="p-4 bg-elbfunkeln-rose/10 rounded-lg">
                  <h4 className="font-cormorant text-elbfunkeln-green mb-2 flex items-center gap-2">
                    <Eye size={16} />
                    Vorschau:
                  </h4>
                  <div className="text-sm space-y-1">
                    <div><strong>Name:</strong> {formData.name || 'Sale-Name'}</div>
                    <div><strong>Rabatt:</strong> {formData.discountPercentage}%</div>
                    <div><strong>Laufzeit:</strong> 
                      {formData.startDate} bis {formData.endDate}
                    </div>
                    <div><strong>Produkte:</strong> {getSelectedProductsText()}</div>
                    {formData.bannerText && (
                      <div className="mt-2 p-2 bg-elbfunkeln-rose/20 rounded text-center font-semibold">
                        {formData.bannerText}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button 
                onClick={handleSaveSale}
                className="bg-elbfunkeln-rose text-white hover:bg-elbfunkeln-rose/90"
                disabled={!formData.name || !formData.description || formData.productIds.length === 0}
              >
                <CheckCircle size={16} className="mr-2" />
                {editingSale ? 'Änderungen speichern' : 'Sale erstellen'}
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                Abbrechen
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Sales List */}
      <div className="space-y-4">
        {filteredSales.map((sale) => {
          const status = getSaleStatus(sale);
          return (
            <motion.div
              key={sale.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Card className="p-6">
                <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-cormorant text-xl text-elbfunkeln-green">
                        {sale.name}
                      </h3>
                      <Badge className={getSaleStatusColor(status)} variant="outline">
                        <div className="flex items-center gap-1">
                          {getSaleStatusIcon(status)}
                          <span className="capitalize">
                            {status === 'upcoming' ? 'Geplant' : 
                             status === 'active' ? 'Aktiv' :
                             status === 'paused' ? 'Pausiert' : 'Abgelaufen'}
                          </span>
                        </div>
                      </Badge>
                      {status === 'active' && (
                        <Badge className="bg-green-500 text-white animate-pulse">
                          LIVE
                        </Badge>
                      )}
                    </div>
                    
                    <p className="font-inter text-elbfunkeln-green/70 mb-3">
                      {sale.description}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-4">
                      <div>
                        <span className="text-elbfunkeln-green/60">Rabatt:</span>
                        <div className="font-semibold text-elbfunkeln-green flex items-center gap-1">
                          <Percent size={14} className="text-elbfunkeln-rose" />
                          {sale.discountPercentage}%
                        </div>
                      </div>
                      <div>
                        <span className="text-elbfunkeln-green/60">Start:</span>
                        <div className="font-semibold text-elbfunkeln-green">
                          {new Date(sale.startDate).toLocaleDateString('de-DE')}
                        </div>
                      </div>
                      <div>
                        <span className="text-elbfunkeln-green/60">Ende:</span>
                        <div className="font-semibold text-elbfunkeln-green">
                          {new Date(sale.endDate).toLocaleDateString('de-DE')}
                        </div>
                      </div>
                      <div>
                        <span className="text-elbfunkeln-green/60">Produkte:</span>
                        <div className="font-semibold text-elbfunkeln-green flex items-center gap-1">
                          <Tag size={14} className="text-elbfunkeln-rose" />
                          {sale.productIds.length}
                        </div>
                      </div>
                    </div>
                    
                    {sale.bannerText && (
                      <div className="p-3 bg-elbfunkeln-rose/10 rounded-lg mb-4">
                        <span className="text-sm text-elbfunkeln-green/60">Banner:</span>
                        <div className="font-inter text-elbfunkeln-green font-semibold">
                          {sale.bannerText}
                        </div>
                      </div>
                    )}

                    {/* Warning for expired sales */}
                    {status === 'expired' && (
                      <Alert className="border-red-200 bg-red-50 mb-4">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-700">
                          Dieser Sale ist abgelaufen und nicht mehr aktiv.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2 lg:w-48">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-elbfunkeln-green/60">Status:</span>
                      <Switch
                        checked={sale.isActive && status !== 'expired'}
                        onCheckedChange={() => toggleSaleStatus(sale.id)}
                        disabled={status === 'expired'}
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => handleEditSale(sale)}
                      >
                        <Edit size={14} className="mr-1" />
                        Bearbeiten
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDeleteSale(sale.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                    
                    <Button size="sm" variant="outline" className="w-full">
                      <TrendingUp size={14} className="mr-1" />
                      Analytics
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {filteredSales.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-elbfunkeln-rose/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Megaphone className="w-12 h-12 text-elbfunkeln-rose/40" />
          </div>
          <h3 className="font-cormorant text-xl text-elbfunkeln-green mb-2">
            Keine Sales gefunden
          </h3>
          <p className="text-elbfunkeln-green/60 mb-4">
            {searchTerm || statusFilter !== 'all' 
              ? 'Versuchen Sie einen anderen Suchbegriff oder Filter.' 
              : 'Erstellen Sie Ihren ersten Sale, um loszulegen.'
            }
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <Button 
              onClick={() => setIsAddingSale(true)}
              className="bg-elbfunkeln-rose text-white hover:bg-elbfunkeln-rose/90"
            >
              <Plus size={16} className="mr-2" />
              Ersten Sale erstellen
            </Button>
          )}
        </div>
      )}
    </div>
  );
}