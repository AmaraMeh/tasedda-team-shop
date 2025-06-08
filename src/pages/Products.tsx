
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Search, Filter, ShoppingCart, Star, Package, Heart } from 'lucide-react';
import { Product, Category } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<string>('all');
  const { toast } = useToast();
  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    if (user) {
      loadFavorites();
    }
  }, [user]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const productsWithDefaults = data?.map(product => {
        // Récupérer le nom de la catégorie depuis categories table
        const categoryName = categories.find(cat => cat.id === product.category_id)?.name || 'Général';
        
        return {
          ...product,
          category: categoryName,
          inStock: product.stock_quantity ? product.stock_quantity > 0 : true,
          is_featured: product.is_featured || false
        };
      }) || [];
      
      setProducts(productsWithDefaults);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les produits",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
    }
  };

  const loadFavorites = () => {
    const saved = localStorage.getItem(`favorites_${user?.id}`);
    if (saved) {
      setFavorites(JSON.parse(saved));
    }
  };

  const toggleFavorite = (productId: string) => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Connectez-vous pour ajouter des favoris",
        variant: "destructive",
      });
      return;
    }

    const newFavorites = favorites.includes(productId)
      ? favorites.filter(id => id !== productId)
      : [...favorites, productId];
    
    setFavorites(newFavorites);
    localStorage.setItem(`favorites_${user.id}`, JSON.stringify(newFavorites));
    
    toast({
      title: favorites.includes(productId) ? "Retiré des favoris" : "Ajouté aux favoris",
      description: "Produit mis à jour dans vos favoris",
    });
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || 
                           product.category === selectedCategory;
    
    const matchesPrice = priceRange === 'all' ||
                        (priceRange === 'low' && product.price < 5000) ||
                        (priceRange === 'medium' && product.price >= 5000 && product.price < 15000) ||
                        (priceRange === 'high' && product.price >= 15000);

    return matchesSearch && matchesCategory && matchesPrice;
  });

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    toast({
      title: "Ajouté au panier",
      description: `${product.name} a été ajouté à votre panier`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gold"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <main className="py-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12" data-aos="fade-up">
            <h1 className="text-4xl font-display font-bold mb-4">
              Nos <span className="gold-text">Produits</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Découvrez notre collection de vêtements premium sélectionnés avec soin
            </p>
          </div>

          {/* Filtres */}
          <div className="mb-8" data-aos="fade-up">
            <Card className="glass-effect border-gold/20">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher un produit..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-black/50 border-gold/20 focus:border-gold"
                    />
                  </div>

                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="bg-black/50 border-gold/20 focus:border-gold">
                      <SelectValue placeholder="Catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les catégories</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={priceRange} onValueChange={setPriceRange}>
                    <SelectTrigger className="bg-black/50 border-gold/20 focus:border-gold">
                      <SelectValue placeholder="Prix" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les prix</SelectItem>
                      <SelectItem value="low">Moins de 5000 DA</SelectItem>
                      <SelectItem value="medium">5000 - 15000 DA</SelectItem>
                      <SelectItem value="high">Plus de 15000 DA</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button variant="outline" className="border-gold/20 text-gold hover:bg-gold/10">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtrer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Produits */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => (
              <Card 
                key={product.id} 
                className="glass-effect border-gold/20 card-hover overflow-hidden"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div className="relative">
                  <img
                    src={product.image_url || '/placeholder.svg'}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  {user && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2 p-2 h-auto bg-black/20 hover:bg-black/40"
                      onClick={() => toggleFavorite(product.id)}
                    >
                      <Heart className={`h-4 w-4 ${favorites.includes(product.id) ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                    </Button>
                  )}
                  {product.is_featured && (
                    <Badge className="absolute top-2 left-2 bg-gold text-black">
                      <Star className="h-3 w-3 mr-1" />
                      Vedette
                    </Badge>
                  )}
                  {!product.inStock && (
                    <Badge variant="destructive" className="absolute bottom-2 right-2">
                      Rupture
                    </Badge>
                  )}
                  {product.original_price && product.original_price > product.price && (
                    <Badge variant="secondary" className="absolute bottom-2 left-2">
                      -{Math.round(((product.original_price - product.price) / product.original_price) * 100)}%
                    </Badge>
                  )}
                </div>

                <CardContent className="p-4">
                  <div className="space-y-2">
                    <Badge variant="outline" className="text-xs">
                      {product.category}
                    </Badge>
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {product.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="text-xl font-bold gold-text">
                          {product.price.toLocaleString()} DA
                        </div>
                        {product.original_price && product.original_price > product.price && (
                          <div className="text-sm text-muted-foreground line-through">
                            {product.original_price.toLocaleString()} DA
                          </div>
                        )}
                      </div>
                      
                      <Button
                        size="sm"
                        className="btn-gold"
                        onClick={() => handleAddToCart(product)}
                        disabled={!product.inStock}
                      >
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        {product.inStock ? 'Ajouter' : 'Épuisé'}
                      </Button>
                    </div>

                    {/* Tailles et couleurs */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {product.sizes?.slice(0, 3).map(size => (
                        <Badge key={size} variant="outline" className="text-xs">
                          {size}
                        </Badge>
                      ))}
                      {product.sizes && product.sizes.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{product.sizes.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Aucun produit trouvé</h3>
              <p className="text-muted-foreground">
                Essayez de modifier vos critères de recherche
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Products;
