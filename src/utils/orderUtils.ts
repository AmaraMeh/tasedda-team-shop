
import { supabase } from '@/integrations/supabase/client';

export const processOrderCommission = async (orderId: string) => {
  try {
    console.log('Processing commission for order:', orderId);
    
    // Appeler la fonction SQL pour traiter les commissions
    const { data, error } = await supabase.rpc('process_team_commission', {
      order_id_param: orderId
    });

    if (error) {
      console.error('Error processing commission:', error);
      throw error;
    }

    console.log('Commission processed successfully:', data);
    
    // Vérifier si des commissions ont été créées
    const { data: commissions, error: commissionError } = await supabase
      .from('commissions')
      .select('*')
      .eq('order_id', orderId);

    if (commissionError) {
      console.error('Error checking commissions:', commissionError);
    } else {
      console.log('Commissions created:', commissions);
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error calling commission function:', error);
    return { success: false, error };
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
      } else {
        console.log(`Team member rank updated to ${newRank}`);
      }
    }
  } catch (error) {
    console.error('Error updating team member rank:', error);
  }
};
