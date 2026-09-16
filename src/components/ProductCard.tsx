import React from 'react';
import { ShoppingBag, Star, Plus, Check } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { formatKSh } from '../services/storeService';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, setSelectedProductId } = useStore();
  const [added, setAdded] = React.useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stock <= 0) return;
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const lowThreshold = product.lowStockThreshold || 5;
  const isLowStock = product.stock > 0 && product.stock <= lowThreshold;
  const isOutOfStock = product.stock <= 0;

  return (
    <div
      id={`product-card-${product.id}`}
      onClick={() => setSelectedProductId(product.id)}
      className="group relative bg-[#111116] border border-[#202028] hover:border-[#d4af37]/60 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-[#d4af37]/5 flex flex-col cursor-pointer"
    >
      {/* Badges container */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
        {product.onSale && (
          <span className="px-2.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-[#b38f28] text-black">
            Sale
          </span>
        )}
        {product.bestSeller && (
          <span className="px-2.5 py-0.5 rounded text-[10px] uppercase font-semibold tracking-wider bg-[#1d1d26] border border-[#3b3b4d] text-[#e4e4e7]">
            Best Seller
          </span>
        )}
      </div>

      {/* Bottle Image Container */}
      <div className="relative aspect-[3/4] bg-[#0c0c10] overflow-hidden flex items-center justify-center p-4">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111116] via-transparent to-transparent opacity-60" />

        {/* Quick Add Overlay for Desktop */}
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`absolute bottom-3 right-3 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 p-2.5 rounded-xl shadow-lg flex items-center justify-center ${
            isOutOfStock
              ? 'bg-[#1f1f28] text-[#71717a] cursor-not-allowed'
              : added
              ? 'bg-emerald-500 text-black'
              : 'bg-[#d4af37] hover:bg-[#e4c04a] text-black'
          }`}
          title={isOutOfStock ? 'Out of Stock' : 'Quick Add to Cart'}
        >
          {added ? (
            <Check className="w-4 h-4" />
          ) : (
            <Plus className="w-4 h-4 stroke-[2.5]" />
          )}
        </button>
      </div>

      {/* Product Content */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div className="space-y-1.5">
          {/* Brand & Size */}
          <div className="flex items-center justify-between text-xs">
            <span className="uppercase tracking-wider text-[#d4af37] font-semibold text-[11px]">
              {product.brand}
            </span>
            <span className="text-[#a1a1aa] text-[11px]">
              {product.size} {product.abv ? `• ${product.abv}` : ''}
            </span>
          </div>

          {/* Product Name */}
          <h3 className="font-serif text-base font-medium text-[#f4f4f5] group-hover:text-[#d4af37] transition line-clamp-2 leading-snug">
            {product.name}
          </h3>

          {/* Category & Origin */}
          <p className="text-[11px] text-[#71717a]">
            {product.subCategory || product.category} • {product.countryOfOrigin}
          </p>
        </div>

        {/* Price & Stock status */}
        <div className="pt-2 border-t border-[#1c1c24] flex items-end justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-lg font-bold text-[#fbfbfa]">
                {formatKSh(product.price)}
              </span>
              {product.compareAtPrice && (
                <span className="text-xs text-[#71717a] line-through">
                  {formatKSh(product.compareAtPrice)}
                </span>
              )}
            </div>

            {/* Stock indicator */}
            <div className="mt-0.5">
              {isOutOfStock ? (
                <span className="text-[11px] font-medium text-rose-400">
                  Out of Stock
                </span>
              ) : isLowStock ? (
                <span className="text-[11px] font-medium text-amber-400">
                  Only {product.stock} left in cellar
                </span>
              ) : (
                <span className="text-[11px] text-emerald-400/90 font-medium">
                  In Stock • Ready
                </span>
              )}
            </div>
          </div>

          {/* Mobile visible Add to Cart button */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`sm:hidden p-2 rounded-lg text-xs font-semibold flex items-center justify-center ${
              isOutOfStock
                ? 'bg-[#1b1b22] text-[#52525b]'
                : added
                ? 'bg-emerald-500 text-black'
                : 'bg-[#d4af37] text-black'
            }`}
          >
            {added ? <Check className="w-3.5 h-3.5" /> : <ShoppingBag className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
