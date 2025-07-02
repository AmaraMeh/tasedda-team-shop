
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, CreditCard, Truck, Home, Building } from 'lucide-react';
import { getShippingCost, getAvailableDeliveryTypes, SHIPPING_RATES } from '@/services/shippingService';

const wilayas = Object.keys(SHIPPING_RATES);

const Checkout = () => {
  const { items, updateQuantity, removeFromCart, clearCart, getTotal } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
  const [deliveryType, setDeliveryType] = useState<'home' | 'office'>('home');
  const [shippingCost, setShippingCost] = useState(0);
  
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: '',
    city: '',
    wilaya: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleWilayaChange = (wilaya: string) => {
    setFormData(prev => ({ ...prev, wilaya }));
    const availableTypes = getAvailableDeliveryTypes(wilaya);
    if (!availableTypes.includes(deliveryType)) {
      setDeliveryType(availableTypes[0]);
    }
    setShippingCost(getShippingCost(wilaya, deliveryType));
  };

  const handleDeliveryTypeChange = (type: 'home' | 'office') => {
    setDeliveryType(type);
    if (formData.wilaya) {
      setShippingCost(getShippingCost(formData.wilaya, type));
    }
  };

  const getTotalWithShipping = () => getTotal() + shippingCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setLoading(true);
    try {
      // Generate order number
      const orderNumber = `ORD-${Date.now()}`;
      
      // Create order
      const orderData = {
        order_number: orderNumber,
        user_id: user?.id || null,
        total_amount: getTotalWithShipping(),
        payment_method: paymentMethod,
        payment_status: 'pending',
        order_status: 'pending',
        shipping_address: {
          full_name: formData.full_name,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          wilaya: formData.wilaya,
          delivery_type: deliveryType,
          shipping_cost: shippingCost
        }
      };

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.price,
        size: item.size || null,
        color: item.color || null
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear cart and show success
      clearCart();
      toast({
        title: "Commande confirmée !",
        description: `Votre commande ${orderNumber} a été enregistrée avec succès.`,
      });

      // Redirect to success page or orders
      navigate('/');
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la commande. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="py-8">
            <h2 className="text-xl font-semibold mb-4">Panier vide</h2>
            <p className="text-muted-foreground mb-4">
              Votre panier est vide. Ajoutez des produits pour continuer.
            </p>
            <Button onClick={() => navigate('/products')}>
              Voir les produits
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black py-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Cart Summary */}
          <Card className="glass-effect border-gold/20">
            <CardHeader>
              <CardTitle className="text-white">Récapitulatif de la commande</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 p-4 rounded-lg bg-black/30">
                  <img
                    src={item.image_url || '/placeholder.jpg'}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-white">{item.name}</h3>
                    {item.size && <p className="text-sm text-gray-400">Taille: {item.size}</p>}
                    {item.color && <p className="text-sm text-gray-400">Couleur: {item.color}</p>}
                    <p className="text-gold font-semibold">{item.price.toLocaleString()} DA</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.size, item.color)}
                      className="w-8 h-8 p-0 border-gold/20"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center text-white">{item.quantity}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.size, item.color)}
                      className="w-8 h-8 p-0 border-gold/20"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeFromCart(item.product.id, item.size, item.color)}
                      className="w-8 h-8 p-0 ml-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              <div className="border-t border-gold/20 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-white">
                  <span>Sous-total:</span>
                  <span>{getTotal().toLocaleString()} DA</span>
                </div>
                {shippingCost > 0 && (
                  <div className="flex justify-between text-sm text-white">
                    <span>Livraison:</span>
                    <span>{shippingCost.toLocaleString()} DA</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-lg font-semibold text-white">
                  <span>Total:</span>
                  <span className="text-gold">{getTotalWithShipping().toLocaleString()} DA</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Checkout Form */}
          <Card className="glass-effect border-gold/20">
            <CardHeader>
              <CardTitle className="text-white">Informations de livraison</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name" className="text-white">Nom complet *</Label>
                    <Input
                      id="full_name"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      required
                      className="bg-black/50 border-gold/20 text-white placeholder:text-gray-400"
                      placeholder="Votre nom complet"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-white">Téléphone *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="bg-black/50 border-gold/20 text-white placeholder:text-gray-400"
                      placeholder="0X XX XX XX XX"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wilaya" className="text-white">Wilaya *</Label>
                  <Select value={formData.wilaya} onValueChange={handleWilayaChange}>
                    <SelectTrigger className="bg-black/50 border-gold/20 text-white">
                      <SelectValue placeholder="Sélectionner la wilaya" />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-gold/20">
                      {wilayas.map((wilaya) => (
                        <SelectItem key={wilaya} value={wilaya} className="text-white hover:bg-gold/10">
                          {wilaya}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.wilaya && (
                  <div className="space-y-2">
                    <Label className="text-white">Type de livraison *</Label>
                    <RadioGroup value={deliveryType} onValueChange={handleDeliveryTypeChange}>
                      {getAvailableDeliveryTypes(formData.wilaya).map((type) => (
                        <div key={type} className="flex items-center space-x-2 p-3 rounded-lg bg-black/30">
                          <RadioGroupItem value={type} id={type} />
                          <Label htmlFor={type} className="flex items-center cursor-pointer text-white">
                            {type === 'home' ? (
                              <>
                                <Home className="w-4 h-4 mr-2 text-gold" />
                                À domicile ({getShippingCost(formData.wilaya, 'home').toLocaleString()} DA)
                              </>
                            ) : (
                              <>
                                <Building className="w-4 h-4 mr-2 text-gold" />
                                Au bureau ({getShippingCost(formData.wilaya, 'office').toLocaleString()} DA)
                              </>
                            )}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-white">Ville *</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="bg-black/50 border-gold/20 text-white placeholder:text-gray-400"
                      placeholder="Votre ville"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-white">Adresse *</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      className="bg-black/50 border-gold/20 text-white placeholder:text-gray-400"
                      placeholder="Adresse complète"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-white">Mode de paiement</Label>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="flex items-center space-x-2 p-3 rounded-lg bg-black/30">
                      <RadioGroupItem value="cash_on_delivery" id="cash" />
                      <Label htmlFor="cash" className="flex items-center cursor-pointer text-white">
                        <Truck className="w-4 h-4 mr-2 text-gold" />
                        Paiement à la livraison
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 rounded-lg bg-black/30">
                      <RadioGroupItem value="online_payment" id="online" />
                      <Label htmlFor="online" className="flex items-center cursor-pointer text-white">
                        <CreditCard className="w-4 h-4 mr-2 text-gold" />
                        Paiement en ligne
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="border-t border-gold/20 pt-4">
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm text-white">
                      <span>Sous-total:</span>
                      <span>{getTotal().toLocaleString()} DA</span>
                    </div>
                    {shippingCost > 0 && (
                      <div className="flex justify-between text-sm text-white">
                        <span>Livraison:</span>
                        <span>{shippingCost.toLocaleString()} DA</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-lg font-semibold text-white">
                      <span>Total à payer:</span>
                      <span className="text-gold">{getTotalWithShipping().toLocaleString()} DA</span>
                    </div>
                  </div>
                  
                  <Button
                    type="submit"
                    disabled={loading || !formData.wilaya}
                    className="w-full btn-gold text-lg py-3"
                  >
                    {loading ? "Traitement..." : "Confirmer la commande"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
