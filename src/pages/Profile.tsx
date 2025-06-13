
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Phone, MapPin, Save, Crown, Store } from 'lucide-react';

interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  address: string;
  city: string;
  wilaya?: string;
}

const wilayas = [
  'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra', 'Béchar',
  'Blida', 'Bouira', 'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret', 'Tizi Ouzou', 'Alger',
  'Djelfa', 'Jijel', 'Sétif', 'Saïda', 'Skikda', 'Sidi Bel Abbès', 'Annaba', 'Guelma',
  'Constantine', 'Médéa', 'Mostaganem', 'M\'Sila', 'Mascara', 'Ouargla', 'Oran', 'El Bayadh',
  'Illizi', 'Bordj Bou Arréridj', 'Boumerdès', 'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued',
  'Khenchela', 'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent',
  'Ghardaïa', 'Relizane'
];

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isTeamMember, setIsTeamMember] = useState(false);
  const [isSeller, setIsSeller] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
      checkUserStatus();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile(data);
      } else {
        const newProfile = {
          id: user?.id,
          email: user?.email || '',
          full_name: '',
          phone: '',
          address: '',
          city: '',
          wilaya: ''
        };
        setProfile(newProfile);
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger le profil",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkUserStatus = async () => {
    if (!user) return;

    try {
      // Check if user is team member
      const { data: teamMember } = await supabase
        .from('team_members')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      // Check if user is seller
      const { data: seller } = await supabase
        .from('sellers')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      setIsTeamMember(!!teamMember);
      setIsSeller(!!seller);
    } catch (error) {
      // Ignore errors for these checks
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: profile.email,
          full_name: profile.full_name,
          phone: profile.phone,
          address: profile.address,
          city: profile.city,
          wilaya: profile.wilaya
        });

      if (error) throw error;

      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été sauvegardées avec succès",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gold"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Erreur de chargement</h1>
          <p className="text-muted-foreground">Impossible de charger votre profil</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <Header />
      
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          {/* Status Cards */}
          {(isTeamMember || isSeller) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {isTeamMember && (
                <Card className="glass-effect border-gold/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Crown className="h-8 w-8 text-gold" />
                      <div>
                        <h3 className="font-semibold text-gold">Membre Team Lion</h3>
                        <p className="text-sm text-muted-foreground">Vous êtes ambassadeur</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {isSeller && (
                <Card className="glass-effect border-gold/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Store className="h-8 w-8 text-gold" />
                      <div>
                        <h3 className="font-semibold text-gold">Vendeur</h3>
                        <p className="text-sm text-muted-foreground">Vous avez une boutique</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <Card className="glass-effect border-gold/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <User className="h-6 w-6 text-gold" />
                <CardTitle className="text-3xl text-white">Mon Profil</CardTitle>
              </div>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="full_name" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Nom complet *
                    </Label>
                    <Input
                      id="full_name"
                      value={profile.full_name}
                      onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                      className="bg-black/50 border-gold/20 focus:border-gold/40"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      className="bg-black/50 border-gold/20 opacity-60"
                      disabled
                    />
                    <p className="text-xs text-muted-foreground">L'email ne peut pas être modifié</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Téléphone *
                  </Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                    className="bg-black/50 border-gold/20 focus:border-gold/40"
                    placeholder="Ex: 0555123456"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Adresse complète *
                  </Label>
                  <Input
                    id="address"
                    value={profile.address}
                    onChange={(e) => setProfile({...profile, address: e.target.value})}
                    className="bg-black/50 border-gold/20 focus:border-gold/40"
                    placeholder="Ex: 123 Rue de la Liberté, Cité les Jardins"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="wilaya">Wilaya *</Label>
                    <Select 
                      value={profile.wilaya || ''} 
                      onValueChange={(value) => setProfile({...profile, wilaya: value})}
                    >
                      <SelectTrigger className="bg-black/50 border-gold/20 focus:border-gold/40">
                        <SelectValue placeholder="Sélectionnez votre wilaya" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {wilayas.map((wilaya) => (
                          <SelectItem key={wilaya} value={wilaya}>
                            {wilaya}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="city">Commune *</Label>
                    <Input
                      id="city"
                      value={profile.city}
                      onChange={(e) => setProfile({...profile, city: e.target.value})}
                      className="bg-black/50 border-gold/20 focus:border-gold/40"
                      placeholder="Ex: Hydra, Bab Ezzouar, etc."
                      required
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="w-full btn-gold text-lg py-3"
                  >
                    <Save className="h-5 w-5 mr-2" />
                    {saving ? 'Sauvegarde en cours...' : 'Sauvegarder mes informations'}
                  </Button>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                  <p>* Champs obligatoires</p>
                  <p className="mt-2">Vos informations sont sécurisées et ne seront jamais partagées.</p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
