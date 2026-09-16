import React from 'react';
import { ShieldCheck, Truck, Sparkles, Award, ArrowRight, AlertCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatKSh } from '../services/storeService';

export const Hero: React.FC = () => {
  const { setActiveView, setSelectedCategory, setSelectedProductId, products, settings } = useStore();

  // Highlight first featured product or fallback
  const heroProduct =
    products.find((p) => p.featured && p.active !== false && p.stock > 0) ||
    products.find((p) => p.id === 'prod-macallan-12') ||
    products[0];

  return (
    <section id="hero-section" className="relative overflow-hidden bg-[#09090b] border-b border-[#1b1b22]">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-[#9a7b2c]/8 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-[#d4af37]/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Admin Notice Banner if set in CMS */}
      {settings.activeNotice && (
        <div className="bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-amber-500/20 border-b border-amber-500/30 px-4 py-2.5 text-center">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-xs sm:text-sm font-medium text-amber-200">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{settings.activeNotice}</span>
          </div>
        </div>
      )}

      {/* Store Closed Warning if Admin toggled store off */}
      {!settings.isStoreOpen && (
        <div className="bg-red-900/30 border-b border-red-500/30 px-4 py-2 text-center text-xs font-semibold text-red-300">
          Store is currently closed for incoming orders. You may still browse our collection. Operating hours: {settings.operatingHours}.
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Admin-controlled brand statement & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#16161d] border border-[#2b2b36] text-[#d4af37] text-xs tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
              <span className="font-semibold uppercase tracking-wider text-[11px]">
                {settings.heroSubheading || "Nairobi's Premier Digital Spirits Vault"}
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-[#fbfbfa] tracking-tight leading-[1.1]">
              {settings.heroHeading || 'Good bottles. Better nights.'}
            </h1>

            <p className="text-base sm:text-lg text-[#a1a1aa] max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light">
              {settings.heroTagline ||
                'Rare single malts, prestige cognacs, artisanal tequilas, and cellar-aged wines. Stored in climate-controlled conditions and dispatched in 1–2 hours across Nairobi.'}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                id="hero-shop-cta"
                onClick={() => {
                  setSelectedCategory('All');
                  setActiveView('shop');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-[#b5902b] to-[#d4af37] hover:from-[#c59e30] hover:to-[#e3be46] text-black font-semibold text-sm tracking-wide transition duration-300 shadow-xl shadow-[#d4af37]/20 flex items-center justify-center gap-2.5 group cursor-pointer"
              >
                <span>Shop Catalog</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={() => {
                  setSelectedCategory('Whisky');
                  setActiveView('shop');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-7 py-4 rounded-xl bg-[#14141a] hover:bg-[#1c1c24] border border-[#272733] text-[#e4e4e7] hover:text-white text-sm font-medium transition duration-200 cursor-pointer"
              >
                Browse Whisky & Spirits
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 border-t border-[#1b1b22] text-left">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#14141c] border border-[#262633] flex items-center justify-center text-[#d4af37] shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#f4f4f5]">1–2 Hr Delivery</p>
                  <p className="text-[11px] text-[#71717a]">Express in Nairobi</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#14141c] border border-[#262633] flex items-center justify-center text-[#d4af37] shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#f4f4f5]">100% Genuine</p>
                  <p className="text-[11px] text-[#71717a]">KRA & Importer Verified</p>
                </div>
              </div>

              <div className="col-span-2 sm:col-span-1 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#14141c] border border-[#262633] flex items-center justify-center text-[#d4af37] shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#f4f4f5]">M-Pesa Verified</p>
                  <p className="text-[11px] text-[#71717a]">Pay via Till or STK</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Featured Bottle Spotlight or Custom Hero Image */}
          <div className="lg:col-span-5 flex justify-center">
            {heroProduct && (
              <div
                id="hero-bottle-spotlight"
                onClick={() => setSelectedProductId(heroProduct.id)}
                className="w-full max-w-sm rounded-2xl bg-gradient-to-b from-[#14141b] to-[#0c0c10] border border-[#292936] p-6 shadow-2xl relative group cursor-pointer hover:border-[#d4af37]/50 transition duration-500"
              >
                {/* Floating Reserve Badge */}
                <div className="absolute top-4 left-4 z-20 px-3 py-1 rounded-full bg-[#201d14] border border-[#d4af37]/40 text-[#d4af37] text-[10px] font-semibold uppercase tracking-wider">
                  Featured Cellar Reserve
                </div>

                {/* Stock Tag */}
                <div className="absolute top-4 right-4 z-20">
                  {heroProduct.stock <= 0 ? (
                    <span className="px-2.5 py-1 rounded-full bg-red-950/80 border border-red-500/50 text-red-400 text-[10px] font-bold">
                      OUT OF STOCK
                    </span>
                  ) : heroProduct.stock <= (heroProduct.lowStockThreshold || 5) ? (
                    <span className="px-2.5 py-1 rounded-full bg-amber-950/80 border border-amber-500/50 text-amber-400 text-[10px] font-bold">
                      LOW STOCK ({heroProduct.stock})
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 text-[10px] font-bold">
                      IN STOCK ({heroProduct.stock})
                    </span>
                  )}
                </div>

                {/* Bottle Image */}
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-[#0a0a0e] flex items-center justify-center mb-5 group-hover:scale-[1.02] transition duration-500">
                  <img
                    src={settings.heroImageUrl || heroProduct.image}
                    alt={heroProduct.name}
                    className="w-full h-full object-cover object-center opacity-90 group-hover:opacity-100 transition duration-500"
                    referrerPolicy="no-referrer"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c10] via-transparent to-transparent" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#a1a1aa]">
                    <span className="uppercase tracking-wider text-[#d4af37] font-semibold text-[11px]">
                      {heroProduct.brand}
                    </span>
                    <span>
                      {heroProduct.size} • {heroProduct.abv}
                    </span>
                  </div>

                  <h3 className="font-serif text-xl text-[#f4f4f5] group-hover:text-[#d4af37] transition font-medium">
                    {heroProduct.name}
                  </h3>

                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <p className="text-xl font-serif font-bold text-[#fbfbfa]">
                        {formatKSh(heroProduct.price)}
                      </p>
                      {heroProduct.compareAtPrice && heroProduct.compareAtPrice > heroProduct.price && (
                        <p className="text-xs text-[#71717a] line-through">
                          {formatKSh(heroProduct.compareAtPrice)}
                        </p>
                      )}
                    </div>

                    <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#1f1f28] group-hover:bg-[#d4af37] group-hover:text-black transition text-[#d4d4d8]">
                      View Bottle Details
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
