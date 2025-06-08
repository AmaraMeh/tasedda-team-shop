
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { utils, writeFile } from 'xlsx';
import { useToast } from '@/hooks/use-toast';
import { Seller } from '@/types';
import { Store, Eye, CheckCircle, XCircle, Clock, Ban } from 'lucide-react';

const Sellers = () => {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState<Seller | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { toast } = useToast();

  const fetchSellers = useCallback(async () => {
    const { data: sellersData } = await supabase
      .from('sellers')
      .select(`
        *,
        profiles:profiles!sellers_user_id_fkey(full_name, email, phone)
      `)
      .order('created_at', { ascending: false });
    
    if (sellersData) {
      const typedData: Seller[] = sellersData.map(item => ({
        ...item,
        status: item.status as 'pending' | 'active' | 'refused' | 'blocked',
        subscription_status: item.subscription_status as 'trial' | 'active' | 'expired',
        profiles: item.profiles || { full_name: 'N/A', email: 'N/A', phone: 'N/A' }
      }));
      setSellers(typedData);
    }
  }, []);

  useEffect(() => {
    fetchSellers();
  }, [fetchSellers]);

  const handleStatusChange = async (id: string, status: 'active' | 'refused' | 'blocked') => {
    const { error } = await supabase
      .from('sellers')
      .update({ 
        status,
        is_active: status === 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
    
    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
      return;
    }
    
    await fetchSellers();
    toast({ 
      title: status === 'active' ? 'Boutique validée' : 
             status === 'refused' ? 'Boutique refusée' : 'Boutique bloquée'
    });
  };

  const handleSubscriptionAction = async (id: string, action: 'free' | 'extend') => {
    const updates: any = { updated_at: new Date().toISOString() };
    
    if (action === 'free') {
      updates.monthly_fee = 0;
      updates.subscription_status = 'active';
      updates.subscription_expires_at = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(); // 1 an
    } else if (action === 'extend') {
      updates.subscription_expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 1 mois
    }
    
    const { error } = await supabase
      .from('sellers')
      .update(updates)
      .eq('id', id);
    
    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
      return;
    }
    
    await fetchSellers();
    toast({ title: action === 'free' ? 'Abonnement offert' : 'Abonnement prolongé' });
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('sellers').delete().eq('id', id);
    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
      return;
    }
    
    await fetchSellers();
    toast({ title: 'Boutique supprimée' });
  };

  const exportCSV = () => {
    const ws = utils.json_to_sheet(sellers.map(s => ({
      'Nom de la boutique': s.business_name,
      'Propriétaire': s.profiles?.full_name,
      'Email': s.profiles?.email,
      'Téléphone': s.profiles?.phone,
      'Statut': s.status,
      'Abonnement': s.subscription_status,
      'Frais mensuel': s.monthly_fee,
      'Date de création': new Date(s.created_at).toLocaleDateString()
    })));
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Boutiques');
    writeFile(wb, 'boutiques.xlsx');
  };

  const filtered = sellers.filter(s =>
    (s.profiles?.full_name || '').toLowerCase().includes(filter.toLowerCase()) ||
    (s.business_name || '').toLowerCase().includes(filter.toLowerCase()) ||
    (s.profiles?.email || '').toLowerCase().includes(filter.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-500"><Clock className="w-3 h-3 mr-1" />En attente</Badge>;
      case 'active':
        return <Badge className="bg-green-500/20 text-green-500"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
      case 'refused':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Refusée</Badge>;
      case 'blocked':
        return <Badge variant="destructive"><Ban className="w-3 h-3 mr-1" />Bloquée</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSubscriptionBadge = (subscription: string) => {
    switch (subscription) {
      case 'trial':
        return <Badge variant="secondary" className="bg-blue-500/20 text-blue-500">Essai</Badge>;
      case 'active':
        return <Badge className="bg-green-500/20 text-green-500">Actif</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expiré</Badge>;
      default:
        return <Badge variant="outline">{subscription}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold gold-text">Gestion des Boutiques Tasedda</h2>
        <Button onClick={exportCSV} variant="outline" className="border-gold/20">
          Exporter Excel
        </Button>
      </div>

      <div className="flex gap-2 mb-4">
        <Input
          type="text"
          placeholder="Recherche par nom, boutique ou email"
          className="flex-1 bg-black/50 border-gold/20"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gold/10 border-b border-gold/20">
              <th className="text-left p-3 text-gold">Boutique</th>
              <th className="text-left p-3 text-gold">Propriétaire</th>
              <th className="text-left p-3 text-gold">Contact</th>
              <th className="text-left p-3 text-gold">Statut</th>
              <th className="text-left p-3 text-gold">Abonnement</th>
              <th className="text-left p-3 text-gold">Frais/mois</th>
              <th className="text-left p-3 text-gold">Date</th>
              <th className="text-left p-3 text-gold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id} className="border-b border-gold/10 hover:bg-gold/5">
                <td className="p-3">
                  <div>
                    <div className="font-medium">{s.business_name}</div>
                    <div className="text-xs text-muted-foreground">/{s.slug}</div>
                  </div>
                </td>
                <td className="p-3">{s.profiles?.full_name}</td>
                <td className="p-3">
                  <div className="text-xs">
                    <div>{s.profiles?.email}</div>
                    <div className="text-muted-foreground">{s.profiles?.phone}</div>
                  </div>
                </td>
                <td className="p-3">{getStatusBadge(s.status)}</td>
                <td className="p-3">{getSubscriptionBadge(s.subscription_status)}</td>
                <td className="p-3">
                  <span className={s.monthly_fee === 0 ? 'text-green-500 font-bold' : 'text-gold'}>
                    {s.monthly_fee} DA
                  </span>
                </td>
                <td className="p-3">{new Date(s.created_at).toLocaleDateString()}</td>
                <td className="p-3">
                  <div className="flex gap-1 flex-wrap">
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
                          ✓
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => handleStatusChange(s.id, 'refused')}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          ✗
                        </Button>
                      </>
                    )}
                    
                    {s.status === 'active' && (
                      <Button 
                        size="sm" 
                        onClick={() => handleStatusChange(s.id, 'blocked')}
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        <Ban className="h-3 w-3" />
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
        <div className="text-center py-12">
          <Store className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Aucune boutique trouvée</p>
        </div>
      )}

      {/* Modal de détails/gestion */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-black border-gold/20 max-w-2xl">
          <DialogTitle className="text-gold">Gestion de la boutique</DialogTitle>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Informations boutique</h4>
                  <div className="space-y-1 text-sm">
                    <div><strong>Nom :</strong> {selected.business_name}</div>
                    <div><strong>URL :</strong> /boutique/{selected.slug}</div>
                    <div><strong>Description :</strong> {selected.description || 'N/A'}</div>
                    <div><strong>Statut :</strong> {getStatusBadge(selected.status)}</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Propriétaire</h4>
                  <div className="space-y-1 text-sm">
                    <div><strong>Nom :</strong> {selected.profiles?.full_name}</div>
                    <div><strong>Email :</strong> {selected.profiles?.email}</div>
                    <div><strong>Téléphone :</strong> {selected.profiles?.phone}</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Abonnement</h4>
                  <div className="space-y-1 text-sm">
                    <div><strong>Statut :</strong> {getSubscriptionBadge(selected.subscription_status)}</div>
                    <div><strong>Frais :</strong> {selected.monthly_fee} DA/mois</div>
                    <div><strong>Expire le :</strong> {new Date(selected.subscription_expires_at).toLocaleDateString()}</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Dates</h4>
                  <div className="space-y-1 text-sm">
                    <div><strong>Créé le :</strong> {new Date(selected.created_at).toLocaleDateString()}</div>
                    <div><strong>Modifié le :</strong> {new Date(selected.updated_at).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gold/20 pt-4">
                <h4 className="font-semibold mb-3">Actions</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {selected.status === 'pending' && (
                    <>
                      <Button 
                        onClick={() => handleStatusChange(selected.id, 'active')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Valider
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
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      Bloquer
                    </Button>
                  )}
                  
                  <Button 
                    onClick={() => handleSubscriptionAction(selected.id, 'free')}
                    className="bg-gold/80 text-black hover:bg-gold"
                  >
                    Offrir gratuit
                  </Button>
                  
                  <Button 
                    onClick={() => handleSubscriptionAction(selected.id, 'extend')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Prolonger 1 mois
                  </Button>
                  
                  <Button 
                    onClick={() => handleDelete(selected.id)}
                    variant="destructive"
                  >
                    Supprimer
                  </Button>
                </div>
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
