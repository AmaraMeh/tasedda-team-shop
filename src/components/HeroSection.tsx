
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
          <div className="flex items-center justify-center mb-6 sm:mb-8">
            <Crown className="h-12 w-12 sm:h-16 sm:w-16 text-gold mr-2 sm:mr-4" />
            <div>
              <h1 className="text-4xl sm:text-6xl lg:text-8xl font-display font-bold gold-text leading-none">
                {t('home.hero.title')}
              </h1>
            </div>
          </div>

          {/* Tagline */}
          <h2 className="text-xl sm:text-2xl lg:text-4xl font-semibold mb-4 sm:mb-6 text-white/90 px-4">
            {t('home.hero.subtitle')}
          </h2>
          
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-4">
            {t('home.hero.description')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4">
            <Button asChild size="lg" className="btn-gold w-full sm:w-auto">
              <Link to="/products">
                <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                {t('common.products')}
              </Link>
            </Button>
            
            {showTeamCTA && (
              <Button asChild variant="outline" size="lg" className="border-gold/20 text-gold w-full sm:w-auto">
                <Link to="/team">
                  <Crown className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  {t('common.joinTeam')}
                </Link>
              </Button>
            )}
            
            {showSellerCTA && (
              <Button asChild variant="outline" size="lg" className="border-gold/20 text-gold w-full sm:w-auto">
                <Link to="/seller">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  {t('common.becomeSeller')}
                </Link>
              </Button>
            )}
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto mt-16 px-4">
            <div className="glass-effect rounded-lg p-4 sm:p-6 border border-gold/20" data-aos="fade-up" data-aos-delay="100">
              <Star className="h-6 w-6 sm:h-8 sm:w-8 text-gold mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-semibold mb-2">Qualité Premium</h3>
              <p className="text-muted-foreground text-sm">
                Sélection rigoureuse de vêtements de haute qualité
              </p>
            </div>
            
            <div className="glass-effect rounded-lg p-4 sm:p-6 border border-gold/20" data-aos="fade-up" data-aos-delay="200">
              <Crown className="h-6 w-6 sm:h-8 sm:w-8 text-gold mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-semibold mb-2">Team Lion</h3>
              <p className="text-muted-foreground text-sm">
                Système d'affiliation avec commissions jusqu'à 12%
              </p>
            </div>
            
            <div className="glass-effect rounded-lg p-4 sm:p-6 border border-gold/20" data-aos="fade-up" data-aos-delay="300">
              <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-gold mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-semibold mb-2">Boutiques Tasedda</h3>
              <p className="text-muted-foreground text-sm">
                Réseau de vendeurs partenaires à travers l'Algérie
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-5 h-8 sm:w-6 sm:h-10 border-2 border-gold/40 rounded-full flex justify-center">
          <div className="w-1 h-2 sm:h-3 bg-gold rounded-full mt-2"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
