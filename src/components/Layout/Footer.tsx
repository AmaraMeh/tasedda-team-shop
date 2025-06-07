
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo et description */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="gold-gradient h-8 w-8 rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-lg">T</span>
              </div>
              <span className="font-display text-2xl font-bold gold-text">Tasedda</span>
            </Link>
            <p className="text-muted-foreground text-sm">
              Votre destination premium pour la mode en Algérie. Découvrez des vêtements de qualité avec notre système d'affiliation unique.
            </p>
          </div>

          {/* Boutique */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Boutique</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/homme" className="hover:text-primary transition-colors">Homme</Link></li>
              <li><Link to="/femme" className="hover:text-primary transition-colors">Femme</Link></li>
              <li><Link to="/enfant" className="hover:text-primary transition-colors">Enfant</Link></li>
              <li><Link to="/accessoires" className="hover:text-primary transition-colors">Accessoires</Link></li>
            </ul>
          </div>

          {/* Team & Affiliation */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Team Tasedda</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/team/rejoindre" className="hover:text-primary transition-colors">Rejoindre la Team</Link></li>
              <li><Link to="/team/avantages" className="hover:text-primary transition-colors">Avantages</Link></li>
              <li><Link to="/team/commissions" className="hover:text-primary transition-colors">Commissions</Link></li>
              <li><Link to="/vendeurs" className="hover:text-primary transition-colors">Devenir Vendeur</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/aide" className="hover:text-primary transition-colors">Centre d'aide</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
              <li><Link to="/livraison" className="hover:text-primary transition-colors">Livraison</Link></li>
              <li><Link to="/retours" className="hover:text-primary transition-colors">Retours</Link></li>
            </ul>
          </div>
        </div>

        {/* Meilleur contributeur du mois */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="text-center">
            <h3 className="font-display text-xl font-semibold gold-text mb-4">
              🏆 Contributeur du Mois
            </h3>
            <div className="bg-gradient-to-r from-gold/10 to-gold-light/10 rounded-lg p-6 max-w-md mx-auto">
              <div className="flex items-center justify-center space-x-4">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground font-bold">AM</span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Amina M.</p>
                  <p className="text-sm text-muted-foreground">47 ventes confirmées</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Tasedda. Tous droits réservés. Made with ❤️ in Algeria</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
