
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Truck } from 'lucide-react';

interface CheckoutProps {
  isOpen: boolean;
  onClose: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ isOpen, onClose }) => {
  const { items, getCartTotal, promoCode, discount, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: '',
    city: '',
    wilaya: '',
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
        user_id: user?.id || null,
        total_amount: getCartTotal(),
        discount_amount: discount,
        promo_code: promoCode,
        payment_method: formData.payment_method,
        payment_status: 'pending',
        order_status: 'pending',
        shipping_address: {
          full_name: formData.full_name,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          wilaya: formData.wilaya
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
      onClose();
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-effect border-gold/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Finaliser la commande</CardTitle>
            <Button variant="ghost" onClick={onClose}>×</Button>
          </div>
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
              <Label htmlFor="address">Adresse *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                required
                className="bg-black/50 border-gold/20"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Ville *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  required
                  className="bg-black/50 border-gold/20"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="wilaya">Wilaya *</Label>
                <Input
                  id="wilaya"
                  value={formData.wilaya}
                  onChange={(e) => setFormData({...formData, wilaya: e.target.value})}
                  required
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
    </div>
  );
};

export default Checkout;
