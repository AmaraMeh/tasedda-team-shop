import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Crown, TrendingUp, Gift, Users, Star, Copy, DollarSign, Award } from 'lucide-react';
import type { User as AuthUser } from '@supabase/supabase-js';
import { useAuth } from '@/contexts/AuthContext';

interface TeamMember {
  id: string;
  promo_code: string;
  rank: number;
  total_sales: number;
  total_commissions: number;
  available_commissions: number;
  created_at: string;
}

const TeamSpace = () => {
  const { user, loading } = useAuth();
  const [teamMember, setTeamMember] = useState<TeamMember | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }
    if (user) {
      loadTeamData(user.id);
    }
  }, [user, loading, navigate]);

  const loadTeamData = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (!data) {
        navigate('/team');
        return;
      }

      setTeamMember(data);
    } catch (error: any) {
      console.error('Error loading team data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger vos données",
        variant: "destructive",
      });
    } finally {
      setDataLoading(false);
    }
  };

  const copyPromoCode = () => {
    if (teamMember?.promo_code) {
      navigator.clipboard.writeText(teamMember.promo_code);
      toast({
        title: "Code copié !",
        description: "Votre code promo a été copié dans le presse-papier",
      });
    }
  };

  const getRankTitle = (rank: number) => {
    const ranks = [
      { level: 1, title: "Ambassadeur", commission: 6 },
      { level: 2, title: "Ambassadeur Bronze", commission: 8 },
      { level: 3, title: "Ambassadeur Argent", commission: 10 },
      { level: 4, title: "Ambassadeur Or", commission: 12 },
      { level: 5, title: "Manager", commission: 12 },
    ];
    return ranks.find(r => r.level === rank) || ranks[0];
  };

  const getNextRank = (currentRank: number) => {
    const salesThresholds = [0, 25, 45, 85, 120];
    if (currentRank >= 5) return null;
    return {
      level: currentRank + 1,
      salesNeeded: salesThresholds[currentRank]
    };
  };

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gold"></div>
      </div>
    );
  }

  if (!teamMember) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <main className="container mx-auto px-4 py-20">
          <div className="text-center">
            <Crown className="h-20 w-20 mx-auto mb-6 text-gold" />
            <h1 className="text-3xl font-display font-bold mb-4">
              Vous n'êtes pas encore membre de la <span className="gold-text">Team</span>
            </h1>
            <Button onClick={() => navigate('/team')} className="btn-gold">
              Rejoindre la Team
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const currentRank = getRankTitle(teamMember.rank);
  const nextRank = getNextRank(teamMember.rank);

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <main className="py-20">
        {/* Header */}
        <section className="container mx-auto px-4 text-center mb-12" data-aos="fade-up">
          <Crown className="h-16 w-16 mx-auto mb-4 text-gold" />
          <h1 className="text-4xl font-display font-bold mb-4">
            Mon Espace <span className="gold-text">Team Tasedda</span>
          </h1>
          <p className="text-muted-foreground">
            Gérez vos commissions et suivez vos performances
          </p>
        </section>

        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Stats principales */}
            <div className="lg:col-span-2 space-y-6">
              {/* Code promo */}
              <Card className="glass-effect border-gold/20" data-aos="fade-up">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Gift className="h-5 w-5 mr-2 text-gold" />
                    Mon Code Promo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 bg-gold/10 rounded-lg border border-gold/20">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl font-bold gold-text">
                        {teamMember.promo_code}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Commission: {currentRank.commission}%
                      </div>
                    </div>
                    <Button onClick={copyPromoCode} variant="outline" className="border-gold/20">
                      <Copy className="h-4 w-4 mr-2" />
                      Copier
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Performances */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="glass-effect border-gold/20" data-aos="fade-up" data-aos-delay="100">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Ventes Totales</p>
                        <p className="text-2xl font-bold gold-text">{teamMember.total_sales}</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-gold" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-effect border-gold/20" data-aos="fade-up" data-aos-delay="200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Commissions Totales</p>
                        <p className="text-2xl font-bold text-green-500">
                          {teamMember.total_commissions.toFixed(2)} DA
                        </p>
                      </div>
                      <DollarSign className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-effect border-gold/20" data-aos="fade-up" data-aos-delay="300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Disponible</p>
                        <p className="text-2xl font-bold text-blue-500">
                          {teamMember.available_commissions.toFixed(2)} DA
                        </p>
                      </div>
                      <DollarSign className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Historique */}
              <Card className="glass-effect border-gold/20" data-aos="fade-up">
                <CardHeader>
                  <CardTitle>Historique des Commissions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4" />
                    <p>Aucune commission pour le moment</p>
                    <p className="text-sm">Partagez votre code promo pour commencer à gagner !</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Rang actuel */}
              <Card className="glass-effect border-gold/20" data-aos="fade-up">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="h-5 w-5 mr-2 text-gold" />
                    Mon Rang
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold gold-text mb-2">
                      Rang {teamMember.rank}
                    </div>
                    <div className="text-lg font-semibold mb-4">
                      {currentRank.title}
                    </div>
                    <Badge variant="secondary" className="mb-4">
                      Commission: {currentRank.commission}%
                    </Badge>

                    {nextRank && (
                      <div className="mt-4 p-4 bg-gold/10 rounded-lg border border-gold/20">
                        <p className="text-sm text-muted-foreground mb-2">
                          Prochain rang: Rang {nextRank.level}
                        </p>
                        <p className="text-sm">
                          {nextRank.salesNeeded - teamMember.total_sales > 0 
                            ? `${nextRank.salesNeeded - teamMember.total_sales} ventes restantes`
                            : "Rang maximum atteint !"
                          }
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Actions rapides */}
              <Card className="glass-effect border-gold/20" data-aos="fade-up">
                <CardHeader>
                  <CardTitle>Actions Rapides</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full btn-gold" 
                    onClick={() => navigate('/profile')}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Mon Profil
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full border-gold/20"
                    disabled
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Demander un retrait
                  </Button>

                  <Button 
                    variant="outline" 
                    className="w-full border-gold/20"
                    onClick={() => window.open(`https://wa.me/?text=Découvrez Tasedda avec mon code promo: ${teamMember.promo_code} et bénéficiez de réductions exclusives !`, '_blank')}
                  >
                    <Star className="h-4 w-4 mr-2" />
                    Partager mon code
                  </Button>
                </CardContent>
              </Card>

              {/* Support */}
              <Card className="glass-effect border-gold/20" data-aos="fade-up">
                <CardHeader>
                  <CardTitle>Support Team</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Besoin d'aide ? Notre équipe est là pour vous accompagner.
                  </p>
                  <Button variant="outline" className="w-full border-gold/20">
                    Contacter le support
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TeamSpace;
