import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { utils, writeFile } from 'xlsx';
import { useToast } from '@/hooks/use-toast';

const Orders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchOrders = async () => {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      setOrders(data || []);
    };
    fetchOrders();
  }, []);

  const exportCSV = () => {
    const ws = utils.json_to_sheet(orders);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Orders');
    writeFile(wb, 'orders.csv');
  };

  const filtered = orders.filter(o =>
    (o.id || '').toLowerCase().includes(filter.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    await supabase.from('orders').delete().eq('id', id);
    setOrders(orders => orders.filter(o => o.id !== id));
    toast({ title: 'Commande supprimée' });
  };

  const handleEdit = async (id: string, data: any) => {
    await supabase.from('orders').update(data).eq('id', id);
    setOrders(orders => orders.map(o => o.id === id ? { ...o, ...data } : o));
    toast({ title: 'Commande modifiée' });
  };

  return (
    <div>
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          placeholder="Recherche par ID"
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
              <th>Commande</th>
              <th>Client</th>
              <th>Statut</th>
              <th>Paiement</th>
              <th>Livraison</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(o => (
              <tr key={o.id} className="border-b border-gold/10">
                <td>{o.id}</td>
                <td>{o.user_id}</td>
                <td>{o.status}</td>
                <td>{o.payment_status}</td>
                <td>{o.delivery_status}</td>
                <td>
                  <Button size="sm" onClick={() => { setSelected(o); setModalOpen(true); }}>Voir</Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(o.id)}>Supprimer</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogTitle>Détail commande</DialogTitle>
          {selected && (
            <div>
              <div><b>ID :</b> {selected.id}</div>
              <div><b>Client :</b> {selected.user_id}</div>
              <div><b>Statut :</b> {selected.status}</div>
              <div><b>Paiement :</b> {selected.payment_status}</div>
              <div><b>Livraison :</b> {selected.delivery_status}</div>
              {/* Ajoute ici édition du statut, validation paiement, etc. */}
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
export default Orders; 