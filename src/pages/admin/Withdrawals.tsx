import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const Withdrawals = () => {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  useEffect(() => {
    const fetchWithdrawals = async () => {
      const { data } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .order('created_at', { ascending: false });
      setWithdrawals(data || []);
    };
    fetchWithdrawals();
  }, []);
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-gold/10">
            <th>Membre</th>
            <th>Montant</th>
            <th>Statut</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {withdrawals.map(w => (
            <tr key={w.id} className="border-b border-gold/10">
              <td>{w.team_member_id}</td>
              <td>{w.amount} DA</td>
              <td>{w.status}</td>
              <td>{new Date(w.created_at).toLocaleDateString()}</td>
              <td>
                {/* Actions admin à compléter (valider/refuser) */}
                <button className="text-gold underline">Voir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default Withdrawals; 