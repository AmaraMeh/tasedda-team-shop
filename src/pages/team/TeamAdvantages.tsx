
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, Award, Users, Gift, Clock } from 'lucide-react';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';

const TeamAdvantages = () => {
  const { t } = useTranslation();

  const advantages = [
    {
      icon: DollarSign,
      title: "Commission de 5%",
      description: "Gagnez 5% de commission sur chaque vente réalisée avec votre code promo personnel.",
      color: "text-green-500"
    },
    {
      icon: TrendingUp,
      title: "Revenus récurrents",
      description: "Construisez un revenu passif en développant votre réseau de clients fidèles.",
      color: "text-blue-500"
    },
    {
      icon: Award,
      title: "Système de rangs",
      description: "Progressez dans les rangs et débloquez des avantages exclusifs selon vos performances.",
      color: "text-purple-500"
    },
    {
      icon: Users,
      title: "Équipe dédiée",
      description: "Bénéficiez du support d'une équipe expérimentée pour maximiser vos ventes.",
      color: "text-orange-500"
    },
    {
      icon: Gift,
      title: "Primes mensuelles",
      description: "Recevez des primes supplémentaires basées sur vos performances mensuelles.",
      color: "text-pink-500"
    },
    {
      icon: Clock,
      title: "Flexibilité totale",
      description: "Travaillez à votre rythme, quand vous voulez, où vous voulez.",
      color: "text-indigo-500"
    }
  ];

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <div className="container mx-auto px-4 py-8 md:py-16">
        {/* Hero Section */}
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6 gold-text">
            {t('team.advantagesTitle')}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('team.advantagesDesc')}
          </p>
        </div>

        {/* Advantages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16">
          {advantages.map((advantage, index) => (
            <Card key={index} className="bg-card/50 border-gold/20 hover:border-gold/40 transition-all duration-300 hover:scale-105">
              <CardHeader className="text-center">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <advantage.icon className={`w-6 h-6 md:w-8 md:h-8 ${advantage.color}`} />
                </div>
                <CardTitle className="text-lg md:text-xl">{advantage.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-sm md:text-base">
                  {advantage.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Performance Levels */}
        <div className="bg-gradient-to-r from-gold/5 to-gold-light/5 rounded-2xl p-6 md:p-12">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12 gold-text">
            Niveaux de Performance
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="text-center p-6 bg-card/30 rounded-xl border border-bronze/20">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-6 h-6 md:w-8 md:h-8 text-orange-500" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2 text-orange-500">Bronze</h3>
              <p className="text-muted-foreground text-sm md:text-base mb-4">
                0-10 ventes/mois
              </p>
              <ul className="text-sm text-left space-y-1">
                <li>• Commission 5%</li>
                <li>• Support de base</li>
                <li>• Formation initiale</li>
              </ul>
            </div>
            
            <div className="text-center p-6 bg-card/30 rounded-xl border border-gray-400/20">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-6 h-6 md:w-8 md:h-8 text-gray-400" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2 text-gray-400">Argent</h3>
              <p className="text-muted-foreground text-sm md:text-base mb-4">
                11-25 ventes/mois
              </p>
              <ul className="text-sm text-left space-y-1">
                <li>• Commission 6%</li>
                <li>• Support prioritaire</li>
                <li>• Formations avancées</li>
                <li>• Prime mensuelle</li>
              </ul>
            </div>
            
            <div className="text-center p-6 bg-card/30 rounded-xl border border-gold/20">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-6 h-6 md:w-8 md:h-8 text-gold" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2 text-gold">Or</h3>
              <p className="text-muted-foreground text-sm md:text-base mb-4">
                +25 ventes/mois
              </p>
              <ul className="text-sm text-left space-y-1">
                <li>• Commission 7%</li>
                <li>• Support VIP</li>
                <li>• Formations exclusives</li>
                <li>• Prime importante</li>
                <li>• Avantages exclusifs</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default TeamAdvantages;
