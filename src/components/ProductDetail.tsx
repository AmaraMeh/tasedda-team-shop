
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ShoppingBag, Heart, Share2 } from 'lucide-react';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories(name),
          sellers(business_name, seller_type)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gold"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Produit non trouvé</h1>
          <Button onClick={() => navigate('/products')} className="btn-gold">
            Retour aux produits
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : [product.image_url];
  const discount = product.original_price 
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  const handleAddToCart = () => {
    if (!product.stock_quantity || product.stock_quantity <= 0) {
      toast({
        title: "Produit indisponible",
        description: "Ce produit n'est pas en stock",
        variant: "destructive",
      });
      return;
    }

    // Fix the product structure to match the Product type
    const cartProduct = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url || '/placeholder.svg',
      image_url: product.image_url || '/placeholder.svg',
      category: product.categories?.name || 'Sans catégorie',
      inStock: product.stock_quantity > 0,
      description: product.description || '',
      is_featured: product.is_featured || false,
      original_price: product.original_price,
      stock_quantity: product.stock_quantity,
      colors: product.colors,
      sizes: product.sizes,
      category_id: product.category_id,
      seller_id: product.seller_id,
      is_active: product.is_active,
      created_at: product.created_at,
      updated_at: product.updated_at
    };

    addToCart(cartProduct, quantity, selectedSize, selectedColor);
    toast({
      title: "Produit ajouté",
      description: `${product.name} a été ajouté à votre panier`,
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Lien copié",
        description: "Le lien du produit a été copié dans le presse-papiers",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <Header />
      
      <div className="container mx-auto px-4 py-8 lg:py-16">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="mb-6 border-gold/20 text-white hover:bg-gold/10 backdrop-blur-sm"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Images */}
          <div className="space-y-4">
            <Card className="glass-effect border-gold/20 overflow-hidden">
              <div className="aspect-square bg-black/50 rounded-lg overflow-hidden">
                <img
                  src={images[selectedImage] || '/placeholder.svg'}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            </Card>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square bg-black/50 rounded-lg overflow-hidden border-2 transition-all duration-200 hover:scale-105 ${
                      selectedImage === index ? 'border-gold shadow-lg shadow-gold/20' : 'border-gold/20'
                    }`}
                  >
                    <img
                      src={image || '/placeholder.svg'}
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
            <Card className="glass-effect border-gold/20 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="outline" className="text-gold border-gold/20 bg-gold/10">
                  {product.categories?.name || 'Sans catégorie'}
                </Badge>
                {discount > 0 && (
                  <Badge variant="destructive" className="bg-red-500/20 text-red-400 border-red-500/20">
                    -{discount}%
                  </Badge>
                )}
                {product.stock_quantity <= 0 && (
                  <Badge variant="secondary" className="bg-gray-500/20 text-gray-400">
                    Rupture de stock
                  </Badge>
                )}
                {product.is_featured && (
                  <Badge className="bg-gold text-black">
                    Vedette
                  </Badge>
                )}
              </div>
              
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">{product.name}</h1>
              
              <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl lg:text-4xl font-bold text-gold">
                  {product.price.toLocaleString()} DA
                </span>
                {product.original_price && (
                  <span className="text-xl text-muted-foreground line-through">
                    {product.original_price.toLocaleString()} DA
                  </span>
                )}
              </div>

              {product.description && (
                <p className="text-muted-foreground mb-6 leading-relaxed">{product.description}</p>
              )}
            </Card>

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <Card className="glass-effect border-gold/20 p-6">
                <h3 className="text-lg font-semibold text-white mb-3">Taille</h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <Button
                      key={size}
                      variant={selectedSize === size ? "default" : "outline"}
                      className={selectedSize === size ? "btn-gold" : "border-gold/20 text-white hover:bg-gold/10"}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </Card>
            )}

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <Card className="glass-effect border-gold/20 p-6">
                <h3 className="text-lg font-semibold text-white mb-3">Couleur</h3>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <Button
                      key={color}
                      variant={selectedColor === color ? "default" : "outline"}
                      className={selectedColor === color ? "btn-gold" : "border-gold/20 text-white hover:bg-gold/10"}
                      onClick={() => setSelectedColor(color)}
                    >
                      {color}
                    </Button>
                  ))}
                </div>
              </Card>
            )}

            {/* Quantity & Actions */}
            <Card className="glass-effect border-gold/20 p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Quantité</h3>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="border-gold/20 text-white hover:bg-gold/10"
                  >
                    -
                  </Button>
                  <span className="text-white w-12 text-center font-semibold text-lg">{quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                    className="border-gold/20 text-white hover:bg-gold/10"
                  >
                    +
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-4">
                <Button
                  onClick={handleAddToCart}
                  disabled={product.stock_quantity <= 0}
                  className="w-full btn-gold text-lg py-3"
                  size="lg"
                >
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  {product.stock_quantity <= 0 ? 'Rupture de stock' : 'Ajouter au panier'}
                </Button>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsLiked(!isLiked)}
                    className="border-gold/20 text-white hover:bg-gold/10"
                  >
                    <Heart className={`h-4 w-4 mr-2 ${isLiked ? 'fill-gold text-gold' : ''}`} />
                    {isLiked ? 'Aimé' : 'Aimer'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleShare}
                    className="border-gold/20 text-white hover:bg-gold/10"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Partager
                  </Button>
                </div>
              </div>

              {/* Stock Info */}
              {product.stock_quantity > 0 && (
                <div className="text-sm text-muted-foreground mt-4">
                  {product.stock_quantity} article(s) en stock
                </div>
              )}
            </Card>

            {/* Seller Info */}
            {product.sellers && (
              <Card className="glass-effect border-gold/20 p-6">
                <h3 className="font-semibold text-white mb-3">Vendu par</h3>
                <p className="text-gold text-lg font-medium">{product.sellers.business_name}</p>
                <Badge variant="outline" className="mt-2 border-gold/20">
                  {product.sellers.seller_type === 'wholesale' ? 'Grossiste' : 'Vendeur local'}
                </Badge>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetail;
