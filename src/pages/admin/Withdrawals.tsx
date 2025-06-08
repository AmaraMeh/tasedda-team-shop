
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

const Withdrawals = () => {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    const { data } = await supabase
      .from('withdrawal_requests')
      .select(`
        *,
        team_members!inner(
          promo_code,
          profiles!inner(full_name, email)
        )
      `)
      .order('created_at', { ascending: false });
    setWithdrawals(data || []);
    setLoading(false);
  };

  const handleAction = async (id: string, status: 'approved' | 'rejected', notes?: string) => {
    await supabase
      .from('withdrawal_requests')
      .update({ 
        status, 
        admin_notes: notes,
        processed_at: new Date().toISOString()
      })
      .eq('id', id);
    
    toast({ title: `Retrait ${status === 'approved' ? 'approuvé' : 'rejeté'}` });
    fetchWithdrawals();
    setModalOpen(false);
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gold/10 border-b border-gold/20">
              <th className="text-left p-3 text-gold">Membre</th>
              <th className="text-left p-3 text-gold">Code Promo</th>
              <th className="text-left p-3 text-gold">Montant</th>
              <th className="text-left p-3 text-gold">Statut</th>
              <th className="text-left p-3 text-gold">Date</th>
              <th className="text-left p-3 text-gold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {withdrawals.map(w => (
              <tr key={w.id} className="border-b border-gold/10 hover:bg-gold/5">
                <td className="p-3">{w.team_members?.profiles?.full_name}</td>
                <td className="p-3 font-mono text-gold">{w.team_members?.promo_code}</td>
                <td className="p-3 font-bold">{w.amount} DA</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    w.status === 'approved' ? 'bg-green-500/20 text-green-500' :
                    w.status === 'rejected' ? 'bg-red-500/20 text-red-500' :
                    'bg-yellow-500/20 text-yellow-500'
                  }`}>
                    {w.status === 'approved' ? 'Approuvé' :
                     w.status === 'rejected' ? 'Rejeté' :
                     'En attente'}
                  </span>
                </td>
                <td className="p-3">{new Date(w.created_at).toLocaleDateString()}</td>
                <td className="p-3">
                  <Button size="sm" onClick={() => { setSelected(w); setModalOpen(true); }} className="bg-blue-600 hover:bg-blue-700">
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
          <DialogTitle className="text-gold">Gérer le retrait</DialogTitle>
          {selected && (
            <div className="space-y-4">
              <div><strong>Membre :</strong> {selected.team_members?.profiles?.full_name}</div>
              <div><strong>Code Promo :</strong> {selected.team_members?.promo_code}</div>
              <div><strong>Montant :</strong> {selected.amount} DA</div>
              <div><strong>Date :</strong> {new Date(selected.created_at).toLocaleDateString()}</div>
              
              {selected.status === 'pending' && (
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleAction(selected.id, 'approved', 'Retrait approuvé par admin')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Approuver
                  </Button>
                  <Button 
                    onClick={() => handleAction(selected.id, 'rejected', 'Retrait rejeté par admin')}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Rejeter
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

export default Withdrawals;
