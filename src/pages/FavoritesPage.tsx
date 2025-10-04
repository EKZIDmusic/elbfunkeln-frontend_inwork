import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Heart, Trash2, ShoppingBag, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useRouter } from '../components/Router';
import { useCart } from '../components/CartContext';
import { getWebsiteProducts, type WebsiteProduct } from '../services/productService';

export function FavoritesPage() {
  const [allProducts, setAllProducts] = useState<WebsiteProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { navigateTo } = useRouter();
  const { addToCart, favorites, toggleFavorite, isFavorite } = useCart();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const products = await getWebsiteProducts();
      setAllProducts(products);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter products that are in favorites
  const favoriteProducts = allProducts.filter(product => isFavorite(product.id));

  const handleRemoveFavorite = (productId: string) => {
    toggleFavorite(productId);
  };

  const handleAddToCart = (product: WebsiteProduct) => {
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    };
    addToCart(cartItem);
  };

  const clearAllFavorites = () => {
    favoriteProducts.forEach(product => {
      if (isFavorite(product.id)) {
        toggleFavorite(product.id);
      }
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-elbfunkeln-green"></div>
            <span className="ml-3 text-elbfunkeln-green">Lade Favoriten...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          className="mb-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-block mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-elbfunkeln-lavender to-elbfunkeln-rose rounded-full flex items-center justify-center animate-float-gentle">
              <Heart className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="font-cormorant text-3xl text-elbfunkeln-green mb-2">
            Meine Favoriten
          </h1>
          <p className="font-inter text-elbfunkeln-green/70">
            Deine gesammelten Lieblingsstücke
          </p>
        </motion.div>

        {favoriteProducts.length === 0 ? (
          /* Empty State */
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="w-20 h-20 bg-elbfunkeln-beige/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-elbfunkeln-green/40" />
            </div>
            <h3 className="font-cormorant text-2xl text-elbfunkeln-green mb-4">
              Noch keine Favoriten
            </h3>
            <p className="font-inter text-elbfunkeln-green/70 mb-8 max-w-md mx-auto">
              Entdecke unsere wunderschönen handgemachten Schmuckstücke und sammle deine Lieblingsstücke
            </p>
            <Button
              onClick={() => navigateTo('shop')}
              className="bg-gradient-to-r from-elbfunkeln-lavender to-elbfunkeln-rose text-white hover:from-elbfunkeln-rose hover:to-elbfunkeln-lavender"
            >
              Schmuck entdecken
            </Button>
          </motion.div>
        ) : (
          <>
            {/* Action Bar */}
            <motion.div
              className="mb-8 flex items-center justify-between"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <p className="font-inter text-elbfunkeln-green/70">
                {favoriteProducts.length} {favoriteProducts.length === 1 ? 'Favorit' : 'Favoriten'}
              </p>
              <Button
                onClick={clearAllFavorites}
                variant="outline"
                size="sm"
                className="border-elbfunkeln-rose/30 text-elbfunkeln-rose hover:bg-elbfunkeln-rose/10"
              >
                <Trash2 className="w-4 h-4 mr-2 text-elbfunkeln-rose animate-float-gentle" />
                Alle entfernen
              </Button>
            </motion.div>

            {/* Favorites Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favoriteProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="group relative overflow-hidden border-0 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                    {/* Remove Button */}
                    <Button
                      onClick={() => handleRemoveFavorite(product.id)}
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 z-10 w-8 h-8 p-0 bg-white/80 backdrop-blur-sm hover:bg-elbfunkeln-rose/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4 text-elbfunkeln-rose" />
                    </Button>

                    <div 
                      className="cursor-pointer"
                      onClick={() => navigateTo('product', { productId: product.id })}
                    >
                      {/* Product Image */}
                      <div className="aspect-square overflow-hidden">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </div>
                    
                    {/* Product Info */}
                    <div className="p-4">
                      <div className="mb-2">
                        <Badge variant="outline" className="text-xs text-elbfunkeln-green/70 border-elbfunkeln-green/20">
                          {product.category}
                        </Badge>
                      </div>
                      <h3 
                        className="font-cormorant text-lg text-elbfunkeln-green mb-2 cursor-pointer hover:text-elbfunkeln-rose transition-colors"
                        onClick={() => navigateTo('product', { productId: product.id })}
                      >
                        {product.name}
                      </h3>
                      <p className="font-inter text-sm text-elbfunkeln-green/70 mb-4 line-clamp-2">
                        {product.description}
                      </p>
                      
                      {/* Actions */}
                      <div className="flex items-center justify-between">
                        <span className="font-cormorant text-xl text-elbfunkeln-green">
                          {formatPrice(product.price)}
                        </span>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => navigateTo('product', { productId: product.id })}
                            size="sm"
                            className="bg-elbfunkeln-green text-white hover:bg-elbfunkeln-rose hover:scale-105 active:scale-95 transition-all duration-300"
                          >
                            <ShoppingBag className="w-4 h-4 mr-1" />
                            Details anzeigen
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {/* Back Button */}
        <div className="text-center mt-12">
          <Button
            variant="ghost"
            onClick={() => navigateTo('shop')}
            className="text-elbfunkeln-green hover:text-elbfunkeln-rose"
          >
            ← Zurück zum Shop
          </Button>
        </div>
      </div>
    </div>
  );
}

// Export helper functions for compatibility (but they now use the CartContext)
export const addToFavorites = (productId: number | string) => {
  // This is now handled by CartContext
  console.warn('addToFavorites is deprecated - use toggleFavorite from CartContext');
};

export const removeFromFavorites = (productId: number | string) => {
  // This is now handled by CartContext
  console.warn('removeFromFavorites is deprecated - use toggleFavorite from CartContext');
};

export const isFavorite = (productId: number | string): boolean => {
  // This is now handled by CartContext
  console.warn('isFavorite is deprecated - use isFavorite from CartContext');
  return false;
};