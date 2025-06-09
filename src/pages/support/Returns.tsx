
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RotateCcw, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';

const Returns = () => {
  const { t } = useTranslation();

  const returnReasons = [
    "Taille incorrecte",
    "Couleur différente de l'image",
    "Défaut de fabrication",
    "Article endommagé pendant le transport",
    "Ne correspond pas à la description",
    "Changement d'avis"
  ];

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <div className="container mx-auto px-4 py-8 md:py-16">
        {/* Hero Section */}
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6 gold-text">
            {t('support.returnsTitle')}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('support.returnsDesc')}
          </p>
        </div>

        {/* Return Policy */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16">
          <Card className="bg-card/50 border-green-500/20">
            <CardHeader className="text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <CardTitle className="text-green-500">15 Jours</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">
                Délai pour retourner un article en parfait état
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-card/50 border-blue-500/20">
            <CardHeader className="text-center">
              <RotateCcw className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <CardTitle className="text-blue-500">Échange Gratuit</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">
                Échange gratuit de taille ou de couleur dans les 7 jours
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-card/50 border-gold/20">
            <CardHeader className="text-center">
              <Clock className="w-12 h-12 text-gold mx-auto mb-4" />
              <CardTitle className="text-gold">Remboursement</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">
                Remboursement sous 3-5 jours après réception du retour
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Return Process */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 mb-12 md:mb-16">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 gold-text">
              Comment retourner un article ?
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-gold text-black rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Contactez-nous</h3>
                  <p className="text-muted-foreground text-sm">
                    Envoyez-nous un email avec votre numéro de commande et la raison du retour
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-gold text-black rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Emballez l'article</h3>
                  <p className="text-muted-foreground text-sm">
                    Remettez l'article dans son emballage d'origine avec tous les accessoires
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-gold text-black rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Expédition</h3>
                  <p className="text-muted-foreground text-sm">
                    Nous organisons la collecte ou vous pouvez envoyer le colis à notre adresse
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-gold text-black rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  4
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Traitement</h3>
                  <p className="text-muted-foreground text-sm">
                    Dès réception, nous traitons votre retour et effectuons le remboursement
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 gold-text">
              Motifs de Retour
            </h2>
            
            <Card className="bg-card/50 border-gold/20 mb-6">
              <CardHeader>
                <CardTitle>Raisons acceptées</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {returnReasons.map((reason, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{reason}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card/50 border-red-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  Conditions importantes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Article non porté et avec étiquettes</li>
                  <li>• Emballage d'origine requis</li>
                  <li>• Pas de retour pour les sous-vêtements</li>
                  <li>• Articles personnalisés non échangeables</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Contact for Returns */}
        <div className="bg-gradient-to-r from-gold/5 to-gold-light/5 rounded-2xl p-6 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 gold-text">
            Besoin d'aide pour votre retour ?
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-6 md:mb-8">
            Notre équipe est là pour vous accompagner dans vos retours
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="btn-gold">
              Demander un Retour
            </Button>
            <Button size="lg" variant="outline" className="border-gold/40 text-gold hover:bg-gold/10">
              Nous Contacter
            </Button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Returns;
