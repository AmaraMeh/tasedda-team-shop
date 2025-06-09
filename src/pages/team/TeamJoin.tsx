
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Users, DollarSign, Gift, Headphones, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';

const TeamJoin = () => {
  const { t } = useTranslation();

  const benefits = [
    {
      icon: DollarSign,
      title: t('team.benefits.commission'),
      description: "Gagnez 5% sur chaque vente réalisée grâce à votre code promo"
    },
    {
      icon: Gift,
      title: t('team.benefits.promoCode'),
      description: "Recevez un code promo unique à partager avec vos contacts"
    },
    {
      icon: Headphones,
      title: t('team.benefits.support'),
      description: "Bénéficiez d'un support dédié pour vous accompagner"
    },
    {
      icon: GraduationCap,
      title: t('team.benefits.training'),
      description: "Accédez à des formations gratuites pour optimiser vos ventes"
    },
    {
      icon: Users,
      title: t('team.benefits.community'),
      description: "Rejoignez une communauté active de vendeurs motivés"
    }
  ];

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <div className="container mx-auto px-4 py-8 md:py-16">
        {/* Hero Section */}
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6 gold-text">
            {t('team.title')}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-6 md:mb-8">
            {t('team.description')}
          </p>
          <Button asChild size="lg" className="btn-gold text-lg px-8 py-4">
            <Link to="/team">{t('team.joinTeam')}</Link>
          </Button>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16">
          {benefits.map((benefit, index) => (
            <Card key={index} className="bg-card/50 border-gold/20 hover:border-gold/40 transition-colors">
              <CardHeader className="text-center">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="w-6 h-6 md:w-8 md:h-8 text-gold" />
                </div>
                <CardTitle className="text-lg md:text-xl">{benefit.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-sm md:text-base">
                  {benefit.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* How it works */}
        <div className="bg-gradient-to-r from-gold/5 to-gold-light/5 rounded-2xl p-6 md:p-12 mb-12 md:mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12 gold-text">
            Comment ça marche ?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gold text-black rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg md:text-xl">
                1
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">Inscrivez-vous</h3>
              <p className="text-muted-foreground text-sm md:text-base">
                Créez votre compte et soumettez votre demande d'adhésion
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gold text-black rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg md:text-xl">
                2
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">Validation</h3>
              <p className="text-muted-foreground text-sm md:text-base">
                Notre équipe valide votre profil et vous attribue un code promo
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gold text-black rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg md:text-xl">
                3
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">Vendez</h3>
              <p className="text-muted-foreground text-sm md:text-base">
                Partagez votre code et gagnez 5% sur chaque vente
              </p>
            </div>
          </div>
        </div>

        {/* CTA Final */}
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">
            Prêt à rejoindre l'aventure ?
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-6 md:mb-8">
            Rejoignez des centaines de membres qui gagnent déjà avec Lion
          </p>
          <Button asChild size="lg" className="btn-gold text-lg px-8 py-4">
            <Link to="/team">{t('team.joinTeam')}</Link>
          </Button>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default TeamJoin;
