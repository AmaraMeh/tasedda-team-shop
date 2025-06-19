
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/contexts/CartContext';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingCart, ArrowLeft, MessageCircle } from 'lucide-react';
import { Product } from '@/types';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');

  useEffect(() => {
    if (id) {
      fetchProduct(id);
    }
  }, [id]);

  const fetchProduct = async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url || '/placeholder.svg',
      category: product.category || 'Sans catégorie',
      size: selectedSize || undefined,
      color: selectedColor || undefined,
      quantity: 1,
      product: {
        ...product,
        image_url: product.image_url || '/placeholder.svg',
        description: product.description || '',
        inStock: product.stock_quantity ? product.stock_quantity > 0 : true,
        is_featured: product.is_featured || false
      }
    };
    
    addToCart(cartItem);
  };

  const handleWhatsAppContact = () => {
    if (!product) return;
    const message = `Bonjour, je suis intéressé par le produit "${product.name}". Pouvez-vous me donner plus d'informations ?`;
    const whatsappUrl = `https://wa.me/213?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gold"></div>
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

  const availableSizes = product.sizes ? (Array.isArray(product.sizes) ? product.sizes : JSON.parse(product.sizes)) : [];
  const availableColors = product.colors ? (Array.isArray(product.colors) ? product.colors : JSON.parse(product.colors)) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <Header />
      
      <main className="container mx-auto px-4 py-20">
        <Button onClick={() => navigate(-1)} className="mb-6 btn-gold">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image */}
          <div>
            <img
              src={product.image_url || '/placeholder.svg'}
              alt={product.name}
              className="w-full h-96 object-cover rounded-lg"
            />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{product.name}</h1>
              {product.is_featured && (
                <Badge className="bg-gold text-black mb-4">Produit Vedette</Badge>
              )}
              <p className="text-muted-foreground">{product.description}</p>
            </div>

            <div className="text-3xl font-bold gold-text">
              {product.price} DA
              {product.original_price && product.original_price > product.price && (
                <span className="text-lg text-muted-foreground line-through ml-2">
                  {product.original_price} DA
                </span>
              )}
            </div>

            {/* Size Selection */}
            {availableSizes.length > 0 && (
              <div>
                <label className="block text-white mb-2">Taille:</label>
                <Select value={selectedSize} onValueChange={setSelectedSize}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une taille" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSizes.map((size: string) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Color Selection */}
            {availableColors.length > 0 && (
              <div>
                <label className="block text-white mb-2">Couleur:</label>
                <Select value={selectedColor} onValueChange={setSelectedColor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une couleur" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableColors.map((color: string) => (
                      <SelectItem key={color} value={color}>
                        {color}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                onClick={handleAddToCart}
                className="flex-1 btn-gold"
                disabled={!product.stock_quantity || product.stock_quantity <= 0}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Ajouter au panier
              </Button>
              <Button
                onClick={handleWhatsAppContact}
                className="bg-green-500 hover:bg-green-600"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                WhatsApp
              </Button>
            </div>

            {/* Stock Info */}
            <div className="text-sm text-muted-foreground">
              {product.stock_quantity && product.stock_quantity > 0 ? (
                <span className="text-green-500">En stock ({product.stock_quantity} disponibles)</span>
              ) : (
                <span className="text-red-500">Rupture de stock</span>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
