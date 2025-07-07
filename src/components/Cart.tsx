
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, Minus, Plus, Trash2, Tag } from 'lucide-react';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

const Cart: React.FC<CartProps> = ({ isOpen, onClose, onCheckout }) => {
  const { items, updateQuantity, removeFromCart, getCartTotal, getCartCount, applyPromoCode, promoCode, discount } = useCart();
  const [promoInput, setPromoInput] = useState('');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const { toast } = useToast();

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    
    setIsApplyingPromo(true);
    const result = await applyPromoCode(promoInput.trim().toUpperCase());
    
    if (result.success) {
      toast({
        title: "Code promo appliqué",
        description: result.message,
      });
      setPromoInput('');
    } else {
      toast({
        title: "Code promo invalide",
        description: result.message,
        variant: "destructive",
      });
    }
    
    setIsApplyingPromo(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto glass-effect border-gold/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
              Panier ({getCartCount()})
            </CardTitle>
            <Button variant="ghost" onClick={onClose} className="h-8 w-8 p-0">×</Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {items.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 text-sm">
              Votre panier est vide
            </p>
          ) : (
            <>
              {items.map((item) => (
                <div key={item.id} className="flex gap-2 sm:gap-3 p-2 sm:p-3 border border-gold/20 rounded-lg">
                  <img
                    src={item.product.image_url || '/placeholder.svg'}
                    alt={item.product.name}
                    className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded"
                  />
                  <div className="flex-1 space-y-1 sm:space-y-2">
                    <h4 className="font-medium text-xs sm:text-sm">{item.product.name}</h4>
                    <div className="flex flex-wrap gap-1">
                      {item.size && <Badge variant="outline" className="text-xs">Taille: {item.size}</Badge>}
                      {item.color && <Badge variant="outline" className="text-xs">Couleur: {item.color}</Badge>}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="h-6 w-6 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-xs sm:text-sm w-6 sm:w-8 text-center">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="h-6 w-6 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFromCart(item.id)}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="text-xs sm:text-sm font-medium gold-text">
                      {(item.product.price * item.quantity).toLocaleString()} DA
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Code promo */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Code promo Team (ex: ABC123)"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                    className="bg-black/50 border-gold/20 text-sm"
                    maxLength={6}
                  />
                  <Button
                    onClick={handleApplyPromo}
                    disabled={isApplyingPromo || !promoInput.trim()}
                    size="sm"
                    className="btn-gold"
                  >
                    <Tag className="h-4 w-4" />
                  </Button>
                </div>
                {promoCode && (
                  <div className="text-xs sm:text-sm text-green-500">
                    Code promo appliqué: {promoCode} (-{discount.toLocaleString()} DA)
                  </div>
                )}
              </div>
              
              {/* Total */}
              <div className="border-t border-gold/20 pt-4 space-y-2">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span>Sous-total:</span>
                  <span>{(getCartTotal() + discount).toLocaleString()} DA</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-xs sm:text-sm text-green-500">
                    <span>Réduction (5%):</span>
                    <span>-{discount.toLocaleString()} DA</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm sm:text-lg gold-text">
                  <span>Total:</span>
                  <span>{getCartTotal().toLocaleString()} DA</span>
                </div>
              </div>
              
              <Button
                onClick={onCheckout}
                className="w-full btn-gold text-sm sm:text-base"
              >
                Procéder au paiement
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Cart;
