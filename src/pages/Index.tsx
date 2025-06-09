import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import HeroSection from '@/components/HeroSection';
import ProductCard from '@/components/ProductCard';
import Footer from '@/components/Layout/Footer';
import Header from '@/components/Layout/Header';
import { Product } from '@/types';

const Index = () => {
  const { user } = useAuth();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    fetchFeaturedProducts();
    if (user) {
      checkUserRole();
    }
  }, [user]);

  const fetchFeaturedProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select(`
        *,
        categories(name)
      `)
      .eq('is_featured', true)
      .eq('is_active', true)
      .limit(8);

    if (data) {
      const products = data.map(item => ({
        ...item,
        image: item.image_url || '/placeholder.svg',
        category: item.categories?.name || 'Sans catégorie',
        inStock: item.stock_quantity ? item.stock_quantity > 0 : true
      }));
      setFeaturedProducts(products);
    }
  };

  const checkUserRole = async () => {
    if (!user) return;

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
  };

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <HeroSection showTeamCTA={userRole !== 'team'} showSellerCTA={userRole !== 'seller'} />
      
      {/* Featured Products Section */}
      <section className="py-12 md:py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-4xl font-bold mb-4 gold-text">{t('home.featuredProducts.title')}</h2>
            <p className="text-lg md:text-xl text-muted-foreground">{t('home.featuredProducts.subtitle')}</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
