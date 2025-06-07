
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Star, Users, Zap } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background avec gradient animé */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-card">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--primary)_0%,_transparent_50%)] opacity-10" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gold/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Contenu texte */}
          <div className="space-y-8 text-center lg:text-left">
            <div className="space-y-4">
              <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
                🇩🇿 Made in Algeria
              </Badge>
              
              <h1 className="text-4xl lg:text-6xl font-display font-bold leading-tight">
                <span className="gold-text">Tasedda</span>
                <br />
                <span className="text-foreground">Style Algérien</span>
                <br />
                <span className="text-foreground/80">Premium</span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-lg mx-auto lg:mx-0">
                Découvrez les dernières tendances mode avec notre sélection exclusive de vêtements. 
                Rejoignez notre communauté et bénéficiez de commissions exceptionnelles.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 py-6">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-2 mx-auto">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <p className="text-2xl font-bold text-foreground">500+</p>
                <p className="text-sm text-muted-foreground">Membres Team</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-2 mx-auto">
                  <ShoppingBag className="h-6 w-6 text-primary" />
                </div>
                <p className="text-2xl font-bold text-foreground">2K+</p>
                <p className="text-sm text-muted-foreground">Produits</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-2 mx-auto">
                  <Star className="h-6 w-6 text-primary" />
                </div>
                <p className="text-2xl font-bold text-foreground">4.9</p>
                <p className="text-sm text-muted-foreground">Satisfaction</p>
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button size="lg" className="btn-gold text-lg px-8">
                <ShoppingBag className="h-5 w-5 mr-2" />
                Découvrir la Boutique
              </Button>
              <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                <Zap className="h-5 w-5 mr-2" />
                Rejoindre la Team
              </Button>
            </div>

            {/* Code promo */}
            <div className="p-6 bg-card/50 backdrop-blur rounded-lg border border-primary/20">
              <p className="text-sm text-muted-foreground mb-2">Code promo exclusif</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-mono font-bold text-primary">WELCOME5</span>
                <Badge className="bg-primary text-primary-foreground">-5%</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Réduction immédiate sur votre première commande
              </p>
            </div>
          </div>

          {/* Visuel produits */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="aspect-[3/4] bg-gradient-to-br from-card to-muted rounded-xl overflow-hidden shadow-lg">
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground text-6xl">👔</span>
                  </div>
                </div>
                <div className="aspect-square bg-gradient-to-br from-primary/10 to-gold/10 rounded-xl overflow-hidden shadow-lg flex items-center justify-center">
                  <span className="text-primary text-4xl">👗</span>
                </div>
              </div>
              <div className="space-y-4 mt-8">
                <div className="aspect-square bg-gradient-to-br from-gold/10 to-primary/10 rounded-xl overflow-hidden shadow-lg flex items-center justify-center">
                  <span className="text-primary text-4xl">👟</span>
                </div>
                <div className="aspect-[3/4] bg-gradient-to-br from-muted to-card rounded-xl overflow-hidden shadow-lg">
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground text-6xl">👜</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold animate-float">
              🔥 Nouveautés
            </div>
            <div className="absolute bottom-8 -left-4 bg-card border border-border px-4 py-2 rounded-full text-sm font-semibold shadow-lg animate-float" style={{ animationDelay: '1s' }}>
              💎 Premium Quality
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
