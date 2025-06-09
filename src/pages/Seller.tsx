import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Store, Shield, Users, TrendingUp, CheckCircle, Package } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Seller = () => {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const [businessName, setBusinessName] = useState('');
  const [description, setDescription] = useState('');
  const [sellerType, setSellerType] = useState<'normal' | 'wholesale'>('normal');
  const [dataLoading, setDataLoading] = useState(true);
  const [isSeller, setIsSeller] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }
    if (user) {
      checkSellerStatus(user.id);
    }
  }, [user, loading, navigate]);

  const checkSellerStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('sellers')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setIsSeller(!!data);
    } catch (error: any) {
      console.error('Error checking seller status:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const createSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const createSeller = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const slug = createSlug(businessName);

      // Vérifier si le slug existe déjà
      const { data: existingSeller, error: checkError } = await supabase
        .from('sellers')
        .select('id')
        .eq('slug', slug)
        .single();

      if (existingSeller) {
        toast({
          title: t('seller.form.slugExists'),
          description: t('seller.form.chooseAnother'),
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('sellers')
        .insert({
          user_id: user.id,
          business_name: businessName,
          slug: slug,
          description: description,
          seller_type: sellerType,
          status: 'pending',
        });

      if (error) throw error;

      toast({
        title: t('seller.form.requestSent'),
        description: t('seller.form.requestDescription'),
      });

      setIsSeller(false);
      navigate('/profile');
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const features = [
    {
      icon: Shield,
      title: t('seller.features.trial'),
      description: t('seller.features.trialDesc')
    },
    {
      icon: Users,
      title: t('seller.features.support'),
      description: t('seller.features.supportDesc')
    },
    {
      icon: TrendingUp,
      title: t('seller.features.pricing'),
      description: t('seller.features.pricingDesc')
    }
  ];

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-gold">{t('common.loading')}</div>
      </div>
    );
  }

  if (isSeller) {
    const [shop, setShop] = useState<any>(null);
    useEffect(() => {
      if (user) {
        supabase.from('sellers').select('*').eq('user_id', user.id).single().then(({ data }) => setShop(data));
      }
    }, [user]);
    
    if (shop && shop.status === 'pending') {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gold mb-4">{t('seller.pending.title')}</h2>
            <p className="text-muted-foreground">{t('seller.pending.description')}</p>
          </div>
        </div>
      );
    }
    if (shop && shop.status === 'active') {
      return (
        <div className="min-h-screen bg-black">
          <Header />
          <main className="container mx-auto px-4 py-20">
            <div className="text-center" data-aos="fade-up">
              <CheckCircle className="h-20 w-20 mx-auto mb-6 text-gold" />
              <h1 className="text-3xl font-display font-bold mb-4">
                {t('seller.active.title')} <span className="gold-text">{t('seller.active.shop')}</span> {t('seller.active.isActive')}
              </h1>
              <p className="text-muted-foreground mb-8">
                {t('seller.active.description')}
              </p>
              <Button onClick={() => navigate('/profile')} className="btn-gold">
                {t('seller.active.manage')}
              </Button>
            </div>
          </main>
          <Footer />
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <main className="py-20">
        {/* Hero Section */}
        <section className="container mx-auto px-4 text-center mb-20" data-aos="fade-up">
          <Store className="h-20 w-20 mx-auto mb-6 text-gold" />
          <h1 className="text-4xl lg:text-5xl font-display font-bold mb-6">
            {t('seller.hero.title')} <span className="gold-text">{t('seller.hero.shop')}</span> {t('seller.hero.online')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            {t('seller.hero.description')}
          </p>
          <div className="gold-gradient rounded-lg p-1 inline-block">
            <div className="bg-black rounded-lg px-8 py-4">
              <span className="text-2xl font-bold gold-text">
                {t('seller.hero.pricing')}
              </span>
            </div>
          </div>
        </section>

        {/* Avantages */}
        <section className="container mx-auto px-4 mb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="glass-effect border-gold/20 card-hover" data-aos="fade-up" data-aos-delay={index * 100}>
                <CardHeader className="text-center">
                  <feature.icon className="h-16 w-16 mx-auto mb-4 text-gold" />
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Types de vendeurs */}
        <section className="container mx-auto px-4 mb-20" data-aos="fade-up">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold mb-4">
              {t('seller.types.title')} <span className="gold-text">{t('seller.types.choose')}</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t('seller.types.description')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="glass-effect border-gold/20">
              <CardHeader className="text-center">
                <Store className="h-16 w-16 mx-auto mb-4 text-gold" />
                <CardTitle>{t('seller.types.normal.title')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-center">{t('seller.types.normal.description')}</p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{t('seller.types.normal.feature1')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{t('seller.types.normal.feature2')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{t('seller.types.normal.feature3')}</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="glass-effect border-gold/20">
              <CardHeader className="text-center">
                <Package className="h-16 w-16 mx-auto mb-4 text-gold" />
                <CardTitle>{t('seller.types.wholesale.title')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-center">{t('seller.types.wholesale.description')}</p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{t('seller.types.wholesale.feature1')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{t('seller.types.wholesale.feature2')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{t('seller.types.wholesale.feature3')}</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Formulaire */}
        <section className="container mx-auto px-4">
          <div className="max-w-md mx-auto" data-aos="fade-up">
            <Card className="glass-effect border-gold/20">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl gold-text">
                  {t('seller.form.title')}
                </CardTitle>
                <p className="text-muted-foreground">
                  {t('seller.form.description')}
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={createSeller} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sellerType">{t('seller.form.type')} *</Label>
                    <RadioGroup value={sellerType} onValueChange={(value: 'normal' | 'wholesale') => setSellerType(value)}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="normal" id="normal" />
                        <Label htmlFor="normal">{t('seller.types.normal.title')}</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="wholesale" id="wholesale" />
                        <Label htmlFor="wholesale">{t('seller.types.wholesale.title')}</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessName">{t('seller.form.businessName')} *</Label>
                    <Input
                      id="businessName"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder={t('seller.form.businessPlaceholder')}
                      required
                      className="bg-black/50 border-gold/20 focus:border-gold"
                    />
                    {businessName && (
                      <p className="text-xs text-muted-foreground">
                        URL: tasedda.dz/boutique/{createSlug(businessName)}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">{t('seller.form.description')}</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={t('seller.form.descriptionPlaceholder')}
                      className="bg-black/50 border-gold/20 focus:border-gold"
                      rows={3}
                    />
                  </div>

                  <div className="bg-gold/10 border border-gold/20 rounded-lg p-4">
                    <h4 className="font-semibold text-gold mb-2">{t('seller.form.conditions')}</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• {t('seller.form.condition1')}</li>
                      <li>• {t('seller.form.condition2')}</li>
                      <li>• {t('seller.form.condition3')}</li>
                      <li>• {t('seller.form.condition4')}</li>
                    </ul>
                  </div>
                  
                  <Button type="submit" className="w-full btn-gold" disabled={loading}>
                    <Store className="h-4 w-4 mr-2" />
                    {loading ? t('seller.form.creating') : t('seller.form.create')}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Seller;
