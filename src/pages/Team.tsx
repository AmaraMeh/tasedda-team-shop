
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Crown, TrendingUp, Gift, Users, Star, CheckCircle } from 'lucide-react';
import type { User as AuthUser } from '@supabase/supabase-js';

const Team = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTeamMember, setIsTeamMember] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!session) {
        navigate('/auth');
      } else {
        setUser(session.user);
        await checkTeamMembership(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkTeamMembership = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setIsTeamMember(!!data);
    } catch (error: any) {
      console.error('Error checking team membership:', error);
    }
  };

  const joinTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      // Générer un code promo unique
      const { data: promoCode, error: promoError } = await supabase
        .rpc('generate_promo_code');

      if (promoError) throw promoError;

      // Chercher le membre qui invite (optionnel)
      let invitedBy = null;
      if (inviteCode) {
        const { data: inviter, error: inviterError } = await supabase
          .from('team_members')
          .select('id')
          .eq('promo_code', inviteCode)
          .single();

        if (inviterError && inviterError.code !== 'PGRST116') {
          toast({
            title: "Code d'invitation invalide",
            description: "Le code saisi n'existe pas.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        invitedBy = inviter?.id || null;
      }

      // Créer le membre d'équipe
      const { error } = await supabase
        .from('team_members')
        .insert({
          user_id: user.id,
          promo_code: promoCode,
          invited_by: invitedBy,
        });

      if (error) throw error;

      toast({
        title: "Bienvenue dans la Team Tasedda !",
        description: `Votre code promo: ${promoCode}`,
      });

      setIsTeamMember(true);
      navigate('/profile');
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const ranks = [
    { level: 1, commission: 6, sales: 0, title: "Ambassadeur" },
    { level: 2, commission: 8, sales: 25, title: "Ambassadeur Bronze" },
    { level: 3, commission: 10, sales: 45, title: "Ambassadeur Argent" },
    { level: 4, commission: 12, sales: 85, title: "Ambassadeur Or" },
    { level: 5, commission: 12, sales: 120, title: "Manager" },
  ];

  if (isTeamMember) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        
        <main className="container mx-auto px-4 py-20">
          <div className="text-center" data-aos="fade-up">
            <CheckCircle className="h-20 w-20 mx-auto mb-6 text-gold" />
            <h1 className="text-3xl font-display font-bold mb-4">
              Vous êtes déjà membre de la <span className="gold-text">Team Tasedda</span> !
            </h1>
            <p className="text-muted-foreground mb-8">
              Consultez votre profil pour voir vos statistiques et gérer vos commissions.
            </p>
            <Button onClick={() => navigate('/profile')} className="btn-gold">
              Voir mon profil
            </Button>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <main className="py-20">
        {/* Hero Section */}
        <section className="container mx-auto px-4 text-center mb-20" data-aos="fade-up">
          <Crown className="h-20 w-20 mx-auto mb-6 text-gold" />
          <h1 className="text-4xl lg:text-5xl font-display font-bold mb-6">
            Rejoignez la <span className="gold-text">Team Tasedda</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Devenez ambassadeur et gagnez des commissions jusqu'à 12% sur chaque vente réalisée avec votre code promo personnel.
          </p>
          <div className="gold-gradient rounded-lg p-1 inline-block">
            <div className="bg-black rounded-lg px-8 py-4">
              <span className="text-2xl font-bold gold-text">
                Jusqu'à 12% de commission + Prime de parrainage 300 DA
              </span>
            </div>
          </div>
        </section>

        {/* Avantages */}
        <section className="container mx-auto px-4 mb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="glass-effect border-gold/20 card-hover" data-aos="fade-up" data-aos-delay="100">
              <CardHeader className="text-center">
                <TrendingUp className="h-16 w-16 mx-auto mb-4 text-gold" />
                <CardTitle>Commissions Évolutives</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  Progressez dans les rangs et augmentez vos commissions
                </p>
                <div className="text-3xl font-bold gold-text">6% → 12%</div>
              </CardContent>
            </Card>

            <Card className="glass-effect border-gold/20 card-hover" data-aos="fade-up" data-aos-delay="200">
              <CardHeader className="text-center">
                <Gift className="h-16 w-16 mx-auto mb-4 text-gold" />
                <CardTitle>Prime de Parrainage</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  Invitez des amis et recevez une prime
                </p>
                <div className="text-3xl font-bold text-green-500">300 DA</div>
                <p className="text-sm text-muted-foreground">par filleul actif</p>
              </CardContent>
            </Card>

            <Card className="glass-effect border-gold/20 card-hover" data-aos="fade-up" data-aos-delay="300">
              <CardHeader className="text-center">
                <Users className="h-16 w-16 mx-auto mb-4 text-gold" />
                <CardTitle>Communauté Active</CardTitle>
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
            <h2 className="text-3xl font-display font-bold mb-4">
              Système de <span className="gold-text">Rangs</span>
            </h2>
            <p className="text-muted-foreground">
              Plus vous vendez, plus vous gagnez. Évoluez dans les rangs et augmentez vos commissions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {ranks.map((rank, index) => (
              <Card key={rank.level} className={`glass-effect border-gold/20 ${index === 4 ? 'border-gold/60' : ''}`}>
                <CardHeader className="text-center pb-2">
                  <div className={`text-2xl font-bold ${index === 4 ? 'gold-text' : ''}`}>
                    Rang {rank.level}
                  </div>
                  <div className="text-sm font-medium">{rank.title}</div>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-2xl font-bold text-gold mb-2">
                    {rank.commission}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {rank.sales === 0 ? 'Débutant' : `${rank.sales}+ ventes`}
                  </div>
                  {index === 4 && (
                    <div className="mt-2">
                      <Crown className="h-6 w-6 mx-auto text-gold" />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Formulaire d'inscription */}
        <section className="container mx-auto px-4">
          <div className="max-w-md mx-auto" data-aos="fade-up">
            <Card className="glass-effect border-gold/20">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl gold-text">
                  Rejoindre la Team
                </CardTitle>
                <p className="text-muted-foreground">
                  Commencez votre aventure d'ambassadeur dès aujourd'hui
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={joinTeam} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="inviteCode">Code d'invitation (optionnel)</Label>
                    <Input
                      id="inviteCode"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                      placeholder="ABC123"
                      className="bg-black/50 border-gold/20 focus:border-gold"
                    />
                    <p className="text-xs text-muted-foreground">
                      Si vous avez été invité par un membre, saisissez son code
                    </p>
                  </div>
                  
                  <Button type="submit" className="w-full btn-gold" disabled={loading}>
                    <Crown className="h-4 w-4 mr-2" />
                    {loading ? "Inscription..." : "Rejoindre la Team"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Team;
