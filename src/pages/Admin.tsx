import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Shield, Users as UsersIcon, Store, Package, TrendingUp, Eye, CheckCircle, XCircle, Check, X, Crown, ShoppingBag, DollarSign, AlertCircle, RefreshCw, LayoutDashboard, UserPlus, UserCog, ShoppingCart, Box, Gift, Banknote } from 'lucide-react';
import type { User as AuthUser } from '@supabase/supabase-js';
import { useAuth } from '@/contexts/AuthContext';
import Dashboard from './admin/Dashboard';
import TeamRequests from './admin/TeamRequests';
import TeamMembers from './admin/TeamMembers';
import Sellers from './admin/Sellers';
import Orders from './admin/Orders';
import Products from './admin/Products';
import Withdrawals from './admin/Withdrawals';
import Primes from './admin/Primes';
import Users from './admin/Users';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import React from 'react';

const SECTIONS = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'team-requests', label: 'Demandes Team', icon: UserPlus },
  { key: 'team-members', label: 'Membres Team', icon: UsersIcon },
  { key: 'sellers', label: 'Boutiques', icon: Store },
  { key: 'managers', label: 'Managers', icon: UserCog },
  { key: 'users', label: 'Utilisateurs', icon: Shield },
  { key: 'orders', label: 'Commandes', icon: ShoppingCart },
  { key: 'products', label: 'Produits', icon: Box },
  { key: 'primes', label: 'Primes', icon: Gift },
  { key: 'withdrawals', label: 'Retraits', icon: Banknote },
];

const ADMIN_PASSWORD = 'AdminTasedda20252025';

interface TeamJoinRequest {
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

const Admin = () => {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTeamMembers: 0,
    totalSellers: 0,
    totalProducts: 0,
    totalOrders: 0
  });
  const [users, setUsers] = useState([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [sellers, setSellers] = useState([]);
  const [joinRequests, setJoinRequests] = useState<TeamJoinRequest[]>([]);
  const [tab, setTab] = useState('dashboard');
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedRequest, setSelectedRequest] = useState<TeamJoinRequest | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }
    if (user) {
      checkAdminStatus(user.id);
    }
  }, [user, loading, navigate]);

  const checkAdminStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', userId)
        .single();

      if (error) throw error;
      if (!data?.is_admin) {
        navigate('/');
      } else {
        setIsAdmin(true);
        loadDashboardData();
        loadTeamData();
        loadJoinRequests();
      }
    } catch (error: any) {
      console.error('Error checking admin status:', error);
      navigate('/');
    }
  };

  const loadDashboardData = async () => {
    setDataLoading(true);
    try {
      // Charger les statistiques
      const [profilesRes, teamRes, sellersRes, productsRes, ordersRes] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('team_members').select('*'),
        supabase.from('sellers').select('*'),
        supabase.from('products').select('*'),
        supabase.from('orders').select('*')
      ]);

      setStats({
        totalUsers: profilesRes.data?.length || 0,
        totalTeamMembers: teamRes.data?.length || 0,
        totalSellers: sellersRes.data?.length || 0,
        totalProducts: productsRes.data?.length || 0,
        totalOrders: ordersRes.data?.length || 0
      });

      setUsers(profilesRes.data || []);
      setTeamMembers(teamRes.data || []);
      setSellers(sellersRes.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const loadTeamData = async () => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTeamMembers(data || []);
    } catch (error: any) {
      console.error('Error loading team data:', error);
    }
  };

  const loadJoinRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('team_join_requests')
        .select(`
          *,
          profiles:profiles!team_join_requests_user_id_fkey (
            full_name,
            email,
            phone
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJoinRequests(data || []);
    } catch (error: any) {
      console.error('Error loading join requests:', error);
    }
  };

  const generateLionPromoCode = () => {
    const random = Math.floor(1000 + Math.random() * 9000);
    return `LION${random}`;
  };

  const handleJoinRequest = async (requestId: string, status: 'approved' | 'rejected') => {
    try {
      const request = joinRequests.find(r => r.id === requestId);
      if (!request) return;

      if (status === 'approved') {
        // Générer un code promo unique LIONxxxx
        let promoCode;
        let exists = true;
        while (exists) {
          promoCode = generateLionPromoCode();
          const { data: existing } = await supabase.from('team_members').select('id').eq('promo_code', promoCode).single();
          exists = !!existing;
        }
        // Créer le membre d'équipe
        const { error: memberError } = await supabase
          .from('team_members')
          .insert({
            user_id: request.user_id,
            promo_code: promoCode,
            invited_by: request.invited_by,
            rank: 1,
            total_sales: 0,
            total_commissions: 0,
            available_commissions: 0,
            is_active: true
          });
        if (memberError) throw memberError;
      }

      // Mettre à jour le statut de la demande
      const { error } = await supabase
        .from('team_join_requests')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: status === 'approved' ? "Demande approuvée" : "Demande rejetée",
        description: status === 'approved' 
          ? "Le nouveau membre a été ajouté à l'équipe."
          : "La demande a été rejetée.",
      });

      await loadJoinRequests();
      await loadTeamData();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading || dataLoading || !isAdmin) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gold"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-black">
      {/* Sidebar */}
      <aside className="w-64 min-h-screen bg-gradient-to-b from-black via-black to-gold/10 border-r border-gold/20 shadow-lg flex flex-col py-6 px-4 sticky top-0 z-20">
        <div className="flex items-center gap-3 mb-10 px-2">
          <Crown className="w-8 h-8 text-gold" />
          <span className="text-2xl font-bold gold-text tracking-wide">Tasedda Admin</span>
        </div>
        <nav className="flex-1 space-y-2">
          {SECTIONS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-left hover:bg-gold/10 hover:text-gold ${tab === key ? 'bg-gold/20 text-gold shadow' : 'text-white/80'}`}
              onClick={() => setTab(key)}
            >
              <Icon className="w-5 h-5" />
              {label}
            </button>
          ))}
        </nav>
        <div className="mt-10 text-xs text-muted-foreground text-center">© Tasedda 2024</div>
      </aside>
      {/* Main content */}
      <main className="flex-1 min-h-screen bg-black/95 px-0 md:px-8 py-8">
        {/* Header section */}
        <div className="flex items-center justify-between mb-8 px-4 md:px-0">
          <h1 className="text-2xl font-bold gold-text tracking-wide flex items-center gap-2">
            {SECTIONS.find(s => s.key === tab)?.icon && (
              <span className="inline-flex items-center justify-center bg-gold/10 rounded-full p-2 mr-2">
                {React.createElement(SECTIONS.find(s => s.key === tab)?.icon, { className: 'w-6 h-6 text-gold' })}
              </span>
            )}
            {SECTIONS.find(s => s.key === tab)?.label}
          </h1>
          <Button variant="outline" className="border-gold/40 text-gold hover:bg-gold/10" onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 mr-2" /> Rafraîchir
          </Button>
        </div>
        <div className="rounded-xl bg-black/80 shadow-lg p-4 md:p-8 min-h-[60vh]">
          {tab === 'dashboard' && <Dashboard />}
          {tab === 'team-requests' && <TeamRequests />}
          {tab === 'team-members' && <TeamMembers />}
          {tab === 'sellers' && <Sellers />}
          {tab === 'managers' && (
            <div>
              {/* Section managers à intégrer ici */}
              <h2 className="text-xl font-bold mb-4">Managers</h2>
              {/* ... */}
            </div>
          )}
          {tab === 'users' && <Users />}
          {tab === 'orders' && <Orders />}
          {tab === 'products' && <Products />}
          {tab === 'primes' && <Primes />}
          {tab === 'withdrawals' && <Withdrawals />}
        </div>
      </main>
    </div>
  );
};

export default Admin;
