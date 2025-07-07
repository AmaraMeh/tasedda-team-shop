
import { supabase } from '@/integrations/supabase/client';

export const processOrderCommission = async (orderId: string) => {
  try {
    // Appeler la fonction SQL pour traiter les commissions
    const { error } = await supabase.rpc('process_team_commission', {
      order_id_param: orderId
    });

    if (error) {
      console.error('Error processing commission:', error);
    }
  } catch (error) {
    console.error('Error calling commission function:', error);
  }
};

export const updateTeamMemberRank = async (teamMemberId: string) => {
  try {
    // Récupérer les statistiques du membre
    const { data: member, error: memberError } = await supabase
      .from('team_members')
      .select('total_sales, rank')
      .eq('id', teamMemberId)
      .single();

    if (memberError || !member) return;

    // Calculer le nouveau rang basé sur les ventes
    let newRank = 1;
    if (member.total_sales >= 100) newRank = 5; // Manager
    else if (member.total_sales >= 50) newRank = 4; // Ambassadeur Or
    else if (member.total_sales >= 25) newRank = 3; // Ambassadeur Argent
    else if (member.total_sales >= 10) newRank = 2; // Ambassadeur Bronze
    else newRank = 1; // Ambassadeur

    // Mettre à jour le rang si nécessaire
    if (newRank !== member.rank) {
      const { error: updateError } = await supabase
        .from('team_members')
        .update({ rank: newRank })
        .eq('id', teamMemberId);

      if (updateError) {
        console.error('Error updating team member rank:', updateError);
      }
    }
  } catch (error) {
    console.error('Error updating team member rank:', error);
  }
};
