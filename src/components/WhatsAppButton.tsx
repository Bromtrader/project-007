import React from 'react';
import { Phone, MessageSquare } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const WhatsAppButton: React.FC = () => {
  const { settings } = useStore();

  const cleanPhone = settings.whatsappNumber.replace(/[^0-9]/g, '');
  const message = encodeURIComponent(
    'Hello UNCLE RATT! I would like to make an inquiry about bottle availability and delivery in Nairobi.'
  );

  return (
    <a
      id="floating-whatsapp-btn"
      href={`https://wa.me/${cleanPhone}?text=${message}`}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs tracking-wide shadow-2xl shadow-emerald-950 transition-all duration-300 hover:scale-105 group border border-emerald-400/30"
      title="Order or Inquire via WhatsApp"
    >
      <div className="w-6 h-6 rounded-full bg-white text-emerald-600 flex items-center justify-center">
        <Phone className="w-3.5 h-3.5 fill-current" />
      </div>
      <span className="hidden sm:inline font-medium">WhatsApp Concierge</span>
    </a>
  );
};
