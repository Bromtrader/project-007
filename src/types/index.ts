export type Category =
  | 'All'
  | 'Whisky'
  | 'Vodka'
  | 'Gin'
  | 'Rum'
  | 'Brandy'
  | 'Cognac'
  | 'Tequila'
  | 'Wine'
  | 'Champagne'
  | 'Beer'
  | 'Liqueurs'
  | 'Mixers'
  | 'Gift Sets'
  | string;

export interface CategoryItem {
  id: string;
  name: string;
  subtitle?: string;
  imageUrl?: string;
  order: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TastingNotes {
  nose?: string;
  palate?: string;
  finish?: string;
  pairings?: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: Category;
  subCategory?: string;
  size: string; // e.g. "750ml", "1L", "6x330ml"
  abv: string; // e.g. "40%", "12.5%"
  price: number; // in KSh (active selling price)
  originalPrice?: number; // regular / MSRP price
  salePrice?: number; // if on sale
  compareAtPrice?: number; // legacy alias
  stock: number;
  lowStockThreshold?: number;
  sku?: string;
  inStock: boolean;
  featured: boolean;
  onSale: boolean;
  bestSeller?: boolean;
  active?: boolean; // toggle visibility on storefront
  rating: number;
  reviewCount: number;
  image: string;
  additionalImages?: string[];
  description: string;
  tastingNotes?: TastingNotes;
  countryOfOrigin: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod = 'mpesa' | 'cod' | 'card';
export type PaymentStatus = 'pending' | 'paid' | 'failed';

export interface OrderCustomer {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  county: string;
  zone: string;
  orderNotes?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  brand: string;
  size: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. "UR-8492"
  customer: OrderCustomer;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount?: number;
  promoCode?: string;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  deliveryMethod: 'express' | 'standard' | 'pickup';
  mpesaReceiptNumber?: string;
  createdAt: string;
  updatedAt: string;
  driverNotes?: string;
}

export type AdminRole = 'owner' | 'manager' | 'staff';

export interface AdminAccount {
  id: string;
  fullName: string;
  email: string;
  role: AdminRole;
  status: 'active' | 'inactive';
  phone?: string;
  createdAt: string;
  lastActive?: string;
  pin?: string;
}

export interface Promotion {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number; // e.g. 10 for 10%, or 500 for KSh 500
  discountValue?: number; // convenience alias
  minSpend?: number;
  maxDiscount?: number;
  expiryDate?: string;
  expiresAt?: string; // convenience alias
  usageCount: number;
  usageLimit?: number;
  active: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: 'customer' | 'admin';
  adminRole?: AdminRole;
  createdAt: string;
  savedAddresses?: Array<{
    title: string;
    address: string;
    county: string;
    zone: string;
  }>;
}

export interface DeliveryZone {
  id: string;
  name: string;
  county: string;
  fee: number;
  estimatedTime: string;
}

export interface StoreSettings {
  storeName: string;
  heroHeading: string;
  heroSubheading: string;
  heroTagline: string;
  heroImageUrl: string;
  announcementBar: string;
  activeNotice?: string;
  whatsappNumber: string;
  supportPhone: string;
  supportEmail: string;
  deliveryFeeNairobiExpress: number;
  deliveryFeeNairobiStandard: number;
  deliveryFeeUpcountry: number;
  freeDeliveryThreshold: number;
  enableCod: boolean;
  enableMpesa: boolean;
  isStoreOpen: boolean;
  minimumOrder: number;
  storeAddress: string;
  operatingHours: string;
  mpesaPaybill: string;
  mpesaTill: string;
  firebaseConfigured: boolean;
}

export interface FilterOptions {
  category: Category;
  minPrice: number;
  maxPrice: number;
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'name-asc' | 'rating';
  inStockOnly: boolean;
  saleOnly: boolean;
  featuredOnly: boolean;
  searchQuery: string;
}
