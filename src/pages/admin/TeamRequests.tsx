
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Clock, User } from 'lucide-react';

interface TeamRequest {
  id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  admin_notes?: string;
  full_name?: string;
  email?: string;
  phone?: string;
}

const TeamRequests = () => {
  const [requests, setRequests] = useState<TeamRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('team_requests_with_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching team requests:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les demandes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId: string, status: 'approved' | 'rejected') => {
    try {
      const { error: updateError } = await supabase
        .from('team_join_requests')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (updateError) throw updateError;

      // If approved, create team member
      if (status === 'approved') {
        const request = requests.find(r => r.id === requestId);
        if (request) {
          // Generate promo code
          const { data: promoData, error: promoError } = await supabase
            .rpc('generate_promo_code');

          if (promoError) throw promoError;

          const { error: teamError } = await supabase
            .from('team_members')
            .insert({
              user_id: request.user_id,
              promo_code: promoData,
              rank: 1,
              is_active: true
            });

          if (teamError) throw teamError;
        }
      }

      toast({
        title: 'Succès',
        description: `Demande ${status === 'approved' ? 'approuvée' : 'rejetée'} avec succès`,
      });

      fetchRequests();
    } catch (error) {
      console.error('Error updating request:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour la demande',
        variant: 'destructive',
      });
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
        <h1 className="text-3xl font-bold text-white">Demandes Team</h1>
        <Badge variant="outline" className="text-gold border-gold">
          {requests.filter(r => r.status === 'pending').length} En attente
        </Badge>
      </div>

      <div className="grid gap-6">
        {requests.length === 0 ? (
          <Card className="glass-effect border-gold/20">
            <CardContent className="text-center py-12">
              <User className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucune demande trouvée</p>
            </CardContent>
          </Card>
        ) : (
          requests.map((request) => (
            <Card key={request.id} className="glass-effect border-gold/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3">
                    <User className="h-5 w-5" />
                    {request.full_name || 'Nom non renseigné'}
                  </CardTitle>
                  <Badge
                    variant={
                      request.status === 'pending' ? 'default' :
                      request.status === 'approved' ? 'default' : 'destructive'
                    }
                  >
                    {request.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                    {request.status === 'approved' && <CheckCircle className="h-3 w-3 mr-1" />}
                    {request.status === 'rejected' && <XCircle className="h-3 w-3 mr-1" />}
                    {request.status === 'pending' ? 'En attente' :
                     request.status === 'approved' ? 'Approuvée' : 'Rejetée'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{request.email || 'Non renseigné'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Téléphone</p>
                      <p className="font-medium">{request.phone || 'Non renseigné'}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Date de demande</p>
                    <p className="font-medium">
                      {new Date(request.created_at).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>

                  {request.admin_notes && (
                    <div>
                      <p className="text-sm text-muted-foreground">Notes admin</p>
                      <p className="font-medium">{request.admin_notes}</p>
                    </div>
                  )}

                  {request.status === 'pending' && (
                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={() => handleStatusUpdate(request.id, 'approved')}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approuver
                      </Button>
                      <Button
                        onClick={() => handleStatusUpdate(request.id, 'rejected')}
                        variant="destructive"
                        className="flex-1"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Rejeter
                      </Button>
                    </div>
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

export default TeamRequests;
