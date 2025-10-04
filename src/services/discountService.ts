// Service für Rabattcode-Verwaltung mit Persistierung
export interface DiscountCode {
  id: string;
  code: string;
  description: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrder: number;
  maxUses: number;
  currentUses: number;
  validFrom: string;
  validUntil: string;
  categories?: string[];
  isActive: boolean;
  created_at: string;
  updated_at: string;
}

const STORAGE_KEY = 'elbfunkeln:discount_codes';

// Local storage helpers
const getFromStorage = (): DiscountCode[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const setToStorage = (codes: DiscountCode[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(codes));
  } catch (error) {
    console.error('Error saving discount codes:', error);
  }
};

// Demo-Daten für den Anfang
const initializeDemoData = (): DiscountCode[] => {
  const demoCodes: DiscountCode[] = [
    {
      id: 'disc-1',
      code: 'WELCOME10',
      description: 'Willkommensrabatt für Neukunden',
      type: 'percentage',
      value: 10,
      minOrder: 50,
      maxUses: 100,
      currentUses: 23,
      validFrom: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      categories: [],
      isActive: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'disc-2',
      code: 'SUMMER25',
      description: 'Sommerrabatt für alle Ohrringe',
      type: 'percentage',
      value: 25,
      minOrder: 0,
      maxUses: 50,
      currentUses: 8,
      validFrom: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      categories: ['Ohrringe'],
      isActive: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];
  
  setToStorage(demoCodes);
  return demoCodes;
};

// Service-Funktionen
export async function getDiscountCodes(): Promise<DiscountCode[]> {
  try {
    let codes = getFromStorage();
    
    // Initialisiere Demo-Daten wenn keine vorhanden
    if (codes.length === 0) {
      codes = initializeDemoData();
    }
    
    return codes;
  } catch (error) {
    console.error('Error loading discount codes:', error);
    return initializeDemoData();
  }
}

export async function createDiscountCode(codeData: Omit<DiscountCode, 'id' | 'currentUses' | 'created_at' | 'updated_at'>): Promise<DiscountCode> {
  try {
    const codes = await getDiscountCodes();
    
    // Prüfe auf doppelte Codes
    const existingCode = codes.find(c => c.code.toUpperCase() === codeData.code.toUpperCase());
    if (existingCode) {
      throw new Error('Ein Rabattcode mit diesem Namen existiert bereits');
    }
    
    const newCode: DiscountCode = {
      ...codeData,
      id: `disc-${Date.now()}`,
      currentUses: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const updatedCodes = [newCode, ...codes];
    setToStorage(updatedCodes);
    
    return newCode;
  } catch (error) {
    console.error('Error creating discount code:', error);
    throw error;
  }
}

export async function updateDiscountCode(id: string, updates: Partial<DiscountCode>): Promise<DiscountCode> {
  try {
    const codes = await getDiscountCodes();
    const index = codes.findIndex(c => c.id === id);
    
    if (index === -1) {
      throw new Error('Rabattcode nicht gefunden');
    }
    
    // Prüfe auf doppelte Codes (außer dem aktuellen)
    if (updates.code) {
      const existingCode = codes.find((c, i) => 
        i !== index && c.code.toUpperCase() === updates.code!.toUpperCase()
      );
      if (existingCode) {
        throw new Error('Ein Rabattcode mit diesem Namen existiert bereits');
      }
    }
    
    const updatedCode = {
      ...codes[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    codes[index] = updatedCode;
    setToStorage(codes);
    
    return updatedCode;
  } catch (error) {
    console.error('Error updating discount code:', error);
    throw error;
  }
}

export async function deleteDiscountCode(id: string): Promise<void> {
  try {
    const codes = await getDiscountCodes();
    const filteredCodes = codes.filter(c => c.id !== id);
    setToStorage(filteredCodes);
  } catch (error) {
    console.error('Error deleting discount code:', error);
    throw error;
  }
}

export async function toggleDiscountCodeStatus(id: string): Promise<DiscountCode> {
  try {
    const codes = await getDiscountCodes();
    const index = codes.findIndex(c => c.id === id);
    
    if (index === -1) {
      throw new Error('Rabattcode nicht gefunden');
    }
    
    const updatedCode = {
      ...codes[index],
      isActive: !codes[index].isActive,
      updated_at: new Date().toISOString()
    };
    
    codes[index] = updatedCode;
    setToStorage(codes);
    
    return updatedCode;
  } catch (error) {
    console.error('Error toggling discount code status:', error);
    throw error;
  }
}

// Validierung für Frontend-Verwendung
export async function validateDiscountCode(code: string, orderTotal: number, categories: string[] = []): Promise<{
  valid: boolean;
  discount?: DiscountCode;
  error?: string;
  discountAmount?: number;
}> {
  try {
    const codes = await getDiscountCodes();
    const discount = codes.find(c => 
      c.code.toUpperCase() === code.toUpperCase() && 
      c.isActive
    );
    
    if (!discount) {
      return { valid: false, error: 'Rabattcode nicht gefunden oder inaktiv' };
    }
    
    // Prüfe Gültigkeit
    const now = new Date();
    const validFrom = new Date(discount.validFrom);
    const validUntil = new Date(discount.validUntil);
    
    if (now < validFrom) {
      return { valid: false, error: 'Rabattcode ist noch nicht gültig' };
    }
    
    if (now > validUntil) {
      return { valid: false, error: 'Rabattcode ist abgelaufen' };
    }
    
    // Prüfe Verwendungsanzahl
    if (discount.currentUses >= discount.maxUses) {
      return { valid: false, error: 'Rabattcode wurde bereits zu oft verwendet' };
    }
    
    // Prüfe Mindestbestellwert
    if (orderTotal < discount.minOrder) {
      return { 
        valid: false, 
        error: `Mindestbestellwert von ${discount.minOrder.toFixed(2)}€ erforderlich` 
      };
    }
    
    // Prüfe Kategorien (wenn gesetzt)
    if (discount.categories && discount.categories.length > 0) {
      const hasMatchingCategory = discount.categories.some(cat => categories.includes(cat));
      if (!hasMatchingCategory) {
        return { 
          valid: false, 
          error: `Rabattcode gilt nur für: ${discount.categories.join(', ')}` 
        };
      }
    }
    
    // Berechne Rabattbetrag
    let discountAmount = 0;
    if (discount.type === 'percentage') {
      discountAmount = (orderTotal * discount.value) / 100;
    } else {
      discountAmount = Math.min(discount.value, orderTotal);
    }
    
    return { 
      valid: true, 
      discount, 
      discountAmount: Math.round(discountAmount * 100) / 100 
    };
  } catch (error) {
    console.error('Error validating discount code:', error);
    return { valid: false, error: 'Fehler bei der Rabattcode-Validierung' };
  }
}

// Verwendung eines Rabattcodes (für Bestellungen)
export async function useDiscountCode(code: string): Promise<void> {
  try {
    const codes = await getDiscountCodes();
    const index = codes.findIndex(c => c.code.toUpperCase() === code.toUpperCase());
    
    if (index !== -1) {
      codes[index].currentUses += 1;
      codes[index].updated_at = new Date().toISOString();
      setToStorage(codes);
    }
  } catch (error) {
    console.error('Error using discount code:', error);
  }
}