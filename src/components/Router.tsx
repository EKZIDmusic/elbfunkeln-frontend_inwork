import { createContext, useContext, useState, ReactNode } from 'react';

type Page =
  | 'home'
  | 'shop'
  | 'product'
  | 'about'
  | 'contact'
  | 'gallery'
  | 'gallery-upload'
  | 'login'
  | 'register'
  | 'reset-password'
  | 'search'
  | 'size-guide'
  | 'care-tips'
  | 'terms'
  | 'privacy'
  | 'imprint'
  | 'withdrawal'
  | '404'
  | '500';

interface RouterContextType {
  currentPage: Page;
  productId?: string;
  blogId?: string;
  category?: string;
  navigateTo: (page: Page, params?: { productId?: string; blogId?: string; category?: string }) => void;
  getParams: () => { productId?: string; blogId?: string; category?: string };
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

export function useRouter() {
  const context = useContext(RouterContext);
  if (context === undefined) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
}

interface RouterProviderProps {
  children: ReactNode;
}

export function RouterProvider({ children }: RouterProviderProps) {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [productId, setProductId] = useState<string>();
  const [blogId, setBlogId] = useState<string>();
  const [category, setCategory] = useState<string>();

  const navigateTo = (page: Page, params?: { productId?: string; blogId?: string; category?: string }) => {
    setCurrentPage(page);
    setProductId(params?.productId);
    setBlogId(params?.blogId);
    setCategory(params?.category);

    // Scroll to top when navigating
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getParams = () => ({
    productId,
    blogId,
    category
  });

  return (
    <RouterContext.Provider value={{ currentPage, productId, blogId, category, navigateTo, getParams }}>
      {children}
    </RouterContext.Provider>
  );
}
