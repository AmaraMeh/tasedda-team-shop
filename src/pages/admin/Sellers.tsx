import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { utils, writeFile } from 'xlsx';
import { useToast } from '@/hooks/use-toast';

const Sellers = () => {
  const [sellers, setSellers] = useState<any[]>([]);
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSellers = async () => {
      const { data } = await supabase
        .from('shops')
        .select('*, profiles (full_name, email)')
        .order('created_at', { ascending: false });
      setSellers(data || []);
    };
    fetchSellers();
  }, []);

  const handleValidate = async (id: string) => {
    await supabase.from('shops').update({ status: 'active' }).eq('id', id);
    setSellers(sellers => sellers.map(s => s.id === id ? { ...s, status: 'active' } : s));
    toast({ title: 'Boutique validée', description: 'La boutique est maintenant active.' });
  };

  const handleRefuse = async (id: string) => {
    await supabase.from('shops').update({ status: 'refused' }).eq('id', id);
    setSellers(sellers => sellers.map(s => s.id === id ? { ...s, status: 'refused' } : s));
    toast({ title: 'Boutique refusée', description: 'La boutique a été refusée.' });
  };

  const exportCSV = () => {
    const ws = utils.json_to_sheet(sellers);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Boutiques');
    writeFile(wb, 'boutiques.csv');
  };

  const filtered = sellers.filter(s =>
    (s.profiles?.full_name || '').toLowerCase().includes(filter.toLowerCase()) ||
    (s.name || '').toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          placeholder="Recherche par nom"
          className="input input-bordered"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
        <Button onClick={exportCSV}>Exporter CSV</Button>
      </div>
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-gold/10">
            <th>Nom</th>
            <th>Email</th>
            <th>Boutique</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(s => (
            <tr key={s.id} className="border-b border-gold/10">
              <td>{s.profiles?.full_name}</td>
              <td>{s.profiles?.email}</td>
              <td>{s.name}</td>
              <td>
                {s.status === 'pending' && <span className="text-yellow-500">En attente</span>}
                {s.status === 'active' && <span className="text-green-500">Active</span>}
                {s.status === 'refused' && <span className="text-red-500">Refusée</span>}
              </td>
              <td>
                <Button size="sm" onClick={() => { setSelected(s); setModalOpen(true); }}>Voir</Button>
                {s.status === 'pending' && (
                  <>
                    <Button size="sm" className="ml-2 bg-green-600" onClick={() => handleValidate(s.id)}>Valider</Button>
                    <Button size="sm" className="ml-2 bg-red-600" onClick={() => handleRefuse(s.id)}>Refuser</Button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Modal de détails/édition */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogTitle>Détails de la boutique</DialogTitle>
          {selected && (
            <div>
              <div><b>Nom :</b> {selected.name}</div>
              <div><b>Description :</b> {selected.description}</div>
              <div><b>Statut :</b> {selected.status}</div>
              {/* ...autres infos */}
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
export default Sellers; 