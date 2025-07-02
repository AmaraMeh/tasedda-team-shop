
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Users, TrendingUp, DollarSign, Award, Copy, Share } from 'lucide-react';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';

interface TeamMember {
  id: string;
  rank: number;
  total_sales: number;
  total_commissions: number;
  available_commissions: number;
  promo_code: string;
  is_active: boolean;
  created_at: string;
}

const TeamDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [teamMember, setTeamMember] = useState<TeamMember | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchTeamMemberData();
  }, [user, navigate]);

  const fetchTeamMemberData = async () => {
    try {
      const { data: memberData, error: memberError } = await supabase
        .from('team_members')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (memberError) {
        if (memberError.code === 'PGRST116') {
          // No team member found, redirect to team page
          navigate('/team');
          return;
        }
        throw memberError;
      }

      setTeamMember(memberData);
    } catch (error: any) {
      console.error('Error fetching team member data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données du membre",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyPromoCode = async () => {
    if (teamMember?.promo_code) {
      await navigator.clipboard.writeText(teamMember.promo_code);
      toast({
        title: "Code copié",
        description: `Code promo ${teamMember.promo_code} copié dans le presse-papiers`,
      });
    }
  };

  const sharePromoCode = async () => {
    if (teamMember?.promo_code) {
      const shareText = `Utilisez mon code promo ${teamMember.promo_code} sur Lion DZ pour bénéficier d'une réduction de 5% sur vos achats !`;
      
      if (navigator.share) {
        await navigator.share({
          title: 'Code promo Lion DZ',
          text: shareText,
          url: window.location.origin
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        toast({
          title: "Message copié",
          description: "Le message promotionnel a été copié dans le presse-papiers",
        });
      }
    }
  };

  const getRankBadge = (rank: number) => {
    const rankInfo = {
      1: { name: 'Bronze', color: 'bg-yellow-600', commission: '6%' },
      2: { name: 'Argent', color: 'bg-gray-400', commission: '8%' },
      3: { name: 'Or', color: 'bg-yellow-500', commission: '10%' },
      4: { name: 'Diamant', color: 'bg-blue-500', commission: '12%' }
    };
    
    const info = rankInfo[rank as keyof typeof rankInfo] || rankInfo[1];
    
    return (
      <Badge className={`${info.color} text-white`}>
        {info.name} ({info.commission})
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gold"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!teamMember) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Membre d'équipe non trouvé</h1>
          <Button onClick={() => navigate('/team')} className="btn-gold">
            Rejoindre l'équipe
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">
            Tableau de bord - Team Lion
          </h1>
          <div className="flex flex-wrap gap-2 items-center">
            {getRankBadge(teamMember.rank)}
            {teamMember.is_active ? (
              <Badge className="bg-green-500">Actif</Badge>
            ) : (
              <Badge variant="destructive">Inactif</Badge>
            )}
            <Badge variant="outline" className="border-gold/20">
              Membre depuis {new Date(teamMember.created_at).toLocaleDateString()}
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass-effect border-gold/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Rang</CardTitle>
              <Award className="h-4 w-4 text-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gold">Rang {teamMember.rank}</div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-gold/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Ventes Totales</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">{teamMember.total_sales}</div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-gold/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Commissions Totales</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {teamMember.total_commissions.toLocaleString()} DA
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-gold/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Commissions Disponibles</CardTitle>
              <DollarSign className="h-4 w-4 text-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gold">
                {teamMember.available_commissions.toLocaleString()} DA
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Promo Code Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="glass-effect border-gold/20">
            <CardHeader>
              <CardTitle className="text-white">Votre Code Promo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-black/50 p-4 rounded-lg border border-gold/20">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Code promo personnel</p>
                  <p className="text-3xl font-bold text-gold font-mono tracking-wider">
                    {teamMember.promo_code}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  onClick={copyPromoCode}
                  variant="outline"
                  className="border-gold/20 text-white hover:bg-gold/10"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copier
                </Button>
                <Button 
                  onClick={sharePromoCode}
                  className="btn-gold"
                >
                  <Share className="h-4 w-4 mr-2" />
                  Partager
                </Button>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p>• Vos clients bénéficient de 5% de réduction</p>
                <p>• Vous gagnez des commissions sur chaque vente</p>
                <p>• Plus vous vendez, plus votre rang augmente</p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-gold/20">
            <CardHeader>
              <CardTitle className="text-white">Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => navigate('/team/commissions')}
                className="w-full btn-gold"
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Historique des commissions
              </Button>
              <Button 
                onClick={() => navigate('/team/withdrawals')}
                variant="outline"
                className="w-full border-gold/20 text-white hover:bg-gold/10"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Demander un retrait
              </Button>
              <Button 
                onClick={() => navigate('/team/referrals')}
                variant="outline"
                className="w-full border-gold/20 text-white hover:bg-gold/10"
              >
                <Users className="h-4 w-4 mr-2" />
                Mes parrainages
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Performance Chart Placeholder */}
        <Card className="glass-effect border-gold/20">
          <CardHeader>
            <CardTitle className="text-white">Performance mensuelle</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <TrendingUp className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Graphique des performances à venir</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default TeamDashboard;
