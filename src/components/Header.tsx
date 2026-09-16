import React, { useState } from 'react';
import {
  ShoppingBag,
  Search,
  User as UserIcon,
  Menu,
  X,
  Phone,
  ShieldCheck,
  Truck,
  Sparkles,
  MapPin,
  Clock,
  Compass,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Category } from '../types';

const POPULAR_CATEGORIES: Category[] = [
  'Whisky',
  'Cognac',
  'Tequila',
  'Wine',
  'Champagne',
  'Gin',
  'Beer',
  'Gift Sets',
];

export const Header: React.FC = () => {
  const {
    cartCount,
    setIsCartOpen,
    currentUser,
    setIsAuthModalOpen,
    activeView,
    setActiveView,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    settings,
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const handleCategoryClick = (cat: Category) => {
    setSelectedCategory(cat);
    setActiveView('shop');
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActiveView('shop');
      setSearchOpen(false);
      setMobileMenuOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#09090b]/95 backdrop-blur-md border-b border-[#1f1f26]">
      {/* Top Banner: Admin CMS controlled announcement notice */}
      <div className="bg-[#111116] border-b border-[#1c1c24] text-[#a1a1aa] text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-3 text-[11px] sm:text-xs">
            <span className="flex items-center gap-1.5 text-[#d4af37]">
              <Truck className="w-3.5 h-3.5 shrink-0" />
              <span className="font-semibold text-[#f4f4f5]">
                {settings.announcementBar || "Express 1–2h Nairobi delivery • Free delivery on orders over KSh 8,000"}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] sm:text-xs">
            <span className="hidden sm:flex items-center gap-1 text-[#71717a]">
              <Clock className="w-3 h-3 text-[#d4af37]" />
              {settings.operatingHours}
            </span>
            <span className="text-[#3f3f46] hidden sm:inline">•</span>
            <a
              href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=Hi%20UNCLE%20RATT,%20I'd%20like%20to%20order`}
              target="_blank"
              rel="noreferrer"
              className="text-[#d4af37] hover:text-[#fae9a8] flex items-center gap-1 font-medium transition"
            >
              <Phone className="w-3 h-3" />
              WhatsApp Concierge
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Mobile Menu Button */}
          <button
            id="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-[#a1a1aa] hover:text-[#f4f4f5] focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Brand Logo & Monogram */}
          <div
            id="brand-logo-link"
            onClick={() => {
              setActiveView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="cursor-pointer flex items-center gap-3.5 group select-none"
          >
            <div className="w-10 h-10 rounded-full border border-[#d4af37]/60 bg-[#16161c] flex items-center justify-center text-[#d4af37] font-serif text-xl tracking-wider shadow-md shadow-[#d4af37]/10 group-hover:border-[#d4af37] transition duration-300">
              UR
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-2xl sm:text-3xl tracking-[0.08em] font-semibold text-[#f5f5f0] group-hover:text-white transition">
                UNCLE RATT
              </span>
              <span className="text-[9px] uppercase tracking-[0.3em] text-[#d4af37] font-medium -mt-1">
                Fine Wines & Spirits • Nairobi
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
            <button
              onClick={() => {
                setActiveView('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`transition hover:text-[#d4af37] py-1 ${
                activeView === 'home' ? 'text-[#d4af37] font-semibold' : 'text-[#d4d4d8]'
              }`}
            >
              Cellar Home
            </button>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setActiveView('shop');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`transition hover:text-[#d4af37] py-1 ${
                activeView === 'shop' && selectedCategory === 'All'
                  ? 'text-[#d4af37] font-semibold'
                  : 'text-[#d4d4d8]'
              }`}
            >
              The Collection
            </button>
            <button
              onClick={() => handleCategoryClick('Whisky')}
              className={`transition hover:text-[#d4af37] py-1 ${
                selectedCategory === 'Whisky' && activeView === 'shop' ? 'text-[#d4af37] font-semibold' : 'text-[#d4d4d8]'
              }`}
            >
              Whisky
            </button>
            <button
              onClick={() => handleCategoryClick('Cognac')}
              className={`transition hover:text-[#d4af37] py-1 ${
                selectedCategory === 'Cognac' && activeView === 'shop' ? 'text-[#d4af37] font-semibold' : 'text-[#d4d4d8]'
              }`}
            >
              Cognac
            </button>
            <button
              onClick={() => handleCategoryClick('Wine')}
              className={`transition hover:text-[#d4af37] py-1 ${
                selectedCategory === 'Wine' && activeView === 'shop' ? 'text-[#d4af37] font-semibold' : 'text-[#d4d4d8]'
              }`}
            >
              Wine
            </button>
            <button
              onClick={() => handleCategoryClick('Champagne')}
              className={`transition hover:text-[#d4af37] py-1 ${
                selectedCategory === 'Champagne' && activeView === 'shop' ? 'text-[#d4af37] font-semibold' : 'text-[#d4d4d8]'
              }`}
            >
              Champagne
            </button>
            <button
              onClick={() => handleCategoryClick('Gift Sets')}
              className={`transition hover:text-[#d4af37] py-1 flex items-center gap-1.5 ${
                selectedCategory === 'Gift Sets' && activeView === 'shop' ? 'text-[#d4af37] font-semibold' : 'text-[#d4d4d8]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
              Gift Sets
            </button>
          </nav>

          {/* Right Action Icons: Search, Account, Cart */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Trigger */}
            <div className="relative">
              {searchOpen ? (
                <form
                  onSubmit={handleSearchSubmit}
                  className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center bg-[#181820] border border-[#d4af37]/50 rounded-full px-3 py-1.5 w-64 sm:w-80 shadow-xl z-50"
                >
                  <Search className="w-4 h-4 text-[#d4af37] shrink-0 mr-2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Scotch, Gin, Cognac..."
                    className="w-full bg-transparent text-xs text-[#f4f4f5] focus:outline-none placeholder:text-[#71717a]"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="text-[#71717a] hover:text-[#f4f4f5] text-xs p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </form>
              ) : (
                <button
                  id="search-toggle-button"
                  onClick={() => setSearchOpen(true)}
                  className="p-2.5 rounded-full text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#181820] transition"
                  aria-label="Search products"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Track Order Shortcut */}
            <button
              id="track-order-button"
              onClick={() => {
                setActiveView('track');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              title="Track Order"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#272732] bg-[#121218] hover:border-[#d4af37]/40 text-xs text-[#d4d4d8] hover:text-[#f4f4f5] transition"
            >
              <Compass className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Track</span>
            </button>

            {/* Account / Login */}
            <button
              id="account-toggle-button"
              onClick={() => {
                if (currentUser) {
                  setActiveView(currentUser.role === 'admin' ? 'admin' : 'account');
                } else {
                  setIsAuthModalOpen(true);
                }
              }}
              className="p-2.5 rounded-full text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#181820] transition relative"
              aria-label="Customer Account"
              title={currentUser ? `${currentUser.fullName} (${currentUser.role})` : 'Sign in to UNCLE RATT'}
            >
              <UserIcon className="w-5 h-5" />
              {currentUser && (
                <span className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-[#d4af37]" />
              )}
            </button>

            {/* Cart Button */}
            <button
              id="cart-drawer-toggle"
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-full text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#181820] transition group"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 group-hover:text-[#d4af37] transition" />
              {cartCount > 0 && (
                <span
                  id="cart-badge-count"
                  className="absolute -top-0.5 -right-0.5 bg-[#d4af37] text-black text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse"
                >
                  {cartCount}
                </span>
              )}
            </button>

            {/* Admin link for store manager */}
            <button
              id="admin-console-link"
              onClick={() => {
                setActiveView('admin');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#d4af37]/30 bg-[#161510] hover:bg-[#201d14] text-xs font-semibold text-[#d4af37] hover:border-[#d4af37] transition ml-1 cursor-pointer"
              title="Open Admin Dashboard & CMS"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Admin Dashboard</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation-drawer"
          className="lg:hidden bg-[#0e0e12] border-b border-[#23232c] px-4 pt-3 pb-6 space-y-4"
        >
          <div className="relative">
            <form onSubmit={handleSearchSubmit} className="flex items-center bg-[#181820] border border-[#2e2e3a] rounded-xl px-3 py-2.5">
              <Search className="w-4 h-4 text-[#d4af37] mr-2 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search whiskies, cognacs, wines..."
                className="w-full bg-transparent text-sm text-[#f4f4f5] focus:outline-none placeholder:text-[#71717a]"
              />
              {searchQuery && (
                <button
                  type="submit"
                  className="px-2 py-1 bg-[#d4af37] text-black rounded text-xs font-semibold"
                >
                  Go
                </button>
              )}
            </form>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={() => {
                setActiveView('home');
                setMobileMenuOpen(false);
              }}
              className={`p-2.5 rounded-lg text-left text-sm font-medium border ${
                activeView === 'home'
                  ? 'bg-[#1e1e28] border-[#d4af37]/40 text-[#d4af37]'
                  : 'bg-[#14141a] border-[#22222b] text-[#d4d4d8]'
              }`}
            >
              Cellar Home
            </button>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setActiveView('shop');
                setMobileMenuOpen(false);
              }}
              className={`p-2.5 rounded-lg text-left text-sm font-medium border ${
                activeView === 'shop' && selectedCategory === 'All'
                  ? 'bg-[#1e1e28] border-[#d4af37]/40 text-[#d4af37]'
                  : 'bg-[#14141a] border-[#22222b] text-[#d4d4d8]'
              }`}
            >
              All Bottles
            </button>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-widest text-[#71717a] font-semibold mb-2">
              Browse Categories
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {POPULAR_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryClick(cat)}
                  className={`p-2 rounded-lg text-left text-xs border transition ${
                    selectedCategory === cat && activeView === 'shop'
                      ? 'bg-[#d4af37]/10 border-[#d4af37] text-[#d4af37] font-semibold'
                      : 'bg-[#14141a] border-[#202029] text-[#a1a1aa] hover:text-[#f4f4f5]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-[#1f1f28] flex flex-col gap-2 text-sm">
            <button
              onClick={() => {
                setActiveView('track');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 text-[#d4d4d8] py-1.5"
            >
              <Compass className="w-4 h-4 text-[#d4af37]" />
              Track Existing Order
            </button>
            <button
              onClick={() => {
                setActiveView('admin');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 text-[#71717a] hover:text-[#d4af37] py-1.5 text-xs"
            >
              Cellar Management & Admin Portal
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
