// src/pages/CartPage.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Trash2, ShoppingBag, Heart, Minus, Plus } from "lucide-react";
import Navigation from "@/components/Navigation";
import EmptyState from "@/components/EmptyState";
import { getProductById } from "@/config/products";
import { formatPrice } from "@/utils/format";
import DeliveryCountdown from "@/components/DeliveryCountdown";
import SignupModal from "@/components/SignupModal";

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, totalItems, addToCart } = useCart();
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const [isSignupOpen, setIsSignupOpen] = useState(false);

  const cartEntries = Object.entries(cartItems);
  const subtotal = cartEntries.reduce((sum, [id, qty]) => {
    const product = getProductById(id);
    return sum + (product?.price || 0) * qty;
  }, 0);
  const shipping = cartEntries.length ? 49 : 0;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="pt-24 sm:pt-32 pb-20 container-custom min-h-[80vh] px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            Your <span className="text-gradient">Cart</span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground">
            {totalItems} {totalItems === 1 ? "item" : "items"} in your bag
          </p>
        </motion.div>

        {cartEntries.length === 0 ? (
          <EmptyState type="cart" />
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence>
                {cartEntries.map(([id, qty]) => {
                  const product = getProductById(id);
                  if (!product) return null;
                  return (
                    <motion.div
                      key={id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="card-glass p-3 sm:p-4 flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center"
                    >
                      <img src={product.image} alt={product.name} className="w-full sm:w-24 h-48 sm:h-32 object-cover rounded-lg" loading="lazy" />
                      <div className="flex-1 w-full">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-base sm:text-lg break-words">{product.name}</h3>
                            <p className="text-sm text-muted-foreground">{product.category}</p>
                          </div>
                          <button
                            onClick={() => removeFromCart(id)}
                            className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0 p-2 touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                            aria-label="Remove from cart"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mt-4 gap-3">
                          <div className="flex items-center gap-3 bg-secondary/50 rounded-full px-4 py-2">
                            <button
                              onClick={() => updateQuantity(id, Math.max(0, qty - 1))}
                              className="w-8 h-8 flex items-center justify-center hover:text-primary touch-manipulation"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="font-semibold w-6 text-center text-base">{qty}</span>
                            <button
                              onClick={() => updateQuantity(id, qty + 1)}
                              className="w-8 h-8 flex items-center justify-center hover:text-primary touch-manipulation"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="font-bold text-lg sm:text-xl">{formatPrice(product.price * qty)}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="card-glass p-6 sticky top-32">
                <h2 className="text-xl font-bold mb-6">Order Summary</h2>
                <div className="mb-4">
                  <DeliveryCountdown />
                </div>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-semibold">{shipping ? formatPrice(shipping) : "Free"}</span>
                  </div>
                  <div className="border-t border-border pt-4 flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(total)}</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsSignupOpen(true)}
                  className="btn-primary w-full py-3 font-bold text-lg shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
                  aria-label="Open signup modal"
                >
                  Checkout Now
                </button>
                <p className="text-xs text-center text-muted-foreground mt-4">Secure checkout powered by Stripe</p>
              </div>
            </div>
          </div>
        )}

        {/* Wishlist Section */}
        {wishlistItems.length > 0 && (
          <div className="mt-16 border-t border-border pt-8">
            <h2 className="text-2xl font-bold mb-6">Your Wishlist</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlistItems.map((itemId) => {
                const product = getProductById(itemId);
                return (
                  <div key={itemId} className="card-glass p-4 flex gap-4 items-center">
                    {product ? (
                      <img src={product.image} alt={product.name} className="w-20 h-24 object-cover rounded-lg" loading="lazy" />
                    ) : (
                      <div className="w-20 h-24 bg-secondary/20 rounded-lg flex items-center justify-center">
                        <Heart className="w-8 h-8 text-muted-foreground/50" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold">{product?.name || "Saved Item"}</h3>
                      <p className="text-sm text-muted-foreground">{product?.category || `ID: ${itemId}`}</p>
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={() => {
                            addToCart(itemId);
                            removeFromWishlist(itemId);
                          }}
                          className="text-xs btn-primary px-2 py-1 flex items-center gap-1"
                        >
                          <ShoppingBag className="w-3 h-3" /> Move to Cart
                        </button>
                        <button onClick={() => removeFromWishlist(itemId)} className="text-xs text-red-500 hover:underline">
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      <Footer />

      {/* Signup modal that opens when checkout is pressed */}
      <SignupModal isOpen={isSignupOpen} onClose={() => setIsSignupOpen(false)} />
    </div>
  );
};

export default CartPage;
