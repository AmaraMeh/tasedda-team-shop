
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpCircle, Search, MessageCircle, Book } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';

const HelpCenter = () => {
  const { t } = useTranslation();

  const faqCategories = [
    {
      title: "Commandes",
      questions: [
        "Comment passer une commande ?",
        "Puis-je modifier ma commande ?",
        "Comment suivre ma commande ?",
        "Que faire si ma commande est en retard ?"
      ]
    },
    {
      title: "Paiements",
      questions: [
        "Quels modes de paiement acceptez-vous ?",
        "Le paiement à la livraison est-il disponible ?",
        "Comment utiliser BaridiMob ?",
        "Ma commande est-elle sécurisée ?"
      ]
    },
    {
      title: "Livraison",
      questions: [
        "Quels sont les délais de livraison ?",
        "Livrez-vous dans toute l'Algérie ?",
        "Puis-je changer l'adresse de livraison ?",
        "Comment sont calculés les frais de livraison ?"
      ]
    },
    {
      title: "Team Lion",
      questions: [
        "Comment rejoindre la Team ?",
        "Comment fonctionnent les commissions ?",
        "Quand reçois-je mes gains ?",
        "Comment obtenir mon code promo ?"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <div className="container mx-auto px-4 py-8 md:py-16">
        {/* Hero Section */}
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6 gold-text">
            {t('support.helpTitle')}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            {t('support.helpDesc')}
          </p>
          
          {/* Search Bar */}
          <div className="max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input 
                placeholder="Rechercher dans l'aide..."
                className="pl-10 bg-card/50 border-gold/20"
              />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16">
          <Card className="bg-card/50 border-gold/20 hover:border-gold/40 transition-colors cursor-pointer">
            <CardHeader className="text-center">
              <MessageCircle className="w-12 h-12 text-gold mx-auto mb-4" />
              <CardTitle>Chat en Direct</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Discutez avec notre équipe support en temps réel
              </CardDescription>
            </CardContent>
          </Card>
          
          <Card className="bg-card/50 border-gold/20 hover:border-gold/40 transition-colors cursor-pointer">
            <CardHeader className="text-center">
              <Book className="w-12 h-12 text-gold mx-auto mb-4" />
              <CardTitle>Guide d'Utilisation</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Consultez notre guide complet d'utilisation
              </CardDescription>
            </CardContent>
          </Card>
          
          <Card className="bg-card/50 border-gold/20 hover:border-gold/40 transition-colors cursor-pointer">
            <CardHeader className="text-center">
              <HelpCircle className="w-12 h-12 text-gold mx-auto mb-4" />
              <CardTitle>FAQ</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Trouvez rapidement les réponses à vos questions
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Categories */}
        <div className="mb-12 md:mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12 gold-text">
            {t('support.faq')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {faqCategories.map((category, index) => (
              <Card key={index} className="bg-card/50 border-gold/20">
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl">{category.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {category.questions.map((question, qIndex) => (
                      <div key={qIndex} className="p-3 bg-card/30 rounded-lg hover:bg-card/50 transition-colors cursor-pointer">
                        <p className="text-sm md:text-base">{question}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-gradient-to-r from-gold/5 to-gold-light/5 rounded-2xl p-6 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 gold-text">
            Vous ne trouvez pas votre réponse ?
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-6 md:mb-8">
            Notre équipe support est là pour vous aider
          </p>
          <Button size="lg" className="btn-gold">
            Contacter le Support
          </Button>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default HelpCenter;
