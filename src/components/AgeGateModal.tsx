import React, { useState } from 'react';
import { ShieldCheck, AlertCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const AgeGateModal: React.FC = () => {
  const { isAgeVerified, verifyAge } = useStore();
  const [denied, setDenied] = useState(false);

  if (isAgeVerified) return null;

  return (
    <div
      id="age-gate-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
    >
      <div
        id="age-gate-modal"
        className="w-full max-w-md bg-[#121216] border border-[#272730] p-8 rounded-2xl shadow-2xl text-center relative overflow-hidden"
      >
        {/* Subtle decorative gold top bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#9a7b2c] via-[#d4af37] to-[#9a7b2c]" />

        <div className="mx-auto w-14 h-14 rounded-full bg-[#1c1c24] border border-[#363645] flex items-center justify-center mb-6 text-[#d4af37]">
          <ShieldCheck className="w-7 h-7" />
        </div>

        <p className="text-xs uppercase tracking-[0.25em] text-[#d4af37] font-semibold mb-2">
          Legal Drinking Age Verification
        </p>

        <h2 className="text-2xl sm:text-3xl font-serif text-[#f5f5f0] tracking-wide mb-3">
          Welcome to UNCLE RATT
        </h2>

        <p className="text-sm text-[#a1a1aa] leading-relaxed mb-6">
          Fine Wines & Spirits, Nairobi. You must be 18 years of age or older to enter our digital cellar and purchase alcoholic beverages in the Republic of Kenya.
        </p>

        {denied ? (
          <div className="p-4 bg-amber-950/40 border border-amber-800/60 rounded-xl text-amber-200 text-sm mb-6 flex items-start gap-3 text-left">
            <AlertCircle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
            <div>
              <p className="font-semibold mb-1">Access Restricted</p>
              <p className="text-xs text-amber-300/90">
                You must be at least 18 years old to access this site. We support responsible drinking regulations in Kenya.
              </p>
            </div>
          </div>
        ) : null}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            id="age-confirm-button"
            onClick={verifyAge}
            className="flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#b38f28] to-[#d4af37] hover:from-[#c29c2d] hover:to-[#e0be48] text-black font-semibold text-sm tracking-wide transition duration-200 shadow-lg shadow-[#d4af37]/20"
          >
            I am 18 or Older
          </button>
          <button
            id="age-deny-button"
            onClick={() => setDenied(true)}
            className="py-3.5 px-6 rounded-xl bg-[#1a1a22] hover:bg-[#23232d] text-[#a1a1aa] hover:text-[#f4f4f5] border border-[#2b2b36] text-sm transition duration-200"
          >
            Under 18
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-[#23232d] text-[11px] text-[#71717a] leading-relaxed">
          <span className="font-semibold text-[#a1a1aa]">Responsible Drinking Notice:</span> Excessive consumption of alcohol is harmful to your health. Strictly not for sale to persons under 18 years.
        </div>
      </div>
    </div>
  );
};
