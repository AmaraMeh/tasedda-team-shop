
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Package, Users, Heart, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-black/90 border-t border-gold/20 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="gold-gradient rounded-lg p-2">
                <Package className="h-6 w-6 text-black" />
              </div>
              <span className="text-xl font-bold gold-text">LION DZ</span>
            </Link>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              وجهتك الأولى للأزياء الراقية في الجزائر. اكتشف ملابس عالية الجودة مع نظام العضوية الفريد لدينا ومتاجر الشركاء المحليين.
            </p>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>contact@lion-dz.com</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+213 XXX XXX XXX</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">{t('footer.shop')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/products" className="text-muted-foreground hover:text-gold transition-colors">
                  المنتجات
                </Link>
              </li>
              <li>
                <Link to="/local-sellers" className="text-muted-foreground hover:text-gold transition-colors">
                  البائعون المحليون
                </Link>
              </li>
              <li>
                <Link to="/wholesalers" className="text-muted-foreground hover:text-gold transition-colors">
                  تجار الجملة
                </Link>
              </li>
              <li>
                <Link to="/seller" className="text-muted-foreground hover:text-gold transition-colors">
                  كن بائعاً
                </Link>
              </li>
            </ul>
          </div>

          {/* Team & Support */}
          <div>
            <h3 className="font-semibold text-white mb-4">{t('footer.team')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/team" className="text-muted-foreground hover:text-gold transition-colors">
                  انضم للفريق
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-muted-foreground hover:text-gold transition-colors">
                  الملف الشخصي
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-muted-foreground hover:text-gold transition-colors">
                  سلة التسوق
                </Link>
              </li>
              <li>
                <Link to="/auth" className="text-muted-foreground hover:text-gold transition-colors">
                  تسجيل الدخول
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gold/20 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground mb-4 md:mb-0">
              {t('footer.copyright')}
            </p>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>الجزائر</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-muted-foreground">صُنع بـ</span>
                <Heart className="h-4 w-4 text-red-500" />
                <span className="text-muted-foreground">في الجزائر</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
