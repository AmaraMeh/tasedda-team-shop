
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Phone, Mail, MessageCircle, Users, Store } from 'lucide-react';
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
        // Compter les produits pour chaque grossiste
        const wholesalersWithProductCount = await Promise.all(
          data.map(async (wholesaler) => {
            const { count } = await supabase
              .from('products')
              .select('*', { count: 'exact', head: true })
              .eq('seller_id', wholesaler.id)
              .eq('is_active', true);
            
            return {
              ...wholesaler,
              seller_type: wholesaler.seller_type as 'normal' | 'wholesale',
              status: wholesaler.status as 'pending' | 'active' | 'suspended',
              subscription_status: wholesaler.subscription_status as 'trial' | 'active' | 'expired',
              product_count: count || 0
            };
          })
        );

        setWholesalers(wholesalersWithProductCount);
      }
    } catch (error) {
      console.error('Error fetching wholesalers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppContact = (phone: string, businessName: string) => {
    const message = `Bonjour, je suis intéressé par vos produits en gros de ${businessName}. Pouvez-vous me donner plus d'informations sur vos tarifs et conditions de vente ?`;
    const whatsappUrl = `https://wa.me/213${phone.substring(1)}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleChatContact = (sellerId: string, businessName: string) => {
    // For now, redirect to WhatsApp. Later, implement internal chat system
    const message = `Bonjour, je souhaite discuter de vos produits en gros via votre boutique ${businessName}.`;
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
            <span className="gold-text">Grossistes</span> Partenaires
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Découvrez nos grossistes partenaires pour vos achats en grande quantité
          </p>
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg max-w-4xl mx-auto">
            <h3 className="text-lg font-semibold text-blue-400 mb-2">
              Tarifs de livraison disponibles
            </h3>
            <p className="text-sm text-muted-foreground">
              Consultez nos tarifs de livraison compétitifs pour toutes les wilayas d'Algérie. 
              Livraison à domicile et points de retrait disponibles.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {wholesalers.map((wholesaler) => (
            <Card key={wholesaler.id} className="glass-effect border-gold/20 hover:border-gold/40 transition-all group">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold gold-text">{wholesaler.business_name}</h3>
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">
                      <Package className="h-3 w-3 mr-1" />
                      Grossiste
                    </Badge>
                  </div>
                  
                  <p className="text-muted-foreground text-sm">{wholesaler.description}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <Users className="h-4 w-4 mr-2" />
                      {wholesaler.profiles.full_name}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Phone className="h-4 w-4 mr-2" />
                      {wholesaler.profiles.phone}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Mail className="h-4 w-4 mr-2" />
                      {wholesaler.profiles.email}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Package className="h-4 w-4 mr-2" />
                      {wholesaler.product_count} produit{wholesaler.product_count !== 1 ? 's' : ''}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button asChild className="w-full btn-gold">
                      <Link to={`/shop/${wholesaler.slug}`}>
                        Voir les produits
                      </Link>
                    </Button>
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        onClick={() => handleWhatsAppContact(wholesaler.profiles.phone, wholesaler.business_name)}
                        variant="outline"
                        size="sm"
                        className="border-green-500 text-green-400 hover:bg-green-500/10"
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        WhatsApp
                      </Button>
                      <Button 
                        onClick={() => handleChatContact(wholesaler.id, wholesaler.business_name)}
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

        {wholesalers.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Aucun grossiste disponible pour le moment.</p>
          </div>
        )}

        {/* Shipping Information */}
        <section className="mt-16 p-6 glass-effect border-gold/20 rounded-lg">
          <h2 className="text-2xl font-bold text-center mb-6 gold-text">
            Informations de Livraison
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-white">Tarifs Standards</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Livraison à domicile: 400-1600 DA selon la wilaya</li>
                <li>• Point de retrait (Stop Desk): 200-1050 DA</li>
                <li>• Livraison express disponible dans certaines wilayas</li>
                <li>• Retour possible avec frais de 200 DA</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3 text-white">Conditions Spéciales Grossistes</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Tarifs dégressifs selon la quantité</li>
                <li>• Livraison gratuite à partir d'un certain montant</li>
                <li>• Négociation possible pour les gros volumes</li>
                <li>• Conditions de paiement flexibles</li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Wholesalers;
