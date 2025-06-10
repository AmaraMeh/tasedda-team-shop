
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
  };
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

      // If approved, create team member
      if (action === 'approved') {
        const { error: memberError } = await supabase
          .from('team_members')
          .insert({
            user_id: request.user_id,
            invited_by: request.invited_by,
            is_active: true
          });

        if (memberError) throw memberError;
      }

      toast({
        title: action === 'approved' ? "Demande approuvée" : "Demande rejetée",
        description: `La demande de ${request.profiles.full_name} a été ${action === 'approved' ? 'approuvée' : 'rejetée'}.`,
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Demandes d'Adhésion Team</h1>
        <div className="text-sm text-muted-foreground">
          {requests.filter(r => r.status === 'pending').length} en attente
        </div>
      </div>

      <div className="grid gap-4">
        {requests.map((request) => (
          <Card key={request.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <span>{request.profiles.full_name}</span>
                    {getStatusBadge(request.status)}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {request.profiles.email} • {request.profiles.phone}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Demande créée le {new Date(request.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  {request.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleRequest(request.id, 'approved')}
                        disabled={processingId === request.id}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approuver
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRequest(request.id, 'rejected')}
                        disabled={processingId === request.id}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Rejeter
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
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
                  />
                </div>
              )}
              
              {request.admin_notes && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <div className="flex items-center mb-2">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    <span className="font-medium">Notes administratives:</span>
                  </div>
                  <p className="text-sm">{request.admin_notes}</p>
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
