
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Dashboard from './Dashboard';
import UsersAdmin from './Users';
import Orders from './Orders';
import Products from './Products';
import Sellers from './Sellers';
import TeamMembers from './TeamMembers';
import TeamRequests from './TeamRequests';
import SellerRequests from './SellerRequests';
import Commissions from './Commissions';
import PromoCodesUsed from './PromoCodesUsed';
import Withdrawals from './Withdrawals';
import Primes from './Primes';
import Homepage from './Homepage';
import Chat from './Chat';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Panel d'Administration</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-7 lg:grid-cols-14 gap-1 bg-gray-900">
            <TabsTrigger value="dashboard" className="text-xs">Dashboard</TabsTrigger>
            <TabsTrigger value="users" className="text-xs">Utilisateurs</TabsTrigger>
            <TabsTrigger value="orders" className="text-xs">Commandes</TabsTrigger>
            <TabsTrigger value="products" className="text-xs">Produits</TabsTrigger>
            <TabsTrigger value="sellers" className="text-xs">Vendeurs</TabsTrigger>
            <TabsTrigger value="team-members" className="text-xs">Équipe</TabsTrigger>
            <TabsTrigger value="team-requests" className="text-xs">Demandes Équipe</TabsTrigger>
            <TabsTrigger value="seller-requests" className="text-xs">Demandes Vendeur</TabsTrigger>
            <TabsTrigger value="commissions" className="text-xs">Commissions</TabsTrigger>
            <TabsTrigger value="promo-codes" className="text-xs">Codes Promo</TabsTrigger>
            <TabsTrigger value="withdrawals" className="text-xs">Retraits</TabsTrigger>
            <TabsTrigger value="primes" className="text-xs">Primes</TabsTrigger>
            <TabsTrigger value="homepage" className="text-xs">Page d'accueil</TabsTrigger>
            <TabsTrigger value="chat" className="text-xs">Chat</TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="dashboard">
              <Dashboard />
            </TabsContent>
            <TabsContent value="users">
              <UsersAdmin />
            </TabsContent>
            <TabsContent value="orders">
              <Orders />
            </TabsContent>
            <TabsContent value="products">
              <Products />
            </TabsContent>
            <TabsContent value="sellers">
              <Sellers />
            </TabsContent>
            <TabsContent value="team-members">
              <TeamMembers />
            </TabsContent>
            <TabsContent value="team-requests">
              <TeamRequests />
            </TabsContent>
            <TabsContent value="seller-requests">
              <SellerRequests />
            </TabsContent>
            <TabsContent value="commissions">
              <Commissions />
            </TabsContent>
            <TabsContent value="promo-codes">
              <PromoCodesUsed />
            </TabsContent>
            <TabsContent value="withdrawals">
              <Withdrawals />
            </TabsContent>
            <TabsContent value="primes">
              <Primes />
            </TabsContent>
            <TabsContent value="homepage">
              <Homepage />
            </TabsContent>
            <TabsContent value="chat">
              <Chat />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;
