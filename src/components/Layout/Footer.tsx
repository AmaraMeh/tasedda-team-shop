
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Mail, Phone, Crown } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-black/90 border-t border-gold/20 mt-auto">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Logo et description */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Crown className="h-6 w-6 sm:h-8 sm:w-8 text-gold" />
              <span className="text-lg sm:text-xl font-bold gold-text">TASSEDA</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Votre destination mode premium en Algérie. Qualité, style et élégance au service de votre garde-robe.
            </p>
          </div>

          {/* Liens rapides */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white text-sm sm:text-base">Liens rapides</h3>
            <nav className="flex flex-col space-y-2">
              <Link to="/" className="text-sm text-muted-foreground hover:text-gold transition-colors">
                Accueil
              </Link>
              <Link to="/products" className="text-sm text-muted-foreground hover:text-gold transition-colors">
                Produits
              </Link>
              <Link to="/team" className="text-sm text-muted-foreground hover:text-gold transition-colors">
                Team Lion
              </Link>
              <Link to="/seller" className="text-sm text-muted-foreground hover:text-gold transition-colors">
                Devenir vendeur
              </Link>
            </nav>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white text-sm sm:text-base">Support</h3>
            <nav className="flex flex-col space-y-2">
              <Link to="/support/contact" className="text-sm text-muted-foreground hover:text-gold transition-colors">
                Contact
              </Link>
              <Link to="/support/shipping" className="text-sm text-muted-foreground hover:text-gold transition-colors">
                Livraison
              </Link>
              <Link to="/support/returns" className="text-sm text-muted-foreground hover:text-gold transition-colors">
                Retours
              </Link>
              <Link to="/support/help" className="text-sm text-muted-foreground hover:text-gold transition-colors">
                FAQ
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white text-sm sm:text-base">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gold" />
                <span className="text-sm text-muted-foreground">0657433000</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gold" />
                <span className="text-sm text-muted-foreground">0555688017</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gold" />
                <span className="text-sm text-muted-foreground">marquetasseda@gmail.com</span>
              </div>
              <div className="flex items-center gap-4 pt-2">
                <a 
                  href="https://www.instagram.com/marque_tasseda?igsh=eXM5eHRjeXUyaG1w" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gold hover:text-gold/80 transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a 
                  href="https://www.facebook.com/profile.php?id=61555754131648" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gold hover:text-gold/80 transition-colors"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gold/20 mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 TASSEDA. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
