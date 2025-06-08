import { Button } from '@/components/ui/button';
import { Crown, Star, TrendingUp, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface HeroSectionProps {
  showTeamCTA?: boolean;
  showSellerCTA?: boolean;
}

const HeroSection = ({ showTeamCTA = true, showSellerCTA = true }: HeroSectionProps) => {
  const { t } = useTranslation();

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-black to-gold/10 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 bg-[url('/placeholder.svg')] bg-cover bg-center opacity-5"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
      
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto" data-aos="fade-up">
          {/* Logo/Brand */}
          <div className="flex items-center justify-center mb-8">
            <Crown className="h-16 w-16 text-gold mr-4" />
            <div>
              <h1 className="text-6xl lg:text-8xl font-display font-bold gold-text leading-none">
                {t('home.hero.title')}
              </h1>
            </div>
          </div>

          {/* Tagline */}
          <h2 className="text-2xl lg:text-4xl font-semibold mb-6 text-white/90">
            {t('home.hero.subtitle')}
          </h2>
          
          <p className="text-lg lg:text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            {t('home.hero.description')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="btn-gold">
              <Link to="/products">
                <ShoppingCart className="h-5 w-5 mr-2" />
                {t('common.products')}
              </Link>
            </Button>
            
            {showTeamCTA && (
              <Button asChild variant="outline" size="lg" className="border-gold/20 text-gold">
                <Link to="/team">
                  <Crown className="h-5 w-5 mr-2" />
                  {t('common.joinTeam')}
                </Link>
              </Button>
            )}
            
            {showSellerCTA && (
              <Button asChild variant="outline" size="lg" className="border-gold/20 text-gold">
                <Link to="/seller">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  {t('common.becomeSeller')}
                </Link>
              </Button>
            )}
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="glass-effect rounded-lg p-6 border border-gold/20" data-aos="fade-up" data-aos-delay="100">
              <Star className="h-8 w-8 text-gold mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Qualité Premium</h3>
              <p className="text-muted-foreground text-sm">
                Sélection rigoureuse de vêtements de haute qualité
              </p>
            </div>
            
            <div className="glass-effect rounded-lg p-6 border border-gold/20" data-aos="fade-up" data-aos-delay="200">
              <Crown className="h-8 w-8 text-gold mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Team Lion</h3>
              <p className="text-muted-foreground text-sm">
                Système d'affiliation avec commissions jusqu'à 12%
              </p>
            </div>
            
            <div className="glass-effect rounded-lg p-6 border border-gold/20" data-aos="fade-up" data-aos-delay="300">
              <TrendingUp className="h-8 w-8 text-gold mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Boutiques Tasedda</h3>
              <p className="text-muted-foreground text-sm">
                Réseau de vendeurs partenaires à travers l'Algérie
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-gold/40 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-gold rounded-full mt-2"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
