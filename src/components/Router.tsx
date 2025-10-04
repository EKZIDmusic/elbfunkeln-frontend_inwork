import { createContext, useContext, useState, ReactNode } from 'react';

type Page = 
  | 'home' 
  | 'shop' 
  | 'product' 
  | 'cart' 
  | 'checkout' 
  | 'order-success'
  | 'about' 
  | 'contact' 
  | 'blog' 
  | 'account' 
  | 'faq'
  | 'login'
  | 'register'
  | 'reset-password'
  | 'admin'
  | 'admin-dashboard'
  | 'admin-data'
  | 'admin-slider-test'
  | 'search'
  | 'favorites'
  | 'shipping'
  | 'returns'
  | 'size-guide'
  | 'care-tips'
  | 'terms'
  | 'privacy'
  | 'imprint'
  | 'withdrawal'
  | 'gift-cards'
  | '404'
  | '500';

interface RouterContextType {
  currentPage: Page;
  productId?: string;
  blogId?: string;
  category?: string;
  orderId?: string;
  navigateTo: (page: Page, params?: { productId?: string; blogId?: string; category?: string; orderId?: string }) => void;
  getParams: () => { productId?: string; blogId?: string; category?: string; orderId?: string };
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
  const [orderId, setOrderId] = useState<string>();

  const navigateTo = (page: Page, params?: { productId?: string; blogId?: string; category?: string; orderId?: string }) => {
    setCurrentPage(page);
    setProductId(params?.productId);
    setBlogId(params?.blogId);
    setCategory(params?.category);
    setOrderId(params?.orderId);
    
    // Scroll to top when navigating
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getParams = () => ({
    productId,
    blogId,
    category,
    orderId
  });

  return (
    <RouterContext.Provider value={{ currentPage, productId, blogId, category, orderId, navigateTo, getParams }}>
      {children}
    </RouterContext.Provider>
  );
}