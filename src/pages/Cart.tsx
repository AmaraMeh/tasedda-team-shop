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
import { CartItem } from '@/types';
import { MapPin, Plus, Minus, X, CreditCard, Truck } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

const Cart = () => {
  const { items, clearCart, removeItem, updateQuantity } = useCart();
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
  const [promoCode, setPromoCode] = useState('');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const handleIncrement = (item: CartItem) => {
    updateQuantity(item, item.quantity + 1);
  };

  const handleDecrement = (item: CartItem) => {
    if (item.quantity > 1) {
      updateQuantity(item, item.quantity - 1);
    }
  };

  const handleRemove = (item: CartItem) => {
    removeItem(item.id);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setOrderData({ ...orderData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (orderData: any) => {
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
      let discount = 0;
      
      // Calculer la remise si un code promo est utilisé
      if (promoCode) {
        discount = subtotal * 0.05; // 5% de remise par exemple
      }
      
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

      if (orderError) throw orderError;

      // Créer les éléments de commande
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
        size: item.size || null,
        color: item.color || null
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Traiter les commissions si un code promo est utilisé
      if (promoCode && order.id) {
        // Importer et utiliser la fonction de traitement des commissions
        const { processOrderCommission } = await import('@/utils/orderUtils');
        await processOrderCommission(order.id);
      }

      toast({
        title: "Commande passée avec succès !",
        description: `Votre commande #${orderNumber} a été enregistrée. Vous recevrez une confirmation par SMS.`,
      });

      // Vider le panier
      clearCart();
      
      // Rediriger vers une page de confirmation
      setTimeout(() => {
        window.location.href = `/order-confirmation/${orderNumber}`;
      }, 2000);

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

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  };

  const subtotal = calculateSubtotal();
  const discount = promoCode ? subtotal * 0.05 : 0; // Example: 5% discount
  const shippingCost = 500; // Example: Fixed shipping cost
  const total = subtotal - discount + shippingCost;

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto mt-10">
      <div className="flex shadow-md my-10">
        <div className="w-3/4 bg-black/50 px-10 py-10">
          <div className="flex justify-between border-b pb-8">
            <h1 className="font-semibold text-2xl text-white">Panier</h1>
            <h2 className="font-semibold text-2xl text-gold">{items.length} Articles</h2>
          </div>
          <div className="flex mt-10 mb-5">
            <h3 className="font-semibold text-gray-600 text-xs uppercase w-2/5">Produit</h3>
            <h3 className="font-semibold text-center text-gray-600 text-xs uppercase w-1/5 text-gold">Quantité</h3>
            <h3 className="font-semibold text-center text-gray-600 text-xs uppercase w-1/5">Prix</h3>
            <h3 className="font-semibold text-center text-gray-600 text-xs uppercase w-1/5">Total</h3>
          </div>

          {items.map((item) => (
            <div key={item.id} className="flex items-center hover:bg-gray-600 -mx-8 px-6 py-5">
              <div className="flex w-2/5">
                <div className="w-20">
                  <img src={item.product.image_url} alt={item.product.name} />
                </div>
                <div className="flex flex-col justify-between ml-4 flex-grow">
                  <span className="font-bold text-sm text-white">{item.product.name}</span>
                  <span className="text-red-500 text-xs">{item.size ? `Size: ${item.size}` : ''} {item.color ? `Color: ${item.color}` : ''}</span>
                  <div className="font-semibold hover:text-red-500 text-gray-500 text-xs cursor-pointer" onClick={() => handleRemove(item)}>Remove</div>
                </div>
              </div>
              <div className="flex justify-center w-1/5">
                <svg className="fill-current text-gray-600 w-3 cursor-pointer" viewBox="0 0 448 512" onClick={() => handleDecrement(item)}><path d="M416 208H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h384c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z" /></svg>

                <Input className="mx-2 border text-center w-8" type="text" value={item.quantity} readOnly />

                <svg className="fill-current text-gray-600 w-3 cursor-pointer" onClick={() => handleIncrement(item)} viewBox="0 0 448 512">
                  <path d="M416 208H272V64c0-17.67-14.33-32-32-32h-32c-17.67 0-32 14.33-32 32v144H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h144v144c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32V304h144c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z" /></svg>
              </div>
              <span className="text-center w-1/5 font-semibold text-sm text-white">{item.product.price} DA</span>
              <span className="text-center w-1/5 font-semibold text-white">{item.product.price * item.quantity} DA</span>
            </div>
          ))}

          <a href="/products" className="flex font-semibold text-indigo-600 text-sm mt-10">
            <svg className="fill-current mr-2 text-indigo-600 w-4" viewBox="0 0 448 512"><path d="M134.059 296H436c6.627 0 12-5.373 12-12v-56c0-6.627-5.373-12-12-12H134.059v-46.059c0-21.382-25.851-32.09-40.971-16.971L7.029 239.029c-9.373 9.373-9.373 24.569 0 33.941l86.059 86.059c15.119 15.119 40.971 4.411 40.971-16.971V296z" /></svg>
            Continuer vos achats
          </a>
        </div>

        <div id="summary" className="w-1/4 px-8 py-10 bg-black/50">
          <h1 className="font-semibold text-2xl border-b pb-8 text-white">Récapitulatif de la commande</h1>
          <div className="mt-8 mb-5">
            <Label className="font-semibold text-sm uppercase text-white">Code Promo</Label>
            <Input type="text" placeholder="Entrez votre code" className="p-2 mt-2" value={promoCode} onChange={e => setPromoCode(e.target.value)} />
          </div>
          <div className="py-10">
            <Label className="uppercase font-semibold text-sm text-white">Livraison</Label>
            <RadioGroup defaultValue="home_delivery" className="flex flex-col gap-2 mt-2" onValueChange={(value) => setOrderData({ ...orderData, deliveryMethod: value })}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="home_delivery" id="r1" className="bg-gold/20 text-gold rounded-full" />
                <Label htmlFor="r1" className="text-white">Livraison à domicile</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="office_delivery" id="r2" className="bg-gold/20 text-gold rounded-full" />
                <Label htmlFor="r2" className="text-white">Livraison au bureau</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="border-t mt-8">
            <div className="flex font-semibold justify-between py-6 text-sm uppercase text-white">
              <span>Sous-total</span>
              <span>{subtotal} DA</span>
            </div>
            <div className="flex font-semibold justify-between py-6 text-sm uppercase text-white">
              <span>Remise</span>
              <span>{discount} DA</span>
            </div>
            <div className="flex font-semibold justify-between py-6 text-sm uppercase text-white">
              <span>Livraison</span>
              <span>{shippingCost} DA</span>
            </div>
            <div className="flex font-semibold justify-between py-6 text-sm uppercase text-gold">
              <span>Total</span>
              <span>{total} DA</span>
            </div>
            <Button className="mt-8 btn-gold w-full" onClick={() => setShowAddressForm(true)} disabled={items.length === 0}>Passer la commande</Button>
          </div>
        </div>
      </div>

      {/* Address Form Modal */}
      {showAddressForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <Card className="max-w-md w-full mx-4 glass-effect border-gold/20">
            <CardHeader>
              <CardTitle>Informations de livraison</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="fullName">Nom complet</Label>
                <Input type="text" id="fullName" name="fullName" value={orderData.fullName} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="phone">Téléphone</Label>
                <Input type="text" id="phone" name="phone" value={orderData.phone} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="address">Adresse</Label>
                <Input type="text" id="address" name="address" value={orderData.address} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="city">Ville</Label>
                <Input type="text" id="city" name="city" value={orderData.city} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="wilaya">Wilaya</Label>
                <Select onValueChange={(value) => setOrderData({ ...orderData, wilaya: value })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionner une wilaya" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADRAR">ADRAR</SelectItem>
                    <SelectItem value="CHLEF">CHLEF</SelectItem>
                    <SelectItem value="LAGHOUAT">LAGHOUAT</SelectItem>
                    <SelectItem value="OUM EL BOUAGHI">OUM EL BOUAGHI</SelectItem>
                    <SelectItem value="BATNA">BATNA</SelectItem>
                    <SelectItem value="BEJAIA">BEJAIA</SelectItem>
                    <SelectItem value="BISKRA">BISKRA</SelectItem>
                    <SelectItem value="BECHAR">BECHAR</SelectItem>
                    <SelectItem value="BLIDA">BLIDA</SelectItem>
                    <SelectItem value="BOUIRA">BOUIRA</SelectItem>
                    <SelectItem value="TAMANRASSET">TAMANRASSET</SelectItem>
                    <SelectItem value="TEBESSA">TEBESSA</SelectItem>
                    <SelectItem value="TLEMCEN">TLEMCEN</SelectItem>
                    <SelectItem value="TIARET">TIARET</SelectItem>
                    <SelectItem value="TIZI OUZOU">TIZI OUZOU</SelectItem>
                    <SelectItem value="ALGER">ALGER</SelectItem>
                    <SelectItem value="DJELFA">DJELFA</SelectItem>
                    <SelectItem value="JIJEL">JIJEL</SelectItem>
                    <SelectItem value="SETIF">SETIF</SelectItem>
                    <SelectItem value="SAIDA">SAIDA</SelectItem>
                    <SelectItem value="SKIKDA">SKIKDA</SelectItem>
                    <SelectItem value="SIDI BEL ABBESS">SIDI BEL ABBESS</SelectItem>
                    <SelectItem value="ANNABA">ANNABA</SelectItem>
                    <SelectItem value="GUELMA">GUELMA</SelectItem>
                    <SelectItem value="CONSTANTINE">CONSTANTINE</SelectItem>
                    <SelectItem value="MEDEA">MEDEA</SelectItem>
                    <SelectItem value="MOSTAGANEM">MOSTAGANEM</SelectItem>
                    <SelectItem value="M'SILA">M'SILA</SelectItem>
                    <SelectItem value="MASCARA">MASCARA</SelectItem>
                    <SelectItem value="OUARGLA">OUARGLA</SelectItem>
                    <SelectItem value="ORAN">ORAN</SelectItem>
                    <SelectItem value="EL BAYADH">EL BAYADH</SelectItem>
                    <SelectItem value="ILLIZI">ILLIZI</SelectItem>
                    <SelectItem value="BORDJ BOU ARRERIDJ">BORDJ BOU ARRERIDJ</SelectItem>
                    <SelectItem value="BOUMERDES">BOUMERDES</SelectItem>
                    <SelectItem value="EL TARF">EL TARF</SelectItem>
                    <SelectItem value="TINDOUF">TINDOUF</SelectItem>
                    <SelectItem value="TISSEMSILT">TISSEMSILT</SelectItem>
                    <SelectItem value="EL OUED">EL OUED</SelectItem>
                    <SelectItem value="KHENCHELA">KHENCHELA</SelectItem>
                    <SelectItem value="SOUK AHRAS">SOUK AHRAS</SelectItem>
                    <SelectItem value="TIPAZA">TIPAZA</SelectItem>
                    <SelectItem value="MILA">MILA</SelectItem>
                    <SelectItem value="AIN DEFLA">AIN DEFLA</SelectItem>
                    <SelectItem value="NAAMA">NAAMA</SelectItem>
                    <SelectItem value="AIN TEMOUCHENT">AIN TEMOUCHENT</SelectItem>
                    <SelectItem value="GHARDAIA">GHARDAIA</SelectItem>
                    <SelectItem value="RELIZANE">RELIZANE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="paymentMethod">Méthode de paiement</Label>
                <Select onValueChange={(value) => setOrderData({ ...orderData, paymentMethod: value })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionner une méthode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash_on_delivery">Paiement à la livraison</SelectItem>
                    <SelectItem value="baridimob">BaridiMob</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setShowAddressForm(false)}>
                  Annuler
                </Button>
                <Button onClick={() => handlePlaceOrder(orderData)} disabled={isPlacingOrder}>
                  {isPlacingOrder ? "Paiement..." : "Confirmer la commande"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Cart;
