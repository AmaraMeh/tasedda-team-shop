
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
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  image_url: string;
  images?: string[];
  sizes?: string[];
  colors?: string[];
  category: string;
  inStock: boolean;
  is_featured: boolean;
  seller_id?: string;
  category_id?: string;
}
