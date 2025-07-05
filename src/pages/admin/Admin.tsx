import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Package, ShoppingCart, TrendingUp, Settings, MessageSquare, Home } from 'lucide-react';

const Admin = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalSellers: 0,
    totalTeamMembers: 0
  });
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }
    if (user) {
      checkAdminStatus(user.id);
      fetchStats();
    }
  }, [user, loading, navigate]);

  const checkAdminStatus = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', userId)
        .single();
      
      if (!data?.is_admin) {
        navigate('/');
        return;
      }
      setIsAdmin(true);
    } catch (error) {
      console.error('Error checking admin status:', error);
      navigate('/');
    }
  };

  const fetchStats = async () => {
    try {
      const [usersRes, productsRes, ordersRes, sellersRes, teamRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('products').select('id', { count: 'exact' }),
        supabase.from('orders').select('id', { count: 'exact' }),
        supabase.from('sellers').select('id', { count: 'exact' }),
        supabase.from('team_members').select('id', { count: 'exact' })
      ]);

      setStats({
        totalUsers: usersRes.count || 0,
        totalProducts: productsRes.count || 0,
        totalOrders: ordersRes.count || 0,
        totalSellers: sellersRes.count || 0,
        totalTeamMembers: teamRes.count || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gold"></div>
      </div>
    );
  }

  const adminMenuItems = [
    { title: 'Utilisateurs', icon: Users, path: '/admin/users', description: 'Gérer les utilisateurs' },
    { title: 'Produits', icon: Package, path: '/admin/products', description: 'Gérer les produits' },
    { title: 'Commandes', icon: ShoppingCart, path: '/admin/orders', description: 'Gérer les commandes' },
    { title: 'Vendeurs', icon: TrendingUp, path: '/admin/sellers', description: 'Gérer les vendeurs' },
    { title: 'Demandes Vendeurs', icon: TrendingUp, path: '/admin/seller-requests', description: 'Demandes de vendeurs' },
    { title: 'Équipe', icon: Users, path: '/admin/team-members', description: 'Gérer l\'équipe' },
    { title: 'Demandes Team', icon: Users, path: '/admin/team-requests', description: 'Demandes d\'équipe' },
    { title: 'Page d\'accueil', icon: Home, path: '/admin/homepage', description: 'Contenu de la page d\'accueil' },
    { title: 'Chat', icon: MessageSquare, path: '/admin/chat', description: 'Chat administrateur' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <Header />
      
      <main className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-display font-bold mb-4">
            Panneau d'<span className="gold-text">Administration</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Gérez votre plateforme LION DZ
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          <Card className="glass-effect border-gold/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Utilisateurs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold gold-text">{stats.totalUsers}</div>
            </CardContent>
          </Card>
          
          <Card className="glass-effect border-gold/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Produits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold gold-text">{stats.totalProducts}</div>
            </CardContent>
          </Card>
          
          <Card className="glass-effect border-gold/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Commandes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold gold-text">{stats.totalOrders}</div>
            </CardContent>
          </Card>
          
          <Card className="glass-effect border-gold/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Vendeurs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold gold-text">{stats.totalSellers}</div>
            </CardContent>
          </Card>
          
          <Card className="glass-effect border-gold/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Équipe</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold gold-text">{stats.totalTeamMembers}</div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Menu */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminMenuItems.map((item) => (
            <Card 
              key={item.path}
              className="glass-effect border-gold/20 hover:border-gold/40 transition-all cursor-pointer group"
              onClick={() => navigate(item.path)}
            >
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="gold-gradient rounded-lg p-2 group-hover:scale-110 transition-transform">
                    <item.icon className="h-6 w-6 text-black" />
                  </div>
                  <div>
                    <CardTitle className="text-white group-hover:text-gold transition-colors">
                      {item.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Admin;
