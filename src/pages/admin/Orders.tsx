import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { utils, writeFile } from 'xlsx';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const paymentStatusOptions = [
  { value: 'pending', label: 'En attente' },
  { value: 'paid', label: 'Payé' },
  { value: 'failed', label: 'Échoué' }
];
const deliveryStatusOptions = [
  { value: 'pending', label: 'En attente' },
  { value: 'shipped', label: 'Expédié' },
  { value: 'delivered', label: 'Livré' },
  { value: 'cancelled', label: 'Annulé' }
];

const Orders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [userInfo, setUserInfo] = useState<any | null>(null);
  const [editStatus, setEditStatus] = useState({ payment_status: '', delivery_status: '' });
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

  // Fetch user info and items when modal opens
  useEffect(() => {
    if (selected) {
      // Fetch user info
      supabase
        .from('profiles')
        .select('full_name, email, phone')
        .eq('id', selected.user_id)
        .single()
        .then(({ data }) => setUserInfo(data));
      // Fetch order items with product info
      supabase
        .from('order_items')
        .select('*, product:products(name, price)')
        .eq('order_id', selected.id)
        .then(({ data }) => setOrderItems(data || []));
      setEditStatus({
        payment_status: selected.payment_status || 'pending',
        delivery_status: selected.delivery_status || 'pending',
      });
    } else {
      setOrderItems([]);
      setUserInfo(null);
    }
  }, [selected]);

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

  const handleEdit = async () => {
    if (!selected) return;
    await supabase.from('orders').update(editStatus).eq('id', selected.id);
    setOrders(orders => orders.map(o => o.id === selected.id ? { ...o, ...editStatus } : o));
    toast({ title: 'Commande modifiée' });
    setModalOpen(false);
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
                <td>{o.status || '-'}</td>
                <td>{o.payment_status || '-'}</td>
                <td>{o.delivery_status || '-'}</td>
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
            <div className="space-y-4">
              <div><b>ID :</b> {selected.id}</div>
              <div><b>Numéro :</b> {selected.order_number}</div>
              <div><b>Date :</b> {selected.created_at ? new Date(selected.created_at).toLocaleString() : '-'}</div>
              <div><b>Client :</b> {userInfo ? `${userInfo.full_name} (${userInfo.email}, ${userInfo.phone})` : selected.user_id}</div>
              <div><b>Montant total :</b> {selected.total_amount} DA</div>
              <div><b>Statut paiement :</b>
                <Select value={editStatus.payment_status} onValueChange={v => setEditStatus(s => ({ ...s, payment_status: v }))}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentStatusOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div><b>Statut livraison :</b>
                <Select value={editStatus.delivery_status} onValueChange={v => setEditStatus(s => ({ ...s, delivery_status: v }))}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {deliveryStatusOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div><b>Adresse :</b> {selected.shipping_address ? JSON.stringify(selected.shipping_address) : '-'}</div>
              <div><b>Produits :</b>
                <ul className="list-disc ml-6">
                  {orderItems.map(item => (
                    <li key={item.id}>
                      {item.product?.name} - {item.quantity} x {item.price} DA
                      {item.size && ` | Taille: ${item.size}`}
                      {item.color && ` | Couleur: ${item.color}`}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex gap-2 justify-end mt-4">
                <Button variant="outline" onClick={() => setModalOpen(false)}>Fermer</Button>
                <Button onClick={handleEdit} className="btn-gold">Sauvegarder</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Orders; 