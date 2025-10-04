import { createContext, useContext, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import apiService, { GiftCard as APIGiftCard } from '../services/apiService';
import { toast } from 'sonner@2.0.3';

interface GiftCardContextType {
  validateGiftCard: (code: string) => Promise<APIGiftCard | null>;
  getGiftCardByCode: (code: string) => Promise<APIGiftCard | null>;
  isLoading: boolean;
}

const GiftCardContext = createContext<GiftCardContextType | undefined>(undefined);

export function useGiftCards() {
  const context = useContext(GiftCardContext);
  if (context === undefined) {
    throw new Error('useGiftCards must be used within a GiftCardProvider');
  }
  return context;
}

interface GiftCardProviderProps {
  children: ReactNode;
}

export function GiftCardProvider({ children }: GiftCardProviderProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const validateGiftCard = async (code: string): Promise<APIGiftCard | null> => {
    setIsLoading(true);
    try {
      const giftCard = await apiService.giftCards.getByCode(code);
      
      if (!giftCard.isActive) {
        toast.error('Geschenkkarte ungültig', {
          description: 'Diese Geschenkkarte ist nicht mehr aktiv.'
        });
        return null;
      }
      
      if (giftCard.expiresAt && new Date(giftCard.expiresAt) < new Date()) {
        toast.error('Geschenkkarte abgelaufen', {
          description: 'Diese Geschenkkarte ist leider abgelaufen.'
        });
        return null;
      }
      
      if (giftCard.balance <= 0) {
        toast.error('Geschenkkarte aufgebraucht', {
          description: 'Das Guthaben dieser Geschenkkarte wurde bereits vollständig verwendet.'
        });
        return null;
      }
      
      toast.success('Geschenkkarte gültig!', {
        description: `Verfügbares Guthaben: ${giftCard.balance.toFixed(2)} €`
      });
      
      return giftCard;
    } catch (error: any) {
      console.error('Error validating gift card:', error);
      toast.error('Geschenkkarte nicht gefunden', {
        description: 'Bitte überprüfe den Code und versuche es erneut.'
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getGiftCardByCode = async (code: string): Promise<APIGiftCard | null> => {
    setIsLoading(true);
    try {
      const giftCard = await apiService.giftCards.getByCode(code);
      return giftCard;
    } catch (error) {
      console.error('Error getting gift card:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GiftCardContext.Provider
      value={{
        validateGiftCard,
        getGiftCardByCode,
        isLoading,
      }}
    >
      {children}
    </GiftCardContext.Provider>
  );
}
