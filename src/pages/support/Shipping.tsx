
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, Clock, MapPin, Package } from 'lucide-react';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';

const Shipping = () => {
  const { t } = useTranslation();

  const shippingOptions = [
    {
      icon: Truck,
      title: "Livraison Standard",
      price: "300 DA",
      duration: "3-5 jours ouvrés",
      description: "Livraison dans toute l'Algérie par transporteur"
    },
    {
      icon: Package,
      title: "Livraison Express",
      price: "500 DA",
      duration: "1-2 jours ouvrés",
      description: "Livraison rapide dans les grandes villes"
    },
    {
      icon: MapPin,
      title: "Point Relais",
      price: "200 DA",
      duration: "3-4 jours ouvrés",
      description: "Retrait dans un point relais proche"
    }
  ];

  const wilayas = [
    "Alger", "Oran", "Constantine", "Annaba", "Blida", "Batna", "Djelfa", "Sétif",
    "Sidi Bel Abbès", "Biskra", "Tébessa", "El Oued", "Skikda", "Tiaret", "Béjaïa",
    "Tlemcen", "Ouargla", "Béchar", "Mostaganem", "Bordj Bou Arréridj"
  ];

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <div className="container mx-auto px-4 py-8 md:py-16">
        {/* Hero Section */}
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6 gold-text">
            {t('support.shippingTitle')}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('support.shippingDesc')}
          </p>
        </div>

        {/* Shipping Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16">
          {shippingOptions.map((option, index) => (
            <Card key={index} className="bg-card/50 border-gold/20 hover:border-gold/40 transition-colors">
              <CardHeader className="text-center">
                <option.icon className="w-12 h-12 text-gold mx-auto mb-4" />
                <CardTitle className="text-lg md:text-xl">{option.title}</CardTitle>
                <CardDescription className="text-gold font-semibold text-lg">
                  {option.price}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="font-semibold mb-2">{option.duration}</p>
                <p className="text-muted-foreground text-sm">
                  {option.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Coverage Map */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 mb-12 md:mb-16">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 gold-text">
              Zones de Livraison
            </h2>
            <Card className="bg-card/50 border-gold/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <MapPin className="w-6 h-6 text-gold" />
                  Couverture Nationale
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Nous livrons dans toutes les wilayas d'Algérie. Voici les principales zones couvertes :
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {wilayas.slice(0, 10).map((wilaya, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gold rounded-full"></div>
                      <span>{wilaya}</span>
                    </div>
                  ))}
                </div>
                <p className="text-muted-foreground text-sm mt-4">
                  Et bien d'autres wilayas...
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 gold-text">
              Processus de Livraison
            </h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-gold text-black rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Commande confirmée</h3>
                  <p className="text-muted-foreground text-sm">
                    Votre commande est validée et préparée dans nos entrepôts
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-gold text-black rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Expédition</h3>
                  <p className="text-muted-foreground text-sm">
                    Votre colis est remis au transporteur avec un numéro de suivi
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-gold text-black rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="font-semibold mb-2">En transit</h3>
                  <p className="text-muted-foreground text-sm">
                    Suivez votre colis en temps réel jusqu'à la livraison
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-gold text-black rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  4
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Livraison</h3>
                  <p className="text-muted-foreground text-sm">
                    Réception de votre commande à l'adresse indiquée
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Important Info */}
        <div className="bg-gradient-to-r from-gold/5 to-gold-light/5 rounded-2xl p-6 md:p-12">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12 gold-text">
            Informations Importantes
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div>
              <h3 className="text-lg md:text-xl font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-gold" />
                Délais de Traitement
              </h3>
              <ul className="space-y-2 text-muted-foreground text-sm md:text-base">
                <li>• Commandes passées avant 15h : expédiées le jour même</li>
                <li>• Commandes passées après 15h : expédiées le lendemain</li>
                <li>• Weekend et jours fériés non inclus dans les délais</li>
                <li>• Vérification d'adresse obligatoire pour certaines zones</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg md:text-xl font-semibold mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-gold" />
                Emballage
              </h3>
              <ul className="space-y-2 text-muted-foreground text-sm md:text-base">
                <li>• Emballage soigné et sécurisé</li>
                <li>• Protection spéciale pour les articles fragiles</li>
                <li>• Emballage discret sur demande</li>
                <li>• Facture incluse dans le colis</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Shipping;
