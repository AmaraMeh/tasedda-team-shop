
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Eye, Package } from 'lucide-react';

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

const Sellers = () => {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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
        .order('created_at', { ascending: false });

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
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSellerStatus = async (sellerId: string, status: 'active' | 'suspended') => {
    try {
      const { error } = await supabase
        .from('sellers')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', sellerId);

      if (error) throw error;

      toast({
        title: "Statut mis à jour",
        description: `Le vendeur a été ${status === 'active' ? 'activé' : 'suspendu'}.`,
      });

      fetchSellers();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">En attente</Badge>;
      case 'active':
        return <Badge className="bg-green-500">Actif</Badge>;
      case 'suspended':
        return <Badge variant="destructive">Suspendu</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSellerTypeBadge = (type: string) => {
    switch (type) {
      case 'normal':
        return <Badge variant="outline">Vendeur Normal</Badge>;
      case 'wholesale':
        return <Badge className="bg-blue-500"><Package className="h-3 w-3 mr-1" />Grossiste</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestion des Vendeurs</h1>
        <div className="text-sm text-muted-foreground">
          Total: {sellers.length} vendeurs
        </div>
      </div>

      <div className="grid gap-4">
        {sellers.map((seller) => (
          <Card key={seller.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <span>{seller.business_name}</span>
                    {getSellerTypeBadge(seller.seller_type)}
                    {getStatusBadge(seller.status)}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {seller.profiles.full_name} • {seller.profiles.email}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(`/shop/${seller.slug}`, '_blank')}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Voir
                  </Button>
                  {seller.status === 'pending' && (
                    <Button
                      size="sm"
                      onClick={() => updateSellerStatus(seller.id, 'active')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approuver
                    </Button>
                  )}
                  {seller.status === 'active' && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => updateSellerStatus(seller.id, 'suspended')}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Suspendre
                    </Button>
                  )}
                  {seller.status === 'suspended' && (
                    <Button
                      size="sm"
                      onClick={() => updateSellerStatus(seller.id, 'active')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Réactiver
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Description:</span>
                  <p className="text-muted-foreground">{seller.description}</p>
                </div>
                <div>
                  <span className="font-medium">Téléphone:</span>
                  <p className="text-muted-foreground">{seller.profiles.phone}</p>
                </div>
                <div>
                  <span className="font-medium">Frais mensuels:</span>
                  <p className="text-muted-foreground">{seller.monthly_fee} DA</p>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Statut abonnement:</span>
                  <p className="text-muted-foreground">{seller.subscription_status}</p>
                </div>
                <div>
                  <span className="font-medium">Expire le:</span>
                  <p className="text-muted-foreground">
                    {new Date(seller.subscription_expires_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sellers.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">Aucun vendeur enregistré.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Sellers;
