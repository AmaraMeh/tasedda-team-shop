import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Crown, Users, Gift, Phone, Mail, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';

interface HomepageContent {
  id: string;
  type: 'contributor' | 'event';
  title: string;
  subtitle?: string;
  content?: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const Footer = () => {
  const { t } = useTranslation();
  const [contributor, setContributor] = useState<HomepageContent | null>(null);

  useEffect(() => {
    fetchContributor();
  }, []);

  const fetchContributor = async () => {
    const { data } = await supabase
      .from('homepage_content')
      .select('*')
      .eq('type', 'contributor')
      .eq('is_active', true)
      .single();

    if (data) {
      setContributor(data as HomepageContent);
    }
  };

  return (
    <footer className="bg-black border-t border-gold/20">
      {contributor && (
        <div className="bg-black/50 py-8 px-4">
          <div className="container mx-auto text-center">
            <div className="flex items-center justify-center mb-4">
              <Gift className="h-6 w-6 text-gold mr-2" />
              <h3 className="text-xl font-semibold gold-text">{t('footer.team')}</h3>
            </div>
            <p className="text-muted-foreground mb-4">{contributor.title}</p>
            {contributor.subtitle && (
              <p className="text-muted-foreground">{contributor.subtitle}</p>
            )}
            {contributor.content && contributor.content.description && (
              <p className="text-muted-foreground">{contributor.content.description}</p>
            )}
            <Link to="/team" className="text-gold hover:underline">
              {t('footer.team')}
            </Link>
          </div>
        </div>
      )}
      
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Crown className="h-8 w-8 text-gold" />
              <span className="text-xl font-bold gold-text">LION by Tasedda</span>
            </div>
            <p className="text-muted-foreground">
              {t('footer.brand.description')}
            </p>
            <div className="flex space-x-4">
              <Facebook className="h-5 w-5 text-muted-foreground hover:text-gold cursor-pointer" />
              <Instagram className="h-5 w-5 text-muted-foreground hover:text-gold cursor-pointer" />
              <Twitter className="h-5 w-5 text-muted-foreground hover:text-gold cursor-pointer" />
            </div>
          </div>

          {/* Quick Links Section */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold gold-text">{t('footer.quickLinks')}</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-gold transition-colors">
                  {t('navigation.home')}
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-muted-foreground hover:text-gold transition-colors">
                  {t('navigation.products')}
                </Link>
              </li>
              <li>
                <Link to="/local-sellers" className="text-muted-foreground hover:text-gold transition-colors">
                  {t('navigation.localSellers')}
                </Link>
              </li>
              <li>
                <Link to="/wholesalers" className="text-muted-foreground hover:text-gold transition-colors">
                  {t('navigation.wholesalers')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Team Section */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold gold-text">{t('team.title')}</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/team" className="text-muted-foreground hover:text-gold transition-colors">
                  {t('team.join.button')}
                </Link>
              </li>
              <li>
                <Link to="/team/advantages" className="text-muted-foreground hover:text-gold transition-colors">
                  {t('team.advantages.title')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold gold-text">{t('footer.contact')}</h4>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+213 (0) XX XXX XX XX</span>
              </li>
              <li className="flex items-center space-x-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>contact@lionbytasedda.com</span>
              </li>
              <li className="flex items-center space-x-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Alger, Algérie</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gold/20 mt-8 pt-8 text-center">
          <p className="text-muted-foreground">
            © 2024 LION by Tasedda. {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
