// Service für die Ticket-Erstellung und -Verwaltung
import { useState } from 'react';

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
  sku?: string;
}

interface TicketMessage {
  id: string;
  sender: 'customer' | 'admin' | 'system';
  sender_name: string;
  message: string;
  timestamp: string;
  attachments?: string[];
}

interface UnifiedTicket {
  id: string;
  ticket_number: string;
  type: 'order' | 'return' | 'support' | 'complaint' | 'payment';
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  subject: string;
  category: 'order_status' | 'payment' | 'shipping' | 'return' | 'complaint' | 'general' | 'technical' | 'product_question';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
  updated_at: string;
  assigned_to?: string;
  tags: string[];
  messages: TicketMessage[];
  
  // Order-spezifische Felder
  order_id?: string;
  order_total?: number;
  order_items?: OrderItem[];
  payment_status?: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
  tracking_number?: string;
  shipping_address?: string;
  
  // Return-spezifische Felder
  return_reason?: string;
  return_status?: 'requested' | 'approved' | 'declined' | 'received' | 'refunded';
  refund_amount?: number;
  return_items?: OrderItem[];
  
  auto_notifications: boolean;
}

// Global ticket storage (in production würde das über eine Datenbank laufen)
let globalTickets: UnifiedTicket[] = [];
let ticketIdCounter = 1;

export const ticketService = {
  // Bestellungsticket erstellen
  createOrderTicket: (orderData: {
    orderId: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    orderTotal: number;
    orderItems: OrderItem[];
    shippingAddress: string;
    paymentStatus: 'pending' | 'paid' | 'failed';
  }): UnifiedTicket => {
    const ticketNumber = `TIC-${String(ticketIdCounter++).padStart(3, '0')}`;
    
    const newTicket: UnifiedTicket = {
      id: `ticket-${Date.now()}`,
      ticket_number: ticketNumber,
      type: 'order',
      customer_name: orderData.customerName,
      customer_email: orderData.customerEmail,
      customer_phone: orderData.customerPhone,
      subject: `Neue Bestellung - ${orderData.orderItems[0]?.product_name || 'Bestellung'}`,
      category: 'order_status',
      priority: 'medium',
      status: orderData.paymentStatus === 'paid' ? 'in_progress' : 'open',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tags: ['new_order', ...orderData.orderItems.map(item => 
        item.product_name.toLowerCase().split(' ')[0]
      ).slice(0, 3)],
      order_id: orderData.orderId,
      order_total: orderData.orderTotal,
      payment_status: orderData.paymentStatus,
      shipping_address: orderData.shippingAddress,
      order_items: orderData.orderItems,
      auto_notifications: true,
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: 'system',
          sender_name: 'System',
          message: `Neue Bestellung eingegangen. ${
            orderData.paymentStatus === 'paid' 
              ? 'Zahlung erfolgreich bestätigt.' 
              : 'Warten auf Zahlungsbestätigung.'
          } Bestellwert: ${orderData.orderTotal.toFixed(2)}€`,
          timestamp: new Date().toISOString()
        }
      ]
    };

    globalTickets.unshift(newTicket);
    
    // In Produktion: API Call zum Backend
    console.log('🎫 Neues Bestellungsticket erstellt:', ticketNumber);
    
    // Automatische Benachrichtigung simulieren
    setTimeout(() => {
      console.log(`📧 E-Mail-Benachrichtigung an ${orderData.customerName} gesendet`);
    }, 1000);

    return newTicket;
  },

  // Retourenticket erstellen
  createReturnTicket: (returnData: {
    orderId: string;
    customerName: string;
    customerEmail: string;
    returnReason: string;
    returnItems: OrderItem[];
    refundAmount: number;
  }): UnifiedTicket => {
    const ticketNumber = `TIC-${String(ticketIdCounter++).padStart(3, '0')}`;
    
    const newTicket: UnifiedTicket = {
      id: `ticket-${Date.now()}`,
      ticket_number: ticketNumber,
      type: 'return',
      customer_name: returnData.customerName,
      customer_email: returnData.customerEmail,
      subject: `Retourenantrag - ${returnData.returnItems[0]?.product_name || 'Artikel'}`,
      category: 'return',
      priority: 'high',
      status: 'open',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tags: ['return', 'refund_request', 'needs_approval'],
      order_id: returnData.orderId,
      return_reason: returnData.returnReason,
      return_status: 'requested',
      refund_amount: returnData.refundAmount,
      return_items: returnData.returnItems,
      auto_notifications: true,
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: 'customer',
          sender_name: returnData.customerName,
          message: `Retourenantrag eingereicht. Grund: ${returnData.returnReason}. Erstattungsbetrag: ${returnData.refundAmount.toFixed(2)}€`,
          timestamp: new Date().toISOString()
        }
      ]
    };

    globalTickets.unshift(newTicket);
    
    console.log('🔄 Neues Retourenticket erstellt:', ticketNumber);
    
    return newTicket;
  },

  // Support-Ticket erstellen
  createSupportTicket: (supportData: {
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    subject: string;
    message: string;
    category: 'general' | 'technical' | 'product_question' | 'complaint';
    priority?: 'low' | 'medium' | 'high' | 'urgent';
  }): UnifiedTicket => {
    const ticketNumber = `TIC-${String(ticketIdCounter++).padStart(3, '0')}`;
    
    const newTicket: UnifiedTicket = {
      id: `ticket-${Date.now()}`,
      ticket_number: ticketNumber,
      type: 'support',
      customer_name: supportData.customerName,
      customer_email: supportData.customerEmail,
      customer_phone: supportData.customerPhone,
      subject: supportData.subject,
      category: supportData.category,
      priority: supportData.priority || 'medium',
      status: 'open',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tags: ['support', supportData.category],
      auto_notifications: true,
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: 'customer',
          sender_name: supportData.customerName,
          message: supportData.message,
          timestamp: new Date().toISOString()
        }
      ]
    };

    globalTickets.unshift(newTicket);
    
    console.log('💬 Neues Support-Ticket erstellt:', ticketNumber);
    
    return newTicket;
  },

  // Alle Tickets abrufen
  getAllTickets: (): UnifiedTicket[] => {
    return [...globalTickets];
  },

  // Ticket-Status aktualisieren
  updateTicketStatus: (ticketId: string, newStatus: UnifiedTicket['status']): boolean => {
    const ticketIndex = globalTickets.findIndex(t => t.id === ticketId);
    if (ticketIndex !== -1) {
      globalTickets[ticketIndex].status = newStatus;
      globalTickets[ticketIndex].updated_at = new Date().toISOString();
      
      // System-Nachricht hinzufügen
      const systemMessage: TicketMessage = {
        id: `msg-${Date.now()}`,
        sender: 'system',
        sender_name: 'System',
        message: `Status geändert zu: ${newStatus}`,
        timestamp: new Date().toISOString()
      };
      
      globalTickets[ticketIndex].messages.push(systemMessage);
      
      console.log(`📋 Ticket ${globalTickets[ticketIndex].ticket_number} Status aktualisiert: ${newStatus}`);
      return true;
    }
    return false;
  },

  // Nachricht zu Ticket hinzufügen
  addMessageToTicket: (ticketId: string, message: Omit<TicketMessage, 'id' | 'timestamp'>): boolean => {
    const ticketIndex = globalTickets.findIndex(t => t.id === ticketId);
    if (ticketIndex !== -1) {
      const newMessage: TicketMessage = {
        ...message,
        id: `msg-${Date.now()}`,
        timestamp: new Date().toISOString()
      };
      
      globalTickets[ticketIndex].messages.push(newMessage);
      globalTickets[ticketIndex].updated_at = new Date().toISOString();
      
      // Status auf "in_progress" setzen wenn Admin antwortet
      if (message.sender === 'admin' && globalTickets[ticketIndex].status === 'open') {
        globalTickets[ticketIndex].status = 'in_progress';
      }
      
      console.log(`💬 Nachricht zu Ticket ${globalTickets[ticketIndex].ticket_number} hinzugefügt`);
      return true;
    }
    return false;
  },

  // Ticket-Statistiken
  getTicketStats: () => {
    const stats = {
      total: globalTickets.length,
      open: globalTickets.filter(t => t.status === 'open').length,
      inProgress: globalTickets.filter(t => t.status === 'in_progress').length,
      resolved: globalTickets.filter(t => t.status === 'resolved').length,
      closed: globalTickets.filter(t => t.status === 'closed').length,
      
      // Nach Typ
      orders: globalTickets.filter(t => t.type === 'order').length,
      returns: globalTickets.filter(t => t.type === 'return').length,
      support: globalTickets.filter(t => t.type === 'support').length,
      
      // Nach Priorität
      urgent: globalTickets.filter(t => t.priority === 'urgent').length,
      high: globalTickets.filter(t => t.priority === 'high').length,
      
      // Bestellstatus
      shipped: globalTickets.filter(t => t.status === 'shipped').length,
      delivered: globalTickets.filter(t => t.status === 'delivered').length,
    };
    
    return stats;
  },

  // Initialisierung mit Mock-Daten (für Demo)
  initializeMockData: () => {
    if (globalTickets.length === 0) {
      // Hier würden die Mock-Tickets aus dem IntegratedTicketSystem hinzugefügt
      ticketIdCounter = 5; // Nach den Mock-Daten
      console.log('🔄 Ticket-Service mit Mock-Daten initialisiert');
    }
  }
};

// Hook für React-Komponenten
export const useTicketService = () => {
  const [tickets, setTickets] = useState<UnifiedTicket[]>([]);
  
  const refreshTickets = () => {
    setTickets(ticketService.getAllTickets());
  };
  
  return {
    tickets,
    refreshTickets,
    createOrderTicket: ticketService.createOrderTicket,
    createReturnTicket: ticketService.createReturnTicket,
    createSupportTicket: ticketService.createSupportTicket,
    updateTicketStatus: ticketService.updateTicketStatus,
    addMessageToTicket: ticketService.addMessageToTicket,
    getTicketStats: ticketService.getTicketStats
  };
};