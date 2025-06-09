
import { Suspense, lazy } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import Index from './pages/Index';

const queryClient = new QueryClient();

// Lazy loading des pages
const Auth = lazy(() => import('./pages/Auth'));
const Products = lazy(() => import('./pages/Products'));
const Team = lazy(() => import('./pages/Team'));
const TeamAdvantages = lazy(() => import('./pages/team/TeamAdvantages'));
const TeamCommissions = lazy(() => import('./pages/team/TeamCommissions'));
const TeamSpace = lazy(() => import('./pages/TeamSpace'));
const Seller = lazy(() => import('./pages/Seller'));
const SellerSpace = lazy(() => import('./pages/SellerSpace'));
const Shop = lazy(() => import('./pages/Shop'));
const Profile = lazy(() => import('./pages/Profile'));
const Admin = lazy(() => import('./pages/Admin'));
const HelpCenter = lazy(() => import('./pages/support/HelpCenter'));
const Contact = lazy(() => import('./pages/support/Contact'));
const Shipping = lazy(() => import('./pages/support/Shipping'));
const Returns = lazy(() => import('./pages/support/Returns'));
const NotFound = lazy(() => import('./pages/NotFound'));

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Suspense fallback={
                <div className="min-h-screen bg-black flex items-center justify-center">
                  <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gold"></div>
                </div>
              }>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/team" element={<Team />} />
                  <Route path="/team/advantages" element={<TeamAdvantages />} />
                  <Route path="/team/commissions" element={<TeamCommissions />} />
                  <Route path="/team-space" element={<TeamSpace />} />
                  <Route path="/seller" element={<Seller />} />
                  <Route path="/seller-space" element={<SellerSpace />} />
                  <Route path="/shop/:slug" element={<Shop />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/support/help" element={<HelpCenter />} />
                  <Route path="/support/contact" element={<Contact />} />
                  <Route path="/support/shipping" element={<Shipping />} />
                  <Route path="/support/returns" element={<Returns />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
