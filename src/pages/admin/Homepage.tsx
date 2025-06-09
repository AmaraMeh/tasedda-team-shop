
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash, Globe } from 'lucide-react';

interface HomepageContent {
  id: string;
  type: 'contributor' | 'event';
  title: string;
  subtitle: string;
  content: any;
  is_active: boolean;
  created_at: string;
}

const Homepage = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [contents, setContents] = useState<HomepageContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingContent, setEditingContent] = useState<HomepageContent | null>(null);
  const [formData, setFormData] = useState({
    type: 'contributor' as 'contributor' | 'event',
    title: '',
    subtitle: '',
    content: {},
    is_active: true
  });

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
      setContents(data || []);
    } catch (error) {
      console.error('Error fetching contents:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger le contenu",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let contentData = {};
      
      if (formData.type === 'contributor') {
        contentData = {
          sales: (document.getElementById('sales') as HTMLInputElement)?.value || 0,
          description: (document.getElementById('description') as HTMLInputElement)?.value || 'ventes confirmées'
        };
      } else {
        contentData = {
          date: (document.getElementById('event_date') as HTMLInputElement)?.value || '',
          location: (document.getElementById('event_location') as HTMLInputElement)?.value || ''
        };
      }

      const data = {
        type: formData.type,
        title: formData.title,
        subtitle: formData.subtitle,
        content: contentData,
        is_active: formData.is_active
      };

      if (editingContent) {
        const { error } = await supabase
          .from('homepage_content')
          .update(data)
          .eq('id', editingContent.id);

        if (error) throw error;
        toast({
          title: "Succès",
          description: "Contenu mis à jour avec succès"
        });
      } else {
        const { error } = await supabase
          .from('homepage_content')
          .insert([data]);

        if (error) throw error;
        toast({
          title: "Succès",
          description: "Contenu créé avec succès"
        });
      }

      setFormData({
        type: 'contributor',
        title: '',
        subtitle: '',
        content: {},
        is_active: true
      });
      setEditingContent(null);
      fetchContents();
    } catch (error) {
      console.error('Error saving content:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le contenu",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (content: HomepageContent) => {
    setEditingContent(content);
    setFormData({
      type: content.type,
      title: content.title,
      subtitle: content.subtitle,
      content: content.content,
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
      
      toast({
        title: "Succès",
        description: "Contenu supprimé avec succès"
      });
      fetchContents();
    } catch (error) {
      console.error('Error deleting content:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le contenu",
        variant: "destructive"
      });
    }
  };

  const toggleActive = async (id: string, is_active: boolean) => {
    try {
      // Désactiver tous les autres contenus si on active celui-ci
      if (is_active) {
        await supabase
          .from('homepage_content')
          .update({ is_active: false })
          .neq('id', id);
      }

      const { error } = await supabase
        .from('homepage_content')
        .update({ is_active })
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Succès",
        description: `Contenu ${is_active ? 'activé' : 'désactivé'}`
      });
      fetchContents();
    } catch (error) {
      console.error('Error toggling content:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold gold-text">{t('admin.manageHomepage')}</h2>
      </div>

      {/* Form */}
      <Card className="bg-card/50 border-gold/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            {editingContent ? 'Modifier le contenu' : 'Ajouter du contenu'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Type de contenu</label>
                <Select value={formData.type} onValueChange={(value: 'contributor' | 'event') => setFormData({...formData, type: value})}>
                  <SelectTrigger className="bg-card/30 border-gold/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contributor">{t('admin.contributor')}</SelectItem>
                    <SelectItem value="event">{t('admin.event')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Titre</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder={formData.type === 'contributor' ? t('admin.contributorTitle') : t('admin.eventTitle')}
                  className="bg-card/30 border-gold/20"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Sous-titre</label>
              <Input
                value={formData.subtitle}
                onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                placeholder={formData.type === 'contributor' ? 'Nom du contributeur' : 'Nom de l\'événement'}
                className="bg-card/30 border-gold/20"
                required
              />
            </div>

            {formData.type === 'contributor' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Nombre de ventes</label>
                  <Input
                    id="sales"
                    type="number"
                    defaultValue={editingContent?.content?.sales || 0}
                    placeholder="47"
                    className="bg-card/30 border-gold/20"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Description</label>
                  <Input
                    id="description"
                    defaultValue={editingContent?.content?.description || 'ventes confirmées'}
                    placeholder="ventes confirmées"
                    className="bg-card/30 border-gold/20"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Date de l'événement</label>
                  <Input
                    id="event_date"
                    defaultValue={editingContent?.content?.date || ''}
                    placeholder="15 Février 2024"
                    className="bg-card/30 border-gold/20"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Lieu</label>
                  <Input
                    id="event_location"
                    defaultValue={editingContent?.content?.location || ''}
                    placeholder="Centre Commercial Bab Ezzouar"
                    className="bg-card/30 border-gold/20"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="rounded border-gold/20"
                />
                <span className="text-sm">Activer ce contenu</span>
              </label>
              
              <div className="flex gap-2">
                {editingContent && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingContent(null);
                      setFormData({
                        type: 'contributor',
                        title: '',
                        subtitle: '',
                        content: {},
                        is_active: true
                      });
                    }}
                  >
                    Annuler
                  </Button>
                )}
                <Button type="submit" className="btn-gold">
                  {editingContent ? 'Mettre à jour' : 'Créer'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Content List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {contents.map((content) => (
          <Card key={content.id} className={`bg-card/50 border-gold/20 ${content.is_active ? 'ring-2 ring-gold/30' : ''}`}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-lg">
                <span>{content.title}</span>
                <div className="flex items-center gap-2">
                  {content.is_active && <Globe className="w-4 h-4 text-gold" />}
                  <span className={`text-xs px-2 py-1 rounded ${content.is_active ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'}`}>
                    {content.is_active ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              </CardTitle>
              <CardDescription>{content.subtitle}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {content.type === 'contributor' ? (
                  <p className="text-sm text-muted-foreground">
                    {content.content?.sales || 0} {content.content?.description || 'ventes'}
                  </p>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    <p>📅 {content.content?.date || 'Date à définir'}</p>
                    <p>📍 {content.content?.location || 'Lieu à définir'}</p>
                  </div>
                )}
                
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(content)}
                    className="border-gold/40 text-gold hover:bg-gold/10"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleActive(content.id, !content.is_active)}
                    className={content.is_active ? 'border-red-500/40 text-red-500 hover:bg-red-500/10' : 'border-green-500/40 text-green-500 hover:bg-green-500/10'}
                  >
                    {content.is_active ? 'Désactiver' : 'Activer'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(content.id)}
                    className="border-red-500/40 text-red-500 hover:bg-red-500/10"
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {contents.length === 0 && (
        <Card className="bg-card/50 border-gold/20">
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">Aucun contenu créé pour le moment</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Homepage;
