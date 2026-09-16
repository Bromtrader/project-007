import React, { useState } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  Package,
  Truck,
  MapPin,
  Phone,
  AlertCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Order, OrderStatus } from '../types';
import { formatKSh } from '../services/storeService';

const STATUS_STEPS: { status: OrderStatus; label: string; description: string }[] = [
  { status: 'pending', label: 'Order Placed', description: 'Queued in UNCLE RATT digital cellar' },
  { status: 'confirmed', label: 'Confirmed', description: 'Inventory reserved & payment confirmed' },
  { status: 'processing', label: 'Cellar Preparation', description: 'Bottles inspected, packed & temperature sealed' },
  { status: 'out_for_delivery', label: 'Out for Delivery', description: 'Express courier en route with your package' },
  { status: 'delivered', label: 'Delivered', description: 'Delivered to recipient. Enjoy responsibly.' },
];

export const OrderTracker: React.FC = () => {
  const { orders, getOrderById, settings, setActiveView } = useStore();
  const [searchCode, setSearchCode] = useState('');
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCode.trim()) return;

    setLoading(true);
    setSearched(true);
    const order = await getOrderById(searchCode.trim());
    setCurrentOrder(order);
    setLoading(false);
  };

  const getStepIndex = (status: OrderStatus) => {
    if (status === 'cancelled') return -1;
    return STATUS_STEPS.findIndex((s) => s.status === status);
  };

  const activeIndex = currentOrder ? getStepIndex(currentOrder.orderStatus) : 0;

  return (
    <div id="order-tracker-page" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center space-y-3 mb-10">
        <p className="text-xs uppercase tracking-[0.25em] text-[#d4af37] font-semibold">
          Live Dispatch Concierge
        </p>
        <h1 className="text-3xl sm:text-4xl font-serif text-[#fbfbfa]">
          Track Your Bottle Order
        </h1>
        <p className="text-sm text-[#a1a1aa] max-w-md mx-auto">
          Enter your UNCLE RATT order tracking code (e.g. <span className="text-[#d4af37] font-mono">UR-8291</span>) to follow your courier live across Nairobi.
        </p>
      </div>

      {/* Search Bar */}
      <form
        onSubmit={handleSearch}
        className="max-w-xl mx-auto flex items-center bg-[#14141c] border border-[#272736] focus-within:border-[#d4af37] rounded-2xl p-2 shadow-xl mb-12"
      >
        <Search className="w-5 h-5 text-[#d4af37] ml-3 mr-2 shrink-0" />
        <input
          type="text"
          value={searchCode}
          onChange={(e) => setSearchCode(e.target.value)}
          placeholder="Enter Order Code (e.g. UR-8291)"
          className="w-full bg-transparent text-sm text-[#f4f4f5] focus:outline-none placeholder:text-[#71717a] uppercase font-mono"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#b38f28] to-[#d4af37] hover:from-[#c29c2d] hover:to-[#e0be48] text-black font-semibold text-xs transition duration-200"
        >
          {loading ? 'Searching...' : 'Track'}
        </button>
      </form>

      {/* Order Status Result */}
      {searched && !currentOrder && (
        <div className="max-w-md mx-auto bg-[#14141a] border border-[#23232e] rounded-2xl p-8 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
          <h3 className="font-serif text-xl text-[#f4f4f5]">Order Not Found</h3>
          <p className="text-xs text-[#a1a1aa] leading-relaxed">
            We couldn't locate any active order with code "{searchCode}". Please verify your order confirmation SMS or WhatsApp receipt.
          </p>
          <div className="pt-2">
            <span className="text-xs text-[#71717a] block mb-2">Try testing with demo code:</span>
            <button
              onClick={() => {
                setSearchCode('UR-8291');
                getOrderById('UR-8291').then(setCurrentOrder);
              }}
              className="px-3 py-1.5 rounded bg-[#1c1c26] text-[#d4af37] text-xs font-mono border border-[#2d2d3d]"
            >
              Load Sample UR-8291
            </button>
          </div>
        </div>
      )}

      {currentOrder && (
        <div className="bg-[#121217] border border-[#252533] rounded-2xl p-6 sm:p-8 space-y-8 shadow-2xl">
          {/* Order Snapshot */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1f1f2a]">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold">
                Order Tracking
              </span>
              <h2 className="text-2xl font-serif text-[#fbfbfa] mt-0.5">
                {currentOrder.orderNumber}
              </h2>
              <p className="text-xs text-[#a1a1aa] mt-1">
                Placed on {new Date(currentOrder.createdAt).toLocaleString('en-KE', { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                  currentOrder.orderStatus === 'delivered'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : currentOrder.orderStatus === 'cancelled'
                    ? 'bg-rose-950 text-rose-300 border border-rose-800'
                    : 'bg-[#211d13] text-[#d4af37] border border-[#d4af37]/40 animate-pulse'
                }`}
              >
                {currentOrder.orderStatus.replace(/_/g, ' ')}
              </span>

              <a
                href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=Hi%20UNCLE%20RATT,%20inquiry%20regarding%20order%20${currentOrder.orderNumber}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-[#191924] hover:bg-[#232332] text-[#d4af37] text-xs font-medium border border-[#2d2d3e] flex items-center gap-1.5 transition"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Contact Rider</span>
              </a>
            </div>
          </div>

          {/* Progress Stepper Timeline */}
          {currentOrder.orderStatus === 'cancelled' ? (
            <div className="p-4 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-200 text-xs">
              This order was cancelled. If you have any inquiries or require a refund, please message our WhatsApp concierge.
            </div>
          ) : (
            <div className="py-4">
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 sm:gap-2 relative">
                {STATUS_STEPS.map((step, idx) => {
                  const isDone = idx <= activeIndex;
                  const isCurrent = idx === activeIndex;

                  return (
                    <div
                      key={step.status}
                      className={`relative flex flex-col items-center text-center p-3 rounded-xl border transition ${
                        isCurrent
                          ? 'bg-[#1a1710] border-[#d4af37] shadow-lg shadow-[#d4af37]/10'
                          : isDone
                          ? 'bg-[#15151c] border-[#2b2b3b]'
                          : 'bg-[#0f0f13] border-[#1d1d26] opacity-50'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center mb-2.5 font-semibold text-xs transition ${
                          isDone
                            ? 'bg-[#d4af37] text-black'
                            : 'bg-[#1f1f2a] text-[#71717a]'
                        }`}
                      >
                        {isDone ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                      </div>

                      <p className={`text-xs font-semibold mb-1 ${isCurrent ? 'text-[#d4af37]' : isDone ? 'text-[#f4f4f5]' : 'text-[#71717a]'}`}>
                        {step.label}
                      </p>
                      <p className="text-[10px] text-[#a1a1aa] leading-tight">
                        {step.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Dispatch & Driver Details */}
          {currentOrder.driverNotes && (
            <div className="p-4 bg-[#181822] border border-[#2b2b3d] rounded-xl flex items-center gap-3 text-xs text-[#d4d4d8]">
              <Truck className="w-5 h-5 text-[#d4af37] shrink-0" />
              <div>
                <span className="font-semibold text-[#f4f4f5]">Live Courier Assignment: </span>
                <span>{currentOrder.driverNotes}</span>
              </div>
            </div>
          )}

          {/* Order Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#1f1f2a] text-xs">
            {/* Delivery Destination */}
            <div className="space-y-2 bg-[#15151c] p-4 rounded-xl border border-[#22222e]">
              <h4 className="font-serif text-sm text-[#fbfbfa] flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#d4af37]" />
                Delivery Information
              </h4>
              <p className="text-[#a1a1aa]">
                <strong className="text-[#f4f4f5]">Recipient:</strong> {currentOrder.customer.fullName}
              </p>
              <p className="text-[#a1a1aa]">
                <strong className="text-[#f4f4f5]">Phone:</strong> {currentOrder.customer.phone}
              </p>
              <p className="text-[#a1a1aa]">
                <strong className="text-[#f4f4f5]">Address:</strong> {currentOrder.customer.address}, {currentOrder.customer.zone}
              </p>
              {currentOrder.customer.orderNotes && (
                <p className="text-[#a1a1aa]">
                  <strong className="text-[#f4f4f5]">Instructions:</strong> {currentOrder.customer.orderNotes}
                </p>
              )}
            </div>

            {/* Payment Summary */}
            <div className="space-y-2 bg-[#15151c] p-4 rounded-xl border border-[#22222e]">
              <h4 className="font-serif text-sm text-[#fbfbfa] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#d4af37]" />
                Payment & Totals
              </h4>
              <p className="text-[#a1a1aa]">
                <strong className="text-[#f4f4f5]">Method:</strong> {currentOrder.paymentMethod.toUpperCase()}
              </p>
              <p className="text-[#a1a1aa]">
                <strong className="text-[#f4f4f5]">Payment Status:</strong>{' '}
                <span className={currentOrder.paymentStatus === 'paid' ? 'text-emerald-400 font-semibold' : 'text-amber-400'}>
                  {currentOrder.paymentStatus.toUpperCase()}
                </span>
              </p>
              {currentOrder.mpesaReceiptNumber && (
                <p className="text-[#a1a1aa]">
                  <strong className="text-[#f4f4f5]">M-Pesa Receipt:</strong> <span className="font-mono text-emerald-300">{currentOrder.mpesaReceiptNumber}</span>
                </p>
              )}
              <div className="pt-2 border-t border-[#22222e] flex justify-between text-sm font-semibold">
                <span className="text-[#f4f4f5]">Total Paid:</span>
                <span className="text-[#d4af37] font-serif">{formatKSh(currentOrder.total)}</span>
              </div>
            </div>
          </div>

          {/* Bottles in Order */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs uppercase tracking-wider text-[#d4af37] font-semibold">
              Bottles in this Order
            </h4>
            <div className="divide-y divide-[#1e1e28]">
              {currentOrder.items.map((item, i) => (
                <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-14 object-cover rounded bg-[#0b0b0e] border border-[#22222e]"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <p className="font-serif font-medium text-[#f4f4f5]">{item.name}</p>
                      <p className="text-[11px] text-[#71717a]">{item.size} • Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-semibold text-[#f4f4f5]">
                    {formatKSh(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
