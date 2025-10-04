import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShoppingCart, Heart, Eye, Star } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { products, categories } from '../data/products';
import { useCart, Product as CartProduct } from './CartContext';
import { useRouter } from './Router';
import { toast } from 'sonner@2.0.3';
import { addToFavorites, removeFromFavorites, isFavorite } from '../pages/FavoritesPage';


interface StaticProductGridProps {
  categoryId?: string;
  limit?: number;
  showCategory?: boolean;
  title?: string;
}

// Convert legacy Product to match new interface
interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description?: string;
  isNew?: boolean;
  isSale?: boolean;
  inStock?: boolean;
  materials?: string[];
  dimensions?: string;
  originalPrice?: number;
}

export function StaticProductGrid({ 
  categoryId, 
  limit = 12, 
  showCategory = false,
  title = "Handgefertigter Drahtschmuck"
}: StaticProductGridProps) {
  const [displayProducts, setDisplayProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [favoriteProducts, setFavoriteProducts] = useState<number[]>([]);
  const { addToCart } = useCart();
  const { navigateTo } = useRouter();

  useEffect(() => {
    loadProducts();
    // Load favorites from localStorage
    const favorites = JSON.parse(localStorage.getItem('elbfunkeln-favorites') || '[]');
    setFavoriteProducts(favorites);
  }, [categoryId, limit]);

  const loadProducts = () => {
    setLoading(true);
    
    // Simulate loading delay
    setTimeout(() => {
      let filteredProducts = products as Product[];
      
      if (categoryId && categoryId !== 'all') {
        filteredProducts = products.filter(product => product.category === categoryId) as Product[];
      }
      
      if (limit) {
        filteredProducts = filteredProducts.slice(0, limit);
      }
      
      setDisplayProducts(filteredProducts);
      setLoading(false);
    }, 500);
  };

  const handleAddToCart = (product: Product) => {
    const cartItem: CartProduct = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    };
    addToCart(cartItem);
    toast.success(`${product.name} wurde zum Warenkorb hinzugefügt!`);
  };

  const handleViewProduct = (product: Product) => {
    navigateTo('product', { productId: product.id });
  };

  const handleToggleFavorite = (productId: number, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    if (isFavorite(productId)) {
      removeFromFavorites(productId);
      toast.success('Produkt aus Favoriten entfernt!');
    } else {
      addToFavorites(productId);
      toast.success('Produkt zu Favoriten hinzugefügt!');
    }
    // Update local state
    const favorites = JSON.parse(localStorage.getItem('elbfunkeln-favorites') || '[]');
    setFavoriteProducts(favorites);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-lg h-80 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        {title && (
          <div className="text-center mb-12">
            <h2 className="font-cormorant text-4xl md:text-5xl text-elbfunkeln-green mb-4">
              {title}
            </h2>
            <p className="font-inter text-lg text-elbfunkeln-green/70 max-w-2xl mx-auto">
              Entdecke unsere exklusive Sammlung handgefertigter Drahtschmuck-Stücke. 
              Jedes Stück ist ein Unikat, geschaffen mit Liebe zum Detail in Hamburg.
            </p>
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {displayProducts.map((product, index) => (
            <div key={product.id} className="group h-full">
              <Card className="group overflow-hidden border-elbfunkeln-lavender/20 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm h-full">
                <div className="relative overflow-hidden">
                  {/* Product Image */}
                  <div 
                    className="aspect-square bg-gray-100 cursor-pointer"
                    onClick={() => handleViewProduct(product)}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {product.isNew && (
                      <Badge className="bg-elbfunkeln-lavender text-white">
                        Neu
                      </Badge>
                    )}
                    {product.isSale && (
                      <Badge className="bg-elbfunkeln-rose text-white">
                        Sale
                      </Badge>
                    )}
                    {!product.inStock && (
                      <Badge variant="destructive">Ausverkauft</Badge>
                    )}
                    {showCategory && product.category && (
                      <Badge variant="outline" className="bg-white/90">
                        {product.category}
                      </Badge>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="w-10 h-10 p-0 bg-white/90 hover:bg-white"
                      onClick={(e) => handleToggleFavorite(Number(product.id), e)}
                    >
                      <Heart 
                        className={`h-4 w-4 ${isFavorite(Number(product.id)) ? 'fill-elbfunkeln-rose text-elbfunkeln-rose' : 'text-gray-600'}`} 
                      />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="w-10 h-10 p-0 bg-white/90 hover:bg-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewProduct(product);
                      }}
                    >
                      <Eye className="h-4 w-4 text-gray-600" />
                    </Button>
                  </div>

                  {/* Quick Add Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewProduct(product);
                      }}
                      className="bg-elbfunkeln-green hover:bg-elbfunkeln-rose text-white transform scale-90 group-hover:scale-100 hover:scale-105 active:scale-95 transition-all duration-300"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Details anzeigen
                    </Button>
                  </div>
                </div>

                <CardContent className="p-6">
                  {/* Product Info */}
                  <div className="space-y-3">
                    <h3 
                      className="font-inter text-elbfunkeln-green hover:text-elbfunkeln-rose transition-colors cursor-pointer"
                      onClick={() => handleViewProduct(product)}
                    >
                      {product.name}
                    </h3>
                    
                    {product.description && (
                      <p className="font-inter text-sm text-elbfunkeln-green/70 line-clamp-2">
                        {product.description}
                      </p>
                    )}

                    {/* Materials */}
                    {product.materials && (
                      <p className="font-inter text-xs text-elbfunkeln-green/60">
                        {Array.isArray(product.materials) ? product.materials.join(', ') : product.materials}
                      </p>
                    )}

                    {/* Price */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-cormorant text-xl text-elbfunkeln-green">
                          {formatPrice(product.price)}
                        </span>
                        {product.originalPrice && (
                          <span className="text-sm text-gray-500 line-through">
                            {formatPrice(product.originalPrice)}
                          </span>
                        )}
                      </div>

                      {/* Rating (placeholder) */}
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${i < 5 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                        <span className="text-xs text-gray-500 ml-1">(5.0)</span>
                      </div>
                    </div>

                    {/* Dimensions */}
                    {product.dimensions && (
                      <p className="font-inter text-xs text-elbfunkeln-green/50">
                        Größe: {product.dimensions}
                      </p>
                    )}
                  </div>
                </CardContent>
                </Card>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {!loading && displayProducts.length === 0 && (
          <motion.div 
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-6xl mb-4 font-cormorant text-elbfunkeln-green">-</div>
            <h3 className="font-cormorant text-xl text-elbfunkeln-green mb-2">
              Keine Produkte gefunden
            </h3>
            <p className="font-inter text-elbfunkeln-green/70">
              In dieser Kategorie sind derzeit keine Produkte verfügbar.
            </p>
          </motion.div>
        )}

        {/* Load More Button */}
        {displayProducts.length >= limit && (
          <motion.div 
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Button
              variant="outline"
              size="lg"
              className="border-elbfunkeln-lavender text-elbfunkeln-green hover:bg-elbfunkeln-lavender hover:text-white"
              onClick={() => {
                navigateTo('shop');
              }}
            >
              Alle Produkte ansehen
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}