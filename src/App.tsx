import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n/config';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Team from "./pages/Team";
import TeamSpace from "./pages/TeamSpace";
import Seller from "./pages/Seller";
import SellerSpace from "./pages/SellerSpace";
import AddProduct from "./pages/AddProduct";
import LocalSellers from "./pages/LocalSellers";
import Wholesalers from "./pages/Wholesalers";
import Shop from "./pages/Shop";
import Admin from "./pages/admin/Admin";
import AdminProducts from "./pages/admin/Products";
import AdminOrders from "./pages/admin/Orders";
import AdminUsers from "./pages/admin/Users";
import AdminSellers from "./pages/admin/Sellers";
import AdminTeamMembers from "./pages/admin/TeamMembers";
import AdminTeamRequests from "./pages/admin/TeamRequests";
import AdminSellerRequests from "./pages/admin/SellerRequests";
import AdminHomepage from "./pages/admin/Homepage";
import AdminChat from "./pages/admin/Chat";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/products" element={<Products />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/team" element={<Team />} />
                <Route path="/team-space" element={<TeamSpace />} />
                <Route path="/seller" element={<Seller />} />
                <Route path="/seller-space" element={<SellerSpace />} />
                <Route path="/add-product" element={<AddProduct />} />
                <Route path="/local-sellers" element={<LocalSellers />} />
                <Route path="/wholesalers" element={<Wholesalers />} />
                <Route path="/shop/:slug" element={<Shop />} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={<Admin />} />
                <Route path="/admin/products" element={<AdminProducts />} />
                <Route path="/admin/orders" element={<AdminOrders />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/sellers" element={<AdminSellers />} />
                <Route path="/admin/team-members" element={<AdminTeamMembers />} />
                <Route path="/admin/team-requests" element={<AdminTeamRequests />} />
                <Route path="/admin/seller-requests" element={<AdminSellerRequests />} />
                <Route path="/admin/homepage" element={<AdminHomepage />} />
                <Route path="/admin/chat" element={<AdminChat />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </I18nextProvider>
  </QueryClientProvider>
);

export default App;
