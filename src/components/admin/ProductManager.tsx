// Vereinfachter Produktmanager für Elbfunkeln Admin-Dashboard
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Package, Search, Plus, Edit, Trash2, Eye, 
  RefreshCw, AlertTriangle, CheckCircle, XCircle
} from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { useAuth } from '../AuthContext';
import apiService, { Product } from '../../services/apiService';
import { toast } from 'sonner@2.0.3';

// Compatibility wrapper functions
const getProducts = async () => {
  const response = await apiService.products.getAll();
  return response.data;
};

const createProduct = async (product: any) => {
  console.log('TODO: Implement createProduct in API');
  toast.info('Produkterstellung ist noch nicht verfügbar');
  return product;
};

const updateProduct = async (id: string, product: any) => {
  console.log('TODO: Implement updateProduct in API');
  toast.info('Produktaktualisierung ist noch nicht verfügbar');
  return product;
};

const deleteProduct = async (id: string) => {
  console.log('TODO: Implement deleteProduct in API');
  toast.info('Produktlöschung ist noch nicht verfügbar');
  return true;
};

interface ProductFormData {
  name: string;
  description: string;
  detailed_description?: string;
  care_instructions?: string;
  price: number;
  image_url: string;
  category: string;
  stock: number;
  status: 'active' | 'inactive';
}

export function ProductManager() {
  const { accessToken } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Product Form
  const [productForm, setProductForm] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    image_url: '',
    category: 'Ohrringe',
    stock: 0, // Standard: 0 statt 1, damit neue Produkte auf der Website sichtbar sind
    status: 'active'
  });

  const categories = ['Ohrringe', 'Ringe', 'Armbänder', 'Ketten', 'Anhänger'];

  // Load data on mount
  useEffect(() => {
    if (accessToken) {
      loadData();
    }
  }, [accessToken]);

  const loadData = async () => {
    if (!accessToken) {
      toast.error('Nicht authentifiziert');
      return;
    }

    try {
      setLoading(true);
      
      console.log('🔧 Loading products with Supabase service...');
      
      const productsData = await getProducts();
      setProducts(productsData || []);
      
      console.log('✅ Produkte erfolgreich geladen:', productsData?.length, 'Produkte');
      toast.success('Produkte erfolgreich geladen');
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error(`Fehler beim Laden der Produkte: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
    } finally {
      setLoading(false);
    }
  };

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = searchQuery === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || product.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Create product
  const handleCreateProduct = async () => {
    if (!productForm.name || !productForm.description || productForm.price <= 0) {
      toast.error('Bitte füllen Sie alle Pflichtfelder korrekt aus');
      return;
    }

    try {
      setLoading(true);
      
      const newProduct = await createProduct(productForm);
      setProducts([newProduct, ...products]);
      
      // Reset form
      setProductForm({
        name: '',
        description: '',
        price: 0,
        image_url: '',
        category: 'Ohrringe',
        stock: 0,
        status: 'active'
      });
      
      setShowCreateDialog(false);
      toast.success(`Produkt "${newProduct.name}" erfolgreich erstellt`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Fehler beim Erstellen des Produkts');
    } finally {
      setLoading(false);
    }
  };

  // Update product
  const handleUpdateProduct = async () => {
    if (!editingProduct || !productForm.name || !productForm.description || productForm.price <= 0) {
      toast.error('Bitte füllen Sie alle Pflichtfelder korrekt aus');
      return;
    }

    try {
      setLoading(true);
      
      const updatedProduct = await updateProduct(editingProduct.id, productForm);
      setProducts(products.map(p => p.id === editingProduct.id ? updatedProduct : p));
      
      setShowEditDialog(false);
      setEditingProduct(null);
      toast.success(`Produkt "${updatedProduct.name}" erfolgreich aktualisiert`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Fehler beim Aktualisieren des Produkts');
    } finally {
      setLoading(false);
    }
  };

  // Delete product
  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!window.confirm(`Produkt "${productName}" wirklich löschen?`)) return;

    try {
      setLoading(true);
      
      await deleteProduct(productId);
      setProducts(products.filter(p => p.id !== productId));
      toast.success(`Produkt "${productName}" erfolgreich gelöscht`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Fehler beim Löschen des Produkts');
    } finally {
      setLoading(false);
    }
  };

  // Open edit dialog
  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      detailed_description: product.detailed_description,
      care_instructions: product.care_instructions,
      price: product.price,
      image_url: product.image_url,
      category: product.category,
      stock: product.stock,
      status: product.status
    });
    setShowEditDialog(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Aktiv</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Inaktiv</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-5 w-5 animate-spin text-elbfunkeln-green" />
          <span className="text-elbfunkeln-green">Lade Produktdaten...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Product Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 border-elbfunkeln-green/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Gesamt</p>
              <p className="text-2xl font-semibold text-elbfunkeln-green">{products.length}</p>
            </div>
            <Package className="h-8 w-8 text-elbfunkeln-green" />
          </div>
        </Card>
        
        <Card className="p-4 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Aktiv</p>
              <p className="text-2xl font-semibold text-green-600">
                {products.filter(p => p.status === 'active').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </Card>
        
        <Card className="p-4 border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Inaktiv</p>
              <p className="text-2xl font-semibold text-gray-600">
                {products.filter(p => p.status === 'inactive').length}
              </p>
            </div>
            <XCircle className="h-8 w-8 text-gray-600" />
          </div>
        </Card>
        
        <Card className="p-4 border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Niedrig Lager</p>
              <p className="text-2xl font-semibold text-orange-600">
                {products.filter(p => p.stock < 5).length}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-600" />
          </div>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Produkte suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Kategorien</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Status</SelectItem>
              <SelectItem value="active">Aktiv</SelectItem>
              <SelectItem value="inactive">Inaktiv</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={loadData} 
            variant="outline" 
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Aktualisieren
          </Button>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-elbfunkeln-green hover:bg-elbfunkeln-green/90">
                <Plus className="h-4 w-4 mr-2" />
                Produkt erstellen
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Neues Produkt erstellen</DialogTitle>
                <DialogDescription>
                  Erstellen Sie ein neues Produkt für Ihren Elbfunkeln-Shop.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Produktname</Label>
                    <Input
                      id="name"
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      placeholder="z.B. Elegante Draht-Ohrringe"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="category">Kategorie</Label>
                    <Select value={productForm.category} onValueChange={(value) => setProductForm({ ...productForm, category: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Beschreibung</Label>
                  <Textarea
                    id="description"
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    placeholder="Kurze Produktbeschreibung..."
                    rows={2}
                  />
                </div>
                
                <div>
                  <Label htmlFor="detailed_description">Detaillierte Beschreibung</Label>
                  <Textarea
                    id="detailed_description"
                    value={productForm.detailed_description || ''}
                    onChange={(e) => setProductForm({ ...productForm, detailed_description: e.target.value })}
                    placeholder="Ausführliche Produktbeschreibung mit zusätzlichen Details..."
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="care_instructions">Pflegehinweise</Label>
                  <Textarea
                    id="care_instructions"
                    value={productForm.care_instructions || ''}
                    onChange={(e) => setProductForm({ ...productForm, care_instructions: e.target.value })}
                    placeholder="Pflegehinweise für dieses Produkt..."
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="price">Preis (€)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="stock">Lagerbestand</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={productForm.stock}
                      onChange={(e) => setProductForm({ ...productForm, stock: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={productForm.status} onValueChange={(value: any) => setProductForm({ ...productForm, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Aktiv</SelectItem>
                        <SelectItem value="inactive">Inaktiv</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="image_url">Bild-URL</Label>
                  <Input
                    id="image_url"
                    value={productForm.image_url}
                    onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={handleCreateProduct}
                    disabled={loading}
                    className="flex-1"
                  >
                    Erstellen
                  </Button>
                  <Button 
                    onClick={() => setShowCreateDialog(false)}
                    variant="outline"
                    disabled={loading}
                  >
                    Abbrechen
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Products Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produkt</TableHead>
              <TableHead>Kategorie</TableHead>
              <TableHead>Preis</TableHead>
              <TableHead>Lager</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Erstellt</TableHead>
              <TableHead>Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=48&h=48&fit=crop';
                      }}
                    />
                    <div>
                      <div className="font-semibold">{product.name}</div>
                      <div className="text-sm text-gray-500 line-clamp-1">{product.description}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{typeof product.category === 'object' ? product.category.name : product.category}</Badge>
                </TableCell>
                <TableCell>
                  <span className="font-semibold">{product.price.toFixed(2)} €</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className={product.stock < 5 ? 'text-orange-600 font-semibold' : ''}>
                      {product.stock}
                    </span>
                    {product.stock < 5 && (
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                    )}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(product.status)}</TableCell>
                <TableCell>
                  <div className="text-sm">
                    {new Date(product.created_at).toLocaleDateString('de-DE')}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(product)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteProduct(product.id, product.name)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {filteredProducts.length === 0 && !loading && (
        <div className="text-center py-8">
          <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">Keine Produkte gefunden</p>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Produkt bearbeiten</DialogTitle>
            <DialogDescription>
              Bearbeiten Sie die Details dieses Produkts.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Produktname</Label>
                <Input
                  id="edit-name"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-category">Kategorie</Label>
                <Select value={productForm.category} onValueChange={(value) => setProductForm({ ...productForm, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit-description">Beschreibung</Label>
              <Textarea
                id="edit-description"
                value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                rows={2}
              />
            </div>
            
            <div>
              <Label htmlFor="edit-detailed_description">Detaillierte Beschreibung</Label>
              <Textarea
                id="edit-detailed_description"
                value={productForm.detailed_description || ''}
                onChange={(e) => setProductForm({ ...productForm, detailed_description: e.target.value })}
                placeholder="Ausführliche Produktbeschreibung mit zusätzlichen Details..."
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="edit-care_instructions">Pflegehinweise</Label>
              <Textarea
                id="edit-care_instructions"
                value={productForm.care_instructions || ''}
                onChange={(e) => setProductForm({ ...productForm, care_instructions: e.target.value })}
                placeholder="Pflegehinweise für dieses Produkt..."
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit-price">Preis (€)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) || 0 })}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-stock">Lagerbestand</Label>
                <Input
                  id="edit-stock"
                  type="number"
                  value={productForm.stock}
                  onChange={(e) => setProductForm({ ...productForm, stock: parseInt(e.target.value) || 0 })}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select value={productForm.status} onValueChange={(value: any) => setProductForm({ ...productForm, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Aktiv</SelectItem>
                    <SelectItem value="inactive">Inaktiv</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit-image_url">Bild-URL</Label>
              <Input
                id="edit-image_url"
                value={productForm.image_url}
                onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
              />
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleUpdateProduct}
                disabled={loading}
                className="flex-1"
              >
                Aktualisieren
              </Button>
              <Button 
                onClick={() => setShowEditDialog(false)}
                variant="outline"
                disabled={loading}
              >
                Abbrechen
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}