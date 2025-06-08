
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Order } from '@/types';

interface CheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderComplete: () => void;
}

const WILAYAS = [
  'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra', 'Béchar',
  'Blida', 'Bouira', 'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret', 'Tizi Ouzou', 'Alger',
  'Djelfa', 'Jijel', 'Sétif', 'Saïda', 'Skikda', 'Sidi Bel Abbès', 'Annaba', 'Guelma',
  'Constantine', 'Médéa', 'Mostaganem', 'MSila', 'Mascara', 'Ouargla', 'Oran', 'El Bayadh',
  'Illizi', 'Bordj Bou Arreridj', 'Boumerdès', 'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued',
  'Khenchela', 'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent',
  'Ghardaïa', 'Relizane'
];

const Checkout: React.FC<CheckoutProps> = ({ isOpen, onClose, onOrderComplete }) => {
  const { items, getCartTotal, promoCode, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: '',
    city: '',
    wilaya: '',
    payment_method: 'cash_on_delivery' as 'cash_on_delivery' | 'baridimob'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Générer un numéro de commande unique
      const orderNumber = `CMD${Date.now()}`;
      
      // Créer la commande
      const orderData: Partial<Order> = {
        order_number: orderNumber,
        user_id: user?.id,
        total_amount: getCartTotal(),
        discount_amount: getCartTotal() + (promoCode ? getCartTotal() * 0.05 : 0) - getCartTotal(),
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
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) throw orderError;

      // Ajouter les articles de la commande
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

      // Si un code promo a été utilisé, créer une commission pour le membre team
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
          
          const commissionAmount = getCartTotal() * commissionRate;

          await supabase
            .from('commissions')
            .insert({
              team_member_id: teamMember.id,
              order_id: order.id,
              amount: commissionAmount,
              percentage: commissionRate * 100,
              status: 'pending', // Nécessite validation admin
              user_id: user?.id
            });
        }
      }

      toast({
        title: "Commande créée avec succès !",
        description: `Votre commande ${orderNumber} a été enregistrée. Vous recevrez une confirmation par email.`,
      });

      clearCart();
      onOrderComplete();
      onClose();

    } catch (error: any) {
      console.error('Error creating order:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la commande. Veuillez réessayer.",
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
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations de livraison */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold gold-text">Informations de livraison</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name">Nom complet *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    className="bg-black/50 border-gold/20"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Téléphone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="bg-black/50 border-gold/20"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="address">Adresse complète *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="bg-black/50 border-gold/20"
                  placeholder="Rue, quartier, numéro..."
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">Ville *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="bg-black/50 border-gold/20"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="wilaya">Wilaya *</Label>
                  <Select value={formData.wilaya} onValueChange={(value) => setFormData({...formData, wilaya: value})}>
                    <SelectTrigger className="bg-black/50 border-gold/20">
                      <SelectValue placeholder="Sélectionner une wilaya" />
                    </SelectTrigger>
                    <SelectContent>
                      {WILAYAS.map(wilaya => (
                        <SelectItem key={wilaya} value={wilaya}>
                          {wilaya}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Méthode de paiement */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold gold-text">Méthode de paiement</h3>
              <RadioGroup 
                value={formData.payment_method} 
                onValueChange={(value) => setFormData({...formData, payment_method: value as 'cash_on_delivery' | 'baridimob'})}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cash_on_delivery" id="cod" />
                  <Label htmlFor="cod">Paiement à la livraison (Recommandé)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="baridimob" id="baridimob" />
                  <Label htmlFor="baridimob">BaridiMob (Validation manuelle)</Label>
                </div>
              </RadioGroup>
              
              {formData.payment_method === 'baridimob' && (
                <p className="text-sm text-muted-foreground">
                  ⚠️ Le paiement BaridiMob nécessite une validation manuelle par notre équipe. 
                  Vous recevrez les instructions de paiement par email.
                </p>
              )}
            </div>

            {/* Récapitulatif */}
            <div className="border-t border-gold/20 pt-4">
              <h3 className="text-lg font-semibold gold-text mb-4">Récapitulatif</h3>
              <div className="space-y-2">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.product.name} x{item.quantity}</span>
                    <span>{(item.product.price * item.quantity).toLocaleString()} DA</span>
                  </div>
                ))}
                {promoCode && (
                  <div className="flex justify-between text-sm text-green-500">
                    <span>Code promo ({promoCode}) -5%:</span>
                    <span>-{(getCartTotal() * 0.05).toLocaleString()} DA</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg gold-text border-t border-gold/20 pt-2">
                  <span>Total:</span>
                  <span>{getCartTotal().toLocaleString()} DA</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Annuler
              </Button>
              <Button type="submit" disabled={loading} className="flex-1 btn-gold">
                {loading ? 'Création...' : 'Confirmer la commande'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Checkout;
