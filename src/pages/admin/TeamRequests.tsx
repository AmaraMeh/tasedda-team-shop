
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, MessageSquare } from 'lucide-react';

interface TeamRequest {
  id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  admin_notes: string | null;
  invited_by: string | null;
  profiles: {
    full_name: string;
    email: string;
    phone: string;
  } | null;
}

const TeamRequests = () => {
  const [requests, setRequests] = useState<TeamRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<{[key: string]: string}>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('team_join_requests')
        .select(`
          id,
          user_id,
          status,
          created_at,
          admin_notes,
          invited_by,
          profiles!team_join_requests_user_id_fkey(full_name, email, phone)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data) {
        const mappedRequests = data.map(item => ({
          ...item,
          status: item.status as 'pending' | 'approved' | 'rejected',
          profiles: Array.isArray(item.profiles) ? item.profiles[0] : item.profiles
        }));
        setRequests(mappedRequests);
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

  const handleRequest = async (requestId: string, action: 'approved' | 'rejected') => {
    setProcessingId(requestId);
    
    try {
      const request = requests.find(r => r.id === requestId);
      if (!request) return;

      // Update request status
      const { error: updateError } = await supabase
        .from('team_join_requests')
        .update({ 
          status: action,
          admin_notes: adminNotes[requestId] || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (updateError) throw updateError;

      // If approved, create team member with generated promo code
      if (action === 'approved') {
        const { data: promoCode, error: promoError } = await supabase
          .rpc('generate_promo_code');

        if (promoError) throw promoError;

        const { error: memberError } = await supabase
          .from('team_members')
          .insert({
            user_id: request.user_id,
            promo_code: promoCode,
            invited_by: request.invited_by,
            is_active: true
          });

        if (memberError) throw memberError;
      }

      toast({
        title: action === 'approved' ? "Demande approuvée" : "Demande rejetée",
        description: `La demande de ${request.profiles?.full_name || 'cet utilisateur'} a été ${action === 'approved' ? 'approuvée' : 'rejetée'}.`,
      });

      fetchRequests();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">En attente</Badge>;
      case 'approved':
        return <Badge className="bg-green-500">Approuvée</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejetée</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-xl sm:text-2xl font-bold">Demandes d'Adhésion Team</h1>
        <div className="text-sm text-muted-foreground">
          {requests.filter(r => r.status === 'pending').length} en attente
        </div>
      </div>

      <div className="grid gap-4">
        {requests.map((request) => (
          <Card key={request.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-base sm:text-lg">
                    <span className="truncate">{request.profiles?.full_name || 'Utilisateur inconnu'}</span>
                    {getStatusBadge(request.status)}
                  </CardTitle>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-muted-foreground truncate">
                      {request.profiles?.email || 'Email non disponible'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {request.profiles?.phone || 'Téléphone non disponible'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Demande créée le {new Date(request.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                  {request.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleRequest(request.id, 'approved')}
                        disabled={processingId === request.id}
                        className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approuver
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRequest(request.id, 'rejected')}
                        disabled={processingId === request.id}
                        className="w-full sm:w-auto"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Rejeter
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {request.status === 'pending' && (
                <div className="space-y-2">
                  <Label htmlFor={`notes-${request.id}`}>Notes administratives</Label>
                  <Textarea
                    id={`notes-${request.id}`}
                    placeholder="Ajouter des notes (optionnel)..."
                    value={adminNotes[request.id] || ''}
                    onChange={(e) => setAdminNotes({
                      ...adminNotes,
                      [request.id]: e.target.value
                    })}
                    className="resize-none"
                  />
                </div>
              )}
              
              {request.admin_notes && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <div className="flex items-center mb-2">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    <span className="font-medium">Notes administratives:</span>
                  </div>
                  <p className="text-sm break-words">{request.admin_notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {requests.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">Aucune demande d'adhésion.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TeamRequests;
