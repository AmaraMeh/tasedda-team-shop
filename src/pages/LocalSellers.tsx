
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import ProductCard from '@/components/ProductCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Store, Eye, MessageCircle, Package } from 'lucide-react';

interface Seller {
  id: string;
  business_name: string;
  slug: string;
  description: string;
  subscription_status: string;
  created_at: string;
  user_id: string;
  profiles?: {
    full_name: string;
    city: string;
    wilaya: string;
  };
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  image: string;
  seller_id: string;
  is_active: boolean;
  stock_quantity: number;
  category: string;
  inStock: boolean;
  is_featured: boolean;
  categories?: {
    name: string;
  };
  sellers?: {
    business_name: string;
    slug: string;
  };
}

const LocalSellers = () => {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'sellers' | 'products'>('sellers');
  const navigate = useNavigate();

  useEffect(() => {
    fetchSellers();
    fetchProducts();
  }, []);

  const fetchSellers = async () => {
    try {
      const { data, error } = await supabase
        .from('sellers')
        .select(`
          *,
          profiles(full_name, city, wilaya)
        `)
        .eq('seller_type', 'local')
        .eq('is_active', true)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSellers(data || []);
    } catch (error) {
      console.error('Error fetching sellers:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories(name),
          sellers!inner(business_name, slug, seller_type)
        `)
        .eq('sellers.seller_type', 'local')
        .eq('sellers.is_active', true)
        .eq('sellers.status', 'approved')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const productsWithImages = (data || []).map(product => ({
        ...product,
        description: product.description || '',
        image_url: product.image_url || '/placeholder.svg',
        image: product.image_url || '/placeholder.svg',
        category: product.categories?.name || 'Sans catégorie',
        inStock: product.stock_quantity > 0,
        is_featured: product.is_featured || false,
        sizes: product.sizes || [],
        colors: product.colors || [],
        sellers: {
          business_name: product.sellers.business_name,
          slug: product.sellers.slug,
          seller_type: product.sellers.seller_type
        }
      }));
      
      setProducts(productsWithImages);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gold"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <main className="py-20">
        <section className="container mx-auto px-4 text-center mb-12" data-aos="fade-up">
          <MapPin className="h-16 w-16 mx-auto mb-4 text-gold" />
          <h1 className="text-4xl font-display font-bold mb-4">
            Vendeurs <span className="gold-text">Locaux</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Découvrez les vendeurs locaux de votre région et leurs produits authentiques
          </p>
        </section>

        <div className="container mx-auto px-4">
          {/* Tabs */}
          <div className="flex justify-center mb-8">
            <div className="flex space-x-1 bg-gray-900/50 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('sellers')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'sellers'
                    ? 'bg-gold text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Vendeurs ({sellers.length})
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'products'
                    ? 'bg-gold text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Produits ({products.length})
              </button>
            </div>
          </div>

          {activeTab === 'sellers' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sellers.map((seller) => (
                <Card key={seller.id} className="glass-effect border-gold/20 hover:border-gold/40 transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-gold">{seller.business_name}</CardTitle>
                      <Badge className="bg-green-500/20 text-green-400">
                        Actif
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {seller.profiles && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 mr-2" />
                          {seller.profiles.city}, {seller.profiles.wilaya}
                        </div>
                      )}
                      
                      {seller.description && (
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {seller.description}
                        </p>
                      )}
                      
                      <div className="flex space-x-2">
                        <Button 
                          onClick={() => navigate(`/boutique/${seller.slug}`)}
                          className="flex-1 btn-gold"
                          size="sm"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Voir boutique
                        </Button>
                        <Button variant="outline" size="sm" className="border-gold/20">
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map((product) => (
                <div key={product.id} className="relative">
                  <ProductCard product={product} />
                  <div className="mt-2 text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/boutique/${product.sellers?.slug}`)}
                      className="text-xs border-gold/20 hover:border-gold/40"
                    >
                      <Store className="h-3 w-3 mr-1" />
                      {product.sellers?.business_name}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {((activeTab === 'sellers' && sellers.length === 0) || 
            (activeTab === 'products' && products.length === 0)) && (
            <div className="text-center py-12">
              <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold text-white mb-2">
                {activeTab === 'sellers' ? 'Aucun vendeur local' : 'Aucun produit'}
              </h3>
              <p className="text-muted-foreground">
                {activeTab === 'sellers' 
                  ? 'Aucun vendeur local disponible pour le moment.'
                  : 'Aucun produit disponible pour le moment.'
                }
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LocalSellers;
