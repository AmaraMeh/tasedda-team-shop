import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import HeroSection from '@/components/HeroSection';
import ProductCard from '@/components/ProductCard';
import Footer from '@/components/Layout/Footer';
import Header from '@/components/Layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Crown, Users, Package, ArrowRight, Store, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Product } from '@/types';

const Index = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [taseddaProducts, setTaseddaProducts] = useState<Product[]>([]);
  const [sellerProducts, setSellerProducts] = useState<Product[]>([]);
  const [wholesalerProducts, setWholesalerProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      // Produits Tasedda (ajoutés par admin, sans seller_id)
      const { data: adminProducts } = await supabase
        .from('products')
        .select(`
          *,
          categories(name)
        `)
        .is('seller_id', null)
        .eq('is_active', true)
        .limit(8);

      // Produits des vendeurs normaux
      const { data: vendorProducts } = await supabase
        .from('products')
        .select(`
          *,
          categories(name),
          sellers(business_name, seller_type)
        `)
        .not('seller_id', 'is', null)
        .eq('is_active', true)
        .eq('sellers.seller_type', 'normal')
        .limit(8);

      // Produits des grossistes
      const { data: wholesaleProducts } = await supabase
        .from('products')
        .select(`
          *,
          categories(name),
          sellers(business_name, seller_type)
        `)
        .not('seller_id', 'is', null)
        .eq('is_active', true)
        .eq('sellers.seller_type', 'wholesale')
        .limit(8);

      if (adminProducts) {
        const mappedAdminProducts = adminProducts.map(item => ({
          ...item,
          image_url: item.image_url || '/placeholder.svg',
          image: item.image_url || '/placeholder.svg',
          category: item.categories?.name || 'Sans catégorie',
          inStock: item.stock_quantity > 0
        }));
        setTaseddaProducts(mappedAdminProducts);
      }

      if (vendorProducts) {
        const mappedVendorProducts = vendorProducts.map(item => ({
          ...item,
          image_url: item.image_url || '/placeholder.svg',
          image: item.image_url || '/placeholder.svg',
          category: item.categories?.name || 'Sans catégorie',
          inStock: item.stock_quantity > 0
        }));
        setSellerProducts(mappedVendorProducts);
      }

      if (wholesaleProducts) {
        const mappedWholesaleProducts = wholesaleProducts.map(item => ({
          ...item,
          image_url: item.image_url || '/placeholder.svg',
          image: item.image_url || '/placeholder.svg',
          category: item.categories?.name || 'Sans catégorie',
          inStock: item.stock_quantity > 0
        }));
        setWholesalerProducts(mappedWholesaleProducts);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <HeroSection showTeamCTA={false} showSellerCTA={false} />
      
      {/* Quick Access Cards */}
      <section className="py-12 md:py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Products Card */}
            <Link to="/products">
              <Card className="glass-effect border-gold/20 hover:border-gold/40 transition-all group cursor-pointer h-48 relative overflow-hidden">
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-30"
                  style={{ backgroundImage: `url('/lovable-uploads/251cb271-71b7-4322-aea7-f6a6891f24ee.png')` }}
                />
                <CardContent className="p-6 h-full flex flex-col justify-center items-center text-center relative z-10">
                  <div className="mb-4">
                    <ShoppingBag className="h-12 w-12 mx-auto text-gold mb-2" />
                    <h3 className="text-xl font-bold text-white">PRODUITS</h3>
                    <p className="text-sm text-muted-foreground">Découvrez notre collection</p>
                  </div>
                  <Button className="btn-gold group-hover:scale-105 transition-transform">
                    Explorer
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </Link>

            {/* Other Products Card */}
            <Link to="/local-sellers">
              <Card className="glass-effect border-gold/20 hover:border-gold/40 transition-all group cursor-pointer h-48 relative overflow-hidden">
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-30"
                  style={{ backgroundImage: `url('/lovable-uploads/606c0a0e-b8c6-44e6-b936-ca194681c1ca.png')` }}
                />
                <CardContent className="p-6 h-full flex flex-col justify-center items-center text-center relative z-10">
                  <div className="mb-4">
                    <Store className="h-12 w-12 mx-auto text-gold mb-2" />
                    <h3 className="text-xl font-bold text-white">AUTRES PRODUITS</h3>
                    <p className="text-sm text-muted-foreground">اكتشف منتجات أخرى</p>
                  </div>
                  <Button className="btn-gold group-hover:scale-105 transition-transform">
                    Découvrir
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </Link>

            {/* Wholesale Card */}
            <Link to="/wholesalers">
              <Card className="glass-effect border-gold/20 hover:border-gold/40 transition-all group cursor-pointer h-48 relative overflow-hidden">
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-30"
                  style={{ backgroundImage: `url('/lovable-uploads/d0ab850d-a24b-4ea3-be45-15175fe9f621.png')` }}
                />
                <CardContent className="p-6 h-full flex flex-col justify-center items-center text-center relative z-10">
                  <div className="mb-4">
                    <Package className="h-12 w-12 mx-auto text-gold mb-2" />
                    <h3 className="text-xl font-bold text-white">ACHETEZ EN GROS</h3>
                    <p className="text-sm text-muted-foreground">اشتر بالجملة</p>
                  </div>
                  <Button className="btn-gold group-hover:scale-105 transition-transform">
                    Acheter
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Produits LION by Tasedda Section */}
      {taseddaProducts.length > 0 && (
        <section className="py-12 md:py-20 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-8 md:mb-12">
              <div className="flex items-center justify-center mb-4">
                <Crown className="h-8 w-8 text-gold mr-3" />
                <h2 className="text-2xl md:text-4xl font-bold text-white">
                  LION <span className="gold-text">by Tasedda</span>
                </h2>
              </div>
              <p className="text-lg md:text-xl text-muted-foreground">
                Découvrez notre collection exclusive de la marque Tasedda
              </p>
            </div>
            
            <div className="product-grid">
              {taseddaProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            
            <div className="text-center mt-8">
              <Button asChild className="btn-gold">
                <Link to="/products">
                  <Package className="h-4 w-4 mr-2" />
                  Voir tous les produits
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Produits des Vendeurs Section */}
      {sellerProducts.length > 0 && (
        <section className="py-12 md:py-20 px-4 bg-black/50">
          <div className="container mx-auto">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl md:text-4xl font-bold mb-4 text-white">
                Produits de nos <span className="gold-text">Vendeurs</span>
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground">
                Découvrez une sélection de produits de nos vendeurs partenaires
              </p>
            </div>
            
            <div className="product-grid">
              {sellerProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            
            <div className="text-center mt-8">
              <Button asChild className="btn-gold">
                <Link to="/local-sellers">
                  Voir tous les vendeurs
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Produits des Grossistes Section */}
      {wholesalerProducts.length > 0 && (
        <section className="py-12 md:py-20 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl md:text-4xl font-bold mb-4 text-white">
                Produits <span className="gold-text">Grossistes</span>
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground">
                Achetez en gros auprès de nos grossistes partenaires
              </p>
            </div>
            
            <div className="product-grid">
              {wholesalerProducts.map((product) => (
                <ProductCard key={product.id} product={product} showPrice={false} />
              ))}
            </div>
            
            <div className="text-center mt-8">
              <Button asChild className="btn-gold">
                <Link to="/wholesalers">
                  Voir tous les grossistes
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Join Team Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-gold/10 via-transparent to-gold/10">
        <div className="container mx-auto text-center">
          <div 
            className="h-32 w-32 mx-auto mb-6 bg-cover bg-center rounded-full"
            style={{ backgroundImage: `url('/lovable-uploads/fa144c93-891b-489c-a150-881188b619d4.png')` }}
          />
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Rejoignez <span className="gold-text">LION TEAM DZ</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Gagnez des commissions en rejoignant notre équipe de vente et développez votre réseau
          </p>
          <Button asChild className="btn-gold text-lg px-8 py-3">
            <Link to="/team">
              Rejoindre l'équipe
              <Crown className="h-5 w-5 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
