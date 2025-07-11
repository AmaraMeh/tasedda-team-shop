
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Store, Package, TrendingUp, DollarSign, Plus, Eye, Users, ShoppingCart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

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
  seller_type: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  stock_quantity: number;
  is_active: boolean;
  created_at: string;
}

interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  order_status: string;
  created_at: string;
  profiles?: {
    full_name: string;
    email: string;
  };
}

interface Stats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  activeProducts: number;
}

const SellerSpace = () => {
  const { user, loading } = useAuth();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeProducts: 0
  });
  const navigate = useNavigate();
  const { toast } = useToast();

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
      await Promise.all([
        loadProducts(data.id),
        loadOrders(data.id),
        loadStats(data.id)
      ]);
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

  const loadProducts = async (sellerId: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', sellerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadOrders = async (sellerId: string) => {
    try {
      // For now, we'll use a placeholder until we have seller_id in orders table
      setOrders([]);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const loadStats = async (sellerId: string) => {
    try {
      // Load products stats
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', sellerId);

      const totalProducts = productsData?.length || 0;
      const activeProducts = productsData?.filter(p => p.is_active)?.length || 0;

      setStats({
        totalProducts,
        activeProducts,
        totalOrders: 0,
        totalRevenue: 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
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
              {/* Statistiques */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="glass-effect border-gold/20" data-aos="fade-up" data-aos-delay="100">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Produits</p>
                        <p className="text-2xl font-bold gold-text">{stats.totalProducts}</p>
                        <p className="text-xs text-muted-foreground">{stats.activeProducts} actifs</p>
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
                      <ShoppingCart className="h-8 w-8 text-blue-500" />
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

                <Card className="glass-effect border-gold/20" data-aos="fade-up" data-aos-delay="400">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Clients</p>
                        <p className="text-2xl font-bold text-purple-500">{orders.length}</p>
                      </div>
                      <Users className="h-8 w-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Produits récents */}
              <Card className="glass-effect border-gold/20" data-aos="fade-up">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Package className="h-5 w-5 mr-2 text-gold" />
                      Mes Produits
                    </div>
                    <Button onClick={() => navigate('/add-product')} className="btn-gold">
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter un produit
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {products.length > 0 ? (
                    <div className="space-y-4">
                      {products.slice(0, 5).map((product) => (
                        <div key={product.id} className="flex items-center justify-between p-4 bg-black/30 rounded-lg">
                          <div>
                            <h4 className="font-semibold text-white">{product.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {product.price.toLocaleString()} DA • Stock: {product.stock_quantity}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={product.is_active ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
                              {product.is_active ? 'Actif' : 'Inactif'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                      {products.length > 5 && (
                        <div className="text-center pt-4">
                          <Button variant="outline" className="border-gold/20">
                            Voir tous les produits ({products.length})
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Package className="h-12 w-12 mx-auto mb-4" />
                      <p>Aucun produit pour le moment</p>
                      <p className="text-sm">Ajoutez vos premiers produits pour commencer à vendre !</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Informations boutique */}
              <Card className="glass-effect border-gold/20" data-aos="fade-up">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Store className="h-5 w-5 mr-2 text-gold" />
                      Ma Boutique
                    </div>
                    <Badge variant={seller.subscription_status === 'active' ? 'default' : 'secondary'}>
                      {seller.subscription_status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold gold-text">{seller.business_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Type: {seller.seller_type === 'wholesale' ? 'Grossiste' : 'Vendeur Local'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        URL: tasedda.dz/boutique/{seller.slug}
                      </p>
                    </div>
                    
                    {seller.description && (
                      <div>
                        <h4 className="font-semibold mb-2">Description</h4>
                        <p className="text-muted-foreground text-sm">{seller.description}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <Button 
                        className="btn-gold flex-1 mr-2"
                        onClick={() => navigate(`/boutique/${seller.slug}`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Voir ma boutique
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions rapides */}
              <Card className="glass-effect border-gold/20" data-aos="fade-up">
                <CardHeader>
                  <CardTitle>Actions Rapides</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button onClick={() => navigate('/add-product')} className="w-full btn-gold">
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
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Statistiques détaillées
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

export default SellerSpace;
