import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { toast } from 'sonner@2.0.3';
import { setCartActions } from './AuthContext';
import apiService, { Product as APIProduct, CartItem as APICartItem } from '../services/apiService';

export interface Product {
  id: string;
  name: string;
  price: number;
  discountPrice?: number | null;
  image: string;
  images?: string[];
  category: string;
  description: string;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  giftboxavailable: boolean;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  productId: string;
}

interface CartContextType {
  items: CartItem[];
  favorites: string[];
  addToCart: (product: CartItem | Product) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getFavoritesCount: () => number;
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  clearAllData: () => void;
  loadUserData: (userId: string) => void;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

interface CartProviderProps {
  children: ReactNode;
}

// Helper functions for localStorage (for favorites and guest cart)
const getUserStorageKey = (userId: string | null, key: string): string => {
  if (!userId) return `elbfunkeln_guest_${key}`;
  return `elbfunkeln_user_${userId}_${key}`;
};

const getStoredFavorites = (userId: string | null): string[] => {
  try {
    const storageKey = getUserStorageKey(userId, 'favorites');
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const setStoredFavorites = (userId: string | null, favorites: string[]): void => {
  try {
    const storageKey = getUserStorageKey(userId, 'favorites');
    localStorage.setItem(storageKey, JSON.stringify(favorites));
  } catch (error) {
    console.error('Error saving favorites:', error);
  }
};

// Map API CartItem to local CartItem
const mapAPICartItemToLocal = (apiItem: APICartItem): CartItem => {
  const primaryImage = apiItem.product.images.find(img => img.isPrimary);
  const imageUrl = primaryImage?.url || apiItem.product.images[0]?.url || '';
  
  return {
    id: apiItem.id,
    productId: apiItem.productId,
    name: apiItem.product.name,
    price: apiItem.product.discountPrice || apiItem.product.price,
    image: imageUrl,
    quantity: apiItem.quantity,
  };
};

export function CartProvider({ children }: CartProviderProps) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Initialize cart and favorites
  useEffect(() => {
    // Load favorites from localStorage
    const storedFavorites = getStoredFavorites(null);
    setFavorites(storedFavorites);

    // Register cart actions with AuthContext
    setCartActions({
      clearAllData: () => {
        setItems([]);
        setCurrentUserId(null);
      },
      loadUserData: async (userId: string) => {
        setCurrentUserId(userId);
        await loadCartFromAPI();
        // Load user-specific favorites
        const userFavorites = getStoredFavorites(userId);
        setFavorites(userFavorites);
      },
    });
  }, []);

  // Load cart from API
  const loadCartFromAPI = async () => {
    try {
      setLoading(true);
      const cart = await apiService.cart.get();
      const mappedItems = cart.items.map(mapAPICartItemToLocal);
      setItems(mappedItems);
    } catch (error) {
      console.error('Error loading cart:', error);
      // If not authenticated, cart will be empty
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product: CartItem | Product) => {
    try {
      setLoading(true);
      
      // Determine productId
      const productId = 'productId' in product ? product.productId : product.id;
      
      // Check if item already exists in cart
      const existingItem = items.find(item => item.productId === productId);
      
      if (existingItem) {
        // Update quantity
        await apiService.cart.updateItem(existingItem.id, {
          quantity: existingItem.quantity + 1
        });
        
        setItems(items.map(item =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
        
        toast.success('Menge aktualisiert', {
          description: `${product.name} wurde im Warenkorb aktualisiert`
        });
      } else {
        // Add new item
        const apiItem = await apiService.cart.addItem({
          productId,
          quantity: 1
        });
        
        const newItem = mapAPICartItemToLocal(apiItem);
        setItems([...items, newItem]);
        
        toast.success('In den Warenkorb gelegt', {
          description: `${product.name} wurde hinzugefügt`
        });
      }
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      toast.error('Fehler beim Hinzufügen', {
        description: error.message || 'Bitte melde dich an, um Produkte in den Warenkorb zu legen.'
      });
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      setLoading(true);
      
      const item = items.find(i => i.productId === productId);
      if (!item) return;
      
      await apiService.cart.removeItem(item.id);
      
      const removedItem = items.find(item => item.productId === productId);
      setItems(items.filter(item => item.productId !== productId));
      
      if (removedItem) {
        toast.info('Aus dem Warenkorb entfernt', {
          description: `${removedItem.name} wurde entfernt`
        });
      }
    } catch (error: any) {
      console.error('Error removing from cart:', error);
      toast.error('Fehler beim Entfernen', {
        description: error.message || 'Bitte versuche es später erneut.'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity < 1) {
      await removeFromCart(productId);
      return;
    }

    try {
      setLoading(true);
      
      const item = items.find(i => i.productId === productId);
      if (!item) return;
      
      await apiService.cart.updateItem(item.id, { quantity });
      
      setItems(items.map(item =>
        item.productId === productId
          ? { ...item, quantity }
          : item
      ));
    } catch (error: any) {
      console.error('Error updating quantity:', error);
      toast.error('Fehler beim Aktualisieren', {
        description: error.message || 'Bitte versuche es später erneut.'
      });
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      
      await apiService.cart.clear();
      
      setItems([]);
      toast.success('Warenkorb geleert');
    } catch (error: any) {
      console.error('Error clearing cart:', error);
      toast.error('Fehler beim Leeren', {
        description: error.message || 'Bitte versuche es später erneut.'
      });
    } finally {
      setLoading(false);
    }
  };

  const getTotalItems = (): number => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getTotalPrice = (): number => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const getFavoritesCount = (): number => {
    return favorites.length;
  };

  const toggleFavorite = (productId: string) => {
    const newFavorites = favorites.includes(productId)
      ? favorites.filter(id => id !== productId)
      : [...favorites, productId];
    
    setFavorites(newFavorites);
    setStoredFavorites(currentUserId, newFavorites);
    
    if (newFavorites.includes(productId)) {
      toast.success('Zu Favoriten hinzugefügt');
    } else {
      toast.info('Von Favoriten entfernt');
    }
  };

  const isFavorite = (productId: string): boolean => {
    return favorites.includes(productId);
  };

  const clearAllData = () => {
    setItems([]);
    setCurrentUserId(null);
  };

  const loadUserData = async (userId: string) => {
    setCurrentUserId(userId);
    await loadCartFromAPI();
    const userFavorites = getStoredFavorites(userId);
    setFavorites(userFavorites);
  };

  return (
    <CartContext.Provider value={{
      items,
      favorites,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalItems,
      getTotalPrice,
      getFavoritesCount,
      toggleFavorite,
      isFavorite,
      clearAllData,
      loadUserData,
      loading,
    }}>
      {children}
    </CartContext.Provider>
  );
}
