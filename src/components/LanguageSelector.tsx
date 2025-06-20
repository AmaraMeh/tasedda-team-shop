
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LanguageSelector = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('i18nextLng', lng);
    // Force direction change
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lng;
    // Force page reload to apply all changes
    window.location.reload();
  };

  const getCurrentLanguage = () => {
    const currentLang = i18n.language || 'fr';
    switch (currentLang) {
      case 'fr':
        return 'FR';
      case 'en':
        return 'EN';
      case 'ar':
        return 'عربي';
      default:
        return 'FR';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="text-white hover:text-gold">
          <Globe className="h-4 w-4 mr-2" />
          {getCurrentLanguage()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-black border border-gold/20">
        <DropdownMenuItem
          onClick={() => changeLanguage('fr')}
          className={i18n.language === 'fr' ? 'text-gold' : 'text-white hover:text-gold'}
        >
          Français
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => changeLanguage('en')}
          className={i18n.language === 'en' ? 'text-gold' : 'text-white hover:text-gold'}
        >
          English
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => changeLanguage('ar')}
          className={i18n.language === 'ar' ? 'text-gold' : 'text-white hover:text-gold'}
        >
          العربية
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;
