
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, User, ShoppingBag, Menu, X } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="gold-gradient h-8 w-8 rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-lg">T</span>
            </div>
            <span className="font-display text-2xl font-bold gold-text">Tasedda</span>
          </Link>

          {/* Navigation Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/boutique" className="text-foreground/80 hover:text-primary transition-colors">
              Boutique
            </Link>
            <Link to="/categories" className="text-foreground/80 hover:text-primary transition-colors">
              Catégories
            </Link>
            <Link to="/team" className="text-foreground/80 hover:text-primary transition-colors">
              Rejoindre Team
            </Link>
            <Link to="/vendeurs" className="text-foreground/80 hover:text-primary transition-colors">
              Espace Vendeurs
            </Link>
          </nav>

          {/* Barre de recherche */}
          <div className="hidden lg:flex items-center space-x-2 flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Rechercher des vêtements..." 
                className="pl-10 bg-card border-border"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="text-foreground/80 hover:text-primary">
              <User className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="relative text-foreground/80 hover:text-primary">
              <ShoppingBag className="h-5 w-5" />
              <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-primary text-primary-foreground text-xs">
                2
              </Badge>
            </Button>
            
            {/* Menu mobile */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Menu mobile */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border/40 py-4">
            <nav className="flex flex-col space-y-4">
              <Link to="/boutique" className="text-foreground/80 hover:text-primary transition-colors">
                Boutique
              </Link>
              <Link to="/categories" className="text-foreground/80 hover:text-primary transition-colors">
                Catégories
              </Link>
              <Link to="/team" className="text-foreground/80 hover:text-primary transition-colors">
                Rejoindre Team
              </Link>
              <Link to="/vendeurs" className="text-foreground/80 hover:text-primary transition-colors">
                Espace Vendeurs
              </Link>
              <div className="pt-2">
                <Input placeholder="Rechercher des vêtements..." className="bg-card border-border" />
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
