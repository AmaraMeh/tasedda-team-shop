
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Mail, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Seller {
  id: string;
  user_id: string;
  business_name: string;
  slug: string;
  description: string;
  seller_type: 'normal' | 'wholesale';
  is_active: boolean;
  monthly_fee: number;
  status: 'pending' | 'active' | 'suspended';
  subscription_status: 'trial' | 'active' | 'expired';
  subscription_expires_at: string;
  created_at: string;
  updated_at: string;
  profiles: {
    full_name: string;
    email: string;
    phone: string;
  };
}

const LocalSellers = () => {
  const { t } = useTranslation();
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    try {
      const { data, error } = await supabase
        .from('sellers')
        .select(`
          *,
          profiles(full_name, email, phone)
        `)
        .eq('seller_type', 'normal')
        .eq('is_active', true)
        .eq('status', 'active');

      if (error) throw error;

      if (data) {
        const mappedSellers = data.map(item => ({
          ...item,
          seller_type: item.seller_type as 'normal' | 'wholesale',
          status: item.status as 'pending' | 'active' | 'suspended',
          subscription_status: item.subscription_status as 'trial' | 'active' | 'expired'
        }));
        setSellers(mappedSellers);
      }
    } catch (error) {
      console.error('Error fetching sellers:', error);
    } finally {
      setLoading(false);
    }
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
      
      <main className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {t('localSellers.title')} <span className="gold-text">Locaux</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('localSellers.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sellers.map((seller) => (
            <Card key={seller.id} className="glass-effect border-gold/20 hover:border-gold/40 transition-all">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold gold-text">{seller.business_name}</h3>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                      Actif
                    </Badge>
                  </div>
                  
                  <p className="text-muted-foreground">{seller.description}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <Phone className="h-4 w-4 mr-2" />
                      {seller.profiles.phone}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Mail className="h-4 w-4 mr-2" />
                      {seller.profiles.email}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button asChild className="flex-1 btn-gold">
                      <Link to={`/shop/${seller.slug}`}>
                        Voir la boutique
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {sellers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Aucun vendeur local disponible pour le moment.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default LocalSellers;
