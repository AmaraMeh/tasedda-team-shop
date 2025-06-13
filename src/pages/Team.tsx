
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import InvitationCodeModal from '@/components/InvitationCodeModal';
import ContactButton from '@/components/ContactButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Crown, TrendingUp, Gift, Users, Star, CheckCircle, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Team = () => {
  const { user, loading } = useAuth();
  const [dataLoading, setDataLoading] = useState(true);
  const [isTeamMember, setIsTeamMember] = useState(false);
  const [hasRequest, setHasRequest] = useState(false);
  const [showInvitationModal, setShowInvitationModal] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }
    if (user) {
      checkTeamStatus(user.id);
    }
  }, [user, loading, navigate]);

  const checkTeamStatus = async (userId: string) => {
    try {
      // Vérifier si déjà membre de la team
      const { data: teamMember, error: teamError } = await supabase
        .from('team_members')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (teamError && teamError.code !== 'PGRST116') throw teamError;
      
      // Vérifier si demande en cours
      const { data: request, error: requestError } = await supabase
        .from('team_join_requests')
        .select('id, status')
        .eq('user_id', userId)
        .single();

      if (requestError && requestError.code !== 'PGRST116') throw requestError;

      setIsTeamMember(!!teamMember);
      setHasRequest(!!request);
    } catch (error: any) {
      console.error('Error checking team status:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const handleInvitationSuccess = () => {
    setShowInvitationModal(false);
    joinTeam();
  };

  const joinTeam = async () => {
    if (!user) return;
    
    setDataLoading(true);
    try {
      // Vérifier si l'utilisateur possède déjà une boutique
      const { data: seller } = await supabase
        .from('sellers')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();
        
      if (seller) {
        toast({
          title: "Impossible de rejoindre la Team",
          description: "Vous possédez déjà une boutique. Un vendeur ne peut pas être membre de la Team.",
          variant: "destructive",
        });
        setDataLoading(false);
        return;
      }

      // Créer la demande d'adhésion avec les données du profil existant
      const { error } = await supabase
        .from('team_join_requests')
        .insert({
          user_id: user.id,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Demande envoyée !",
        description: "Votre demande d'adhésion a été envoyée et sera examinée par l'administration.",
      });

      setHasRequest(true);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDataLoading(false);
    }
  };

  const ranks = [
    { level: 1, commission: 6, sales: 0, title: "Ambassadeur", icon: "🥉" },
    { level: 2, commission: 8, sales: 25, title: "Ambassadeur Bronze", icon: "🥈" },
    { level: 3, commission: 10, sales: 45, title: "Ambassadeur Argent", icon: "🥇" },
    { level: 4, commission: 12, sales: 85, title: "Ambassadeur Or", icon: "👑" },
    { level: 5, commission: 12, sales: 120, title: "Manager", icon: "💎" },
  ];

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gold"></div>
      </div>
    );
  }

  if (isTeamMember) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
        <Header />
        
        <main className="container mx-auto px-4 py-20">
          <div className="text-center" data-aos="fade-up">
            <div className="relative">
              <CheckCircle className="h-20 w-20 mx-auto mb-6 text-gold" />
              <Sparkles className="h-8 w-8 absolute top-0 right-1/2 transform translate-x-8 text-gold animate-pulse" />
            </div>
            <h1 className="text-4xl font-display font-bold mb-4">
              Bienvenue dans la <span className="gold-text">Team Lion</span> !
            </h1>
            <p className="text-muted-foreground mb-8 text-lg">
              Vous êtes maintenant membre de notre équipe d'ambassadeurs. <br />
              Consultez votre espace pour gérer vos commissions et voir vos statistiques.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => navigate('/team-space')} className="btn-gold text-lg py-3 px-8">
                <Crown className="h-5 w-5 mr-2" />
                Accéder à mon espace
              </Button>
              <ContactButton className="text-lg py-3 px-8" />
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  if (hasRequest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
        <Header />
        
        <main className="container mx-auto px-4 py-20">
          <div className="text-center" data-aos="fade-up">
            <Crown className="h-20 w-20 mx-auto mb-6 text-gold animate-pulse" />
            <h1 className="text-3xl font-display font-bold mb-4">
              Demande en cours de traitement
            </h1>
            <p className="text-muted-foreground mb-8 text-lg">
              Votre demande d'adhésion à la Team Lion est en cours d'examen par notre équipe. <br />
              Vous recevrez une notification dès qu'elle sera traitée.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => navigate('/profile')} variant="outline" className="border-gold/20 text-lg py-3 px-8">
                Retour au profil
              </Button>
              <ContactButton className="text-lg py-3 px-8" />
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <Header />
      
      <main className="py-20">
        {/* Hero Section */}
        <section className="container mx-auto px-4 text-center mb-20" data-aos="fade-up">
          <div className="relative">
            <Crown className="h-24 w-24 mx-auto mb-6 text-gold" />
            <Sparkles className="h-8 w-8 absolute top-0 left-1/2 transform -translate-x-16 text-gold animate-pulse" />
            <Sparkles className="h-6 w-6 absolute top-8 right-1/2 transform translate-x-16 text-gold animate-pulse delay-300" />
          </div>
          <h1 className="text-4xl lg:text-6xl font-display font-bold mb-6">
            Rejoignez la <span className="gold-text">Team Lion</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Devenez ambassadeur et gagnez des commissions jusqu'à 12% sur chaque vente réalisée avec votre code promo personnel.
          </p>
          <div className="gold-gradient rounded-2xl p-1 inline-block mb-8">
            <div className="bg-black rounded-2xl px-8 py-6">
              <span className="text-2xl lg:text-3xl font-bold gold-text">
                Jusqu'à 12% de commission + Prime de parrainage 300 DA
              </span>
            </div>
          </div>
        </section>

        {/* Avantages */}
        <section className="container mx-auto px-4 mb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="glass-effect border-gold/20 card-hover group" data-aos="fade-up" data-aos-delay="100">
              <CardHeader className="text-center">
                <div className="relative">
                  <TrendingUp className="h-16 w-16 mx-auto mb-4 text-gold group-hover:scale-110 transition-transform" />
                  <div className="absolute inset-0 bg-gold/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <CardTitle className="text-xl">Commissions Évolutives</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  Progressez dans les rangs et augmentez vos commissions
                </p>
                <div className="text-4xl font-bold gold-text">6% → 12%</div>
              </CardContent>
            </Card>

            <Card className="glass-effect border-gold/20 card-hover group" data-aos="fade-up" data-aos-delay="200">
              <CardHeader className="text-center">
                <div className="relative">
                  <Gift className="h-16 w-16 mx-auto mb-4 text-gold group-hover:scale-110 transition-transform" />
                  <div className="absolute inset-0 bg-gold/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <CardTitle className="text-xl">Prime de Parrainage</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  Invitez des amis et recevez une prime
                </p>
                <div className="text-4xl font-bold text-green-500">300 DA</div>
                <p className="text-sm text-muted-foreground">par filleul actif</p>
              </CardContent>
            </Card>

            <Card className="glass-effect border-gold/20 card-hover group" data-aos="fade-up" data-aos-delay="300">
              <CardHeader className="text-center">
                <div className="relative">
                  <Users className="h-16 w-16 mx-auto mb-4 text-gold group-hover:scale-110 transition-transform" />
                  <div className="absolute inset-0 bg-gold/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <CardTitle className="text-xl">Communauté Active</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  Rejoignez plus de 500 membres actifs
                </p>
                <div className="flex items-center justify-center">
                  <Star className="h-5 w-5 text-gold mr-1" />
                  <span className="font-semibold">Support 24/7</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Système de Rangs */}
        <section className="container mx-auto px-4 mb-20" data-aos="fade-up">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-display font-bold mb-4">
              Système de <span className="gold-text">Rangs</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Plus vous vendez, plus vous gagnez. Évoluez dans les rangs et augmentez vos commissions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {ranks.map((rank, index) => (
              <Card key={rank.level} className={`glass-effect border-gold/20 card-hover ${index === 4 ? 'border-gold/60 bg-gold/5' : ''}`}>
                <CardHeader className="text-center pb-2">
                  <div className="text-4xl mb-2">{rank.icon}</div>
                  <div className={`text-2xl font-bold ${index === 4 ? 'gold-text' : ''}`}>
                    Rang {rank.level}
                  </div>
                  <div className="text-sm font-medium">{rank.title}</div>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-3xl font-bold text-gold mb-2">
                    {rank.commission}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {rank.sales === 0 ? 'Débutant' : `${rank.sales}+ ventes`}
                  </div>
                  {index === 4 && (
                    <div className="mt-2">
                      <Crown className="h-6 w-6 mx-auto text-gold animate-pulse" />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="container mx-auto px-4">
          <div className="text-center" data-aos="fade-up">
            <Card className="glass-effect border-gold/20 max-w-lg mx-auto">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl gold-text mb-2">
                  Prêt à commencer ?
                </CardTitle>
                <p className="text-muted-foreground text-lg">
                  Rejoignez la Team Lion avec un code d'invitation
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={() => setShowInvitationModal(true)}
                  className="w-full btn-gold text-lg py-3" 
                  disabled={dataLoading}
                >
                  <Crown className="h-5 w-5 mr-2" />
                  {dataLoading ? "Chargement..." : "Rejoindre la Team Lion"}
                </Button>
                <ContactButton className="w-full text-lg py-3" />
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <InvitationCodeModal
        isOpen={showInvitationModal}
        onClose={() => setShowInvitationModal(false)}
        type="team"
        onSuccess={handleInvitationSuccess}
      />

      <Footer />
    </div>
  );
};

export default Team;
