
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Search, Edit, Ban, CheckCircle, Crown, Users, TrendingUp, Star } from 'lucide-react';

interface TeamMember {
  id: string;
  user_id: string;
  promo_code: string;
  rank: number;
  is_active: boolean;
  total_sales: number;
  commission_earned: number;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
    phone: string;
  };
}

const TeamMembers = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [newRank, setNewRank] = useState<number>(1);
  const { toast } = useToast();

  // Statistiques
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    totalCommissions: 0,
    topPerformer: null as TeamMember | null
  });

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    filterMembers();
    calculateStats();
  }, [members, searchTerm, statusFilter]);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          *,
          profiles(full_name, email, phone)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data) {
        setMembers(data);
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterMembers = () => {
    let filtered = members;

    if (searchTerm) {
      filtered = filtered.filter(member =>
        member.profiles.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.profiles.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.promo_code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(member => 
        statusFilter === 'active' ? member.is_active : !member.is_active
      );
    }

    setFilteredMembers(filtered);
  };

  const calculateStats = () => {
    const totalMembers = members.length;
    const activeMembers = members.filter(m => m.is_active).length;
    const totalCommissions = members.reduce((sum, m) => sum + m.commission_earned, 0);
    const topPerformer = members.reduce((top, member) => 
      !top || member.total_sales > top.total_sales ? member : top, 
      null as TeamMember | null
    );

    setStats({
      totalMembers,
      activeMembers,
      totalCommissions,
      topPerformer
    });
  };

  const handleStatusChange = async (memberId: string, newStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .update({ is_active: newStatus })
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Statut mis à jour",
        description: `Le membre a été ${newStatus ? 'activé' : 'désactivé'}`,
      });

      fetchMembers();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleRankUpdate = async (memberId: string, rank: number) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .update({ rank })
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Rang mis à jour",
        description: `Le rang du membre a été mis à jour au niveau ${rank}`,
      });

      setEditingMember(null);
      fetchMembers();
    } catch (error: any) {
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestion des Membres de la Team</h1>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-effect border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-blue-400">{stats.totalMembers}</p>
                <p className="text-sm text-muted-foreground">Total Membres</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-400" />
              <div>
                <p className="text-2xl font-bold text-green-400">{stats.activeMembers}</p>
                <p className="text-sm text-muted-foreground">Membres Actifs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-gold/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-gold" />
              <div>
                <p className="text-2xl font-bold gold-text">{stats.totalCommissions.toLocaleString()} DA</p>
                <p className="text-sm text-muted-foreground">Total Commissions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-8 w-8 text-purple-400" />
              <div>
                <p className="text-sm font-bold text-purple-400">
                  {stats.topPerformer ? stats.topPerformer.profiles.full_name : 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground">Top Performer</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card className="glass-effect border-gold/20">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Rechercher</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Nom, email ou code promo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Label>Statut</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="active">Actifs</SelectItem>
                  <SelectItem value="inactive">Inactifs</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des membres */}
      <div className="grid gap-4">
        {filteredMembers.map((member) => {
          const rankInfo = getRankInfo(member.rank);
          return (
            <Card key={member.id} className="glass-effect border-gold/20">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="font-semibold text-lg">{member.profiles.full_name}</h3>
                      <Badge className={`${member.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {member.is_active ? 'Actif' : 'Inactif'}
                      </Badge>
                      <Badge className="bg-gold/20 text-gold">
                        {rankInfo.icon} {rankInfo.title}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Email</p>
                        <p>{member.profiles.email}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Code Promo</p>
                        <p className="font-mono text-gold">{member.promo_code}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Ventes Totales</p>
                        <p className="font-semibold">{member.total_sales}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Commissions</p>
                        <p className="font-semibold gold-text">{member.commission_earned.toLocaleString()} DA</p>
                      </div>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mt-2">
                      Membre depuis le {new Date(member.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingMember(member);
                        setNewRank(member.rank);
                      }}
                      className="border-blue-500 text-blue-400 hover:bg-blue-500/10"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Modifier Rang
                    </Button>
                    
                    <Button
                      size="sm"
                      variant={member.is_active ? "destructive" : "default"}
                      onClick={() => handleStatusChange(member.id, !member.is_active)}
                      className={member.is_active ? "" : "bg-green-500 hover:bg-green-600"}
                    >
                      {member.is_active ? <Ban className="h-4 w-4 mr-1" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                      {member.is_active ? 'Désactiver' : 'Activer'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredMembers.length === 0 && (
        <Card className="glass-effect border-gold/20">
          <CardContent className="p-8 text-center">
            <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Aucun membre trouvé.</p>
          </CardContent>
        </Card>
      )}

      {/* Modal de modification du rang */}
      {editingMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4 glass-effect border-gold/20">
            <CardHeader>
              <CardTitle>Modifier le rang de {editingMember.profiles.full_name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Nouveau rang (1-5)</Label>
                <Select 
                  value={newRank.toString()} 
                  onValueChange={(value) => setNewRank(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map(rank => {
                      const info = getRankInfo(rank);
                      return (
                        <SelectItem key={rank} value={rank.toString()}>
                          {info.icon} Rang {rank} - {info.title} ({info.commission}%)
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  onClick={() => handleRankUpdate(editingMember.id, newRank)}
                  className="btn-gold flex-1"
                >
                  Confirmer
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditingMember(null)}
                  className="border-gold/20"
                >
                  Annuler
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TeamMembers;
