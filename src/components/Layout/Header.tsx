import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { User, LogOut, ShoppingBag, Menu, X, Crown, Store, Shield } from 'lucide-react';
import type { User as AuthUser } from '@supabase/supabase-js';
import { useAuth } from '@/contexts/AuthContext';

const Header = () => {
  const { user, loading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userType, setUserType] = useState<'team' | 'seller' | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && user) {
      checkUserType(user.id);
    } else if (!loading && !user) {
      setUserType(null);
    }
  }, [user, loading]);

  const checkUserType = async (userId: string) => {
    try {
      // Vérifier si l'utilisateur est un membre d'équipe
      const { data: teamMember } = await supabase
        .from('team_members')
        .select('id')
        .eq('user_id', userId)
        .single();

      // Vérifier si l'utilisateur est un vendeur
      const { data: seller } = await supabase
        .from('sellers')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (teamMember && seller) {
        setUserType('team'); // Priorité à Team si les deux existent
      } else if (teamMember) {
        setUserType('team');
      } else if (seller) {
        setUserType('seller');
      } else {
        setUserType(null);
      }
    } catch (error) {
      console.error('Error checking user type:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt sur Tasedda !",
      });
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Erreur de déconnexion",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getDashboardLink = () => {
    if (userType === 'team') return '/team-space';
    if (userType === 'seller') return '/seller-space';
    return '/profile';
  };

  const getDashboardLabel = () => {
    if (userType === 'team') return 'Espace Team';
    if (userType === 'seller') return 'Espace Vendeur';
    return 'Mon Profil';
  };

  const getDashboardIcon = () => {
    if (userType === 'team') return <Crown className="h-4 w-4" />;
    if (userType === 'seller') return <Store className="h-4 w-4" />;
    return <User className="h-4 w-4" />;
  };

  return (
    <header className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="gold-gradient h-10 w-10 rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-xl">T</span>
            </div>
            <span className="font-display text-2xl font-bold gold-text">Tasedda</span>
          </Link>

          {/* Navigation Desktop */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              Accueil
            </Link>
            <Link 
              to="/team" 
              className="text-foreground hover:text-primary transition-colors font-medium flex items-center"
            >
              <Crown className="h-4 w-4 mr-1" />
              Team Tasedda
            </Link>
            <Link 
              to="/seller" 
              className="text-foreground hover:text-primary transition-colors font-medium flex items-center"
            >
              <Store className="h-4 w-4 mr-1" />
              Devenir Vendeur
            </Link>
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Panier
                  <Badge variant="secondary" className="ml-2">0</Badge>
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate(getDashboardLink())}
                  className="flex items-center"
                >
                  {getDashboardIcon()}
                  <span className="ml-2">{getDashboardLabel()}</span>
                  {userType && (
                    <Badge variant="secondary" className="ml-2">
                      {userType === 'team' ? 'Team' : 'Vendeur'}
                    </Badge>
                  )}
                </Button>
                
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Déconnexion
                </Button>

                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/admin')}
                  className="text-gold/60 hover:text-gold"
                >
                  <Shield className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Button variant="outline" onClick={() => navigate('/auth')}>
                  Connexion
                </Button>
                <Button className="btn-gold" onClick={() => navigate('/auth')}>
                  Inscription
                </Button>
              </div>
            )}
          </div>

          {/* Menu Mobile */}
          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Menu Mobile Ouvert */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border pt-4">
            <div className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className="text-foreground hover:text-primary transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Accueil
              </Link>
              <Link 
                to="/team" 
                className="text-foreground hover:text-primary transition-colors font-medium flex items-center"
                onClick={() => setIsMenuOpen(false)}
              >
                <Crown className="h-4 w-4 mr-1" />
                Team Tasedda
              </Link>
              <Link 
                to="/seller" 
                className="text-foreground hover:text-primary transition-colors font-medium flex items-center"
                onClick={() => setIsMenuOpen(false)}
              >
                <Store className="h-4 w-4 mr-1" />
                Devenir Vendeur
              </Link>
              
              {user ? (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="justify-start"
                    onClick={() => {
                      navigate(getDashboardLink());
                      setIsMenuOpen(false);
                    }}
                  >
                    {getDashboardIcon()}
                    <span className="ml-2">{getDashboardLabel()}</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="justify-start"
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Déconnexion
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    className="justify-start"
                    onClick={() => {
                      navigate('/auth');
                      setIsMenuOpen(false);
                    }}
                  >
                    Connexion
                  </Button>
                  <Button 
                    className="btn-gold justify-start"
                    onClick={() => {
                      navigate('/auth');
                      setIsMenuOpen(false);
                    }}
                  >
                    Inscription
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
