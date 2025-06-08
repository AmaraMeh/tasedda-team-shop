
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { utils, writeFile } from 'xlsx';
import { useToast } from '@/hooks/use-toast';
import { Product, Category } from '@/types';
import { Plus, Edit, Trash2, Package } from 'lucide-react';

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState<Product | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select(`
        *,
        categories(name)
      `)
      .order('created_at', { ascending: false });
    
    if (data) {
      const productsWithCategory = data.map(item => ({
        ...item,
        category: item.categories?.name || 'Sans catégorie',
        inStock: item.stock_quantity ? item.stock_quantity > 0 : true
      }));
      setProducts(productsWithCategory);
    }
  };

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('name');
    setCategories(data || []);
  };

  const exportCSV = () => {
    const ws = utils.json_to_sheet(products);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Products');
    writeFile(wb, 'products.xlsx');
  };

  const filtered = products.filter(p =>
    (p.name || '').toLowerCase().includes(filter.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(filter.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    await supabase.from('products').delete().eq('id', id);
    setProducts(products => products.filter(p => p.id !== id));
    toast({ title: 'Produit supprimé' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const productData = {
        name: formData.name || '',
        description: formData.description || '',
        price: formData.price || 0,
        original_price: formData.original_price,
        image_url: formData.image_url || '',
        category_id: formData.category_id,
        stock_quantity: formData.stock_quantity || 0,
        is_featured: formData.is_featured || false,
        sizes: formData.sizes || [],
        colors: formData.colors || [],
        is_active: true
      };

      if (editMode && selected) {
        const { error } = await supabase
          .from('products')
          .update({
            ...productData,
            updated_at: new Date().toISOString()
          })
          .eq('id', selected.id);
        
        if (error) throw error;
        toast({ title: 'Produit modifié' });
      } else {
        const { error } = await supabase
          .from('products')
          .insert({
            ...productData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        
        if (error) throw error;
        toast({ title: 'Produit créé' });
      }
      
      fetchProducts();
      setModalOpen(false);
      setFormData({});
      setEditMode(false);
      setSelected(null);
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    }
  };

  const openAddModal = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      original_price: 0,
      image_url: '',
      category_id: '',
      stock_quantity: 0,
      is_featured: false,
      sizes: [],
      colors: []
    });
    setEditMode(false);
    setModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setFormData({
      ...product,
      category_id: categories.find(cat => cat.name === product.category)?.id || ''
    });
    setSelected(product);
    setEditMode(true);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold gold-text">Gestion des Produits</h2>
        <div className="flex gap-2">
          <Button onClick={openAddModal} className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un produit
          </Button>
          <Button onClick={exportCSV} variant="outline" className="border-gold/20">
            Exporter Excel
          </Button>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <Input
          type="text"
          placeholder="Recherche par nom ou catégorie"
          className="flex-1 bg-black/50 border-gold/20"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gold/10 border-b border-gold/20">
              <th className="text-left p-3 text-gold">Image</th>
              <th className="text-left p-3 text-gold">Nom</th>
              <th className="text-left p-3 text-gold">Catégorie</th>
              <th className="text-left p-3 text-gold">Prix</th>
              <th className="text-left p-3 text-gold">Stock</th>
              <th className="text-left p-3 text-gold">Statut</th>
              <th className="text-left p-3 text-gold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="border-b border-gold/10 hover:bg-gold/5">
                <td className="p-3">
                  <img 
                    src={p.image_url || '/placeholder.svg'} 
                    alt={p.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                </td>
                <td className="p-3 font-medium">{p.name}</td>
                <td className="p-3">
                  <Badge variant="outline">{p.category}</Badge>
                </td>
                <td className="p-3 text-gold font-bold">{p.price} DA</td>
                <td className="p-3">{p.stock_quantity || 0}</td>
                <td className="p-3">
                  <Badge variant={p.is_active ? 'default' : 'secondary'}>
                    {p.is_active ? 'Actif' : 'Inactif'}
                  </Badge>
                  {p.is_featured && (
                    <Badge className="ml-1 bg-gold text-black">Vedette</Badge>
                  )}
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => openEditModal(p)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleDelete(p.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Aucun produit trouvé</p>
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-black border-gold/20 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogTitle className="text-gold">
            {editMode ? 'Modifier le produit' : 'Ajouter un produit'}
          </DialogTitle>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom du produit *</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="bg-black/50 border-gold/20"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Catégorie</Label>
                <Select 
                  value={formData.category_id || ''} 
                  onValueChange={(value) => setFormData({...formData, category_id: value})}
                >
                  <SelectTrigger className="bg-black/50 border-gold/20">
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Prix (DA) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price || ''}
                  onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                  className="bg-black/50 border-gold/20"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="original_price">Prix original (DA)</Label>
                <Input
                  id="original_price"
                  type="number"
                  value={formData.original_price || ''}
                  onChange={(e) => setFormData({...formData, original_price: Number(e.target.value)})}
                  className="bg-black/50 border-gold/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock_quantity">Stock</Label>
                <Input
                  id="stock_quantity"
                  type="number"
                  value={formData.stock_quantity || ''}
                  onChange={(e) => setFormData({...formData, stock_quantity: Number(e.target.value)})}
                  className="bg-black/50 border-gold/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url">URL de l'image</Label>
                <Input
                  id="image_url"
                  value={formData.image_url || ''}
                  onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                  className="bg-black/50 border-gold/20"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="bg-black/50 border-gold/20"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sizes">Tailles (séparées par des virgules)</Label>
                <Input
                  id="sizes"
                  value={formData.sizes?.join(', ') || ''}
                  onChange={(e) => setFormData({...formData, sizes: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
                  className="bg-black/50 border-gold/20"
                  placeholder="S, M, L, XL"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="colors">Couleurs (séparées par des virgules)</Label>
                <Input
                  id="colors"
                  value={formData.colors?.join(', ') || ''}
                  onChange={(e) => setFormData({...formData, colors: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
                  className="bg-black/50 border-gold/20"
                  placeholder="Rouge, Bleu, Vert"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_featured"
                checked={formData.is_featured || false}
                onChange={(e) => setFormData({...formData, is_featured: e.target.checked})}
                className="accent-gold"
              />
              <Label htmlFor="is_featured">Produit vedette</Label>
            </div>

            <div className="flex gap-2 justify-end mt-6">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" className="btn-gold">
                {editMode ? 'Modifier' : 'Créer'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Products;
