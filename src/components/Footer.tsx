import React from 'react';
import { Wine, ShieldAlert, Phone, Mail, MapPin, Clock, Heart } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Category } from '../types';

export const Footer: React.FC = () => {
  const { setActiveView, setSelectedCategory, settings } = useStore();

  const handleCategoryClick = (cat: Category) => {
    setSelectedCategory(cat);
    setActiveView('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="main-footer" className="bg-[#070709] border-t border-[#1a1a24] text-[#a1a1aa] text-xs">
      {/* Age Warning & Responsible Drinking Ribbon */}
      <div className="bg-[#120f09] border-b border-[#2b2210] py-4 px-4 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 text-[11px] text-[#e0c897]">
          <div className="flex items-center gap-2 font-bold tracking-wider uppercase text-amber-400">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Age Restriction 18+</span>
          </div>
          <span className="hidden sm:inline">•</span>
          <p className="leading-tight">
            Excessive alcohol consumption is harmful to your health. Strictly not for sale to persons under 18 years. Drink responsibly.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div
              onClick={() => {
                setActiveView('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2.5 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#d4af37] to-[#8c6d23] flex items-center justify-center text-black font-serif font-bold text-lg shadow-md shadow-[#d4af37]/20">
                UR
              </div>
              <span className="font-serif text-2xl font-bold tracking-wider text-[#fbfbfa]">
                UNCLE RATT
              </span>
            </div>

            <p className="text-xs text-[#a1a1aa] leading-relaxed max-w-sm font-light">
              Nairobi’s premier digital wines and spirits vault. Supplying genuine single malts, rare cognacs, artisanal tequilas, and cellar-aged wines with rapid climate-controlled delivery across Nairobi and Kenya.
            </p>

            {/* Contact quick links */}
            <div className="space-y-2 pt-1 text-[11px]">
              <div className="flex items-center gap-2 text-[#d4d4d8]">
                <MapPin className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>{settings.storeAddress}</span>
              </div>
              <div className="flex items-center gap-2 text-[#d4d4d8]">
                <Clock className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>{settings.operatingHours}</span>
              </div>
              <div className="flex items-center gap-2 text-[#d4d4d8]">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Concierge & WhatsApp: {settings.whatsappNumber}</span>
              </div>
            </div>
          </div>

          {/* Quick Categories */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-semibold text-[#f4f4f5] uppercase tracking-wider">
              Spirits Collection
            </h4>
            <ul className="space-y-2 text-xs">
              {['Whisky', 'Cognac', 'Tequila', 'Gin', 'Vodka', 'Wine', 'Champagne'].map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => handleCategoryClick(cat as any)}
                    className="hover:text-[#d4af37] transition"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service & Navigation */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-semibold text-[#f4f4f5] uppercase tracking-wider">
              Client Concierge
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => {
                    setActiveView('track');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-[#d4af37] transition"
                >
                  Track Live Order
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveView('account');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-[#d4af37] transition"
                >
                  My Cellar Account
                </button>
              </li>
              <li>
                <a
                  href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=Hi%20UNCLE%20RATT,%20inquiry%20regarding%20bulk%20party%20orders`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#d4af37] transition"
                >
                  Corporate & Event Supply
                </a>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveView('admin');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-[#d4af37] transition"
                >
                  Staff Portal & Admin
                </button>
              </li>
            </ul>
          </div>

          {/* Payments & Assurance */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-semibold text-[#f4f4f5] uppercase tracking-wider">
              Accepted Payments
            </h4>
            <p className="text-xs text-[#71717a] leading-relaxed">
              Fast, encrypted settlement via Safaricom M-Pesa Till or STK prompt. Cash & Card accepted on courier arrival.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="px-2.5 py-1 rounded bg-[#131a13] border border-emerald-800/40 text-emerald-400 font-semibold text-[10px]">
                Lipa Na M-Pesa
              </span>
              <span className="px-2.5 py-1 rounded bg-[#181822] border border-[#2b2b3b] text-[#e4e4e7] font-semibold text-[10px]">
                Card on Delivery
              </span>
              <span className="px-2.5 py-1 rounded bg-[#181822] border border-[#2b2b3b] text-[#e4e4e7] font-semibold text-[10px]">
                Cash on Delivery
              </span>
            </div>
          </div>
        </div>

        {/* Bottom copyright & disclaimer */}
        <div className="pt-10 mt-10 border-t border-[#171720] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#71717a]">
          <p>&copy; {new Date().getFullYear()} UNCLE RATT Wines & Spirits Ltd. All rights reserved. Nairobi, Kenya.</p>
          <div className="flex items-center gap-4">
            <span>KRA Certified Importer</span>
            <span>•</span>
            <span>Climate-Controlled Storage</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
