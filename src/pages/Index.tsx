
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
import { Crown, Users, Package, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Product } from '@/types';

const Index = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [taseddaProducts, setTaseddaProducts] = useState<Product[]>([]);
  const [sellerProducts, setSellerProducts] = useState<Product[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
    if (user) {
      checkUserRole();
    }
  }, [user]);

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

      // Produits des vendeurs
      const { data: vendorProducts } = await supabase
        .from('products')
        .select(`
          *,
          categories(name),
          sellers(business_name, seller_type)
        `)
        .not('seller_id', 'is', null)
        .eq('is_active', true)
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
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const checkUserRole = async () => {
    if (!user) return;

    try {
      // Check if admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (profile?.is_admin) {
        setUserRole('admin');
        return;
      }

      // Check if team member
      const { data: teamMember } = await supabase
        .from('team_members')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (teamMember) {
        setUserRole('team');
        return;
      }

      // Check if seller
      const { data: seller } = await supabase
        .from('sellers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (seller) {
        setUserRole('seller');
        return;
      }

      setUserRole('user');
    } catch (error) {
      console.error('Error checking user role:', error);
      setUserRole('user');
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <HeroSection showTeamCTA={userRole !== 'team'} showSellerCTA={userRole !== 'seller'} />
      
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
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
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

      {/* Vendeurs Section */}
      <section className="py-12 md:py-20 px-4 bg-black/50">
        <div className="container mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-4xl font-bold mb-4 text-white">
              Nos <span className="gold-text">Partenaires</span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground">
              Découvrez nos vendeurs locaux et grossistes partenaires
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Vendeurs Locaux */}
            <Card className="glass-effect border-gold/20 hover:border-gold/40 transition-all group">
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <Users className="h-16 w-16 mx-auto text-gold mb-4" />
                  <h3 className="text-2xl font-bold mb-2 text-white">Vendeurs Locaux</h3>
                  <p className="text-muted-foreground">
                    Découvrez nos vendeurs locaux de confiance dans votre région
                  </p>
                </div>
                <Button asChild className="btn-gold w-full group-hover:scale-105 transition-transform">
                  <Link to="/local-sellers">
                    Découvrir les vendeurs
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Grossistes */}
            <Card className="glass-effect border-gold/20 hover:border-gold/40 transition-all group">
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <Package className="h-16 w-16 mx-auto text-gold mb-4" />
                  <h3 className="text-2xl font-bold mb-2 text-white">Grossistes</h3>
                  <p className="text-muted-foreground">
                    Achetez en gros auprès de nos grossistes partenaires
                  </p>
                </div>
                <Button asChild className="btn-gold w-full group-hover:scale-105 transition-transform">
                  <Link to="/wholesalers">
                    Voir les grossistes
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Produits des Vendeurs Section */}
      {sellerProducts.length > 0 && (
        <section className="py-12 md:py-20 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl md:text-4xl font-bold mb-4 text-white">
                Produits de nos <span className="gold-text">Vendeurs</span>
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground">
                Découvrez une sélection de produits de nos vendeurs partenaires
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
              {sellerProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            
            <div className="text-center mt-8">
              <Button asChild className="btn-gold">
                <Link to="/products">
                  Voir tous les produits
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default Index;
