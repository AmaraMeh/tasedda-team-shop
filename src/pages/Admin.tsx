
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
import { Shield, Users, Store, Package, TrendingUp, Eye, CheckCircle, XCircle } from 'lucide-react';

const ADMIN_PASSWORD = 'AdminTasedda20252025';

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTeamMembers: 0,
    totalSellers: 0,
    totalProducts: 0,
    totalOrders: 0
  });
  const [users, setUsers] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [sellers, setSellers] = useState([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      loadDashboardData();
      toast({
        title: "Connexion admin réussie",
        description: "Bienvenue dans le panel administrateur",
      });
    } else {
      toast({
        title: "Erreur d'authentification",
        description: "Mot de passe incorrect",
        variant: "destructive",
      });
    }
  };

  const loadDashboardData = async () => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23FFD700%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
        
        <Card className="w-full max-w-md glass-effect border-gold/20" data-aos="fade-up">
          <CardHeader className="text-center">
            <Shield className="h-16 w-16 mx-auto mb-4 text-gold" />
            <CardTitle className="text-2xl font-display gold-text">
              Admin Panel
            </CardTitle>
            <p className="text-muted-foreground">
              Accès réservé aux administrateurs
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe administrateur</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-black/50 border-gold/20 focus:border-gold"
                  placeholder="Entrez le mot de passe admin"
                />
              </div>
              <Button type="submit" className="w-full btn-gold">
                <Shield className="h-4 w-4 mr-2" />
                Se connecter
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/')}
                className="w-full border-gold/20 text-gold hover:bg-gold/10"
              >
                Retour à l'accueil
              </Button>
            </form>
          </CardContent>
        </Card>
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
              <Button 
                variant="destructive" 
                onClick={() => setIsAuthenticated(false)}
              >
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card className="glass-effect border-gold/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Utilisateurs</p>
                  <p className="text-2xl font-bold gold-text">{stats.totalUsers}</p>
                </div>
                <Users className="h-8 w-8 text-gold" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-gold/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Team Members</p>
                  <p className="text-2xl font-bold gold-text">{stats.totalTeamMembers}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-gold" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-gold/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Vendeurs</p>
                  <p className="text-2xl font-bold gold-text">{stats.totalSellers}</p>
                </div>
                <Store className="h-8 w-8 text-gold" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-gold/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Produits</p>
                  <p className="text-2xl font-bold gold-text">{stats.totalProducts}</p>
                </div>
                <Package className="h-8 w-8 text-gold" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-gold/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Commandes</p>
                  <p className="text-2xl font-bold gold-text">{stats.totalOrders}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-gold" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gestion */}
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6 bg-black/50">
            <TabsTrigger value="users" className="data-[state=active]:bg-gold data-[state=active]:text-black">
              Utilisateurs
            </TabsTrigger>
            <TabsTrigger value="team" className="data-[state=active]:bg-gold data-[state=active]:text-black">
              Team Members
            </TabsTrigger>
            <TabsTrigger value="sellers" className="data-[state=active]:bg-gold data-[state=active]:text-black">
              Vendeurs
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-gold data-[state=active]:text-black">
              Paramètres
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card className="glass-effect border-gold/20">
              <CardHeader>
                <CardTitle>Gestion des Utilisateurs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user: any) => (
                    <div key={user.id} className="flex items-center justify-between p-4 bg-black/30 rounded-lg border border-gold/10">
                      <div>
                        <p className="font-medium">{user.full_name || 'Nom non défini'}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Créé le: {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">Actif</Badge>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team">
            <Card className="glass-effect border-gold/20">
              <CardHeader>
                <CardTitle>Gestion Team Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamMembers.map((member: any) => (
                    <div key={member.id} className="flex items-center justify-between p-4 bg-black/30 rounded-lg border border-gold/10">
                      <div>
                        <p className="font-medium">Code Promo: {member.promo_code}</p>
                        <p className="text-sm text-muted-foreground">Rang: {member.rank}</p>
                        <p className="text-sm text-muted-foreground">Ventes: {member.total_sales}</p>
                        <p className="text-sm text-gold">Commissions: {member.total_commissions} DA</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={member.is_active ? "default" : "secondary"}>
                          {member.is_active ? "Actif" : "Inactif"}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sellers">
            <Card className="glass-effect border-gold/20">
              <CardHeader>
                <CardTitle>Gestion des Vendeurs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sellers.map((seller: any) => (
                    <div key={seller.id} className="flex items-center justify-between p-4 bg-black/30 rounded-lg border border-gold/10">
                      <div>
                        <p className="font-medium">{seller.business_name}</p>
                        <p className="text-sm text-muted-foreground">Slug: /{seller.slug}</p>
                        <p className="text-sm text-muted-foreground">
                          Statut: {seller.subscription_status}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Expire le: {new Date(seller.subscription_expires_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={seller.is_active ? "default" : "secondary"}>
                          {seller.is_active ? "Actif" : "Inactif"}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="glass-effect border-gold/20">
              <CardHeader>
                <CardTitle>Paramètres Système</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <h3 className="font-semibold text-amber-400 mb-2">Configuration Supabase</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Pour corriger l'erreur "Email not confirmed", allez dans votre dashboard Supabase :
                    </p>
                    <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                      <li>Authentication → Settings</li>
                      <li>Désactivez "Enable email confirmations"</li>
                      <li>Sauvegardez les modifications</li>
                    </ol>
                  </div>
                  
                  <Button onClick={loadDashboardData} className="btn-gold">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Actualiser les données
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
