
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { utils, writeFile } from 'xlsx';
import { useToast } from '@/hooks/use-toast';
import { TeamJoinRequest } from '@/types';

const TeamRequests = () => {
  const [requests, setRequests] = useState<TeamJoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState<TeamJoinRequest | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    const { data } = await supabase
      .from('team_join_requests')
      .select(`
        *,
        profiles:profiles!team_join_requests_user_id_fkey(full_name, email, phone)
      `)
      .order('created_at', { ascending: false });
    
    if (data) {
      const typedData: TeamJoinRequest[] = data.map(item => ({
        ...item,
        status: item.status as 'pending' | 'approved' | 'rejected'
      }));
      setRequests(typedData);
    }
    setLoading(false);
  };

  const handleAction = async (id: string, status: 'approved' | 'rejected') => {
    const req = requests.find(r => r.id === id);
    if (!req) return;
    
    if (status === 'approved') {
      // Générer un code promo unique LIONxxxx
      let promoCode;
      let exists = true;
      while (exists) {
        promoCode = 'LION' + Math.floor(1000 + Math.random() * 9000);
        const { data: existing } = await supabase.from('team_members').select('id').eq('promo_code', promoCode).single();
        exists = !!existing;
      }
      // Créer le membre d'équipe
      await supabase.from('team_members').insert({
        user_id: req.user_id,
        promo_code: promoCode,
        invited_by: req.invited_by,
        rank: 1,
        total_sales: 0,
        total_commissions: 0,
        available_commissions: 0,
        is_active: true
      });
    }
    
    await supabase.from('team_join_requests').update({ status }).eq('id', id);
    
    toast({ title: status === 'approved' ? 'Demande acceptée' : 'Demande refusée' });
    fetchRequests();
    setModalOpen(false);
  };

  const exportCSV = () => {
    const ws = utils.json_to_sheet(requests.map(r => ({
      Nom: r.profiles?.full_name,
      Email: r.profiles?.email,
      Téléphone: r.profiles?.phone,
      Statut: r.status,
      Date: new Date(r.created_at).toLocaleDateString()
    })));
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'DemandesTeam');
    writeFile(wb, 'demandes_team.xlsx');
  };

  const filtered = requests.filter(r =>
    (r.profiles?.full_name || '').toLowerCase().includes(filter.toLowerCase()) ||
    (r.profiles?.email || '').toLowerCase().includes(filter.toLowerCase())
  );

  if (loading) return <div>Chargement...</div>;
  
  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          placeholder="Recherche par nom/email"
          className="input input-bordered flex-1 px-3 py-2 bg-black/50 border border-gold/20 rounded-lg text-white"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
        <Button onClick={exportCSV} className="bg-gold/20 hover:bg-gold/30 text-gold border-gold/20">
          Exporter Excel
        </Button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gold/10 border-b border-gold/20">
              <th className="text-left p-3 text-gold">Nom</th>
              <th className="text-left p-3 text-gold">Email</th>
              <th className="text-left p-3 text-gold">Téléphone</th>
              <th className="text-left p-3 text-gold">Date</th>
              <th className="text-left p-3 text-gold">Statut</th>
              <th className="text-left p-3 text-gold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} className="border-b border-gold/10 hover:bg-gold/5">
                <td className="p-3">{r.profiles?.full_name || 'N/A'}</td>
                <td className="p-3">{r.profiles?.email}</td>
                <td className="p-3">{r.profiles?.phone || 'N/A'}</td>
                <td className="p-3">{new Date(r.created_at).toLocaleDateString()}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    r.status === 'approved' ? 'bg-green-500/20 text-green-500' :
                    r.status === 'rejected' ? 'bg-red-500/20 text-red-500' :
                    'bg-yellow-500/20 text-yellow-500'
                  }`}>
                    {r.status === 'approved' ? 'Approuvé' :
                     r.status === 'rejected' ? 'Rejeté' :
                     'En attente'}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => { setSelected(r); setModalOpen(true); }} className="bg-blue-600 hover:bg-blue-700">
                      Voir
                    </Button>
                    {r.status === 'pending' && (
                      <>
                        <Button onClick={() => handleAction(r.id, 'approved')} size="sm" className="bg-green-600 hover:bg-green-700">
                          Accepter
                        </Button>
                        <Button onClick={() => handleAction(r.id, 'rejected')} size="sm" className="bg-red-600 hover:bg-red-700">
                          Refuser
                        </Button>
                      </>
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
          Aucune demande trouvée
        </div>
      )}
      
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-black border-gold/20">
          <DialogTitle className="text-gold">Détail de la demande</DialogTitle>
          {selected && (
            <div className="space-y-3">
              <div><strong>Nom :</strong> {selected.profiles?.full_name}</div>
              <div><strong>Email :</strong> {selected.profiles?.email}</div>
              <div><strong>Téléphone :</strong> {selected.profiles?.phone}</div>
              <div><strong>Statut :</strong> {selected.status}</div>
              <div><strong>Date :</strong> {new Date(selected.created_at).toLocaleDateString()}</div>
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

export default TeamRequests;
