import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { ShoppingCart, User, LogOut, Menu, X } from 'lucide-react';
import Cart from '../Cart';
import Checkout from '../Checkout';
import LanguageSelector from '../LanguageSelector';

const Header = () => {
  const { user, signOut } = useAuth();
  const { getCartCount } = useCart();
  const { t } = useTranslation();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      checkUserRole();
    }
  }, [user]);

  const checkUserRole = async () => {
    if (!user) return;

    // Check if admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (profile?.is_admin) {
      setUserRole('admin');
      return;
    }

    // Check if team member
    const { data: teamMember } = await supabase
      .from('team_members')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (teamMember) {
      setUserRole('team');
      return;
    }

    // Check if seller
    const { data: seller } = await supabase
      .from('sellers')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (seller) {
      setUserRole('seller');
      return;
    }

    setUserRole('user');
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const openCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-sm border-b border-gold/20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="gold-gradient h-8 w-8 rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-lg">L</span>
              </div>
              <span className="font-display text-2xl font-bold gold-text">Lion</span>
            </Link>

            {/* Navigation Desktop */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/products" className="text-white hover:text-gold transition-colors">
                {t('common.products')}
              </Link>
              {userRole !== 'team' && userRole !== 'seller' && (
                <>
                  <Link to="/team" className="text-white hover:text-gold transition-colors">
                    {t('common.joinTeam')}
                  </Link>
                  <Link to="/seller" className="text-white hover:text-gold transition-colors">
                    {t('common.becomeSeller')}
                  </Link>
                </>
              )}
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              {/* Language Selector */}
              <LanguageSelector />

              {/* Cart */}
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

              {/* User Actions */}
              {user ? (
                <div className="hidden md:flex items-center space-x-2">
                  {userRole === 'admin' && (
                    <Button asChild variant="outline" size="sm" className="border-gold/20 text-gold">
                      <Link to="/admin">{t('common.admin')}</Link>
                    </Button>
                  )}
                  {userRole === 'team' && (
                    <Button asChild variant="outline" size="sm" className="border-gold/20 text-gold">
                      <Link to="/team-space">{t('common.teamSpace')}</Link>
                    </Button>
                  )}
                  {userRole === 'seller' && (
                    <Button asChild variant="outline" size="sm" className="border-gold/20 text-gold">
                      <Link to="/seller-space">{t('common.sellerSpace')}</Link>
                    </Button>
                  )}
                  <Button asChild variant="ghost" size="sm" className="text-white hover:text-gold">
                    <Link to="/profile">
                      <User className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-white hover:text-gold"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="hidden md:flex items-center space-x-2">
                  <Button asChild variant="ghost" size="sm" className="text-white hover:text-gold">
                    <Link to="/auth">{t('common.login')}</Link>
                  </Button>
                  <Button asChild size="sm" className="btn-gold">
                    <Link to="/auth">{t('common.register')}</Link>
                  </Button>
                </div>
              )}

              {/* Mobile Menu Button */}
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

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-gold/20 py-4">
              <nav className="flex flex-col space-y-4">
                <Link
                  to="/products"
                  className="text-white hover:text-gold transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('common.products')}
                </Link>
                {userRole !== 'team' && userRole !== 'seller' && (
                  <>
                    <Link
                      to="/team"
                      className="text-white hover:text-gold transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t('common.joinTeam')}
                    </Link>
                    <Link
                      to="/seller"
                      className="text-white hover:text-gold transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t('common.becomeSeller')}
                    </Link>
                  </>
                )}
                
                {user ? (
                  <div className="flex flex-col space-y-2 pt-4 border-t border-gold/20">
                    {userRole === 'admin' && (
                      <Link to="/admin" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="outline" size="sm" className="w-full border-gold/20 text-gold">
                          {t('common.admin')}
                        </Button>
                      </Link>
                    )}
                    {userRole === 'team' && (
                      <Link to="/team-space" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="outline" size="sm" className="w-full border-gold/20 text-gold">
                          {t('common.teamSpace')}
                        </Button>
                      </Link>
                    )}
                    {userRole === 'seller' && (
                      <Link to="/seller-space" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="outline" size="sm" className="w-full border-gold/20 text-gold">
                          {t('common.sellerSpace')}
                        </Button>
                      </Link>
                    )}
                    <Link to="/profile" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full text-white hover:text-gold justify-start">
                        <User className="h-4 w-4 mr-2" />
                        {t('common.profile')}
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-white hover:text-gold justify-start"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      {t('common.logout')}
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-2 pt-4 border-t border-gold/20">
                    <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full text-white hover:text-gold">
                        {t('common.login')}
                      </Button>
                    </Link>
                    <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                      <Button size="sm" className="w-full btn-gold">
                        {t('common.register')}
                      </Button>
                    </Link>
                  </div>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      <Cart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)}
        onCheckout={openCheckout}
      />
      
      <Checkout 
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />
    </>
  );
};

export default Header;
