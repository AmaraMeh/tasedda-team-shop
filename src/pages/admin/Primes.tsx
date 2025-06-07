import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface Prime {
  id: string;
  inviter_id: string;
  invited_id: string;
  status: 'pending' | 'paid' | 'cancelled';
  amount: number;
  created_at: string;
  inviter: {
    full_name: string;
    email: string;
  };
  invited: {
    full_name: string;
    email: string;
  };
}

const Primes = () => {
  const [primes, setPrimes] = useState<Prime[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPrimes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('primes')
        .select(`
          *,
          inviter:profiles!primes_inviter_id_fkey(full_name, email),
          invited:profiles!primes_invited_id_fkey(full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPrimes(data || []);
    } catch (error) {
      console.error('Error loading primes:', error);
      toast.error('Erreur lors du chargement des primes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrimes();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Primes d'invitation</h2>
        <button
          onClick={fetchPrimes}
          className="flex items-center gap-2 px-4 py-2 bg-gold/10 text-gold rounded-lg hover:bg-gold/20 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Rafraîchir
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">Chargement...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gold/10">
                <th className="p-2">Invitant</th>
                <th className="p-2">Invité</th>
                <th className="p-2">Montant</th>
                <th className="p-2">Statut</th>
                <th className="p-2">Date</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {primes.map(prime => (
                <tr key={prime.id} className="border-b border-gold/10">
                  <td className="p-2">{prime.inviter?.full_name}</td>
                  <td className="p-2">{prime.invited?.full_name}</td>
                  <td className="p-2">{prime.amount} DA</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      prime.status === 'paid' ? 'bg-green-500/20 text-green-500' :
                      prime.status === 'cancelled' ? 'bg-red-500/20 text-red-500' :
                      'bg-yellow-500/20 text-yellow-500'
                    }`}>
                      {prime.status === 'paid' ? 'Payée' :
                       prime.status === 'cancelled' ? 'Annulée' :
                       'En attente'}
                    </span>
                  </td>
                  <td className="p-2">{new Date(prime.created_at).toLocaleDateString()}</td>
                  <td className="p-2">
                    <button 
                      className="text-gold underline"
                      onClick={() => {
                        // TODO: Implémenter la vue détaillée
                        toast.info('Fonctionnalité à venir');
                      }}
                    >
                      Voir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Primes; 