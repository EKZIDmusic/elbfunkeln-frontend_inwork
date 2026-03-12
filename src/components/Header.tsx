import { useState, useEffect } from 'react';
import { Menu, User, LogOut, ImagePlus } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { useRouter } from './Router';
import { useAuth } from './AuthContext';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { navigateTo } = useRouter();
  const { user, isLoggedIn, logout, loading } = useAuth();

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
              { label: 'Galerie', page: 'gallery' as const },
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
          </nav>

          {/* Icons */}
          <div className="flex items-center space-x-4">
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
                  <DropdownMenuItem onClick={() => navigateTo('gallery-upload')}>
                    <ImagePlus className="mr-2 h-4 w-4 text-elbfunkeln-lavender" />
                    Bilder hochladen
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={async () => {
                    try {
                      await logout();
                      navigateTo('home');
                    } catch (error) {
                      console.error('Header logout error:', error);
                      navigateTo('home');
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
          <nav className="md:hidden mt-4 pb-4">
            {[
              { label: 'Schmuck', page: 'shop' as const },
              { label: 'Galerie', page: 'gallery' as const },
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
                      navigateTo('gallery-upload');
                      setIsMobileMenuOpen(false);
                    }}
                    className="block py-2 font-inter text-elbfunkeln-green text-left w-full hover:text-elbfunkeln-green/80 hover:bg-elbfunkeln-green/5 transition-colors duration-200"
                  >
                    Bilder hochladen
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        await logout();
                        setIsMobileMenuOpen(false);
                        navigateTo('home');
                      } catch (error) {
                        console.error('Mobile logout error:', error);
                        setIsMobileMenuOpen(false);
                        navigateTo('home');
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
