
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Truck } from 'lucide-react';
import { getShippingCost } from '@/services/shippingService';

interface CheckoutFormProps {
  onSuccess: () => void;
}

const wilayas = [
  'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra', 'Béchar',
  'Blida', 'Bouira', 'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret', 'Tizi Ouzou', 'Alger',
  'Djelfa', 'Jijel', 'Sétif', 'Saïda', 'Skikda', 'Sidi Bel Abbès', 'Annaba', 'Guelma',
  'Constantine', 'Médéa', 'Mostaganem', 'M\'Sila', 'Mascara', 'Ouargla', 'Oran', 'El Bayadh',
  'Illizi', 'Bordj Bou Arréridj', 'Boumerdès', 'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued',
  'Khenchela', 'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent',
  'Ghardaïa', 'Relizane'
];

const CheckoutForm: React.FC<CheckoutFormProps> = ({ onSuccess }) => {
  const { items, getTotal, promoCode, discount, clearCart } = useCart();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [deliveryType, setDeliveryType] = useState<'home' | 'office'>('home');
  const [shippingCost, setShippingCost] = useState(0);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: '',
    commune: '',
    wilaya: '',
    payment_method: 'cash_on_delivery'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleWilayaChange = (wilaya: string) => {
    setFormData(prev => ({ ...prev, wilaya }));
    const cost = getShippingCost(wilaya, deliveryType);
    setShippingCost(cost);
  };

  const handleDeliveryTypeChange = (type: 'home' | 'office') => {
    setDeliveryType(type);
    if (formData.wilaya) {
      const cost = getShippingCost(formData.wilaya, type);
      setShippingCost(cost);
    }
  };

  const getTotalWithShipping = () => getTotal() + shippingCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (items.length === 0) {
      toast({
        title: "Panier vide",
        description: "Votre panier est vide",
        variant: "destructive",
      });
      return;
    }

    if (!formData.full_name || !formData.phone || !formData.address || !formData.commune || !formData.wilaya) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      console.log('Starting checkout process with items:', items);
      
      // Generate order number
      const orderNumber = `ORD-${Date.now()}`;
      
      const orderData = {
        order_number: orderNumber,
        user_id: null, // Guest order
        total_amount: getTotalWithShipping(),
        discount_amount: discount,
        promo_code: promoCode,
        payment_method: formData.payment_method,
        payment_status: 'pending',
        order_status: 'pending',
        shipping_address: {
          full_name: formData.full_name,
          phone: formData.phone,
          address: formData.address,
          commune: formData.commune,
          wilaya: formData.wilaya,
          delivery_type: deliveryType,
          shipping_cost: shippingCost
        }
      };

      console.log('Creating order with data:', orderData);

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      if (orderError) {
        console.error('Order creation error:', orderError);
        throw orderError;
      }

      console.log('Order created successfully:', order);

      // Insert order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
        size: item.size,
        color: item.color
      }));

      console.log('Creating order items:', orderItems);

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Order items creation error:', itemsError);
        throw itemsError;
      }

      console.log('Order items created successfully');

      // If promo code was used, create commission for team member
      if (promoCode) {
        console.log('Processing promo code:', promoCode);
        
        const { data: teamMember } = await supabase
          .from('team_members')
          .select('*')
          .eq('promo_code', promoCode)
          .single();

        if (teamMember) {
          console.log('Team member found:', teamMember);
          
          const commissionRate = teamMember.rank === 1 ? 0.06 :
                               teamMember.rank === 2 ? 0.08 :
                               teamMember.rank === 3 ? 0.10 :
                               teamMember.rank === 4 ? 0.12 : 0.12;

          const { error: commissionError } = await supabase.from('commissions').insert({
            team_member_id: teamMember.id,
            order_id: order.id,
            amount: getTotal() * commissionRate,
            percentage: commissionRate,
            status: 'pending'
          });

          if (commissionError) {
            console.error('Commission creation error:', commissionError);
          } else {
            console.log('Commission created successfully');
          }
        }
      }

      toast({
        title: "Commande confirmée !",
        description: `Votre commande ${orderNumber} a été créée avec succès`,
      });

      // Clear cart only after successful order creation
      clearCart();
      onSuccess();
      
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la création de la commande",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="glass-effect border-gold/20">
      <CardHeader>
        <CardTitle className="text-white">Informations de livraison</CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name" className="text-white">Nom complet *</Label>
              <Input
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                required
                className="bg-black/50 border-gold/20 text-white"
                placeholder="Votre nom complet"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-white">Téléphone *</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="bg-black/50 border-gold/20 text-white"
                placeholder="0X XX XX XX XX"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-white">Adresse complète *</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
              className="bg-black/50 border-gold/20 text-white"
              placeholder="Votre adresse complète"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="wilaya" className="text-white">Wilaya *</Label>
              <Select value={formData.wilaya} onValueChange={handleWilayaChange}>
                <SelectTrigger className="bg-black/50 border-gold/20 text-white">
                  <SelectValue placeholder="Sélectionner la wilaya" />
                </SelectTrigger>
                <SelectContent>
                  {wilayas.map((wilaya) => (
                    <SelectItem key={wilaya} value={wilaya}>
                      {wilaya}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="commune" className="text-white">Commune *</Label>
              <Input
                id="commune"
                name="commune"
                value={formData.commune}
                onChange={handleInputChange}
                required
                className="bg-black/50 border-gold/20 text-white"
                placeholder="Votre commune"
              />
            </div>
          </div>

          {formData.wilaya && (
            <div className="space-y-2">
              <Label className="text-white">Type de livraison *</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={deliveryType === 'home' ? 'default' : 'outline'}
                  className={deliveryType === 'home' ? 'btn-gold' : 'border-gold/20 text-white hover:bg-gold/10'}
                  onClick={() => handleDeliveryTypeChange('home')}
                >
                  À domicile ({getShippingCost(formData.wilaya, 'home').toLocaleString()} DA)
                </Button>
                <Button
                  type="button"
                  variant={deliveryType === 'office' ? 'default' : 'outline'}
                  className={deliveryType === 'office' ? 'btn-gold' : 'border-gold/20 text-white hover:bg-gold/10'}
                  onClick={() => handleDeliveryTypeChange('office')}
                >
                  Au bureau ({getShippingCost(formData.wilaya, 'office').toLocaleString()} DA)
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-white">Méthode de paiement</Label>
            <Select value={formData.payment_method} onValueChange={(value) => setFormData({...formData, payment_method: value})}>
              <SelectTrigger className="bg-black/50 border-gold/20 text-white">
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

          {/* Order Summary */}
          <div className="border-t border-gold/20 pt-4 space-y-2">
            <div className="flex justify-between text-sm text-white">
              <span>Sous-total:</span>
              <span>{(getTotal() + discount).toLocaleString()} DA</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-green-500">
                <span>Réduction ({promoCode}):</span>
                <span>-{discount.toLocaleString()} DA</span>
              </div>
            )}
            {shippingCost > 0 && (
              <div className="flex justify-between text-sm text-white">
                <span>Livraison:</span>
                <span>{shippingCost.toLocaleString()} DA</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg text-white border-t border-gold/20 pt-2">
              <span>Total:</span>
              <span className="text-gold">{getTotalWithShipping().toLocaleString()} DA</span>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading || !formData.wilaya}
            className="w-full btn-gold"
          >
            {loading ? 'Création de la commande...' : 'Confirmer la commande'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CheckoutForm;
