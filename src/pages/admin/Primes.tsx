
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Prime } from '@/types';

const Primes = () => {
  const [primes, setPrimes] = useState<Prime[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Prime | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPrimes();
  }, []);

  const fetchPrimes = async () => {
    const { data } = await supabase
      .from('primes')
      .select(`
        *,
        inviter:profiles!primes_inviter_id_fkey(full_name, email),
        invited:profiles!primes_invited_id_fkey(full_name, email)
      `)
      .order('created_at', { ascending: false });
    
    if (data) {
      const typedData: Prime[] = data.map(item => ({
        ...item,
        status: item.status as 'pending' | 'paid' | 'cancelled'
      }));
      setPrimes(typedData);
    }
    setLoading(false);
  };

  const handleAction = async (id: string, status: 'paid' | 'cancelled', notes?: string) => {
    await supabase
      .from('primes')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
    
    toast({ title: `Prime ${status === 'paid' ? 'validée' : 'annulée'}` });
    fetchPrimes();
    setModalOpen(false);
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gold/10 border-b border-gold/20">
              <th className="text-left p-3 text-gold">Invitant</th>
              <th className="text-left p-3 text-gold">Invité</th>
              <th className="text-left p-3 text-gold">Montant</th>
              <th className="text-left p-3 text-gold">Statut</th>
              <th className="text-left p-3 text-gold">Date</th>
              <th className="text-left p-3 text-gold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {primes.map(p => (
              <tr key={p.id} className="border-b border-gold/10 hover:bg-gold/5">
                <td className="p-3">{p.inviter?.full_name}</td>
                <td className="p-3">{p.invited?.full_name}</td>
                <td className="p-3 font-bold">{p.amount} DA</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    p.status === 'paid' ? 'bg-green-500/20 text-green-500' :
                    p.status === 'cancelled' ? 'bg-red-500/20 text-red-500' :
                    'bg-yellow-500/20 text-yellow-500'
                  }`}>
                    {p.status === 'paid' ? 'Payée' :
                     p.status === 'cancelled' ? 'Annulée' :
                     'En attente'}
                  </span>
                </td>
                <td className="p-3">{new Date(p.created_at).toLocaleDateString()}</td>
                <td className="p-3">
                  <Button size="sm" onClick={() => { setSelected(p); setModalOpen(true); }} className="bg-blue-600 hover:bg-blue-700">
                    Gérer
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-black border-gold/20">
          <DialogTitle className="text-gold">Gérer la prime</DialogTitle>
          {selected && (
            <div className="space-y-4">
              <div><strong>Invitant :</strong> {selected.inviter?.full_name}</div>
              <div><strong>Invité :</strong> {selected.invited?.full_name}</div>
              <div><strong>Montant :</strong> {selected.amount} DA</div>
              <div><strong>Date :</strong> {new Date(selected.created_at).toLocaleDateString()}</div>
              
              {selected.status === 'pending' && (
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleAction(selected.id, 'paid', 'Prime validée par admin')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Valider
                  </Button>
                  <Button 
                    onClick={() => handleAction(selected.id, 'cancelled', 'Prime annulée par admin')}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Annuler
                  </Button>
                </div>
              )}
            </div>
          )}
          <Button variant="outline" onClick={() => setModalOpen(false)} className="border-gold/20">
            Fermer
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Primes;
