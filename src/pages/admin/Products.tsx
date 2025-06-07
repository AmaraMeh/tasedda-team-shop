import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { utils, writeFile } from 'xlsx';
import { useToast } from '@/hooks/use-toast';

const Products = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      setProducts(data || []);
    };
    fetchProducts();
  }, []);

  const exportCSV = () => {
    const ws = utils.json_to_sheet(products);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Products');
    writeFile(wb, 'products.csv');
  };

  const filtered = products.filter(p =>
    (p.name || '').toLowerCase().includes(filter.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    await supabase.from('products').delete().eq('id', id);
    setProducts(products => products.filter(p => p.id !== id));
    toast({ title: 'Produit supprimé' });
  };

  const handleEdit = async (id: string, data: any) => {
    await supabase.from('products').update(data).eq('id', id);
    setProducts(products => products.map(p => p.id === id ? { ...p, ...data } : p));
    toast({ title: 'Produit modifié' });
  };

  return (
    <div>
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
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gold/10">
              <th>Produit</th>
              <th>Prix</th>
              <th>Stock</th>
              <th>Vendeur</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="border-b border-gold/10">
                <td>{p.name}</td>
                <td>{p.price} DA</td>
                <td>{p.stock}</td>
                <td>{p.seller_id}</td>
                <td>{p.status}</td>
                <td>
                  <Button size="sm" onClick={() => { setSelected(p); setModalOpen(true); }}>Voir</Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(p.id)}>Supprimer</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogTitle>Détail produit</DialogTitle>
          {selected && (
            <div>
              <div><b>Nom :</b> {selected.name}</div>
              <div><b>Prix :</b> {selected.price} DA</div>
              <div><b>Stock :</b> {selected.stock}</div>
              <div><b>Vendeur :</b> {selected.seller_id}</div>
              <div><b>Statut :</b> {selected.status}</div>
              {/* Ajoute ici édition du statut, validation produit, etc. */}
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
export default Products; 