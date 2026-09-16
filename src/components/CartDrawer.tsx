import React from 'react';
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Truck,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatKSh } from '../services/storeService';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    removeFromCart,
    updateCartQuantity,
    cartSubtotal,
    cartCount,
    settings,
    setIsCheckoutOpen,
    setActiveView,
  } = useStore();

  if (!isCartOpen) return null;

  const freeDeliveryThreshold = settings.freeDeliveryThreshold || 8000;
  const remainingForFreeDelivery = Math.max(0, freeDeliveryThreshold - cartSubtotal);
  const freeDeliveryProgress = Math.min(100, (cartSubtotal / freeDeliveryThreshold) * 100);

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div
      id="cart-drawer-overlay"
      className="fixed inset-0 z-50 overflow-hidden bg-black/75 backdrop-blur-sm transition-opacity"
      onClick={() => setIsCartOpen(false)}
    >
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div
          id="cart-drawer-panel"
          className="w-screen max-w-md bg-[#101015] border-l border-[#22222d] shadow-2xl flex flex-col justify-between"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-[#1f1f28] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-[#d4af37]" />
              <h3 className="font-serif text-xl text-[#f4f4f5]">
                Your Cellar Bag ({cartCount})
              </h3>
            </div>

            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-full text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#181822] transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="bg-[#14141c] px-6 py-3 border-b border-[#1c1c24]">
            {remainingForFreeDelivery > 0 ? (
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-[#d4d4d8]">
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-[#d4af37]" />
                    Add <strong className="text-[#d4af37]">{formatKSh(remainingForFreeDelivery)}</strong> for Free Nairobi Express Delivery
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#20202c] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#b38f28] to-[#d4af37] transition-all duration-300"
                    style={{ width: `${freeDeliveryProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
                <Sparkles className="w-4 h-4 text-[#d4af37]" />
                <span>Congratulations! You qualify for Free Nairobi Express Delivery</span>
              </div>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 divide-y divide-[#1a1a24]">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#181822] border border-[#272736] flex items-center justify-center text-[#71717a]">
                  <ShoppingBag className="w-8 h-8 opacity-40" />
                </div>
                <h4 className="font-serif text-xl text-[#f4f4f5]">Your cart is empty.</h4>
                <p className="text-xs text-[#a1a1aa] max-w-xs leading-relaxed">
                  Discover our curated collection of Single Malts, Cognacs, and fine wines ready for immediate delivery.
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setActiveView('shop');
                  }}
                  className="px-6 py-2.5 rounded-xl bg-[#d4af37] hover:bg-[#e2bd44] text-black font-semibold text-xs transition shadow-md"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              cart.map(({ product, quantity }) => (
                <div key={product.id} className="pt-4 first:pt-0 flex gap-4 items-center">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-16 h-20 object-cover rounded-lg bg-[#0b0b0e] border border-[#202029] shrink-0"
                    referrerPolicy="no-referrer"
                  />

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-serif font-medium text-[#f4f4f5] truncate pr-2">
                        {product.name}
                      </h4>
                      <button
                        onClick={() => removeFromCart(product.id)}
                        className="text-[#71717a] hover:text-rose-400 transition p-1"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-[11px] text-[#a1a1aa]">
                      {product.size} • <span className="text-[#d4af37] font-semibold">{formatKSh(product.price)}</span>
                    </p>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-3 pt-1">
                      <div className="flex items-center bg-[#171720] border border-[#2b2b38] rounded-lg px-1.5 py-0.5">
                        <button
                          onClick={() => updateCartQuantity(product.id, quantity - 1)}
                          className="p-1 text-[#a1a1aa] hover:text-[#f4f4f5]"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center text-xs font-semibold text-[#f4f4f5]">
                          {quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(product.id, quantity + 1)}
                          disabled={quantity >= product.stock}
                          className="p-1 text-[#a1a1aa] hover:text-[#f4f4f5] disabled:opacity-30"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-xs font-medium text-[#f4f4f5] ml-auto">
                        {formatKSh(product.price * quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Subtotal & Checkout CTA */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-[#1f1f28] bg-[#0c0c10] space-y-4">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-[#a1a1aa]">
                  <span>Bottles Subtotal</span>
                  <span className="text-sm font-semibold text-[#f4f4f5] font-serif">
                    {formatKSh(cartSubtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-[#a1a1aa]">
                  <span>Estimated Delivery</span>
                  <span className="text-[#f4f4f5]">
                    {cartSubtotal >= freeDeliveryThreshold ? (
                      <span className="text-emerald-400 font-semibold">FREE</span>
                    ) : (
                      'Calculated at checkout'
                    )}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#1a1a24] flex justify-between items-baseline">
                <span className="font-serif text-sm text-[#a1a1aa]">Estimated Total</span>
                <span className="font-serif text-2xl font-bold text-[#fbfbfa]">
                  {formatKSh(cartSubtotal)}
                </span>
              </div>

              <button
                id="cart-proceed-checkout"
                onClick={handleProceedToCheckout}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#b38f28] to-[#d4af37] hover:from-[#c29c2d] hover:to-[#e0be48] text-black font-semibold text-sm tracking-wide transition duration-200 shadow-xl shadow-[#d4af37]/15 flex items-center justify-center gap-2 group"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-[#71717a]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Discreet Packaging • Temperature Controlled Transport</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
