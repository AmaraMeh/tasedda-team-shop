import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  UserPlus, 
  Store, 
  MessageSquare, 
  Settings,
  BarChart3,
  Home,
  Gift,
  CreditCard,
  FileText,
  TrendingUp
} from 'lucide-react';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');

  const adminSections = [
    {
      id: 'dashboard',
      title: 'Tableau de bord',
      icon: BarChart3,
      description: 'Vue d\'ensemble des statistiques',
      path: '/admin/dashboard'
    },
    {
      id: 'orders',
      title: 'Commandes',
      icon: ShoppingCart,
      description: 'Gestion des commandes clients',
      path: '/admin/orders'
    },
    {
      id: 'products',
      title: 'Produits',
      icon: Package,
      description: 'Gestion du catalogue produits',
      path: '/admin/products'
    },
    {
      id: 'users',
      title: 'Utilisateurs',
      icon: Users,
      description: 'Gestion des comptes utilisateurs',
      path: '/admin/users'
    },
    {
      id: 'team',
      title: 'Équipe',
      icon: UserPlus,
      description: 'Gestion des membres de l\'équipe',
      path: '/admin/team-members'
    },
    {
      id: 'team-requests',
      title: 'Demandes équipe',
      icon: FileText,
      description: 'Demandes d\'adhésion à l\'équipe',
      path: '/admin/team-requests'
    },
    {
      id: 'sellers',
      title: 'Vendeurs',
      icon: Store,
      description: 'Gestion des vendeurs partenaires',
      path: '/admin/sellers'
    },
    {
      id: 'seller-requests',
      title: 'Demandes vendeurs',
      icon: FileText,
      description: 'Demandes d\'inscription vendeurs',
      path: '/admin/seller-requests'
    },
    {
      id: 'commissions',
      title: 'Commissions',
      icon: TrendingUp,
      description: 'Gestion des commissions équipe',
      path: '/admin/commissions'
    },
    {
      id: 'withdrawals',
      title: 'Retraits',
      icon: CreditCard,
      description: 'Gestion des demandes de retrait',
      path: '/admin/withdrawals'
    },
    {
      id: 'primes',
      title: 'Primes',
      icon: Gift,
      description: 'Gestion des primes et bonus',
      path: '/admin/primes'
    },
    {
      id: 'shipping',
      title: 'Tarifs livraison',
      icon: TrendingUp,
      description: 'Gestion des tarifs de livraison',
      path: '/admin/shipping-rates'
    },
    {
      id: 'chat',
      title: 'Messages',
      icon: MessageSquare,
      description: 'Support client et messages',
      path: '/admin/chat'
    },
    {
      id: 'homepage',
      title: 'Contenu accueil',
      icon: Home,
      description: 'Gestion du contenu de la page d\'accueil',
      path: '/admin/homepage'
    }
  ];

  const handleSectionClick = (section: any) => {
    setActiveSection(section.id);
    navigate(section.path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Panel d'Administration
            <span className="text-gold ml-2">LION DZ</span>
          </h1>
          <p className="text-gray-300 text-lg">
            Gestion complète de la plateforme e-commerce
          </p>
        </div>

        {/* Navigation */}
        <div className="flex justify-center mb-8">
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="border-gold/40 text-white hover:bg-gold/10"
          >
            <Home className="h-4 w-4 mr-2" />
            Retour à l'accueil
          </Button>
        </div>

        {/* Admin Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {adminSections.map((section) => {
            const IconComponent = section.icon;
            return (
              <Card
                key={section.id}
                className={`glass-effect border-gold/20 hover:border-gold/40 transition-all duration-300 hover:scale-105 cursor-pointer group ${
                  activeSection === section.id ? 'border-gold bg-gold/5' : ''
                }`}
                onClick={() => handleSectionClick(section)}
              >
                <CardHeader className="text-center pb-2">
                  <div className="flex justify-center mb-4">
                    <div className="p-4 rounded-full bg-gold/10 group-hover:bg-gold/20 transition-colors">
                      <IconComponent className="h-8 w-8 text-gold" />
                    </div>
                  </div>
                  <CardTitle className="text-white text-lg group-hover:text-gold transition-colors">
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-gray-400 text-sm text-center leading-relaxed">
                    {section.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="glass-effect border-gold/20">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-gold mb-2">0</div>
              <div className="text-gray-400">Commandes aujourd'hui</div>
            </CardContent>
          </Card>
          
          <Card className="glass-effect border-gold/20">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-gold mb-2">0</div>
              <div className="text-gray-400">Nouveaux utilisateurs</div>
            </CardContent>
          </Card>
          
          <Card className="glass-effect border-gold/20">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-gold mb-2">0</div>
              <div className="text-gray-400">Produits actifs</div>
            </CardContent>
          </Card>
          
          <Card className="glass-effect border-gold/20">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-gold mb-2">0 DA</div>
              <div className="text-gray-400">Chiffre d'affaires</div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500">
          <p>© 2024 LION DZ - Panel d'administration</p>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
