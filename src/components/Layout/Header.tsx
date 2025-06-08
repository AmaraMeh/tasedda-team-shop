
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Crown, ShoppingCart, User, Menu, X, Store, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import Cart from '@/components/Cart';
import Checkout from '@/components/Checkout';

const Header = () => {
  const { user, logout } = useAuth();
  const { getCartCount } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [userRole, setUserRole] = useState<{isTeam: boolean, isSeller: boolean, isAdmin: boolean}>({
    isTeam: false,
    isSeller: false,
    isAdmin: false
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      checkUserRoles();
    }
  }, [user]);

  const checkUserRoles = async () => {
    if (!user) return;

    try {
      // Vérifier si admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      // Vérifier si membre team
      const { data: teamMember } = await supabase
        .from('team_members')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      // Vérifier si vendeur
      const { data: seller } = await supabase
        .from('sellers')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      setUserRole({
        isAdmin: profile?.is_admin || false,
        isTeam: !!teamMember,
        isSeller: !!seller
      });
    } catch (error) {
      console.error('Error checking user roles:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <>
      <header className="fixed top-0 w-full z-40 glass-effect border-b border-gold/20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <Crown className="h-8 w-8 text-gold" />
              <span className="text-xl font-display font-bold gold-text">Lion</span>
            </Link>

            {/* Navigation Desktop */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/products" className="text-white hover:text-gold transition-colors">
                Produits
              </Link>
              
              {user && userRole.isTeam && (
                <Link to="/team-space" className="flex items-center space-x-1 text-white hover:text-gold transition-colors">
                  <Users className="h-4 w-4" />
                  <span>Espace Team</span>
                </Link>
              )}
              
              {user && userRole.isSeller && (
                <Link to="/seller-space" className="flex items-center space-x-1 text-white hover:text-gold transition-colors">
                  <Store className="h-4 w-4" />
                  <span>Espace Vendeur</span>
                </Link>
              )}

              {!user && (
                <>
                  <Link to="/team" className="text-white hover:text-gold transition-colors">
                    Team Lion
                  </Link>
                  <Link to="/seller" className="text-white hover:text-gold transition-colors">
                    Devenir Vendeur
                  </Link>
                </>
              )}
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              {/* Panier */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCartOpen(true)}
                className="relative text-white hover:text-gold"
              >
                <ShoppingCart className="h-5 w-5" />
                {getCartCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gold text-black text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {getCartCount()}
                  </span>
                )}
              </Button>

              {/* Utilisateur */}
              {user ? (
                <div className="hidden md:flex items-center space-x-2">
                  {userRole.isAdmin && (
                    <Link to="/admin">
                      <Button size="sm" className="bg-gold/20 hover:bg-gold/30 text-gold border-gold/20">
                        Admin
                      </Button>
                    </Link>
                  )}
                  <Link to="/profile">
                    <Button variant="ghost" size="sm" className="text-white hover:text-gold">
                      <User className="h-4 w-4 mr-1" />
                      Profil
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="border-gold/20 text-gold hover:bg-gold/10"
                  >
                    Déconnexion
                  </Button>
                </div>
              ) : (
                <div className="hidden md:flex items-center space-x-2">
                  <Link to="/auth">
                    <Button variant="outline" size="sm" className="border-gold/20 text-gold hover:bg-gold/10">
                      Connexion
                    </Button>
                  </Link>
                </div>
              )}

              {/* Menu Mobile */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden text-white"
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Menu Mobile */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gold/20">
              <nav className="flex flex-col space-y-2">
                <Link
                  to="/products"
                  className="px-4 py-2 text-white hover:text-gold transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Produits
                </Link>
                
                {user && userRole.isTeam && (
                  <Link
                    to="/team-space"
                    className="px-4 py-2 text-white hover:text-gold transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Espace Team
                  </Link>
                )}
                
                {user && userRole.isSeller && (
                  <Link
                    to="/seller-space"
                    className="px-4 py-2 text-white hover:text-gold transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Espace Vendeur
                  </Link>
                )}

                {!user && (
                  <>
                    <Link
                      to="/team"
                      className="px-4 py-2 text-white hover:text-gold transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Team Lion
                    </Link>
                    <Link
                      to="/seller"
                      className="px-4 py-2 text-white hover:text-gold transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Devenir Vendeur
                    </Link>
                  </>
                )}

                {user ? (
                  <>
                    {userRole.isAdmin && (
                      <Link
                        to="/admin"
                        className="px-4 py-2 text-gold hover:text-gold/80 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Admin Panel
                      </Link>
                    )}
                    <Link
                      to="/profile"
                      className="px-4 py-2 text-white hover:text-gold transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Profil
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="px-4 py-2 text-left text-white hover:text-gold transition-colors"
                    >
                      Déconnexion
                    </button>
                  </>
                ) : (
                  <Link
                    to="/auth"
                    className="px-4 py-2 text-gold hover:text-gold/80 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Connexion
                  </Link>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Composants Modal */}
      <Cart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)}
        onCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />
      
      <Checkout 
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderComplete={() => {
          // Rediriger vers la page de confirmation ou profil
          if (user) {
            navigate('/profile');
          }
        }}
      />
    </>
  );
};

export default Header;
