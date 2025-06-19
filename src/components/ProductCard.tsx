
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingCart, Heart, MessageCircle } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Link } from 'react-router-dom';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  showPrice?: boolean;
}

const ProductCard = ({ product, showPrice = true }: ProductCardProps) => {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');

  console.log('ProductCard rendering with product:', product);

  const handleAddToCart = () => {
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url || product.image || '/placeholder.svg',
      category: product.category || 'Sans catégorie',
      size: selectedSize || undefined,
      color: selectedColor || undefined,
      quantity: 1,
      product: {
        ...product,
        image_url: product.image_url || '/placeholder.svg',
        description: product.description || '',
        inStock: product.inStock !== false,
        is_featured: product.is_featured || false
      }
    };
    
    addToCart(cartItem);
  };

  const handleWhatsAppContact = () => {
    const message = `Bonjour, je suis intéressé par le produit "${product.name}". Pouvez-vous me donner plus d'informations ?`;
    const whatsappUrl = `https://wa.me/213?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Parse sizes and colors if they exist
  const availableSizes = product.sizes ? (Array.isArray(product.sizes) ? product.sizes : JSON.parse(product.sizes)) : [];
  const availableColors = product.colors ? (Array.isArray(product.colors) ? product.colors : JSON.parse(product.colors)) : [];

  return (
    <Card className="glass-effect border-gold/20 hover:border-gold/40 transition-all group overflow-hidden">
      <div className="relative">
        <Link to={`/product/${product.id}`}>
          <img
            src={product.image_url || product.image || '/placeholder.svg'}
            alt={product.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform cursor-pointer"
          />
        </Link>
        {product.is_featured && (
          <Badge className="absolute top-2 left-2 bg-gold text-black">
            Vedette
          </Badge>
        )}
        {!product.inStock && (
          <Badge className="absolute top-2 right-2 bg-red-500">
            Rupture
          </Badge>
        )}
        <Button
          size="sm"
          variant="ghost"
          className="absolute top-2 right-2 text-white hover:text-gold"
        >
          <Heart className="h-4 w-4" />
        </Button>
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <Link to={`/product/${product.id}`}>
              <h3 className="font-semibold text-white hover:text-gold transition-colors cursor-pointer">
                {product.name}
              </h3>
            </Link>
            <p className="text-sm text-muted-foreground">{product.category}</p>
          </div>

          {/* Size Selection */}
          {availableSizes.length > 0 && (
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Taille:</label>
              <Select value={selectedSize} onValueChange={setSelectedSize}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Choisir taille" />
                </SelectTrigger>
                <SelectContent>
                  {availableSizes.map((size: string) => (
                    <SelectItem key={size} value={size} className="text-xs">
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Color Selection */}
          {availableColors.length > 0 && (
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Couleur:</label>
              <Select value={selectedColor} onValueChange={setSelectedColor}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Choisir couleur" />
                </SelectTrigger>
                <SelectContent>
                  {availableColors.map((color: string) => (
                    <SelectItem key={color} value={color} className="text-xs">
                      {color}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {showPrice ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold gold-text">{product.price} DA</p>
                {product.original_price && product.original_price > product.price && (
                  <p className="text-sm text-muted-foreground line-through">
                    {product.original_price} DA
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-lg font-bold text-blue-400 mb-2">Contactez pour le prix</p>
            </div>
          )}

          <div className="flex gap-2">
            {showPrice && product.inStock ? (
              <Button
                onClick={handleAddToCart}
                className="flex-1 btn-gold text-sm py-2"
                disabled={!product.inStock}
              >
                <ShoppingCart className="h-4 w-4 mr-1" />
                Ajouter
              </Button>
            ) : (
              <Button
                onClick={handleWhatsAppContact}
                className="flex-1 bg-green-500 hover:bg-green-600 text-sm py-2"
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                Contact
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
