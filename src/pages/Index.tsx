
import { useEffect, useState } from 'react';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import HeroSection from '@/components/HeroSection';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Gift, Users, TrendingUp, Star, Shield } from 'lucide-react';

// Mock data pour les produits
const featuredProducts = [
  {
    id: '1',
    name: 'Veste Élégante Homme Premium',
    price: 12500,
    originalPrice: 15000,
    image: '/placeholder.svg',
    category: 'Homme',
    inStock: true,
    isNew: true
  },
  {
    id: '2',
    name: 'Robe Traditionnelle Moderne',
    price: 8500,
    image: '/placeholder.svg',
    category: 'Femme',
    inStock: true,
    isNew: false
  },
  {
    id: '3',
    name: 'Ensemble Enfant Confort',
    price: 4500,
    originalPrice: 5500,
    image: '/placeholder.svg',
    category: 'Enfant',
    inStock: true,
    isNew: true
  },
  {
    id: '4',
    name: 'Accessoire Mode Tendance',
    price: 2200,
    image: '/placeholder.svg',
    category: 'Accessoires',
    inStock: false,
    isNew: false
  }
];

const Index = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Animation au scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.scroll-fade-in').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        {/* Hero Section */}
        <HeroSection />

        {/* Section Produits Vedettes */}
        <section className="py-20 bg-card/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16 scroll-fade-in">
              <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
                ⭐ Sélection Premium
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-display font-bold mb-4">
                Nos <span className="gold-text">Coups de Cœur</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Découvrez notre sélection exclusive de vêtements tendance, choisis avec soin par notre équipe
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 scroll-fade-in">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="text-center mt-12">
              <Button size="lg" className="btn-gold">
                Voir Tous les Produits
              </Button>
            </div>
          </div>
        </section>

        {/* Section Team Avantages */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16 scroll-fade-in">
              <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
                🚀 Team Tasedda
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-display font-bold mb-4">
                Rejoignez Notre <span className="gold-text">Équipe</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Devenez ambassadeur Tasedda et bénéficiez de commissions exclusives jusqu'à 12%
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 scroll-fade-in">
              {/* Commission */}
              <Card className="border-primary/20 hover:border-primary/40 transition-all duration-300 card-hover">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Commissions Évolutives</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <p className="text-muted-foreground">
                    Commencez avec 6% et progressez jusqu'à 12% selon vos performances
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Rang 1</span>
                      <Badge variant="outline">6%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Rang 5</span>
                      <Badge className="bg-primary text-primary-foreground">12%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Parrainage */}
              <Card className="border-primary/20 hover:border-primary/40 transition-all duration-300 card-hover">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Gift className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Prime de Parrainage</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <p className="text-muted-foreground">
                    Invitez des amis et recevez 300 DA pour chaque filleul actif
                  </p>
                  <div className="text-center">
                    <span className="text-3xl font-bold text-primary">300 DA</span>
                    <p className="text-sm text-muted-foreground">par parrainage réussi</p>
                  </div>
                </CardContent>
              </Card>

              {/* Communauté */}
              <Card className="border-primary/20 hover:border-primary/40 transition-all duration-300 card-hover">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Communauté Active</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <p className="text-muted-foreground">
                    Rejoignez plus de 500 membres actifs et partagez vos succès
                  </p>
                  <div className="flex items-center justify-center space-x-2">
                    <Star className="h-5 w-5 text-primary fill-current" />
                    <span className="font-semibold">Support Premium 24/7</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mt-12">
              <Button size="lg" className="btn-gold">
                <Zap className="h-5 w-5 mr-2" />
                Rejoindre la Team Maintenant
              </Button>
            </div>
          </div>
        </section>

        {/* Section Vendeurs */}
        <section className="py-20 bg-card/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center scroll-fade-in">
              <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
                🏪 Espace Vendeurs
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-display font-bold mb-6">
                Créez Votre <span className="gold-text">Boutique</span> en Ligne
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Développez votre business depuis chez vous avec notre plateforme vendeurs
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-background/50 backdrop-blur rounded-lg p-6 border border-border">
                  <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">1 Mois Gratuit</h3>
                  <p className="text-sm text-muted-foreground">
                    Testez notre plateforme sans engagement
                  </p>
                </div>
                <div className="bg-background/50 backdrop-blur rounded-lg p-6 border border-border">
                  <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Support Dédié</h3>
                  <p className="text-sm text-muted-foreground">
                    Accompagnement personnalisé pour votre réussite
                  </p>
                </div>
                <div className="bg-background/50 backdrop-blur rounded-lg p-6 border border-border">
                  <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">700 DA/mois</h3>
                  <p className="text-sm text-muted-foreground">
                    Tarif abordable pour développer votre business
                  </p>
                </div>
              </div>

              <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                Créer Ma Boutique
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
