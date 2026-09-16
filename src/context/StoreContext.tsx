import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Product,
  CartItem,
  Order,
  User,
  StoreSettings,
  Category,
  OrderStatus,
  PaymentStatus,
  CategoryItem,
  AdminRole,
  AdminAccount,
  Promotion,
} from '../types';
import { storeService, formatKSh } from '../services/storeService';
import { INITIAL_SETTINGS, INITIAL_CATEGORIES } from '../data/initialProducts';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  isUserAdmin,
  db,
  collection,
  doc,
  onSnapshot,
  COLLECTIONS,
  FirebaseUser,
} from '../services/firebase';

interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'error';
  message: string;
}

interface StoreContextType {
  // Products
  products: Product[];
  loadingProducts: boolean;
  addProduct: (product: Partial<Product>) => Promise<Product>;
  updateProduct: (product: Partial<Product>) => Promise<Product>;
  updateStock: (productId: string, newStock: number) => Promise<boolean>;
  updatePrice: (productId: string, price: number, salePrice?: number) => Promise<Product>;
  deleteProduct: (id: string) => Promise<boolean>;
  refreshProducts: () => Promise<void>;
  bulkUpdateProducts: (action: string, ids: string[], data?: any) => Promise<void>;

  // Categories
  categories: CategoryItem[];
  saveCategory: (category: Partial<CategoryItem>) => Promise<CategoryItem>;
  addCategory: (category: Partial<CategoryItem>) => Promise<CategoryItem>;
  updateCategory: (category: Partial<CategoryItem>) => Promise<CategoryItem>;
  deleteCategory: (id: string) => Promise<boolean>;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;

  // Promotions & Discounts
  promotions: Promotion[];
  activePromotion: Promotion | null;
  promotionDiscount: number;
  applyPromotion: (code: string) => Promise<{ success: boolean; message: string }>;
  removePromotion: () => void;
  savePromotion: (promo: Partial<Promotion>) => Promise<Promotion>;
  deletePromotion: (id: string) => Promise<void>;
  refreshPromotions: () => Promise<void>;

  // Orders
  orders: Order[];
  createOrder: (
    orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>
  ) => Promise<Order>;
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<Order | null>;
  updatePaymentStatus: (
    id: string,
    status: PaymentStatus,
    mpesaCode?: string
  ) => Promise<Order | null>;
  getOrderById: (id: string) => Promise<Order | null>;

  // Auth & Admin Access (RBAC)
  currentUser: User | null;
  firebaseUser: FirebaseUser | null;
  isAdmin: boolean;
  adminRole: AdminRole | null;
  admins: AdminAccount[];
  saveAdmin: (admin: Partial<AdminAccount>) => Promise<AdminAccount>;
  deleteAdmin: (id: string) => Promise<void>;
  refreshAdmins: () => Promise<void>;
  loginWithGoogle: () => Promise<boolean>;
  loginWithEmail: (email: string, password?: string) => Promise<boolean>;
  loginUser: (email: string, password?: string) => Promise<boolean>;
  registerUser: (email: string, password?: string, fullName?: string, phone?: string) => Promise<boolean>;
  loginWithPin: (pin: string) => Promise<boolean>;
  logoutUser: () => Promise<void>;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;

  // Store Settings (Homepage CMS)
  settings: StoreSettings;
  updateSettings: (newSettings: Partial<StoreSettings>) => Promise<void>;

  // Age Verification
  isAgeVerified: boolean;
  verifyAge: () => void;

  // Navigation & Search State
  selectedCategory: Category;
  setSelectedCategory: (cat: Category) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeView: 'home' | 'shop' | 'admin' | 'account' | 'track';
  setActiveView: (view: 'home' | 'shop' | 'admin' | 'account' | 'track') => void;
  selectedProductId: string | null;
  setSelectedProductId: (id: string | null) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;

  // Toasts
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>(INITIAL_CATEGORIES);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(INITIAL_SETTINGS);

  // Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('uncleratt_cart_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Auth
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('uncleratt_user_v1');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isAdminState, setIsAdminState] = useState<boolean>(() => {
    return localStorage.getItem('uncleratt_is_admin') === 'true';
  });

  // Age Verification
  const [isAgeVerified, setIsAgeVerified] = useState<boolean>(() => {
    return localStorage.getItem('uncleratt_age_verified') === 'true';
  });

  // UI States
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeView, setActiveView] = useState<'home' | 'shop' | 'admin' | 'account' | 'track'>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // RBAC & Administrators State
  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [adminRole, setAdminRole] = useState<AdminRole | null>(() => {
    return (localStorage.getItem('uncleratt_admin_role') as AdminRole) || null;
  });

  // Promotions & Discounts State
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [activePromotion, setActivePromotion] = useState<Promotion | null>(null);
  const [promotionDiscount, setPromotionDiscount] = useState<number>(0);

  // Refresh Admins & Promotions
  const refreshAdmins = async () => {
    try {
      const list = await storeService.getAdmins();
      setAdmins(list);
    } catch (err) {
      console.warn('refreshAdmins error:', err);
    }
  };

  const refreshPromotions = async () => {
    try {
      const list = await storeService.getPromotions();
      setPromotions(list);
    } catch (err) {
      console.warn('refreshPromotions error:', err);
    }
  };

  useEffect(() => {
    refreshAdmins();
    refreshPromotions();
  }, []);

  // Toast System
  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // 1. Listen for Firebase Auth State Changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (user) {
        const hasAdminRole = isUserAdmin(user.email);
        const mappedUser: User = {
          id: user.uid,
          email: user.email || '',
          fullName: user.displayName || user.email?.split('@')[0] || 'Member',
          role: hasAdminRole ? 'admin' : 'customer',
          createdAt: new Date().toISOString(),
        };
        setCurrentUser(mappedUser);
        setIsAdminState(hasAdminRole);
        localStorage.setItem('uncleratt_is_admin', hasAdminRole ? 'true' : 'false');
      } else {
        // If not logged in via Firebase, check if local storage had a session or keep as is
        const localIsAdmin = localStorage.getItem('uncleratt_is_admin') === 'true';
        setIsAdminState(localIsAdmin);
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. Real-time Firestore Listeners (Products, Categories, Settings, Orders)
  useEffect(() => {
    setLoadingProducts(true);

    // Products Listener
    const unsubProducts = onSnapshot(
      collection(db, COLLECTIONS.PRODUCTS),
      (snapshot) => {
        if (!snapshot.empty) {
          const prods: Product[] = [];
          snapshot.forEach((docSnap) => {
            prods.push({ id: docSnap.id, ...(docSnap.data() as any) });
          });
          setProducts(prods);
          setLoadingProducts(false);
        } else {
          // If empty, load initial
          storeService.getProducts().then((p) => {
            setProducts(p);
            setLoadingProducts(false);
          });
        }
      },
      (error) => {
        console.warn('Real-time products listener warning, falling back to local:', error);
        storeService.getProducts().then((p) => {
          setProducts(p);
          setLoadingProducts(false);
        });
      }
    );

    // Categories Listener
    const unsubCategories = onSnapshot(
      collection(db, COLLECTIONS.CATEGORIES),
      (snapshot) => {
        if (!snapshot.empty) {
          const cats: CategoryItem[] = [];
          snapshot.forEach((docSnap) => {
            cats.push({ id: docSnap.id, ...(docSnap.data() as any) });
          });
          cats.sort((a, b) => a.order - b.order);
          setCategories(cats);
        } else {
          storeService.getCategories().then((c) => setCategories(c));
        }
      },
      () => {
        storeService.getCategories().then((c) => setCategories(c));
      }
    );

    // Store Settings Listener (Homepage CMS)
    const unsubSettings = onSnapshot(
      doc(db, COLLECTIONS.SETTINGS, 'store'),
      (snapshot) => {
        if (snapshot.exists()) {
          setSettings(snapshot.data() as StoreSettings);
        } else {
          storeService.getSettings().then((s) => setSettings(s));
        }
      },
      () => {
        storeService.getSettings().then((s) => setSettings(s));
      }
    );

    // Orders Listener
    const unsubOrders = onSnapshot(
      collection(db, COLLECTIONS.ORDERS),
      (snapshot) => {
        if (!snapshot.empty) {
          const ords: Order[] = [];
          snapshot.forEach((docSnap) => {
            ords.push({ id: docSnap.id, ...(docSnap.data() as any) });
          });
          ords.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setOrders(ords);
        } else {
          storeService.getOrders().then((o) => setOrders(o));
        }
      },
      () => {
        storeService.getOrders().then((o) => setOrders(o));
      }
    );

    return () => {
      unsubProducts();
      unsubCategories();
      unsubSettings();
      unsubOrders();
    };
  }, []);

  // Save Cart to LocalStorage
  useEffect(() => {
    localStorage.setItem('uncleratt_cart_v1', JSON.stringify(cart));
  }, [cart]);

  // Save User to LocalStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('uncleratt_user_v1', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('uncleratt_user_v1');
    }
  }, [currentUser]);

  // Products CRUD
  const refreshProducts = async () => {
    setLoadingProducts(true);
    const refreshed = await storeService.getProducts();
    setProducts(refreshed);
    setLoadingProducts(false);
  };

  const addProduct = async (prod: Partial<Product>) => {
    const saved = await storeService.saveProduct(prod);
    setProducts((prev) => [saved, ...prev.filter((p) => p.id !== saved.id)]);
    showToast(`"${saved.name}" added to catalog`, 'success');
    return saved;
  };

  const updateProduct = async (prod: Partial<Product>) => {
    const updated = await storeService.saveProduct(prod);
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    showToast(`"${updated.name}" updated successfully`, 'success');
    return updated;
  };

  const updateStock = async (productId: string, newStock: number) => {
    const success = await storeService.updateStock(productId, newStock);
    if (success) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId
            ? { ...p, stock: Math.max(0, newStock), inStock: newStock > 0 }
            : p
        )
      );
      showToast(`Stock updated to ${newStock} bottles`, 'success');
    }
    return success;
  };

  const updatePrice = async (productId: string, price: number, salePrice?: number) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) throw new Error('Product not found');

    const updated = await storeService.saveProduct({
      ...prod,
      price,
      salePrice,
      onSale: Boolean(salePrice && salePrice < price),
      compareAtPrice: salePrice && salePrice < price ? price : prod.compareAtPrice,
    });

    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    showToast(`Price updated to ${formatKSh(price)}`, 'success');
    return updated;
  };

  const deleteProduct = async (id: string) => {
    const success = await storeService.deleteProduct(id);
    if (success) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showToast('Product removed from catalog', 'info');
    }
    return success;
  };

  // Categories CRUD
  const saveCategory = async (cat: Partial<CategoryItem>) => {
    const saved = await storeService.saveCategory(cat);
    setCategories((prev) => {
      const idx = prev.findIndex((c) => c.id === saved.id);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = saved;
        return next.sort((a, b) => a.order - b.order);
      }
      return [...prev, saved].sort((a, b) => a.order - b.order);
    });
    showToast(`Category "${saved.name}" saved`, 'success');
    return saved;
  };

  const deleteCategory = async (id: string) => {
    const success = await storeService.deleteCategory(id);
    if (success) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      showToast('Category removed', 'info');
    }
    return success;
  };

  // Cart Handlers
  const addToCart = (product: Product, quantity = 1) => {
    if (product.stock <= 0) {
      showToast(`"${product.name}" is currently Out of Stock`, 'error');
      return;
    }

    const existing = cart.find((item) => item.product.id === product.id);
    const currentQty = existing ? existing.quantity : 0;

    if (currentQty + quantity > product.stock) {
      showToast(
        `Only ${product.stock} bottle(s) available in stock. You already have ${currentQty} in cart.`,
        'error'
      );
      return;
    }

    setCart((prev) => {
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });

    showToast(`Added ${quantity}x "${product.name}" to cart`, 'success');
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    showToast('Item removed from cart', 'info');
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const prod = products.find((p) => p.id === productId);
    if (prod && quantity > prod.stock) {
      showToast(`Only ${prod.stock} bottle(s) available in stock`, 'error');
      quantity = prod.stock;
    }

    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  // Orders
  const createOrder = async (
    orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>
  ) => {
    const newOrder = await storeService.createOrder(orderData);
    setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== newOrder.id)]);
    clearCart();
    showToast(`Order ${newOrder.orderNumber} confirmed! Stock updated.`, 'success');
    return newOrder;
  };

  const updateOrderStatus = async (id: string, status: OrderStatus) => {
    const updated = await storeService.updateOrderStatus(id, status);
    if (updated) {
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      showToast(`Order status updated to "${status.replace(/_/g, ' ')}"`, 'info');
    }
    return updated;
  };

  const updatePaymentStatus = async (
    id: string,
    status: PaymentStatus,
    mpesaCode?: string
  ) => {
    const updated = await storeService.updatePaymentStatus(id, status, mpesaCode);
    if (updated) {
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      showToast(`Payment marked as "${status.toUpperCase()}"`, 'success');
    }
    return updated;
  };

  const getOrderById = async (id: string) => {
    const found = orders.find(
      (o) => o.id === id || o.orderNumber.toLowerCase() === id.toLowerCase()
    );
    if (found) return found;
    try {
      const res = await fetch(`/api/orders/${id}`);
      if (res.ok) return await res.json();
    } catch {}
    return null;
  };

  // Auth & Admin Access Handlers
  const bulkUpdateProducts = async (action: string, ids: string[], data?: any) => {
    await storeService.bulkUpdateProducts(action, ids, data);
    await refreshProducts();
    showToast(`Bulk action "${action}" completed for ${ids.length} items.`, 'success');
  };

  const saveAdmin = async (adminData: Partial<AdminAccount>): Promise<AdminAccount> => {
    const res = await storeService.saveAdmin(adminData);
    await refreshAdmins();
    showToast(`Administrator "${res.fullName}" (${res.role}) saved.`, 'success');
    return res;
  };

  const deleteAdmin = async (id: string): Promise<void> => {
    await storeService.deleteAdmin(id);
    await refreshAdmins();
    showToast('Administrator removed.', 'info');
  };

  const savePromotion = async (promoData: Partial<Promotion>): Promise<Promotion> => {
    const res = await storeService.savePromotion(promoData);
    await refreshPromotions();
    showToast(`Promotional code "${res.code}" saved.`, 'success');
    return res;
  };

  const deletePromotion = async (id: string): Promise<void> => {
    await storeService.deletePromotion(id);
    await refreshPromotions();
    showToast('Promotional code removed.', 'info');
  };

  const applyPromotion = async (code: string): Promise<{ success: boolean; message: string }> => {
    const res = await storeService.verifyPromotion(code, cartSubtotal);
    if (res.valid && res.promotion) {
      setActivePromotion(res.promotion);
      setPromotionDiscount(res.discountAmount);
      showToast(res.message, 'success');
      return { success: true, message: res.message };
    }
    showToast(res.message, 'error');
    return { success: false, message: res.message };
  };

  const removePromotion = () => {
    setActivePromotion(null);
    setPromotionDiscount(0);
    showToast('Promotional code removed.', 'info');
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const user = cred.user;
      const adminAuthorized = isUserAdmin(user.email);
      const role: AdminRole = user.email?.toLowerCase() === 'barrackratemo199@gmail.com' ? 'owner' : 'manager';
      const mappedUser: User = {
        id: user.uid,
        email: user.email || '',
        fullName: user.displayName || 'Authorized Admin',
        role: adminAuthorized ? 'admin' : 'customer',
        adminRole: adminAuthorized ? role : undefined,
        createdAt: new Date().toISOString(),
      };
      setCurrentUser(mappedUser);
      setIsAdminState(adminAuthorized);
      if (adminAuthorized) {
        setAdminRole(role);
        localStorage.setItem('uncleratt_admin_role', role);
      }
      localStorage.setItem('uncleratt_is_admin', adminAuthorized ? 'true' : 'false');
      showToast(
        adminAuthorized
          ? `Authenticated as ${role.toUpperCase()} (${user.email})`
          : `Signed in as ${user.displayName || user.email}`,
        'success'
      );
      return true;
    } catch (err: any) {
      console.error('Google Sign In error:', err);
      showToast(err.message || 'Google Sign-In failed', 'error');
      return false;
    }
  };

  const loginWithEmail = async (email: string, password?: string): Promise<boolean> => {
    const trimmed = email.trim().toLowerCase();

    // Check API admin login first
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed, password }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          const admUser: User = {
            id: data.user.id,
            email: data.user.email,
            fullName: data.user.fullName,
            role: 'admin',
            adminRole: data.user.adminRole || 'staff',
            createdAt: new Date().toISOString(),
          };
          setCurrentUser(admUser);
          setIsAdminState(true);
          setAdminRole(data.user.adminRole || 'staff');
          localStorage.setItem('uncleratt_is_admin', 'true');
          localStorage.setItem('uncleratt_admin_role', data.user.adminRole || 'staff');
          showToast(`Welcome ${admUser.fullName} (${(data.user.adminRole || 'staff').toUpperCase()})`, 'success');
          return true;
        }
      }
    } catch {}

    // Check Firebase Auth or built-in master credentials
    try {
      if (password) {
        await signInWithEmailAndPassword(auth, trimmed, password);
        return true;
      }
    } catch {}

    if (
      (trimmed === 'admin@uncleratt.co.ke' && password === 'admin123') ||
      trimmed === 'barrackratemo199@gmail.com'
    ) {
      const role: AdminRole = trimmed === 'barrackratemo199@gmail.com' ? 'owner' : 'manager';
      const adminUser: User = {
        id: 'admin-master',
        email: trimmed,
        fullName: trimmed === 'barrackratemo199@gmail.com' ? 'Barrack Ratemo (Owner)' : 'UNCLE RATT Cellar Master',
        role: 'admin',
        adminRole: role,
        createdAt: new Date().toISOString(),
      };
      setCurrentUser(adminUser);
      setIsAdminState(true);
      setAdminRole(role);
      localStorage.setItem('uncleratt_is_admin', 'true');
      localStorage.setItem('uncleratt_admin_role', role);
      showToast(`Welcome to UNCLE RATT Console (${role.toUpperCase()})`, 'success');
      return true;
    }

    // Standard customer login
    const customerUser: User = {
      id: `usr-${Date.now()}`,
      email: trimmed,
      fullName: trimmed.split('@')[0].replace(/[._]/g, ' '),
      role: 'customer',
      createdAt: new Date().toISOString(),
    };
    setCurrentUser(customerUser);
    setIsAdminState(false);
    setAdminRole(null);
    localStorage.setItem('uncleratt_is_admin', 'false');
    localStorage.removeItem('uncleratt_admin_role');
    showToast(`Welcome back, ${customerUser.fullName}`, 'success');
    return true;
  };

  const loginWithPin = async (pin: string): Promise<boolean> => {
    // 1. Try server verification first
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pin.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          const admUser: User = {
            id: data.user.id,
            email: data.user.email,
            fullName: data.user.fullName,
            role: 'admin',
            adminRole: data.user.adminRole || 'staff',
            createdAt: new Date().toISOString(),
          };
          setCurrentUser(admUser);
          setIsAdminState(true);
          setAdminRole(data.user.adminRole || 'staff');
          localStorage.setItem('uncleratt_is_admin', 'true');
          localStorage.setItem('uncleratt_admin_role', data.user.adminRole || 'staff');
          showToast(`Access granted: ${admUser.fullName} (${(data.user.adminRole || 'staff').toUpperCase()})`, 'success');
          return true;
        }
      }
    } catch {}

    // Fallback checks
    if (pin === '1990') {
      const adminUser: User = {
        id: 'adm-owner-1',
        email: 'barrackratemo199@gmail.com',
        fullName: 'Barrack Ratemo (Store Owner)',
        role: 'admin',
        adminRole: 'owner',
        createdAt: new Date().toISOString(),
      };
      setCurrentUser(adminUser);
      setIsAdminState(true);
      setAdminRole('owner');
      localStorage.setItem('uncleratt_is_admin', 'true');
      localStorage.setItem('uncleratt_admin_role', 'owner');
      showToast('Owner PIN verified. Full Administrative Access granted.', 'success');
      return true;
    }

    if (pin === '2026') {
      const adminUser: User = {
        id: 'adm-manager-1',
        email: 'admin@uncleratt.co.ke',
        fullName: 'Dennis Kiprotich (Store Manager)',
        role: 'admin',
        adminRole: 'manager',
        createdAt: new Date().toISOString(),
      };
      setCurrentUser(adminUser);
      setIsAdminState(true);
      setAdminRole('manager');
      localStorage.setItem('uncleratt_is_admin', 'true');
      localStorage.setItem('uncleratt_admin_role', 'manager');
      showToast('Manager PIN verified. Management Access granted.', 'success');
      return true;
    }

    if (pin === '1234') {
      const adminUser: User = {
        id: 'adm-staff-1',
        email: 'staff@uncleratt.co.ke',
        fullName: 'Mercy Wanjiru (Staff Concierge)',
        role: 'admin',
        adminRole: 'staff',
        createdAt: new Date().toISOString(),
      };
      setCurrentUser(adminUser);
      setIsAdminState(true);
      setAdminRole('staff');
      localStorage.setItem('uncleratt_is_admin', 'true');
      localStorage.setItem('uncleratt_admin_role', 'staff');
      showToast('Staff PIN verified. Order Processing Access granted.', 'success');
      return true;
    }

    showToast('Invalid Executive Access PIN. Please verify credentials.', 'error');
    return false;
  };

  const logoutUser = async () => {
    try {
      await signOut(auth);
    } catch {}

    setCurrentUser(null);
    setIsAdminState(false);
    setAdminRole(null);
    localStorage.removeItem('uncleratt_is_admin');
    localStorage.removeItem('uncleratt_admin_role');
    localStorage.removeItem('uncleratt_user_v1');

    if (activeView === 'admin') {
      setActiveView('home');
    }
    showToast('Signed out of executive console', 'info');
  };

  // Settings (Homepage CMS)
  const updateSettings = async (newSettings: Partial<StoreSettings>) => {
    const updated = await storeService.saveSettings(newSettings);
    setSettings(updated);
    showToast('Store settings & homepage CMS updated live', 'success');
  };

  // Age Verification
  const verifyAge = () => {
    setIsAgeVerified(true);
    localStorage.setItem('uncleratt_age_verified', 'true');
    showToast('Age verified. Welcome to UNCLE RATT.', 'info');
  };

  const isAdmin = isAdminState || isUserAdmin(currentUser?.email) || currentUser?.role === 'admin';

  return (
    <StoreContext.Provider
      value={{
        products,
        loadingProducts,
        addProduct,
        updateProduct,
        updateStock,
        updatePrice,
        deleteProduct,
        refreshProducts,
        bulkUpdateProducts,
        categories,
        saveCategory,
        addCategory: saveCategory,
        updateCategory: saveCategory,
        deleteCategory,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartCount,
        cartSubtotal,
        isCartOpen,
        setIsCartOpen,
        promotions,
        activePromotion,
        promotionDiscount,
        applyPromotion,
        removePromotion,
        savePromotion,
        deletePromotion,
        refreshPromotions,
        orders,
        createOrder,
        updateOrderStatus,
        updatePaymentStatus,
        getOrderById,
        currentUser,
        firebaseUser,
        isAdmin,
        adminRole,
        admins,
        saveAdmin,
        deleteAdmin,
        refreshAdmins,
        loginWithGoogle,
        loginWithEmail,
        loginUser: loginWithEmail,
        registerUser: async (email: string, _password?: string, fullName?: string, phone?: string) => {
          const user: User = {
            id: `usr-${Date.now()}`,
            email: email.trim().toLowerCase(),
            fullName: fullName || email.split('@')[0],
            phone,
            role: 'customer',
            createdAt: new Date().toISOString(),
          };
          setCurrentUser(user);
          localStorage.setItem('uncleratt_user_v1', JSON.stringify(user));
          showToast(`Account created for ${user.fullName}`, 'success');
          return true;
        },
        loginWithPin,
        logoutUser,
        isAuthModalOpen,
        setIsAuthModalOpen,
        settings,
        updateSettings,
        isAgeVerified,
        verifyAge,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        activeView,
        setActiveView,
        selectedProductId,
        setSelectedProductId,
        isCheckoutOpen,
        setIsCheckoutOpen,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = (): StoreContextType => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
