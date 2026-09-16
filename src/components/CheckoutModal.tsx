import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Truck,
  Phone,
  ArrowRight,
  CheckCircle2,
  Clock,
  MapPin,
  FileText,
  AlertCircle,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { DELIVERY_ZONES } from '../data/initialProducts';
import { formatKSh, storeService } from '../services/storeService';
import { Order, PaymentMethod, PaymentStatus, OrderStatus } from '../types';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    cartSubtotal,
    createOrder,
    settings,
    currentUser,
    setActiveView,
    showToast,
    activePromotion,
    promotionDiscount,
    applyPromotion,
    removePromotion,
  } = useStore();

  // Form State
  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [address, setAddress] = useState('');
  const [selectedZoneId, setSelectedZoneId] = useState(DELIVERY_ZONES[0].id);
  const [deliveryMethod, setDeliveryMethod] = useState<'express' | 'standard' | 'pickup'>('express');
  const [orderNotes, setOrderNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mpesa');

  // Promo Code State
  const [promoInput, setPromoInput] = useState('');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  // M-Pesa STK Flow State
  const [mpesaPhone, setMpesaPhone] = useState(currentUser?.phone || '');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [stkSent, setStkSent] = useState(false);
  const [stkRequestId, setStkRequestId] = useState('');
  const [manualMpesaCode, setManualMpesaCode] = useState('');

  // Completed Order State
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isCheckoutOpen) return null;

  const currentZone = DELIVERY_ZONES.find((z) => z.id === selectedZoneId) || DELIVERY_ZONES[0];

  // Delivery fee logic
  const isFreeDelivery = cartSubtotal >= (settings.freeDeliveryThreshold || 8000);
  const deliveryFee = deliveryMethod === 'pickup' ? 0 : isFreeDelivery ? 0 : currentZone.fee;
  const grandTotal = Math.max(0, cartSubtotal - promotionDiscount) + deliveryFee;

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    setIsApplyingPromo(true);
    await applyPromotion(promoInput.trim());
    setIsApplyingPromo(false);
    setPromoInput('');
  };

  const handleMpesaStkPush = async () => {
    const targetPhone = mpesaPhone.trim() || phone.trim();
    if (!targetPhone) {
      setErrorMsg('Please enter a valid Kenyan phone number for M-Pesa payment.');
      return;
    }
    setErrorMsg('');
    setIsProcessingPayment(true);

    try {
      const res = await storeService.triggerMpesaStkPush(targetPhone, grandTotal, 'checkout-pre');
      setStkSent(true);
      setStkRequestId(res.checkoutRequestId);
      showToast(res.message, 'info');
    } catch (err: any) {
      setErrorMsg('Could not dispatch M-Pesa prompt. Please verify your number.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim() || !phone.trim() || !address.trim()) {
      setErrorMsg('Please complete all required contact and delivery fields.');
      return;
    }

    if (cart.length === 0) {
      setErrorMsg('Your cart is empty.');
      return;
    }

    setIsProcessingPayment(true);

    try {
      let paymentStatus: PaymentStatus = 'pending';
      let receiptCode: string | undefined = undefined;

      // Real payment backend validation for M-Pesa
      if (paymentMethod === 'mpesa') {
        if (stkSent || manualMpesaCode.trim()) {
          const verifyRes = await storeService.verifyMpesaTransaction(
            stkRequestId,
            'temp',
            manualMpesaCode.trim() || undefined
          );
          if (verifyRes.success) {
            paymentStatus = 'paid';
            receiptCode = verifyRes.receiptNumber;
          }
        } else {
          // If customer chooses M-Pesa but hasn't triggered STK yet
          paymentStatus = 'pending';
        }
      }

      const orderData = {
        customer: {
          fullName,
          phone,
          email: email || 'guest@uncleratt.co.ke',
          address,
          county: currentZone.county,
          zone: currentZone.name,
          orderNotes,
        },
        items: cart.map((item) => ({
          productId: item.product.id,
          name: item.product.name,
          brand: item.product.brand,
          size: item.product.size,
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.image,
        })),
        subtotal: cartSubtotal,
        deliveryFee,
        discount: promotionDiscount > 0 ? promotionDiscount : undefined,
        promoCode: activePromotion?.code,
        total: grandTotal,
        paymentMethod,
        paymentStatus,
        orderStatus: 'pending' as OrderStatus,
        deliveryMethod,
        mpesaReceiptNumber: receiptCode,
      };

      const created = await createOrder(orderData);
      setCompletedOrder(created);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleCopyOrderId = () => {
    if (completedOrder) {
      navigator.clipboard.writeText(completedOrder.orderNumber);
      showToast(`Copied ${completedOrder.orderNumber} to clipboard`, 'info');
    }
  };

  const formatWhatsAppOrderLink = () => {
    if (!completedOrder) return '';
    const discountText = completedOrder.discount ? `\nPromo Applied: ${completedOrder.promoCode} (-KSh ${completedOrder.discount.toLocaleString()})` : '';
    const text = encodeURIComponent(
      `Hello UNCLE RATT! I have just placed order ${completedOrder.orderNumber} for KSh ${completedOrder.total.toLocaleString()}.${discountText}\nCustomer: ${completedOrder.customer.fullName} (${completedOrder.customer.phone})\nDelivery Address: ${completedOrder.customer.address}, ${completedOrder.customer.zone}.\nStatus: ${completedOrder.paymentStatus.toUpperCase()}`
    );
    return `https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${text}`;
  };

  return (
    <div
      id="checkout-modal-overlay"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md p-4 sm:p-6 flex items-center justify-center animate-in fade-in duration-200"
    >
      <div
        id="checkout-modal"
        className="w-full max-w-3xl bg-[#111116] border border-[#262633] rounded-2xl overflow-hidden shadow-2xl relative my-auto"
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-[#1f1f28] flex items-center justify-between bg-[#14141c]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#1c1c28] border border-[#303042] flex items-center justify-center text-[#d4af37] font-serif font-bold">
              UR
            </div>
            <div>
              <h3 className="font-serif text-xl text-[#f4f4f5]">
                {completedOrder ? 'Order Confirmed' : 'UNCLE RATT Luxury Checkout'}
              </h3>
              <p className="text-[11px] text-[#a1a1aa]">
                {completedOrder ? 'Your bottles are being prepared at the Kilimani Vault' : 'Express delivery across Nairobi & Kenya'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setIsCheckoutOpen(false);
              setCompletedOrder(null);
            }}
            className="p-2 rounded-full text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#1f1f2a] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Completed Order Confirmation View */}
        {completedOrder ? (
          <div className="p-8 space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-950/40 border border-emerald-500/50 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] text-[#d4af37] font-semibold">
                Order Received
              </p>
              <h2 className="font-serif text-3xl text-[#fbfbfa]">
                Asante Sana, {completedOrder.customer.fullName}!
              </h2>
              <p className="text-sm text-[#a1a1aa] max-w-md mx-auto leading-relaxed">
                Your order is confirmed and has been queued for cellar dispatch. A confirmation notification has been prepared for dispatch.
              </p>
            </div>

            {/* Order Card Summary */}
            <div className="max-w-md mx-auto bg-[#16161f] border border-[#252533] rounded-xl p-5 text-left space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-[#22222e]">
                <div>
                  <span className="text-[11px] text-[#71717a] block">Order Tracking Code</span>
                  <span className="font-mono text-base font-bold text-[#d4af37]">
                    {completedOrder.orderNumber}
                  </span>
                </div>
                <button
                  onClick={handleCopyOrderId}
                  className="p-2 rounded-lg bg-[#20202c] hover:bg-[#2a2a3a] text-xs text-[#a1a1aa] hover:text-[#f4f4f5] flex items-center gap-1.5 transition"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </button>
              </div>

              <div className="space-y-1.5 text-xs text-[#d4d4d8]">
                <div className="flex justify-between">
                  <span className="text-[#a1a1aa]">Delivery Destination:</span>
                  <span className="font-medium text-right max-w-[200px] truncate">{completedOrder.customer.address}, {completedOrder.customer.zone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#a1a1aa]">Payment Method:</span>
                  <span className="font-medium uppercase">{completedOrder.paymentMethod} ({completedOrder.paymentStatus})</span>
                </div>
                {completedOrder.mpesaReceiptNumber && (
                  <div className="flex justify-between text-emerald-400">
                    <span>M-Pesa Receipt:</span>
                    <span className="font-mono font-semibold">{completedOrder.mpesaReceiptNumber}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-[#22222e] font-semibold text-sm">
                  <span>Grand Total:</span>
                  <span className="text-[#d4af37] font-serif">{formatKSh(completedOrder.total)}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a
                href={formatWhatsAppOrderLink()}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30"
              >
                <Phone className="w-4 h-4" />
                <span>Confirm on WhatsApp Concierge</span>
              </a>

              <button
                onClick={() => {
                  setIsCheckoutOpen(false);
                  setCompletedOrder(null);
                  setActiveView('track');
                }}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#20202c] hover:bg-[#2a2a3a] border border-[#303042] text-[#f4f4f5] text-xs font-semibold transition"
              >
                Track Live Order
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Form */
          <form onSubmit={handleSubmitOrder} className="p-6 sm:p-8 space-y-6">
            {errorMsg && (
              <div className="p-4 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-300 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* Left Form: Customer Details */}
              <div className="md:col-span-7 space-y-4">
                <h4 className="text-xs uppercase tracking-wider text-[#d4af37] font-semibold">
                  1. Delivery Details & Contact
                </h4>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[#a1a1aa] mb-1 font-medium">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Barrack Ratemo"
                      className="w-full bg-[#16161f] border border-[#272736] focus:border-[#d4af37] rounded-xl px-3.5 py-2.5 text-[#f4f4f5] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[#a1a1aa] mb-1 font-medium">
                        Phone Number (M-Pesa) *
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          if (!mpesaPhone) setMpesaPhone(e.target.value);
                        }}
                        placeholder="e.g. 0712345678"
                        className="w-full bg-[#16161f] border border-[#272736] focus:border-[#d4af37] rounded-xl px-3.5 py-2.5 text-[#f4f4f5] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[#a1a1aa] mb-1 font-medium">
                        Email Address (Receipt)
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. barrack@gmail.com"
                        className="w-full bg-[#16161f] border border-[#272736] focus:border-[#d4af37] rounded-xl px-3.5 py-2.5 text-[#f4f4f5] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#a1a1aa] mb-1 font-medium">
                      Delivery Zone / Neighborhood *
                    </label>
                    <select
                      value={selectedZoneId}
                      onChange={(e) => setSelectedZoneId(e.target.value)}
                      className="w-full bg-[#16161f] border border-[#272736] focus:border-[#d4af37] rounded-xl px-3.5 py-2.5 text-[#f4f4f5] focus:outline-none cursor-pointer"
                    >
                      {DELIVERY_ZONES.map((zone) => (
                        <option key={zone.id} value={zone.id}>
                          {zone.name} — {isFreeDelivery ? 'FREE (Special Promo)' : `KSh ${zone.fee}`} ({zone.estimatedTime})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#a1a1aa] mb-1 font-medium">
                      Exact Delivery Address / Apartment / Estate / Road *
                    </label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. Rhapta Heights, Apt 3C, Rhapta Road"
                      className="w-full bg-[#16161f] border border-[#272736] focus:border-[#d4af37] rounded-xl px-3.5 py-2.5 text-[#f4f4f5] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[#a1a1aa] mb-1 font-medium">
                      Order Notes / Delivery Instructions / Gift Message
                    </label>
                    <textarea
                      rows={2}
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      placeholder="Optional: Ring bell, leave at reception, ice chilled, etc."
                      className="w-full bg-[#16161f] border border-[#272736] focus:border-[#d4af37] rounded-xl px-3.5 py-2 text-[#f4f4f5] focus:outline-none resize-none"
                    />
                  </div>
                </div>

                {/* Delivery Method Selection */}
                <div className="pt-2">
                  <h4 className="text-xs uppercase tracking-wider text-[#d4af37] font-semibold mb-2">
                    2. Delivery Speed
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <button
                      type="button"
                      onClick={() => setDeliveryMethod('express')}
                      className={`p-3 rounded-xl border text-left transition ${
                        deliveryMethod === 'express'
                          ? 'bg-[#1e1c14] border-[#d4af37] text-[#f4f4f5]'
                          : 'bg-[#14141c] border-[#252533] text-[#a1a1aa]'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-semibold text-[#d4af37] mb-1">
                        <Truck className="w-3.5 h-3.5" />
                        <span>Nairobi Express</span>
                      </div>
                      <p className="text-[11px] text-[#71717a]">Dispatched in 1–2 hours</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryMethod('pickup')}
                      className={`p-3 rounded-xl border text-left transition ${
                        deliveryMethod === 'pickup'
                          ? 'bg-[#1e1c14] border-[#d4af37] text-[#f4f4f5]'
                          : 'bg-[#14141c] border-[#252533] text-[#a1a1aa]'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-semibold text-[#d4af37] mb-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Kilimani Vault Pickup</span>
                      </div>
                      <p className="text-[11px] text-[#71717a]">Free • Ready in 15 mins</p>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Order Summary & Payment Choice */}
              <div className="md:col-span-5 space-y-5 bg-[#14141a] p-5 rounded-2xl border border-[#202029]">
                <h4 className="text-xs uppercase tracking-wider text-[#d4af37] font-semibold">
                  Order Breakdown
                </h4>

                {/* Bottles mini summary */}
                <div className="max-h-40 overflow-y-auto space-y-2 pr-1 divide-y divide-[#1d1d28]">
                  {cart.map((item) => (
                    <div key={item.product.id} className="pt-2 first:pt-0 flex justify-between text-xs">
                      <div className="overflow-hidden pr-2">
                        <p className="text-[#f4f4f5] font-serif font-medium truncate">
                          {item.quantity}x {item.product.name}
                        </p>
                        <p className="text-[10px] text-[#71717a]">{item.product.size}</p>
                      </div>
                      <span className="text-[#d4d4d8] font-semibold shrink-0">
                        {formatKSh(item.product.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Promo Code Input & Status */}
                <div className="pt-3 border-t border-[#22222e]">
                  {activePromotion ? (
                    <div className="flex items-center justify-between p-2.5 bg-emerald-950/30 border border-emerald-500/40 rounded-xl text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <div>
                          <span className="font-mono font-bold text-emerald-400">{activePromotion.code}</span>
                          <span className="text-[10px] text-emerald-300/80 block">
                            Promo Applied (-{formatKSh(promotionDiscount)})
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={removePromotion}
                        className="text-[11px] text-[#a1a1aa] hover:text-rose-400 transition underline"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Promo Code (e.g. WELCOME10)"
                          value={promoInput}
                          onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                          className="flex-1 bg-[#181822] border border-[#2c2c3d] rounded-xl px-3 py-2 text-xs text-[#f4f4f5] placeholder-[#71717a] uppercase font-mono tracking-wider focus:outline-none focus:border-[#d4af37]"
                        />
                        <button
                          type="button"
                          onClick={handleApplyPromo}
                          disabled={!promoInput.trim() || isApplyingPromo}
                          className="px-3.5 py-2 rounded-xl bg-[#242432] hover:bg-[#303044] disabled:opacity-50 text-xs font-semibold text-[#f4f4f5] transition"
                        >
                          {isApplyingPromo ? 'Checking...' : 'Apply'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Subtotal & Totals */}
                <div className="pt-3 border-t border-[#22222e] space-y-1.5 text-xs">
                  <div className="flex justify-between text-[#a1a1aa]">
                    <span>Subtotal:</span>
                    <span className="text-[#f4f4f5]">{formatKSh(cartSubtotal)}</span>
                  </div>
                  {activePromotion && (
                    <div className="flex justify-between text-emerald-400 font-medium">
                      <span>Discount ({activePromotion.code}):</span>
                      <span>-{formatKSh(promotionDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[#a1a1aa]">
                    <span>Delivery ({currentZone.name.split(',')[0]}):</span>
                    <span className={deliveryFee === 0 ? 'text-emerald-400 font-semibold' : 'text-[#f4f4f5]'}>
                      {deliveryFee === 0 ? 'FREE' : formatKSh(deliveryFee)}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-serif font-bold text-[#fbfbfa] pt-2 border-t border-[#22222e]">
                    <span>Total Due:</span>
                    <span className="text-[#d4af37]">{formatKSh(grandTotal)}</span>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs uppercase tracking-wider text-[#d4af37] font-semibold">
                    3. Payment Method
                  </h4>

                  <div className="space-y-2">
                    {/* M-Pesa Option */}
                    <div
                      onClick={() => setPaymentMethod('mpesa')}
                      className={`p-3.5 rounded-xl border cursor-pointer transition ${
                        paymentMethod === 'mpesa'
                          ? 'bg-[#1b251b] border-emerald-500/60 text-[#f4f4f5]'
                          : 'bg-[#16161f] border-[#252533] text-[#a1a1aa]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                          <span className="font-semibold text-xs text-white">
                            Lipa Na M-Pesa (STK Push & Till)
                          </span>
                        </div>
                        <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded">
                          Recommended
                        </span>
                      </div>
                      <p className="text-[11px] text-[#a1a1aa] pl-4">
                        Pay instantly on your phone via M-Pesa prompt or Till {settings.mpesaTill}.
                      </p>

                      {paymentMethod === 'mpesa' && (
                        <div className="mt-3 pt-3 border-t border-emerald-900/40 space-y-2 pl-4 text-xs">
                          <div className="flex gap-2">
                            <input
                              type="tel"
                              value={mpesaPhone || phone}
                              onChange={(e) => setMpesaPhone(e.target.value)}
                              placeholder="07XX XXX XXX"
                              className="w-full bg-[#101910] border border-emerald-700/50 rounded-lg px-2.5 py-1.5 text-xs text-emerald-100 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={handleMpesaStkPush}
                              disabled={isProcessingPayment}
                              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs rounded-lg whitespace-nowrap transition"
                            >
                              {isProcessingPayment ? 'Sending...' : 'Trigger STK'}
                            </button>
                          </div>

                          {stkSent && (
                            <div className="p-2.5 bg-emerald-950/60 border border-emerald-600/50 rounded-lg text-[11px] text-emerald-300">
                              <p className="font-semibold mb-1">Prompt Sent to your Phone</p>
                              <p>Enter your M-Pesa PIN on your handset to authorize {formatKSh(grandTotal)}.</p>
                            </div>
                          )}

                          <div className="pt-1 text-[11px] text-[#71717a]">
                            <span>Or enter M-Pesa Confirmation Code manually:</span>
                            <input
                              type="text"
                              value={manualMpesaCode}
                              onChange={(e) => setManualMpesaCode(e.target.value.toUpperCase())}
                              placeholder="e.g. RK9847120B"
                              className="mt-1 w-full bg-[#101015] border border-[#2b2b3b] rounded-lg px-2.5 py-1.5 text-xs text-[#f4f4f5] uppercase font-mono"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Cash / Card on Delivery Option */}
                    {settings.enableCod && (
                      <div
                        onClick={() => setPaymentMethod('cod')}
                        className={`p-3.5 rounded-xl border cursor-pointer transition ${
                          paymentMethod === 'cod'
                            ? 'bg-[#1e1c14] border-[#d4af37] text-[#f4f4f5]'
                            : 'bg-[#16161f] border-[#252533] text-[#a1a1aa]'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#d4af37]" />
                          <span className="font-semibold text-xs text-white">
                            Cash or Card on Delivery
                          </span>
                        </div>
                        <p className="text-[11px] text-[#a1a1aa] pl-4">
                          Pay with Cash or Card via mobile POS when our courier arrives at your location.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit CTA */}
                <button
                  id="checkout-confirm-order-button"
                  type="submit"
                  disabled={isProcessingPayment}
                  className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-[#b38f28] to-[#d4af37] hover:from-[#c29c2d] hover:to-[#e0be48] text-black font-semibold text-sm tracking-wide transition duration-200 shadow-xl shadow-[#d4af37]/20 flex items-center justify-center gap-2 group disabled:opacity-50"
                >
                  {isProcessingPayment ? (
                    <span>Processing Bottle Order...</span>
                  ) : (
                    <>
                      <span>Confirm & Place Order • {formatKSh(grandTotal)}</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>

                <p className="text-[11px] text-center text-[#71717a]">
                  Alcohol consumption is restricted to 18+. Verified Kenyan courier delivery.
                </p>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
