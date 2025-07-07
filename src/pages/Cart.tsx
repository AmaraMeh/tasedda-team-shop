
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Plus, Minus, X, CreditCard, Truck, ShoppingCart, Tag } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from '@/components/ui/badge';

const Cart = () => {
  const { items, clearCart, removeFromCart, updateQuantity, getCartTotal, getCartCount, applyPromoCode, promoCode, discount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderData, setOrderData] = useState({
    fullName: user?.user_metadata?.full_name || '',
    phone: user?.user_metadata?.phone || '',
    address: '',
    city: '',
    wilaya: '',
    paymentMethod: 'cash_on_delivery',
    deliveryMethod: 'home_delivery'
  });
  const [promoInput, setPromoInput] = useState('');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const { toast } = useToast();

  const handleIncrement = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (item) {
      updateQuantity(itemId, item.quantity + 1);
    }
  };

  const handleDecrement = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (item && item.quantity > 1) {
      updateQuantity(itemId, item.quantity - 1);
    }
  };

  const handleRemove = (itemId: string) => {
    removeFromCart(itemId);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setOrderData({ ...orderData, [e.target.name]: e.target.value });
  };

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

  const handlePlaceOrder = async () => {
    if (!orderData.fullName || !orderData.phone || !orderData.address || !orderData.city || !orderData.wilaya) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    setIsPlacingOrder(true);
    try {
      // Vérifier les tarifs de livraison
      let shippingCost = 0;
      const deliveryMethod = orderData.deliveryMethod || 'home_delivery';
      
      if (orderData.wilaya) {
        const { data: shippingRate } = await supabase
          .from('shipping_rates')
          .select('home_delivery_price, office_delivery_price')
          .eq('wilaya', orderData.wilaya.toUpperCase())
          .single();
        
        if (shippingRate) {
          shippingCost = deliveryMethod === 'home_delivery' 
            ? shippingRate.home_delivery_price 
            : (shippingRate.office_delivery_price || shippingRate.home_delivery_price);
        }
      }

      const orderNumber = `CMD${Date.now()}`;
      const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      const total = subtotal - discount + shippingCost;

      // Créer la commande
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          user_id: user?.id || null,
          total_amount: total,
          discount_amount: discount,
          shipping_cost: shippingCost,
          delivery_method: deliveryMethod,
          promo_code: promoCode || null,
          payment_method: orderData.paymentMethod || 'cash_on_delivery',
          payment_status: 'pending',
          order_status: 'pending',
          shipping_address: {
            full_name: orderData.fullName,
            phone: orderData.phone,
            address: orderData.address,
            city: orderData.city,
            wilaya: orderData.wilaya
          }
        })
        .select()
        .single();

      if (orderError) {
        console.error('Order creation error:', orderError);
        throw orderError;
      }

      // Créer les éléments de commande avec vérification des produits
      const orderItems = [];
      for (const item of items) {
        // Vérifier si le produit existe toujours
        const { data: product, error: productError } = await supabase
          .from('products')
          .select('id')
          .eq('id', item.product.id)
          .single();
        
        if (product) {
          orderItems.push({
            order_id: order.id,
            product_id: item.product.id,
            quantity: item.quantity,
            price: item.product.price,
            size: item.size || null,
            color: item.color || null
          });
        }
      }

      if (orderItems.length > 0) {
        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems);

        if (itemsError) {
          console.error('Order items error:', itemsError);
          throw itemsError;
        }
      }

      // Traiter les commissions si un code promo est utilisé
      if (promoCode && order.id) {
        const { processOrderCommission } = await import('@/utils/orderUtils');
        await processOrderCommission(order.id);
      }

      toast({
        title: "Commande passée avec succès !",
        description: `Votre commande #${orderNumber} a été enregistrée. Vous recevrez une confirmation par SMS.`,
      });

      // Vider le panier
      clearCart();
      
      // Rediriger vers la page d'accueil
      navigate('/');

    } catch (error: any) {
      console.error('Error placing order:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la commande",
        variant: "destructive",
      });
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center px-4">
        <Card className="glass-effect border-gold/20 w-full max-w-md">
          <CardContent className="text-center py-12">
            <ShoppingCart className="h-16 w-16 mx-auto text-gold mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Votre panier est vide</h2>
            <p className="text-muted-foreground mb-6">Découvrez nos produits et ajoutez-les à votre panier</p>
            <Button onClick={() => navigate('/products')} className="btn-gold">
              Voir les produits
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black py-4 px-4">
      <div className="container mx-auto max-w-6xl">
        {!showCheckout ? (
          <>
            {/* En-tête */}
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Panier d'achat</h1>
              <p className="text-muted-foreground">{getCartCount()} article(s) dans votre panier</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Liste des produits */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => (
                  <Card key={item.id} className="glass-effect border-gold/20">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <img
                          src={item.product.image_url || '/placeholder.svg'}
                          alt={item.product.name}
                          className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-white text-sm sm:text-base">{item.product.name}</h3>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {item.size && <Badge variant="outline" className="text-xs">Taille: {item.size}</Badge>}
                            {item.color && <Badge variant="outline" className="text-xs">Couleur: {item.color}</Badge>}
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDecrement(item.id)}
                                className="h-8 w-8 p-0"
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="text-sm w-8 text-center text-white">{item.quantity}</span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleIncrement(item.id)}
                                className="h-8 w-8 p-0"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-gold">
                                {(item.product.price * item.quantity).toLocaleString()} DA
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRemove(item.id)}
                                className="text-red-500 hover:text-red-600 p-1"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Résumé de commande */}
              <div className="space-y-4">
                <Card className="glass-effect border-gold/20">
                  <CardHeader>
                    <CardTitle className="text-lg text-white">Résumé de la commande</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Code promo */}
                    <div className="space-y-2">
                      <Label className="text-sm text-white">Code promo Team</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="LION123"
                          value={promoInput}
                          onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                          className="bg-black/50 border-gold/20 text-sm"
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
                          Code appliqué: {promoCode} (-{discount.toLocaleString()} DA)
                        </div>
                      )}
                    </div>

                    {/* Totaux */}
                    <div className="border-t border-gold/20 pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-white">Sous-total:</span>
                        <span className="text-white">{(getCartTotal() + discount).toLocaleString()} DA</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-sm text-green-500">
                          <span>Réduction:</span>
                          <span>-{discount.toLocaleString()} DA</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-lg">
                        <span className="text-white">Total:</span>
                        <span className="text-gold">{getCartTotal().toLocaleString()} DA</span>
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
          </>
        ) : (
          // Formulaire de checkout
          <Card className="glass-effect border-gold/20 max-w-2xl mx-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl text-white">Finaliser la commande</CardTitle>
                <Button variant="ghost" onClick={() => setShowCheckout(false)} className="h-8 w-8 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm text-white">Nom complet *</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={orderData.fullName}
                    onChange={handleInputChange}
                    required
                    className="bg-black/50 border-gold/20"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm text-white">Téléphone *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={orderData.phone}
                    onChange={handleInputChange}
                    required
                    className="bg-black/50 border-gold/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm text-white">Adresse *</Label>
                <Input
                  id="address"
                  name="address"
                  value={orderData.address}
                  onChange={handleInputChange}
                  required
                  className="bg-black/50 border-gold/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-sm text-white">Ville *</Label>
                  <Input
                    id="city"
                    name="city"
                    value={orderData.city}
                    onChange={handleInputChange}
                    required
                    className="bg-black/50 border-gold/20"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="wilaya" className="text-sm text-white">Wilaya *</Label>
                  <Select onValueChange={(value) => setOrderData({ ...orderData, wilaya: value })}>
                    <SelectTrigger className="bg-black/50 border-gold/20">
                      <SelectValue placeholder="Sélectionner une wilaya" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADRAR">ADRAR</SelectItem>
                      <SelectItem value="CHLEF">CHLEF</SelectItem>
                      <SelectItem value="LAGHOUAT">LAGHOUAT</SelectItem>
                      <SelectItem value="ALGER">ALGER</SelectItem>
                      <SelectItem value="ORAN">ORAN</SelectItem>
                      <SelectItem value="CONSTANTINE">CONSTANTINE</SelectItem>
                      <SelectItem value="ANNABA">ANNABA</SelectItem>
                      <SelectItem value="SETIF">SETIF</SelectItem>
                      <SelectItem value="TIZI OUZOU">TIZI OUZOU</SelectItem>
                      <SelectItem value="BEJAIA">BEJAIA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Méthode de livraison */}
              <div className="space-y-3">
                <Label className="text-sm text-white">Méthode de livraison</Label>
                <RadioGroup 
                  defaultValue="home_delivery" 
                  className="flex flex-col gap-2"
                  onValueChange={(value) => setOrderData({ ...orderData, deliveryMethod: value })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="home_delivery" id="home" />
                    <Label htmlFor="home" className="text-white flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Livraison à domicile
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="office_delivery" id="office" />
                    <Label htmlFor="office" className="text-white flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      Livraison au bureau
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Méthode de paiement */}
              <div className="space-y-2">
                <Label className="text-sm text-white">Méthode de paiement</Label>
                <Select 
                  value={orderData.paymentMethod} 
                  onValueChange={(value) => setOrderData({ ...orderData, paymentMethod: value })}
                >
                  <SelectTrigger className="bg-black/50 border-gold/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash_on_delivery">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        Paiement à la livraison
                      </div>
                    </SelectItem>
                    <SelectItem value="baridimob">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        BaridiMob
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Résumé final */}
              <div className="border-t border-gold/20 pt-4">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-white">Sous-total:</span>
                    <span className="text-white">{(getCartTotal() + discount).toLocaleString()} DA</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-500">
                      <span>Réduction ({promoCode}):</span>
                      <span>-{discount.toLocaleString()} DA</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg">
                    <span className="text-white">Total:</span>
                    <span className="text-gold">{getCartTotal().toLocaleString()} DA</span>
                  </div>
                </div>

                <Button
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder}
                  className="w-full btn-gold"
                >
                  {isPlacingOrder ? 'Traitement...' : 'Confirmer la commande'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Cart;
