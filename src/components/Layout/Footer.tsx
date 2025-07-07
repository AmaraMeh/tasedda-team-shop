
import React from 'react';
import { Facebook, Instagram, Phone, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-black border-t border-gold/20 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo et description */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold gold-text">Marque Tasseda</h3>
            <p className="text-muted-foreground text-sm">
              Votre destination premium pour la mode et les accessoires de qualité.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://www.instagram.com/marque_tasseda?igsh=eXM5eHRjeXUyaG1w" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-gold transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a 
                href="https://www.facebook.com/profile.php?id=61555754131648" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-gold transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Navigation rapide */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white">Navigation</h4>
            <div className="space-y-2 text-sm">
              <a href="/products" className="block text-muted-foreground hover:text-gold transition-colors">
                Produits
              </a>
              <a href="/team" className="block text-muted-foreground hover:text-gold transition-colors">
                Rejoindre la Team
              </a>
              <a href="/seller" className="block text-muted-foreground hover:text-gold transition-colors">
                Devenir Vendeur
              </a>
              <a href="/local-sellers" className="block text-muted-foreground hover:text-gold transition-colors">
                Vendeurs Locaux
              </a>
              <a href="/wholesalers" className="block text-muted-foreground hover:text-gold transition-colors">
                Grossistes
              </a>
            </div>
          </div>

          {/* Informations livraison */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white">Livraison</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Livraison dans toute l'Algérie</p>
              <p>Paiement à la livraison disponible</p>
              <p>Tarifs selon la wilaya</p>
              <p>Livraison à domicile ou au bureau</p>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white">Contact</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <div>
                  <a href="tel:0657433000" className="hover:text-gold transition-colors">
                    0657 43 30 00
                  </a>
                  <br />
                  <a href="tel:0555688017" className="hover:text-gold transition-colors">
                    0555 68 80 17
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <a 
                  href="mailto:marquetasseda@gmail.com" 
                  className="hover:text-gold transition-colors"
                >
                  marquetasseda@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gold/20 mt-8 pt-8 text-center">
          <p className="text-muted-foreground text-sm">
            © 2024 Marque Tasseda. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
