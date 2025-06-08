import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { utils, writeFile } from 'xlsx';
import { useToast } from '@/hooks/use-toast';

type Seller = {
  id: string;
  user_id: string;
  business_name: string;
  slug: string;
  description: string;
  is_active: boolean | null;
  monthly_fee: number;
  created_at: string;
  updated_at: string;
  profiles: {
    full_name: string;
    email: string;
  };
};

const Sellers = () => {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState<Seller | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { toast } = useToast();
  const [pendingShops, setPendingShops] = useState<Seller[]>([]);
  const [activeSellers, setActiveSellers] = useState<Seller[]>([]);
  const [managers, setManagers] = useState<any[]>([]);

  const fetchSellers = useCallback(async () => {
    const { data: sellersData } = await supabase
      .from('sellers')
      .select('*, profiles (full_name, email)')
      .order('created_at', { ascending: false });
    setPendingShops((sellersData as any[] | null)?.filter(s => s.is_active === false) || []);
    setActiveSellers((sellersData as any[] | null)?.filter(s => s.is_active === true) || []);
  }, []);

  useEffect(() => {
    fetchSellers();
    const fetchManagers = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'manager');
      if (error) {
        console.error('Erreur chargement managers:', error);
        setManagers([]);
      } else {
        setManagers(data || []);
      }
    };
    fetchManagers();
  }, [fetchSellers]);

  const handleValidate = async (id: string) => {
    await supabase.from('sellers').update({ is_active: true }).eq('id', id);
    await fetchSellers();
    toast({ title: 'Boutique activée', description: 'La boutique est maintenant active.' });
  };

  const handleRefuse = async (id: string) => {
    await supabase.from('sellers').update({ is_active: false }).eq('id', id);
    await fetchSellers();
    toast({ title: 'Boutique refusée', description: 'La boutique a été refusée.' });
  };

  const handleDelete = async (id: string) => {
    await supabase.from('sellers').delete().eq('id', id);
    await fetchSellers();
    toast({ title: 'Boutique supprimée' });
  };

  const handleBlock = async (id: string) => {
    await supabase.from('sellers').update({ is_active: false }).eq('id', id);
    await fetchSellers();
    toast({ title: 'Boutique bloquée' });
  };

  const handleActivate = async (id: string) => {
    await supabase.from('sellers').update({ is_active: true }).eq('id', id);
    await fetchSellers();
    toast({ title: 'Boutique activée', description: 'La boutique est maintenant active.' });
  };

  const handleFree = async (id: string) => {
    await supabase.from('sellers').update({ monthly_fee: 0 }).eq('id', id);
    await fetchSellers();
    toast({ title: 'Abonnement offert' });
  };

  const exportCSV = () => {
    const ws = utils.json_to_sheet(sellers);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Boutiques');
    writeFile(wb, 'boutiques.csv');
  };

  const filtered = sellers.filter(s =>
    (s.profiles?.full_name || '').toLowerCase().includes(filter.toLowerCase()) ||
    (s.business_name || '').toLowerCase().includes(filter.toLowerCase())
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
      <h2 className="text-xl font-bold mb-2">Demandes de création de boutique</h2>
      <table className="min-w-full text-sm mb-8">
        <thead>
          <tr className="bg-gold/10">
            <th>Boutique</th>
            <th>Propriétaire</th>
            <th>Email</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {pendingShops.map(s => (
            <tr key={s.id} className="border-b border-gold/10">
              <td>{s.business_name}</td>
              <td>{s.profiles?.full_name}</td>
              <td>{s.profiles?.email}</td>
              <td>{new Date(s.created_at).toLocaleDateString()}</td>
              <td>
                <Button size="sm" className="bg-green-600" onClick={() => handleActivate(s.id)}>Valider</Button>
                <Button size="sm" className="ml-2 bg-red-600" onClick={() => handleDelete(s.id)}>Supprimer</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2 className="text-xl font-bold mb-2">Vendeurs actifs</h2>
      <table className="min-w-full text-sm mb-8">
        <thead>
          <tr className="bg-gold/10">
            <th>Boutique</th>
            <th>Propriétaire</th>
            <th>Email</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {activeSellers.map(s => (
            <tr key={s.id} className="border-b border-gold/10">
              <td>{s.business_name}</td>
              <td>{s.profiles?.full_name}</td>
              <td>{s.profiles?.email}</td>
              <td>{new Date(s.created_at).toLocaleDateString()}</td>
              <td>
                <Button size="sm" className="bg-red-600" onClick={() => handleBlock(s.id)}>Bloquer</Button>
                <Button size="sm" className="ml-2 bg-gold/80" onClick={() => handleFree(s.id)}>Offrir gratuit</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2 className="text-xl font-bold mb-2">Managers</h2>
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-gold/10">
            <th>Nom</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {managers.map(m => (
            <tr key={m.id} className="border-b border-gold/10">
              <td>{m.full_name}</td>
              <td>{m.email}</td>
              <td>
                <Button size="sm" className="bg-red-600" onClick={async () => { await supabase.from('profiles').delete().eq('id', m.id); setManagers(list => list.filter(x => x.id !== m.id)); toast({ title: 'Manager supprimé' }); }}>Supprimer</Button>
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
              <div><b>Nom :</b> {selected.business_name}</div>
              <div><b>Description :</b> {selected.description}</div>
              <div><b>Statut :</b> {selected.is_active ? 'Active' : 'En attente / Refusée'}</div>
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