
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import HeroSection from '@/components/HeroSection';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Crown, Star, TrendingUp, Award } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  image_url?: string;
  is_featured: boolean;
}

interface TopMember {
  promo_code: string;
  total_sales: number;
  profile?: {
    full_name: string;
  };
}

const Index = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [topMember, setTopMember] = useState<TopMember | null>(null);

  useEffect(() => {
    fetchFeaturedProducts();
    fetchTopMember();
  }, []);

  const fetchFeaturedProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('is_featured', true)
      .eq('is_active', true)
      .limit(8);
    setFeaturedProducts(data || []);
  };

  const fetchTopMember = async () => {
    // Récupérer le membre avec le plus de ventes
    const { data: members } = await supabase
      .from('team_members')
      .select(`
        promo_code,
        total_sales,
        profiles!inner(full_name)
      `)
      .order('total_sales', { ascending: false })
      .limit(1);
    
    if (members && members.length > 0) {
      setTopMember(members[0]);
    }
  };

  // Produits par défaut pour demo
  const defaultProducts = [
    {
      id: '1',
      name: 'Robe Élégante Noire',
      price: 4500,
      original_price: 6000,
      image_url: '/placeholder.svg',
      is_featured: true
    },
    {
      id: '2', 
      name: 'Pantalon Chic Doré',
      price: 3200,
      original_price: 4000,
      image_url: '/placeholder.svg',
      is_featured: true
    },
    {
      id: '3',
      name: 'Chemise Business Premium',
      price: 2800,
      original_price: 3500,
      image_url: '/placeholder.svg',
      is_featured: true
    },
    {
      id: '4',
      name: 'Ensemble Sport Luxe',
      price: 5200,
      original_price: 6500,
      image_url: '/placeholder.svg',
      is_featured: true
    }
  ];

  const productsToShow = featuredProducts.length > 0 ? featuredProducts : defaultProducts;

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      {/* Hero Section */}
      <HeroSection />

      {/* Section Produits Vedettes */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12" data-aos="fade-up">
            <h2 className="text-3xl lg:text-4xl font-display font-bold mb-4">
              Produits <span className="gold-text">Vedettes</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Découvrez notre sélection de vêtements premium, soigneusement choisis pour vous
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {productsToShow.map((product, index) => (
              <div key={product.id} data-aos="fade-up" data-aos-delay={index * 100}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          <div className="text-center" data-aos="fade-up">
            <Button className="btn-gold">
              <TrendingUp className="h-4 w-4 mr-2" />
              Voir tous les produits
            </Button>
          </div>
        </div>
      </section>

      {/* Section Team */}
      <section className="py-20 bg-gradient-to-r from-black via-gold/5 to-black">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div data-aos="fade-right">
              <h2 className="text-3xl lg:text-4xl font-display font-bold mb-6">
                Rejoignez la <span className="gold-text">Team Lion</span>
              </h2>
              <p className="text-muted-foreground mb-8 text-lg">
                Devenez ambassadeur et gagnez jusqu'à 12% de commission sur chaque vente. 
                Évoluez dans les rangs et augmentez vos revenus avec notre système d'affiliation unique.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-gold mr-3" />
                  <span>Commission évolutive de 6% à 12%</span>
                </div>
                <div className="flex items-center">
                  <Crown className="h-5 w-5 text-gold mr-3" />
                  <span>Prime de parrainage de 300 DA</span>
                </div>
                <div className="flex items-center">
                  <Award className="h-5 w-5 text-gold mr-3" />
                  <span>Système de rangs prestigieux</span>
                </div>
              </div>
              <Link to="/team">
                <Button className="btn-gold">
                  <Crown className="h-4 w-4 mr-2" />
                  Rejoindre la Team
                </Button>
              </Link>
            </div>

            <div className="text-center" data-aos="fade-left">
              <div className="gold-gradient rounded-lg p-1 inline-block mb-6">
                <div className="bg-black rounded-lg px-8 py-12">
                  <Crown className="h-16 w-16 mx-auto mb-4 text-gold" />
                  <h3 className="text-2xl font-bold gold-text mb-2">
                    Plus de 500+ Membres
                  </h3>
                  <p className="text-muted-foreground">
                    Rejoignez notre communauté d'ambassadeurs actifs
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Vendeurs */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12" data-aos="fade-up">
            <h2 className="text-3xl lg:text-4xl font-display font-bold mb-4">
              Créez Votre <span className="gold-text">Boutique</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Vendeurs à domicile, développez votre business avec notre plateforme. 
              1 mois gratuit + 700 DA/mois seulement.
            </p>
          </div>

          <div className="text-center" data-aos="fade-up">
            <Link to="/seller">
              <Button className="btn-gold">
                Créer ma boutique
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Meilleur contributeur */}
      {topMember && (
        <section className="py-12 bg-gold/10 border-y border-gold/20">
          <div className="container mx-auto px-4">
            <div className="text-center" data-aos="fade-up">
              <h3 className="text-xl font-bold gold-text mb-2">
                🏆 Meilleur Contributeur du Mois
              </h3>
              <div className="inline-flex items-center space-x-4 bg-black/50 rounded-lg px-6 py-3">
                <Crown className="h-6 w-6 text-gold" />
                <div>
                  <div className="font-bold text-gold">{topMember.profile?.full_name}</div>
                  <div className="text-sm text-muted-foreground">
                    {topMember.total_sales} ventes • Code: {topMember.promo_code}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default Index;
