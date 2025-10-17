import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Heart, ShoppingBag, Eye } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useRouter } from './Router';
import { useCart } from './CartContext';
import apiService, { Product } from '../services/apiService';

export function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { navigateTo } = useRouter();
  const { addToCart, toggleFavorite, isFavorite } = useCart();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await apiService.products.getFeatured();
      setProducts(response.data.slice(0, 8)); // Show max 8 featured products
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPrimaryImage = (product: Product): string => {
    if (!product.images || product.images.length === 0) {
      return 'https://via.placeholder.com/400x400?text=Kein+Bild';
    }
    const primaryImage = product.images.find(img => img.isPrimary);
    return primaryImage?.url || product.images[0]?.url || 'https://via.placeholder.com/400x400?text=Kein+Bild';
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
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-elbfunkeln-rose"></div>
          </div>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-cormorant text-elbfunkeln-green mb-4">
            Unsere Highlights
          </h2>
          <p className="text-elbfunkeln-green/80 max-w-2xl mx-auto">
            Entdecke unsere beliebtesten handgefertigten Schmuckstücke
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="overflow-hidden bg-white border-elbfunkeln-green/20 hover:shadow-lg transition-all">
                <div className="relative aspect-square">
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
                <div className="p-4">
                  <p className="text-sm text-elbfunkeln-rose mb-1">{product.category.name}</p>
                  <h3 className="font-cormorant mb-2 text-elbfunkeln-green">{product.name}</h3>
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

        <div className="text-center mt-12">
          <Button
            onClick={() => navigateTo('shop')}
            className="bg-elbfunkeln-green hover:bg-elbfunkeln-rose text-white"
          >
            Alle Produkte ansehen
          </Button>
        </div>
      </div>
    </section>
  );
}
