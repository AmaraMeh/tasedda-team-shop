import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Package } from 'lucide-react';

interface SellerRequest {
  id: string;
  user_id: string;
  business_name: string;
  seller_type: 'normal' | 'wholesale';
  status: 'pending' | 'active' | 'suspended';
  description: string;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
    phone: string;
  } | null;
}

const SellerRequests = () => {
  const [requests, setRequests] = useState<SellerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('sellers')
        .select(`
          id,
          user_id,
          business_name,
          seller_type,
          status,
          description,
          created_at,
          profiles(full_name, email, phone)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data) {
        const mappedRequests = data.map(item => ({
          ...item,
          seller_type: item.seller_type as 'normal' | 'wholesale',
          status: item.status as 'pending' | 'active' | 'suspended'
        }));
        setRequests(mappedRequests);
      }
    } catch (error: any) {
      console.error('Error fetching seller requests:', error);
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (requestId: string, action: 'active' | 'suspended') => {
    setProcessingId(requestId);
    
    try {
      const request = requests.find(r => r.id === requestId);
      if (!request) return;

      // Update seller status
      const { error: updateError } = await supabase
        .from('sellers')
        .update({ 
          status: action,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (updateError) throw updateError;

      toast({
        title: action === 'active' ? "Vendeur approuvé" : "Vendeur suspendu",
        description: `Le vendeur ${request.business_name} a été ${action === 'active' ? 'approuvé' : 'suspendu'}.`,
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
      case 'active':
        return <Badge className="bg-green-500">Approuvé</Badge>;
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
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-xl sm:text-2xl font-bold">Demandes de Vendeurs</h1>
        <div className="text-sm text-muted-foreground">
          {requests.filter(r => r.status === 'pending').length} en attente
        </div>
      </div>

      <div className="space-y-4">
        {requests.map((request) => (
          <Card key={request.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-base sm:text-lg">
                    <span className="truncate">{request.business_name}</span>
                    {getSellerTypeBadge(request.seller_type)}
                    {getStatusBadge(request.status)}
                  </CardTitle>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-muted-foreground truncate">
                      {request.profiles?.full_name || 'Nom non disponible'}
                    </p>
                    <p className="text-sm text-muted-foreground">
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
                
                <div className="flex flex-col sm:flex-row gap-2">
                  {request.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleRequest(request.id, 'active')}
                        disabled={processingId === request.id}
                        className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approuver
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRequest(request.id, 'suspended')}
                        disabled={processingId === request.id}
                        className="w-full sm:w-auto"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Rejeter
                      </Button>
                    </>
                  )}
                  {request.status === 'active' && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRequest(request.id, 'suspended')}
                      disabled={processingId === request.id}
                      className="w-full sm:w-auto"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Suspendre
                    </Button>
                  )}
                  {request.status === 'suspended' && (
                    <Button
                      size="sm"
                      onClick={() => handleRequest(request.id, 'active')}
                      disabled={processingId === request.id}
                      className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Réactiver
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Description:</span>
                  <p className="text-sm text-muted-foreground">{request.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {requests.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">Aucune demande de vendeur.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SellerRequests; 