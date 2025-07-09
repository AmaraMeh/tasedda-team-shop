
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Mail, Star, MessageCircle, Users, Store } from 'lucide-react';
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
  product_count?: number;
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
        // Compter les produits pour chaque vendeur
        const sellersWithProductCount = await Promise.all(
          data.map(async (seller) => {
            const { count } = await supabase
              .from('products')
              .select('*', { count: 'exact', head: true })
              .eq('seller_id', seller.id)
              .eq('is_active', true);
            
            return {
              ...seller,
              seller_type: seller.seller_type as 'normal' | 'wholesale',
              status: seller.status as 'pending' | 'active' | 'suspended',
              subscription_status: seller.subscription_status as 'trial' | 'active' | 'expired',
              product_count: count || 0
            };
          })
        );

        setSellers(sellersWithProductCount);
      }
    } catch (error) {
      console.error('Error fetching sellers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppContact = (phone: string, businessName: string) => {
    const message = `Bonjour, je suis intéressé par les produits de ${businessName}. Pouvez-vous me donner plus d'informations ?`;
    const whatsappUrl = `https://wa.me/213${phone.substring(1)}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleChatContact = (sellerId: string, businessName: string) => {
    // For now, redirect to WhatsApp. Later, implement internal chat system
    const message = `Bonjour, je souhaite discuter via votre boutique ${businessName}.`;
    const whatsappUrl = `https://wa.me/213?text=${encodeURIComponent(message)}`;
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
            Vendeurs <span className="gold-text">Locaux</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Découvrez nos vendeurs locaux et leurs produits authentiques
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sellers.map((seller) => (
            <Card key={seller.id} className="glass-effect border-gold/20 hover:border-gold/40 transition-all group">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold gold-text">{seller.business_name}</h3>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                      <Store className="h-3 w-3 mr-1" />
                      Actif
                    </Badge>
                  </div>
                  
                  <p className="text-muted-foreground text-sm">{seller.description}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <Users className="h-4 w-4 mr-2" />
                      {seller.profiles.full_name}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Phone className="h-4 w-4 mr-2" />
                      {seller.profiles.phone}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Mail className="h-4 w-4 mr-2" />
                      {seller.profiles.email}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Store className="h-4 w-4 mr-2" />
                      {seller.product_count} produit{seller.product_count !== 1 ? 's' : ''}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button asChild className="w-full btn-gold">
                      <Link to={`/shop/${seller.slug}`}>
                        Voir la boutique
                      </Link>
                    </Button>
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        onClick={() => handleWhatsAppContact(seller.profiles.phone, seller.business_name)}
                        variant="outline"
                        size="sm"
                        className="border-green-500 text-green-400 hover:bg-green-500/10"
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        WhatsApp
                      </Button>
                      <Button 
                        onClick={() => handleChatContact(seller.id, seller.business_name)}
                        variant="outline"
                        size="sm"
                        className="border-blue-500 text-blue-400 hover:bg-blue-500/10"
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Chat
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {sellers.length === 0 && (
          <div className="text-center py-12">
            <Store className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Aucun vendeur local disponible pour le moment.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default LocalSellers;
