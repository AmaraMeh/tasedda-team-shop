
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, User, ShoppingBag, Crown, Store } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isTeamMember, setIsTeamMember] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      checkUserRoles(user.id);
    }
  }, [user]);

  const checkUserRoles = async (userId: string) => {
    // Vérifier si admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .single();
    setIsAdmin(profile?.is_admin || false);

    // Vérifier si membre de la team
    const { data: teamMember } = await supabase
      .from('team_members')
      .select('id')
      .eq('user_id', userId)
      .single();
    setIsTeamMember(!!teamMember);

    // Vérifier si vendeur
    const { data: seller } = await supabase
      .from('sellers')
      .select('id')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();
    setIsSeller(!!seller);
  };

  const navLinks = [
    { href: '/', label: 'Accueil' },
    { href: '/products', label: 'Produits' },
    { href: '/about', label: 'À propos' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-b border-gold/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Crown className="h-8 w-8 text-gold" />
            <span className="text-2xl font-display font-bold gold-text">Lion</span>
            <span className="text-sm text-muted-foreground hidden sm:block">by Tasedda</span>
          </Link>

          {/* Navigation Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-white/80 hover:text-gold transition-colors font-medium"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-2">
                {isAdmin && (
                  <Button
                    onClick={() => navigate('/admin')}
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Admin
                  </Button>
                )}
                {isTeamMember && (
                  <Button
                    onClick={() => navigate('/team-space')}
                    size="sm"
                    className="bg-gold/20 hover:bg-gold/30 text-gold border-gold/20"
                  >
                    <Crown className="h-4 w-4 mr-1" />
                    Team
                  </Button>
                )}
                {isSeller && (
                  <Button
                    onClick={() => navigate('/seller-space')}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Store className="h-4 w-4 mr-1" />
                    Boutique
                  </Button>
                )}
                <Button
                  onClick={() => navigate('/profile')}
                  size="sm"
                  variant="outline"
                  className="border-gold/20 text-gold hover:bg-gold/10"
                >
                  <User className="h-4 w-4 mr-1" />
                  Profil
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => navigate('/team')}
                  size="sm"
                  className="bg-gold/20 hover:bg-gold/30 text-gold border-gold/20"
                >
                  <Crown className="h-4 w-4 mr-1" />
                  Rejoindre Team
                </Button>
                <Button
                  onClick={() => navigate('/seller')}
                  size="sm"
                  variant="outline"
                  className="border-gold/20 text-gold hover:bg-gold/10"
                >
                  <Store className="h-4 w-4 mr-1" />
                  Vendre
                </Button>
                <Button
                  onClick={() => navigate('/auth')}
                  size="sm"
                  className="btn-gold"
                >
                  <User className="h-4 w-4 mr-1" />
                  Connexion
                </Button>
              </div>
            )}

            {/* Menu Mobile */}
            <button
              className="md:hidden p-2 text-white/80 hover:text-gold"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Menu Mobile */}
        {isOpen && (
          <div className="md:hidden bg-black/95 border-t border-gold/20 py-4">
            <nav className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-white/80 hover:text-gold transition-colors px-4 py-2"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
