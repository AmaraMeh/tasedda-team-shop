
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { ShoppingBag, Eye, Heart } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  original_price?: number;
  image: string;
  image_url?: string;
  category: string;
  inStock: boolean;
  stock_quantity?: number;
  isNew?: boolean;
  is_featured?: boolean;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { addToCart } = useCart();
  const { toast } = useToast();

  console.log('ProductCard rendering with product:', product);

  const discount = product.original_price 
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  const handleAddToCart = () => {
    console.log('Adding product to cart:', product);
    
    if (!product.inStock) {
      toast({
        title: "Produit indisponible",
        description: "Ce produit n'est pas en stock",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Convert to cart-compatible format
      const cartProduct = {
        ...product,
        image_url: product.image_url || product.image || '/placeholder.svg',
        description: product.description || '',
        is_featured: product.is_featured || false
      };
      addToCart(cartProduct, 1);
      toast({
        title: "Produit ajouté",
        description: `${product.name} a été ajouté à votre panier`,
      });
      console.log('Product added to cart successfully');
    } catch (error) {
      console.error('Error adding product to cart:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le produit au panier",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="group relative overflow-hidden glass-effect border-gold/20 hover:border-gold/40 hover:shadow-xl hover:shadow-gold/10 transition-all duration-300">
      <div className="relative overflow-hidden">
        {/* Image */}
        <div className="aspect-[3/4] bg-muted relative">
          <img
            src={product.image_url || product.image}
            alt={product.name}
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
          />
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted/50 to-muted animate-pulse" />
          )}
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isNew && (
            <Badge className="bg-gold text-black text-xs">
              Nouveau
            </Badge>
          )}
          {discount > 0 && (
            <Badge variant="destructive" className="text-xs">
              -{discount}%
            </Badge>
          )}
          {!product.inStock && (
            <Badge variant="secondary" className="text-xs">
              Rupture
            </Badge>
          )}
        </div>

        {/* Actions - Mobile optimized */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            size="icon"
            variant="secondary"
            className="h-7 w-7 bg-background/80 backdrop-blur-sm"
            onClick={() => setIsLiked(!isLiked)}
          >
            <Heart className={`h-3 w-3 ${isLiked ? 'fill-gold text-gold' : ''}`} />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-7 w-7 bg-background/80 backdrop-blur-sm"
            asChild
          >
            <Link to={`/product/${product.id}`}>
              <Eye className="h-3 w-3" />
            </Link>
          </Button>
        </div>

        {/* Overlay CTA - Mobile optimized */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button 
            className="w-full btn-gold text-sm py-2" 
            disabled={!product.inStock}
            onClick={handleAddToCart}
          >
            <ShoppingBag className="h-3 w-3 mr-2" />
            {product.inStock ? 'Ajouter' : 'Rupture'}
          </Button>
        </div>
      </div>

      <CardContent className="p-3">
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            {product.category}
          </p>
          <Link to={`/product/${product.id}`}>
            <h3 className="font-semibold text-white line-clamp-2 hover:text-gold transition-colors cursor-pointer text-sm">
              {product.name}
            </h3>
          </Link>
          
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-base font-bold text-gold">
              {product.price.toLocaleString()} DA
            </span>
            {product.original_price && (
              <span className="text-xs text-muted-foreground line-through">
                {product.original_price.toLocaleString()} DA
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
