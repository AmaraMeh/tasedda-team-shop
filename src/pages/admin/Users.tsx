import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const Users = ({ users: propUsers }: { users?: any[] }) => {
  const [users, setUsers] = useState<any[]>(propUsers || []);
  useEffect(() => {
    if (!propUsers) {
      const fetchUsers = async () => {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });
        setUsers(data || []);
      };
      fetchUsers();
    }
  }, [propUsers]);
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-gold/10">
            <th>Nom</th>
            <th>Email</th>
            <th>Admin</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} className="border-b border-gold/10">
              <td>{u.full_name}</td>
              <td>{u.email}</td>
              <td>{u.is_admin ? 'Oui' : 'Non'}</td>
              <td>
                {/* Actions admin à compléter (promouvoir, supprimer, etc.) */}
                <button className="text-gold underline">Voir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default Users; 