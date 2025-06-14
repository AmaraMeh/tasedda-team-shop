
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { utils, writeFile } from 'xlsx';
import { useToast } from '@/hooks/use-toast';
import { Search, Download, Users, Trophy, DollarSign, Star, Eye, Edit, Trash2 } from 'lucide-react';

const TeamMembers = () => {
  const [members, setMembers] = useState<any[]>([]);
  const [filter, setFilter] = useState('');
  const [rankFilter, setRankFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({ rank: 1, available_commissions: 0 });
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    totalSales: 0,
    totalCommissions: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          *,
          profiles (full_name, email, phone)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setMembers(data || []);
      
      // Calculer les statistiques
      const total = data?.length || 0;
      const active = data?.filter(m => m.is_active).length || 0;
      const totalSales = data?.reduce((sum, m) => sum + (m.total_sales || 0), 0) || 0;
      const totalCommissions = data?.reduce((sum, m) => sum + (m.total_commissions || 0), 0) || 0;
      
      setStats({ total, active, totalSales, totalCommissions });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les membres de l'équipe",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    const exportData = filtered.map(member => ({
      'Nom': member.profiles?.full_name || 'N/A',
      'Email': member.profiles?.email || 'N/A',
      'Téléphone': member.profiles?.phone || 'N/A',
      'Code promo': member.promo_code,
      'Rang': member.rank,
      'Ventes totales': member.total_sales || 0,
      'Commissions totales': member.total_commissions || 0,
      'Commissions disponibles': member.available_commissions || 0,
      'Statut': member.is_active ? 'Actif' : 'Inactif',
      'Date d\'inscription': new Date(member.created_at).toLocaleDateString('fr-FR')
    }));
    
    const ws = utils.json_to_sheet(exportData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Membres_Equipe');
    writeFile(wb, `membres_equipe_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toast({
      title: "Export réussi",
      description: "Les membres ont été exportés avec succès",
    });
  };

  const filtered = members.filter(m => {
    const matchesSearch = 
      (m.profiles?.full_name || '').toLowerCase().includes(filter.toLowerCase()) ||
      (m.profiles?.email || '').toLowerCase().includes(filter.toLowerCase()) ||
      (m.promo_code || '').toLowerCase().includes(filter.toLowerCase());
    
    const matchesRank = rankFilter === 'all' || m.rank.toString() === rankFilter;
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? m.is_active : !m.is_active);
    
    return matchesSearch && matchesRank && matchesStatus;
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce membre ?')) return;
    
    try {
      const { error } = await supabase.from('team_members').delete().eq('id', id);
      if (error) throw error;
      
      setMembers(members => members.filter(m => m.id !== id));
      toast({ 
        title: 'Membre supprimé',
        description: 'Le membre a été supprimé avec succès'
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le membre",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async () => {
    if (!selected) return;
    
    try {
      const { error } = await supabase
        .from('team_members')
        .update({ 
          rank: editData.rank,
          available_commissions: editData.available_commissions,
          updated_at: new Date().toISOString()
        })
        .eq('id', selected.id);
      
      if (error) throw error;
      
      setMembers(members => members.map(m => 
        m.id === selected.id 
          ? { ...m, ...editData, updated_at: new Date().toISOString() } 
          : m
      ));
      
      toast({ 
        title: 'Membre modifié',
        description: 'Les informations ont été mises à jour avec succès'
      });
      setEditMode(false);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le membre",
        variant: "destructive",
      });
    }
  };

  const toggleMemberStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .update({ is_active: !currentStatus })
        .eq('id', id);
      
      if (error) throw error;
      
      setMembers(members => members.map(m => 
        m.id === id ? { ...m, is_active: !currentStatus } : m
      ));
      
      toast({ 
        title: currentStatus ? 'Membre désactivé' : 'Membre activé',
        description: 'Le statut a été mis à jour avec succès'
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut",
        variant: "destructive",
      });
    }
  };

  const getRankBadge = (rank: number) => {
    const colors = {
      1: 'bg-gray-600',
      2: 'bg-yellow-600',
      3: 'bg-orange-600',
      4: 'bg-red-600',
      5: 'bg-purple-600'
    };
    
    return (
      <Badge className={`${colors[rank as keyof typeof colors] || 'bg-gray-600'} text-white border-0`}>
        Rang {rank}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gold"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-effect border-gold/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Membres</p>
                <p className="text-2xl font-bold text-gold">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-gold" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-gold/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Membres Actifs</p>
                <p className="text-2xl font-bold text-green-500">{stats.active}</p>
              </div>
              <Star className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-gold/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ventes Totales</p>
                <p className="text-2xl font-bold text-blue-500">{stats.totalSales}</p>
              </div>
              <Trophy className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-gold/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Commissions</p>
                <p className="text-2xl font-bold text-gold">{stats.totalCommissions.toLocaleString()} DA</p>
              </div>
              <DollarSign className="h-8 w-8 text-gold" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Membres de l'Équipe</h1>
          <p className="text-muted-foreground">
            {filtered.length} membre(s) sur {members.length} au total
          </p>
        </div>
        <Button onClick={exportCSV} className="btn-gold">
          <Download className="h-4 w-4 mr-2" />
          Exporter Excel
        </Button>
      </div>

      {/* Filters */}
      <Card className="glass-effect border-gold/20">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Rechercher par nom, email ou code..."
                className="pl-10 bg-black/50 border-gold/20"
                value={filter}
                onChange={e => setFilter(e.target.value)}
              />
            </div>
            
            <Select value={rankFilter} onValueChange={setRankFilter}>
              <SelectTrigger className="bg-black/50 border-gold/20">
                <SelectValue placeholder="Filtrer par rang" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rangs</SelectItem>
                <SelectItem value="1">Rang 1</SelectItem>
                <SelectItem value="2">Rang 2</SelectItem>
                <SelectItem value="3">Rang 3</SelectItem>
                <SelectItem value="4">Rang 4</SelectItem>
                <SelectItem value="5">Rang 5</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-black/50 border-gold/20">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="inactive">Inactif</SelectItem>
              </SelectContent>
            </Select>

            <div className="text-sm text-muted-foreground flex items-center">
              Résultats: {filtered.length} membre(s)
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Members Grid */}
      <div className="grid gap-4">
        {filtered.length === 0 ? (
          <Card className="glass-effect border-gold/20">
            <CardContent className="text-center py-12">
              <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucun membre trouvé</p>
            </CardContent>
          </Card>
        ) : (
          filtered.map(member => (
            <Card key={member.id} className="glass-effect border-gold/20 hover:border-gold/40 transition-colors">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <span>{member.profiles?.full_name || 'Nom non défini'}</span>
                      {getRankBadge(member.rank)}
                      <Badge variant={member.is_active ? "default" : "secondary"}>
                        {member.is_active ? "Actif" : "Inactif"}
                      </Badge>
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                      <span>{member.profiles?.email}</span>
                      <span>•</span>
                      <span>Code: {member.promo_code}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gold">
                      {member.total_commissions?.toLocaleString() || 0} DA
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {member.total_sales || 0} vente(s)
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="text-sm space-y-1">
                    <div>Commissions disponibles: <span className="text-gold font-medium">{member.available_commissions?.toLocaleString() || 0} DA</span></div>
                    <div>Téléphone: {member.profiles?.phone || 'N/A'}</div>
                    <div>Inscrit le: {new Date(member.created_at).toLocaleDateString('fr-FR')}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => { setSelected(member); setModalOpen(true); setEditMode(false); }}
                      className="btn-gold"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Voir
                    </Button>
                    <Button
                      size="sm"
                      variant={member.is_active ? "secondary" : "default"}
                      onClick={() => toggleMemberStatus(member.id, member.is_active)}
                    >
                      {member.is_active ? "Désactiver" : "Activer"}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => handleDelete(member.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Member Detail Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="glass-effect border-gold/20 max-w-4xl">
          <DialogTitle>Détail du membre - {selected?.profiles?.full_name}</DialogTitle>
          {selected && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="glass-effect border-gold/20">
                  <CardHeader>
                    <CardTitle>Informations personnelles</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div><strong>Nom:</strong> {selected.profiles?.full_name || 'N/A'}</div>
                    <div><strong>Email:</strong> {selected.profiles?.email || 'N/A'}</div>
                    <div><strong>Téléphone:</strong> {selected.profiles?.phone || 'N/A'}</div>
                    <div><strong>Code promo:</strong> <Badge variant="outline">{selected.promo_code}</Badge></div>
                    <div><strong>Date d'inscription:</strong> {new Date(selected.created_at).toLocaleDateString('fr-FR')}</div>
                    <div><strong>Statut:</strong> 
                      <Badge variant={selected.is_active ? "default" : "secondary"} className="ml-2">
                        {selected.is_active ? "Actif" : "Inactif"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-effect border-gold/20">
                  <CardHeader>
                    <CardTitle>Statistiques de vente</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div><strong>Rang:</strong> {getRankBadge(selected.rank)}</div>
                    <div><strong>Ventes totales:</strong> <span className="text-blue-500 font-bold">{selected.total_sales || 0}</span></div>
                    <div><strong>Commissions totales:</strong> <span className="text-gold font-bold">{selected.total_commissions?.toLocaleString() || 0} DA</span></div>
                    <div><strong>Commissions disponibles:</strong> <span className="text-green-500 font-bold">{selected.available_commissions?.toLocaleString() || 0} DA</span></div>
                    {selected.invited_by && (
                      <div><strong>Invité par:</strong> {selected.invited_by}</div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {editMode && (
                <Card className="glass-effect border-gold/20">
                  <CardHeader>
                    <CardTitle>Modifier les informations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Rang</label>
                        <Select 
                          value={editData.rank.toString()} 
                          onValueChange={v => setEditData(d => ({ ...d, rank: parseInt(v) }))}
                        >
                          <SelectTrigger className="bg-black/50 border-gold/20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Rang 1</SelectItem>
                            <SelectItem value="2">Rang 2</SelectItem>
                            <SelectItem value="3">Rang 3</SelectItem>
                            <SelectItem value="4">Rang 4</SelectItem>
                            <SelectItem value="5">Rang 5</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Commissions disponibles (DA)</label>
                        <Input
                          type="number"
                          value={editData.available_commissions}
                          onChange={e => setEditData(d => ({ ...d, available_commissions: parseFloat(e.target.value) || 0 }))}
                          className="bg-black/50 border-gold/20"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setModalOpen(false)}>
                  Fermer
                </Button>
                {!editMode ? (
                  <Button 
                    onClick={() => {
                      setEditMode(true);
                      setEditData({
                        rank: selected.rank,
                        available_commissions: selected.available_commissions || 0
                      });
                    }}
                    className="btn-gold"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Modifier
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => setEditMode(false)}>
                      Annuler
                    </Button>
                    <Button onClick={handleEdit} className="btn-gold">
                      Sauvegarder
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeamMembers;
