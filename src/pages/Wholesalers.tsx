
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Phone, Mail, MessageCircle } from 'lucide-react';
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

const Wholesalers = () => {
  const { t } = useTranslation();
  const [wholesalers, setWholesalers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWholesalers();
  }, []);

  const fetchWholesalers = async () => {
    try {
      const { data, error } = await supabase
        .from('sellers')
        .select(`
          *,
          profiles(full_name, email, phone)
        `)
        .eq('seller_type', 'wholesale')
        .eq('is_active', true)
        .eq('status', 'active');

      if (error) throw error;

      if (data) {
        const mappedWholesalers = data.map(item => ({
          ...item,
          seller_type: item.seller_type as 'normal' | 'wholesale',
          status: item.status as 'pending' | 'active' | 'suspended',
          subscription_status: item.subscription_status as 'trial' | 'active' | 'expired'
        }));
        setWholesalers(mappedWholesalers);
      }
    } catch (error) {
      console.error('Error fetching wholesalers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppContact = (phone: string, businessName: string) => {
    const message = `Bonjour, je suis intéressé par vos produits en gros de ${businessName}. Pouvez-vous me donner plus d'informations ?`;
    const whatsappUrl = `https://wa.me/213${phone.substring(1)}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
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
            <span className="gold-text">Grossistes</span> Partenaires
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Découvrez nos grossistes partenaires pour vos achats en grande quantité
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {wholesalers.map((wholesaler) => (
            <Card key={wholesaler.id} className="glass-effect border-gold/20 hover:border-gold/40 transition-all">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold gold-text">{wholesaler.business_name}</h3>
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">
                      <Package className="h-3 w-3 mr-1" />
                      Grossiste
                    </Badge>
                  </div>
                  
                  <p className="text-muted-foreground">{wholesaler.description}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <Phone className="h-4 w-4 mr-2" />
                      {wholesaler.profiles.phone}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Mail className="h-4 w-4 mr-2" />
                      {wholesaler.profiles.email}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button asChild className="w-full btn-gold">
                      <Link to={`/shop/${wholesaler.slug}`}>
                        Voir les produits
                      </Link>
                    </Button>
                    <Button 
                      onClick={() => handleWhatsAppContact(wholesaler.profiles.phone, wholesaler.business_name)}
                      variant="outline"
                      className="w-full border-green-500 text-green-400 hover:bg-green-500/10"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Contacter via WhatsApp
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {wholesalers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Aucun grossiste disponible pour le moment.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Wholesalers;
