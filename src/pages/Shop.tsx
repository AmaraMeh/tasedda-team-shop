
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/ProductCard';
import Footer from '@/components/Layout/Footer';
import Header from '@/components/Layout/Header';
import { Seller, Product } from '@/types';
import { MessageCircle, ExternalLink } from 'lucide-react';

const Shop = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchSeller();
      fetchProducts();
    }
  }, [slug]);

  const fetchSeller = async () => {
    try {
      const { data, error } = await supabase
        .from('sellers')
        .select(`
          *,
          profiles(full_name, email, phone)
        `)
        .eq('slug', slug)
        .maybeSingle();

      if (error) {
        console.error('Error fetching seller:', error);
        return;
      }

      if (data) {
        const sellerData: Seller = {
          ...data,
          seller_type: data.seller_type as 'normal' | 'wholesale' | 'local',
          status: data.status as 'pending' | 'active' | 'suspended',
          subscription_status: data.subscription_status as 'trial' | 'active' | 'expired'
        };
        setSeller(sellerData);
      }
    } catch (error) {
      console.error('Error fetching seller:', error);
    }
  };

  const fetchProducts = async () => {
    if (!slug) return;

    try {
      // First get the seller to find the owner
      const { data: sellerData } = await supabase
        .from('sellers')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();

      if (!sellerData) return;

      // Then get products from that seller
      const { data } = await supabase
        .from('products')
        .select(`
          *,
          categories(name)
        `)
        .eq('seller_id', sellerData.id)
        .eq('is_active', true);

      if (data) {
        const productsWithCategory = data.map(item => ({
          ...item,
          description: item.description || '',
          image_url: item.image_url || '/placeholder.svg',
          image: item.image_url || '/placeholder.svg',
          category: item.categories?.name || 'Sans catégorie',
          inStock: item.stock_quantity ? item.stock_quantity > 0 : true,
          is_featured: item.is_featured || false,
          sizes: item.sizes || [],
          colors: item.colors || []
        }));
        setProducts(productsWithCategory);
      }
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

  if (!seller) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Boutique non trouvée</h1>
            <p className="text-muted-foreground mb-6">La boutique que vous recherchez n'existe pas.</p>
            <Button onClick={() => navigate('/')} className="btn-gold">
              Retour à l'accueil
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      {/* Shop Header */}
      <div className="relative">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-3xl font-bold text-white">{seller.business_name}</h1>
                <Badge variant={seller.subscription_status === 'active' ? 'default' : 'secondary'}>
                  {seller.subscription_status === 'active' ? 'Actif' : 
                   seller.subscription_status === 'trial' ? 'Essai' : 'Expiré'}
                </Badge>
              </div>
              
              {seller.description && (
                <p className="text-muted-foreground mb-4">{seller.description}</p>
              )}
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                <span>/{seller.slug}</span>
                <span>•</span>
                <span>{products.length} produits</span>
                <span>•</span>
                <span>{seller.seller_type === 'wholesale' ? 'Grossiste' : 'Vendeur Local'}</span>
              </div>

              {/* Contact buttons */}
              <div className="flex gap-4">
                <Button className="btn-gold">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contacter
                </Button>
                <Button variant="outline" className="border-gold/20">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Plus d'infos
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-4 py-12">
        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Aucun produit disponible dans cette boutique.</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Shop;
