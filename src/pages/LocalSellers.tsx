
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Store, MapPin, Phone, Mail } from 'lucide-react';
import { Seller } from '@/types';

const LocalSellers = () => {
  const { t } = useTranslation();
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLocalSellers();
  }, []);

  const fetchLocalSellers = async () => {
    const { data, error } = await supabase
      .from('sellers')
      .select(`
        *,
        profiles(full_name, email, phone)
      `)
      .eq('seller_type', 'normal')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching sellers:', error);
    } else {
      setSellers(data || []);
    }
    setLoading(false);
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
              {t('sellers.local.title')}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('sellers.local.description')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sellers.map((seller) => (
              <Card key={seller.id} className="glass-effect border-gold/20 card-hover">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Store className="h-5 w-5 text-gold" />
                      {seller.business_name}
                    </CardTitle>
                    <Badge className="bg-green-600">
                      {t('common.active')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {seller.description && (
                    <p className="text-muted-foreground">{seller.description}</p>
                  )}
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gold" />
                      <span>{seller.profiles?.email}</span>
                    </div>
                    {seller.profiles?.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gold" />
                        <span>{seller.profiles.phone}</span>
                      </div>
                    )}
                  </div>

                  <Button 
                    className="w-full btn-gold"
                    onClick={() => window.open(`/shop/${seller.slug}`, '_blank')}
                  >
                    {t('sellers.local.visitShop')}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {sellers.length === 0 && (
            <div className="text-center py-12">
              <Store className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t('sellers.local.noSellers')}</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LocalSellers;
