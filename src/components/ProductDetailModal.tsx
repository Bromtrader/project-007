import React, { useState } from 'react';
import {
  X,
  Plus,
  Minus,
  ShoppingBag,
  ShieldCheck,
  Truck,
  Phone,
  Sparkles,
  Share2,
  Check,
  Wine,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatKSh } from '../services/storeService';
import { ProductCard } from './ProductCard';

export const ProductDetailModal: React.FC = () => {
  const {
    selectedProductId,
    setSelectedProductId,
    products,
    addToCart,
    settings,
    showToast,
  } = useStore();

  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'notes' | 'details' | 'delivery'>('notes');
  const [copied, setCopied] = useState(false);

  if (!selectedProductId) return null;

  const product = products.find((p) => p.id === selectedProductId);
  if (!product) return null;

  const relatedProducts = products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 3);

  const handleAddToCart = () => {
    if (product.stock <= 0) return;
    addToCart(product, quantity);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    showToast('Product link copied to clipboard', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const whatsappMessage = encodeURIComponent(
    `Hello UNCLE RATT! I am interested in ordering: ${product.name} (${product.size}) at ${formatKSh(product.price)}. Is it available for delivery in Nairobi?`
  );

  const lowThreshold = product.lowStockThreshold || 5;
  const isLowStock = product.stock > 0 && product.stock <= lowThreshold;
  const isOutOfStock = product.stock <= 0;

  return (
    <div
      id="product-detail-overlay"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md p-4 sm:p-6 lg:p-10 flex items-center justify-center animate-in fade-in duration-200"
    >
      <div
        id="product-detail-modal"
        className="w-full max-w-4xl bg-[#111116] border border-[#262633] rounded-2xl overflow-hidden shadow-2xl relative my-auto"
      >
        {/* Close Button */}
        <button
          onClick={() => setSelectedProductId(null)}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-[#181822] text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#232330] transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 p-6 sm:p-8">
          {/* Left Column: Product Image Showcase */}
          <div className="md:col-span-5 flex flex-col items-center">
            <div className="w-full aspect-[3/4] bg-[#0c0c10] rounded-xl overflow-hidden relative border border-[#1f1f28] flex items-center justify-center p-4">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover object-center"
                referrerPolicy="no-referrer"
              />
              {product.onSale && (
                <span className="absolute top-3 left-3 px-3 py-1 rounded text-xs uppercase font-bold tracking-wider bg-[#b38f28] text-black">
                  Sale Offer
                </span>
              )}
            </div>

            {/* Quick trust metrics */}
            <div className="w-full mt-4 p-3 bg-[#16161f] border border-[#22222e] rounded-xl flex items-center justify-between text-xs text-[#a1a1aa]">
              <div className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>1–2h Nairobi Express</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>100% Genuine</span>
              </div>
            </div>
          </div>

          {/* Right Column: Information, Pricing, Tasting Notes, Actions */}
          <div className="md:col-span-7 flex flex-col justify-between space-y-6">
            <div>
              {/* Category & Origin */}
              <div className="flex items-center justify-between text-xs text-[#a1a1aa] mb-1">
                <span className="uppercase tracking-widest text-[#d4af37] font-semibold text-[11px]">
                  {product.brand}
                </span>
                <span>{product.countryOfOrigin}</span>
              </div>

              {/* Title */}
              <h2 className="text-2xl sm:text-3xl font-serif text-[#fbfbfa] leading-tight mb-2">
                {product.name}
              </h2>

              {/* Size & ABV */}
              <div className="flex items-center gap-3 text-xs text-[#a1a1aa] mb-4">
                <span className="px-2.5 py-1 rounded bg-[#181822] border border-[#272736] font-medium text-[#f4f4f5]">
                  Bottle: {product.size}
                </span>
                {product.abv && (
                  <span className="px-2.5 py-1 rounded bg-[#181822] border border-[#272736] font-medium text-[#f4f4f5]">
                    ABV: {product.abv}
                  </span>
                )}
                <span className="px-2.5 py-1 rounded bg-[#181822] border border-[#272736] font-medium text-[#f4f4f5]">
                  {product.subCategory || product.category}
                </span>
              </div>

              {/* Price & Stock */}
              <div className="flex items-baseline justify-between border-y border-[#1f1f2a] py-3.5 mb-4">
                <div>
                  <span className="text-2xl sm:text-3xl font-serif font-bold text-[#fbfbfa]">
                    {formatKSh(product.price)}
                  </span>
                  {product.compareAtPrice && (
                    <span className="ml-3 text-sm text-[#71717a] line-through">
                      {formatKSh(product.compareAtPrice)}
                    </span>
                  )}
                </div>

                <div>
                  {isOutOfStock ? (
                    <span className="px-3 py-1 rounded bg-rose-950/50 text-rose-300 text-xs font-semibold border border-rose-800/40">
                      Out of Stock
                    </span>
                  ) : isLowStock ? (
                    <span className="px-3 py-1 rounded bg-amber-950/50 text-amber-300 text-xs font-semibold border border-amber-800/40">
                      Low Stock: {product.stock} Left
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded bg-emerald-950/40 text-emerald-300 text-xs font-semibold border border-emerald-800/40">
                      In Stock • Dispatched from Kilimani Vault
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-[#a1a1aa] leading-relaxed mb-6 font-light">
                {product.description}
              </p>

              {/* Tasting Notes / Specs Tabs */}
              <div className="border-b border-[#22222e] flex gap-4 text-xs font-medium mb-4">
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`pb-2 transition ${
                    activeTab === 'notes'
                      ? 'border-b-2 border-[#d4af37] text-[#d4af37] font-semibold'
                      : 'text-[#a1a1aa] hover:text-[#f4f4f5]'
                  }`}
                >
                  Sommelier Tasting Notes
                </button>
                <button
                  onClick={() => setActiveTab('details')}
                  className={`pb-2 transition ${
                    activeTab === 'details'
                      ? 'border-b-2 border-[#d4af37] text-[#d4af37] font-semibold'
                      : 'text-[#a1a1aa] hover:text-[#f4f4f5]'
                  }`}
                >
                  Bottle Specifications
                </button>
                <button
                  onClick={() => setActiveTab('delivery')}
                  className={`pb-2 transition ${
                    activeTab === 'delivery'
                      ? 'border-b-2 border-[#d4af37] text-[#d4af37] font-semibold'
                      : 'text-[#a1a1aa] hover:text-[#f4f4f5]'
                  }`}
                >
                  Nairobi Delivery Info
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'notes' && (
                <div className="bg-[#15151c] border border-[#20202a] rounded-xl p-4 text-xs space-y-2 text-[#d4d4d8]">
                  {product.tastingNotes?.nose && (
                    <p>
                      <span className="font-semibold text-[#d4af37]">Nose: </span>
                      {product.tastingNotes.nose}
                    </p>
                  )}
                  {product.tastingNotes?.palate && (
                    <p>
                      <span className="font-semibold text-[#d4af37]">Palate: </span>
                      {product.tastingNotes.palate}
                    </p>
                  )}
                  {product.tastingNotes?.finish && (
                    <p>
                      <span className="font-semibold text-[#d4af37]">Finish: </span>
                      {product.tastingNotes.finish}
                    </p>
                  )}
                  {product.tastingNotes?.pairings && (
                    <p>
                      <span className="font-semibold text-[#d4af37]">Recommended Pairings: </span>
                      {product.tastingNotes.pairings}
                    </p>
                  )}
                  {!product.tastingNotes && (
                    <p className="text-[#71717a] italic">
                      Crisp, balanced spirit handpicked by UNCLE RATT cellar masters. Best served neat, on rock spheres, or with artisanal mixers.
                    </p>
                  )}
                </div>
              )}

              {activeTab === 'details' && (
                <div className="grid grid-cols-2 gap-3 text-xs bg-[#15151c] border border-[#20202a] rounded-xl p-4 text-[#d4d4d8]">
                  <div>
                    <span className="text-[#71717a] block text-[11px]">Brand / House</span>
                    <span className="font-medium text-[#f4f4f5]">{product.brand}</span>
                  </div>
                  <div>
                    <span className="text-[#71717a] block text-[11px]">Country / Region</span>
                    <span className="font-medium text-[#f4f4f5]">{product.countryOfOrigin}</span>
                  </div>
                  <div>
                    <span className="text-[#71717a] block text-[11px]">Volume</span>
                    <span className="font-medium text-[#f4f4f5]">{product.size}</span>
                  </div>
                  <div>
                    <span className="text-[#71717a] block text-[11px]">Alcohol By Volume</span>
                    <span className="font-medium text-[#f4f4f5]">{product.abv}</span>
                  </div>
                </div>
              )}

              {activeTab === 'delivery' && (
                <div className="bg-[#15151c] border border-[#20202a] rounded-xl p-4 text-xs space-y-2 text-[#a1a1aa]">
                  <p>
                    <strong className="text-[#f4f4f5]">Kilimani & Westlands:</strong> Dispatched in 30–45 mins.
                  </p>
                  <p>
                    <strong className="text-[#f4f4f5]">Greater Nairobi (Karen, Runda, Thika Rd):</strong> 60–90 mins.
                  </p>
                  <p>
                    <strong className="text-[#f4f4f5]">Payment:</strong> Secure M-Pesa on checkout or Cash/Card on Delivery.
                  </p>
                </div>
              )}
            </div>

            {/* Quantity Selector & Purchase Actions */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                {/* Quantity */}
                <div className="flex items-center bg-[#171720] border border-[#2a2a38] rounded-xl px-2 py-1.5">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="p-1.5 text-[#a1a1aa] hover:text-[#f4f4f5] disabled:opacity-40"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center text-sm font-semibold text-[#f4f4f5]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock || isOutOfStock}
                    className="p-1.5 text-[#a1a1aa] hover:text-[#f4f4f5] disabled:opacity-40"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Add to Cart CTA */}
                <button
                  id="modal-add-to-cart-button"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`flex-1 py-3.5 px-6 rounded-xl font-semibold text-sm tracking-wide transition duration-200 flex items-center justify-center gap-2 ${
                    isOutOfStock
                      ? 'bg-[#22222c] text-[#71717a] cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#b38f28] to-[#d4af37] hover:from-[#c29c2d] hover:to-[#e0be48] text-black shadow-lg shadow-[#d4af37]/20'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{isOutOfStock ? 'Out of Stock' : `Add ${quantity} to Cart • ${formatKSh(product.price * quantity)}`}</span>
                </button>
              </div>

              {/* Secondary Actions: WhatsApp & Share */}
              <div className="flex items-center gap-3">
                <a
                  href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#14141b] hover:bg-[#1a1a24] border border-[#272736] text-xs font-medium text-[#d4af37] hover:text-[#f5d77f] flex items-center justify-center gap-2 transition"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Order Directly via WhatsApp</span>
                </a>

                <button
                  onClick={handleShare}
                  className="p-2.5 rounded-xl bg-[#14141b] hover:bg-[#1a1a24] border border-[#272736] text-[#a1a1aa] hover:text-[#f4f4f5] transition"
                  title="Share Bottle"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="border-t border-[#1f1f28] p-6 sm:p-8 bg-[#0d0d12]">
            <h4 className="font-serif text-lg text-[#f4f4f5] mb-4">
              You May Also Enjoy from {product.category}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedProducts.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => {
                    setSelectedProductId(rel.id);
                    setQuantity(1);
                  }}
                  className="p-3 bg-[#131318] border border-[#202029] hover:border-[#d4af37]/50 rounded-xl cursor-pointer flex items-center gap-3 transition"
                >
                  <img
                    src={rel.image}
                    alt={rel.name}
                    className="w-14 h-14 object-cover rounded-lg bg-[#0a0a0e] shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="overflow-hidden">
                    <p className="text-xs font-serif font-medium text-[#f4f4f5] truncate">
                      {rel.name}
                    </p>
                    <p className="text-[11px] text-[#d4af37] font-semibold">
                      {formatKSh(rel.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
