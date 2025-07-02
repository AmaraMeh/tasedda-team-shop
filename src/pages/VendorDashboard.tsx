
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Package, Plus, TrendingUp, DollarSign, Users, Settings } from 'lucide-react';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';

interface Seller {
  id: string;
  business_name: string;
  seller_type: string;
  status: string;
  subscription_status: string;
  subscription_expires_at: string;
  monthly_fee: number;
  is_active: boolean;
}

interface Product {
  id: string;
  name: string;
  price: number;
  stock_quantity: number;
  is_active: boolean;
  created_at: string;
}

const VendorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    totalSales: 0,
    revenue: 0
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchSellerData();
  }, [user, navigate]);

  const fetchSellerData = async () => {
    try {
      // Fetch seller info
      const { data: sellerData, error: sellerError } = await supabase
        .from('sellers')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (sellerError) {
        if (sellerError.code === 'PGRST116') {
          // No seller found, redirect to seller registration
          navigate('/seller');
          return;
        }
        throw sellerError;
      }

      setSeller(sellerData);

      // Fetch products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', sellerData.id)
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;

      setProducts(productsData || []);

      // Calculate stats
      const totalProducts = productsData?.length || 0;
      const activeProducts = productsData?.filter(p => p.is_active).length || 0;

      setStats({
        totalProducts,
        activeProducts,
        totalSales: 0, // This would come from orders
        revenue: 0 // This would come from orders
      });

    } catch (error: any) {
      console.error('Error fetching seller data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données du vendeur",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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

  if (!seller) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Espace Vendeur non trouvé</h1>
          <Button onClick={() => navigate('/seller')} className="btn-gold">
            Devenir vendeur
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Actif</Badge>;
      case 'pending':
        return <Badge variant="secondary">En attente</Badge>;
      case 'suspended':
        return <Badge variant="destructive">Suspendu</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSubscriptionBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-blue-500">Abonnement actif</Badge>;
      case 'trial':
        return <Badge className="bg-yellow-500">Période d'essai</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expiré</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Tableau de bord - {seller.business_name}
          </h1>
          <div className="flex flex-wrap gap-2">
            {getStatusBadge(seller.status)}
            {getSubscriptionBadge(seller.subscription_status)}
            <Badge variant="outline" className="border-gold/20">
              {seller.seller_type === 'wholesale' ? 'Grossiste' : 'Vendeur local'}
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass-effect border-gold/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Total Produits</CardTitle>
              <Package className="h-4 w-4 text-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gold">{stats.totalProducts}</div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-gold/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Produits Actifs</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{stats.activeProducts}</div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-gold/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Ventes</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">{stats.totalSales}</div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-gold/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Revenus</CardTitle>
              <DollarSign className="h-4 w-4 text-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gold">{stats.revenue.toLocaleString()} DA</div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="glass-effect border-gold/20">
            <CardHeader>
              <CardTitle className="text-white">Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => navigate('/add-product')}
                className="w-full btn-gold"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un produit
              </Button>
              <Button 
                onClick={() => navigate('/seller-products')}
                variant="outline"
                className="w-full border-gold/20 text-white hover:bg-gold/10"
              >
                <Package className="h-4 w-4 mr-2" />
                Gérer mes produits
              </Button>
              <Button 
                onClick={() => navigate('/seller-orders')}
                variant="outline"
                className="w-full border-gold/20 text-white hover:bg-gold/10"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Mes commandes
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-effect border-gold/20">
            <CardHeader>
              <CardTitle className="text-white">Informations du compte</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Abonnement</p>
                <p className="text-white font-medium">
                  {seller.monthly_fee.toLocaleString()} DA/mois
                </p>
              </div>
              {seller.subscription_expires_at && (
                <div>
                  <p className="text-sm text-muted-foreground">Expire le</p>
                  <p className="text-white font-medium">
                    {new Date(seller.subscription_expires_at).toLocaleDateString()}
                  </p>
                </div>
              )}
              <Button 
                variant="outline"
                className="w-full border-gold/20 text-white hover:bg-gold/10"
              >
                <Settings className="h-4 w-4 mr-2" />
                Paramètres
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Products */}
        <Card className="glass-effect border-gold/20">
          <CardHeader>
            <CardTitle className="text-white">Produits récents</CardTitle>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">Aucun produit ajouté</p>
                <Button onClick={() => navigate('/add-product')} className="btn-gold">
                  Ajouter votre premier produit
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {products.slice(0, 5).map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-4 bg-black/30 rounded-lg">
                    <div>
                      <h3 className="font-medium text-white">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Stock: {product.stock_quantity} | Prix: {product.price.toLocaleString()} DA
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {product.is_active ? (
                        <Badge className="bg-green-500">Actif</Badge>
                      ) : (
                        <Badge variant="secondary">Inactif</Badge>
                      )}
                    </div>
                  </div>
                ))}
                {products.length > 5 && (
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/seller-products')}
                    className="w-full border-gold/20 text-white hover:bg-gold/10 mt-4"
                  >
                    Voir tous les produits ({products.length})
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default VendorDashboard;
