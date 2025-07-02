
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { ArrowLeft, ShoppingCart, Star, Truck, Shield, RefreshCw } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  image_url?: string;
  images?: string[];
  stock_quantity: number;
  is_active: boolean;
  sizes?: string[];
  colors?: string[];
  categories?: { name: string };
}

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories(name)
        `)
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger le produit',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast({
        title: 'Sélection requise',
        description: 'Veuillez sélectionner une taille',
        variant: 'destructive',
      });
      return;
    }

    if (product.colors && product.colors.length > 0 && !selectedColor) {
      toast({
        title: 'Sélection requise',
        description: 'Veuillez sélectionner une couleur',
        variant: 'destructive',
      });
      return;
    }

    // Create a proper Product object for the cart
    const cartProduct = {
      id: product.id,
      name: product.name,
      description: product.description || '',
      price: product.price,
      original_price: product.original_price,
      image_url: product.image_url,
      images: product.images,
      stock_quantity: product.stock_quantity,
      is_active: product.is_active,
      sizes: product.sizes,
      colors: product.colors,
      category_id: null,
      seller_id: null,
      is_featured: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    addToCart(cartProduct, quantity, selectedSize, selectedColor);

    toast({
      title: 'Produit ajouté !',
      description: `${quantity} x ${product.name} ajouté(s) au panier`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gold"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Produit non trouvé</h1>
          <Button onClick={() => navigate('/products')} className="btn-gold">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux produits
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : [product.image_url].filter(Boolean);
  const hasDiscount = product.original_price && product.original_price > product.price;
  const discountPercentage = hasDiscount ? Math.round(((product.original_price! - product.price) / product.original_price!) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <Header />
      
      <main className="container mx-auto px-4 py-20">
        <Button
          onClick={() => navigate(-1)}
          variant="outline"
          className="mb-6 border-gold/20 text-white hover:bg-gold/10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square relative overflow-hidden rounded-2xl bg-black/20">
              {images.length > 0 ? (
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <span>Aucune image disponible</span>
                </div>
              )}
              {hasDiscount && (
                <Badge className="absolute top-4 left-4 bg-red-500 text-white">
                  -{discountPercentage}%
                </Badge>
              )}
            </div>
            
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? 'border-gold' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              {product.categories && (
                <Badge variant="outline" className="mb-2 border-gold/20 text-gold">
                  {product.categories.name}
                </Badge>
              )}
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-gold">
                    {product.price.toLocaleString()} DA
                  </span>
                  {hasDiscount && (
                    <span className="text-xl text-muted-foreground line-through">
                      {product.original_price!.toLocaleString()} DA
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-gold text-gold" />
                  <span>4.8 (120 avis)</span>
                </div>
                <div className={`px-2 py-1 rounded ${product.stock_quantity > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {product.stock_quantity > 0 ? `${product.stock_quantity} en stock` : 'Rupture de stock'}
                </div>
              </div>
            </div>

            {product.description && (
              <div>
                <h3 className="font-semibold text-white mb-2">Description</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Options */}
            <div className="space-y-4">
              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Taille
                  </label>
                  <Select value={selectedSize} onValueChange={setSelectedSize}>
                    <SelectTrigger className="bg-black/50 border-gold/20">
                      <SelectValue placeholder="Sélectionner une taille" />
                    </SelectTrigger>
                    <SelectContent>
                      {product.sizes.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {product.colors && product.colors.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Couleur
                  </label>
                  <Select value={selectedColor} onValueChange={setSelectedColor}>
                    <SelectTrigger className="bg-black/50 border-gold/20">
                      <SelectValue placeholder="Sélectionner une couleur" />
                    </SelectTrigger>
                    <SelectContent>
                      {product.colors.map((color) => (
                        <SelectItem key={color} value={color}>
                          {color}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Quantité
                </label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="border-gold/20"
                  >
                    -
                  </Button>
                  <span className="text-white font-medium w-8 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                    className="border-gold/20"
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>

            {/* Shipping Info */}
            <div className="bg-gold/10 border border-gold/20 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Truck className="h-5 w-5 text-gold mr-2" />
                <span className="font-semibold text-gold">Informations de livraison</span>
              </div>
              <p className="text-sm text-white/80">
                Les frais de livraison varient selon la wilaya et le type de livraison choisi.
                Les tarifs seront calculés automatiquement lors de la commande.
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <Button
                onClick={handleAddToCart}
                disabled={product.stock_quantity === 0}
                className="w-full btn-gold text-lg py-3"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {product.stock_quantity === 0 ? 'Rupture de stock' : `Ajouter au panier - ${(product.price * quantity).toLocaleString()} DA`}
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-gold/20">
              <Card className="glass-effect border-gold/20">
                <CardContent className="p-4 text-center">
                  <Truck className="h-8 w-8 mx-auto mb-2 text-gold" />
                  <p className="text-sm text-white font-medium">Livraison rapide</p>
                  <p className="text-xs text-muted-foreground">Partout en Algérie</p>
                </CardContent>
              </Card>
              <Card className="glass-effect border-gold/20">
                <CardContent className="p-4 text-center">
                  <Shield className="h-8 w-8 mx-auto mb-2 text-gold" />
                  <p className="text-sm text-white font-medium">Garantie qualité</p>
                  <p className="text-xs text-muted-foreground">30 jours</p>
                </CardContent>
              </Card>
              <Card className="glass-effect border-gold/20">
                <CardContent className="p-4 text-center">
                  <RefreshCw className="h-8 w-8 mx-auto mb-2 text-gold" />
                  <p className="text-sm text-white font-medium">Échange facile</p>
                  <p className="text-xs text-muted-foreground">Retour gratuit</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
