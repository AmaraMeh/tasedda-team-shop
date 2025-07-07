
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Truck, MapPin } from 'lucide-react';

interface CheckoutFormProps {
  onSuccess: () => void;
}

const wilayas = [
  'ADRAR', 'CHLEF', 'LAGHOUAT', 'OUM EL BOUAGHI', 'BATNA', 'BEJAIA', 'BISKRA', 'BECHAR',
  'BLIDA', 'BOUIRA', 'TAMANRASSET', 'TEBESSA', 'TLEMCEN', 'TIARET', 'TIZI OUZOU', 'ALGER',
  'DJELFA', 'JIJEL', 'SETIF', 'SAIDA', 'SKIKDA', 'SIDI BEL ABBESS', 'ANNABA', 'GUELMA',
  'CONSTANTINE', 'MEDEA', 'MOSTAGANEM', 'M\'SILA', 'MASCARA', 'OUARGLA', 'ORAN', 'EL BAYADH',
  'ILLIZI', 'BORDJ BOU ARRERIDJ', 'BOUMERDES', 'EL TARF', 'TINDOUF', 'TISSEMSILT', 'EL OUED',
  'KHENCHELA', 'SOUK AHRAS', 'TIPAZA', 'MILA', 'AIN DEFLA', 'NAAMA', 'AIN TEMOUCHENT',
  'GHARDAIA', 'RELIZANE', 'TIMIMOUN', 'BORDJ BADJI MOKHTAR', 'OULED DJELLAL', 'BENI ABBES',
  'IN SALAH', 'IN GUEZZAM', 'TOUGGOURT', 'DJANET', 'M\'GHAIR', 'EL MENIA'
];

const CheckoutForm: React.FC<CheckoutFormProps> = ({ onSuccess }) => {
  const { items, getCartTotal, promoCode, discount, clearCart } = useCart();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [shippingRates, setShippingRates] = useState<any>(null);
  const [shippingCost, setShippingCost] = useState(0);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    address: '',
    commune: '',
    wilaya: '',
    postal_code: '',
    payment_method: 'cash_on_delivery',
    delivery_method: 'home_delivery'
  });

  useEffect(() => {
    if (formData.wilaya) {
      fetchShippingRates(formData.wilaya);
    }
  }, [formData.wilaya]);

  const fetchShippingRates = async (wilaya: string) => {
    try {
      const { data, error } = await supabase
        .from('shipping_rates')
        .select('*')
        .eq('wilaya', wilaya)
        .single();

      if (error) throw error;
      
      setShippingRates(data);
      
      // Set default shipping cost based on delivery method
      const cost = formData.delivery_method === 'home_delivery' 
        ? data.home_delivery_price 
        : data.office_delivery_price || data.home_delivery_price;
      setShippingCost(cost || 0);
    } catch (error) {
      console.error('Error fetching shipping rates:', error);
      setShippingRates(null);
      setShippingCost(0);
    }
  };

  const handleDeliveryMethodChange = (method: string) => {
    setFormData({ ...formData, delivery_method: method });
    
    if (shippingRates) {
      const cost = method === 'home_delivery' 
        ? shippingRates.home_delivery_price 
        : shippingRates.office_delivery_price || shippingRates.home_delivery_price;
      setShippingCost(cost || 0);
    }
  };

  const getTotalWithShipping = () => {
    return getCartTotal() + shippingCost;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Generate order number
      const orderNumber = `ORD-${Date.now()}`;
      
      const orderData = {
        order_number: orderNumber,
        user_id: null,
        total_amount: getTotalWithShipping(),
        discount_amount: discount,
        promo_code: promoCode,
        payment_method: formData.payment_method,
        delivery_method: formData.delivery_method,
        shipping_cost: shippingCost,
        payment_status: 'pending',
        order_status: 'pending',
        shipping_address: {
          full_name: formData.full_name,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          commune: formData.commune,
          wilaya: formData.wilaya,
          postal_code: formData.postal_code
        }
      };

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      if (orderError) throw orderError;

      // Insert order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
        size: item.size,
        color: item.color
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // If promo code was used, process commission
      if (promoCode) {
        await supabase.rpc('process_team_commission', { order_id_param: order.id });
      }

      toast({
        title: "Commande passée avec succès !",
        description: `Votre commande ${orderNumber} a été enregistrée. Vous recevrez bientôt un appel de confirmation.`,
      });

      clearCart();
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="glass-effect border-gold/20">
      <CardHeader>
        <CardTitle>Informations de livraison</CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nom complet *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                required
                className="bg-black/50 border-gold/20"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                required
                className="bg-black/50 border-gold/20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="bg-black/50 border-gold/20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Adresse complète *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              required
              className="bg-black/50 border-gold/20"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="wilaya">Wilaya *</Label>
              <Select value={formData.wilaya} onValueChange={(value) => setFormData({...formData, wilaya: value})}>
                <SelectTrigger className="bg-black/50 border-gold/20">
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
              <Label htmlFor="commune">Commune *</Label>
              <Input
                id="commune"
                value={formData.commune}
                onChange={(e) => setFormData({...formData, commune: e.target.value})}
                required
                className="bg-black/50 border-gold/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="postal_code">Code postal</Label>
              <Input
                id="postal_code"
                value={formData.postal_code}
                onChange={(e) => setFormData({...formData, postal_code: e.target.value})}
                className="bg-black/50 border-gold/20"
              />
            </div>
          </div>

          {/* Delivery Method Selection */}
          {shippingRates && (
            <div className="space-y-3">
              <Label>Mode de livraison *</Label>
              <RadioGroup 
                value={formData.delivery_method} 
                onValueChange={handleDeliveryMethodChange}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2 p-3 border border-gold/20 rounded-lg">
                  <RadioGroupItem value="home_delivery" id="home_delivery" />
                  <div className="flex-1 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <Label htmlFor="home_delivery">Livraison à domicile</Label>
                    </div>
                    <span className="font-bold text-gold">
                      {shippingRates.home_delivery_price?.toLocaleString()} DA
                    </span>
                  </div>
                </div>
                
                {shippingRates.office_delivery_price && (
                  <div className="flex items-center space-x-2 p-3 border border-gold/20 rounded-lg">
                    <RadioGroupItem value="office_delivery" id="office_delivery" />
                    <div className="flex-1 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        <Label htmlFor="office_delivery">Livraison au bureau</Label>
                      </div>
                      <span className="font-bold text-gold">
                        {shippingRates.office_delivery_price?.toLocaleString()} DA
                      </span>
                    </div>
                  </div>
                )}
              </RadioGroup>
            </div>
          )}

          <div className="space-y-2">
            <Label>Méthode de paiement</Label>
            <Select value={formData.payment_method} onValueChange={(value) => setFormData({...formData, payment_method: value})}>
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

          {/* Order Summary */}
          <div className="border-t border-gold/20 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Sous-total produits:</span>
              <span>{(getCartTotal() + discount).toLocaleString()} DA</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-green-500">
                <span>Réduction ({promoCode}):</span>
                <span>-{discount.toLocaleString()} DA</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span>Frais de livraison:</span>
              <span className="font-bold text-gold">{shippingCost.toLocaleString()} DA</span>
            </div>
            <div className="flex justify-between font-bold text-lg gold-text border-t border-gold/20 pt-2">
              <span>Total:</span>
              <span>{getTotalWithShipping().toLocaleString()} DA</span>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading || !formData.wilaya}
            className="w-full btn-gold"
          >
            {loading ? 'Traitement...' : 'Confirmer la commande'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CheckoutForm;
