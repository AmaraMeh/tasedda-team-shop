
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Upload, Package, ArrowLeft, Plus, X } from 'lucide-react';

const AddProduct = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    original_price: '',
    category_id: '',
    stock_quantity: '',
    image_url: '',
    is_featured: false
  });
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [newSize, setNewSize] = useState('');
  const [newColor, setNewColor] = useState('');

  useState(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      if (data) setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const addSize = () => {
    if (newSize.trim() && !sizes.includes(newSize.trim())) {
      setSizes([...sizes, newSize.trim()]);
      setNewSize('');
    }
  };

  const removeSize = (size: string) => {
    setSizes(sizes.filter(s => s !== size));
  };

  const addColor = () => {
    if (newColor.trim() && !colors.includes(newColor.trim())) {
      setColors([...colors, newColor.trim()]);
      setNewColor('');
    }
  };

  const removeColor = (color: string) => {
    setColors(colors.filter(c => c !== color));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour ajouter un produit",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Vérifier si l'utilisateur est un vendeur
      const { data: seller, error: sellerError } = await supabase
        .from('sellers')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (sellerError || !seller) {
        toast({
          title: "Erreur",
          description: "Vous devez être un vendeur actif pour ajouter des produits",
          variant: "destructive",
        });
        return;
      }

      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        category_id: formData.category_id || null,
        stock_quantity: parseInt(formData.stock_quantity),
        image_url: formData.image_url,
        seller_id: seller.id,
        is_featured: formData.is_featured,
        sizes: sizes.length > 0 ? sizes : null,
        colors: colors.length > 0 ? colors : null,
        is_active: true
      };

      const { error } = await supabase
        .from('products')
        .insert(productData);

      if (error) throw error;

      toast({
        title: "Produit ajouté",
        description: "Votre produit a été ajouté avec succès",
      });

      navigate('/seller-space');
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

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="outline"
            onClick={() => navigate('/seller-space')}
            className="mb-6 border-gold/20 text-white hover:bg-gold/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à l'espace vendeur
          </Button>

          <Card className="glass-effect border-gold/20">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-6 w-6 mr-2 text-gold" />
                Ajouter un produit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nom du produit *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="bg-black/50 border-gold/20"
                    />
                  </div>

                  <div>
                    <Label htmlFor="category_id">Catégorie</Label>
                    <Select value={formData.category_id} onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}>
                      <SelectTrigger className="bg-black/50 border-gold/20">
                        <SelectValue placeholder="Choisir une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="bg-black/50 border-gold/20"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="price">Prix (DA) *</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      className="bg-black/50 border-gold/20"
                    />
                  </div>

                  <div>
                    <Label htmlFor="original_price">Prix original (DA)</Label>
                    <Input
                      id="original_price"
                      name="original_price"
                      type="number"
                      value={formData.original_price}
                      onChange={handleInputChange}
                      className="bg-black/50 border-gold/20"
                    />
                  </div>

                  <div>
                    <Label htmlFor="stock_quantity">Stock *</Label>
                    <Input
                      id="stock_quantity"
                      name="stock_quantity"
                      type="number"
                      value={formData.stock_quantity}
                      onChange={handleInputChange}
                      required
                      className="bg-black/50 border-gold/20"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="image_url">URL de l'image</Label>
                  <Input
                    id="image_url"
                    name="image_url"
                    type="url"
                    value={formData.image_url}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
                    className="bg-black/50 border-gold/20"
                  />
                </div>

                {/* Sizes */}
                <div>
                  <Label>Tailles disponibles</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newSize}
                      onChange={(e) => setNewSize(e.target.value)}
                      placeholder="Ex: S, M, L, XL"
                      className="bg-black/50 border-gold/20"
                    />
                    <Button type="button" onClick={addSize} variant="outline" className="border-gold/20">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size) => (
                      <span key={size} className="bg-gold/20 text-gold px-2 py-1 rounded-md text-sm flex items-center">
                        {size}
                        <button type="button" onClick={() => removeSize(size)} className="ml-2 text-red-500">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Colors */}
                <div>
                  <Label>Couleurs disponibles</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newColor}
                      onChange={(e) => setNewColor(e.target.value)}
                      placeholder="Ex: Rouge, Bleu, Noir"
                      className="bg-black/50 border-gold/20"
                    />
                    <Button type="button" onClick={addColor} variant="outline" className="border-gold/20">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((color) => (
                      <span key={color} className="bg-gold/20 text-gold px-2 py-1 rounded-md text-sm flex items-center">
                        {color}
                        <button type="button" onClick={() => removeColor(color)} className="ml-2 text-red-500">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_featured"
                    name="is_featured"
                    checked={formData.is_featured}
                    onChange={handleInputChange}
                    className="rounded border-gold/20"
                  />
                  <Label htmlFor="is_featured">Produit vedette</Label>
                </div>

                <Button type="submit" disabled={loading} className="w-full btn-gold">
                  {loading ? "Ajout en cours..." : "Ajouter le produit"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AddProduct;
