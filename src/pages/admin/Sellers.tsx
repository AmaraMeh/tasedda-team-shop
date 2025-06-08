
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Clock, Store, Search } from 'lucide-react';

interface Seller {
  id: string;
  user_id: string;
  business_name: string;
  description?: string;
  slug: string;
  status: 'pending' | 'active' | 'suspended';
  subscription_status: 'trial' | 'active' | 'expired';
  subscription_expires_at?: string;
  monthly_fee: number;
  created_at: string;
  profiles?: {
    full_name?: string;
    email?: string;
    phone?: string;
  };
}

const Sellers = () => {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
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
      setSellers(data || []);
    } catch (error) {
      console.error('Error fetching sellers:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les vendeurs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (sellerId: string, status: 'active' | 'suspended') => {
    try {
      const { error } = await supabase
        .from('sellers')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', sellerId);

      if (error) throw error;

      toast({
        title: 'Succès',
        description: `Vendeur ${status === 'active' ? 'activé' : 'suspendu'} avec succès`,
      });

      fetchSellers();
    } catch (error) {
      console.error('Error updating seller:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le vendeur',
        variant: 'destructive',
      });
    }
  };

  const handleSubscriptionUpdate = async (sellerId: string, subscriptionStatus: 'active' | 'expired') => {
    try {
      const expirationDate = subscriptionStatus === 'active' 
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
        : null;

      const { error } = await supabase
        .from('sellers')
        .update({ 
          subscription_status: subscriptionStatus,
          subscription_expires_at: expirationDate,
          updated_at: new Date().toISOString()
        })
        .eq('id', sellerId);

      if (error) throw error;

      toast({
        title: 'Succès',
        description: `Abonnement ${subscriptionStatus === 'active' ? 'activé' : 'expiré'} avec succès`,
      });

      fetchSellers();
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour l\'abonnement',
        variant: 'destructive',
      });
    }
  };

  const filteredSellers = sellers.filter(seller =>
    seller.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    seller.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    seller.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gold"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Gestion des Vendeurs</h1>
        <Badge variant="outline" className="text-gold border-gold">
          {sellers.filter(s => s.status === 'pending').length} En attente
        </Badge>
      </div>

      {/* Search */}
      <Card className="glass-effect border-gold/20">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Rechercher par nom, entreprise ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-black/50 border-gold/20"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        {filteredSellers.length === 0 ? (
          <Card className="glass-effect border-gold/20">
            <CardContent className="text-center py-12">
              <Store className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucun vendeur trouvé</p>
            </CardContent>
          </Card>
        ) : (
          filteredSellers.map((seller) => (
            <Card key={seller.id} className="glass-effect border-gold/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3">
                    <Store className="h-5 w-5" />
                    {seller.business_name}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Badge
                      variant={
                        seller.status === 'pending' ? 'default' :
                        seller.status === 'active' ? 'default' : 'destructive'
                      }
                    >
                      {seller.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                      {seller.status === 'active' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {seller.status === 'suspended' && <XCircle className="h-3 w-3 mr-1" />}
                      {seller.status === 'pending' ? 'En attente' :
                       seller.status === 'active' ? 'Actif' : 'Suspendu'}
                    </Badge>
                    <Badge
                      variant={seller.subscription_status === 'active' ? 'default' : 'secondary'}
                    >
                      {seller.subscription_status === 'trial' ? 'Essai' :
                       seller.subscription_status === 'active' ? 'Abonné' : 'Expiré'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">Propriétaire</Label>
                      <p className="font-medium">{seller.profiles?.full_name || 'Non renseigné'}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Email</Label>
                      <p className="font-medium">{seller.profiles?.email || 'Non renseigné'}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Téléphone</Label>
                      <p className="font-medium">{seller.profiles?.phone || 'Non renseigné'}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Slug boutique</Label>
                      <p className="font-medium">/{seller.slug}</p>
                    </div>
                  </div>

                  {seller.description && (
                    <div>
                      <Label className="text-sm text-muted-foreground">Description</Label>
                      <p className="font-medium">{seller.description}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">Abonnement mensuel</Label>
                      <p className="font-medium">{seller.monthly_fee} DA/mois</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Date de création</Label>
                      <p className="font-medium">
                        {new Date(seller.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>

                  {seller.subscription_expires_at && (
                    <div>
                      <Label className="text-sm text-muted-foreground">Expiration abonnement</Label>
                      <p className="font-medium">
                        {new Date(seller.subscription_expires_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    {seller.status === 'pending' && (
                      <>
                        <Button
                          onClick={() => handleStatusUpdate(seller.id, 'active')}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approuver
                        </Button>
                        <Button
                          onClick={() => handleStatusUpdate(seller.id, 'suspended')}
                          variant="destructive"
                          className="flex-1"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Refuser
                        </Button>
                      </>
                    )}

                    {seller.status === 'active' && (
                      <>
                        {seller.subscription_status !== 'active' && (
                          <Button
                            onClick={() => handleSubscriptionUpdate(seller.id, 'active')}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Activer Abonnement
                          </Button>
                        )}
                        {seller.subscription_status === 'active' && (
                          <Button
                            onClick={() => handleSubscriptionUpdate(seller.id, 'expired')}
                            variant="outline"
                          >
                            Suspendre Abonnement
                          </Button>
                        )}
                        <Button
                          onClick={() => handleStatusUpdate(seller.id, 'suspended')}
                          variant="destructive"
                        >
                          Suspendre Vendeur
                        </Button>
                      </>
                    )}

                    {seller.status === 'suspended' && (
                      <Button
                        onClick={() => handleStatusUpdate(seller.id, 'active')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Réactiver
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Sellers;
