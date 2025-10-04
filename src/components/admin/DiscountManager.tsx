import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Plus, Edit, Trash2, Copy, Eye, EyeOff, Calendar, Percent, 
  DollarSign, Users, Tag, Clock, CheckCircle, XCircle, Search
} from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Progress } from '../ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../ui/dialog';
import { Alert, AlertDescription } from '../ui/alert';
import { toast } from 'sonner@2.0.3';
import { 
  getDiscountCodes, 
  createDiscountCode, 
  updateDiscountCode, 
  deleteDiscountCode, 
  toggleDiscountCodeStatus,
  type DiscountCode 
} from '../../services/discountService';

interface DiscountFormData {
  code: string;
  description: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrder: number;
  maxUses: number;
  validFrom: string;
  validUntil: string;
  categories: string[];
  isActive: boolean;
}

export function DiscountManager() {
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingDiscount, setIsAddingDiscount] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<DiscountCode | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState<DiscountFormData>({
    code: '',
    description: '',
    type: 'percentage',
    value: 0,
    minOrder: 0,
    maxUses: 100,
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    categories: [],
    isActive: true
  });

  const categories = ['Ohrringe', 'Armbänder', 'Ringe', 'Ketten', 'Sets'];

  // Daten laden beim Start
  useEffect(() => {
    loadDiscountCodes();
  }, []);

  const loadDiscountCodes = async () => {
    try {
      setLoading(true);
      const codes = await getDiscountCodes();
      setDiscountCodes(codes);
    } catch (error) {
      console.error('Error loading discount codes:', error);
      toast.error('Fehler beim Laden der Rabattcodes');
    } finally {
      setLoading(false);
    }
  };

  const filteredDiscounts = discountCodes.filter(discount => {
    const matchesSearch = 
      discount.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      discount.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && discount.isActive) ||
      (statusFilter === 'inactive' && !discount.isActive) ||
      (statusFilter === 'expired' && new Date(discount.validUntil) < new Date());
    return matchesSearch && matchesStatus;
  });

  const generateRandomCode = () => {
    const codes = ['SAVE', 'DEAL', 'OFFER', 'SPECIAL', 'WINTER', 'SPRING', 'SUMMER', 'FALL'];
    const numbers = Math.floor(Math.random() * 90) + 10;
    const randomCode = codes[Math.floor(Math.random() * codes.length)] + numbers;
    setFormData(prev => ({ ...prev, code: randomCode }));
  };

  const handleSaveDiscount = async () => {
    if (!formData.code || !formData.description || formData.value <= 0) {
      toast.error('Bitte füllen Sie alle Pflichtfelder korrekt aus');
      return;
    }

    try {
      setLoading(true);
      
      if (editingDiscount) {
        // Update existing discount
        const updatedDiscount = await updateDiscountCode(editingDiscount.id, formData);
        setDiscountCodes(prev => prev.map(d => 
          d.id === editingDiscount.id ? updatedDiscount : d
        ));
        setEditingDiscount(null);
        toast.success('Rabattcode erfolgreich aktualisiert! 🎉');
      } else {
        // Add new discount
        const newDiscount = await createDiscountCode(formData);
        setDiscountCodes(prev => [newDiscount, ...prev]);
        setIsAddingDiscount(false);
        toast.success('Neuer Rabattcode erfolgreich erstellt! 🎉');
      }
      
      resetForm();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Fehler beim Speichern des Rabattcodes');
    } finally {
      setLoading(false);
    }
  };

  const handleEditDiscount = (discount: DiscountCode) => {
    setFormData({
      code: discount.code,
      description: discount.description,
      type: discount.type,
      value: discount.value,
      minOrder: discount.minOrder,
      maxUses: discount.maxUses,
      validFrom: discount.validFrom,
      validUntil: discount.validUntil,
      categories: discount.categories || [],
      isActive: discount.isActive
    });
    setEditingDiscount(discount);
  };

  const handleDeleteDiscount = async (discountId: string, discountCode: string) => {
    if (!window.confirm(`Möchten Sie den Rabattcode "${discountCode}" wirklich löschen?`)) return;

    try {
      setLoading(true);
      await deleteDiscountCode(discountId);
      setDiscountCodes(prev => prev.filter(d => d.id !== discountId));
      toast.success('Rabattcode erfolgreich gelöscht!');
    } catch (error) {
      toast.error('Fehler beim Löschen des Rabattcodes');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDiscountStatus = async (discountId: string) => {
    try {
      const updatedDiscount = await toggleDiscountCodeStatus(discountId);
      setDiscountCodes(prev => prev.map(d => 
        d.id === discountId ? updatedDiscount : d
      ));
      toast.success('Status erfolgreich geändert');
    } catch (error) {
      toast.error('Fehler beim Ändern des Status');
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Code "${code}" in die Zwischenablage kopiert! 📋`);
  };

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      type: 'percentage',
      value: 0,
      minOrder: 0,
      maxUses: 100,
      validFrom: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      categories: [],
      isActive: true
    });
  };

  const handleCancel = () => {
    resetForm();
    setIsAddingDiscount(false);
    setEditingDiscount(null);
  };

  const getUsagePercentage = (current: number, max: number) => {
    return Math.min((current / max) * 100, 100);
  };

  const isExpired = (validUntil: string) => {
    return new Date(validUntil) < new Date();
  };

  if (loading && discountCodes.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-elbfunkeln-green"></div>
          <span className="text-elbfunkeln-green">Lade Rabattcodes...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { 
            label: 'Aktive Codes', 
            count: discountCodes.filter(d => d.isActive && !isExpired(d.validUntil)).length,
            color: 'green-500', 
            icon: CheckCircle 
          },
          { 
            label: 'Abgelaufene', 
            count: discountCodes.filter(d => isExpired(d.validUntil)).length,
            color: 'red-500', 
            icon: XCircle 
          },
          { 
            label: 'Gesamtverwendungen', 
            count: discountCodes.reduce((sum, d) => sum + d.currentUses, 0),
            color: 'blue-500', 
            icon: Users 
          },
          { 
            label: 'Prozentuale Codes', 
            count: discountCodes.filter(d => d.type === 'percentage').length,
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
              placeholder="Rabattcodes suchen..."
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
              <SelectItem value="inactive">Inaktiv</SelectItem>
              <SelectItem value="expired">Abgelaufen</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button 
          onClick={() => setIsAddingDiscount(true)}
          className="bg-elbfunkeln-green text-white hover:bg-elbfunkeln-green/90"
        >
          <Plus size={16} className="mr-2" />
          Neuer Rabattcode
        </Button>
      </div>

      {/* Add/Edit Discount Form */}
      {(isAddingDiscount || editingDiscount) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="p-6 border-2 border-elbfunkeln-lavender/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-cormorant text-xl text-elbfunkeln-green">
                {editingDiscount ? 'Rabattcode bearbeiten' : 'Neuen Rabattcode erstellen'}
              </h3>
              <Button variant="ghost" size="sm" onClick={handleCancel}>
                <XCircle size={16} />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="code">Code *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                      placeholder="z.B. WELCOME10"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={generateRandomCode}
                    >
                      <Tag size={16} />
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Beschreibung *</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="z.B. Willkommensrabatt für Neukunden"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Rabatttyp *</Label>
                    <Select 
                      value={formData.type} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as 'percentage' | 'fixed' }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Prozentual (%)</SelectItem>
                        <SelectItem value="fixed">Fester Betrag (€)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="value">
                      {formData.type === 'percentage' ? 'Prozent *' : 'Betrag (€) *'}
                    </Label>
                    <Input
                      id="value"
                      type="number"
                      step={formData.type === 'percentage' ? '1' : '0.01'}
                      min="0"
                      max={formData.type === 'percentage' ? '100' : undefined}
                      value={formData.value || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minOrder">Mindestbestellwert (€)</Label>
                    <Input
                      id="minOrder"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.minOrder || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, minOrder: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxUses">Maximale Verwendungen</Label>
                    <Input
                      id="maxUses"
                      type="number"
                      min="1"
                      value={formData.maxUses || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxUses: parseInt(e.target.value) || 1 }))}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="validFrom">Gültig ab *</Label>
                    <Input
                      id="validFrom"
                      type="date"
                      value={formData.validFrom}
                      onChange={(e) => setFormData(prev => ({ ...prev, validFrom: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="validUntil">Gültig bis *</Label>
                    <Input
                      id="validUntil"
                      type="date"
                      value={formData.validUntil}
                      onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Kategorien (optional)</Label>
                  <div className="space-y-2 mt-2">
                    {categories.map(category => (
                      <div key={category} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={category}
                          checked={formData.categories.includes(category)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData(prev => ({ 
                                ...prev, 
                                categories: [...prev.categories, category] 
                              }));
                            } else {
                              setFormData(prev => ({ 
                                ...prev, 
                                categories: prev.categories.filter(c => c !== category) 
                              }));
                            }
                          }}
                          className="rounded border-elbfunkeln-lavender/30"
                        />
                        <Label htmlFor={category} className="text-sm">
                          {category}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Preview */}
                <div className="p-4 bg-elbfunkeln-beige/20 rounded-lg">
                  <h4 className="font-cormorant text-elbfunkeln-green mb-2">Vorschau:</h4>
                  <div className="text-sm space-y-1">
                    <div><strong>Code:</strong> {formData.code || 'CODE'}</div>
                    <div><strong>Rabatt:</strong> 
                      {formData.type === 'percentage' 
                        ? ` ${formData.value}%` 
                        : ` €${formData.value.toFixed(2)}`
                      }
                    </div>
                    {formData.minOrder > 0 && (
                      <div><strong>Ab:</strong> €{formData.minOrder.toFixed(2)}</div>
                    )}
                    <div><strong>Gültig:</strong> 
                      {formData.validFrom} bis {formData.validUntil}
                    </div>
                    {formData.categories.length > 0 && (
                      <div><strong>Kategorien:</strong> {formData.categories.join(', ')}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button 
                onClick={handleSaveDiscount}
                className="bg-elbfunkeln-green text-white hover:bg-elbfunkeln-green/90"
                disabled={!formData.code || !formData.description || formData.value <= 0}
              >
                <CheckCircle size={16} className="mr-2" />
                {editingDiscount ? 'Änderungen speichern' : 'Code erstellen'}
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                Abbrechen
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Discount Codes Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code & Beschreibung</TableHead>
                <TableHead>Rabatt</TableHead>
                <TableHead>Verwendung</TableHead>
                <TableHead>Gültigkeit</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDiscounts.map((discount) => (
                <TableRow key={discount.id}>
                  <TableCell>
                    <div>
                      <div className="flex items-center gap-2">
                        <code className="font-mono font-semibold text-elbfunkeln-green bg-elbfunkeln-beige/20 px-2 py-1 rounded text-sm">
                          {discount.code}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(discount.code)}
                          className="p-1 h-auto"
                        >
                          <Copy size={12} />
                        </Button>
                      </div>
                      <div className="text-sm text-elbfunkeln-green/70 mt-1">
                        {discount.description}
                      </div>
                      {discount.categories && discount.categories.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {discount.categories.map((cat, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {cat}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {discount.type === 'percentage' ? (
                        <>
                          <Percent size={14} className="text-elbfunkeln-rose" />
                          <span className="font-semibold text-elbfunkeln-green">
                            {discount.value}%
                          </span>
                        </>
                      ) : (
                        <>
                          <DollarSign size={14} className="text-elbfunkeln-rose" />
                          <span className="font-semibold text-elbfunkeln-green">
                            €{discount.value.toFixed(2)}
                          </span>
                        </>
                      )}
                    </div>
                    {discount.minOrder > 0 && (
                      <div className="text-xs text-elbfunkeln-green/60">
                        Ab €{discount.minOrder.toFixed(2)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={getUsagePercentage(discount.currentUses, discount.maxUses)} 
                          className="flex-1 h-2"
                        />
                        <span className="text-xs text-elbfunkeln-green/60 min-w-fit">
                          {discount.currentUses}/{discount.maxUses}
                        </span>
                      </div>
                      <div className="text-xs text-elbfunkeln-green/60">
                        {Math.round(getUsagePercentage(discount.currentUses, discount.maxUses))}% verwendet
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className={`flex items-center gap-1 ${isExpired(discount.validUntil) ? 'text-red-600' : 'text-elbfunkeln-green'}`}>
                        <Calendar size={12} />
                        {new Date(discount.validFrom).toLocaleDateString('de-DE')} -
                      </div>
                      <div className={`text-xs ${isExpired(discount.validUntil) ? 'text-red-600' : 'text-elbfunkeln-green/60'}`}>
                        {new Date(discount.validUntil).toLocaleDateString('de-DE')}
                      </div>
                      {isExpired(discount.validUntil) && (
                        <Badge className="bg-red-100 text-red-800 text-xs mt-1">
                          Abgelaufen
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={discount.isActive && !isExpired(discount.validUntil)}
                        onCheckedChange={() => handleToggleDiscountStatus(discount.id)}
                        disabled={isExpired(discount.validUntil)}
                      />
                      <div className="flex items-center gap-1">
                        {discount.isActive && !isExpired(discount.validUntil) ? (
                          <>
                            <Eye size={12} className="text-green-600" />
                            <span className="text-xs text-green-600">Aktiv</span>
                          </>
                        ) : isExpired(discount.validUntil) ? (
                          <>
                            <Clock size={12} className="text-red-600" />
                            <span className="text-xs text-red-600">Abgelaufen</span>
                          </>
                        ) : (
                          <>
                            <EyeOff size={12} className="text-gray-600" />
                            <span className="text-xs text-gray-600">Inaktiv</span>
                          </>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEditDiscount(discount)}
                      >
                        <Edit size={14} />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => copyToClipboard(discount.code)}
                      >
                        <Copy size={14} />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDeleteDiscount(discount.id, discount.code)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {filteredDiscounts.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-elbfunkeln-beige/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Tag className="w-12 h-12 text-elbfunkeln-green/40" />
          </div>
          <h3 className="font-cormorant text-xl text-elbfunkeln-green mb-2">
            Keine Rabattcodes gefunden
          </h3>
          <p className="text-elbfunkeln-green/60 mb-4">
            {searchTerm || statusFilter !== 'all' 
              ? 'Versuchen Sie einen anderen Suchbegriff oder Filter.' 
              : 'Erstellen Sie Ihren ersten Rabattcode, um loszulegen.'
            }
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <Button 
              onClick={() => setIsAddingDiscount(true)}
              className="bg-elbfunkeln-green text-white hover:bg-elbfunkeln-green/90"
            >
              <Plus size={16} className="mr-2" />
              Ersten Rabattcode erstellen
            </Button>
          )}
        </div>
      )}
    </div>
  );
}