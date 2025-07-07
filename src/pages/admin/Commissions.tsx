
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Commission } from '@/types';

const Commissions = () => {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCommissions = async () => {
    try {
      const { data, error } = await supabase
        .from('commissions')
        .select(`
          *,
          team_members:team_member_id (
            promo_code,
            profiles:user_id (
              full_name,
              email,
              phone
            )
          ),
          orders:order_id (
            order_number,
            total_amount
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Convertir les données en format Commission avec typage correct
      const formattedCommissions: Commission[] = (data || []).map(c => ({
        id: c.id,
        team_member_id: c.team_member_id,
        order_id: c.order_id,
        amount: c.amount,
        percentage: c.percentage,
        status: c.status as 'pending' | 'approved' | 'paid',
        type: c.type as 'sale' | 'affiliation_bonus',
        metadata: c.metadata,
        created_at: c.created_at
      }));

      setCommissions(formattedCommissions);
    } catch (error) {
      console.error('Error fetching commissions:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les commissions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateCommissionStatus = async (id: string, status: 'approved' | 'paid') => {
    try {
      const { error } = await supabase
        .from('commissions')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Statut mis à jour",
        description: `Commission ${status === 'approved' ? 'approuvée' : 'payée'}`,
      });

      fetchCommissions();
    } catch (error) {
      console.error('Error updating commission:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchCommissions();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'approved': return 'bg-green-500';
      case 'paid': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'approved': return 'Approuvée';
      case 'paid': return 'Payée';
      default: return status;
    }
  };

  if (loading) {
    return <div className="p-6">Chargement des commissions...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestion des Commissions</h1>
        <Button onClick={fetchCommissions} variant="outline">
          Actualiser
        </Button>
      </div>

      <div className="grid gap-4">
        {commissions.map((commission) => (
          <Card key={commission.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">
                    Commission #{commission.id.slice(0, 8)}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {new Date(commission.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <Badge className={getStatusColor(commission.status)}>
                  {getStatusText(commission.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium">Montant</p>
                  <p className="text-lg font-bold text-green-600">
                    {commission.amount.toLocaleString()} DA
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Type</p>
                  <p className="text-sm">
                    {commission.type === 'sale' ? 'Vente' : 'Bonus d\'affiliation'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Pourcentage</p>
                  <p className="text-sm">
                    {commission.percentage ? `${(commission.percentage * 100).toFixed(0)}%` : 'N/A'}
                  </p>
                </div>
              </div>

              {commission.status === 'pending' && (
                <div className="flex gap-2 pt-3">
                  <Button
                    size="sm"
                    onClick={() => updateCommissionStatus(commission.id, 'approved')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Approuver
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => updateCommissionStatus(commission.id, 'paid')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Marquer comme payé
                  </Button>
                </div>
              )}

              {commission.status === 'approved' && (
                <Button
                  size="sm"
                  onClick={() => updateCommissionStatus(commission.id, 'paid')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Marquer comme payé
                </Button>
              )}
            </CardContent>
          </Card>
        ))}

        {commissions.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">Aucune commission trouvée</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Commissions;
