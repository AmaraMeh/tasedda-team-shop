
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Crown, Users, Package, ShoppingCart, UserCheck, Gift, TrendingUp, MessageSquare, CreditCard, Tag, Truck, Star } from 'lucide-react';
import Dashboard from './Dashboard';
import Users from './Users';
import Products from './Products';
import Orders from './Orders';
import TeamRequests from './TeamRequests';
import TeamMembers from './TeamMembers';
import SellerRequests from './SellerRequests';
import Sellers from './Sellers';
import Primes from './Primes';
import Chat from './Chat';
import Homepage from './Homepage';
import Commissions from './Commissions';
import Withdrawals from './Withdrawals';
import PromoCodesUsed from './PromoCodesUsed';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black py-6">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Crown className="h-8 w-8 text-gold" />
            <h1 className="text-3xl md:text-4xl font-bold gold-text">Panel Administrateur</h1>
            <Crown className="h-8 w-8 text-gold" />
          </div>
          <p className="text-muted-foreground">Gérez votre plateforme e-commerce</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 xl:grid-cols-15 gap-1 h-auto p-1 bg-black/40 border border-gold/20">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-gold data-[state=active]:text-black text-xs p-2">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-gold data-[state=active]:text-black text-xs p-2">
              <Users className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Utilisateurs</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="data-[state=active]:bg-gold data-[state=active]:text-black text-xs p-2">
              <Package className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Produits</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-gold data-[state=active]:text-black text-xs p-2">
              <ShoppingCart className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Commandes</span>
            </TabsTrigger>
            <TabsTrigger value="team-requests" className="data-[state=active]:bg-gold data-[state=active]:text-black text-xs p-2">
              <UserCheck className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Demandes Team</span>
            </TabsTrigger>
            <TabsTrigger value="team-members" className="data-[state=active]:bg-gold data-[state=active]:text-black text-xs p-2">
              <Users className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Team</span>
            </TabsTrigger>
            <TabsTrigger value="seller-requests" className="data-[state=active]:bg-gold data-[state=active]:text-black text-xs p-2">
              <Star className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Demandes Vendeur</span>
            </TabsTrigger>
            <TabsTrigger value="sellers" className="data-[state=active]:bg-gold data-[state=active]:text-black text-xs p-2">
              <Package className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Vendeurs</span>
            </TabsTrigger>
            <TabsTrigger value="commissions" className="data-[state=active]:bg-gold data-[state=active]:text-black text-xs p-2">
              <CreditCard className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Commissions</span>
            </TabsTrigger>
            <TabsTrigger value="withdrawals" className="data-[state=active]:bg-gold data-[state=active]:text-black text-xs p-2">
              <CreditCard className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Retraits</span>
            </TabsTrigger>
            <TabsTrigger value="promo-codes" className="data-[state=active]:bg-gold data-[state=active]:text-black text-xs p-2">
              <Tag className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Codes Promo</span>
            </TabsTrigger>
            <TabsTrigger value="primes" className="data-[state=active]:bg-gold data-[state=active]:text-black text-xs p-2">
              <Gift className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Primes</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="data-[state=active]:bg-gold data-[state=active]:text-black text-xs p-2">
              <MessageSquare className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Chat</span>
            </TabsTrigger>
            <TabsTrigger value="homepage" className="data-[state=active]:bg-gold data-[state=active]:text-black text-xs p-2">
              <Star className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Accueil</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Dashboard />
          </TabsContent>

          <TabsContent value="users">
            <Users />
          </TabsContent>

          <TabsContent value="products">
            <Products />
          </TabsContent>

          <TabsContent value="orders">
            <Orders />
          </TabsContent>

          <TabsContent value="team-requests">
            <TeamRequests />
          </TabsContent>

          <TabsContent value="team-members">
            <TeamMembers />
          </TabsContent>

          <TabsContent value="seller-requests">
            <SellerRequests />
          </TabsContent>

          <TabsContent value="sellers">
            <Sellers />
          </TabsContent>

          <TabsContent value="commissions">
            <Commissions />
          </TabsContent>

          <TabsContent value="withdrawals">
            <Withdrawals />
          </TabsContent>

          <TabsContent value="promo-codes">
            <PromoCodesUsed />
          </TabsContent>

          <TabsContent value="primes">
            <Primes />
          </TabsContent>

          <TabsContent value="chat">
            <Chat />
          </TabsContent>

          <TabsContent value="homepage">
            <Homepage />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;
