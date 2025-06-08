
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ShoppingBag, Package, DollarSign, Crown, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState<any>({});
  const [topMember, setTopMember] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  
  useEffect(() => {
    fetchStats();
    fetchRecentActivity();
  }, []);

  const fetchStats = async () => {
    const [users, team, sellers, products, orders, withdrawals] = await Promise.all([
      supabase.from('profiles').select('*'),
      supabase.from('team_members').select('*'),
      supabase.from('sellers').select('*'),
      supabase.from('products').select('*'),
      supabase.from('orders').select('*'),
      supabase.from('withdrawal_requests').select('*').eq('status', 'pending'),
    ]);
    
    setStats({
      users: users.data?.length || 0,
      team: team.data?.length || 0,
      sellers: sellers.data?.length || 0,
      products: products.data?.length || 0,
      orders: orders.data?.length || 0,
      pendingWithdrawals: withdrawals.data?.length || 0,
    });
    
    // Top contributeur (par ventes)
    if (team.data && team.data.length > 0) {
      const sorted = [...team.data].sort((a, b) => (b.total_sales || 0) - (a.total_sales || 0));
      if (sorted[0]) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', sorted[0].user_id)
          .single();
        setTopMember({ ...sorted[0], profile });
      }
    }
  };

  const fetchRecentActivity = async () => {
    // Récupérer les activités récentes
    const { data: recentOrders } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    const { data: recentRequests } = await supabase
      .from('team_join_requests')
      .select('*, profiles(full_name)')
      .order('created_at', { ascending: false })
      .limit(5);
    
    const activity = [
      ...(recentOrders || []).map(order => ({
        type: 'order',
        message: `Nouvelle commande #${order.order_number}`,
        time: order.created_at
      })),
      ...(recentRequests || []).map(req => ({
        type: 'team_request',
        message: `Demande Team de ${req.profiles?.full_name}`,
        time: req.created_at
      }))
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 10);
    
    setRecentActivity(activity);
  };

  return (
    <div className="space-y-8">
      {/* Statistiques principales */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="glass-effect border-gold/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Users className="h-4 w-4 mr-2 text-gold" />
              Utilisateurs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gold">{stats.users}</div>
          </CardContent>
        </Card>
        
        <Card className="glass-effect border-gold/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Crown className="h-4 w-4 mr-2 text-gold" />
              Team
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gold">{stats.team}</div>
          </CardContent>
        </Card>
        
        <Card className="glass-effect border-gold/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <ShoppingBag className="h-4 w-4 mr-2 text-gold" />
              Vendeurs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gold">{stats.sellers}</div>
          </CardContent>
        </Card>
        
        <Card className="glass-effect border-gold/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Package className="h-4 w-4 mr-2 text-gold" />
              Produits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gold">{stats.products}</div>
          </CardContent>
        </Card>
        
        <Card className="glass-effect border-gold/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <ShoppingBag className="h-4 w-4 mr-2 text-gold" />
              Commandes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gold">{stats.orders}</div>
          </CardContent>
        </Card>
        
        <Card className="glass-effect border-gold/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <DollarSign className="h-4 w-4 mr-2 text-gold" />
              Retraits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{stats.pendingWithdrawals}</div>
            <p className="text-xs text-muted-foreground">En attente</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Meilleur contributeur */}
        {topMember && (
          <Card className="glass-effect border-gold/20">
            <CardHeader>
              <CardTitle className="flex items-center text-gold">
                <TrendingUp className="h-5 w-5 mr-2" />
                Meilleur contributeur du mois
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-xl font-bold text-gold">{topMember.profile?.full_name}</div>
                <div className="text-lg font-mono text-gold">{topMember.promo_code}</div>
                <div className="text-sm text-muted-foreground">
                  {topMember.total_sales} ventes • {topMember.total_commissions} DA commissions
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Activité récente */}
        <Card className="glass-effect border-gold/20">
          <CardHeader>
            <CardTitle className="text-gold">Activité récente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between border-b border-gold/10 pb-2">
                  <div>
                    <div className="text-sm">{activity.message}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(activity.time).toLocaleDateString()}
                    </div>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'order' ? 'bg-green-500' : 'bg-blue-500'
                  }`}></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
