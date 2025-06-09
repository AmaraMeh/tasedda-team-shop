
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Store, MessageCircle, Phone, Mail, Package } from 'lucide-react';
import { Seller } from '@/types';

const Wholesalers = () => {
  const { t } = useTranslation();
  const [wholesalers, setWholesalers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWholesalers();
  }, []);

  const fetchWholesalers = async () => {
    const { data, error } = await supabase
      .from('sellers')
      .select(`
        *,
        profiles(full_name, email, phone)
      `)
      .eq('seller_type', 'wholesale')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching wholesalers:', error);
    } else {
      setWholesalers(data || []);
    }
    setLoading(false);
  };

  const handleNegotiatePrice = (seller: Seller) => {
    // Create WhatsApp link for negotiation
    const phoneNumber = seller.profiles?.phone?.replace(/\D/g, '');
    const message = encodeURIComponent(`Bonjour ${seller.business_name}, je souhaite négocier des prix pour des achats en gros. Pouvez-vous me donner plus d'informations ?`);
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gold"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <main className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 gold-text">
              {t('sellers.wholesale.title')}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('sellers.wholesale.description')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {wholesalers.map((wholesaler) => (
              <Card key={wholesaler.id} className="glass-effect border-gold/20 card-hover">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-gold" />
                      {wholesaler.business_name}
                    </CardTitle>
                    <Badge className="bg-blue-600">
                      {t('sellers.wholesale.wholesale')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {wholesaler.description && (
                    <p className="text-muted-foreground">{wholesaler.description}</p>
                  )}
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gold" />
                      <span>{wholesaler.profiles?.email}</span>
                    </div>
                    {wholesaler.profiles?.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gold" />
                        <span>{wholesaler.profiles.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline"
                      className="border-gold/40 text-gold hover:bg-gold/10"
                      onClick={() => window.open(`/shop/${wholesaler.slug}`, '_blank')}
                    >
                      <Store className="h-4 w-4 mr-2" />
                      {t('sellers.wholesale.viewCatalog')}
                    </Button>
                    <Button 
                      className="btn-gold"
                      onClick={() => handleNegotiatePrice(wholesaler)}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      {t('sellers.wholesale.negotiate')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {wholesalers.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t('sellers.wholesale.noWholesalers')}</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Wholesalers;
