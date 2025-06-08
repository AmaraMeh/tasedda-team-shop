
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { utils, writeFile } from 'xlsx';
import { useToast } from '@/hooks/use-toast';
import { Seller } from '@/types';
import { Check, X, Eye } from 'lucide-react';

const Sellers = () => {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState<Seller | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
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
          profiles:profiles!sellers_user_id_fkey(full_name, email, phone)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const typedData: Seller[] = data?.map(item => ({
        ...item,
        status: item.status as 'pending' | 'active' | 'refused' | 'blocked',
        subscription_status: item.subscription_status as 'trial' | 'active' | 'expired',
        profiles: item.profiles || { full_name: 'N/A', email: 'N/A', phone: 'N/A' }
      })) || [];
      
      setSellers(typedData);
    } catch (error: any) {
      console.error('Error fetching sellers:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les vendeurs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: 'active' | 'refused' | 'blocked') => {
    try {
      const { error } = await supabase
        .from('sellers')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Statut mis à jour",
        description: `Le vendeur a été ${status === 'active' ? 'activé' : status === 'refused' ? 'refusé' : 'bloqué'}`,
      });
      
      fetchSellers();
      setModalOpen(false);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive",
      });
    }
  };

  const handleSubscriptionPayment = async (id: string, paid: boolean) => {
    try {
      const subscriptionStatus = paid ? 'active' : 'expired';
      const subscriptionExpiresAt = paid 
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // +30 jours
        : new Date().toISOString();

      const { error } = await supabase
        .from('sellers')
        .update({ 
          subscription_status: subscriptionStatus,
          subscription_expires_at: subscriptionExpiresAt,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: paid ? "Paiement validé" : "Abonnement expiré",
        description: paid 
          ? "L'abonnement a été renouvelé pour 30 jours" 
          : "L'abonnement a été marqué comme expiré",
      });
      
      fetchSellers();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'abonnement",
        variant: "destructive",
      });
    }
  };

  const exportCSV = () => {
    const ws = utils.json_to_sheet(sellers.map(s => ({
      Nom: s.profiles?.full_name || 'N/A',
      Email: s.profiles?.email || 'N/A',
      Téléphone: s.profiles?.phone || 'N/A',
      'Nom boutique': s.business_name,
      Statut: s.status,
      'Statut abonnement': s.subscription_status,
      'Frais mensuel': s.monthly_fee,
      Date: new Date(s.created_at).toLocaleDateString()
    })));
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Vendeurs');
    writeFile(wb, 'vendeurs.xlsx');
  };

  const filtered = sellers.filter(s =>
    (s.profiles?.full_name || '').toLowerCase().includes(filter.toLowerCase()) ||
    (s.profiles?.email || '').toLowerCase().includes(filter.toLowerCase()) ||
    s.business_name.toLowerCase().includes(filter.toLowerCase())
  );

  if (loading) {
    return <div className="flex justify-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold gold-text">Gestion des Vendeurs</h2>
        <Button onClick={exportCSV} className="bg-gold/20 hover:bg-gold/30 text-gold border-gold/20">
          Exporter Excel
        </Button>
      </div>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Recherche par nom/email/boutique"
          className="flex-1 px-3 py-2 bg-black/50 border border-gold/20 rounded-lg text-white"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gold/10 border-b border-gold/20">
              <th className="text-left p-3 text-gold">Vendeur</th>
              <th className="text-left p-3 text-gold">Boutique</th>
              <th className="text-left p-3 text-gold">Contact</th>
              <th className="text-left p-3 text-gold">Statut</th>
              <th className="text-left p-3 text-gold">Abonnement</th>
              <th className="text-left p-3 text-gold">Frais</th>
              <th className="text-left p-3 text-gold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id} className="border-b border-gold/10 hover:bg-gold/5">
                <td className="p-3">
                  <div>
                    <div className="font-medium">{s.profiles?.full_name || 'N/A'}</div>
                    <div className="text-xs text-muted-foreground">{s.profiles?.email || 'N/A'}</div>
                  </div>
                </td>
                <td className="p-3">
                  <div className="font-medium">{s.business_name}</div>
                  <div className="text-xs text-muted-foreground">/{s.slug}</div>
                </td>
                <td className="p-3">{s.profiles?.phone || 'N/A'}</td>
                <td className="p-3">
                  <Badge variant={
                    s.status === 'active' ? 'default' :
                    s.status === 'pending' ? 'secondary' :
                    s.status === 'refused' ? 'destructive' : 'outline'
                  }>
                    {s.status === 'active' ? 'Actif' :
                     s.status === 'pending' ? 'En attente' :
                     s.status === 'refused' ? 'Refusé' : 'Bloqué'}
                  </Badge>
                </td>
                <td className="p-3">
                  <div className="space-y-1">
                    <Badge variant={
                      s.subscription_status === 'active' ? 'default' :
                      s.subscription_status === 'trial' ? 'secondary' : 'destructive'
                    }>
                      {s.subscription_status === 'active' ? 'Payé' :
                       s.subscription_status === 'trial' ? 'Essai' : 'Expiré'}
                    </Badge>
                    {s.subscription_status !== 'trial' && (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          onClick={() => handleSubscriptionPayment(s.id, true)}
                          className="bg-green-600 hover:bg-green-700 text-xs px-2 py-1 h-auto"
                        >
                          Valider paiement
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleSubscriptionPayment(s.id, false)}
                          className="bg-red-600 hover:bg-red-700 text-xs px-2 py-1 h-auto"
                        >
                          Expirer
                        </Button>
                      </div>
                    )}
                  </div>
                </td>
                <td className="p-3 text-gold font-medium">{s.monthly_fee} DA</td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => { setSelected(s); setModalOpen(true); }}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    {s.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(s.id, 'active')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(s.id, 'refused')}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                    {s.status === 'active' && (
                      <Button
                        size="sm"
                        onClick={() => handleStatusChange(s.id, 'blocked')}
                        variant="destructive"
                      >
                        Bloquer
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div className="text-center text-muted-foreground py-8">
          Aucun vendeur trouvé
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-black border-gold/20">
          <DialogTitle className="text-gold">Détail du vendeur</DialogTitle>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Nom :</strong> {selected.profiles?.full_name || 'N/A'}
                </div>
                <div>
                  <strong>Email :</strong> {selected.profiles?.email || 'N/A'}
                </div>
                <div>
                  <strong>Téléphone :</strong> {selected.profiles?.phone || 'N/A'}
                </div>
                <div>
                  <strong>Boutique :</strong> {selected.business_name}
                </div>
                <div>
                  <strong>Slug :</strong> /{selected.slug}
                </div>
                <div>
                  <strong>Statut :</strong> {selected.status}
                </div>
                <div>
                  <strong>Abonnement :</strong> {selected.subscription_status}
                </div>
                <div>
                  <strong>Frais :</strong> {selected.monthly_fee} DA
                </div>
              </div>
              
              {selected.description && (
                <div>
                  <strong>Description :</strong>
                  <p className="mt-1 text-muted-foreground">{selected.description}</p>
                </div>
              )}

              <div>
                <strong>Date d'inscription :</strong> {new Date(selected.created_at).toLocaleDateString()}
              </div>

              {selected.subscription_expires_at && (
                <div>
                  <strong>Expiration abonnement :</strong> {new Date(selected.subscription_expires_at).toLocaleDateString()}
                </div>
              )}

              <div className="flex gap-2 mt-6">
                {selected.status === 'pending' && (
                  <>
                    <Button 
                      onClick={() => handleStatusChange(selected.id, 'active')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Accepter
                    </Button>
                    <Button 
                      onClick={() => handleStatusChange(selected.id, 'refused')}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Refuser
                    </Button>
                  </>
                )}
                {selected.status === 'active' && (
                  <Button 
                    onClick={() => handleStatusChange(selected.id, 'blocked')}
                    variant="destructive"
                  >
                    Bloquer
                  </Button>
                )}
              </div>
            </div>
          )}
          <div className="flex gap-2 justify-end mt-4">
            <Button variant="outline" onClick={() => setModalOpen(false)} className="border-gold/20">
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Sellers;
