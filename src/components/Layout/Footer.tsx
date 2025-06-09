
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface HomepageContent {
  id: string;
  type: 'contributor' | 'event';
  title: string;
  subtitle: string;
  content: any;
  is_active: boolean;
}

const Footer = () => {
  const { t } = useTranslation();
  const [activeContent, setActiveContent] = useState<HomepageContent | null>(null);

  useEffect(() => {
    fetchActiveContent();
  }, []);

  const fetchActiveContent = async () => {
    const { data } = await supabase
      .from('homepage_content')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1);

    if (data && data.length > 0) {
      setActiveContent(data[0]);
    }
  };

  const renderActiveContent = () => {
    if (!activeContent) return null;

    if (activeContent.type === 'contributor') {
      return (
        <div className="text-center">
          <h3 className="font-display text-lg md:text-xl font-semibold gold-text mb-4">
            {t('footer.contributorOfMonth')}
          </h3>
          <div className="bg-gradient-to-r from-gold/10 to-gold-light/10 rounded-lg p-4 md:p-6 max-w-md mx-auto">
            <div className="flex items-center justify-center space-x-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm md:text-base">
                  {activeContent.subtitle?.charAt(0) || 'A'}
                </span>
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm md:text-base">{activeContent.subtitle}</p>
                <p className="text-xs md:text-sm text-muted-foreground">
                  {activeContent.content?.sales || 47} {t('admin.sales')}
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeContent.type === 'event') {
      return (
        <div className="text-center">
          <h3 className="font-display text-lg md:text-xl font-semibold gold-text mb-4">
            {t('footer.upcomingEvent')}
          </h3>
          <div className="bg-gradient-to-r from-gold/10 to-gold-light/10 rounded-lg p-4 md:p-6 max-w-md mx-auto">
            <h4 className="font-semibold text-foreground mb-2 text-sm md:text-base">{activeContent.title}</h4>
            <p className="text-xs md:text-sm text-muted-foreground mb-1">
              📅 {activeContent.content?.date || 'À annoncer'}
            </p>
            <p className="text-xs md:text-sm text-muted-foreground">
              📍 {activeContent.content?.location || 'À annoncer'}
            </p>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
          {/* Logo et description */}
          <div className="space-y-4 text-center md:text-left">
            <Link to="/" className="flex items-center justify-center md:justify-start space-x-2">
              <div className="gold-gradient h-8 w-8 rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-lg">L</span>
              </div>
              <span className="font-display text-xl md:text-2xl font-bold gold-text">Lion</span>
            </Link>
            <p className="text-muted-foreground text-sm">
              {t('footer.description')}
            </p>
          </div>

          {/* Boutique */}
          <div className="space-y-4 text-center md:text-left">
            <h3 className="font-semibold text-foreground">{t('footer.shop')}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/products?category=homme" className="hover:text-primary transition-colors">Homme</Link></li>
              <li><Link to="/products?category=femme" className="hover:text-primary transition-colors">Femme</Link></li>
              <li><Link to="/products?category=enfant" className="hover:text-primary transition-colors">Enfant</Link></li>
              <li><Link to="/products?category=accessoires" className="hover:text-primary transition-colors">Accessoires</Link></li>
            </ul>
          </div>

          {/* Team & Affiliation */}
          <div className="space-y-4 text-center md:text-left">
            <h3 className="font-semibold text-foreground">{t('footer.team')}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/team" className="hover:text-primary transition-colors">{t('team.joinTeam')}</Link></li>
              <li><Link to="/team/advantages" className="hover:text-primary transition-colors">{t('team.advantages')}</Link></li>
              <li><Link to="/team/commissions" className="hover:text-primary transition-colors">{t('team.commissions')}</Link></li>
              <li><Link to="/seller" className="hover:text-primary transition-colors">{t('seller.becomeSeller')}</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4 text-center md:text-left">
            <h3 className="font-semibold text-foreground">{t('footer.support')}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/support/help" className="hover:text-primary transition-colors">{t('support.helpCenter')}</Link></li>
              <li><Link to="/support/contact" className="hover:text-primary transition-colors">{t('support.contact')}</Link></li>
              <li><Link to="/support/shipping" className="hover:text-primary transition-colors">{t('support.shipping')}</Link></li>
              <li><Link to="/support/returns" className="hover:text-primary transition-colors">{t('support.returns')}</Link></li>
            </ul>
          </div>
        </div>

        {/* Contenu dynamique (Contributeur du mois ou événement) */}
        <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-border">
          {renderActiveContent()}
        </div>

        {/* Copyright */}
        <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Lion. {t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
