
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Profile from '@/pages/Profile';
import Products from '@/pages/Products';
import Cart from '@/pages/Cart';
import LocalSellers from '@/pages/LocalSellers';
import Wholesalers from '@/pages/Wholesalers';
import Shop from '@/pages/Shop';
import Team from '@/pages/Team';
import TeamSpace from '@/pages/TeamSpace';
import Seller from '@/pages/Seller';
import SellerSpace from '@/pages/SellerSpace';
import Admin from '@/pages/Admin';
import NotFound from '@/pages/NotFound';
import TeamJoin from '@/pages/team/TeamJoin';
import TeamAdvantages from '@/pages/team/TeamAdvantages';
import TeamCommissions from '@/pages/team/TeamCommissions';
import HelpCenter from '@/pages/support/HelpCenter';
import Contact from '@/pages/support/Contact';
import Shipping from '@/pages/support/Shipping';
import Returns from '@/pages/support/Returns';
import './App.css';
import './i18n';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/products" element={<Products />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/local-sellers" element={<LocalSellers />} />
              <Route path="/wholesalers" element={<Wholesalers />} />
              <Route path="/shop/:slug" element={<Shop />} />
              <Route path="/team" element={<Team />} />
              <Route path="/team/join" element={<TeamJoin />} />
              <Route path="/team/advantages" element={<TeamAdvantages />} />
              <Route path="/team/commissions" element={<TeamCommissions />} />
              <Route path="/team-space" element={<TeamSpace />} />
              <Route path="/seller" element={<Seller />} />
              <Route path="/seller-space" element={<SellerSpace />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/support" element={<HelpCenter />} />
              <Route path="/support/contact" element={<Contact />} />
              <Route path="/support/shipping" element={<Shipping />} />
              <Route path="/support/returns" element={<Returns />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
