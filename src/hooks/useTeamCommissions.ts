
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Commission } from '@/types';

export const useTeamCommissions = () => {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [availableAmount, setAvailableAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchCommissions = async () => {
    if (!user) return;

    try {
      console.log('Fetching commissions for user:', user.id);
      
      // D'abord, récupérer l'ID du membre de l'équipe
      const { data: teamMember, error: teamMemberError } = await supabase
        .from('team_members')
        .select('id, promo_code')
        .eq('user_id', user.id)
        .maybeSingle();

      if (teamMemberError) {
        console.error('Error fetching team member:', teamMemberError);
        setLoading(false);
        return;
      }

      if (!teamMember) {
        console.log('No team member found for user');
        setLoading(false);
        return;
      }

      console.log('Team member found:', teamMember);

      // Récupérer les commissions
      const { data: commissionsData, error } = await supabase
        .from('commissions')
        .select(`
          *,
          orders(order_number, total_amount, order_status)
        `)
        .eq('team_member_id', teamMember.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching commissions:', error);
        throw error;
      }

      console.log('Raw commissions data:', commissionsData);

      // Convertir les données en format Commission
      const formattedCommissions: Commission[] = (commissionsData || []).map(c => ({
        id: c.id,
        team_member_id: c.team_member_id,
        order_id: c.order_id,
        amount: c.amount,
        percentage: c.percentage,
        status: c.status as 'pending' | 'approved' | 'paid',
        type: c.type as 'sale' | 'affiliation_bonus',
        metadata: c.metadata,
        created_at: c.created_at
      }));

      console.log('Formatted commissions:', formattedCommissions);
      setCommissions(formattedCommissions);

      // Calculer les montants
      const pending = formattedCommissions
        .filter(c => c.status === 'pending')
        .reduce((sum, c) => sum + c.amount, 0);

      const available = formattedCommissions
        .filter(c => c.status === 'approved')
        .reduce((sum, c) => sum + c.amount, 0);

      console.log('Calculated amounts - Pending:', pending, 'Available:', available);
      
      setPendingAmount(pending);
      setAvailableAmount(available);

    } catch (error) {
      console.error('Error fetching commissions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommissions();
  }, [user]);

  // Écouter les changements dans les commissions
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('commission-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'commissions' 
        }, 
        () => {
          console.log('Commission change detected, refetching...');
          fetchCommissions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    commissions,
    pendingAmount,
    availableAmount,
    loading,
    refetch: fetchCommissions
  };
};
