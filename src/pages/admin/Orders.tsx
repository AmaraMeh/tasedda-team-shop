
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { utils, writeFile } from 'xlsx';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, Clock, Truck, Package, X, Search, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';

const paymentStatusOptions = [
  { value: 'pending', label: 'En attente', color: 'bg-yellow-500' },
  { value: 'paid', label: 'Payé', color: 'bg-green-500' },
  { value: 'failed', label: 'Échoué', color: 'bg-red-500' }
];

const deliveryStatusOptions = [
  { value: 'pending', label: 'En attente', color: 'bg-gray-500' },
  { value: 'processing', label: 'En traitement', color: 'bg-blue-500' },
  { value: 'shipped', label: 'Expédié', color: 'bg-indigo-500' },
  { value: 'delivered', label: 'Livré', color: 'bg-green-500' },
  { value: 'cancelled', label: 'Annulé', color: 'bg-red-500' }
];

const Orders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [userInfo, setUserInfo] = useState<any | null>(null);
  const [editStatus, setEditStatus] = useState({ payment_status: '', delivery_status: '' });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles(full_name, email, phone)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les commandes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch user info and items when modal opens
  useEffect(() => {
    if (selected) {
      // Fetch order items with product info
      supabase
        .from('order_items')
        .select('*, products(name, price, image_url)')
        .eq('order_id', selected.id)
        .then(({ data }) => setOrderItems(data || []));
      
      setEditStatus({
        payment_status: selected.payment_status || 'pending',
        delivery_status: selected.delivery_status || 'pending',
      });
    } else {
      setOrderItems([]);
    }
  }, [selected]);

  const exportCSV = () => {
    const exportData = orders.map(order => ({
      'Numéro de commande': order.order_number,
      'Client': order.profiles?.full_name || 'N/A',
      'Email': order.profiles?.email || 'N/A',
      'Montant total': order.total_amount,
      'Statut paiement': order.payment_status,
      'Statut livraison': order.delivery_status,
      'Date de création': new Date(order.created_at).toLocaleDateString('fr-FR')
    }));
    
    const ws = utils.json_to_sheet(exportData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Commandes');
    writeFile(wb, `commandes_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toast({
      title: "Export réussi",
      description: "Les commandes ont été exportées avec succès",
    });
  };

  const filtered = orders.filter(o => {
    const matchesSearch = 
      (o.order_number || '').toLowerCase().includes(filter.toLowerCase()) ||
      (o.profiles?.full_name || '').toLowerCase().includes(filter.toLowerCase()) ||
      (o.profiles?.email || '').toLowerCase().includes(filter.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || o.payment_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) return;
    
    try {
      const { error } = await supabase.from('orders').delete().eq('id', id);
      if (error) throw error;
      
      setOrders(orders => orders.filter(o => o.id !== id));
      toast({ 
        title: 'Commande supprimée',
        description: 'La commande a été supprimée avec succès'
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la commande",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async () => {
    if (!selected) return;
    
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          payment_status: editStatus.payment_status,
          delivery_status: editStatus.delivery_status,
          updated_at: new Date().toISOString()
        })
        .eq('id', selected.id);
      
      if (error) throw error;
      
      setOrders(orders => orders.map(o => 
        o.id === selected.id 
          ? { ...o, ...editStatus, updated_at: new Date().toISOString() } 
          : o
      ));
      
      toast({ 
        title: 'Commande mise à jour',
        description: 'Les statuts ont été mis à jour avec succès'
      });
      setModalOpen(false);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la commande",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string, type: 'payment' | 'delivery') => {
    const options = type === 'payment' ? paymentStatusOptions : deliveryStatusOptions;
    const option = options.find(opt => opt.value === status);
    return (
      <Badge className={`${option?.color || 'bg-gray-500'} text-white`}>
        {option?.label || status}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'processing': return <Package className="h-4 w-4" />;
      case 'shipped': return <Truck className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <X className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gold"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Gestion des Commandes</h1>
          <p className="text-muted-foreground">
            {filtered.length} commande(s) sur {orders.length} au total
          </p>
        </div>
        <Button onClick={exportCSV} className="btn-gold">
          <Download className="h-4 w-4 mr-2" />
          Exporter Excel
        </Button>
      </div>

      {/* Filters */}
      <Card className="glass-effect border-gold/20">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Rechercher par numéro, nom ou email..."
                className="pl-10 bg-black/50 border-gold/20"
                value={filter}
                onChange={e => setFilter(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-black/50 border-gold/20">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                {paymentStatusOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Grid */}
      <div className="grid gap-4">
        {filtered.length === 0 ? (
          <Card className="glass-effect border-gold/20">
            <CardContent className="text-center py-12">
              <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucune commande trouvée</p>
            </CardContent>
          </Card>
        ) : (
          filtered.map(order => (
            <Card key={order.id} className="glass-effect border-gold/20 hover:border-gold/40 transition-colors">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <span>#{order.order_number}</span>
                      {getStatusIcon(order.delivery_status)}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-muted-foreground">
                        {order.profiles?.full_name || 'Client inconnu'}
                      </span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gold">
                      {order.total_amount.toLocaleString()} DA
                    </div>
                    <div className="flex gap-2 mt-2">
                      {getStatusBadge(order.payment_status, 'payment')}
                      {getStatusBadge(order.delivery_status, 'delivery')}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    <div>Email: {order.profiles?.email || 'N/A'}</div>
                    <div>Téléphone: {order.profiles?.phone || 'N/A'}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => { setSelected(order); setModalOpen(true); }}
                      className="btn-gold"
                    >
                      Détails
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => handleDelete(order.id)}
                    >
                      Supprimer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Order Detail Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="glass-effect border-gold/20 max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogTitle>Détail de la commande #{selected?.order_number}</DialogTitle>
          {selected && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="glass-effect border-gold/20">
                  <CardHeader>
                    <CardTitle>Informations de la commande</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div><strong>Numéro:</strong> {selected.order_number}</div>
                    <div><strong>Date:</strong> {new Date(selected.created_at).toLocaleString('fr-FR')}</div>
                    <div><strong>Montant total:</strong> <span className="text-gold font-bold">{selected.total_amount} DA</span></div>
                    <div><strong>Méthode de paiement:</strong> {selected.payment_method || 'Paiement à la livraison'}</div>
                    {selected.promo_code && (
                      <div><strong>Code promo:</strong> {selected.promo_code}</div>
                    )}
                  </CardContent>
                </Card>

                <Card className="glass-effect border-gold/20">
                  <CardHeader>
                    <CardTitle>Informations client</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div><strong>Nom:</strong> {selected.profiles?.full_name || 'N/A'}</div>
                    <div><strong>Email:</strong> {selected.profiles?.email || 'N/A'}</div>
                    <div><strong>Téléphone:</strong> {selected.profiles?.phone || 'N/A'}</div>
                    {selected.shipping_address && (
                      <div>
                        <strong>Adresse de livraison:</strong>
                        <div className="text-sm text-muted-foreground mt-1">
                          {JSON.stringify(selected.shipping_address, null, 2)}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card className="glass-effect border-gold/20">
                <CardHeader>
                  <CardTitle>Gestion des statuts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Statut paiement</label>
                      <Select 
                        value={editStatus.payment_status} 
                        onValueChange={v => setEditStatus(s => ({ ...s, payment_status: v }))}
                      >
                        <SelectTrigger className="bg-black/50 border-gold/20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {paymentStatusOptions.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Statut livraison</label>
                      <Select 
                        value={editStatus.delivery_status} 
                        onValueChange={v => setEditStatus(s => ({ ...s, delivery_status: v }))}
                      >
                        <SelectTrigger className="bg-black/50 border-gold/20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {delivery,StatusOptions.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-effect border-gold/20">
                <CardHeader>
                  <CardTitle>Produits commandés</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {orderItems.map(item => (
                      <div key={item.id} className="flex items-center gap-4 p-3 bg-black/30 rounded-lg">
                        {item.products?.image_url && (
                          <img 
                            src={item.products.image_url} 
                            alt={item.products.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <div className="font-medium">{item.products?.name || 'Produit inconnu'}</div>
                          <div className="text-sm text-muted-foreground">
                            Quantité: {item.quantity} × {item.price} DA
                            {item.size && ` | Taille: ${item.size}`}
                            {item.color && ` | Couleur: ${item.color}`}
                          </div>
                        </div>
                        <div className="text-gold font-bold">
                          {(item.quantity * item.price).toLocaleString()} DA
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setModalOpen(false)}>
                  Fermer
                </Button>
                <Button onClick={handleEdit} className="btn-gold">
                  Sauvegarder les modifications
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Orders;
