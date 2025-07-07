
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, TrendingUp, Users } from 'lucide-react';

interface Commission {
  id: string;
  team_member_id: string;
  order_id?: string;
  amount: number;
  percentage?: number;
  status: 'pending' | 'approved' | 'paid';
  type: 'sale' | 'affiliation_bonus';
  metadata?: any;
  created_at: string;
  team_members: {
    promo_code: string;
    profiles: {
      full_name: string;
      email: string;
    };
  };
  orders?: {
    order_number: string;
    total_amount: number;
  };
}

const Commissions = () => {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'paid'>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchCommissions();
  }, []);

  const fetchCommissions = async () => {
    try {
      const { data, error } = await supabase
        .from('commissions')
        .select(`
          *,
          team_members!inner(
            promo_code,
            profiles!inner(full_name, email)
          ),
          orders(order_number, total_amount)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCommissions(data || []);
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

  const updateCommissionStatus = async (commissionId: string, status: 'approved' | 'paid') => {
    try {
      const { error } = await supabase
        .from('commissions')
        .update({ status })
        .eq('id', commissionId);

      if (error) throw error;

      toast({
        title: "Commission mise à jour",
        description: `La commission a été ${status === 'approved' ? 'approuvée' : 'marquée comme payée'}.`,
      });

      fetchCommissions();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredCommissions = commissions.filter(commission => 
    filter === 'all' || commission.status === filter
  );

  const stats = {
    total: commissions.length,
    pending: commissions.filter(c => c.status === 'pending').length,
    approved: commissions.filter(c => c.status === 'approved').length,
    paid: commissions.filter(c => c.status === 'paid').length,
    totalAmount: commissions.reduce((sum, c) => sum + c.amount, 0),
    pendingAmount: commissions.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.amount, 0)
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestion des Commissions</h1>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-effect border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-blue-400">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-orange-500/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-orange-400" />
              <div>
                <p className="text-2xl font-bold text-orange-400">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">En attente</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-400" />
              <div>
                <p className="text-2xl font-bold text-green-400">{stats.approved}</p>
                <p className="text-sm text-muted-foreground">Approuvées</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-gold/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-gold" />
              <div>
                <p className="text-2xl font-bold gold-text">{stats.totalAmount.toLocaleString()} DA</p>
                <p className="text-sm text-muted-foreground">Montant total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <div className="flex space-x-2">
        {['all', 'pending', 'approved', 'paid'].map((status) => (
          <Button
            key={status}
            variant={filter === status ? 'default' : 'outline'}
            onClick={() => setFilter(status as any)}
            className={filter === status ? 'btn-gold' : ''}
          >
            {status === 'all' ? 'Toutes' :
             status === 'pending' ? 'En attente' :
             status === 'approved' ? 'Approuvées' : 'Payées'}
          </Button>
        ))}
      </div>

      {/* Liste des commissions */}
      <div className="grid gap-4">
        {filteredCommissions.map((commission) => (
          <Card key={commission.id} className="glass-effect border-gold/20">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="font-semibold text-lg">
                      {commission.team_members.profiles.full_name}
                    </h3>
                    <Badge className="bg-gold/20 text-gold">
                      {commission.team_members.promo_code}
                    </Badge>
                    <Badge className={
                      commission.status === 'pending' ? 'bg-orange-500/20 text-orange-400' :
                      commission.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                      'bg-blue-500/20 text-blue-400'
                    }>
                      {commission.status === 'pending' ? 'En attente' :
                       commission.status === 'approved' ? 'Approuvée' : 'Payée'}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Type</p>
                      <p>{commission.type === 'sale' ? 'Vente' : 'Bonus d\'affiliation'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Montant</p>
                      <p className="font-semibold text-gold">{commission.amount.toLocaleString()} DA</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Commande</p>
                      <p>{commission.orders?.order_number || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Date</p>
                      <p>{new Date(commission.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  {commission.status === 'pending' && (
                    <Button
                      size="sm"
                      onClick={() => updateCommissionStatus(commission.id, 'approved')}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approuver
                    </Button>
                  )}
                  {commission.status === 'approved' && (
                    <Button
                      size="sm"
                      onClick={() => updateCommissionStatus(commission.id, 'paid')}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Marquer payé
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCommissions.length === 0 && (
        <Card className="glass-effect border-gold/20">
          <CardContent className="p-8 text-center">
            <TrendingUp className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Aucune commission trouvée.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Commissions;
