import React, { useState } from 'react';
import {
  User as UserIcon,
  X,
  Package,
  Clock,
  Compass,
  LogOut,
  Mail,
  Phone,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatKSh } from '../services/storeService';

export const CustomerAccount: React.FC = () => {
  const {
    currentUser,
    loginUser,
    registerUser,
    logoutUser,
    orders,
    setActiveView,
    isAuthModalOpen,
    setIsAuthModalOpen,
    getOrderById,
    showToast,
  } = useStore();

  // Filter orders matching current user
  const userOrders = orders.filter(
    (o) =>
      currentUser &&
      (o.customer.email.toLowerCase() === currentUser.email.toLowerCase() ||
        (currentUser.phone && o.customer.phone === currentUser.phone))
  );

  // If user is not logged in
  if (!currentUser) {
    return (
      <div id="customer-account-guest" className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-[#121217] border border-[#22222d] rounded-2xl p-8 sm:p-12 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-[#1c1c28] border border-[#d4af37]/30 flex items-center justify-center mx-auto text-[#d4af37] mb-5">
            <UserIcon className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-[#fbfbfa] mb-2">
            Collector's Cellar Account
          </h2>
          <p className="text-sm text-[#a1a1aa] max-w-md mx-auto mb-8 font-light leading-relaxed">
            Sign in to track your current dispatches, reorder your favorite spirits with one click, and access exclusive single cask allocations.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xs mx-auto">
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-[#b38f28] to-[#d4af37] text-black font-semibold text-xs tracking-wider uppercase hover:opacity-95 transition shadow-lg shadow-[#d4af37]/20"
            >
              Sign In / Register
            </button>
            <button
              onClick={() => setActiveView('shop')}
              className="w-full py-3 px-6 rounded-xl bg-[#1a1a24] border border-[#2c2c3e] text-[#f4f4f5] font-semibold text-xs tracking-wider uppercase hover:bg-[#252535] transition"
            >
              Browse Catalog
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Full Account Dashboard View
  return (
    <div id="customer-account-view" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header Profile */}
      <div className="bg-[#121217] border border-[#252533] rounded-2xl p-6 sm:p-8 mb-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#1c1c28] border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37] font-serif text-2xl font-bold">
            {currentUser ? currentUser.fullName.charAt(0).toUpperCase() : 'G'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl text-[#fbfbfa]">
                {currentUser ? currentUser.fullName : 'Guest Collector'}
              </h1>
              {currentUser?.role === 'admin' && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#d4af37] text-black">
                  Staff Admin
                </span>
              )}
            </div>
            <p className="text-xs text-[#a1a1aa] mt-0.5">
              {currentUser?.email || 'Sign in to access saved addresses and order history'}
            </p>
          </div>
        </div>

        {currentUser ? (
          <button
            onClick={logoutUser}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#191924] hover:bg-[#232332] text-xs text-[#a1a1aa] hover:text-rose-300 border border-[#2c2c3d] transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        ) : (
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-[#d4af37] text-black text-xs font-semibold hover:bg-[#e4c04a] transition"
          >
            Sign In / Register
          </button>
        )}
      </div>

      {/* Orders History Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl text-[#fbfbfa] flex items-center gap-2">
            <Package className="w-5 h-5 text-[#d4af37]" />
            Your Order History
          </h2>
          <span className="text-xs text-[#71717a]">{userOrders.length} Orders Found</span>
        </div>

        {userOrders.length === 0 ? (
          <div className="bg-[#121217] border border-[#252533] rounded-2xl p-10 text-center space-y-3">
            <Package className="w-10 h-10 text-[#71717a] mx-auto opacity-50" />
            <h3 className="font-serif text-lg text-[#f4f4f5]">No orders placed yet</h3>
            <p className="text-xs text-[#a1a1aa] max-w-sm mx-auto">
              Your bottle orders will appear here automatically with real-time status and delivery updates.
            </p>
            <button
              onClick={() => setActiveView('shop')}
              className="px-5 py-2.5 rounded-xl bg-[#d4af37] text-black text-xs font-semibold hover:bg-[#e4c04a] transition mt-2"
            >
              Browse Wine & Spirits
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {userOrders.map((order) => (
              <div
                key={order.id}
                className="bg-[#131318] border border-[#22222d] rounded-2xl p-5 hover:border-[#d4af37]/40 transition space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#1f1f2a]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-[#d4af37]">
                        {order.orderNumber}
                      </span>
                      <span className="text-xs text-[#71717a]">•</span>
                      <span className="text-xs text-[#a1a1aa]">
                        {new Date(order.createdAt).toLocaleDateString('en-KE', { dateStyle: 'medium' })}
                      </span>
                    </div>
                    <p className="text-xs text-[#71717a] mt-0.5">
                      Destination: {order.customer.address}, {order.customer.zone}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#1c1c28] border border-[#2f2f42] text-[#d4af37]">
                      {order.orderStatus.replace(/_/g, ' ')}
                    </span>
                    <button
                      onClick={() => {
                        setActiveView('track');
                        // search for order
                      }}
                      className="px-3 py-1 rounded-lg bg-[#20202c] hover:bg-[#2b2b3b] text-xs text-[#f4f4f5] flex items-center gap-1 transition"
                    >
                      <Compass className="w-3.5 h-3.5 text-[#d4af37]" />
                      <span>Track</span>
                    </button>
                  </div>
                </div>

                {/* Items in order */}
                <div className="divide-y divide-[#1b1b24]">
                  {order.items.map((item, i) => (
                    <div key={i} className="py-2 first:pt-0 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-10 h-12 object-cover rounded bg-[#0a0a0d]"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <p className="font-serif text-[#f4f4f5]">{item.name}</p>
                          <p className="text-[11px] text-[#71717a]">{item.size} • Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="font-medium text-[#f4f4f5]">{formatKSh(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-[#1f1f2a] flex justify-between items-center text-xs">
                  <span className="text-[#a1a1aa]">
                    Payment: <strong className="uppercase text-white">{order.paymentMethod}</strong> ({order.paymentStatus})
                  </span>
                  <span className="font-serif text-base font-bold text-[#d4af37]">
                    Total: {formatKSh(order.total)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
