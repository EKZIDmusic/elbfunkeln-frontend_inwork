// Produktarchiv für gelöschte Produkte (Soft-Delete)
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Package, Search, Archive, RefreshCw, RotateCcw, Trash2, AlertCircle
} from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useAuth } from '../AuthContext';
import apiService, { Product } from '../../services/apiService';
import { toast } from 'sonner@2.0.3';

export function ProductArchive() {
  const { accessToken } = useAuth();
  const [archivedProducts, setArchivedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);

  // Load data on mount
  useEffect(() => {
    if (accessToken) {
      loadArchivedProducts();
      loadCategories();
    }
  }, [accessToken]);

  const loadCategories = async () => {
    try {
      const categoriesData = await apiService.categories.getAll();
      setCategories(categoriesData.map(cat => ({ id: cat.id, name: cat.name })));
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Fehler beim Laden der Kategorien');
    }
  };

  const loadArchivedProducts = async () => {
    if (!accessToken) {
      toast.error('Nicht authentifiziert');
      return;
    }

    try {
      setLoading(true);
      console.log('🗄️ Loading archived products...');

      const response = await apiService.admin.products.getArchived();
      setArchivedProducts(response || []);

      console.log('✅ Archivierte Produkte geladen:', response?.length, 'Produkte');
    } catch (error) {
      console.error('Error loading archived products:', error);
      toast.error(`Fehler beim Laden des Archivs: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
    } finally {
      setLoading(false);
    }
  };

  // Filter products
  const filteredProducts = archivedProducts.filter(product => {
    const matchesSearch = searchQuery === '' ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());

    const productCategoryName = typeof product.category === 'object' ? product.category.name : product.category;
    const matchesCategory = selectedCategory === 'all' || productCategoryName === selectedCategory || product.categoryId === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Restore product
  const handleRestoreProduct = async (productId: string, productName: string) => {
    if (!window.confirm(`Produkt "${productName}" wiederherstellen?`)) return;

    try {
      setLoading(true);

      await apiService.admin.products.restore(productId);
      setArchivedProducts(archivedProducts.filter(p => p.id !== productId));
      toast.success(`Produkt "${productName}" wurde wiederhergestellt`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Fehler beim Wiederherstellen');
    } finally {
      setLoading(false);
    }
  };

  // Permanent delete (Admin only)
  const handlePermanentDelete = async (productId: string, productName: string) => {
    if (!window.confirm(`⚠️ WARNUNG: Produkt "${productName}" PERMANENT löschen?\n\nDiese Aktion kann NICHT rückgängig gemacht werden!`)) return;

    try {
      setLoading(true);

      await apiService.admin.products.permanentDelete(productId);
      setArchivedProducts(archivedProducts.filter(p => p.id !== productId));
      toast.success(`Produkt "${productName}" wurde permanent gelöscht`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Fehler beim permanenten Löschen');
    } finally {
      setLoading(false);
    }
  };

  if (loading && archivedProducts.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-5 w-5 animate-spin text-elbfunkeln-green" />
          <span className="text-elbfunkeln-green">Lade Archiv...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Archive Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Archivierte Produkte</p>
              <p className="text-2xl font-semibold text-orange-600">{archivedProducts.length}</p>
            </div>
            <Archive className="h-8 w-8 text-orange-600" />
          </div>
        </Card>

        <Card className="p-4 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Gefiltertes Ergebnis</p>
              <p className="text-2xl font-semibold text-blue-600">{filteredProducts.length}</p>
            </div>
            <Package className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-4 border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <AlertCircle className="h-5 w-5" />
            <span>Archivierte Produkte können wiederhergestellt werden</span>
          </div>
        </Card>
      </div>

      {/* Info Banner */}
      <Card className="p-4 bg-orange-50 border-orange-200">
        <div className="flex items-start gap-3">
          <Archive className="h-5 w-5 text-orange-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-orange-900 mb-1">Produktarchiv</h3>
            <p className="text-sm text-orange-700">
              Gelöschte Produkte werden hier archiviert und können jederzeit wiederhergestellt werden.
              Nur Administratoren können Produkte permanent löschen.
            </p>
          </div>
        </div>
      </Card>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Archivierte Produkte suchen..."
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
                <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={loadArchivedProducts}
          variant="outline"
          size="sm"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Aktualisieren
        </Button>
      </div>

      {/* Archived Products Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produkt</TableHead>
              <TableHead>Kategorie</TableHead>
              <TableHead>Preis</TableHead>
              <TableHead>Archiviert am</TableHead>
              <TableHead>Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id} className="opacity-75">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <img
                      src={product.images?.[0]?.url || product.image_url || 'https://via.placeholder.com/48x48?text=Kein+Bild'}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded-lg grayscale"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48x48?text=Kein+Bild';
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
                  <div className="text-sm text-gray-500">
                    {product.deletedAt
                      ? new Date(product.deletedAt).toLocaleDateString('de-DE', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'N/A'}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRestoreProduct(product.id, product.name)}
                      className="text-green-600 hover:text-green-800 hover:border-green-600"
                      title="Wiederherstellen"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePermanentDelete(product.id, product.name)}
                      className="text-red-600 hover:text-red-800 hover:border-red-600"
                      title="Permanent löschen (Admin)"
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
          <Archive className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">
            {searchQuery || selectedCategory !== 'all'
              ? 'Keine Produkte gefunden'
              : 'Das Archiv ist leer'}
          </p>
        </div>
      )}
    </div>
  );
}
