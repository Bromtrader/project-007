import React, { useState } from 'react';
import {
  User as UserIcon,
  X,
  ShieldCheck,
  Mail,
  Lock,
  Phone,
  ArrowRight,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    currentUser,
    loginUser,
    registerUser,
    setActiveView,
    showToast,
  } = useStore();

  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen || currentUser) return null;

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegistering) {
        if (!fullName.trim() || !email.trim()) {
          showToast('Please provide your name and email', 'error');
          return;
        }
        await registerUser(email, password, fullName, phone);
      } else {
        if (!email.trim()) {
          showToast('Please provide your email address', 'error');
          return;
        }
        await loginUser(email, password);
      }
      setIsAuthModalOpen(false);
    } catch (err: any) {
      showToast(err?.message || 'Authentication failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="auth-modal-overlay"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md p-4 flex items-center justify-center animate-in fade-in duration-200"
    >
      <div
        id="auth-modal"
        className="w-full max-w-md bg-[#111116] border border-[#252533] rounded-2xl p-8 relative shadow-2xl"
      >
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-4 right-4 p-2 text-[#a1a1aa] hover:text-[#f4f4f5] rounded-full hover:bg-[#1c1c28]"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-full bg-[#1c1c28] border border-[#303042] flex items-center justify-center mx-auto text-[#d4af37]">
            <UserIcon className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-2xl text-[#fbfbfa]">
            {isRegistering ? 'Create Customer Cellar Account' : 'Sign In to UNCLE RATT'}
          </h3>
          <p className="text-xs text-[#a1a1aa]">
            {isRegistering
              ? 'Save your delivery addresses and track past orders'
              : 'Access your order history and VIP offers'}
          </p>
        </div>

        <form onSubmit={handleAuthSubmit} className="space-y-4 text-xs">
          {isRegistering && (
            <div>
              <label className="block text-[#a1a1aa] mb-1 font-medium">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. David Mwangi"
                className="w-full bg-[#16161f] border border-[#272736] focus:border-[#d4af37] rounded-xl px-3.5 py-2.5 text-[#f4f4f5] focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-[#a1a1aa] mb-1 font-medium">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. david@gmail.com"
              className="w-full bg-[#16161f] border border-[#272736] focus:border-[#d4af37] rounded-xl px-3.5 py-2.5 text-[#f4f4f5] focus:outline-none"
            />
          </div>

          {isRegistering && (
            <div>
              <label className="block text-[#a1a1aa] mb-1 font-medium">Phone Number (M-Pesa)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="07XX XXX XXX"
                className="w-full bg-[#16161f] border border-[#272736] focus:border-[#d4af37] rounded-xl px-3.5 py-2.5 text-[#f4f4f5] focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-[#a1a1aa] mb-1 font-medium">
              Password {isRegistering ? '' : '(Optional / Demo)'}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#16161f] border border-[#272736] focus:border-[#d4af37] rounded-xl px-3.5 py-2.5 text-[#f4f4f5] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#b38f28] to-[#d4af37] hover:from-[#c29c2d] hover:to-[#e0be48] text-black font-semibold text-xs transition duration-200 shadow-md shadow-[#d4af37]/20"
          >
            {loading
              ? 'Processing...'
              : isRegistering
              ? 'Complete Registration'
              : 'Sign In'}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-xs text-[#d4af37] hover:underline"
            >
              {isRegistering
                ? 'Already have an account? Sign in here'
                : "Don't have an account? Create one in seconds"}
            </button>
          </div>

          <div className="pt-4 border-t border-[#20202c] text-[11px] text-[#71717a] text-center">
            <span>Looking for admin portal? </span>
            <button
              type="button"
              onClick={() => {
                setIsAuthModalOpen(false);
                setActiveView('admin');
              }}
              className="text-[#a1a1aa] underline hover:text-[#f4f4f5]"
            >
              Go to Cellar Staff Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
