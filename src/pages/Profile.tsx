
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { User, LogOut, Settings, Package, Crown } from 'lucide-react';
import type { User as AuthUser } from '@supabase/supabase-js';

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
}

interface TeamMember {
  id: string;
  promo_code: string;
  rank: number;
  total_sales: number;
  total_commissions: number;
  available_commissions: number;
}

const Profile = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [teamMember, setTeamMember] = useState<TeamMember | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate('/auth');
      } else {
        setUser(session.user);
        fetchProfile(session.user.id);
        fetchTeamMember(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMember = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setTeamMember(data);
    } catch (error: any) {
      console.error('Error fetching team member:', error);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, ...updates } : null);
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été sauvegardées.",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const requestWithdrawal = async () => {
    if (!teamMember || teamMember.available_commissions <= 0) return;

    try {
      const { error } = await supabase
        .from('withdrawal_requests')
        .insert({
          team_member_id: teamMember.id,
          amount: teamMember.available_commissions,
        });

      if (error) throw error;

      toast({
        title: "Demande de retrait envoyée",
        description: "Votre demande sera traitée par l'administration.",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-gold">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto" data-aos="fade-up">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold mb-4">
              Mon <span className="gold-text">Profil</span>
            </h1>
            <p className="text-muted-foreground">
              Gérez vos informations personnelles et votre activité
            </p>
          </div>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8 bg-black/50">
              <TabsTrigger value="profile" className="data-[state=active]:bg-gold data-[state=active]:text-black">
                <User className="h-4 w-4 mr-2" />
                Profil
              </TabsTrigger>
              <TabsTrigger value="team" className="data-[state=active]:bg-gold data-[state=active]:text-black">
                <Crown className="h-4 w-4 mr-2" />
                Team Tasedda
              </TabsTrigger>
              <TabsTrigger value="orders" className="data-[state=active]:bg-gold data-[state=active]:text-black">
                <Package className="h-4 w-4 mr-2" />
                Commandes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card className="glass-effect border-gold/20">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2 text-gold" />
                    Informations personnelles
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Nom complet</Label>
                      <Input
                        id="fullName"
                        value={profile?.full_name || ''}
                        onChange={(e) => updateProfile({ full_name: e.target.value })}
                        className="bg-black/50 border-gold/20 focus:border-gold"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={profile?.email || ''}
                        disabled
                        className="bg-black/50 border-gold/20 opacity-50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Téléphone</Label>
                      <Input
                        id="phone"
                        value={profile?.phone || ''}
                        onChange={(e) => updateProfile({ phone: e.target.value })}
                        className="bg-black/50 border-gold/20 focus:border-gold"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">Ville</Label>
                      <Input
                        id="city"
                        value={profile?.city || ''}
                        onChange={(e) => updateProfile({ city: e.target.value })}
                        className="bg-black/50 border-gold/20 focus:border-gold"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Adresse</Label>
                    <Input
                      id="address"
                      value={profile?.address || ''}
                      onChange={(e) => updateProfile({ address: e.target.value })}
                      className="bg-black/50 border-gold/20 focus:border-gold"
                    />
                  </div>
                  <div className="pt-4">
                    <Button onClick={handleSignOut} variant="destructive">
                      <LogOut className="h-4 w-4 mr-2" />
                      Se déconnecter
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="team">
              {teamMember ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="glass-effect border-gold/20">
                    <CardHeader>
                      <CardTitle className="text-gold">Mes Statistiques</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <span>Code Promo:</span>
                        <span className="font-bold text-gold">{teamMember.promo_code}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rang:</span>
                        <span className="font-bold">{teamMember.rank}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Ventes totales:</span>
                        <span className="font-bold">{teamMember.total_sales}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Commissions totales:</span>
                        <span className="font-bold text-gold">{teamMember.total_commissions} DA</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Commissions disponibles:</span>
                        <span className="font-bold text-green-500">{teamMember.available_commissions} DA</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass-effect border-gold/20">
                    <CardHeader>
                      <CardTitle className="text-gold">Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Button 
                        onClick={requestWithdrawal}
                        disabled={teamMember.available_commissions <= 0}
                        className="w-full btn-gold"
                      >
                        Demander un retrait
                      </Button>
                      <p className="text-sm text-muted-foreground">
                        Les retraits sont traités manuellement par l'administration.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card className="glass-effect border-gold/20 text-center p-8">
                  <CardContent>
                    <Crown className="h-16 w-16 mx-auto mb-4 text-gold" />
                    <h3 className="text-xl font-semibold mb-2">Rejoignez la Team Tasedda</h3>
                    <p className="text-muted-foreground mb-4">
                      Vous n'êtes pas encore membre de notre équipe d'ambassadeurs.
                    </p>
                    <Button onClick={() => navigate('/team')} className="btn-gold">
                      Rejoindre maintenant
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="orders">
              <Card className="glass-effect border-gold/20">
                <CardHeader>
                  <CardTitle>Mes Commandes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center py-8">
                    Aucune commande pour le moment.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
