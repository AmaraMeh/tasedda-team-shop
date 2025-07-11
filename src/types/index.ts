
export interface TeamJoinRequest {
  id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  admin_notes: string | null;
  invited_by: string | null;
  profiles: {
    full_name: string;
    email: string;
    phone: string;
  };
}

export interface Prime {
  id: string;
  inviter_id: string;
  invited_id: string;
  amount: number;
  status: 'pending' | 'paid' | 'cancelled';
  created_at: string;
  updated_at: string;
  inviter: {
    full_name: string;
    email: string;
  };
  invited: {
    full_name: string;
    email: string;
  };
}

export interface Shop {
  id: string;
  user_id: string;
  name: string;
  business_name: string;
  slug: string;
  description: string;
  logo_url: string;
  cover_url: string;
  subscription_status: 'active' | 'trial' | 'expired';
  status: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  subscription_end_date: string;
  trial_end_date: string;
  seller_type: 'normal' | 'wholesale' | 'local';
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  image_url: string;
  image: string; // For compatibility
  images?: string[];
  sizes?: string[];
  colors?: string[];
  category: string;
  inStock: boolean;
  is_featured: boolean;
  seller_id?: string;
  seller_type?: 'normal' | 'wholesale' | 'local';
  category_id?: string;
  stock_quantity?: number;
  is_active?: boolean;
  show_price?: boolean;
  created_at?: string;
  updated_at?: string;
  categories?: { name: string };
  sellers?: {
    business_name: string;
    slug: string;
    seller_type: 'normal' | 'wholesale' | 'local';
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  is_active: boolean;
  created_at: string;
}

export interface TeamMember {
  id: string;
  user_id: string;
  promo_code: string;
  rank: number;
  total_sales: number;
  total_commissions: number;
  available_commissions: number;
  pending_commissions: number;
  invited_by: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  profiles: {
    full_name: string;
    email: string;
    phone: string;
  };
}

export interface Seller {
  id: string;
  user_id: string;
  business_name: string;
  slug: string;
  description: string;
  seller_type: 'normal' | 'wholesale' | 'local';
  is_active: boolean;
  monthly_fee: number;
  status: 'pending' | 'active' | 'suspended';
  subscription_status: 'trial' | 'active' | 'expired';
  subscription_expires_at: string;
  created_at: string;
  updated_at: string;
  profiles: {
    full_name: string;
    email: string;
    phone: string;
  };
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  size?: string;
  color?: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string;
  total_amount: number;
  discount_amount?: number;
  promo_code?: string;
  payment_method: 'cash_on_delivery' | 'baridimob';
  payment_status: 'pending' | 'paid' | 'failed';
  order_status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
  shipping_address: {
    full_name: string;
    phone: string;
    address: string;
    city: string;
    wilaya: string;
  };
  shipping_cost?: number;
  delivery_method?: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string;
    email: string;
    phone: string;
  };
}

export interface HomepageContent {
  id: string;
  type: 'contributor' | 'event';
  title: string;
  subtitle?: string;
  content?: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TeamRequest {
  id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  admin_notes: string | null;
  invited_by: string | null;
  profiles: {
    full_name: string;
    email: string;
    phone: string;
  };
}

export interface Commission {
  id: string;
  team_member_id: string;
  order_id?: string;
  amount: number;
  percentage?: number;
  status: 'pending' | 'approved' | 'paid';
  type: 'sale' | 'affiliation_bonus';
  metadata?: any;
  created_at: string;
}
