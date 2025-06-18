
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, Eye, MessageCircle } from 'lucide-react';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  showPrice?: boolean;
}

const ProductCard = ({ product, showPrice = true }: ProductCardProps) => {
  console.log('ProductCard rendering with product:', product);
  
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!showPrice) {
      // For wholesale products, show contact message
      toast({
        title: "Contactez le grossiste",
        description: "Veuillez contacter le grossiste pour négocier le prix",
      });
      return;
    }

    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast({
        title: "Sélectionnez une taille",
        description: "Veuillez choisir une taille avant d'ajouter au panier",
        variant: "destructive",
      });
      return;
    }

    if (product.colors && product.colors.length > 0 && !selectedColor) {
      toast({
        title: "Sélectionnez une couleur",
        description: "Veuillez choisir une couleur avant d'ajouter au panier",
        variant: "destructive",
      });
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url || product.image || '/placeholder.svg',
      size: selectedSize,
      color: selectedColor,
      quantity: 1
    });

    toast({
      title: "Produit ajouté",
      description: `${product.name} a été ajouté au panier`,
    });
  };

  const handleContactSeller = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const message = `Bonjour, je suis intéressé par votre produit: ${product.name}. Pouvez-vous me donner plus d'informations sur le prix et la disponibilité ?`;
    const whatsappUrl = `https://wa.me/213?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const discount = product.original_price && product.original_price > product.price 
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  return (
    <Link to={`/product/${product.id}`}>
      <Card className="glass-effect border-gold/20 hover:border-gold/40 transition-all duration-300 group overflow-hidden h-full">
        <div className="relative overflow-hidden">
          <img
            src={product.image_url || product.image || '/placeholder.svg'}
            alt={product.name}
            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {!product.inStock && (
              <Badge variant="destructive" className="bg-red-500/80 backdrop-blur-sm">
                Rupture de stock
              </Badge>
            )}
            {discount > 0 && (
              <Badge className="bg-green-500/80 backdrop-blur-sm text-white">
                -{discount}%
              </Badge>
            )}
            {product.is_featured && (
              <Badge className="bg-gold/80 backdrop-blur-sm text-black">
                Populaire
              </Badge>
            )}
            {!showPrice && (
              <Badge className="bg-blue-500/80 backdrop-blur-sm text-white">
                Grossiste
              </Badge>
            )}
          </div>

          {/* Quick Actions */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex flex-col gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="h-8 w-8 p-0 rounded-full bg-white/90 hover:bg-white"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <Eye className="h-4 w-4 text-black" />
              </Button>
            </div>
          </div>
        </div>

        <CardContent className="p-4 flex-1 flex flex-col">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-gold transition-colors">
              {product.name}
            </h3>
            
            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
              {product.description}
            </p>

            <div className="flex items-center justify-between mb-3">
              <Badge variant="outline" className="text-xs">
                {product.category}
              </Badge>
              {product.inStock && (
                <span className="text-green-400 text-xs">En stock</span>
              )}
            </div>

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-3">
                <label className="text-xs text-muted-foreground mb-1 block">Taille:</label>
                <div className="flex flex-wrap gap-1">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedSize(size === selectedSize ? '' : size);
                      }}
                      className={`px-2 py-1 text-xs border rounded ${
                        selectedSize === size
                          ? 'border-gold bg-gold/20 text-gold'
                          : 'border-gray-600 hover:border-gold/50'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-3">
                <label className="text-xs text-muted-foreground mb-1 block">Couleur:</label>
                <div className="flex flex-wrap gap-1">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedColor(color === selectedColor ? '' : color);
                      }}
                      className={`px-2 py-1 text-xs border rounded ${
                        selectedColor === color
                          ? 'border-gold bg-gold/20 text-gold'
                          : 'border-gray-600 hover:border-gold/50'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Price Section */}
          {showPrice && (
            <div className="mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-gold">
                  {product.price.toLocaleString()} DA
                </span>
                {product.original_price && product.original_price > product.price && (
                  <span className="text-sm text-muted-foreground line-through">
                    {product.original_price.toLocaleString()} DA
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2">
            {showPrice ? (
              <Button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="w-full btn-gold"
                size="sm"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {product.inStock ? 'Ajouter au panier' : 'Rupture de stock'}
              </Button>
            ) : (
              <Button
                onClick={handleContactSeller}
                className="w-full btn-gold"
                size="sm"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Contacter pour le prix
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ProductCard;
