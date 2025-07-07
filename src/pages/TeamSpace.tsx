
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTeamCommissions } from '@/hooks/useTeamCommissions';
import { Copy, Users, TrendingUp, Gift, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TeamMemberData {
  id: string;
  promo_code: string;
  rank: number;
  total_sales: number;
  total_commissions: number;
  available_commissions: number;
}

interface AffiliatedOrder {
  id: string;
  order_number: string;
  total_amount: number;
  created_at: string;
  order_status: string;
  profiles?: {
    full_name: string;
    email: string;
  };
}

const TeamSpace = () => {
  const { user } = useAuth();
  const { commissions, pendingAmount, availableAmount, loading } = useTeamCommissions();
  const [teamData, setTeamData] = useState<TeamMemberData | null>(null);
  const [affiliatedOrders, setAffiliatedOrders] = useState<AffiliatedOrder[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchTeamData();
      fetchAffiliatedOrders();
    }
  }, [user]);

  const fetchTeamData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setTeamData(data);
    } catch (error: any) {
      console.error('Error fetching team data:', error);
    }
  };

  const fetchAffiliatedOrders = async () => {
    if (!user || !teamData) return;

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          total_amount,
          created_at,
          order_status,
          user_id,
          profiles(full_name, email)
        `)
        .eq('promo_code', teamData.promo_code)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAffiliatedOrders(data || []);
    } catch (error: any) {
      console.error('Error fetching affiliated orders:', error);
    }
  };

  const copyPromoCode = () => {
    if (teamData) {
      navigator.clipboard.writeText(teamData.promo_code);
      toast({
        title: "Code copié",
        description: "Le code promo a été copié dans le presse-papiers",
      });
    }
  };

  const getRankInfo = (rank: number) => {
    const ranks = [
      { level: 1, title: "Ambassadeur", commission: 6, icon: "🥉" },
      { level: 2, title: "Ambassadeur Bronze", commission: 8, icon: "🥈" },
      { level: 3, title: "Ambassadeur Argent", commission: 10, icon: "🥇" },
      { level: 4, title: "Ambassadeur Or", commission: 12, icon: "👑" },
      { level: 5, title: "Manager", commission: 12, icon: "💎" },
    ];
    return ranks.find(r => r.level === rank) || ranks[0];
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white">Veuillez vous connecter pour accéder à l'espace équipe.</p>
      </div>
    );
  }

  if (!teamData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Card className="glass-effect border-gold/20 max-w-md">
          <CardContent className="p-8 text-center">
            <Users className="h-16 w-16 mx-auto text-gold mb-4" />
            <h2 className="text-xl font-bold text-white mb-4">Rejoindre l'équipe</h2>
            <p className="text-gray-400 mb-6">
              Vous n'êtes pas encore membre de notre équipe. 
              Rejoignez-nous pour commencer à gagner des commissions !
            </p>
            <Button onClick={() => window.location.href = '/team'} className="btn-gold">
              Rejoindre maintenant
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const rankInfo = getRankInfo(teamData.rank);

  return (
    <div className="min-h-screen bg-black py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Mon Espace Équipe</h1>
          <p className="text-gray-400">Gérez vos commissions et suivez vos performances</p>
        </div>

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="glass-effect border-gold/20">
            <CardContent className="p-6 text-center">
              <div className="text-3xl mb-2">{rankInfo.icon}</div>
              <div className="text-2xl font-bold text-gold">{rankInfo.title}</div>
              <div className="text-sm text-gray-400">Rang {teamData.rank}</div>
              <div className="text-sm text-gray-400">{rankInfo.commission}% commission</div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-green-500/20">
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 mx-auto text-green-400 mb-2" />
              <div className="text-2xl font-bold text-green-400">{teamData.total_sales}</div>
              <div className="text-sm text-gray-400">Ventes totales</div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-orange-500/20">
            <CardContent className="p-6 text-center">
              <Gift className="h-8 w-8 mx-auto text-orange-400 mb-2" />
              <div className="text-2xl font-bold text-orange-400">{pendingAmount.toLocaleString()} DA</div>
              <div className="text-sm text-gray-400">En attente</div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-green-500/20">
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 mx-auto text-green-400 mb-2" />
              <div className="text-2xl font-bold text-green-400">{availableAmount.toLocaleString()} DA</div>
              <div className="text-sm text-gray-400">Disponible</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Code promo */}
          <Card className="glass-effect border-gold/20">
            <CardHeader>
              <CardTitle className="text-gold">Mon Code Promo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-black/30 rounded-lg">
                <div>
                  <p className="text-sm text-gray-400">Votre code promo :</p>
                  <p className="text-2xl font-bold text-gold font-mono">{teamData.promo_code}</p>
                </div>
                <Button onClick={copyPromoCode} variant="outline" size="sm">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-gray-400 mt-4">
                Partagez ce code avec vos clients pour gagner des commissions sur leurs achats.
              </p>
            </CardContent>
          </Card>

          {/* Commissions récentes */}
          <Card className="glass-effect border-gold/20">
            <CardHeader>
              <CardTitle className="text-gold">Commissions Récentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {commissions.slice(0, 5).map((commission) => (
                  <div key={commission.id} className="flex justify-between items-center p-3 bg-black/30 rounded-lg">
                    <div>
                      <p className="font-medium text-white">{commission.amount.toLocaleString()} DA</p>
                      <p className="text-sm text-gray-400">
                        {commission.type === 'sale' ? 'Vente' : 'Bonus d\'affiliation'}
                      </p>
                    </div>
                    <Badge className={
                      commission.status === 'pending' ? 'bg-orange-500/20 text-orange-400' :
                      commission.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                      'bg-blue-500/20 text-blue-400'
                    }>
                      {commission.status === 'pending' ? 'En attente' :
                       commission.status === 'approved' ? 'Approuvé' : 'Payé'}
                    </Badge>
                  </div>
                ))}
                {commissions.length === 0 && (
                  <p className="text-gray-400 text-center py-4">Aucune commission pour le moment</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Commandes affiliées */}
        <Card className="glass-effect border-gold/20 mt-8">
          <CardHeader>
            <CardTitle className="text-gold">Commandes Affiliées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {affiliatedOrders.map((order) => (
                <div key={order.id} className="flex justify-between items-center p-4 bg-black/30 rounded-lg">
                  <div>
                    <p className="font-semibold text-white">#{order.order_number}</p>
                    <p className="text-sm text-gray-400">
                      {order.profiles?.full_name || 'Client'} • {order.total_amount.toLocaleString()} DA
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className={
                    order.order_status === 'delivered' ? 'bg-green-500/20 text-green-400' :
                    order.order_status === 'shipped' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-orange-500/20 text-orange-400'
                  }>
                    {order.order_status === 'delivered' ? 'Livré' :
                     order.order_status === 'shipped' ? 'Expédié' : 'En cours'}
                  </Badge>
                </div>
              ))}
              {affiliatedOrders.length === 0 && (
                <p className="text-gray-400 text-center py-8">Aucune commande affiliée pour le moment</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeamSpace;
