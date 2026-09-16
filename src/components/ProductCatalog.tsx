import React, { useState, useMemo } from 'react';
import {
  SlidersHorizontal,
  X,
  Search,
  Sparkles,
  ArrowUpDown,
  Tag,
  CheckCircle2,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Category, Product } from '../types';
import { ProductCard } from './ProductCard';
import { formatKSh } from '../services/storeService';

const ALL_CATEGORIES: Category[] = [
  'All',
  'Whisky',
  'Cognac',
  'Tequila',
  'Gin',
  'Vodka',
  'Wine',
  'Champagne',
  'Rum',
  'Brandy',
  'Beer',
  'Liqueurs',
  'Mixers',
  'Gift Sets',
];

export const ProductCatalog: React.FC = () => {
  const {
    products,
    loadingProducts,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
  } = useStore();

  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'name-asc' | 'rating'>('featured');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [saleOnly, setSaleOnly] = useState(false);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number>(50000);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Category filter
    if (selectedCategory !== 'All') {
      list = list.filter((p) => p.category === selectedCategory);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.subCategory && p.subCategory.toLowerCase().includes(q)) ||
          p.description.toLowerCase().includes(q) ||
          (p.countryOfOrigin && p.countryOfOrigin.toLowerCase().includes(q))
      );
    }

    // In-Stock only
    if (inStockOnly) {
      list = list.filter((p) => p.stock > 0);
    }

    // Sale only
    if (saleOnly) {
      list = list.filter((p) => p.onSale);
    }

    // Featured only
    if (featuredOnly) {
      list = list.filter((p) => p.featured);
    }

    // Max price
    if (maxPrice < 50000) {
      list = list.filter((p) => p.price <= maxPrice);
    }

    // Sort
    list.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'rating':
          return b.rating - a.rating;
        case 'featured':
        default:
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      }
    });

    return list;
  }, [products, selectedCategory, searchQuery, inStockOnly, saleOnly, featuredOnly, maxPrice, sortBy]);

  const resetFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    setInStockOnly(false);
    setSaleOnly(false);
    setFeaturedOnly(false);
    setMaxPrice(50000);
    setSortBy('featured');
  };

  const hasActiveFilters =
    selectedCategory !== 'All' ||
    searchQuery.trim() !== '' ||
    inStockOnly ||
    saleOnly ||
    featuredOnly ||
    maxPrice < 50000;

  return (
    <div id="product-catalog-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Catalog Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 border-b border-[#1f1f28]">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#d4af37] font-semibold mb-1">
            <span>Cellar Inventory</span>
            <span>•</span>
            <span>{filteredProducts.length} Bottles Available</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif text-[#fbfbfa]">
            {selectedCategory === 'All' ? 'Complete Collection' : selectedCategory}
          </h1>
          {searchQuery && (
            <p className="text-sm text-[#a1a1aa] mt-1">
              Search results for: <span className="text-[#f4f4f5] font-semibold">"{searchQuery}"</span>
            </p>
          )}
        </div>

        {/* Controls: Sort and Filter Toggle */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="appearance-none bg-[#14141a] border border-[#272733] text-[#d4d4d8] text-xs font-medium rounded-xl py-2.5 pl-3.5 pr-8 focus:outline-none focus:border-[#d4af37] cursor-pointer"
            >
              <option value="featured">Sort: Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="name-asc">Alphabetical (A–Z)</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-[#71717a] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-medium transition ${
              hasActiveFilters
                ? 'bg-[#d4af37]/10 border-[#d4af37] text-[#d4af37]'
                : 'bg-[#14141a] border-[#272733] text-[#d4d4d8]'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-[#d4af37]" />
            )}
          </button>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="py-5 overflow-x-auto no-scrollbar flex items-center gap-2 border-b border-[#1a1a22]">
        {ALL_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs whitespace-nowrap transition font-medium select-none ${
                isSelected
                  ? 'bg-gradient-to-r from-[#b38f28] to-[#d4af37] text-black font-semibold shadow-md shadow-[#d4af37]/10'
                  : 'bg-[#131318] text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#1a1a22] border border-[#202029]'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Filter Drawer / Dropdown Panel */}
      {mobileFilterOpen && (
        <div className="my-6 p-6 rounded-2xl bg-[#121217] border border-[#262633] space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#f4f4f5] uppercase tracking-wider">
              Filter Bottles
            </h3>
            <button
              onClick={resetFilters}
              className="text-xs text-[#d4af37] hover:underline"
            >
              Reset All Filters
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Price Filter */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-[#a1a1aa]">
                <span>Maximum Price:</span>
                <span className="font-semibold text-[#f4f4f5]">{formatKSh(maxPrice)}</span>
              </div>
              <input
                type="range"
                min={1000}
                max={50000}
                step={500}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#d4af37] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#71717a]">
                <span>KSh 1,000</span>
                <span>KSh 50,000+</span>
              </div>
            </div>

            {/* Quick toggles */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs text-[#d4d4d8] cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded border-[#3f3f46] accent-[#d4af37]"
                />
                <span>In Stock Only</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-[#d4d4d8] cursor-pointer">
                <input
                  type="checkbox"
                  checked={saleOnly}
                  onChange={(e) => setSaleOnly(e.target.checked)}
                  className="rounded border-[#3f3f46] accent-[#d4af37]"
                />
                <span>Special Offers & Sale Items</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-[#d4d4d8] cursor-pointer">
                <input
                  type="checkbox"
                  checked={featuredOnly}
                  onChange={(e) => setFeaturedOnly(e.target.checked)}
                  className="rounded border-[#3f3f46] accent-[#d4af37]"
                />
                <span>Cellar Master Recommended</span>
              </label>
            </div>

            {/* Active Badges */}
            <div className="text-xs text-[#a1a1aa] space-y-2">
              <p className="font-medium text-[#f4f4f5]">Current Selection:</p>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2 py-1 bg-[#1a1a24] rounded text-[11px] border border-[#2b2b3b]">
                  {selectedCategory}
                </span>
                {inStockOnly && (
                  <span className="px-2 py-1 bg-[#1a1a24] rounded text-[11px] border border-[#2b2b3b]">
                    In Stock
                  </span>
                )}
                {saleOnly && (
                  <span className="px-2 py-1 bg-[#1a1a24] rounded text-[11px] border border-[#2b2b3b]">
                    On Sale
                  </span>
                )}
                {maxPrice < 50000 && (
                  <span className="px-2 py-1 bg-[#1a1a24] rounded text-[11px] border border-[#2b2b3b]">
                    Under {formatKSh(maxPrice)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      {loadingProducts ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 pt-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="bg-[#111116] rounded-xl border border-[#1f1f28] p-4 h-80 animate-pulse flex flex-col justify-between"
            >
              <div className="bg-[#1a1a24] h-48 rounded-lg mb-4" />
              <div className="space-y-2">
                <div className="bg-[#1a1a24] h-4 w-3/4 rounded" />
                <div className="bg-[#1a1a24] h-3 w-1/2 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        /* Empty State */
        <div className="py-20 text-center max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#16161d] border border-[#262633] flex items-center justify-center mx-auto text-[#d4af37]">
            <Search className="w-8 h-8 opacity-60" />
          </div>
          <h3 className="font-serif text-2xl text-[#f4f4f5]">No bottles found</h3>
          <p className="text-sm text-[#a1a1aa] leading-relaxed">
            We couldn't find any products matching your selected criteria. Try loosening your search filters or browse other categories.
          </p>
          <button
            onClick={resetFilters}
            className="px-6 py-2.5 rounded-xl bg-[#d4af37] text-black font-semibold text-xs transition hover:bg-[#e4c04a]"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 pt-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
