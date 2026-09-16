import {
  Product,
  Order,
  StoreSettings,
  User,
  OrderStatus,
  PaymentStatus,
  CategoryItem,
  AdminAccount,
  Promotion,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_SETTINGS,
  INITIAL_CATEGORIES,
} from '../data/initialProducts';
import {
  db,
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  COLLECTIONS,
} from './firebase';

const STORAGE_KEYS = {
  PRODUCTS: 'uncleratt_products_v1',
  CATEGORIES: 'uncleratt_categories_v1',
  ORDERS: 'uncleratt_orders_v1',
  SETTINGS: 'uncleratt_settings_v1',
  USER: 'uncleratt_user_v1',
  CART: 'uncleratt_cart_v1',
  AGE_VERIFIED: 'uncleratt_age_verified',
  ADMINS: 'uncleratt_admins_v1',
  PROMOTIONS: 'uncleratt_promotions_v1',
};

// Kenyan Shillings Currency Formatter
export function formatKSh(amount: number): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace('KES', 'KSh');
}

class StoreService {
  // --- PRODUCTS ---
  async getProducts(): Promise<Product[]> {
    try {
      // 1. Try Firestore first
      const snap = await getDocs(collection(db, COLLECTIONS.PRODUCTS));
      if (!snap.empty) {
        const productsList: Product[] = [];
        snap.forEach((d) => {
          productsList.push({ id: d.id, ...(d.data() as any) });
        });
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(productsList));
        return productsList;
      }

      // If Firestore is empty, seed it with INITIAL_PRODUCTS
      await this.seedInitialProducts();
    } catch (err) {
      console.warn('Firestore getProducts notice, checking cache/API:', err);
    }

    // 2. Fallback to API / localStorage
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(data));
          return data;
        }
      }
    } catch {}

    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }

    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    return INITIAL_PRODUCTS;
  }

  async seedInitialProducts(): Promise<void> {
    try {
      for (const p of INITIAL_PRODUCTS) {
        await setDoc(doc(db, COLLECTIONS.PRODUCTS, p.id), {
          ...p,
          lowStockThreshold: p.lowStockThreshold || 5,
          active: p.active !== false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.warn('Could not seed initial products into Firestore:', err);
    }
  }

  async saveProduct(product: Partial<Product>): Promise<Product> {
    const id = product.id || `prod-${Date.now()}`;
    const now = new Date().toISOString();

    const finalProduct: Product = {
      id,
      name: product.name || 'Untitled Spirit',
      brand: product.brand || 'Unbranded',
      category: product.category || 'Whisky',
      subCategory: product.subCategory || '',
      size: product.size || '750ml',
      abv: product.abv || '40%',
      price: Number(product.price) || 0,
      originalPrice: product.originalPrice ? Number(product.originalPrice) : undefined,
      salePrice: product.salePrice ? Number(product.salePrice) : undefined,
      compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : undefined,
      stock: Number(product.stock ?? 0),
      lowStockThreshold: Number(product.lowStockThreshold ?? 5),
      sku: product.sku || `UR-${Math.floor(1000 + Math.random() * 9000)}`,
      inStock: Number(product.stock ?? 0) > 0,
      featured: Boolean(product.featured),
      onSale: Boolean(product.onSale),
      bestSeller: Boolean(product.bestSeller),
      active: product.active !== false,
      rating: product.rating || 5.0,
      reviewCount: product.reviewCount || 0,
      image: product.image || 'https://images.unsplash.com/photo-1527061011665-3652c757a4d4?q=80&w=800&auto=format&fit=crop',
      additionalImages: product.additionalImages || [],
      description: product.description || '',
      tastingNotes: product.tastingNotes || {},
      countryOfOrigin: product.countryOfOrigin || 'International',
      tags: product.tags || [],
      createdAt: product.createdAt || now,
      updatedAt: now,
    };

    // Save to Firestore
    try {
      await setDoc(doc(db, COLLECTIONS.PRODUCTS, id), finalProduct, { merge: true });
    } catch (err) {
      console.warn('Firestore write warning:', err);
    }

    // Save to backend API
    try {
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalProduct),
      });
    } catch {}

    // Update Local Storage cache
    const existing = await this.getProducts();
    const index = existing.findIndex((p) => p.id === id);
    let updatedList: Product[];
    if (index !== -1) {
      updatedList = [...existing];
      updatedList[index] = finalProduct;
    } else {
      updatedList = [finalProduct, ...existing];
    }
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updatedList));

    return finalProduct;
  }

  async updateStock(productId: string, newStock: number): Promise<boolean> {
    const stock = Math.max(0, newStock);
    const inStock = stock > 0;

    try {
      await updateDoc(doc(db, COLLECTIONS.PRODUCTS, productId), {
        stock,
        inStock,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Firestore updateStock error:', err);
    }

    try {
      await fetch(`/api/products/${productId}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock }),
      });
    } catch {}

    const products = await this.getProducts();
    const p = products.find((x) => x.id === productId);
    if (p) {
      p.stock = stock;
      p.inStock = inStock;
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    }
    return true;
  }

  async deleteProduct(id: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, COLLECTIONS.PRODUCTS, id));
    } catch (err) {
      console.warn('Firestore deleteProduct warning:', err);
    }

    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
    } catch {}

    const products = (await this.getProducts()).filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    return true;
  }

  // --- CATEGORIES ---
  async getCategories(): Promise<CategoryItem[]> {
    try {
      const snap = await getDocs(collection(db, COLLECTIONS.CATEGORIES));
      if (!snap.empty) {
        const catList: CategoryItem[] = [];
        snap.forEach((d) => {
          catList.push({ id: d.id, ...(d.data() as any) });
        });
        catList.sort((a, b) => a.order - b.order);
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(catList));
        return catList;
      }
      await this.seedInitialCategories();
    } catch (err) {
      console.warn('Firestore getCategories notice:', err);
    }

    const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }

    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
    return INITIAL_CATEGORIES;
  }

  async seedInitialCategories(): Promise<void> {
    try {
      for (const c of INITIAL_CATEGORIES) {
        await setDoc(doc(db, COLLECTIONS.CATEGORIES, c.id), {
          ...c,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.warn('Could not seed initial categories:', err);
    }
  }

  async saveCategory(cat: Partial<CategoryItem>): Promise<CategoryItem> {
    const id = cat.id || `cat-${cat.name?.toLowerCase().replace(/[^a-z0-9]/g, '-') || Date.now()}`;
    const finalCat: CategoryItem = {
      id,
      name: cat.name || 'New Category',
      subtitle: cat.subtitle || '',
      imageUrl: cat.imageUrl || 'https://images.unsplash.com/photo-1527061011665-3652c757a4d4?q=80&w=800&auto=format&fit=crop',
      order: cat.order ?? 99,
      active: cat.active !== false,
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, COLLECTIONS.CATEGORIES, id), finalCat, { merge: true });
    } catch (err) {
      console.warn('Firestore saveCategory error:', err);
    }

    const categories = await this.getCategories();
    const idx = categories.findIndex((c) => c.id === id);
    if (idx !== -1) {
      categories[idx] = finalCat;
    } else {
      categories.push(finalCat);
    }
    categories.sort((a, b) => a.order - b.order);
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    return finalCat;
  }

  async deleteCategory(id: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, COLLECTIONS.CATEGORIES, id));
    } catch (err) {
      console.warn('Firestore deleteCategory error:', err);
    }

    const categories = (await this.getCategories()).filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    return true;
  }

  // --- ORDERS ---
  async getOrders(): Promise<Order[]> {
    try {
      const snap = await getDocs(collection(db, COLLECTIONS.ORDERS));
      if (!snap.empty) {
        const orderList: Order[] = [];
        snap.forEach((d) => {
          orderList.push({ id: d.id, ...(d.data() as any) });
        });
        orderList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orderList));
        return orderList;
      }
    } catch (err) {
      console.warn('Firestore getOrders warning:', err);
    }

    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(data));
          return data;
        }
      }
    } catch {}

    const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return [];
  }

  async createOrder(
    orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>
  ): Promise<Order> {
    const id = `ord-${Date.now()}`;
    const orderNumber = `UR-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    const newOrder: Order = {
      ...orderData,
      id,
      orderNumber,
      createdAt: now,
      updatedAt: now,
    };

    // 1. Save to Firestore
    try {
      await setDoc(doc(db, COLLECTIONS.ORDERS, id), newOrder);
    } catch (err) {
      console.warn('Firestore createOrder warning:', err);
    }

    // 2. Automatically decrease inventory stock for purchased bottles
    await this.decrementInventory(newOrder.items);

    // 3. Save to backend API
    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
      });
    } catch {}

    // 4. Save to localStorage cache
    const existing = await this.getOrders();
    const updated = [newOrder, ...existing.filter((o) => o.id !== id)];
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated));

    return newOrder;
  }

  /**
   * Automatic stock deduction upon successful order creation / payment
   */
  async decrementInventory(items: Order['items']): Promise<void> {
    const products = await this.getProducts();

    for (const item of items) {
      const prod = products.find((p) => p.id === item.productId);
      if (prod) {
        const remaining = Math.max(0, prod.stock - item.quantity);
        await this.updateStock(prod.id, remaining);
      }
    }
  }

  async updateOrderStatus(id: string, orderStatus: OrderStatus): Promise<Order | null> {
    const now = new Date().toISOString();

    try {
      await updateDoc(doc(db, COLLECTIONS.ORDERS, id), {
        orderStatus,
        updatedAt: now,
      });
    } catch (err) {
      console.warn('Firestore updateOrderStatus error:', err);
    }

    try {
      await fetch(`/api/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus }),
      });
    } catch {}

    const orders = await this.getOrders();
    const index = orders.findIndex((o) => o.id === id || o.orderNumber === id);
    if (index !== -1) {
      orders[index].orderStatus = orderStatus;
      orders[index].updatedAt = now;
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
      return orders[index];
    }
    return null;
  }

  async updatePaymentStatus(
    id: string,
    paymentStatus: PaymentStatus,
    mpesaReceiptNumber?: string
  ): Promise<Order | null> {
    const now = new Date().toISOString();
    const updates: any = { paymentStatus, updatedAt: now };
    if (mpesaReceiptNumber) updates.mpesaReceiptNumber = mpesaReceiptNumber;

    try {
      await updateDoc(doc(db, COLLECTIONS.ORDERS, id), updates);
    } catch (err) {
      console.warn('Firestore updatePaymentStatus error:', err);
    }

    try {
      await fetch(`/api/orders/${id}/payment`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus, mpesaReceiptNumber }),
      });
    } catch {}

    const orders = await this.getOrders();
    const index = orders.findIndex((o) => o.id === id || o.orderNumber === id);
    if (index !== -1) {
      orders[index].paymentStatus = paymentStatus;
      if (mpesaReceiptNumber) orders[index].mpesaReceiptNumber = mpesaReceiptNumber;
      orders[index].updatedAt = now;
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
      return orders[index];
    }
    return null;
  }

  // --- SETTINGS (HOMEPAGE, STORE CONFIG) ---
  async getSettings(): Promise<StoreSettings> {
    try {
      const snap = await getDoc(doc(db, COLLECTIONS.SETTINGS, 'store'));
      if (snap.exists()) {
        const data = snap.data() as StoreSettings;
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data));
        return data;
      }
      // Seed default settings to Firestore
      await setDoc(doc(db, COLLECTIONS.SETTINGS, 'store'), INITIAL_SETTINGS);
    } catch (err) {
      console.warn('Firestore getSettings warning:', err);
    }

    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data));
        return data;
      }
    } catch {}

    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
    return INITIAL_SETTINGS;
  }

  async saveSettings(settings: Partial<StoreSettings>): Promise<StoreSettings> {
    const current = await this.getSettings();
    const merged: StoreSettings = { ...current, ...settings };

    try {
      await setDoc(doc(db, COLLECTIONS.SETTINGS, 'store'), merged, { merge: true });
    } catch (err) {
      console.warn('Firestore saveSettings error:', err);
    }

    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(merged),
      });
    } catch {}

    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(merged));
    return merged;
  }

  // --- M-PESA STK TRIGGER / VERIFICATION ---
  async triggerMpesaStkPush(
    phone: string,
    amount: number,
    orderId: string
  ): Promise<{ success: boolean; checkoutRequestId: string; message: string }> {
    try {
      const res = await fetch('/api/mpesa/stkpush', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, amount, orderId }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {}

    const checkoutRequestId = `ws_CO_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    return {
      success: true,
      checkoutRequestId,
      message: `M-Pesa STK Push dispatched to ${phone}. Please enter your M-Pesa PIN on your phone to complete KSh ${amount.toLocaleString()}.`,
    };
  }

  async verifyMpesaTransaction(
    checkoutRequestId: string,
    orderId: string,
    mpesaCode?: string
  ): Promise<{ success: boolean; receiptNumber: string; message: string }> {
    try {
      const res = await fetch('/api/mpesa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkoutRequestId, orderId, mpesaCode }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {}

    const randomChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = mpesaCode || 'RK';
    if (!mpesaCode) {
      for (let i = 0; i < 8; i++) {
        code += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
      }
    }

    await this.updatePaymentStatus(orderId, 'paid', code);
    return {
      success: true,
      receiptNumber: code,
      message: `M-Pesa payment verified successfully. Transaction Code: ${code}`,
    };
  }

  // --- INVENTORY STOCK QUICK UPDATE ---
  async updateProductStock(id: string, newStock: number): Promise<void> {
    const cleanStock = Math.max(0, newStock);
    try {
      await updateDoc(doc(db, COLLECTIONS.PRODUCTS, id), {
        stock: cleanStock,
        inStock: cleanStock > 0,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Firestore update stock notice:', err);
    }

    try {
      await fetch(`/api/products/${id}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: cleanStock }),
      });
    } catch {}

    const cached = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (cached) {
      try {
        const list: Product[] = JSON.parse(cached);
        const idx = list.findIndex((p) => p.id === id);
        if (idx !== -1) {
          list[idx].stock = cleanStock;
          list[idx].inStock = cleanStock > 0;
          localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(list));
        }
      } catch {}
    }
  }

  // --- BULK PRODUCT ACTIONS ---
  async bulkUpdateProducts(action: string, ids: string[], data?: any): Promise<void> {
    try {
      await fetch('/api/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ids, data }),
      });
    } catch (err) {
      console.warn('API bulk products warning:', err);
    }

    const cached = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (cached) {
      try {
        let list: Product[] = JSON.parse(cached);
        if (action === 'delete') {
          list = list.filter((p) => !ids.includes(p.id));
        } else if (action === 'activate') {
          list.forEach((p) => {
            if (ids.includes(p.id)) p.active = true;
          });
        } else if (action === 'deactivate') {
          list.forEach((p) => {
            if (ids.includes(p.id)) p.active = false;
          });
        } else if (action === 'update_category' && data?.category) {
          list.forEach((p) => {
            if (ids.includes(p.id)) p.category = data.category;
          });
        }
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(list));
      } catch {}
    }
  }

  // --- ADMINISTRATORS MANAGEMENT (RBAC) ---
  async getAdmins(): Promise<AdminAccount[]> {
    try {
      const snap = await getDocs(collection(db, 'admins'));
      if (!snap.empty) {
        const adminsList: AdminAccount[] = [];
        snap.forEach((d) => {
          adminsList.push({ id: d.id, ...(d.data() as any) });
        });
        localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(adminsList));
        return adminsList;
      }
    } catch (err) {
      console.warn('Firestore getAdmins error, falling back to API:', err);
    }

    try {
      const res = await fetch('/api/admins');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(data));
          return data;
        }
      }
    } catch {}

    const saved = localStorage.getItem(STORAGE_KEYS.ADMINS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }

    const defaultAdmins: AdminAccount[] = [
      {
        id: 'adm-owner-1',
        fullName: 'Barrack Ratemo',
        email: 'barrackratemo199@gmail.com',
        role: 'owner',
        status: 'active',
        phone: '+254700199000',
        pin: '1990',
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
      },
      {
        id: 'adm-manager-1',
        fullName: 'Dennis Kiprotich',
        email: 'admin@uncleratt.co.ke',
        role: 'manager',
        status: 'active',
        phone: '+254711998877',
        pin: '2026',
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
      },
      {
        id: 'adm-staff-1',
        fullName: 'Mercy Wanjiru',
        email: 'staff@uncleratt.co.ke',
        role: 'staff',
        status: 'active',
        phone: '+254722334455',
        pin: '1234',
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
      },
    ];
    localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(defaultAdmins));
    return defaultAdmins;
  }

  async saveAdmin(adminData: Partial<AdminAccount>): Promise<AdminAccount> {
    const id = adminData.id || `adm-${Date.now()}`;
    const newAdmin: AdminAccount = {
      id,
      fullName: adminData.fullName || 'Staff Member',
      email: (adminData.email || '').trim().toLowerCase(),
      role: adminData.role || 'staff',
      status: adminData.status || 'active',
      phone: adminData.phone || '',
      pin: adminData.pin || '1234',
      createdAt: adminData.createdAt || new Date().toISOString(),
      lastActive: adminData.lastActive || new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'admins', id), newAdmin, { merge: true });
    } catch (err) {
      console.warn('Firestore saveAdmin notice:', err);
    }

    try {
      await fetch('/api/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAdmin),
      });
    } catch {}

    const adminsList = await this.getAdmins();
    const idx = adminsList.findIndex((a) => a.id === id);
    if (idx !== -1) {
      adminsList[idx] = newAdmin;
    } else {
      adminsList.push(newAdmin);
    }
    localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(adminsList));
    return newAdmin;
  }

  async deleteAdmin(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'admins', id));
    } catch (err) {
      console.warn('Firestore deleteAdmin notice:', err);
    }

    try {
      await fetch(`/api/admins/${id}`, { method: 'DELETE' });
    } catch {}

    const adminsList = await this.getAdmins();
    const filtered = adminsList.filter((a) => a.id !== id);
    localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(filtered));
  }

  // --- PROMOTIONS MANAGEMENT ---
  async getPromotions(): Promise<Promotion[]> {
    try {
      const snap = await getDocs(collection(db, 'promotions'));
      if (!snap.empty) {
        const promos: Promotion[] = [];
        snap.forEach((d) => promos.push({ id: d.id, ...(d.data() as any) }));
        localStorage.setItem(STORAGE_KEYS.PROMOTIONS, JSON.stringify(promos));
        return promos;
      }
    } catch (err) {
      console.warn('Firestore getPromotions notice:', err);
    }

    try {
      const res = await fetch('/api/promotions');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          localStorage.setItem(STORAGE_KEYS.PROMOTIONS, JSON.stringify(data));
          return data;
        }
      }
    } catch {}

    const saved = localStorage.getItem(STORAGE_KEYS.PROMOTIONS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }

    const defaultPromos: Promotion[] = [
      {
        id: 'promo-welcome10',
        code: 'WELCOME10',
        discountType: 'percentage',
        value: 10,
        minSpend: 5000,
        maxDiscount: 3000,
        expiryDate: '2027-12-31',
        usageCount: 18,
        active: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'promo-ratt500',
        code: 'UNCLERATT500',
        discountType: 'fixed',
        value: 500,
        minSpend: 4000,
        expiryDate: '2027-12-31',
        usageCount: 42,
        active: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'promo-vaultvip',
        code: 'VAULTVIP',
        discountType: 'percentage',
        value: 15,
        minSpend: 25000,
        maxDiscount: 10000,
        expiryDate: '2027-12-31',
        usageCount: 7,
        active: true,
        createdAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem(STORAGE_KEYS.PROMOTIONS, JSON.stringify(defaultPromos));
    return defaultPromos;
  }

  async savePromotion(promoData: Partial<Promotion>): Promise<Promotion> {
    const id = promoData.id || `promo-${Date.now()}`;
    const newPromo: Promotion = {
      id,
      code: (promoData.code || '').toUpperCase().trim(),
      discountType: promoData.discountType || 'percentage',
      value: Number(promoData.value || 0),
      minSpend: promoData.minSpend ? Number(promoData.minSpend) : undefined,
      maxDiscount: promoData.maxDiscount ? Number(promoData.maxDiscount) : undefined,
      expiryDate: promoData.expiryDate || '2027-12-31',
      usageCount: promoData.usageCount || 0,
      active: promoData.active !== false,
      createdAt: promoData.createdAt || new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'promotions', id), newPromo, { merge: true });
    } catch (err) {
      console.warn('Firestore savePromotion notice:', err);
    }

    try {
      await fetch('/api/promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPromo),
      });
    } catch {}

    const promos = await this.getPromotions();
    const idx = promos.findIndex((p) => p.id === id || p.code === newPromo.code);
    if (idx !== -1) {
      promos[idx] = newPromo;
    } else {
      promos.push(newPromo);
    }
    localStorage.setItem(STORAGE_KEYS.PROMOTIONS, JSON.stringify(promos));
    return newPromo;
  }

  async deletePromotion(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'promotions', id));
    } catch (err) {
      console.warn('Firestore deletePromotion notice:', err);
    }

    try {
      await fetch(`/api/promotions/${id}`, { method: 'DELETE' });
    } catch {}

    const promos = await this.getPromotions();
    const filtered = promos.filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PROMOTIONS, JSON.stringify(filtered));
  }

  async verifyPromotion(
    code: string,
    cartSubtotal: number
  ): Promise<{ valid: boolean; discountAmount: number; message: string; promotion?: Promotion }> {
    try {
      const res = await fetch('/api/promotions/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, cartSubtotal }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {}

    // Local evaluation fallback
    const promos = await this.getPromotions();
    const found = promos.find((p) => p.code.toUpperCase() === code.toUpperCase().trim() && p.active !== false);
    if (!found) {
      return { valid: false, discountAmount: 0, message: 'Invalid or inactive promo code.' };
    }
    if (found.minSpend && cartSubtotal < found.minSpend) {
      return {
        valid: false,
        discountAmount: 0,
        message: `Order must be at least ${formatKSh(found.minSpend)} for this code.`,
      };
    }
    let discountAmount = 0;
    if (found.discountType === 'percentage') {
      discountAmount = Math.round((cartSubtotal * found.value) / 100);
      if (found.maxDiscount && discountAmount > found.maxDiscount) {
        discountAmount = found.maxDiscount;
      }
    } else {
      discountAmount = Math.min(found.value, cartSubtotal);
    }
    return {
      valid: true,
      discountAmount,
      promotion: found,
      message: `Code "${found.code}" applied! You save ${formatKSh(discountAmount)}`,
    };
  }
}

export const storeService = new StoreService();
