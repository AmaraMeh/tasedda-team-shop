
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { 
  NavigationMenu, 
  NavigationMenuContent, 
  NavigationMenuItem, 
  NavigationMenuList, 
  NavigationMenuTrigger 
} from '@/components/ui/navigation-menu';
import { Menu, X, User, Crown, Store, ShoppingBag } from 'lucide-react';
import type { User as AuthUser } from '@supabase/supabase-js';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <header className="fixed top-0 w-full z-50 glass-effect border-b border-gold/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 gold-gradient rounded-full flex items-center justify-center">
              <span className="text-black font-bold text-lg">T</span>
            </div>
            <span className="text-xl font-display font-bold gold-text">Tasedda</span>
          </Link>

          {/* Navigation Desktop */}
          <nav className="hidden lg:flex items-center space-x-8">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent text-foreground hover:text-gold">
                    Boutique
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-48 p-4 space-y-2">
                      <Link to="/products" className="block px-3 py-2 hover:bg-gold/10 rounded">
                        Tous les produits
                      </Link>
                      <Link to="/categories/homme" className="block px-3 py-2 hover:bg-gold/10 rounded">
                        Homme
                      </Link>
                      <Link to="/categories/femme" className="block px-3 py-2 hover:bg-gold/10 rounded">
                        Femme
                      </Link>
                      <Link to="/categories/enfant" className="block px-3 py-2 hover:bg-gold/10 rounded">
                        Enfant
                      </Link>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            <Link to="/team" className="hover:text-gold transition-colors">
              Team Tasedda
            </Link>
            <Link to="/seller" className="hover:text-gold transition-colors">
              Espace Vendeur
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="hover:text-gold">
              <ShoppingBag className="h-5 w-5" />
            </Button>

            {user ? (
              <div className="flex items-center space-x-2">
                <Button 
                  onClick={() => navigate('/profile')} 
                  variant="ghost" 
                  size="icon" 
                  className="hover:text-gold"
                >
                  <User className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <Button onClick={() => navigate('/auth')} className="btn-gold">
                Connexion
              </Button>
            )}

            {/* Menu Mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Menu Mobile */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gold/20">
            <nav className="space-y-4">
              <Link 
                to="/products" 
                className="block py-2 hover:text-gold transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Boutique
              </Link>
              <Link 
                to="/team" 
                className="flex items-center py-2 hover:text-gold transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Crown className="h-4 w-4 mr-2" />
                Team Tasedda
              </Link>
              <Link 
                to="/seller" 
                className="flex items-center py-2 hover:text-gold transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Store className="h-4 w-4 mr-2" />
                Espace Vendeur
              </Link>
              {!user && (
                <Button 
                  onClick={() => {
                    navigate('/auth');
                    setIsMenuOpen(false);
                  }} 
                  className="w-full btn-gold mt-4"
                >
                  Connexion
                </Button>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
