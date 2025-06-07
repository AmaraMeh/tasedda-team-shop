import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Store, Upload, AlertCircle } from 'lucide-react';
import type { User as AuthUser } from '@supabase/supabase-js';
import { useAuth } from '@/contexts/AuthContext';

interface Shop {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  cover_url: string | null;
  is_active: boolean;
  subscription_status: 'trial' | 'active' | 'expired';
  trial_end_date: string | null;
  subscription_end_date: string | null;
}

const Shop = () => {
  const { user, loading } = useAuth();
  const [shop, setShop] = useState<Shop | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }
    if (user) {
      loadShopData(user.id);
    }
  }, [user, loading, navigate]);

  const loadShopData = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setShop(data);
    } catch (error: any) {
      console.error('Error loading shop data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données de votre boutique",
        variant: "destructive",
      });
    } finally {
      setDataLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'cover') => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'logo') {
        setLogoFile(file);
      } else {
        setCoverFile(file);
      }
    }
  };

  const uploadFile = async (file: File, type: 'logo' | 'cover'): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `shops/${user?.id}/${type}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('public')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('public')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const createShop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setCreating(true);

    try {
      // Générer le slug
      const { data: slug, error: slugError } = await supabase
        .rpc('generate_shop_slug', { name: formData.name });

      if (slugError) throw slugError;

      // Upload des fichiers si présents
      let logoUrl = null;
      let coverUrl = null;

      if (logoFile) {
        logoUrl = await uploadFile(logoFile, 'logo');
      }

      if (coverFile) {
        coverUrl = await uploadFile(coverFile, 'cover');
      }

      // Créer la boutique
      const { data, error } = await supabase
        .from('shops')
        .insert({
          user_id: user.id,
          name: formData.name,
          slug,
          description: formData.description,
          logo_url: logoUrl,
          cover_url: coverUrl,
          is_active: false,
          subscription_status: 'trial',
          trial_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 jours d'essai
        })
        .select()
        .single();

      if (error) throw error;

      setShop(data);
      toast({
        title: "Boutique créée !",
        description: "Votre boutique est en période d'essai de 30 jours.",
      });

      navigate(`/shop/${data.slug}`);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gold"></div>
      </div>
    );
  }

  if (shop) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        
        <main className="py-20">
          <div className="container mx-auto px-4">
            <Card className="glass-effect border-gold/20">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Store className="h-5 w-5 mr-2 text-gold" />
                  Ma Boutique
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">{shop.name}</h2>
                      <p className="text-muted-foreground">
                        tasedda.dz/shop/{shop.slug}
                      </p>
                    </div>
                    <Badge variant={
                      shop.subscription_status === 'trial' ? 'default' :
                      shop.subscription_status === 'active' ? 'success' :
                      'destructive'
                    }>
                      {shop.subscription_status === 'trial' ? 'Période d\'essai' :
                       shop.subscription_status === 'active' ? 'Active' :
                       'Expirée'}
                    </Badge>
                  </div>

                  {shop.subscription_status === 'trial' && (
                    <div className="p-4 bg-gold/10 rounded-lg border border-gold/20">
                      <div className="flex items-start">
                        <AlertCircle className="h-5 w-5 text-gold mr-2 mt-0.5" />
                        <div>
                          <p className="font-medium">Période d'essai</p>
                          <p className="text-sm text-muted-foreground">
                            Votre période d'essai se termine le {new Date(shop.trial_end_date!).toLocaleDateString()}.
                            Après cette date, un abonnement de 700 DA/mois sera requis.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="glass-effect border-gold/20">
                      <CardHeader>
                        <CardTitle>Statistiques</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Produits</span>
                            <span className="font-bold">0</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Ventes</span>
                            <span className="font-bold">0</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Visites</span>
                            <span className="font-bold">0</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="glass-effect border-gold/20">
                      <CardHeader>
                        <CardTitle>Actions</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Button className="w-full btn-gold">
                          Ajouter un produit
                        </Button>
                        <Button variant="outline" className="w-full border-gold/20">
                          Gérer les commandes
                        </Button>
                        <Button variant="outline" className="w-full border-gold/20">
                          Paramètres
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <main className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="glass-effect border-gold/20">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Store className="h-5 w-5 mr-2 text-gold" />
                  Créer ma Boutique
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={createShop} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom de la boutique</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ma Boutique"
                      required
                      className="bg-black/50 border-gold/20 focus:border-gold"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Décrivez votre boutique..."
                      className="bg-black/50 border-gold/20 focus:border-gold"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Logo de la boutique</Label>
                    <div className="flex items-center space-x-4">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'logo')}
                        className="bg-black/50 border-gold/20 focus:border-gold"
                      />
                      <Upload className="h-5 w-5 text-gold" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Image de couverture</Label>
                    <div className="flex items-center space-x-4">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'cover')}
                        className="bg-black/50 border-gold/20 focus:border-gold"
                      />
                      <Upload className="h-5 w-5 text-gold" />
                    </div>
                  </div>

                  <div className="p-4 bg-gold/10 rounded-lg border border-gold/20">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-gold mr-2 mt-0.5" />
                      <div>
                        <p className="font-medium">Période d'essai</p>
                        <p className="text-sm text-muted-foreground">
                          Votre boutique bénéficiera d'une période d'essai gratuite de 30 jours.
                          Après cette période, un abonnement de 700 DA/mois sera requis.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button type="submit" className="w-full btn-gold" disabled={creating}>
                    {creating ? "Création..." : "Créer ma boutique"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Shop; 