import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { utils, writeFile } from 'xlsx';
import { useToast } from '@/hooks/use-toast';

const TeamMembers = () => {
  const [members, setMembers] = useState<any[]>([]);
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMembers = async () => {
      const { data } = await supabase
        .from('team_members')
        .select('*, profiles (full_name, email)')
        .order('created_at', { ascending: false });
      setMembers(data || []);
    };
    fetchMembers();
  }, []);

  const exportCSV = () => {
    const ws = utils.json_to_sheet(members);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'TeamMembers');
    writeFile(wb, 'team_members.csv');
  };

  const filtered = members.filter(m =>
    (m.profiles?.full_name || '').toLowerCase().includes(filter.toLowerCase()) ||
    (m.profiles?.email || '').toLowerCase().includes(filter.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    await supabase.from('team_members').delete().eq('id', id);
    setMembers(members => members.filter(m => m.id !== id));
    toast({ title: 'Membre supprimé' });
  };

  const handleEdit = async (id: string, data: any) => {
    await supabase.from('team_members').update(data).eq('id', id);
    setMembers(members => members.map(m => m.id === id ? { ...m, ...data } : m));
    toast({ title: 'Membre modifié' });
  };

  return (
    <div>
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
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gold/10">
              <th>Nom</th>
              <th>Email</th>
              <th>Code promo</th>
              <th>Rang</th>
              <th>Ventes</th>
              <th>Commissions</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(m => (
              <tr key={m.id} className="border-b border-gold/10">
                <td>{m.profiles?.full_name}</td>
                <td>{m.profiles?.email}</td>
                <td>{m.promo_code}</td>
                <td>{m.rank}</td>
                <td>{m.total_sales}</td>
                <td>{m.total_commissions} DA</td>
                <td>
                  <Button size="sm" onClick={() => { setSelected(m); setModalOpen(true); }}>Voir</Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(m.id)}>Supprimer</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogTitle>Détail membre</DialogTitle>
          {selected && (
            <div>
              <div><b>Nom :</b> {selected.profiles?.full_name}</div>
              <div><b>Email :</b> {selected.profiles?.email}</div>
              <div><b>Code promo :</b> {selected.promo_code}</div>
              <div><b>Rang :</b> {selected.rank}</div>
              <div><b>Ventes :</b> {selected.total_sales}</div>
              <div><b>Commissions :</b> {selected.total_commissions} DA</div>
              {/* Ajoute ici édition du rang, validation commissions, etc. */}
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

export default TeamMembers; 