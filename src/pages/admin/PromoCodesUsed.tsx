
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Tag, CheckCircle, Clock, Package } from 'lucide-react';

interface PromoCodeUsage {
  id: string;
  order_number: string;
  promo_code: string;
  total_amount: number;
  discount_amount: number;
  order_status: string;
  payment_status: string;
  created_at: string;
  team_member: {
    promo_code: string;
    profiles: {
      full_name: string;
      email: string;
    };
  };
  profiles?: {
    full_name: string;
    email: string;
  };
}

const PromoCodesUsed = () => {
  const [promoUsages, setPromoUsages] = useState<PromoCodeUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();

  const fetchPromoUsages = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          promo_code,
          total_amount,
          discount_amount,
          order_status,
          payment_status,
          created_at,
          profiles(full_name, email),
          team_members!inner(
            promo_code,
            profiles:user_id(full_name, email)
          )
        `)
        .not('promo_code', 'is', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedData = (data || []).map(order => ({
        id: order.id,
        order_number: order.order_number,
        promo_code: order.promo_code,
        total_amount: order.total_amount,
        discount_amount: order.discount_amount,
        order_status: order.order_status,
        payment_status: order.payment_status,
        created_at: order.created_at,
        team_member: order.team_members[0],
        profiles: order.profiles
      }));

      setPromoUsages(formattedData);
    } catch (error) {
      console.error('Error fetching promo usages:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les codes promo utilisés",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const confirmOrderAndTransferCommission = async (orderId: string) => {
    try {
      // Mettre à jour le statut de la commande
      const { error: orderError } = await supabase
        .from('orders')
        .update({ 
          order_status: 'delivered',
          payment_status: 'paid'
        })
        .eq('id', orderId);

      if (orderError) throw orderError;

      // Traiter les commissions
      const { error: commissionError } = await supabase
        .rpc('process_team_commission', { order_id_param: orderId });

      if (commissionError) throw commissionError;

      // Mettre à jour les commissions de "pending" à "approved"
      const { error: updateCommissionError } = await supabase
        .from('commissions')
        .update({ status: 'approved' })
        .eq('order_id', orderId)
        .eq('status', 'pending');

      if (updateCommissionError) throw updateCommissionError;

      toast({
        title: "Commission transférée",
        description: "La commande a été confirmée et la commission transférée",
      });

      fetchPromoUsages();
    } catch (error) {
      console.error('Error confirming order:', error);
      toast({
        title: "Erreur",
        description: "Impossible de confirmer la commande",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchPromoUsages();
  }, []);

  const filteredUsages = promoUsages.filter(usage => {
    const matchesSearch = 
      usage.promo_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usage.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usage.team_member?.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || usage.order_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'delivered': return 'bg-green-500';
      case 'shipped': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'shipped': return <Package className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

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
        <div>
          <h1 className="text-3xl font-bold text-white">Codes Promo Utilisés</h1>
          <p className="text-muted-foreground">
            {filteredUsages.length} utilisation(s) de codes promo
          </p>
        </div>
        <Button onClick={fetchPromoUsages} variant="outline" className="border-gold/40">
          Actualiser
        </Button>
      </div>

      {/* Filtres */}
      <Card className="glass-effect border-gold/20">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Rechercher par code promo, commande..."
                className="pl-10 bg-black/50 border-gold/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-black/50 border-gold/20">
                <SelectValue placeholder="Statut commande" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="shipped">Expédié</SelectItem>
                <SelectItem value="delivered">Livré</SelectItem>
              </SelectContent>
            </Select>

            <div className="text-sm text-muted-foreground flex items-center">
              Total: {filteredUsages.length} utilisation(s)
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des codes promo utilisés */}
      <div className="grid gap-4">
        {filteredUsages.length === 0 ? (
          <Card className="glass-effect border-gold/20">
            <CardContent className="text-center py-12">
              <Tag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucun code promo utilisé trouvé</p>
            </CardContent>
          </Card>
        ) : (
          filteredUsages.map(usage => (
            <Card key={usage.id} className="glass-effect border-gold/20">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Tag className="h-5 w-5 text-gold" />
                      Code: {usage.promo_code}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2 text-sm">
                      <span className="text-muted-foreground">Commande: #{usage.order_number}</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">
                        {new Date(usage.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                  <Badge className={getStatusColor(usage.order_status)}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(usage.order_status)}
                      {usage.order_status}
                    </div>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-white mb-2">Membre Team</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>Nom: {usage.team_member?.profiles?.full_name || 'N/A'}</div>
                      <div>Email: {usage.team_member?.profiles?.email || 'N/A'}</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-white mb-2">Client</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>Nom: {usage.profiles?.full_name || 'Client invité'}</div>
                      <div>Email: {usage.profiles?.email || 'N/A'}</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gold/20">
                  <div className="text-sm">
                    <div className="text-white">Total: <span className="font-bold text-gold">{usage.total_amount.toLocaleString()} DA</span></div>
                    <div className="text-green-500">Réduction: {usage.discount_amount.toLocaleString()} DA</div>
                  </div>
                  
                  {usage.order_status !== 'delivered' && (
                    <Button
                      onClick={() => confirmOrderAndTransferCommission(usage.id)}
                      className="btn-gold"
                      size="sm"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirmer & Transférer Commission
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default PromoCodesUsed;
