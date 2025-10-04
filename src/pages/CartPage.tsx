import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag, Lock, Shield, Truck, RotateCcw } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useRouter } from '../components/Router';
import { useCart } from '../components/CartContext';
import { useAuth } from '../components/AuthContext';
import { LoginGuestDialog } from '../components/LoginGuestDialog';

export function CartPage() {
  const { navigateTo } = useRouter();
  const { items, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCart();
  const { isLoggedIn } = useAuth();
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const shipping = 0; // Free shipping
  const tax = getTotalPrice() * 0.19; // 19% VAT
  const total = getTotalPrice() + shipping + tax;

  const handleCheckoutClick = () => {
    if (isLoggedIn()) {
      // User is logged in, go directly to checkout
      navigateTo('checkout');
    } else {
      // User is not logged in, show login/guest dialog
      setShowLoginDialog(true);
    }
  };

  const handleLoginSuccess = () => {
    setShowLoginDialog(false);
    navigateTo('checkout');
  };

  const handleGuestCheckout = () => {
    setShowLoginDialog(false);
    navigateTo('checkout');
  };

  return (
    <div className="min-h-screen bg-elbfunkeln-beige">
      <div className="container mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Button
            variant="ghost"
            onClick={() => navigateTo('shop')}
            className="text-elbfunkeln-green hover:text-elbfunkeln-green/70 mb-6 p-0"
          >
            <ArrowLeft size={16} className="mr-2" />
            Weiter einkaufen
          </Button>
          
          <div className="flex items-center gap-3 mb-3">
            <h1 className="font-cormorant text-4xl text-elbfunkeln-green">
              Warenkorb
            </h1>
            <ShoppingBag className="h-8 w-8 text-elbfunkeln-green animate-float-gentle" />
          </div>
          {items.length > 0 && (
            <p className="text-elbfunkeln-green/70">
              {items.length} {items.length === 1 ? 'Artikel' : 'Artikel'} in deinem Warenkorb
            </p>
          )}
        </motion.div>

        {items.length === 0 ? (
          // Empty Cart
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-elbfunkeln-green/10 rounded-full flex items-center justify-center">
              <ShoppingBag className="h-12 w-12 text-elbfunkeln-green/50" />
            </div>
            <h2 className="font-cormorant text-2xl text-elbfunkeln-green mb-4">
              Dein Warenkorb ist leer
            </h2>
            <p className="text-elbfunkeln-green/70 mb-8 max-w-md mx-auto">
              Entdecke unsere wunderschönen handgefertigten Schmuckstücke 
              und füge deine Favoriten hinzu!
            </p>
            <Button 
              onClick={() => navigateTo('shop')}
              className="bg-elbfunkeln-green hover:bg-elbfunkeln-green/90 text-white px-8 py-3"
            >
              Jetzt stöbern
            </Button>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <motion.div
              className="lg:col-span-2 space-y-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="bg-white border-elbfunkeln-rose/20 rounded-2xl overflow-hidden">
                    <div className="p-6 flex gap-4">
                      {/* Product Image */}
                      <div 
                        className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 cursor-pointer"
                        onClick={() => navigateTo('product', { productId: item.id })}
                      >
                        <ImageWithFallback
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 
                              className="font-cormorant text-lg text-elbfunkeln-green cursor-pointer hover:text-elbfunkeln-rose transition-colors"
                              onClick={() => navigateTo('product', { productId: item.id })}
                            >
                              {item.name}
                            </h3>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.id)}
                            className="text-elbfunkeln-green/40 hover:text-elbfunkeln-rose p-1 h-auto"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>

                        <div className="flex justify-between items-center mt-auto">
                          {/* Quantity Controls */}
                          <div className="flex items-center border border-elbfunkeln-green/20 rounded-lg">
                            <button
                              className="px-3 py-2 text-elbfunkeln-green hover:bg-elbfunkeln-green/10 transition-colors disabled:opacity-50"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus size={14} />
                            </button>
                            <span className="px-4 py-2 text-elbfunkeln-green min-w-[3rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              className="px-3 py-2 text-elbfunkeln-green hover:bg-elbfunkeln-green/10 transition-colors"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <div className="text-lg text-elbfunkeln-green">
                              €{(item.price * item.quantity).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}

              {/* Clear Cart */}
              <motion.div
                className="pt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  variant="ghost"
                  onClick={clearCart}
                  className="text-elbfunkeln-green/60 hover:text-elbfunkeln-rose p-0"
                >
                  <Trash2 size={16} className="mr-2" />
                  Warenkorb leeren
                </Button>
              </motion.div>
            </motion.div>

            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="bg-white border-elbfunkeln-lavender/20 rounded-2xl p-6 sticky top-28">
                <div className="flex items-center gap-2 mb-6">
                  <h2 className="font-cormorant text-xl text-elbfunkeln-green">
                    Bestellübersicht
                  </h2>
                  <ShoppingBag className="h-5 w-5 text-elbfunkeln-green/50" />
                </div>

                <div className="space-y-4">
                  {/* Subtotal */}
                  <div className="flex justify-between">
                    <span className="text-elbfunkeln-green/70">Zwischensumme:</span>
                    <span className="text-elbfunkeln-green">€{getTotalPrice().toFixed(2)}</span>
                  </div>

                  {/* Shipping */}
                  <div className="flex justify-between">
                    <span className="text-elbfunkeln-green/70">Versand:</span>
                    {shipping === 0 ? (
                      <span className="text-green-600">Kostenlos</span>
                    ) : (
                      <span className="text-elbfunkeln-green">€{shipping.toFixed(2)}</span>
                    )}
                  </div>

                  {/* Tax */}
                  <div className="flex justify-between">
                    <span className="text-elbfunkeln-green/70">MwSt. (19%):</span>
                    <span className="text-elbfunkeln-green">€{tax.toFixed(2)}</span>
                  </div>

                  <Separator className="bg-elbfunkeln-green/10" />

                  {/* Total */}
                  <div className="flex justify-between font-cormorant text-xl">
                    <span className="text-elbfunkeln-green">Gesamt:</span>
                    <span className="text-elbfunkeln-green">€{total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <motion.div
                  className="mt-8"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    className="w-full bg-elbfunkeln-green hover:bg-elbfunkeln-green/90 text-white py-3 h-12"
                    onClick={handleCheckoutClick}
                  >
                    <Lock size={16} className="mr-2" />
                    Zur Kasse gehen
                  </Button>
                </motion.div>

                {/* Security Features */}
                <div className="mt-8 space-y-3">
                  {[
                    { icon: Shield, text: 'Sichere Zahlung', color: 'text-elbfunkeln-green' },
                    { icon: Truck, text: 'Kostenloser Versand', color: 'text-elbfunkeln-lavender' },
                    { icon: RotateCcw, text: '30 Tage Rückgaberecht', color: 'text-elbfunkeln-rose' }
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <feature.icon className={`h-4 w-4 ${feature.color} animate-float-gentle`} style={{ animationDelay: `${index * 0.2}s` }} />
                      <span className="text-sm text-elbfunkeln-green/70">
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>
        )}

        {/* Login/Guest Dialog */}
        <LoginGuestDialog
          isOpen={showLoginDialog}
          onClose={() => setShowLoginDialog(false)}
          onLoginSuccess={handleLoginSuccess}
          onGuestCheckout={handleGuestCheckout}
        />
      </div>
    </div>
  );
}