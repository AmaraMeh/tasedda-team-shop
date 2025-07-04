
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import LanguageSelector from '@/components/LanguageSelector';
import { Menu, ShoppingCart, User, LogOut, Settings, Crown, Users, Store, Package, MapPin } from 'lucide-react';

const Header = () => {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const { items, getCartCount } = useCart();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  console.log('Header: cart items count:', getCartCount());

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

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleCartClick = () => {
    console.log('Cart button clicked, navigating to /cart');
    navigate('/cart');
  };

  const navigationItems = [
    { label: t('common.products'), href: '/products' },
    { 
      label: t('common.localSellers'), 
      href: '/local-sellers',
      icon: MapPin 
    },
    { 
      label: t('common.wholesalers'), 
      href: '/wholesalers',
      icon: Package 
    },
  ];

  // Add conditional navigation items
  if (userRole !== 'team') {
    navigationItems.push({ label: t('common.joinTeam'), href: '/team' });
  }
  if (userRole !== 'seller') {
    navigationItems.push({ label: t('common.becomeSeller'), href: '/seller' });
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gold/20 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-7 w-7 sm:h-8 sm:w-8 bg-gradient-to-r from-gold to-yellow-600 rounded-full flex items-center justify-center">
              <span className="text-black font-bold text-xs sm:text-sm">L</span>
            </div>
            <span className="font-bold text-lg sm:text-xl gold-text">Lion</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-4 xl:space-x-6">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="text-sm font-medium text-muted-foreground hover:text-gold transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                {item.icon && <item.icon className="h-4 w-4" />}
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="hidden sm:block">
              <LanguageSelector />
            </div>
            
            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-gold/10 h-9 w-9 sm:h-10 sm:w-10"
              onClick={handleCartClick}
            >
              <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
              {getCartCount() > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 rounded-full p-0 flex items-center justify-center bg-gold text-black text-xs">
                  {getCartCount()}
                </Badge>
              )}
            </Button>

            {/* User menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:bg-gold/10 h-9 w-9 sm:h-10 sm:w-10">
                    <User className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 sm:w-56 bg-black border-gold/20">
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <Settings className="mr-2 h-4 w-4" />
                    {t('common.profile')}
                  </DropdownMenuItem>
                  
                  {userRole === 'admin' && (
                    <DropdownMenuItem onClick={() => navigate('/admin')}>
                      <Crown className="mr-2 h-4 w-4" />
                      {t('common.admin')}
                    </DropdownMenuItem>
                  )}
                  
                  {userRole === 'team' && (
                    <DropdownMenuItem onClick={() => navigate('/team-space')}>
                      <Users className="mr-2 h-4 w-4" />
                      {t('common.teamSpace')}
                    </DropdownMenuItem>
                  )}
                  
                  {userRole === 'seller' && (
                    <DropdownMenuItem onClick={() => navigate('/seller-space')}>
                      <Store className="mr-2 h-4 w-4" />
                      {t('common.sellerSpace')}
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    {t('common.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => navigate('/auth')} className="btn-gold text-sm px-3 py-2">
                {t('common.login')}
              </Button>
            )}

            {/* Mobile menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden hover:bg-gold/10 h-9 w-9">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 sm:w-80 bg-black border-gold/20">
                <div className="flex flex-col h-full">
                  <div className="mb-6">
                    <LanguageSelector />
                  </div>
                  <nav className="flex flex-col space-y-4">
                    {navigationItems.map((item) => (
                      <Link
                        key={item.href}
                        to={item.href}
                        className="text-lg font-medium text-muted-foreground hover:text-gold transition-colors flex items-center gap-3 p-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.icon && <item.icon className="h-5 w-5" />}
                        {item.label}
                      </Link>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
