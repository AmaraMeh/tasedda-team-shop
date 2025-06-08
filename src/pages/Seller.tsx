import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Store, Shield, Users, TrendingUp, CheckCircle } from 'lucide-react';
import type { User as AuthUser } from '@supabase/supabase-js';
import { useAuth } from '@/contexts/AuthContext';

const Seller = () => {
  const { user, loading } = useAuth();
  const [businessName, setBusinessName] = useState('');
  const [description, setDescription] = useState('');
  const [dataLoading, setDataLoading] = useState(true);
  const [isSeller, setIsSeller] = useState(false);
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
      const { data, error } = await supabase
        .from('sellers')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setIsSeller(!!data);
    } catch (error: any) {
      console.error('Error checking seller status:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const createSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const createSeller = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const slug = createSlug(businessName);

      // Vérifier si le slug existe déjà
      const { data: existingSeller, error: checkError } = await supabase
        .from('sellers')
        .select('id')
        .eq('slug', slug)
        .single();

      if (existingSeller) {
        toast({
          title: "Nom de boutique déjà pris",
          description: "Veuillez choisir un autre nom pour votre boutique.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('sellers')
        .insert({
          user_id: user.id,
          business_name: businessName,
          slug: slug,
          description: description,
          status: 'pending', // Demande en attente de validation admin
        });

      if (error) throw error;

      toast({
        title: "Demande envoyée !",
        description: `Votre demande de boutique a été envoyée et sera examinée par l'administration.`,
      });

      setIsSeller(false);
      navigate('/profile');
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const features = [
    {
      icon: Shield,
      title: "1 Mois Gratuit",
      description: "Testez notre plateforme sans engagement pendant un mois complet"
    },
    {
      icon: Users,
      title: "Support Dédié",
      description: "Accompagnement personnalisé pour développer votre business"
    },
    {
      icon: TrendingUp,
      title: "700 DA/mois",
      description: "Tarif abordable après la période d'essai gratuite"
    }
  ];

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-gold">Chargement...</div>
      </div>
    );
  }

  if (isSeller) {
    // Charger la boutique pour vérifier le statut
    const [shop, setShop] = useState<any>(null);
    useEffect(() => {
      if (user) {
        supabase.from('sellers').select('*').eq('user_id', user.id).single().then(({ data }) => setShop(data));
      }
    }, [user]);
    if (shop && shop.status === 'pending') {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gold mb-4">Votre demande de boutique est en attente de validation par l'administration.</h2>
            <p className="text-muted-foreground">Vous recevrez un email dès qu'elle sera validée.</p>
          </div>
        </div>
      );
    }
    if (shop && shop.status === 'active') {
      return (
        <div className="min-h-screen bg-black">
          <Header />
          <main className="container mx-auto px-4 py-20">
            <div className="text-center" data-aos="fade-up">
              <CheckCircle className="h-20 w-20 mx-auto mb-6 text-gold" />
              <h1 className="text-3xl font-display font-bold mb-4">
                Votre <span className="gold-text">Boutique</span> est active !
              </h1>
              <p className="text-muted-foreground mb-8">
                Vous avez déjà une boutique sur Tasedda. Consultez votre profil pour la gérer.
              </p>
              <Button onClick={() => navigate('/profile')} className="btn-gold">
                Gérer ma boutique
              </Button>
            </div>
          </main>
          <Footer />
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <main className="py-20">
        {/* Hero Section */}
        <section className="container mx-auto px-4 text-center mb-20" data-aos="fade-up">
          <Store className="h-20 w-20 mx-auto mb-6 text-gold" />
          <h1 className="text-4xl lg:text-5xl font-display font-bold mb-6">
            Créez Votre <span className="gold-text">Boutique</span> en Ligne
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Développez votre business depuis chez vous avec notre plateforme vendeurs. 
            Vendez vos produits à travers notre réseau et bénéficiez de notre audience.
          </p>
          <div className="gold-gradient rounded-lg p-1 inline-block">
            <div className="bg-black rounded-lg px-8 py-4">
              <span className="text-2xl font-bold gold-text">
                1 Mois Gratuit + 700 DA/mois après
              </span>
            </div>
          </div>
        </section>

        {/* Avantages */}
        <section className="container mx-auto px-4 mb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="glass-effect border-gold/20 card-hover" data-aos="fade-up" data-aos-delay={index * 100}>
                <CardHeader className="text-center">
                  <feature.icon className="h-16 w-16 mx-auto mb-4 text-gold" />
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Processus */}
        <section className="container mx-auto px-4 mb-20" data-aos="fade-up">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold mb-4">
              Comment ça <span className="gold-text">Marche</span> ?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Un processus simple en 3 étapes pour lancer votre boutique en ligne
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Inscription",
                description: "Créez votre compte et remplissez les informations de votre boutique"
              },
              {
                step: "2",
                title: "Période d'essai",
                description: "Profitez d'un mois gratuit pour tester notre plateforme"
              },
              {
                step: "3",
                title: "Vendre",
                description: "Ajoutez vos produits et commencez à vendre à notre audience"
              }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 gold-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-black">{item.step}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Formulaire */}
        <section className="container mx-auto px-4">
          <div className="max-w-md mx-auto" data-aos="fade-up">
            <Card className="glass-effect border-gold/20">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl gold-text">
                  Créer Ma Boutique
                </CardTitle>
                <p className="text-muted-foreground">
                  Commencez votre aventure de vendeur dès aujourd'hui
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={createSeller} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Nom de votre boutique *</Label>
                    <Input
                      id="businessName"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="Ma Boutique Mode"
                      required
                      className="bg-black/50 border-gold/20 focus:border-gold"
                    />
                    {businessName && (
                      <p className="text-xs text-muted-foreground">
                        URL: tasedda.dz/boutique/{createSlug(businessName)}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description de votre boutique</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Décrivez votre boutique et vos produits..."
                      className="bg-black/50 border-gold/20 focus:border-gold"
                      rows={3}
                    />
                  </div>

                  <div className="bg-gold/10 border border-gold/20 rounded-lg p-4">
                    <h4 className="font-semibold text-gold mb-2">Conditions :</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• 1 mois d'essai gratuit</li>
                      <li>• 700 DA/mois après la période d'essai</li>
                      <li>• Paiement via BaridiMob (manuel)</li>
                      <li>• Validation des produits par l'admin</li>
                    </ul>
                  </div>
                  
                  <Button type="submit" className="w-full btn-gold" disabled={loading}>
                    <Store className="h-4 w-4 mr-2" />
                    {loading ? "Création..." : "Créer Ma Boutique"}
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

export default Seller;
