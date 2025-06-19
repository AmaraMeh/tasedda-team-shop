import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import ContactButton from '@/components/ContactButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Store, Package, TrendingUp, Users, CheckCircle, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Seller = () => {
  const { user, loading } = useAuth();
  const [dataLoading, setDataLoading] = useState(true);
  const [isSeller, setIsSeller] = useState(false);
  const [selectedType, setSelectedType] = useState<'normal' | 'wholesale'>('normal');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }
    if (user) {
      checkSellerStatus(user.id);
    }
  }, [user, loading, navigate]);

  const checkSellerStatus = async (userId: string) => {
    try {
      // Vérifier si déjà vendeur
      const { data: seller, error: sellerError } = await supabase
        .from('sellers')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (sellerError && sellerError.code !== 'PGRST116') throw sellerError;
      
      setIsSeller(!!seller);
    } catch (error: any) {
      console.error('Error checking seller status:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const becomeSeller = async () => {
    if (!user) return;
    
    setDataLoading(true);
    try {
      // Vérifier si l'utilisateur est membre de la team
      const { data: teamMember } = await supabase
        .from('team_members')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();
        
      if (teamMember) {
        toast({
          title: "Impossible de devenir vendeur",
          description: "Vous êtes membre de la Team. Un membre de la Team ne peut pas avoir de boutique.",
          variant: "destructive",
        });
        setDataLoading(false);
        return;
      }

      // Récupérer les informations du profil
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      const businessName = profile?.full_name || 'Ma Boutique';
      
      // Créer le seller - le slug sera généré automatiquement par le trigger
      const { data: newSeller, error } = await supabase
        .from('sellers')
        .insert({
          user_id: user.id,
          business_name: businessName,
          seller_type: selectedType,
          status: 'pending',
          description: `Boutique ${selectedType === 'wholesale' ? 'de gros' : 'locale'} de ${businessName}`,
          slug: '' // Sera généré automatiquement
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Demande envoyée !",
        description: "Votre demande pour devenir vendeur a été envoyée et sera examinée par l'administration.",
      });

      setIsSeller(true);
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

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gold"></div>
      </div>
    );
  }

  if (isSeller) {
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
              Bienvenue dans votre <span className="gold-text">Boutique</span> !
            </h1>
            <p className="text-muted-foreground mb-8 text-lg">
              Votre boutique est maintenant créée. <br />
              Accédez à votre espace vendeur pour gérer vos produits et commandes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => navigate('/seller-space')} className="btn-gold text-lg py-3 px-8">
                <Store className="h-5 w-5 mr-2" />
                Accéder à ma boutique
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
            <Store className="h-24 w-24 mx-auto mb-6 text-gold" />
            <Sparkles className="h-8 w-8 absolute top-0 left-1/2 transform -translate-x-16 text-gold animate-pulse" />
            <Sparkles className="h-6 w-6 absolute top-8 right-1/2 transform translate-x-16 text-gold animate-pulse delay-300" />
          </div>
          <h1 className="text-4xl lg:text-6xl font-display font-bold mb-6">
            Créez votre <span className="gold-text">Boutique</span> en ligne
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Rejoignez notre plateforme et vendez vos produits en ligne. Bénéficiez d'un mois d'essai gratuit puis seulement 700 DA/mois.
          </p>
          <div className="gold-gradient rounded-2xl p-1 inline-block mb-8">
            <div className="bg-black rounded-2xl px-8 py-6">
              <span className="text-2xl lg:text-3xl font-bold gold-text">
                1 Mois Gratuit + 700 DA/mois seulement
              </span>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="container mx-auto px-4 mb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="glass-effect border-gold/20 card-hover group" data-aos="fade-up" data-aos-delay="100">
              <CardHeader className="text-center">
                <div className="relative">
                  <Package className="h-16 w-16 mx-auto mb-4 text-gold group-hover:scale-110 transition-transform" />
                  <div className="absolute inset-0 bg-gold/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <CardTitle className="text-xl">Essai Gratuit</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  Testez notre plateforme gratuitement pendant 1 mois complet
                </p>
                <div className="text-3xl font-bold text-green-500">1 Mois</div>
                <p className="text-sm text-muted-foreground">100% gratuit</p>
              </CardContent>
            </Card>

            <Card className="glass-effect border-gold/20 card-hover group" data-aos="fade-up" data-aos-delay="200">
              <CardHeader className="text-center">
                <div className="relative">
                  <Users className="h-16 w-16 mx-auto mb-4 text-gold group-hover:scale-110 transition-transform" />
                  <div className="absolute inset-0 bg-gold/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <CardTitle className="text-xl">Support Complet</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  Support client 24/7 et formation complète
                </p>
                <div className="text-3xl font-bold gold-text">24/7</div>
              </CardContent>
            </Card>

            <Card className="glass-effect border-gold/20 card-hover group" data-aos="fade-up" data-aos-delay="300">
              <CardHeader className="text-center">
                <div className="relative">
                  <TrendingUp className="h-16 w-16 mx-auto mb-4 text-gold group-hover:scale-110 transition-transform" />
                  <div className="absolute inset-0 bg-gold/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <CardTitle className="text-xl">Prix Accessible</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  Tarif mensuel très compétitif
                </p>
                <div className="text-3xl font-bold gold-text">700 DA</div>
                <p className="text-sm text-muted-foreground">par mois seulement</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Seller Types */}
        <section className="container mx-auto px-4 mb-20" data-aos="fade-up">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-display font-bold mb-4">
              Choisissez votre <span className="gold-text">Type de Boutique</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Sélectionnez le type de boutique qui correspond le mieux à votre activité
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card 
              className={`glass-effect border-gold/20 card-hover cursor-pointer transition-all ${
                selectedType === 'normal' ? 'border-gold ring-2 ring-gold/20' : ''
              }`}
              onClick={() => setSelectedType('normal')}
            >
              <CardHeader className="text-center">
                <Store className="h-16 w-16 mx-auto mb-4 text-gold" />
                <CardTitle className="text-2xl">Vendeur Local</CardTitle>
                {selectedType === 'normal' && (
                  <Badge className="bg-gold text-black">Sélectionné</Badge>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4 text-center">
                  Parfait pour les petites boutiques et vendeurs individuels
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Boutique en ligne personnalisée
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Gestion des commandes
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Support client dédié
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card 
              className={`glass-effect border-gold/20 card-hover cursor-pointer transition-all ${
                selectedType === 'wholesale' ? 'border-gold ring-2 ring-gold/20' : ''
              }`}
              onClick={() => setSelectedType('wholesale')}
            >
              <CardHeader className="text-center">
                <Package className="h-16 w-16 mx-auto mb-4 text-gold" />
                <CardTitle className="text-2xl">Grossiste</CardTitle>
                {selectedType === 'wholesale' && (
                  <Badge className="bg-gold text-black">Sélectionné</Badge>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4 text-center">
                  Idéal pour la vente en gros et les grands volumes
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Tarifs préférentiels en gros
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Gestion des stocks avancée
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Outils de vente B2B
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Call to Action */}
        <section className="container mx-auto px-4">
          <div className="text-center" data-aos="fade-up">
            <Card className="glass-effect border-gold/20 max-w-lg mx-auto">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl gold-text mb-2">
                  Créer ma boutique
                </CardTitle>
                <p className="text-muted-foreground text-lg">
                  Commencez dès maintenant sans code d'invitation
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={becomeSeller}
                  className="w-full btn-gold text-lg py-3" 
                  disabled={dataLoading}
                >
                  <Store className="h-5 w-5 mr-2" />
                  {dataLoading ? "Chargement..." : "Créer ma boutique"}
                </Button>
                <ContactButton className="w-full text-lg py-3" />
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Seller;
