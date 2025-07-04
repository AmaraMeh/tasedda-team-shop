import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Store, Package, TrendingUp, DollarSign, Calendar, Plus, Eye } from 'lucide-react';
import type { User as AuthUser } from '@supabase/supabase-js';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';

interface Seller {
  id: string;
  business_name: string;
  slug: string;
  description: string;
  subscription_status: string;
  subscription_expires_at: string;
  monthly_fee: number;
  is_active: boolean;
  created_at: string;
  status: string;
}

const SellerSpace = () => {
  const { user, loading } = useAuth();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0
  });
  const navigate = useNavigate();
  const { toast } = useToast();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }
    if (user) {
      loadSellerData(user.id);
    }
  }, [user, loading, navigate]);

  const loadSellerData = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('sellers')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (!data) {
        navigate('/seller');
        return;
      }

      setSeller(data);
      await loadStats(data.id);
    } catch (error: any) {
      console.error('Error loading seller data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger vos données",
        variant: "destructive",
      });
    } finally {
      setDataLoading(false);
    }
  };

  const loadStats = async (sellerId: string) => {
    try {
      // Charger les statistiques (simulées pour l'instant)
      const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', sellerId);

      setStats({
        totalProducts: products?.length || 0,
        totalOrders: 0, // À implémenter
        totalRevenue: 0 // À implémenter
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const getSubscriptionStatus = (status: string) => {
    switch (status) {
      case 'trial':
        return { label: 'Période d\'essai', variant: 'secondary' as const, color: 'text-blue-500' };
      case 'active':
        return { label: 'Actif', variant: 'default' as const, color: 'text-green-500' };
      case 'expired':
        return { label: 'Expiré', variant: 'destructive' as const, color: 'text-red-500' };
      default:
        return { label: 'Inconnu', variant: 'secondary' as const, color: 'text-gray-500' };
    }
  };

  const createSellerSpace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!fullName || !email || !phone) {
      toast({ title: 'Veuillez remplir toutes les informations personnelles.' });
      return;
    }
    setDataLoading(true);
    try {
      // Vérifier si déjà membre team ou déjà une demande team
      const { data: teamReq } = await supabase
        .from('team_join_requests')
        .select('id, status')
        .eq('user_id', user.id)
        .single();
      const { data: teamMember } = await supabase
        .from('team_members')
        .select('id')
        .eq('user_id', user.id)
        .single();
      if (teamReq || teamMember) {
        toast({
          title: "Impossible de créer un espace vendeur",
          description: "Vous avez déjà demandé à rejoindre la team ou vous êtes déjà membre.",
          variant: "destructive",
        });
        setDataLoading(false);
        return;
      }
      // Désactiver le statut team si existant
      await supabase.from('team_members').update({ is_active: false }).eq('user_id', user.id);
      // Mettre à jour le profil avec les infos
      await supabase.from('profiles').update({ full_name: fullName, email, phone }).eq('id', user.id);
      // Créer l'espace vendeur
      // ... code existant pour créer la boutique ...
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gold"></div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <main className="container mx-auto px-4 py-20">
          <div className="text-center">
            <Store className="h-20 w-20 mx-auto mb-6 text-gold" />
            <h1 className="text-3xl font-display font-bold mb-4">
              Vous n'avez pas encore de <span className="gold-text">Boutique</span>
            </h1>
            <Button onClick={() => navigate('/seller')} className="btn-gold">
              Créer ma boutique
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Empêcher l'accès si la boutique n'est pas validée
  if (seller.status === 'pending') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gold mb-4">Votre demande de boutique est en attente de validation par l'administration.</h2>
          <p className="text-muted-foreground">Vous recevrez un email dès qu'elle sera validée.</p>
        </div>
      </div>
    );
  }
  if (seller.status === 'refused') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Votre demande de boutique a été refusée par l'administration.</h2>
          <p className="text-muted-foreground">Contactez le support pour plus d'informations.</p>
        </div>
      </div>
    );
  }

  const subscriptionInfo = getSubscriptionStatus(seller.subscription_status);
  const daysLeft = Math.ceil((new Date(seller.subscription_expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <main className="py-20">
        {/* Header */}
        <section className="container mx-auto px-4 text-center mb-12" data-aos="fade-up">
          <Store className="h-16 w-16 mx-auto mb-4 text-gold" />
          <h1 className="text-4xl font-display font-bold mb-4">
            Mon Espace <span className="gold-text">Vendeur</span>
          </h1>
          <p className="text-muted-foreground">
            Gérez votre boutique et vos produits
          </p>
        </section>

        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contenu principal */}
            <div className="lg:col-span-2 space-y-6">
              {/* Informations boutique */}
              <Card className="glass-effect border-gold/20" data-aos="fade-up">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Store className="h-5 w-5 mr-2 text-gold" />
                      Ma Boutique
                    </div>
                    <Badge variant={subscriptionInfo.variant}>
                      {subscriptionInfo.label}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-2xl font-bold gold-text">{seller.business_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        URL: tasedda.dz/boutique/{seller.slug}
                      </p>
                    </div>
                    
                    {seller.description && (
                      <div>
                        <h4 className="font-semibold mb-2">Description</h4>
                        <p className="text-muted-foreground">{seller.description}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <Button className="btn-gold">
                        <Eye className="h-4 w-4 mr-2" />
                        Voir ma boutique
                      </Button>
                      <Button variant="outline" className="border-gold/20">
                        Modifier
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Statistiques */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="glass-effect border-gold/20" data-aos="fade-up" data-aos-delay="100">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Produits</p>
                        <p className="text-2xl font-bold gold-text">{stats.totalProducts}</p>
                      </div>
                      <Package className="h-8 w-8 text-gold" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-effect border-gold/20" data-aos="fade-up" data-aos-delay="200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Commandes</p>
                        <p className="text-2xl font-bold text-blue-500">{stats.totalOrders}</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-effect border-gold/20" data-aos="fade-up" data-aos-delay="300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Revenus</p>
                        <p className="text-2xl font-bold text-green-500">
                          {stats.totalRevenue.toFixed(2)} DA
                        </p>
                      </div>
                      <DollarSign className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Produits */}
              <Card className="glass-effect border-gold/20" data-aos="fade-up">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Package className="h-5 w-5 mr-2 text-gold" />
                      Mes Produits
                    </div>
                    <Button className="btn-gold">
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter un produit
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4" />
                    <p>Aucun produit pour le moment</p>
                    <p className="text-sm">Ajoutez vos premiers produits pour commencer à vendre !</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Abonnement */}
              <Card className="glass-effect border-gold/20" data-aos="fade-up">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-gold" />
                    Abonnement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${subscriptionInfo.color} mb-2`}>
                        {subscriptionInfo.label}
                      </div>
                      
                      {seller.subscription_status === 'trial' && (
                        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                          <p className="text-sm text-blue-400 mb-1">Période d'essai</p>
                          <p className="text-sm text-muted-foreground">
                            {daysLeft > 0 ? `${daysLeft} jours restants` : 'Expiré'}
                          </p>
                        </div>
                      )}

                      <div className="mt-4 text-sm text-muted-foreground">
                        <p>Frais mensuel: {seller.monthly_fee} DA</p>
                        <p>Expire le: {new Date(seller.subscription_expires_at).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {seller.subscription_status === 'trial' && daysLeft <= 7 && (
                      <Button className="w-full btn-gold">
                        Activer l'abonnement
                      </Button>
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
                  <Button className="w-full btn-gold">
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un produit
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full border-gold/20"
                    onClick={() => navigate('/profile')}
                  >
                    <Store className="h-4 w-4 mr-2" />
                    Mon Profil
                  </Button>

                  <Button 
                    variant="outline" 
                    className="w-full border-gold/20"
                    disabled
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Statistiques détaillées
                  </Button>
                </CardContent>
              </Card>

              {/* Support */}
              <Card className="glass-effect border-gold/20" data-aos="fade-up">
                <CardHeader>
                  <CardTitle>Support Vendeur</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Besoin d'aide pour votre boutique ? Notre équipe est là pour vous accompagner.
                  </p>
                  <Button variant="outline" className="w-full border-gold/20">
                    Contacter le support
                  </Button>
                </CardContent>
              </Card>

              {/* Guide vendeur */}
              <Card className="glass-effect border-gold/20" data-aos="fade-up">
                <CardHeader>
                  <CardTitle>Guide du Vendeur</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start space-x-2">
                      <div className="w-6 h-6 rounded-full bg-gold text-black flex items-center justify-center text-xs font-bold">1</div>
                      <p className="text-muted-foreground">Ajoutez vos produits avec des photos de qualité</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-6 h-6 rounded-full bg-gold text-black flex items-center justify-center text-xs font-bold">2</div>
                      <p className="text-muted-foreground">Définissez des prix compétitifs</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-6 h-6 rounded-full bg-gold text-black flex items-center justify-center text-xs font-bold">3</div>
                      <p className="text-muted-foreground">Partagez votre boutique sur les réseaux</p>
                    </div>
                  </div>
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

export default SellerSpace;
