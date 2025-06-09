
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
  const { items } = useCart();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-gradient-to-r from-gold to-yellow-600 rounded-full flex items-center justify-center">
              <span className="text-black font-bold text-sm">L</span>
            </div>
            <span className="font-bold text-xl gold-text">Lion</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="text-sm font-medium text-muted-foreground hover:text-gold transition-colors flex items-center gap-2"
              >
                {item.icon && <item.icon className="h-4 w-4" />}
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            <LanguageSelector />
            
            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-gold/10"
              onClick={() => navigate('/cart')}
            >
              <ShoppingCart className="h-5 w-5" />
              {items.length > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-gold text-black text-xs">
                  {items.reduce((sum, item) => sum + item.quantity, 0)}
                </Badge>
              )}
            </Button>

            {/* User menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:bg-gold/10">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-black border-gold/20">
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
              <Button onClick={() => navigate('/auth')} className="btn-gold">
                {t('common.login')}
              </Button>
            )}

            {/* Mobile menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden hover:bg-gold/10">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-black border-gold/20">
                <nav className="flex flex-col space-y-4 mt-8">
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
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
