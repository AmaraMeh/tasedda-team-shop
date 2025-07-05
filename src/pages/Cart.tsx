import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import CheckoutForm from '@/components/ui/checkout-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, Minus, Plus, Trash2, Tag, ArrowLeft } from 'lucide-react';

const Cart = () => {
  const navigate = useNavigate();
  const { items, updateQuantity, removeFromCart, getCartTotal, getCartCount, applyPromoCode, promoCode, discount } = useCart();
  const [promoInput, setPromoInput] = useState('');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
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

  const handleCheckoutSuccess = () => {
    setShowCheckout(false);
    navigate('/');
  };

  if (showCheckout) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        
        <main className="container mx-auto px-4 py-20">
          <div className="max-w-2xl mx-auto">
            <Button
              variant="outline"
              onClick={() => setShowCheckout(false)}
              className="mb-6 border-gold/20 text-white hover:bg-gold/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au panier
            </Button>
            
            <CheckoutForm onSuccess={handleCheckoutSuccess} />
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <main className="container mx-auto px-4 py-20">
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="mb-4 border-gold/20 text-white hover:bg-gold/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Mon <span className="gold-text">Panier</span> ({getCartCount()})
          </h1>
        </div>

        {items.length === 0 ? (
          <Card className="glass-effect border-gold/20 max-w-md mx-auto">
            <CardContent className="text-center py-12">
              <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-4 text-white">Votre panier est vide</h2>
              <p className="text-muted-foreground mb-6">
                Découvrez nos produits et ajoutez-les à votre panier
              </p>
              <Button asChild className="btn-gold">
                <a href="/products">Découvrir nos produits</a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Produits du panier */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <Card key={item.id} className="glass-effect border-gold/20">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <img
                        src={item.product.image_url || '/placeholder.svg'}
                        alt={item.product.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1 space-y-2">
                        <h3 className="font-semibold text-white">{item.product.name}</h3>
                        {item.size && <Badge variant="outline" className="text-xs">Taille: {item.size}</Badge>}
                        {item.color && <Badge variant="outline" className="text-xs">Couleur: {item.color}</Badge>}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="h-8 w-8 p-0 border-gold/20"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="text-white w-8 text-center">{item.quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="h-8 w-8 p-0 border-gold/20"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="text-lg font-semibold gold-text">
                          {(item.product.price * item.quantity).toLocaleString()} DA
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Résumé de la commande */}
            <div className="space-y-6">
              <Card className="glass-effect border-gold/20">
                <CardHeader>
                  <CardTitle className="text-white">Résumé de la commande</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Code promo */}
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Code promo Team (ex: LION123)"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                        className="bg-black/50 border-gold/20 text-white"
                        maxLength={7}
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
                      <div className="text-sm text-green-500">
                        Code promo appliqué: {promoCode} (-{discount.toLocaleString()} DA)
                      </div>
                    )}
                  </div>

                  {/* Totaux */}
                  <div className="border-t border-gold/20 pt-4 space-y-2">
                    <div className="flex justify-between text-sm text-white">
                      <span>Sous-total:</span>
                      <span>{(getCartTotal() + discount).toLocaleString()} DA</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-sm text-green-500">
                        <span>Réduction (5%):</span>
                        <span>-{discount.toLocaleString()} DA</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm text-white">
                      <span>Livraison:</span>
                      <span>Gratuite</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg text-white border-t border-gold/20 pt-2">
                      <span>Total:</span>
                      <span className="gold-text">{getCartTotal().toLocaleString()} DA</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => setShowCheckout(true)}
                    className="w-full btn-gold"
                  >
                    Procéder au paiement
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Cart;
