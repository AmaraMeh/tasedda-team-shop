
import { Suspense, lazy } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import './i18n';

// Lazy load components for better performance
const Index = lazy(() => import('./pages/Index'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./components/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Profile = lazy(() => import('./pages/Profile'));
const Auth = lazy(() => import('./pages/Auth'));
const Team = lazy(() => import('./pages/Team'));
const TeamSpace = lazy(() => import('./pages/TeamSpace'));
const TeamJoin = lazy(() => import('./pages/team/TeamJoin'));
const TeamAdvantages = lazy(() => import('./pages/team/TeamAdvantages'));
const TeamCommissions = lazy(() => import('./pages/team/TeamCommissions'));
const Seller = lazy(() => import('./pages/Seller'));
const SellerSpace = lazy(() => import('./pages/SellerSpace'));
const LocalSellers = lazy(() => import('./pages/LocalSellers'));
const Wholesalers = lazy(() => import('./pages/Wholesalers'));
const Shop = lazy(() => import('./pages/Shop'));
const Admin = lazy(() => import('./pages/Admin'));
const Contact = lazy(() => import('./pages/support/Contact'));
const HelpCenter = lazy(() => import('./pages/support/HelpCenter'));
const Shipping = lazy(() => import('./pages/support/Shipping'));
const Returns = lazy(() => import('./pages/support/Returns'));
const NotFound = lazy(() => import('./pages/NotFound'));

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <CartProvider>
              <div className="min-h-screen bg-black text-white">
                <Suspense 
                  fallback={
                    <div className="min-h-screen bg-black flex items-center justify-center">
                      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gold"></div>
                    </div>
                  }
                >
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/auth" element={<Auth />} />
                    
                    {/* Team routes */}
                    <Route path="/team" element={<Team />} />
                    <Route path="/team-space" element={<TeamSpace />} />
                    <Route path="/team/join" element={<TeamJoin />} />
                    <Route path="/team/advantages" element={<TeamAdvantages />} />
                    <Route path="/team/commissions" element={<TeamCommissions />} />
                    
                    {/* Seller routes */}
                    <Route path="/seller" element={<Seller />} />
                    <Route path="/seller-space" element={<SellerSpace />} />
                    <Route path="/local-sellers" element={<LocalSellers />} />
                    <Route path="/wholesalers" element={<Wholesalers />} />
                    <Route path="/shop/:slug" element={<Shop />} />
                    
                    {/* Admin routes */}
                    <Route path="/admin/*" element={<Admin />} />
                    
                    {/* Support routes */}
                    <Route path="/support/contact" element={<Contact />} />
                    <Route path="/support/help" element={<HelpCenter />} />
                    <Route path="/support/shipping" element={<Shipping />} />
                    <Route path="/support/returns" element={<Returns />} />
                    
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </div>
            </CartProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
