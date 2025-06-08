
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import ProductCard from '@/components/ProductCard';
import Footer from '@/components/Layout/Footer';
import { Shop as ShopType, Product } from '@/types';

const Shop = () => {
  const { slug } = useParams();
  const [shop, setShop] = useState<ShopType | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchShop();
      fetchProducts();
    }
  }, [slug]);

  const fetchShop = async () => {
    const { data, error } = await supabase
      .from('shops')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('Error fetching shop:', error);
    } else if (data) {
      const typedShop: ShopType = {
        ...data,
        subscription_status: data.subscription_status as 'active' | 'trial' | 'expired'
      };
      setShop(typedShop);
    }
  };

  const fetchProducts = async () => {
    if (!slug) return;

    // First get the shop to find the owner
    const { data: shopData } = await supabase
      .from('shops')
      .select('user_id')
      .eq('slug', slug)
      .single();

    if (!shopData) return;

    // Then get products from that seller
    const { data } = await supabase
      .from('products')
      .select(`
        *,
        categories(name)
      `)
      .eq('seller_id', shopData.user_id)
      .eq('is_active', true);

    if (data) {
      const productsWithCategory = data.map(item => ({
        ...item,
        category: item.categories?.name || 'Sans catégorie',
        inStock: item.stock_quantity ? item.stock_quantity > 0 : true
      }));
      setProducts(productsWithCategory);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gold"></div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Boutique non trouvée</h1>
          <p className="text-muted-foreground">La boutique que vous recherchez n'existe pas.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Shop Header */}
      <div className="relative">
        {shop.cover_url && (
          <div 
            className="h-64 bg-cover bg-center"
            style={{ backgroundImage: `url(${shop.cover_url})` }}
          >
            <div className="absolute inset-0 bg-black/50" />
          </div>
        )}
        
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {shop.logo_url && (
              <img
                src={shop.logo_url}
                alt={shop.name}
                className="w-24 h-24 rounded-full border-4 border-gold object-cover"
              />
            )}
            
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-3xl font-bold text-white">{shop.name}</h1>
                <Badge variant={shop.subscription_status === 'active' ? 'default' : 'secondary'}>
                  {shop.subscription_status === 'active' ? 'Actif' : 
                   shop.subscription_status === 'trial' ? 'Essai' : 'Expiré'}
                </Badge>
              </div>
              
              {shop.description && (
                <p className="text-muted-foreground mb-4">{shop.description}</p>
              )}
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>/{shop.slug}</span>
                <span>•</span>
                <span>{products.length} produits</span>
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
