
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Shield, Users as UsersIcon, Store, Package, TrendingUp, Crown, ShoppingCart, Box, Gift, Banknote, LayoutDashboard, UserPlus, UserCog, RefreshCw } from 'lucide-react';
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

const Admin = () => {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [tab, setTab] = useState('dashboard');
  const navigate = useNavigate();
  const { toast } = useToast();

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
      }
    } catch (error: any) {
      console.error('Error checking admin status:', error);
      navigate('/');
    } finally {
      setDataLoading(false);
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
          <span className="text-2xl font-bold gold-text tracking-wide">Lion Admin</span>
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
        <div className="mt-10 text-xs text-muted-foreground text-center">© Lion by Tasedda 2024</div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-h-screen bg-black/95 px-0 md:px-8 py-8">
        {/* Header section */}
        <div className="flex items-center justify-between mb-8 px-4 md:px-0">
          <h1 className="text-2xl font-bold gold-text tracking-wide flex items-center gap-2">
            {SECTIONS.find(s => s.key === tab)?.icon && (
              <span className="inline-flex items-center justify-center bg-gold/10 rounded-full p-2 mr-2">
                {React.createElement(SECTIONS.find(s => s.key === tab)?.icon!, { className: 'w-6 h-6 text-gold' })}
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
              <h2 className="text-xl font-bold mb-4">Managers</h2>
              <p className="text-muted-foreground">Section managers en cours de développement</p>
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
