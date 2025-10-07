import { useState, useEffect } from 'react';
import { ShoppingBag, Menu, User, Heart, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { useRouter } from './Router';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { navigateTo } = useRouter();
  const { getTotalItems, getFavoritesCount } = useCart();
  const { user, isShopOwner, isAdmin, isLoggedIn, logout, loading } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 bg-elbfunkeln-beige border-b border-black transition-all duration-300 wave-underline ${
        isScrolled ? 'shadow-md' : ''
      }`}
    >
      <div className={`container mx-auto px-4 transition-all duration-300 ${
        isScrolled ? 'py-2' : 'py-4'
      }`}>
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div 
            className={`cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 ${ 
              isScrolled ? 'h-8' : 'h-10'
            }`}
            onClick={() => navigateTo('home')}
          >
            <img
              src="https://i.imgur.com/8kx2Kgq.png"
              alt="Elbfunkeln"
              className={`transition-all duration-300 ${ 
                isScrolled ? 'h-8' : 'h-12'
              } w-auto object-contain`}
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {[
              { label: 'Schmuck', page: 'shop' as const },
              { label: 'Über uns', page: 'about' as const },
              { label: 'Kontakt', page: 'contact' as const }
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => navigateTo(item.page)}
                className="font-inter text-elbfunkeln-green hover:text-elbfunkeln-green/80 transition-colors duration-200 hover:scale-105 active:scale-95"
              >
                {item.label}
              </button>
            ))}
            {(isShopOwner() || isAdmin()) && (
              <button
                onClick={() => navigateTo('admin')}
                className="font-inter text-elbfunkeln-green hover:text-elbfunkeln-green/80 transition-colors duration-200 hover:scale-105 active:scale-95"
              >
                👩‍💼 Shop-Verwaltung
              </button>
            )}
            {isAdmin() && (
              <button
                onClick={() => navigateTo('admin-data')}
                className="font-inter text-elbfunkeln-green hover:text-elbfunkeln-green/80 transition-colors duration-200 hover:scale-105 active:scale-95"
              >
                🗄️ Daten
              </button>
            )}
          </nav>

          {/* Icons */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigateTo('favorites')}
              className="text-elbfunkeln-green hover:text-elbfunkeln-green/80 hover:scale-110 active:scale-95 transition-all duration-200 relative"
            >
              <Heart size={isScrolled ? 18 : 20} />
              {getFavoritesCount() > 0 && (
                <span className={`absolute -top-2 -right-2 bg-elbfunkeln-rose text-white text-xs rounded-full flex items-center justify-center ${
                  isScrolled ? 'w-4 h-4' : 'w-5 h-5'
                }`}>
                  {getFavoritesCount()}
                </span>
              )}
            </button>
            
            {/* User Menu */}
            {isLoggedIn() ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button 
                    className="text-elbfunkeln-green p-1 rounded-full hover:text-elbfunkeln-green/80 hover:scale-110 active:scale-95 transition-all duration-200"
                    disabled={loading}
                  >
                    <User size={isScrolled ? 18 : 20} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium text-elbfunkeln-green">
                      {user?.name || user?.email}
                    </p>
                    <p className="text-xs text-elbfunkeln-green/60">
                      {user?.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigateTo('account')}>
                    <User className="mr-2 h-4 w-4 text-elbfunkeln-lavender" />
                    Mein Konto
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={async () => {
                    try {
                      await logout();
                      navigateTo('home');
                    } catch (error) {
                      console.error('Header logout error:', error);
                      navigateTo('home'); // Navigate away even on error
                    }
                  }}>
                    <LogOut className="mr-2 h-4 w-4 text-elbfunkeln-rose" />
                    Abmelden
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <button 
                onClick={() => navigateTo('login')}
                className="text-elbfunkeln-green p-1 rounded-full hover:text-elbfunkeln-green/80 hover:scale-110 active:scale-95 transition-all duration-200"
              >
                <User size={isScrolled ? 18 : 20} />
              </button>
            )}
            
            <button 
              className="text-elbfunkeln-green relative hover:text-elbfunkeln-green/80 hover:scale-110 active:scale-95 transition-all duration-200"
              onClick={() => navigateTo('cart')}
            >
              <ShoppingBag size={isScrolled ? 18 : 20} />
              {getTotalItems() > 0 && (
                <span className={`absolute -top-2 -right-2 bg-elbfunkeln-green text-elbfunkeln-beige text-xs rounded-full flex items-center justify-center ${
                  isScrolled ? 'w-4 h-4' : 'w-5 h-5'
                }`}>
                  {getTotalItems()}
                </span>
              )}
            </button>
            
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-elbfunkeln-green hover:text-elbfunkeln-green/80 hover:scale-110 active:scale-95 transition-all duration-200"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu size={isScrolled ? 18 : 20} />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <nav 
            className="md:hidden mt-4 pb-4"
          >
            {[
              { label: 'Schmuck', page: 'shop' as const },
              { label: 'Über uns', page: 'about' as const },
              { label: 'Kontakt', page: 'contact' as const }
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  navigateTo(item.page);
                  setIsMobileMenuOpen(false);
                }}
                className="block py-2 font-inter text-elbfunkeln-green text-left w-full hover:text-elbfunkeln-green/80 hover:bg-elbfunkeln-green/5 transition-colors duration-200"
              >
                {item.label}
              </button>
            ))}

            {/* User Menu Mobile */}
            <div className="border-t border-elbfunkeln-green/20 pt-2 mt-2">
              {isLoggedIn() ? (
                <>
                  <div className="px-2 py-2">
                    <p className="text-sm font-medium text-elbfunkeln-green">
                      {user?.name || user?.email}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      navigateTo('account');
                      setIsMobileMenuOpen(false);
                    }}
                    className="block py-2 font-inter text-elbfunkeln-green text-left w-full hover:text-elbfunkeln-green/80 hover:bg-elbfunkeln-green/5 transition-colors duration-200"
                  >
                    👤 Mein Konto
                  </button>
                  {(isShopOwner() || isAdmin()) && (
                    <button
                      onClick={() => {
                        navigateTo('admin');
                        setIsMobileMenuOpen(false);
                      }}
                      className="block py-2 font-inter text-elbfunkeln-green text-left w-full hover:text-elbfunkeln-green/80 hover:bg-elbfunkeln-green/5 transition-colors duration-200"
                    >
                      👩‍💼 Shop-Verwaltung
                    </button>
                  )}
                  {isAdmin() && (
                    <button
                      onClick={() => {
                        navigateTo('admin-data');
                        setIsMobileMenuOpen(false);
                      }}
                      className="block py-2 font-inter text-elbfunkeln-green text-left w-full hover:text-elbfunkeln-green/80 hover:bg-elbfunkeln-green/5 transition-colors duration-200"
                    >
                      🗄️ Daten
                    </button>
                  )}
                  <button
                    onClick={async () => {
                      try {
                        await logout();
                        setIsMobileMenuOpen(false);
                        navigateTo('home');
                      } catch (error) {
                        console.error('Mobile logout error:', error);
                        setIsMobileMenuOpen(false);
                        navigateTo('home'); // Navigate away even on error
                      }
                    }}
                    className="block py-2 font-inter text-elbfunkeln-green text-left w-full hover:text-elbfunkeln-green/80 hover:bg-elbfunkeln-green/5 transition-colors duration-200"
                  >
                    🚪 Abmelden
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    navigateTo('login');
                    setIsMobileMenuOpen(false);
                  }}
                  className="block py-2 font-inter text-elbfunkeln-green text-left w-full hover:text-elbfunkeln-green/80 hover:bg-elbfunkeln-green/5 transition-colors duration-200"
                >
                  🔐 Anmelden
                </button>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}