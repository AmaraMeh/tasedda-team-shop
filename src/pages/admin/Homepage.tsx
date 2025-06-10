
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Edit, Trash2 } from 'lucide-react';

interface HomepageContent {
  id: string;
  type: 'contributor' | 'event';
  title: string;
  subtitle?: string;
  content?: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const Homepage = () => {
  const [contents, setContents] = useState<HomepageContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingContent, setEditingContent] = useState<HomepageContent | null>(null);
  const [formData, setFormData] = useState({
    type: 'contributor' as 'contributor' | 'event',
    title: '',
    subtitle: '',
    content: '',
    is_active: true
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchContents();
  }, []);

  const fetchContents = async () => {
    try {
      const { data, error } = await supabase
        .from('homepage_content')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data) {
        const mappedContents = data.map(item => ({
          ...item,
          type: item.type as 'contributor' | 'event'
        }));
        setContents(mappedContents);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingContent) {
        const { error } = await supabase
          .from('homepage_content')
          .update({
            type: formData.type,
            title: formData.title,
            subtitle: formData.subtitle,
            content: formData.content ? JSON.parse(formData.content) : null,
            is_active: formData.is_active,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingContent.id);

        if (error) throw error;
        toast({ title: "Contenu mis à jour avec succès" });
      } else {
        const { error } = await supabase
          .from('homepage_content')
          .insert({
            type: formData.type,
            title: formData.title,
            subtitle: formData.subtitle,
            content: formData.content ? JSON.parse(formData.content) : null,
            is_active: formData.is_active
          });

        if (error) throw error;
        toast({ title: "Contenu créé avec succès" });
      }

      resetForm();
      fetchContents();
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

  const resetForm = () => {
    setFormData({
      type: 'contributor',
      title: '',
      subtitle: '',
      content: '',
      is_active: true
    });
    setEditingContent(null);
  };

  const handleEdit = (content: HomepageContent) => {
    setEditingContent(content);
    setFormData({
      type: content.type,
      title: content.title,
      subtitle: content.subtitle || '',
      content: content.content ? JSON.stringify(content.content, null, 2) : '',
      is_active: content.is_active
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce contenu ?')) return;

    try {
      const { error } = await supabase
        .from('homepage_content')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({ title: "Contenu supprimé avec succès" });
      fetchContents();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestion de la Page d'Accueil</h1>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>
            {editingContent ? 'Modifier le contenu' : 'Ajouter du contenu'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select value={formData.type} onValueChange={(value: 'contributor' | 'event') => setFormData({...formData, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contributor">Contributeur du mois</SelectItem>
                    <SelectItem value="event">Événement</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="is_active">Actif</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                  />
                  <span>{formData.is_active ? 'Oui' : 'Non'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Titre</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subtitle">Sous-titre</Label>
              <Input
                id="subtitle"
                value={formData.subtitle}
                onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Contenu (JSON)</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                placeholder='{"description": "Description du contributeur", "image_url": "URL de l\'image"}'
                rows={4}
              />
            </div>

            <div className="flex space-x-2">
              <Button type="submit" disabled={loading}>
                {editingContent ? 'Mettre à jour' : 'Créer'}
              </Button>
              {editingContent && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Annuler
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Content List */}
      <div className="grid gap-4">
        {contents.map((content) => (
          <Card key={content.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold">{content.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${
                      content.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {content.is_active ? 'Actif' : 'Inactif'}
                    </span>
                    <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                      {content.type === 'contributor' ? 'Contributeur' : 'Événement'}
                    </span>
                  </div>
                  {content.subtitle && (
                    <p className="text-sm text-muted-foreground mb-2">{content.subtitle}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Créé le {new Date(content.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(content)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(content.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Homepage;
