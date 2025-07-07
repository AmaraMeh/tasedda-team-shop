
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
      // D'abord, récupérer l'ID du membre de l'équipe
      const { data: teamMember } = await supabase
        .from('team_members')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!teamMember) {
        setLoading(false);
        return;
      }

      // Récupérer les commissions
      const { data: commissionsData, error } = await supabase
        .from('commissions')
        .select('*')
        .eq('team_member_id', teamMember.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCommissions(commissionsData || []);

      // Calculer les montants
      const pending = commissionsData
        ?.filter(c => c.status === 'pending')
        ?.reduce((sum, c) => sum + c.amount, 0) || 0;

      const available = commissionsData
        ?.filter(c => c.status === 'approved')
        ?.reduce((sum, c) => sum + c.amount, 0) || 0;

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

  return {
    commissions,
    pendingAmount,
    availableAmount,
    loading,
    refetch: fetchCommissions
  };
};
