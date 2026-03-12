import { useEffect } from 'react';
import { RouterProvider, useRouter } from './components/Router';
import { AuthProvider, useAuth } from './components/AuthContext';
import { SearchProvider } from './components/SearchContext';
import { CookieConsentProvider } from './components/CookieConsentContext';
import { AnalyticsProvider } from './components/AnalyticsContext';
import { NewsletterAutomationProvider } from './components/NewsletterAutomationContext';
import { CookieBanner } from './components/CookieBanner';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './components/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { GalleryPage } from './pages/GalleryPage';
import { GalleryUploadPage } from './pages/GalleryUploadPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { SearchPage } from './pages/SearchPage';
import { SizeGuidePage } from './pages/SizeGuidePage';
import { CareTipsPage } from './pages/CareTipsPage';
import { TermsPage } from './pages/TermsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { ImprintPage } from './pages/ImprintPage';
import { WithdrawalPage } from './pages/WithdrawalPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ServerErrorPage } from './pages/ServerErrorPage';
import { Toaster } from './components/ui/sonner';

function AppContent() {
  const { currentPage } = useRouter();
  const { isLoggedIn } = useAuth();

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'shop':
        return <ShopPage />;
      case 'product':
        return <ProductDetailPage />;
      case 'about':
        return <AboutPage />;
      case 'contact':
        return <ContactPage />;
      case 'gallery':
        return <GalleryPage />;
      case 'gallery-upload':
        return isLoggedIn() ? <GalleryUploadPage /> : <LoginPage />;
      case 'login':
        return <LoginPage />;
      case 'register':
        return <RegisterPage />;
      case 'reset-password':
        return <ResetPasswordPage />;
      case 'search':
        return <SearchPage />;
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
  useEffect(() => {
    const initAnalyticsSafely = () => {
      try {
        console.log('🚀 Elbfunkeln App initialized');
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
                <AppContent />
              </NewsletterAutomationProvider>
            </SearchProvider>
          </RouterProvider>
        </AuthProvider>
      </AnalyticsProvider>
    </CookieConsentProvider>
  );
}
