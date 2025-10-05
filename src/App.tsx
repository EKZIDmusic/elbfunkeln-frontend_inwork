import { useEffect } from 'react';
import { RouterProvider, useRouter } from './components/Router';
import { CartProvider } from './components/CartContext';
import { AuthProvider, useAuth } from './components/AuthContext';
import { SearchProvider } from './components/SearchContext';
import { CookieConsentProvider } from './components/CookieConsentContext';
import { AnalyticsProvider } from './components/AnalyticsContext';
import { NewsletterAutomationProvider } from './components/NewsletterAutomationContext';
import { GiftCardProvider } from './components/GiftCardContext';
import { CookieBanner } from './components/CookieBanner';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './components/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { AccountPage } from './pages/AccountPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { AdminPage } from './pages/AdminPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminDataPage } from './pages/AdminDataPage';
import { SearchPage } from './pages/SearchPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { ShippingPage } from './pages/ShippingPage';
import { ReturnsPage } from './pages/ReturnsPage';
import { SizeGuidePage } from './pages/SizeGuidePage';
import { CareTipsPage } from './pages/CareTipsPage';
import { TermsPage } from './pages/TermsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { ImprintPage } from './pages/ImprintPage';
import { WithdrawalPage } from './pages/WithdrawalPage';
import { AdminSliderTestPage } from './pages/AdminSliderTestPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ServerErrorPage } from './pages/ServerErrorPage';
import { GiftCardShop } from './components/GiftCardShop';
import { Toaster } from './components/ui/sonner';

function AppContent() {
  const { currentPage } = useRouter();
  const { isShopOwner, isAdmin, isLoggedIn } = useAuth();

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'shop':
        return <ShopPage />;
      case 'product':
        return <ProductDetailPage />;
      case 'cart':
        return <CartPage />;
      case 'checkout':
        return <CheckoutPage />;
      case 'order-success':
        return <OrderSuccessPage />;
      case 'about':
        return <AboutPage />;
      case 'contact':
        return <ContactPage />;
      case 'account':
        return isLoggedIn() ? <AccountPage /> : <LoginPage />;
      case 'login':
        return <LoginPage />;
      case 'register':
        return <RegisterPage />;
      case 'reset-password':
        return <ResetPasswordPage />;
      case 'admin':
        return (isAdmin() || isShopOwner()) ? <AdminPage /> : <LoginPage />;
      case 'admin-dashboard':
        return isAdmin() ? <AdminDashboardPage /> : <LoginPage />;
      case 'admin-data':
        return (isAdmin() || isShopOwner()) ? <AdminDataPage /> : <LoginPage />;
      case 'search':
        return <SearchPage />;
      case 'favorites':
        return <FavoritesPage />;
      case 'shipping':
        return <ShippingPage />;
      case 'returns':
        return <ReturnsPage />;
      case 'size-guide':
        return <SizeGuidePage />;
      case 'care-tips':
        return <CareTipsPage />;
      case 'terms':
        return <TermsPage />;
      case 'privacy':
        return <PrivacyPage />;
      case 'imprint':
        return <ImprintPage />;
      case 'withdrawal':
        return <WithdrawalPage />;
      case 'admin-slider-test':
        return <AdminSliderTestPage />;
      case 'gift-cards':
        return <GiftCardShop />;
      case '404':
        return <NotFoundPage />;
      case '500':
        return <ServerErrorPage />;
      default:
        return <NotFoundPage />;
    }
  };

  return (
    <div className="min-h-screen bg-elbfunkeln-beige font-inter">
      <Header />
      <main>
        {renderPage()}
      </main>
      <Footer />
      <CookieBanner />
      <Toaster richColors position="top-right" />
    </div>
  );
}

export default function App() {
  // Initialize analytics safely on app start
  useEffect(() => {
    // Safe analytics initialization without process.env
    const initAnalyticsSafely = () => {
      try {
        console.log('🚀 Elbfunkeln App initialized');
        // Analytics will be initialized by AnalyticsProvider when consent is given
      } catch (error) {
        console.warn('Analytics initialization warning:', error);
      }
    };

    initAnalyticsSafely();
  }, []);

  return (
    <CookieConsentProvider>
      <AnalyticsProvider>
        <AuthProvider>
          <RouterProvider>
            <SearchProvider>
              <NewsletterAutomationProvider>
                <GiftCardProvider>
                  <CartProvider>
                    <AppContent />
                  </CartProvider>
                </GiftCardProvider>
              </NewsletterAutomationProvider>
            </SearchProvider>
          </RouterProvider>
        </AuthProvider>
      </AnalyticsProvider>
    </CookieConsentProvider>
  );
}