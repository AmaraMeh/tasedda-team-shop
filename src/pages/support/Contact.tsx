
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Clock, MapPin } from 'lucide-react';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';

const Contact = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <div className="container mx-auto px-4 py-8 md:py-16">
        {/* Hero Section */}
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6 gold-text">
            {t('support.contactTitle')}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('support.contactDesc')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          {/* Contact Form */}
          <Card className="bg-card/50 border-gold/20">
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl">Envoyez-nous un message</CardTitle>
              <CardDescription>
                Remplissez ce formulaire et nous vous répondrons dans les plus brefs délais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Nom complet</label>
                  <Input placeholder="Votre nom" className="bg-card/30 border-gold/20" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">{t('common.email')}</label>
                  <Input type="email" placeholder="votre@email.com" className="bg-card/30 border-gold/20" />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">{t('common.phone')}</label>
                <Input placeholder="+213 XXX XXX XXX" className="bg-card/30 border-gold/20" />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Sujet</label>
                <Input placeholder="Objet de votre message" className="bg-card/30 border-gold/20" />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Message</label>
                <Textarea 
                  placeholder="Décrivez votre demande en détail..."
                  rows={6}
                  className="bg-card/30 border-gold/20"
                />
              </div>
              
              <Button className="w-full btn-gold">
                Envoyer le message
              </Button>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <div className="space-y-6">
            <Card className="bg-card/50 border-gold/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Mail className="w-6 h-6 text-gold" />
                  Email
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t('support.email')}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Nous répondons généralement sous 24h
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-card/50 border-gold/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Phone className="w-6 h-6 text-gold" />
                  Téléphone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t('support.phone')}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Support technique disponible
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-card/50 border-gold/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Clock className="w-6 h-6 text-gold" />
                  Horaires
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t('support.workingHours')}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Samedi et Dimanche fermés
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-card/50 border-gold/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <MapPin className="w-6 h-6 text-gold" />
                  Adresse
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Alger, Algérie</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Siège social Lion E-commerce
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Contact;
