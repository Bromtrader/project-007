import React from 'react';
import {
  Wine,
  Sparkles,
  ShieldCheck,
  Truck,
  Clock,
  Award,
  ArrowRight,
  Star,
  Quote,
  Flame,
  CheckCircle2,
  Phone,
  MapPin,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from './ProductCard';
import { CUSTOMER_REVIEWS, Review } from '../data/testimonials';
import { DELIVERY_ZONES } from '../data/initialProducts';
import { Category } from '../types';
import { formatKSh } from '../services/storeService';

const CATEGORY_SHOWCASES: {
  title: Category;
  subtitle: string;
  image: string;
}[] = [
  {
    title: 'Whisky',
    subtitle: 'Single Malts & Blends',
    image: 'https://images.unsplash.com/photo-1527061011665-3652c757a4d4?q=80&w=800&auto=format&fit=crop',
  },
  {
    title: 'Cognac',
    subtitle: 'Fine French Eaux-de-Vie',
    image: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?q=80&w=800&auto=format&fit=crop',
  },
  {
    title: 'Tequila',
    subtitle: '100% Blue Agave',
    image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=800&auto=format&fit=crop',
  },
  {
    title: 'Wine',
    subtitle: 'Old & New World Vintage',
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=800&auto=format&fit=crop',
  },
  {
    title: 'Gin',
    subtitle: 'Artisanal Botanicals',
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=800&auto=format&fit=crop',
  },
  {
    title: 'Champagne',
    subtitle: 'Grand Cru Celebrations',
    image: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=800&auto=format&fit=crop',
  },
];

export const HomeSections: React.FC = () => {
  const { products, categories, setSelectedCategory, setActiveView, settings } = useStore();

  const activeCategories = categories.filter((c) => c.active !== false);
  const featuredBottles = products.filter((p) => p.featured && p.active !== false).slice(0, 8);
  const bestSellers = products.filter((p) => p.bestSeller && p.active !== false).slice(0, 8);
  const specialOffers = products.filter((p) => p.onSale && p.active !== false).slice(0, 8);

  const navigateToCategory = (catName: string) => {
    setSelectedCategory(catName as Category);
    setActiveView('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-20 sm:space-y-28 py-14">
      {/* 1. CURATED CATEGORIES SHOWCASE */}
      <section id="categories-showcase" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#d4af37] font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Explore by Discipline</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif text-[#fbfbfa]">
              Featured Spirits & Cellar Categories
            </h2>
          </div>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setActiveView('shop');
            }}
            className="text-xs font-semibold text-[#d4af37] hover:underline inline-flex items-center gap-1 self-start md:self-auto"
          >
            <span>View All Categories ({activeCategories.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {(activeCategories.length > 0 ? activeCategories.slice(0, 6) : CATEGORY_SHOWCASES).map((cat: any) => (
            <div
              key={cat.id || cat.title || cat.name}
              onClick={() => navigateToCategory(cat.name || cat.title)}
              className="group relative h-48 sm:h-56 rounded-2xl overflow-hidden cursor-pointer border border-[#20202a] hover:border-[#d4af37]/60 transition-all duration-300 shadow-lg"
            >
              <img
                src={cat.imageUrl || cat.image || 'https://images.unsplash.com/photo-1527061011665-3652c757a4d4?q=80&w=800&auto=format&fit=crop'}
                alt={cat.name || cat.title}
                className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 opacity-70 group-hover:opacity-90"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#09090c] via-[#09090c]/40 to-transparent" />

              <div className="absolute bottom-3 left-3 right-3">
                <p className="text-[10px] uppercase font-semibold text-[#d4af37] tracking-wider">
                  {cat.subtitle || 'Browse Category'}
                </p>
                <h3 className="font-serif text-lg font-medium text-[#fbfbfa] group-hover:text-[#d4af37] transition">
                  {cat.name || cat.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. CELLAR MASTER'S FEATURED RESERVE */}
      {featuredBottles.length > 0 && (
        <section id="featured-reserve" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#d4af37] font-semibold mb-1">
                <Award className="w-3.5 h-3.5" />
                <span>Handpicked Selection</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-serif text-[#fbfbfa]">
                Cellar Master's Reserve
              </h2>
            </div>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setActiveView('shop');
              }}
              className="text-xs font-semibold text-[#d4af37] hover:underline inline-flex items-center gap-1"
            >
              <span>Explore All Bottles</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {featuredBottles.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* 3. PROMO BANNER / NAIROBI CELLAR ASSURANCE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#17140e] via-[#101015] to-[#121218] border border-[#2b2518] p-8 sm:p-12 lg:p-16">
          <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-[#d4af37]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-2xl space-y-5 relative z-10">
            <span className="px-3 py-1 rounded-full bg-[#2a2212] border border-[#d4af37]/40 text-[#d4af37] text-xs font-semibold uppercase tracking-wider">
              Nairobi’s Trusted Liquor Haven
            </span>

            <h2 className="text-3xl sm:text-5xl font-serif text-[#fbfbfa] leading-tight">
              Genuine bottles only.{' '}
              <span className="italic gold-gradient-text">Zero compromises.</span>
            </h2>

            <p className="text-sm sm:text-base text-[#a1a1aa] leading-relaxed font-light">
              Every single bottle at UNCLE RATT comes directly from authorized brand importers with verified KRA digital stamps. Stored under strict climate-controlled conditions to protect delicate oak tannins and aromatics.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => {
                  setSelectedCategory('Whisky');
                  setActiveView('shop');
                }}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#b38f28] to-[#d4af37] text-black font-semibold text-xs tracking-wide shadow-lg shadow-[#d4af37]/20 hover:from-[#c29c2d] hover:to-[#e0be48] transition"
              >
                Explore Single Malts
              </button>

              <a
                href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=Hi%20UNCLE%20RATT,%20I%20need%20sommelier%20recommendations`}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3.5 rounded-xl bg-[#171720] border border-[#2c2c3d] text-[#f4f4f5] hover:bg-[#20202c] text-xs font-medium transition flex items-center gap-2"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Talk to our Sommelier</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 4. BEST SELLERS & POPULAR POURS */}
      {bestSellers.length > 0 && (
        <section id="best-sellers" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#d4af37] font-semibold mb-1">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>Nairobi’s Favorites</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-serif text-[#fbfbfa]">
                Most Requested Bottles
              </h2>
            </div>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setActiveView('shop');
              }}
              className="text-xs font-semibold text-[#d4af37] hover:underline inline-flex items-center gap-1"
            >
              <span>View Full Selection</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* 5. SPECIAL OFFERS & DISCOUNTS */}
      {specialOffers.length > 0 && (
        <section id="special-offers" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-emerald-400 font-semibold mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Limited Time Cellar Reductions</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-serif text-[#fbfbfa]">
                Special Pricing & Offers
              </h2>
            </div>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setActiveView('shop');
              }}
              className="text-xs font-semibold text-[#d4af37] hover:underline inline-flex items-center gap-1"
            >
              <span>All Deals</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {specialOffers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* 6. WHY CHOOSE UNCLE RATT */}
      <section id="why-choose-us" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 max-w-2xl mx-auto mb-12">
          <p className="text-xs uppercase tracking-[0.2em] text-[#d4af37] font-semibold">
            The UNCLE RATT Standard
          </p>
          <h2 className="text-3xl sm:text-4xl font-serif text-[#fbfbfa]">
            Why Discerning Nairobi Drinkers Choose Us
          </h2>
          <p className="text-sm text-[#a1a1aa] leading-relaxed">
            Elevating the liquor shopping experience in Kenya through authenticity, speed, and discretion.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-[#121217] border border-[#22222d] space-y-3 hover:border-[#d4af37]/40 transition">
            <div className="w-12 h-12 rounded-xl bg-[#1a1710] border border-[#3b3218] flex items-center justify-center text-[#d4af37]">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg text-[#fbfbfa]">1–2h Express Delivery</h3>
            <p className="text-xs text-[#a1a1aa] leading-relaxed">
              Dispatched with dedicated temperature-insulated courier bags straight from our Kilimani vault to your doorstep.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#121217] border border-[#22222d] space-y-3 hover:border-[#d4af37]/40 transition">
            <div className="w-12 h-12 rounded-xl bg-[#1a1710] border border-[#3b3218] flex items-center justify-center text-[#d4af37]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg text-[#fbfbfa]">100% Genuine Spirits</h3>
            <p className="text-xs text-[#a1a1aa] leading-relaxed">
              Every bottle is sourced directly from brand principals and certified Kenyan distributors with legitimate KRA QR stamps.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#121217] border border-[#22222d] space-y-3 hover:border-[#d4af37]/40 transition">
            <div className="w-12 h-12 rounded-xl bg-[#1a1710] border border-[#3b3218] flex items-center justify-center text-[#d4af37]">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg text-[#fbfbfa]">Late Night Dispatches</h3>
            <p className="text-xs text-[#a1a1aa] leading-relaxed">
              Operating until 1:00 AM on weekdays and 3:00 AM on weekends to keep your dinner parties and private celebrations flowing.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#121217] border border-[#22222d] space-y-3 hover:border-[#d4af37]/40 transition">
            <div className="w-12 h-12 rounded-xl bg-[#1a1710] border border-[#3b3218] flex items-center justify-center text-[#d4af37]">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg text-[#fbfbfa]">Discreet Packaging</h3>
            <p className="text-xs text-[#a1a1aa] leading-relaxed">
              Delivered in minimalist, unmarked luxury gift boxes or private carriers respecting your confidentiality.
            </p>
          </div>
        </div>
      </section>

      {/* 7. DELIVERY ZONES INFORMATION */}
      <section id="delivery-information" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#111116] border border-[#22222d] rounded-3xl p-8 sm:p-12">
          <div className="max-w-2xl mb-8 space-y-2">
            <span className="text-xs uppercase tracking-[0.2em] text-[#d4af37] font-semibold">
              Nairobi & Countrywide Dispatch
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif text-[#fbfbfa]">
              Fast, Reliable Delivery Network
            </h2>
            <p className="text-xs sm:text-sm text-[#a1a1aa]">
              Free delivery on all Nairobi orders above {formatKSh(settings.freeDeliveryThreshold)}.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {DELIVERY_ZONES.map((zone) => (
              <div
                key={zone.id}
                className="p-4 rounded-xl bg-[#16161f] border border-[#232330] space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-serif font-medium text-sm text-[#f4f4f5]">
                    {zone.name}
                  </span>
                  <span className="text-xs font-semibold text-[#d4af37]">
                    KSh {zone.fee}
                  </span>
                </div>
                <p className="text-[11px] text-[#71717a]">
                  Est: <strong className="text-[#d4d4d8]">{zone.estimatedTime}</strong> • {zone.county} County
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. TESTIMONIALS & REVIEWS */}
      <section id="customer-reviews" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 max-w-xl mx-auto mb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-[#d4af37] font-semibold">
            Verified Experiences
          </p>
          <h2 className="text-3xl sm:text-4xl font-serif text-[#fbfbfa]">
            Words from our Regulars
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CUSTOMER_REVIEWS.slice(0, 3).map((t: Review) => (
            <div
              key={t.id}
              className="p-6 rounded-2xl bg-[#121217] border border-[#22222d] space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-[#d4af37]">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#d4af37]" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-[#d4d4d8] italic leading-relaxed font-light">
                  "{t.comment}"
                </p>
              </div>

              <div className="pt-3 border-t border-[#1d1d26] flex items-center justify-between">
                <div>
                  <h4 className="font-serif text-sm font-medium text-[#f4f4f5]">
                    {t.author}
                  </h4>
                  <p className="text-[11px] text-[#71717a]">{t.location}</p>
                </div>
                {t.verifiedPurchase && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Verified</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
