
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, TrendingUp, DollarSign, PieChart } from 'lucide-react';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';

const TeamCommissions = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <div className="container mx-auto px-4 py-8 md:py-16">
        {/* Hero Section */}
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6 gold-text">
            {t('team.commissionsTitle')}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('team.commissionsDesc')}
          </p>
        </div>

        {/* Commission Calculator */}
        <div className="bg-gradient-to-r from-gold/5 to-gold-light/5 rounded-2xl p-6 md:p-12 mb-12 md:mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12 gold-text">
            Calculateur de Commissions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <Card className="bg-card/50 border-gold/20">
              <CardHeader className="text-center">
                <Calculator className="w-12 h-12 text-gold mx-auto mb-4" />
                <CardTitle>Vente de 5000 DA</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-2xl font-bold gold-text">250 DA</p>
                <p className="text-muted-foreground">Commission (5%)</p>
              </CardContent>
            </Card>
            
            <Card className="bg-card/50 border-gold/20">
              <CardHeader className="text-center">
                <TrendingUp className="w-12 h-12 text-gold mx-auto mb-4" />
                <CardTitle>10 ventes/mois</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-2xl font-bold gold-text">2,500 DA</p>
                <p className="text-muted-foreground">Revenus mensuels</p>
              </CardContent>
            </Card>
            
            <Card className="bg-card/50 border-gold/20">
              <CardHeader className="text-center">
                <DollarSign className="w-12 h-12 text-gold mx-auto mb-4" />
                <CardTitle>Objectif annuel</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-2xl font-bold gold-text">30,000 DA</p>
                <p className="text-muted-foreground">Revenus potentiels</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Commission Structure */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 mb-12 md:mb-16">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 gold-text">
              Structure des Commissions
            </h2>
            
            <div className="space-y-4">
              <Card className="bg-card/50 border-gold/20">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Commission de Base</span>
                    <span className="gold-text">5%</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm md:text-base">
                    Taux de commission standard sur toutes les ventes réalisées avec votre code promo.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-card/50 border-green-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Prime Performance</span>
                    <span className="text-green-500">+1-2%</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm md:text-base">
                    Bonus selon vos performances mensuelles et votre rang dans l'équipe.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-card/50 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Bonus Parrainage</span>
                    <span className="text-purple-500">50 DA</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm md:text-base">
                    Prime fixe pour chaque nouveau membre que vous parrainez.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 gold-text">
              Comment ça fonctionne ?
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-gold text-black rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Partagez votre code</h3>
                  <p className="text-muted-foreground text-sm md:text-base">
                    Utilisez votre code promo personnel sur les réseaux sociaux, avec vos amis et famille.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-gold text-black rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Client passe commande</h3>
                  <p className="text-muted-foreground text-sm md:text-base">
                    Quand quelqu'un utilise votre code pour commander, la vente vous est automatiquement attribuée.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-gold text-black rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Recevez votre commission</h3>
                  <p className="text-muted-foreground text-sm md:text-base">
                    Vos commissions s'accumulent et sont disponibles pour retrait mensuel.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-gradient-to-r from-gold/5 to-gold-light/5 rounded-2xl p-6 md:p-12">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12 gold-text">
            Modalités de Paiement
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="text-center">
              <PieChart className="w-12 h-12 md:w-16 md:h-16 text-gold mx-auto mb-4" />
              <h3 className="text-lg md:text-xl font-semibold mb-2">Fréquence</h3>
              <p className="text-muted-foreground text-sm md:text-base">
                Paiements mensuels le 1er de chaque mois pour les commissions du mois précédent
              </p>
            </div>
            
            <div className="text-center">
              <DollarSign className="w-12 h-12 md:w-16 md:h-16 text-gold mx-auto mb-4" />
              <h3 className="text-lg md:text-xl font-semibold mb-2">Minimum</h3>
              <p className="text-muted-foreground text-sm md:text-base">
                Montant minimum de 1000 DA requis pour effectuer un retrait
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default TeamCommissions;
