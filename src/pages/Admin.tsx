import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Shield, Users as UsersIcon, Store, Package, TrendingUp, Eye, CheckCircle, XCircle, Check, X, Crown, ShoppingBag, DollarSign, AlertCircle, RefreshCw } from 'lucide-react';
import type { User as AuthUser } from '@supabase/supabase-js';
import { useAuth } from '@/contexts/AuthContext';
import Dashboard from './admin/Dashboard';
import TeamRequests from './admin/TeamRequests';
import TeamMembers from './admin/TeamMembers';
import Sellers from './admin/Sellers';
import Orders from './admin/Orders';
import Products from './admin/Products';
import Withdrawals from './admin/Withdrawals';
import Primes from './admin/Primes';
import Users from './admin/Users';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

const ADMIN_PASSWORD = 'AdminTasedda20252025';

interface TeamJoinRequest {
  id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  admin_notes: string | null;
  invited_by: string | null;
  profiles: {
    full_name: string;
    email: string;
    phone: string;
  };
}

const Admin = () => {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTeamMembers: 0,
    totalSellers: 0,
    totalProducts: 0,
    totalOrders: 0
  });
  const [users, setUsers] = useState([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [sellers, setSellers] = useState([]);
  const [joinRequests, setJoinRequests] = useState<TeamJoinRequest[]>([]);
  const [tab, setTab] = useState('dashboard');
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedRequest, setSelectedRequest] = useState<TeamJoinRequest | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }
    if (user) {
      checkAdminStatus(user.id);
    }
  }, [user, loading, navigate]);

  const checkAdminStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', userId)
        .single();

      if (error) throw error;
      if (!data?.is_admin) {
        navigate('/');
      } else {
        setIsAdmin(true);
        loadDashboardData();
        loadTeamData();
        loadJoinRequests();
      }
    } catch (error: any) {
      console.error('Error checking admin status:', error);
      navigate('/');
    }
  };

  const loadDashboardData = async () => {
    setDataLoading(true);
    try {
      // Charger les statistiques
      const [profilesRes, teamRes, sellersRes, productsRes, ordersRes] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('team_members').select('*'),
        supabase.from('sellers').select('*'),
        supabase.from('products').select('*'),
        supabase.from('orders').select('*')
      ]);

      setStats({
        totalUsers: profilesRes.data?.length || 0,
        totalTeamMembers: teamRes.data?.length || 0,
        totalSellers: sellersRes.data?.length || 0,
        totalProducts: productsRes.data?.length || 0,
        totalOrders: ordersRes.data?.length || 0
      });

      setUsers(profilesRes.data || []);
      setTeamMembers(teamRes.data || []);
      setSellers(sellersRes.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const loadTeamData = async () => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTeamMembers(data || []);
    } catch (error: any) {
      console.error('Error loading team data:', error);
    }
  };

  const loadJoinRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('team_join_requests')
        .select(`
          *,
          profiles:profiles!team_join_requests_user_id_fkey (
            full_name,
            email,
            phone
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJoinRequests(data || []);
    } catch (error: any) {
      console.error('Error loading join requests:', error);
    }
  };

  const handleJoinRequest = async (requestId: string, status: 'approved' | 'rejected') => {
    try {
      const request = joinRequests.find(r => r.id === requestId);
      if (!request) return;

      if (status === 'approved') {
        // Générer un code promo unique
        const { data: promoCode, error: promoError } = await supabase
          .rpc('generate_promo_code');

        if (promoError) throw promoError;

        // Créer le membre d'équipe
        const { error: memberError } = await supabase
          .from('team_members')
          .insert({
            user_id: request.user_id,
            promo_code: promoCode,
            invited_by: request.invited_by,
            rank: 1,
            total_sales: 0,
            total_commissions: 0,
            available_commissions: 0,
            is_active: true
          });

        if (memberError) throw memberError;
      }

      // Mettre à jour le statut de la demande
      const { error } = await supabase
        .from('team_join_requests')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: status === 'approved' ? "Demande approuvée" : "Demande rejetée",
        description: status === 'approved' 
          ? "Le nouveau membre a été ajouté à l'équipe."
          : "La demande a été rejetée.",
      });

      await loadJoinRequests();
      await loadTeamData();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading || dataLoading || !isAdmin) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gold"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="bg-gradient-to-r from-black via-gray-900 to-black border-b border-gold/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Shield className="h-8 w-8 text-gold" />
              <h1 className="text-2xl font-display font-bold gold-text">
                Panel Administrateur
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/')}
                className="border-gold/20 text-gold hover:bg-gold/10"
              >
                Retour au site
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-display font-bold">
            <span className="gold-text">Admin</span> Panel
          </h1>
          <Button onClick={() => {
            loadDashboardData();
            loadTeamData();
            loadJoinRequests();
            toast({ title: "Données rafraîchies" });
          }} className="btn-gold">
            <RefreshCw className="h-4 w-4 mr-2" />
            Rafraîchir
          </Button>
        </div>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid grid-cols-9">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="team-requests">Demandes Team</TabsTrigger>
            <TabsTrigger value="team-members">Membres Team</TabsTrigger>
            <TabsTrigger value="sellers">Boutiques</TabsTrigger>
            <TabsTrigger value="orders">Commandes</TabsTrigger>
            <TabsTrigger value="products">Produits</TabsTrigger>
            <TabsTrigger value="withdrawals">Retraits</TabsTrigger>
            <TabsTrigger value="primes">Primes</TabsTrigger>
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard"><Dashboard /></TabsContent>
          <TabsContent value="team-requests">
            {joinRequests.map(r => (
              <div key={r.id} className="bg-black/40 p-4 rounded flex justify-between items-center mb-2">
                <div>
                  <div className="font-bold">{r.profiles?.full_name}</div>
                  <div className="text-xs text-muted-foreground">{r.profiles?.email}</div>
                  <div className="text-xs">Demandé le : {new Date(r.created_at).toLocaleDateString()}</div>
                  <div className="text-xs">Statut : {r.status}</div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => { setSelectedRequest(r); setModalOpen(true); }}>
                    <Eye className="w-4 h-4 mr-1" /> Voir
                  </Button>
                  {r.status === 'pending' && (
                    <>
                      <Button size="sm" className="bg-green-600 text-white" onClick={() => handleJoinRequest(r.id, 'approved')}>
                        <Check className="w-4 h-4 mr-1" /> Accepter
                      </Button>
                      <Button size="sm" className="bg-red-600 text-white" onClick={() => handleJoinRequest(r.id, 'rejected')}>
                        <X className="w-4 h-4 mr-1" /> Refuser
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
              <DialogContent>
                <DialogTitle>Détail de la demande</DialogTitle>
                {selectedRequest && (
                  <div className="space-y-2">
                    <div><b>Nom :</b> {selectedRequest.profiles?.full_name}</div>
                    <div><b>Email :</b> {selectedRequest.profiles?.email}</div>
                    <div><b>Téléphone :</b> {selectedRequest.profiles?.phone}</div>
                    <div><b>Statut :</b> {selectedRequest.status}</div>
                    <div><b>Date :</b> {new Date(selectedRequest.created_at).toLocaleDateString()}</div>
                    <div><b>Notes admin :</b> {selectedRequest.admin_notes || '-'}</div>
                  </div>
                )}
                <div className="flex gap-2 justify-end mt-4">
                  <Button variant="outline" onClick={() => setModalOpen(false)}>Fermer</Button>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>
          <TabsContent value="team-members"><TeamMembers /></TabsContent>
          <TabsContent value="sellers"><Sellers /></TabsContent>
          <TabsContent value="orders"><Orders /></TabsContent>
          <TabsContent value="products"><Products /></TabsContent>
          <TabsContent value="withdrawals"><Withdrawals /></TabsContent>
          <TabsContent value="primes"><Primes /></TabsContent>
          <TabsContent value="users">
            <Users users={users} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
