
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Users, TrendingUp, DollarSign } from 'lucide-react';

interface TeamMember {
  id: string;
  user_id: string;
  promo_code: string;
  rank: number;
  total_sales: number;
  total_commissions: number;
  available_commissions: number;
  is_active: boolean;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
    phone: string;
  };
}

const TeamMembers = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          *,
          profiles(full_name, email, phone)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTeamMembers(data || []);
    } catch (error: any) {
      console.error('Error fetching team members:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les membres de l'équipe",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateMemberStatus = async (memberId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .update({ is_active: isActive })
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: `Membre ${isActive ? 'activé' : 'désactivé'} avec succès`,
      });

      fetchTeamMembers();
    } catch (error: any) {
      console.error('Error updating member status:', error);
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateMemberRank = async (memberId: string, newRank: number) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .update({ rank: newRank })
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Rang mis à jour avec succès",
      });

      fetchTeamMembers();
    } catch (error: any) {
      console.error('Error updating member rank:', error);
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getRankInfo = (rank: number) => {
    const ranks = [
      { level: 1, title: "Ambassadeur", commission: 6, icon: "🥉" },
      { level: 2, title: "Ambassadeur Bronze", commission: 8, icon: "🥈" },
      { level: 3, title: "Ambassadeur Argent", commission: 10, icon: "🥇" },
      { level: 4, title: "Ambassadeur Or", commission: 12, icon: "👑" },
      { level: 5, title: "Manager", commission: 12, icon: "💎" },
    ];
    return ranks.find(r => r.level === rank) || ranks[0];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gold"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="h-6 w-6 text-gold" />
          <h2 className="text-2xl font-bold text-white">Membres de l'Équipe</h2>
        </div>
        <Badge variant="secondary">
          {teamMembers.length} membres
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers.map((member) => {
          const rankInfo = getRankInfo(member.rank);
          
          return (
            <Card key={member.id} className="glass-effect border-gold/20">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{rankInfo.icon}</span>
                    <div>
                      <p className="text-lg font-semibold text-white">
                        {member.profiles?.full_name || 'Utilisateur inconnu'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {rankInfo.title}
                      </p>
                    </div>
                  </div>
                  <Badge className={member.is_active ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
                    {member.is_active ? 'Actif' : 'Inactif'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Email:</span>
                    <span className="text-sm text-white">{member.profiles?.email || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Téléphone:</span>
                    <span className="text-sm text-white">{member.profiles?.phone || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Code Promo:</span>
                    <Badge variant="outline" className="font-mono text-gold">
                      {member.promo_code}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-black/30 rounded-lg">
                    <TrendingUp className="h-4 w-4 mx-auto text-blue-400 mb-1" />
                    <p className="text-lg font-bold text-blue-400">{member.total_sales}</p>
                    <p className="text-xs text-muted-foreground">Ventes</p>
                  </div>
                  <div className="text-center p-3 bg-black/30 rounded-lg">
                    <DollarSign className="h-4 w-4 mx-auto text-green-400 mb-1" />
                    <p className="text-lg font-bold text-green-400">
                      {member.total_commissions.toLocaleString()} DA
                    </p>
                    <p className="text-xs text-muted-foreground">Commissions</p>
                  </div>
                </div>

                <div className="text-center p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-sm text-muted-foreground">Disponible</p>
                  <p className="text-xl font-bold text-green-400">
                    {member.available_commissions.toLocaleString()} DA
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Rang:</span>
                    <select
                      value={member.rank}
                      onChange={(e) => updateMemberRank(member.id, parseInt(e.target.value))}
                      className="bg-gray-800 text-white border border-gray-600 rounded px-2 py-1 text-sm"
                    >
                      {[1, 2, 3, 4, 5].map(rank => {
                        const info = getRankInfo(rank);
                        return (
                          <option key={rank} value={rank}>
                            {info.title} ({info.commission}%)
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <Button
                    onClick={() => updateMemberStatus(member.id, !member.is_active)}
                    className={member.is_active ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"}
                    size="sm"
                  >
                    {member.is_active ? 'Désactiver' : 'Activer'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {teamMembers.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Aucun membre d'équipe trouvé</p>
        </div>
      )}
    </div>
  );
};

export default TeamMembers;
