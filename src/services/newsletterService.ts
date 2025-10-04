// Service für Newsletter-Verwaltung mit verbesserter Funktionalität
export interface NewsletterSubscriber {
  id: string;
  email: string;
  name?: string;
  status: 'subscribed' | 'unsubscribed' | 'pending';
  subscribed_at: string;
  unsubscribed_at?: string;
  source: string;
  preferences?: {
    product_updates: boolean;
    promotions: boolean;
    blog_posts: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface NewsletterCampaign {
  id: string;
  title: string;
  subject: string;
  content: string;
  status: 'draft' | 'scheduled' | 'sent';
  scheduled_at?: string;
  sent_at?: string;
  recipients_count: number;
  open_rate: number;
  click_rate: number;
  created_at: string;
  updated_at: string;
}

const SUBSCRIBERS_KEY = 'elbfunkeln:newsletter_subscribers';
const CAMPAIGNS_KEY = 'elbfunkeln:newsletter_campaigns';

// Local storage helpers
const getFromStorage = (key: string): any[] => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const setToStorage = (key: string, data: any[]): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to storage:', error);
  }
};

// Demo-Daten initialisieren
const initializeDemoSubscribers = (): NewsletterSubscriber[] => {
  const demoSubscribers: NewsletterSubscriber[] = [
    {
      id: 'sub-1',
      email: 'sarah.mueller@example.com',
      name: 'Sarah Müller',
      status: 'subscribed',
      subscribed_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      source: 'website',
      preferences: {
        product_updates: true,
        promotions: true,
        blog_posts: false
      },
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'sub-2',
      email: 'maria.wagner@example.com',
      name: 'Maria Wagner',
      status: 'subscribed',
      subscribed_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      source: 'facebook',
      preferences: {
        product_updates: true,
        promotions: false,
        blog_posts: true
      },
      created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'sub-3',
      email: 'lisa.weber@example.com',
      name: 'Lisa Weber',
      status: 'subscribed',
      subscribed_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      source: 'instagram',
      preferences: {
        product_updates: true,
        promotions: true,
        blog_posts: true
      },
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString()
    }
  ];
  
  setToStorage(SUBSCRIBERS_KEY, demoSubscribers);
  return demoSubscribers;
};

const initializeDemoCampaigns = (): NewsletterCampaign[] => {
  const demoCampaigns: NewsletterCampaign[] = [
    {
      id: 'camp-1',
      title: 'Willkommen bei Elbfunkeln',
      subject: '✨ Entdecke handgefertigten Drahtschmuck',
      content: '<h1>Willkommen bei Elbfunkeln!</h1><p>Entdecke unsere einzigartigen, handgefertigten Schmuckstücke...</p>',
      status: 'sent',
      sent_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      recipients_count: 150,
      open_rate: 45.2,
      click_rate: 12.8,
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'camp-2',
      title: 'Neue Frühjahrskollektion',
      subject: '🌸 Neue Frühjahrskollektion ist da!',
      content: '<h1>Frühjahrskollektion 2024</h1><p>Entdecke unsere neuesten Designs...</p>',
      status: 'draft',
      recipients_count: 0,
      open_rate: 0,
      click_rate: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];
  
  setToStorage(CAMPAIGNS_KEY, demoCampaigns);
  return demoCampaigns;
};

// Subscriber-Funktionen
export async function getNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
  try {
    let subscribers = getFromStorage(SUBSCRIBERS_KEY);
    
    if (subscribers.length === 0) {
      subscribers = initializeDemoSubscribers();
    }
    
    return subscribers;
  } catch (error) {
    console.error('Error loading newsletter subscribers:', error);
    return initializeDemoSubscribers();
  }
}

export async function addNewsletterSubscriber(
  email: string, 
  name?: string, 
  source: string = 'website',
  preferences?: NewsletterSubscriber['preferences']
): Promise<NewsletterSubscriber> {
  try {
    const subscribers = await getNewsletterSubscribers();
    
    // Prüfe auf doppelte E-Mail-Adressen
    const existing = subscribers.find(s => s.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      if (existing.status === 'subscribed') {
        throw new Error('E-Mail-Adresse ist bereits abonniert');
      } else {
        // Reaktiviere abgemeldeten Subscriber
        existing.status = 'subscribed';
        existing.subscribed_at = new Date().toISOString();
        existing.updated_at = new Date().toISOString();
        setToStorage(SUBSCRIBERS_KEY, subscribers);
        return existing;
      }
    }
    
    const newSubscriber: NewsletterSubscriber = {
      id: `sub-${Date.now()}`,
      email: email.toLowerCase(),
      name,
      status: 'subscribed',
      subscribed_at: new Date().toISOString(),
      source,
      preferences: preferences || {
        product_updates: true,
        promotions: true,
        blog_posts: false
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const updatedSubscribers = [newSubscriber, ...subscribers];
    setToStorage(SUBSCRIBERS_KEY, updatedSubscribers);
    
    return newSubscriber;
  } catch (error) {
    console.error('Error adding newsletter subscriber:', error);
    throw error;
  }
}

export async function updateNewsletterSubscriber(id: string, updates: Partial<NewsletterSubscriber>): Promise<NewsletterSubscriber> {
  try {
    const subscribers = await getNewsletterSubscribers();
    const index = subscribers.findIndex(s => s.id === id);
    
    if (index === -1) {
      throw new Error('Abonnent nicht gefunden');
    }
    
    const updatedSubscriber = {
      ...subscribers[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    subscribers[index] = updatedSubscriber;
    setToStorage(SUBSCRIBERS_KEY, subscribers);
    
    return updatedSubscriber;
  } catch (error) {
    console.error('Error updating newsletter subscriber:', error);
    throw error;
  }
}

export async function unsubscribeNewsletterSubscriber(id: string): Promise<void> {
  try {
    const subscribers = await getNewsletterSubscribers();
    const index = subscribers.findIndex(s => s.id === id);
    
    if (index !== -1) {
      subscribers[index].status = 'unsubscribed';
      subscribers[index].unsubscribed_at = new Date().toISOString();
      subscribers[index].updated_at = new Date().toISOString();
      setToStorage(SUBSCRIBERS_KEY, subscribers);
    }
  } catch (error) {
    console.error('Error unsubscribing newsletter subscriber:', error);
  }
}

export async function deleteNewsletterSubscriber(id: string): Promise<void> {
  try {
    const subscribers = await getNewsletterSubscribers();
    const filteredSubscribers = subscribers.filter(s => s.id !== id);
    setToStorage(SUBSCRIBERS_KEY, filteredSubscribers);
  } catch (error) {
    console.error('Error deleting newsletter subscriber:', error);
    throw error;
  }
}

// Campaign-Funktionen
export async function getNewsletterCampaigns(): Promise<NewsletterCampaign[]> {
  try {
    let campaigns = getFromStorage(CAMPAIGNS_KEY);
    
    if (campaigns.length === 0) {
      campaigns = initializeDemoCampaigns();
    }
    
    return campaigns;
  } catch (error) {
    console.error('Error loading newsletter campaigns:', error);
    return initializeDemoCampaigns();
  }
}

export async function createNewsletterCampaign(campaignData: Omit<NewsletterCampaign, 'id' | 'recipients_count' | 'open_rate' | 'click_rate' | 'created_at' | 'updated_at'>): Promise<NewsletterCampaign> {
  try {
    const campaigns = await getNewsletterCampaigns();
    
    const newCampaign: NewsletterCampaign = {
      ...campaignData,
      id: `camp-${Date.now()}`,
      recipients_count: 0,
      open_rate: 0,
      click_rate: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const updatedCampaigns = [newCampaign, ...campaigns];
    setToStorage(CAMPAIGNS_KEY, updatedCampaigns);
    
    return newCampaign;
  } catch (error) {
    console.error('Error creating newsletter campaign:', error);
    throw error;
  }
}

export async function updateNewsletterCampaign(id: string, updates: Partial<NewsletterCampaign>): Promise<NewsletterCampaign> {
  try {
    const campaigns = await getNewsletterCampaigns();
    const index = campaigns.findIndex(c => c.id === id);
    
    if (index === -1) {
      throw new Error('Kampagne nicht gefunden');
    }
    
    const updatedCampaign = {
      ...campaigns[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    campaigns[index] = updatedCampaign;
    setToStorage(CAMPAIGNS_KEY, campaigns);
    
    return updatedCampaign;
  } catch (error) {
    console.error('Error updating newsletter campaign:', error);
    throw error;
  }
}

export async function sendNewsletterCampaign(id: string): Promise<NewsletterCampaign> {
  try {
    const [campaigns, subscribers] = await Promise.all([
      getNewsletterCampaigns(),
      getNewsletterSubscribers()
    ]);
    
    const campaignIndex = campaigns.findIndex(c => c.id === id);
    if (campaignIndex === -1) {
      throw new Error('Kampagne nicht gefunden');
    }
    
    const campaign = campaigns[campaignIndex];
    if (campaign.status !== 'draft') {
      throw new Error('Nur Entwürfe können gesendet werden');
    }
    
    const activeSubscribers = subscribers.filter(s => s.status === 'subscribed');
    
    // Simuliere das Senden (in der Realität würde hier ein E-Mail-Service aufgerufen)
    const updatedCampaign = {
      ...campaign,
      status: 'sent' as const,
      sent_at: new Date().toISOString(),
      recipients_count: activeSubscribers.length,
      updated_at: new Date().toISOString()
    };
    
    campaigns[campaignIndex] = updatedCampaign;
    setToStorage(CAMPAIGNS_KEY, campaigns);
    
    return updatedCampaign;
  } catch (error) {
    console.error('Error sending newsletter campaign:', error);
    throw error;
  }
}

export async function deleteNewsletterCampaign(id: string): Promise<void> {
  try {
    const campaigns = await getNewsletterCampaigns();
    const filteredCampaigns = campaigns.filter(c => c.id !== id);
    setToStorage(CAMPAIGNS_KEY, filteredCampaigns);
  } catch (error) {
    console.error('Error deleting newsletter campaign:', error);
    throw error;
  }
}

// Statistiken
export async function getNewsletterStats() {
  try {
    const [subscribers, campaigns] = await Promise.all([
      getNewsletterSubscribers(),
      getNewsletterCampaigns()
    ]);
    
    const now = new Date();
    const thisMonth = subscribers.filter(s => {
      const subDate = new Date(s.subscribed_at);
      return subDate.getMonth() === now.getMonth() && subDate.getFullYear() === now.getFullYear();
    });
    
    const sentCampaigns = campaigns.filter(c => c.status === 'sent');
    const avgOpenRate = sentCampaigns.length > 0 
      ? sentCampaigns.reduce((sum, c) => sum + c.open_rate, 0) / sentCampaigns.length 
      : 0;
    
    return {
      totalSubscribers: subscribers.length,
      activeSubscribers: subscribers.filter(s => s.status === 'subscribed').length,
      newThisMonth: thisMonth.length,
      totalCampaigns: campaigns.length,
      sentCampaigns: sentCampaigns.length,
      avgOpenRate: Math.round(avgOpenRate * 10) / 10,
      bySource: {
        website: subscribers.filter(s => s.source === 'website').length,
        facebook: subscribers.filter(s => s.source === 'facebook').length,
        instagram: subscribers.filter(s => s.source === 'instagram').length,
        manual: subscribers.filter(s => s.source === 'manual').length
      }
    };
  } catch (error) {
    console.error('Error getting newsletter stats:', error);
    return {
      totalSubscribers: 0,
      activeSubscribers: 0,
      newThisMonth: 0,
      totalCampaigns: 0,
      sentCampaigns: 0,
      avgOpenRate: 0,
      bySource: { website: 0, facebook: 0, instagram: 0, manual: 0 }
    };
  }
}