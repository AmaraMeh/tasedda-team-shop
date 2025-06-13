
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
  const { items, getCartTotal, promoCode, discount, clearCart } = useCart();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    address: '',
    commune: '',
    wilaya: '',
    postal_code: '',
    payment_method: 'cash_on_delivery'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Generate order number
      const orderNumber = `ORD-${Date.now()}`;
      
      const orderData = {
        order_number: orderNumber,
        user_id: null, // Pas besoin de compte
        total_amount: getCartTotal(),
        discount_amount: discount,
        promo_code: promoCode,
        payment_method: formData.payment_method,
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

      // If promo code was used, create commission for team member
      if (promoCode) {
        const { data: teamMember } = await supabase
          .from('team_members')
          .select('*')
          .eq('promo_code', promoCode)
          .single();

        if (teamMember) {
          const commissionRate = teamMember.rank === 1 ? 0.06 :
                               teamMember.rank === 2 ? 0.08 :
                               teamMember.rank === 3 ? 0.10 :
                               teamMember.rank === 4 ? 0.12 : 0.12;

          await supabase.from('commissions').insert({
            team_member_id: teamMember.id,
            order_id: order.id,
            amount: getCartTotal() * commissionRate,
            percentage: commissionRate,
            status: 'pending'
          });
        }
      }

      toast({
        title: "Commande créée",
        description: `Votre commande ${orderNumber} a été créée avec succès`,
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
              <span>Sous-total:</span>
              <span>{(getCartTotal() + discount).toLocaleString()} DA</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-green-500">
                <span>Réduction ({promoCode}):</span>
                <span>-{discount.toLocaleString()} DA</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg gold-text">
              <span>Total:</span>
              <span>{getCartTotal().toLocaleString()} DA</span>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full btn-gold"
          >
            {loading ? 'Création...' : 'Confirmer la commande'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CheckoutForm;
