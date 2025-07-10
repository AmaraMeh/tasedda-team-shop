
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import HeroSection from '@/components/HeroSection';
import ProductCard from '@/components/ProductCard';
import Footer from '@/components/Layout/Footer';
import Header from '@/components/Layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Crown, Users, Package, ArrowRight, Store, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Product } from '@/types';

const Index = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [taseddaProducts, setTaseddaProducts] = useState<Product[]>([]);
  const [sellerProducts, setSellerProducts] = useState<Product[]>([]);
  const [wholesalerProducts, setWholesalerProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [latestProducts, setLatestProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      // Produits Tasedda (ajoutés par admin, sans seller_id)
      const { data: adminProducts } = await supabase
        .from('products')
        .select(`
          *,
          categories(name)
        `)
        .is('seller_id', null)
        .eq('is_active', true)
        .limit(8);

      // Produits des vendeurs normaux
      const { data: vendorProducts } = await supabase
        .from('products')
        .select(`
          *,
          categories(name),
          sellers(business_name, slug, seller_type)
        `)
        .not('seller_id', 'is', null)
        .eq('is_active', true)
        .eq('sellers.seller_type', 'normal')
        .limit(8);

      // Produits des grossistes
      const { data: wholesaleProducts } = await supabase
        .from('products')
        .select(`
          *,
          categories(name),
          sellers(business_name, slug, seller_type)
        `)
        .not('seller_id', 'is', null)
        .eq('is_active', true)
        .eq('sellers.seller_type', 'wholesale')
        .limit(8);

      if (adminProducts) {
        const mappedAdminProducts = adminProducts.map(item => ({
          ...item,
          image_url: item.image_url || '/placeholder.svg',
          image: item.image_url || '/placeholder.svg',
          category: item.categories?.name || 'Sans catégorie',
          inStock: item.stock_quantity ? item.stock_quantity > 0 : true,
          description: item.description || '',
          is_featured: item.is_featured || false,
          sizes: item.sizes || [],
          colors: item.colors || []
        }));
        setTaseddaProducts(mappedAdminProducts);
      }

      if (vendorProducts) {
        const mappedVendorProducts = vendorProducts.map(item => ({
          ...item,
          image_url: item.image_url || '/placeholder.svg',
          image: item.image_url || '/placeholder.svg',
          category: item.categories?.name || 'Sans catégorie',
          inStock: item.stock_quantity ? item.stock_quantity > 0 : true,
          description: item.description || '',
          is_featured: item.is_featured || false,
          sizes: item.sizes || [],
          colors: item.colors || [],
          sellers: item.sellers ? {
            business_name: item.sellers.business_name,
            slug: item.sellers.slug,
            seller_type: item.sellers.seller_type as 'normal' | 'wholesale' | 'local'
          } : undefined
        }));
        setSellerProducts(mappedVendorProducts);
      }

      if (wholesaleProducts) {
        const mappedWholesaleProducts = wholesaleProducts.map(item => ({
          ...item,
          image_url: item.image_url || '/placeholder.svg',
          image: item.image_url || '/placeholder.svg',
          category: item.categories?.name || 'Sans catégorie',
          inStock: item.stock_quantity ? item.stock_quantity > 0 : true,
          description: item.description || '',
          is_featured: item.is_featured || false,
          sizes: item.sizes || [],
          colors: item.colors || [],
          sellers: item.sellers ? {
            business_name: item.sellers.business_name,
            slug: item.sellers.slug,
            seller_type: item.sellers.seller_type as 'normal' | 'wholesale' | 'local'
          } : undefined
        }));
        setWholesalerProducts(mappedWholesaleProducts);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchFeaturedProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories(name),
          sellers(business_name, slug, seller_type)
        `)
        .eq('is_featured', true)
        .eq('is_active', true)
        .limit(8);

      if (error) throw error;

      const productsWithImages = (data || []).map(product => ({
        ...product,
        description: product.description || '',
        image_url: product.image_url || '/placeholder.svg',
        image: product.image_url || '/placeholder.svg',
        category: product.categories?.name || 'Sans catégorie',
        inStock: product.stock_quantity > 0,
        is_featured: product.is_featured || false,
        sizes: product.sizes || [],
        colors: product.colors || [],
        sellers: product.sellers ? {
          business_name: product.sellers.business_name,
          slug: product.sellers.slug,
          seller_type: product.sellers.seller_type
        } : undefined
      }));

      setFeaturedProducts(productsWithImages);
    } catch (error) {
      console.error('Error fetching featured products:', error);
    }
  };

  const fetchLatestProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories(name),
          sellers(business_name, slug, seller_type)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(8);

      if (error) throw error;

      const productsWithImages = (data || []).map(product => ({
        ...product,
        description: product.description || '',
        image_url: product.image_url || '/placeholder.svg',
        image: product.image_url || '/placeholder.svg',
        category: product.categories?.name || 'Sans catégorie',
        inStock: product.stock_quantity > 0,
        is_featured: product.is_featured || false,
        sizes: product.sizes || [],
        colors: product.colors || [],
        sellers: product.sellers ? {
          business_name: product.sellers.business_name,
          slug: product.sellers.slug,
          seller_type: product.sellers.seller_type
        } : undefined
      }));

      setLatestProducts(productsWithImages);
    } catch (error) {
      console.error('Error fetching latest products:', error);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <HeroSection showTeamCTA={false} showSellerCTA={false} />
      
      {/* Quick Access Cards - Images des photos uploadées */}
      <section className="py-12 md:py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Products Card */}
            <Link to="/products" className="group">
              <Card className="glass-effect border-gold/20 hover:border-gold/40 transition-all cursor-pointer h-64 relative overflow-hidden">
                <div 
                  className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform"
                  style={{ backgroundImage: `url('/lovable-uploads/fabf8608-433a-4fed-81c3-eeded5001f19.png')` }}
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                <CardContent className="p-6 h-full flex flex-col justify-center items-center text-center relative z-10">
                  <div className="mb-4">
                    <ShoppingBag className="h-16 w-16 mx-auto text-gold mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="text-2xl font-bold text-white mb-2">PRODUITS LION</h3>
                    <p className="text-sm text-white/80">اكتشف مجموعتنا الحصرية</p>
                  </div>
                  <Button className="btn-gold group-hover:scale-105 transition-transform">
                    تسوق الآن
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </Link>

            {/* Local Sellers Card */}
            <Link to="/local-sellers" className="group">
              <Card className="glass-effect border-gold/20 hover:border-gold/40 transition-all cursor-pointer h-64 relative overflow-hidden">
                <div 
                  className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform"
                  style={{ backgroundImage: `url('/lovable-uploads/fb7cd1a8-88d6-49c4-8439-032980fbef6a.png')` }}
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                <CardContent className="p-6 h-full flex flex-col justify-center items-center text-center relative z-10">
                  <div className="mb-4">
                    <Store className="h-16 w-16 mx-auto text-gold mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="text-2xl font-bold text-white mb-2">البائعون المحليون</h3>
                    <p className="text-sm text-white/80">اكتشف منتجات محلية متنوعة</p>
                  </div>
                  <Button className="btn-gold group-hover:scale-105 transition-transform">
                    اكتشف المتاجر
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </Link>

            {/* Wholesale Card */}
            <Link to="/wholesalers" className="group">
              <Card className="glass-effect border-gold/20 hover:border-gold/40 transition-all cursor-pointer h-64 relative overflow-hidden">
                <div 
                  className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform"
                  style={{ backgroundImage: `url('/lovable-uploads/a0ba44eb-f1fc-4d9b-acdd-44bd17e76522.png')` }}
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                <CardContent className="p-6 h-full flex flex-col justify-center items-center text-center relative z-10">
                  <div className="mb-4">
                    <Package className="h-16 w-16 mx-auto text-gold mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="text-2xl font-bold text-white mb-2">الشراء بالجملة</h3>
                    <p className="text-sm text-white/80">اشترِ بالجملة بأسعار تنافسية</p>
                  </div>
                  <Button className="btn-gold group-hover:scale-105 transition-transform">
                    اشترِ بالجملة
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Produits LION by Tasedda Section */}
      {taseddaProducts.length > 0 && (
        <section className="py-12 md:py-20 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-8 md:mb-12">
              <div className="flex items-center justify-center mb-4">
                <Crown className="h-8 w-8 text-gold mr-3" />
                <h2 className="text-2xl md:text-4xl font-bold text-white">
                  LION <span className="gold-text">by Tasedda</span>
                </h2>
              </div>
              <p className="text-lg md:text-xl text-muted-foreground">
                اكتشف مجموعتنا الحصرية من علامة تاسعدة التجارية
              </p>
            </div>
            
            <div className="product-grid">
              {taseddaProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            
            <div className="text-center mt-8">
              <Button asChild className="btn-gold">
                <Link to="/products">
                  <Package className="h-4 w-4 mr-2" />
                  عرض جميع المنتجات
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Produits des Vendeurs Section */}
      {sellerProducts.length > 0 && (
        <section className="py-12 md:py-20 px-4 bg-black/50">
          <div className="container mx-auto">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl md:text-4xl font-bold mb-4 text-white">
                منتجات <span className="gold-text">البائعين</span> المحليين
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground">
                اكتشف مجموعة منتجات من شركائنا البائعين
              </p>
            </div>
            
            <div className="product-grid">
              {sellerProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            
            <div className="text-center mt-8">
              <Button asChild className="btn-gold">
                <Link to="/local-sellers">
                  عرض جميع البائعين
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Produits des Grossistes Section */}
      {wholesalerProducts.length > 0 && (
        <section className="py-12 md:py-20 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl md:text-4xl font-bold mb-4 text-white">
                منتجات <span className="gold-text">تجار الجملة</span>
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground">
                اشترِ بالجملة من شركائنا تجار الجملة
              </p>
            </div>
            
            <div className="product-grid">
              {wholesalerProducts.map((product) => (
                <ProductCard key={product.id} product={product} showPrice={false} />
              ))}
            </div>
            
            <div className="text-center mt-8">
              <Button asChild className="btn-gold">
                <Link to="/wholesalers">
                  عرض جميع تجار الجملة
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Join Team Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-gold/10 via-transparent to-gold/10">
        <div className="container mx-auto text-center">
          <div 
            className="h-32 w-32 mx-auto mb-6 bg-cover bg-center rounded-full"
            style={{ backgroundImage: `url('/lovable-uploads/fa144c93-891b-489c-a150-881188b619d4.png')` }}
          />
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            انضم إلى <span className="gold-text">فريق LION DZ</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            احصل على عمولات من خلال الانضمام إلى فريق المبيعات لدينا وطور شبكتك
          </p>
          <Button asChild className="btn-gold text-lg px-8 py-3">
            <Link to="/team">
              انضم إلى الفريق
              <Crown className="h-5 w-5 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
