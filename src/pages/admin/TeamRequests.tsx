import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { utils, writeFile } from 'xlsx';
import { useToast } from '@/hooks/use-toast';

const TeamRequests = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchRequests = async () => {
      const { data } = await supabase
        .from('team_join_requests')
        .select('*, profiles:profiles!team_join_requests_user_id_fkey(full_name, email, phone)')
        .order('created_at', { ascending: false });
      setRequests(data || []);
      setLoading(false);
    };
    fetchRequests();
  }, []);

  const handleAction = async (id: string, status: 'approved' | 'rejected') => {
    await supabase.from('team_join_requests').update({ status }).eq('id', id);
    setRequests(reqs => reqs.map(r => r.id === id ? { ...r, status } : r));
    toast({ title: status === 'approved' ? 'Demande acceptée' : 'Demande refusée' });
  };

  const exportCSV = () => {
    const ws = utils.json_to_sheet(requests);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'DemandesTeam');
    writeFile(wb, 'demandes_team.csv');
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
          className="input input-bordered"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
        <Button onClick={exportCSV}>Exporter CSV</Button>
      </div>
      {filtered.map(r => (
        <div key={r.id} className="bg-black/40 p-4 rounded flex justify-between items-center">
          <div>
            <div className="font-bold">{r.profiles?.full_name || r.profiles?.email}</div>
            <div className="text-xs text-muted-foreground">{r.profiles?.email}</div>
            <div className="text-xs">Demandé le : {new Date(r.created_at).toLocaleDateString()}</div>
            <div className="text-xs">Statut : {r.status}</div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => { setSelected(r); setModalOpen(true); }}>Voir</Button>
            {r.status === 'pending' && (
              <>
                <Button onClick={() => handleAction(r.id, 'approved')} size="sm" className="bg-green-600">Accepter</Button>
                <Button onClick={() => handleAction(r.id, 'rejected')} size="sm" className="bg-red-600">Refuser</Button>
              </>
            )}
          </div>
        </div>
      ))}
      {filtered.length === 0 && <div className="text-center text-muted-foreground">Aucune demande en attente</div>}
      {/* Modal de détails */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogTitle>Détail de la demande</DialogTitle>
          {selected && (
            <div>
              <div><b>Nom :</b> {selected.profiles?.full_name}</div>
              <div><b>Email :</b> {selected.profiles?.email}</div>
              <div><b>Téléphone :</b> {selected.profiles?.phone}</div>
              <div><b>Statut :</b> {selected.status}</div>
              <div><b>Date :</b> {new Date(selected.created_at).toLocaleDateString()}</div>
            </div>
          )}
          <div className="flex gap-2 justify-end mt-4">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Fermer</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default TeamRequests; 