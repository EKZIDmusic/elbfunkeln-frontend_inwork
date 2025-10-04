import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Grid, List, Heart, ShoppingBag, Eye } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useRouter } from '../components/Router';
import { useCart } from '../components/CartContext';
import apiService, { Product, Category } from '../services/apiService';
import { toast } from 'sonner@2.0.3';

type ViewMode = 'grid' | 'list';
type SortOption = 'name' | 'price-low' | 'price-high' | 'new';

export function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [showSaleOnly, setShowSaleOnly] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { navigateTo, category } = useRouter();
  const { addToCart, toggleFavorite, isFavorite } = useCart();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Set initial category from router
    if (category) {
      setSelectedCategory(category);
      if (category.toLowerCase() === 'sale') {
        setShowSaleOnly(true);
      }
    }
  }, [category]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load products and categories from API
      const [productsResponse, categoriesResponse] = await Promise.all([
        apiService.products.getAll({ limit: 100 }),
        apiService.categories.getAll()
      ]);
      
      setProducts(productsResponse.data);
      setCategories(categoriesResponse);
      
      console.log('📦 Loaded products:', productsResponse.data.length);
      console.log('📂 Loaded categories:', categoriesResponse.length);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Fehler beim Laden der Produkte', {
        description: 'Bitte versuche es später erneut.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort products
  const filteredAndSortedProducts = () => {
    let filtered = [...products];
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category.slug === selectedCategory || p.category.id === selectedCategory);
    }
    
    // Filter by sale
    if (showSaleOnly) {
      filtered = filtered.filter(p => p.discountPrice !== null);
    }
    
    // Filter only active products
    filtered = filtered.filter(p => p.isActive);
    
    // Sort
    switch (sortBy) {
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'price-low':
        filtered.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
        break;
      case 'price-high':
        filtered.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
        break;
      case 'new':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }
    
    return filtered;
  };

  const displayedProducts = filteredAndSortedProducts();

  const getPrimaryImage = (product: Product): string => {
    const primaryImage = product.images.find(img => img.isPrimary);
    return primaryImage?.url || product.images[0]?.url || '';
  };

  const handleAddToCart = (product: Product) => {
    const primaryImage = getPrimaryImage(product);
    addToCart({
      id: product.id,
      productId: product.id,
      name: product.name,
      price: product.discountPrice || product.price,
      image: primaryImage,
      quantity: 1
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-elbfunkeln-beige py-16">
        <div className="container mx-auto px-4">
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-elbfunkeln-rose"></div>
            <p className="mt-4 text-elbfunkeln-green">Produkte werden geladen...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-elbfunkeln-beige py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="font-cormorant mb-4 text-elbfunkeln-green">Shop</h1>
          <p className="text-elbfunkeln-green max-w-2xl mx-auto">
            Entdecke unsere handgefertigten Drahtschmuck-Kreationen
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('all')}
              className="bg-elbfunkeln-green hover:bg-elbfunkeln-rose text-white border-elbfunkeln-green"
            >
              Alle
            </Button>
            {categories.map(cat => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id || selectedCategory === cat.slug ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(cat.slug)}
                className="bg-elbfunkeln-green hover:bg-elbfunkeln-rose text-white border-elbfunkeln-green"
              >
                {cat.name}
              </Button>
            ))}
            <Button
              variant={showSaleOnly ? 'default' : 'outline'}
              onClick={() => setShowSaleOnly(!showSaleOnly)}
              className="bg-elbfunkeln-rose hover:bg-elbfunkeln-green text-white border-elbfunkeln-rose"
            >
              Sale
            </Button>
          </div>

          <div className="flex gap-4 items-center">
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
              <SelectTrigger className="w-[180px] bg-white border-elbfunkeln-green">
                <SelectValue placeholder="Sortieren" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="price-low">Preis: Niedrig - Hoch</SelectItem>
                <SelectItem value="price-high">Preis: Hoch - Niedrig</SelectItem>
                <SelectItem value="new">Neueste</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2 border border-elbfunkeln-green rounded-lg p-1 bg-white">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('grid')}
                className={viewMode === 'grid' ? 'bg-elbfunkeln-green' : ''}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'bg-elbfunkeln-green' : ''}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Products Count */}
        <div className="mb-6 text-center text-elbfunkeln-green">
          {displayedProducts.length} {displayedProducts.length === 1 ? 'Produkt' : 'Produkte'} gefunden
        </div>

        {/* Products Grid/List */}
        {displayedProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-elbfunkeln-green">Keine Produkte gefunden.</p>
            <Button
              onClick={() => {
                setSelectedCategory('all');
                setShowSaleOnly(false);
              }}
              className="mt-4 bg-elbfunkeln-green hover:bg-elbfunkeln-rose"
            >
              Filter zurücksetzen
            </Button>
          </div>
        ) : (
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'flex flex-col gap-4'
          }>
            {displayedProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className={`overflow-hidden bg-white border-elbfunkeln-green/20 hover:shadow-lg transition-all ${
                  viewMode === 'list' ? 'flex flex-row' : ''
                }`}>
                  <div className={`relative ${viewMode === 'list' ? 'w-48' : 'w-full'} aspect-square`}>
                    <img
                      src={getPrimaryImage(product)}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    {product.discountPrice && (
                      <Badge className="absolute top-2 right-2 bg-elbfunkeln-rose text-white">
                        Sale
                      </Badge>
                    )}
                    {product.isFeatured && (
                      <Badge className="absolute top-2 left-2 bg-elbfunkeln-green text-white">
                        Featured
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                      onClick={() => toggleFavorite(product.id)}
                    >
                      <Heart className={`h-5 w-5 ${isFavorite(product.id) ? 'fill-elbfunkeln-rose text-elbfunkeln-rose' : 'text-elbfunkeln-green'}`} />
                    </Button>
                  </div>
                  <div className={`p-4 ${viewMode === 'list' ? 'flex-1 flex flex-col justify-between' : ''}`}>
                    <div>
                      <p className="text-sm text-elbfunkeln-rose mb-1">{product.category.name}</p>
                      <h3 className="font-cormorant mb-2 text-elbfunkeln-green">{product.name}</h3>
                      {viewMode === 'list' && (
                        <p className="text-sm text-elbfunkeln-green/80 mb-4 line-clamp-2">{product.description}</p>
                      )}
                      <div className="flex items-center gap-2 mb-4">
                        {product.discountPrice ? (
                          <>
                            <span className="text-elbfunkeln-rose">{product.discountPrice.toFixed(2)} €</span>
                            <span className="text-sm text-elbfunkeln-green/60 line-through">{product.price.toFixed(2)} €</span>
                          </>
                        ) : (
                          <span className="text-elbfunkeln-green">{product.price.toFixed(2)} €</span>
                        )}
                      </div>
                      {product.stock === 0 && (
                        <p className="text-sm text-elbfunkeln-rose mb-2">Ausverkauft</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigateTo('product', product.id)}
                        className="flex-1 border-elbfunkeln-green text-elbfunkeln-green hover:bg-elbfunkeln-green hover:text-white"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ansehen
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0}
                        className="flex-1 bg-elbfunkeln-green hover:bg-elbfunkeln-rose text-white"
                      >
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        In den Warenkorb
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
