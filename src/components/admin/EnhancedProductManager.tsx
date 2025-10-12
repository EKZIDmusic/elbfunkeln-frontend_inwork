import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Separator } from '../ui/separator';
import { toast } from 'sonner';
import apiService, { Product, Category } from '../../services/apiService';
import { validateProductForeignKeys } from '../../utils/validation';

// API wrapper functions
const getProducts = async () => {
  const response = await apiService.products.getAll();
  return response.data;
};

const createProduct = async (product: any) => {
  const productData = {
    name: product.name,
    description: product.description,
    price: product.price,
    sku: product.sku || `SKU-${Date.now()}`,
    stock: product.stock,
    categoryId: product.categoryId,
    isActive: product.status === 'active',
    discountPrice: product.discountPrice || product.salePrice,
    isFeatured: product.isFeatured || false,
    giftboxavailable: product.giftWrappingAvailable || product.giftboxavailable || false
  };

  // Validate foreign keys before sending to API
  validateProductForeignKeys(productData);

  return await apiService.admin.products.create(productData);
};

const updateProduct = async (id: string, product: any) => {
  const productData = {
    name: product.name,
    description: product.description,
    price: product.price,
    stock: product.stock,
    categoryId: product.categoryId,
    isActive: product.status === 'active',
    discountPrice: product.discountPrice || product.salePrice,
    isFeatured: product.isFeatured,
    giftboxavailable: product.giftWrappingAvailable || product.giftboxavailable
  };

  // Validate foreign keys before sending to API
  validateProductForeignKeys(productData);

  return await apiService.admin.products.update(id, productData);
};

const deleteProduct = async (id: string) => {
  await apiService.admin.products.delete(id);
  return true;
};

// Erweiterte Produktdatenstruktur
export interface EnhancedProduct extends Product {
  // Anpassbare Produktfelder
  customAttributes: ProductAttribute[];
  materials: string[];
  colors: ProductColor[];
  sizes: ProductSize[];
  dimensions: ProductDimension[];
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
  isNew: boolean;
  isSale: boolean;
  salePrice?: number;
  weight?: number;
  careInstructions?: string;
  giftWrappingAvailable: boolean;
}

export interface ProductAttribute {
  id: string;
  name: string;
  type: 'text' | 'number' | 'select' | 'boolean' | 'color' | 'size';
  value: any;
  options?: string[];
  required: boolean;
  displayOrder: number;
}

export interface ProductColor {
  id: string;
  name: string;
  hexCode: string;
  available: boolean;
  stockQuantity: number;
}

export interface ProductSize {
  id: string;
  name: string;
  value: string; // z.B. "52", "M", "16cm"
  type: 'ring' | 'chain' | 'general';
  available: boolean;
  stockQuantity: number;
}

export interface ProductDimension {
  id: string;
  name: string;
  value: number;
  unit: 'cm' | 'mm' | 'inch';
  type: 'length' | 'width' | 'height' | 'diameter' | 'thickness';
}

// Standard Attribut-Templates
const attributeTemplates = {
  jewelry: [
    { name: 'Material', type: 'select', options: ['925 Silber', '14K Gold', '18K Gold', 'Kupfer', 'Edelstahl'], required: true },
    { name: 'Kettenlänge', type: 'select', options: ['40cm', '42cm', '45cm', '50cm', '55cm', '60cm'], required: false },
    { name: 'Ringgröße', type: 'select', options: ['50', '52', '54', '56', '58', '60', '62', '64'], required: false },
    { name: 'Verschluss', type: 'select', options: ['Karabiner', 'Federring', 'Magnetisch', 'Stecker'], required: false },
    { name: 'Gravur möglich', type: 'boolean', required: false },
    { name: 'Wasserfest', type: 'boolean', required: false },
  ],
  rings: [
    { name: 'Ringgröße', type: 'select', options: ['50', '52', '54', '56', '58', '60', '62', '64'], required: true },
    { name: 'Ringbreite', type: 'select', options: ['2mm', '3mm', '4mm', '5mm', '6mm'], required: false },
    { name: 'Gravur möglich', type: 'boolean', required: false },
  ],
  earrings: [
    { name: 'Verschluss', type: 'select', options: ['Stecker', 'Haken', 'Creolen', 'Clip'], required: true },
    { name: 'Für Allergiker geeignet', type: 'boolean', required: false },
  ],
  necklaces: [
    { name: 'Kettenlänge', type: 'select', options: ['40cm', '42cm', '45cm', '50cm', '55cm', '60cm'], required: true },
    { name: 'Anhänger enthalten', type: 'boolean', required: false },
    { name: 'Verstellbar', type: 'boolean', required: false },
  ],
  bracelets: [
    { name: 'Länge', type: 'select', options: ['16cm', '17cm', '18cm', '19cm', '20cm', '21cm'], required: true },
    { name: 'Verstellbar', type: 'boolean', required: false },
    { name: 'Verschluss', type: 'select', options: ['Karabiner', 'Magnetisch', 'Knebel', 'Elastisch'], required: false },
  ]
};

export function EnhancedProductManager() {
  const [products, setProducts] = useState<EnhancedProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<EnhancedProduct | null>(null);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form state
  const [formData, setFormData] = useState<Partial<EnhancedProduct>>({
    name: '',
    description: '',
    price: 0,
    image_url: '',
    category: '',
    stock: 0,
    status: 'active',
    images: [],
    customAttributes: [],
    materials: [],
    colors: [],
    sizes: [],
    dimensions: [],
    tags: [],
    isNew: false,
    isSale: false,
    giftWrappingAvailable: false
  });

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const loadedCategories = await apiService.categories.getAll();
      setCategories(loadedCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Fehler beim Laden der Kategorien');
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const basicProducts = await getProducts();

      // Konvertiere zu EnhancedProduct Format (mit Fallback-Werten)
      const enhancedProducts: EnhancedProduct[] = basicProducts.map(product => ({
        ...product,
        customAttributes: [],
        materials: ['Handgefertigter Draht'],
        colors: [],
        sizes: [],
        dimensions: [],
        tags: [],
        isNew: false,
        isSale: false,
        giftWrappingAvailable: false,
        // Lade erweiterte Daten aus localStorage falls verfügbar
        ...getStoredProductEnhancements(product.id)
      }));

      setProducts(enhancedProducts);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Fehler beim Laden der Produkte');
    } finally {
      setLoading(false);
    }
  };

  const getStoredProductEnhancements = (productId: string): Partial<EnhancedProduct> => {
    try {
      const stored = localStorage.getItem(`elbfunkeln:product-enhancements:${productId}`);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  };

  const saveProductEnhancements = (productId: string, enhancements: Partial<EnhancedProduct>) => {
    try {
      localStorage.setItem(`elbfunkeln:product-enhancements:${productId}`, JSON.stringify(enhancements));
    } catch (error) {
      console.error('Error saving product enhancements:', error);
    }
  };

  const handleSaveProduct = async () => {
    try {
      if (!formData.name || !formData.price || !formData.category) {
        toast.error('Bitte füllen Sie alle Pflichtfelder aus');
        return;
      }

      const productData = {
        name: formData.name!,
        description: formData.description || '',
        price: formData.price!,
        image_url: formData.image_url || '',
        categoryId: formData.category!,
        stock: formData.stock || 0,
        status: formData.status as 'active' | 'inactive'
      };

      let savedProduct: Product;

      if (isCreateMode) {
        savedProduct = await createProduct(productData);
        toast.success('Produkt erfolgreich erstellt!');
      } else if (editingProduct) {
        savedProduct = await updateProduct(editingProduct.id, productData);
        toast.success('Produkt erfolgreich aktualisiert!');
      } else {
        return;
      }

      // Speichere erweiterte Daten separat (inkl. Bilder)
      const enhancements = {
        images: formData.images || [],
        customAttributes: formData.customAttributes || [],
        materials: formData.materials || [],
        colors: formData.colors || [],
        sizes: formData.sizes || [],
        dimensions: formData.dimensions || [],
        tags: formData.tags || [],
        seoTitle: formData.seoTitle,
        seoDescription: formData.seoDescription,
        isNew: formData.isNew || false,
        isSale: formData.isSale || false,
        salePrice: formData.salePrice,
        weight: formData.weight,
        careInstructions: formData.careInstructions,
        giftWrappingAvailable: formData.giftWrappingAvailable || false
      };

      saveProductEnhancements(savedProduct.id, enhancements);

      // Reset form
      setFormData({
        name: '',
        description: '',
        price: 0,
        image_url: '',
        category: '',
        stock: 0,
        status: 'active',
        images: [],
        customAttributes: [],
        materials: [],
        colors: [],
        sizes: [],
        dimensions: [],
        tags: [],
        isNew: false,
        isSale: false,
        giftWrappingAvailable: false
      });
      setEditingProduct(null);
      setIsCreateMode(false);
      
      // Reload products
      await loadProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Fehler beim Speichern des Produkts');
    }
  };

  const handleEditProduct = (product: EnhancedProduct) => {
    // Setze categoryId als UUID, nicht als Objekt
    const categoryId = typeof product.category === 'object' ? product.category.id : product.categoryId;
    setFormData({ ...product, category: categoryId } as any);
    setEditingProduct(product);
    setIsCreateMode(false);
  };

  const handleCreateProduct = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      image_url: '',
      category: '',
      stock: 0,
      status: 'active',
      images: [],
      customAttributes: [],
      materials: [],
      colors: [],
      sizes: [],
      dimensions: [],
      tags: [],
      isNew: false,
      isSale: false,
      giftWrappingAvailable: false
    });
    setEditingProduct(null);
    setIsCreateMode(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Sind Sie sicher, dass Sie dieses Produkt löschen möchten?')) {
      return;
    }

    try {
      await deleteProduct(productId);
      // Lösche auch erweiterte Daten
      localStorage.removeItem(`elbfunkeln:product-enhancements:${productId}`);
      toast.success('Produkt erfolgreich gelöscht!');
      await loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Fehler beim Löschen des Produkts');
    }
  };

  const addCustomAttribute = () => {
    const newAttribute: ProductAttribute = {
      id: `attr-${Date.now()}`,
      name: '',
      type: 'text',
      value: '',
      required: false,
      displayOrder: (formData.customAttributes?.length || 0) + 1
    };
    
    setFormData({
      ...formData,
      customAttributes: [...(formData.customAttributes || []), newAttribute]
    });
  };

  const updateCustomAttribute = (attributeId: string, updates: Partial<ProductAttribute>) => {
    setFormData({
      ...formData,
      customAttributes: formData.customAttributes?.map(attr =>
        attr.id === attributeId ? { ...attr, ...updates } : attr
      ) || []
    });
  };

  const removeCustomAttribute = (attributeId: string) => {
    setFormData({
      ...formData,
      customAttributes: formData.customAttributes?.filter(attr => attr.id !== attributeId) || []
    });
  };

  const applyAttributeTemplate = (templateKey: keyof typeof attributeTemplates) => {
    const template = attributeTemplates[templateKey];
    const newAttributes: ProductAttribute[] = template.map((tmpl, index) => ({
      id: `attr-${Date.now()}-${index}`,
      name: tmpl.name,
      type: tmpl.type as ProductAttribute['type'],
      value: tmpl.type === 'boolean' ? false : tmpl.type === 'select' ? '' : '',
      options: tmpl.options,
      required: tmpl.required,
      displayOrder: index + 1
    }));

    setFormData({
      ...formData,
      customAttributes: [...(formData.customAttributes || []), ...newAttributes]
    });
    
    toast.success(`${template.length} Attribute hinzugefügt`);
  };

  const filteredProducts = products.filter(product => {
    const categoryId = typeof product.category === 'object' ? product.category.id : product.categoryId;
    const matchesCategory = selectedCategory === 'all' || categoryId === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-elbfunkeln-green"></div>
        <span className="ml-3 text-elbfunkeln-green">Lade Produkte...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-cormorant text-2xl text-elbfunkeln-green">Erweiterte Produktverwaltung</h2>
          <p className="font-inter text-sm text-elbfunkeln-green/70">
            Verwalten Sie Ihre Produkte mit erweiterten Attributen und Eigenschaften
          </p>
        </div>
        <Button onClick={handleCreateProduct} className="bg-elbfunkeln-lavender text-white">
          <Plus size={16} className="mr-2" />
          Neues Produkt
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <Input
          placeholder="Produkte suchen..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Kategorie wählen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Kategorien</SelectItem>
            {categories.map(category => (
              <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="p-4 border-0 bg-gradient-to-br from-white to-elbfunkeln-beige/20 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="aspect-square overflow-hidden rounded-lg mb-4">
              <img
                src={product.images?.[0]?.url || product.image_url || 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=300&q=80'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                  {product.status === 'active' ? 'Aktiv' : 'Inaktiv'}
                </Badge>
                <div className="flex items-center gap-1">
                  {product.isNew && <Badge className="bg-elbfunkeln-lavender text-white">Neu</Badge>}
                  {product.isSale && <Badge className="bg-elbfunkeln-rose text-white">Sale</Badge>}
                </div>
              </div>
              
              <h3 className="font-cormorant text-lg text-elbfunkeln-green">{product.name}</h3>
              <p className="font-inter text-sm text-elbfunkeln-green/70 line-clamp-2">{product.description}</p>
              
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-cormorant text-lg text-elbfunkeln-green">
                    €{product.price.toFixed(2)}
                  </span>
                  {product.isSale && product.salePrice && (
                    <span className="text-sm text-gray-500 line-through ml-2">
                      €{product.salePrice.toFixed(2)}
                    </span>
                  )}
                </div>
                <span className="text-sm text-elbfunkeln-green/70">Lager: {product.stock}</span>
              </div>

              {/* Custom Attributes Preview */}
              {product.customAttributes.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {product.customAttributes.slice(0, 3).map((attr) => (
                    <Badge key={attr.id} variant="outline" className="text-xs">
                      {attr.name}: {String(attr.value)}
                    </Badge>
                  ))}
                  {product.customAttributes.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{product.customAttributes.length - 3} weitere
                    </Badge>
                  )}
                </div>
              )}
              
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditProduct(product)}
                  className="flex-1"
                >
                  <Edit size={14} className="mr-1" />
                  Bearbeiten
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteProduct(product.id)}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Product Form Dialog */}
      <Dialog open={isCreateMode || !!editingProduct} onOpenChange={(open) => {
        if (!open) {
          setIsCreateMode(false);
          setEditingProduct(null);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-cormorant text-xl text-elbfunkeln-green">
              {isCreateMode ? 'Neues Produkt erstellen' : 'Produkt bearbeiten'}
            </DialogTitle>
            <DialogDescription>
              Verwalten Sie alle Produktdaten und erweiterte Eigenschaften
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Grunddaten */}
            <div className="space-y-4">
              <h3 className="font-cormorant text-lg text-elbfunkeln-green">Grunddaten</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Produktname *</Label>
                  <Input
                    id="name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Name des Produkts"
                  />
                </div>
                
                <div>
                  <Label htmlFor="category">Kategorie *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Kategorie wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="price">Preis * (€)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price || ''}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <Label htmlFor="stock">Lagerbestand</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock || ''}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Beschreibung</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Produktbeschreibung..."
                  rows={3}
                />
              </div>

              {/* Product Images Management */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Produktbilder (imgur Links)</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const currentImages = formData.images || [];
                      setFormData({
                        ...formData,
                        images: [...currentImages, { id: `temp-${Date.now()}`, url: '', alt: '', isPrimary: currentImages.length === 0 }]
                      });
                    }}
                  >
                    <Plus size={14} className="mr-1" />
                    Bild hinzufügen
                  </Button>
                </div>

                {(formData.images || []).map((image, index) => (
                  <Card key={image.id || index} className="p-3">
                    <div className="flex gap-3">
                      {/* Image Preview */}
                      {image.url && (
                        <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                          <img
                            src={image.url}
                            alt={image.alt || 'Produktbild'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=300&q=80';
                            }}
                          />
                        </div>
                      )}

                      {/* Image Fields */}
                      <div className="flex-1 space-y-2">
                        <div>
                          <Label className="text-xs">Bild-URL (imgur)</Label>
                          <Input
                            value={image.url}
                            onChange={(e) => {
                              const updatedImages = [...(formData.images || [])];
                              updatedImages[index] = { ...updatedImages[index], url: e.target.value };
                              setFormData({ ...formData, images: updatedImages });
                            }}
                            placeholder="https://i.imgur.com/..."
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Alt-Text (optional)</Label>
                          <Input
                            value={image.alt || ''}
                            onChange={(e) => {
                              const updatedImages = [...(formData.images || [])];
                              updatedImages[index] = { ...updatedImages[index], alt: e.target.value };
                              setFormData({ ...formData, images: updatedImages });
                            }}
                            placeholder="Beschreibung des Bildes"
                            className="text-sm"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`primary-${index}`}
                              checked={image.isPrimary || false}
                              onCheckedChange={(checked) => {
                                const updatedImages = (formData.images || []).map((img, i) => ({
                                  ...img,
                                  isPrimary: i === index ? !!checked : false
                                }));
                                setFormData({ ...formData, images: updatedImages });
                              }}
                            />
                            <Label htmlFor={`primary-${index}`} className="text-xs">Hauptbild</Label>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const updatedImages = (formData.images || []).filter((_, i) => i !== index);
                              // Wenn das erste Bild gelöscht wird, mache das nächste zum Hauptbild
                              if (updatedImages.length > 0 && image.isPrimary) {
                                updatedImages[0].isPrimary = true;
                              }
                              setFormData({ ...formData, images: updatedImages });
                            }}
                            className="text-red-600"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}

                {(!formData.images || formData.images.length === 0) && (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <p className="text-sm text-gray-500">Keine Bilder hinzugefügt</p>
                    <p className="text-xs text-gray-400 mt-1">Klicken Sie auf "Bild hinzufügen", um Produktbilder hochzuladen</p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isNew"
                    checked={formData.isNew || false}
                    onCheckedChange={(checked) => setFormData({ ...formData, isNew: !!checked })}
                  />
                  <Label htmlFor="isNew">Als "Neu" markieren</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isSale"
                    checked={formData.isSale || false}
                    onCheckedChange={(checked) => setFormData({ ...formData, isSale: !!checked })}
                  />
                  <Label htmlFor="isSale">Sale-Artikel</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="giftWrapping"
                    checked={formData.giftWrappingAvailable || false}
                    onCheckedChange={(checked) => setFormData({ ...formData, giftWrappingAvailable: !!checked })}
                  />
                  <Label htmlFor="giftWrapping">Geschenkverpackung verfügbar</Label>
                </div>
              </div>
            </div>

            <Separator />

            {/* Erweiterte Attribute */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-cormorant text-lg text-elbfunkeln-green">Erweiterte Attribute</h3>
                <div className="flex gap-2">
                  <Select onValueChange={(value) => applyAttributeTemplate(value as keyof typeof attributeTemplates)}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Vorlage anwenden" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jewelry">Allgemein Schmuck</SelectItem>
                      <SelectItem value="rings">Ringe</SelectItem>
                      <SelectItem value="earrings">Ohrringe</SelectItem>
                      <SelectItem value="necklaces">Ketten</SelectItem>
                      <SelectItem value="bracelets">Armbänder</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={addCustomAttribute} variant="outline" size="sm">
                    <Plus size={14} className="mr-1" />
                    Attribut hinzufügen
                  </Button>
                </div>
              </div>

              {formData.customAttributes?.map((attribute) => (
                <Card key={attribute.id} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                      <Label>Attributname</Label>
                      <Input
                        value={attribute.name}
                        onChange={(e) => updateCustomAttribute(attribute.id, { name: e.target.value })}
                        placeholder="z.B. Kettenlänge"
                      />
                    </div>
                    
                    <div>
                      <Label>Typ</Label>
                      <Select
                        value={attribute.type}
                        onValueChange={(value) => updateCustomAttribute(attribute.id, { type: value as ProductAttribute['type'] })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="number">Zahl</SelectItem>
                          <SelectItem value="select">Auswahl</SelectItem>
                          <SelectItem value="boolean">Ja/Nein</SelectItem>
                          <SelectItem value="color">Farbe</SelectItem>
                          <SelectItem value="size">Größe</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Wert</Label>
                      {attribute.type === 'boolean' ? (
                        <div className="flex items-center mt-2">
                          <Checkbox
                            checked={!!attribute.value}
                            onCheckedChange={(checked) => updateCustomAttribute(attribute.id, { value: checked })}
                          />
                        </div>
                      ) : attribute.type === 'select' ? (
                        <Select
                          value={String(attribute.value)}
                          onValueChange={(value) => updateCustomAttribute(attribute.id, { value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Wert wählen" />
                          </SelectTrigger>
                          <SelectContent>
                            {attribute.options?.map((option) => (
                              <SelectItem key={option} value={option}>{option}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          type={attribute.type === 'number' ? 'number' : 'text'}
                          value={String(attribute.value)}
                          onChange={(e) => updateCustomAttribute(attribute.id, { 
                            value: attribute.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value 
                          })}
                          placeholder="Wert eingeben"
                        />
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`required-${attribute.id}`}
                          checked={attribute.required}
                          onCheckedChange={(checked) => updateCustomAttribute(attribute.id, { required: !!checked })}
                        />
                        <Label htmlFor={`required-${attribute.id}`} className="text-xs">Pflicht</Label>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeCustomAttribute(attribute.id)}
                        className="text-red-600"
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  </div>
                  
                  {attribute.type === 'select' && (
                    <div className="mt-2">
                      <Label className="text-xs">Optionen (kommagetrennt)</Label>
                      <Input
                        value={attribute.options?.join(', ') || ''}
                        onChange={(e) => updateCustomAttribute(attribute.id, { 
                          options: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                        })}
                        placeholder="Option 1, Option 2, Option 3"
                        className="text-xs"
                      />
                    </div>
                  )}
                </Card>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateMode(false);
                  setEditingProduct(null);
                }}
              >
                Abbrechen
              </Button>
              <Button onClick={handleSaveProduct} className="bg-elbfunkeln-lavender text-white">
                <Save size={16} className="mr-2" />
                {isCreateMode ? 'Erstellen' : 'Speichern'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}