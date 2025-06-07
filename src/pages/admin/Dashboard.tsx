import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const Dashboard = () => {
  const [stats, setStats] = useState<any>({});
  const [topMember, setTopMember] = useState<any>(null);
  useEffect(() => {
    const fetchStats = async () => {
      const [users, team, sellers, products, orders] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('team_members').select('*'),
        supabase.from('sellers').select('*'),
        supabase.from('products').select('*'),
        supabase.from('orders').select('*'),
      ]);
      setStats({
        users: users.data?.length || 0,
        team: team.data?.length || 0,
        sellers: sellers.data?.length || 0,
        products: products.data?.length || 0,
        orders: orders.data?.length || 0,
      });
      // Top contributeur (par ventes)
      if (team.data && team.data.length > 0) {
        const sorted = [...team.data].sort((a, b) => (b.total_sales || 0) - (a.total_sales || 0));
        setTopMember(sorted[0]);
      }
    };
    fetchStats();
  }, []);
  return (
    <div className="p-4 space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-gold/10 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold gold-text">{stats.users}</div>
          <div>Utilisateurs</div>
        </div>
        <div className="bg-gold/10 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold gold-text">{stats.team}</div>
          <div>Membres Team</div>
        </div>
        <div className="bg-gold/10 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold gold-text">{stats.sellers}</div>
          <div>Vendeurs</div>
        </div>
        <div className="bg-gold/10 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold gold-text">{stats.products}</div>
          <div>Produits</div>
        </div>
        <div className="bg-gold/10 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold gold-text">{stats.orders}</div>
          <div>Commandes</div>
        </div>
      </div>
      {topMember && (
        <div className="mt-8 text-center">
          <div className="text-lg font-bold gold-text mb-2">Meilleur contributeur du mois</div>
          <div className="bg-black/60 p-4 rounded-lg inline-block">
            <div className="text-2xl font-bold gold-text">{topMember.promo_code}</div>
            <div>Ventes : {topMember.total_sales}</div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Dashboard; 