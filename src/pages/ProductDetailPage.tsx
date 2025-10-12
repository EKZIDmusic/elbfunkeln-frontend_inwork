import { useState, useEffect } from 'react';
import { ArrowLeft, Heart, ShoppingBag, Share2, Truck, Shield, RotateCcw, Star, Gift } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ProductImageGallery } from '../components/ProductImageGallery';
import { useRouter } from '../components/Router';
import { useCart } from '../components/CartContext';
import apiService, { Product } from '../services/apiService';
import { toast } from 'sonner';

export function ProductDetailPage() {
  const { productId, navigateTo } = useRouter();
  const { addToCart, toggleFavorite, isFavorite } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [includeGiftBox, setIncludeGiftBox] = useState(false);

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProductData();
  }, [productId]);

  const loadProductData = async () => {
    if (!productId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Load product from API
      const productData = await apiService.products.getById(productId);
      setProduct(productData);

      // Load related products from same category
      if (productData?.categoryId) {
        const relatedResponse = await apiService.products.getAll({
          categoryId: productData.categoryId,
          limit: 4
        });
        const related = relatedResponse.data.filter(p => p.id !== productId);
        setRelatedProducts(related);
      }
    } catch (error) {
      console.error('Error loading product:', error);
      toast.error('Fehler beim Laden des Produkts');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    const primaryImage = product.images.find(img => img.isPrimary);
    const imageUrl = primaryImage?.url || product.images[0]?.url || '';

    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        productId: product.id,
        name: product.name,
        price: product.discountPrice || product.price,
        image: imageUrl,
        quantity: 1
      });
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link kopiert', {
        description: 'Der Produktlink wurde in die Zwischenablage kopiert.'
      });
    } catch (error) {
      toast.error('Fehler beim Kopieren des Links');
    }
  };

  const calculateAverageRating = () => {
    if (!product || product.reviews.length === 0) return 0;
    const sum = product.reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / product.reviews.length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-elbfunkeln-beige py-16">
        <div className="container mx-auto px-4">
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-elbfunkeln-rose"></div>
            <p className="mt-4 text-elbfunkeln-green">Produkt wird geladen...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-elbfunkeln-beige py-16">
        <div className="container mx-auto px-4">
          <div className="text-center py-16">
            <h2 className="font-cormorant mb-4 text-elbfunkeln-green">Produkt nicht gefunden</h2>
            <Button onClick={() => navigateTo('shop')} className="bg-elbfunkeln-green hover:bg-elbfunkeln-rose">
              Zurück zum Shop
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentPrice = product.discountPrice || product.price;
  const averageRating = calculateAverageRating();

  return (
    <div className="min-h-screen bg-elbfunkeln-beige py-16">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigateTo('shop')}
          className="mb-6 text-elbfunkeln-green hover:text-elbfunkeln-rose"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück zum Shop
        </Button>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Images Gallery */}
          <div>
            <ProductImageGallery
              images={product.images.map(img => img.url)}
              productName={product.name}
              isNew={product.isFeatured}
              isSale={!!product.discountPrice}
              inStock={product.stock > 0}
            />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <p className="text-sm text-elbfunkeln-rose mb-2">{product.category.name}</p>
              <h1 className="font-cormorant mb-2 text-elbfunkeln-green">{product.name}</h1>
              
              {/* Rating */}
              {product.reviews.length > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= averageRating
                            ? 'fill-elbfunkeln-rose text-elbfunkeln-rose'
                            : 'text-elbfunkeln-green/30'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-elbfunkeln-green">
                    ({product.reviews.length} {product.reviews.length === 1 ? 'Bewertung' : 'Bewertungen'})
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-elbfunkeln-rose">{currentPrice.toFixed(2)} €</span>
                {product.discountPrice && (
                  <span className="text-elbfunkeln-green/60 line-through">{product.price.toFixed(2)} €</span>
                )}
                {product.discountPrice && (
                  <Badge className="bg-elbfunkeln-rose text-white">
                    -{Math.round((1 - product.discountPrice / product.price) * 100)}%
                  </Badge>
                )}
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {product.isFeatured && (
                  <Badge className="bg-elbfunkeln-green text-white">Featured</Badge>
                )}
                {product.stock > 0 && product.stock <= 5 && (
                  <Badge variant="outline" className="border-elbfunkeln-rose text-elbfunkeln-rose">
                    Nur noch {product.stock} auf Lager
                  </Badge>
                )}
                {product.stock === 0 && (
                  <Badge variant="outline" className="border-elbfunkeln-rose text-elbfunkeln-rose">
                    Ausverkauft
                  </Badge>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <p className="text-elbfunkeln-green">{product.description}</p>
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <label className="text-elbfunkeln-green">Menge</label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="border-elbfunkeln-green"
                >
                  -
                </Button>
                <span className="px-4 py-2 bg-white rounded-md border border-elbfunkeln-green w-16 text-center">
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                  className="border-elbfunkeln-green"
                >
                  +
                </Button>
              </div>
            </div>

            {/* Gift Box Option */}
            {product.giftboxavailable && (
              <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-elbfunkeln-green/20">
                <input
                  type="checkbox"
                  id="giftbox"
                  checked={includeGiftBox}
                  onChange={(e) => setIncludeGiftBox(e.target.checked)}
                  className="w-4 h-4 text-elbfunkeln-rose border-elbfunkeln-green rounded focus:ring-elbfunkeln-rose"
                />
                <label htmlFor="giftbox" className="flex items-center gap-2 text-elbfunkeln-green cursor-pointer">
                  <Gift className="h-5 w-5" />
                  <span>Als Geschenk mit Geschenkbox verpacken (+5,00 €)</span>
                </label>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                className="flex-1 bg-elbfunkeln-green hover:bg-elbfunkeln-rose text-white"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                In den Warenkorb
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => toggleFavorite(product.id)}
                className="border-elbfunkeln-green"
              >
                <Heart
                  className={`h-5 w-5 ${
                    isFavorite(product.id)
                      ? 'fill-elbfunkeln-rose text-elbfunkeln-rose'
                      : 'text-elbfunkeln-green'
                  }`}
                />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleShare}
                className="border-elbfunkeln-green"
              >
                <Share2 className="h-5 w-5 text-elbfunkeln-green" />
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-elbfunkeln-green/20">
              <div className="text-center">
                <Truck className="h-6 w-6 mx-auto mb-2 text-elbfunkeln-green" />
                <p className="text-xs text-elbfunkeln-green">Kostenloser Versand ab 50€</p>
              </div>
              <div className="text-center">
                <Shield className="h-6 w-6 mx-auto mb-2 text-elbfunkeln-green" />
                <p className="text-xs text-elbfunkeln-green">Sichere Zahlung</p>
              </div>
              <div className="text-center">
                <RotateCcw className="h-6 w-6 mx-auto mb-2 text-elbfunkeln-green" />
                <p className="text-xs text-elbfunkeln-green">14 Tage Rückgaberecht</p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info Tabs */}
        <Card className="mb-12 bg-white border-elbfunkeln-green/20">
          <Tabs defaultValue="description" className="p-6">
            <TabsList className="grid w-full grid-cols-2 bg-elbfunkeln-beige">
              <TabsTrigger value="description" className="data-[state=active]:bg-elbfunkeln-green data-[state=active]:text-white">
                Beschreibung
              </TabsTrigger>
              <TabsTrigger value="reviews" className="data-[state=active]:bg-elbfunkeln-green data-[state=active]:text-white">
                Bewertungen ({product.reviews.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-6">
              <div className="prose max-w-none text-elbfunkeln-green">
                <p>{product.description}</p>
                <div className="mt-4">
                  <h3>Produktdetails</h3>
                  <ul>
                    <li>SKU: {product.sku}</li>
                    <li>Kategorie: {product.category.name}</li>
                    <li>Verfügbarkeit: {product.stock > 0 ? `${product.stock} auf Lager` : 'Ausverkauft'}</li>
                  </ul>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              {product.reviews.length === 0 ? (
                <p className="text-center text-elbfunkeln-green py-8">
                  Noch keine Bewertungen vorhanden.
                </p>
              ) : (
                <div className="space-y-4">
                  {product.reviews.map((review) => (
                    <div key={review.id} className="border-b border-elbfunkeln-green/20 pb-4 last:border-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= review.rating
                                  ? 'fill-elbfunkeln-rose text-elbfunkeln-rose'
                                  : 'text-elbfunkeln-green/30'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-elbfunkeln-green/60">
                          {new Date(review.createdAt).toLocaleDateString('de-DE')}
                        </span>
                      </div>
                      <p className="text-elbfunkeln-green">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </Card>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="font-cormorant mb-6 text-center text-elbfunkeln-green">Ähnliche Produkte</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => {
                const primaryImage = relatedProduct.images.find(img => img.isPrimary);
                const imageUrl = primaryImage?.url || relatedProduct.images[0]?.url || '';

                return (
                  <Card
                    key={relatedProduct.id}
                    className="overflow-hidden bg-white border-elbfunkeln-green/20 hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => navigateTo('product', relatedProduct.id)}
                  >
                    <div className="aspect-square relative">
                      <img
                        src={imageUrl}
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover"
                      />
                      {relatedProduct.discountPrice && (
                        <Badge className="absolute top-2 right-2 bg-elbfunkeln-rose text-white">
                          Sale
                        </Badge>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-elbfunkeln-rose mb-1">{relatedProduct.category.name}</p>
                      <h3 className="font-cormorant mb-2 text-elbfunkeln-green">{relatedProduct.name}</h3>
                      <div className="flex items-center gap-2">
                        {relatedProduct.discountPrice ? (
                          <>
                            <span className="text-elbfunkeln-rose">{relatedProduct.discountPrice.toFixed(2)} €</span>
                            <span className="text-sm text-elbfunkeln-green/60 line-through">
                              {relatedProduct.price.toFixed(2)} €
                            </span>
                          </>
                        ) : (
                          <span className="text-elbfunkeln-green">{relatedProduct.price.toFixed(2)} €</span>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
