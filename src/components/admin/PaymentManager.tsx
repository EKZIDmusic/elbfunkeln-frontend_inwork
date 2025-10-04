import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  CreditCard, Search, Eye, RefreshCw, Calendar,
  DollarSign, AlertTriangle, CheckCircle, XCircle, 
  Mail, Send, Clock, FileText, Download,
  TrendingUp, TrendingDown, Minus, Euro,
  Bell, Archive, Filter, Zap
} from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Textarea } from '../ui/textarea';
import { Progress } from '../ui/progress';
import { useAuth } from '../AuthContext';

interface PaymentTransaction {
  id: string;
  order_id: string;
  customer_name: string;
  customer_email: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'disputed' | 'overdue';
  payment_method: 'credit_card' | 'paypal' | 'bank_transfer' | 'klarna' | 'apple_pay';
  created_at: string;
  due_date?: string;
  completed_at?: string;
  failure_reason?: string;
  reminder_count: number;
  last_reminder?: string;
  notes: string;
}

interface PaymentReminder {
  id: string;
  transaction_id: string;
  type: 'first_reminder' | 'second_reminder' | 'final_notice' | 'dunning';
  sent_at: string;
  template_used: string;
  response_received: boolean;
}

// Mock data für Demo-Zwecke
const mockTransactions: PaymentTransaction[] = [
  {
    id: 'PAY-001',
    order_id: 'ORD-12345',
    customer_name: 'Anna Müller',
    customer_email: 'anna.mueller@email.com',
    amount: 89.99,
    currency: 'EUR',
    status: 'overdue',
    payment_method: 'bank_transfer',
    created_at: '2024-01-10T10:30:00Z',
    due_date: '2024-01-13T23:59:59Z',
    reminder_count: 2,
    last_reminder: '2024-01-16T10:00:00Z',
    notes: 'Kunde hat um Zahlungsaufschub gebeten'
  },
  {
    id: 'PAY-002',
    order_id: 'ORD-12346',
    customer_name: 'Maria Schmidt',
    customer_email: 'maria.schmidt@email.com',
    amount: 129.99,
    currency: 'EUR',
    status: 'failed',
    payment_method: 'credit_card',
    created_at: '2024-01-14T15:45:00Z',
    failure_reason: 'Karte abgelehnt - unzureichende Deckung',
    reminder_count: 1,
    last_reminder: '2024-01-15T09:20:00Z',
    notes: 'Kunde kontaktiert - neue Zahlungsmethode angefordert'
  },
  {
    id: 'PAY-003',
    order_id: 'ORD-12347',
    customer_name: 'Lisa Weber',
    customer_email: 'lisa.weber@email.com',
    amount: 149.99,
    currency: 'EUR',
    status: 'completed',
    payment_method: 'paypal',
    created_at: '2024-01-12T08:15:00Z',
    completed_at: '2024-01-12T08:16:00Z',
    reminder_count: 0,
    notes: 'Zahlung erfolgreich abgeschlossen'
  },
  {
    id: 'PAY-004',
    order_id: 'ORD-12348',
    customer_name: 'Tom Fischer',
    customer_email: 'tom.fischer@email.com',
    amount: 79.99,
    currency: 'EUR',
    status: 'pending',
    payment_method: 'klarna',
    created_at: '2024-01-15T14:20:00Z',
    due_date: '2024-01-18T23:59:59Z',
    reminder_count: 0,
    notes: 'Klarna-Zahlung in Bearbeitung'
  }
];

const mockReminders: PaymentReminder[] = [
  {
    id: 'REM-001',
    transaction_id: 'PAY-001',
    type: 'first_reminder',
    sent_at: '2024-01-14T10:00:00Z',
    template_used: 'Freundliche Erinnerung',
    response_received: false
  },
  {
    id: 'REM-002',
    transaction_id: 'PAY-001',
    type: 'second_reminder',
    sent_at: '2024-01-16T10:00:00Z',
    template_used: 'Zweite Mahnung',
    response_received: true
  }
];

export function PaymentManager() {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>(mockTransactions);
  const [reminders, setReminders] = useState<PaymentReminder[]>(mockReminders);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedMethod, setSelectedMethod] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState<PaymentTransaction | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showReminderDialog, setShowReminderDialog] = useState(false);
  const [reminderType, setReminderType] = useState<PaymentReminder['type']>('first_reminder');
  const [reminderMessage, setReminderMessage] = useState('');

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = searchQuery === '' || 
      transaction.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.customer_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.order_id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || transaction.status === selectedStatus;
    const matchesMethod = selectedMethod === 'all' || transaction.payment_method === selectedMethod;
    
    return matchesSearch && matchesStatus && matchesMethod;
  });

  const getStatusLabel = (status: string) => {
    const statusLabels: Record<string, string> = {
      pending: 'Ausstehend',
      completed: 'Abgeschlossen',
      failed: 'Fehlgeschlagen',
      refunded: 'Rückerstattet',
      disputed: 'Bestritten',
      overdue: 'Überfällig'
    };
    return statusLabels[status] || status;
  };

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      failed: 'bg-red-100 text-red-800 border-red-200',
      refunded: 'bg-blue-100 text-blue-800 border-blue-200',
      disputed: 'bg-purple-100 text-purple-800 border-purple-200',
      overdue: 'bg-red-100 text-red-800 border-red-200'
    };
    
    return (
      <Badge className={statusStyles[status] || statusStyles.pending}>
        {getStatusLabel(status)}
      </Badge>
    );
  };

  const getPaymentMethodLabel = (method: string) => {
    const methodLabels: Record<string, string> = {
      credit_card: 'Kreditkarte',
      paypal: 'PayPal',
      bank_transfer: 'Überweisung',
      klarna: 'Klarna',
      apple_pay: 'Apple Pay'
    };
    return methodLabels[method] || method;
  };

  const getReminderTypeLabel = (type: string) => {
    const typeLabels: Record<string, string> = {
      first_reminder: 'Erste Erinnerung',
      second_reminder: 'Zweite Mahnung',
      final_notice: 'Letzte Mahnung',
      dunning: 'Inkasso-Androhung'
    };
    return typeLabels[type] || type;
  };

  const isOverdue = (transaction: PaymentTransaction) => {
    if (!transaction.due_date) return false;
    return new Date(transaction.due_date) < new Date() && transaction.status === 'pending';
  };

  const getDaysOverdue = (transaction: PaymentTransaction) => {
    if (!transaction.due_date) return 0;
    const diffTime = new Date().getTime() - new Date(transaction.due_date).getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const sendReminder = () => {
    if (!selectedTransaction || !reminderMessage.trim()) return;

    const newReminder: PaymentReminder = {
      id: `REM-${Date.now()}`,
      transaction_id: selectedTransaction.id,
      type: reminderType,
      sent_at: new Date().toISOString(),
      template_used: getReminderTypeLabel(reminderType),
      response_received: false
    };

    setReminders([...reminders, newReminder]);
    
    const updatedTransaction = {
      ...selectedTransaction,
      reminder_count: selectedTransaction.reminder_count + 1,
      last_reminder: new Date().toISOString()
    };

    setTransactions(transactions.map(t => 
      t.id === selectedTransaction.id ? updatedTransaction : t
    ));
    
    setSelectedTransaction(updatedTransaction);
    setShowReminderDialog(false);
    setReminderMessage('');
    
    alert(`${getReminderTypeLabel(reminderType)} wurde an ${selectedTransaction.customer_name} gesendet.`);
  };

  const handleStatusUpdate = (transactionId: string, newStatus: PaymentTransaction['status']) => {
    setTransactions(transactions.map(t => 
      t.id === transactionId 
        ? { 
            ...t, 
            status: newStatus,
            completed_at: newStatus === 'completed' ? new Date().toISOString() : t.completed_at
          }
        : t
    ));
  };

  const processRefund = (transactionId: string, refundAmount: number) => {
    setTransactions(transactions.map(t => 
      t.id === transactionId 
        ? { ...t, status: 'refunded' as const }
        : t
    ));
    
    alert(`Rückerstattung von ${refundAmount.toFixed(2)}€ wurde bearbeitet.`);
  };

  // Calculate stats
  const stats = {
    total: transactions.length,
    pending: transactions.filter(t => t.status === 'pending').length,
    overdue: transactions.filter(t => isOverdue(t)).length,
    failed: transactions.filter(t => t.status === 'failed').length,
    totalAmount: transactions.reduce((sum, t) => sum + t.amount, 0),
    overdueAmount: transactions.filter(t => isOverdue(t)).reduce((sum, t) => sum + t.amount, 0),
    completedAmount: transactions.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.amount, 0)
  };

  const reminderTemplates = {
    first_reminder: `Liebe/r {{customer_name}},

wir möchten Sie freundlich daran erinnern, dass die Zahlung für Ihre Bestellung {{order_id}} noch aussteht.

Bestellbetrag: {{amount}}€
Fälligkeitsdatum: {{due_date}}

Falls Sie die Zahlung bereits getätigt haben, können Sie diese E-Mail ignorieren.

Mit freundlichen Grüßen
Ihr Elbfunkeln Team`,

    second_reminder: `Liebe/r {{customer_name}},

trotz unserer ersten Erinnerung ist die Zahlung für Ihre Bestellung {{order_id}} noch nicht bei uns eingegangen.

Bestellbetrag: {{amount}}€
Ursprüngliches Fälligkeitsdatum: {{due_date}}

Bitte begleichen Sie den offenen Betrag innerhalb der nächsten 7 Tage.

Mit freundlichen Grüßen
Ihr Elbfunkeln Team`,

    final_notice: `Liebe/r {{customer_name}},

dies ist unsere letzte Mahnung für die überfällige Zahlung Ihrer Bestellung {{order_id}}.

Offener Betrag: {{amount}}€
Tage überfällig: {{days_overdue}}

Falls keine Zahlung innerhalb von 5 Werktagen erfolgt, werden wir rechtliche Schritte einleiten.

Mit freundlichen Grüßen
Ihr Elbfunkeln Team`
  };

  return (
    <div className="space-y-6">
      {/* Payment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="p-4 border-elbfunkeln-green/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Gesamt Transaktionen</p>
              <p className="text-2xl font-semibold text-elbfunkeln-green">{stats.total}</p>
            </div>
            <CreditCard className="h-8 w-8 text-elbfunkeln-green" />
          </div>
        </Card>
        
        <Card className="p-4 border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ausstehend</p>
              <p className="text-2xl font-semibold text-yellow-600">{stats.pending}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </Card>
        
        <Card className="p-4 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Überfällig</p>
              <p className="text-2xl font-semibold text-red-600">{stats.overdue}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </Card>
        
        <Card className="p-4 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Fehlgeschlagen</p>
              <p className="text-2xl font-semibold text-red-600">{stats.failed}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
        </Card>
        
        <Card className="p-4 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Abgeschlossen</p>
              <p className="text-2xl font-semibold text-green-600">{stats.completedAmount.toFixed(0)}€</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </Card>
        
        <Card className="p-4 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Offene Beträge</p>
              <p className="text-2xl font-semibold text-red-600">{stats.overdueAmount.toFixed(0)}€</p>
            </div>
            <Euro className="h-8 w-8 text-red-600" />
          </div>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-1 gap-2 flex-wrap">
          <div className="relative flex-1 min-w-60">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Zahlungen suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Status</SelectItem>
              <SelectItem value="pending">Ausstehend</SelectItem>
              <SelectItem value="completed">Abgeschlossen</SelectItem>
              <SelectItem value="failed">Fehlgeschlagen</SelectItem>
              <SelectItem value="overdue">Überfällig</SelectItem>
              <SelectItem value="refunded">Rückerstattet</SelectItem>
              <SelectItem value="disputed">Bestritten</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedMethod} onValueChange={setSelectedMethod}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Zahlungsart" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle</SelectItem>
              <SelectItem value="credit_card">Kreditkarte</SelectItem>
              <SelectItem value="paypal">PayPal</SelectItem>
              <SelectItem value="bank_transfer">Überweisung</SelectItem>
              <SelectItem value="klarna">Klarna</SelectItem>
              <SelectItem value="apple_pay">Apple Pay</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4 mr-2" />
            Auto-Mahnungen
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Aktualisieren
          </Button>
        </div>
      </div>

      {/* Transactions Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Zahlungs-ID</TableHead>
              <TableHead>Kunde</TableHead>
              <TableHead>Betrag</TableHead>
              <TableHead>Zahlungsart</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Fälligkeit</TableHead>
              <TableHead>Mahnungen</TableHead>
              <TableHead>Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.map((transaction) => (
              <TableRow 
                key={transaction.id} 
                className={isOverdue(transaction) ? 'bg-red-50' : ''}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">{transaction.id}</span>
                    {isOverdue(transaction) && <AlertTriangle className="h-4 w-4 text-red-500" />}
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-semibold">{transaction.customer_name}</div>
                    <div className="text-sm text-gray-500">{transaction.customer_email}</div>
                    <div className="text-xs text-gray-400">Bestellung: {transaction.order_id}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-semibold">{transaction.amount.toFixed(2)} {transaction.currency}</span>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{getPaymentMethodLabel(transaction.payment_method)}</Badge>
                </TableCell>
                <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                <TableCell>
                  {transaction.due_date && (
                    <div className="text-sm">
                      {new Date(transaction.due_date).toLocaleDateString('de-DE')}
                      {isOverdue(transaction) && (
                        <div className="text-xs text-red-500">
                          {getDaysOverdue(transaction)} Tage überfällig
                        </div>
                      )}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{transaction.reminder_count}</Badge>
                    {transaction.last_reminder && (
                      <div className="text-xs text-gray-500">
                        Letzte: {new Date(transaction.last_reminder).toLocaleDateString('de-DE')}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedTransaction(transaction);
                        setShowDetailsDialog(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    {(transaction.status === 'pending' || transaction.status === 'failed') && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedTransaction(transaction);
                          setShowReminderDialog(true);
                        }}
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Select 
                      value={transaction.status} 
                      onValueChange={(value: PaymentTransaction['status']) => handleStatusUpdate(transaction.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Ausstehend</SelectItem>
                        <SelectItem value="completed">Abgeschlossen</SelectItem>
                        <SelectItem value="failed">Fehlgeschlagen</SelectItem>
                        <SelectItem value="refunded">Rückerstattet</SelectItem>
                        <SelectItem value="disputed">Bestritten</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {filteredTransactions.length === 0 && (
        <div className="text-center py-8">
          <CreditCard className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">Keine Zahlungen gefunden</p>
        </div>
      )}

      {/* Transaction Details Dialog */}
      {selectedTransaction && (
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-3xl" aria-describedby="payment-details-description">
            <DialogHeader>
              <DialogTitle>Zahlungsdetails - {selectedTransaction.id}</DialogTitle>
            </DialogHeader>
            <div id="payment-details-description" className="sr-only">
              Detailansicht für Zahlung {selectedTransaction.id} mit Transaktionsinformationen und Aktionen
            </div>
            
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="reminders">Mahnungen</TabsTrigger>
                <TabsTrigger value="actions">Aktionen</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Transaktionsinformationen</h3>
                    <div className="space-y-2 text-sm">
                      <div><span className="text-gray-500">Betrag:</span> {selectedTransaction.amount.toFixed(2)} {selectedTransaction.currency}</div>
                      <div><span className="text-gray-500">Zahlungsart:</span> {getPaymentMethodLabel(selectedTransaction.payment_method)}</div>
                      <div><span className="text-gray-500">Status:</span> {getStatusBadge(selectedTransaction.status)}</div>
                      <div><span className="text-gray-500">Erstellt:</span> {new Date(selectedTransaction.created_at).toLocaleDateString('de-DE')}</div>
                      {selectedTransaction.due_date && (
                        <div><span className="text-gray-500">Fällig:</span> {new Date(selectedTransaction.due_date).toLocaleDateString('de-DE')}</div>
                      )}
                      {selectedTransaction.completed_at && (
                        <div><span className="text-gray-500">Abgeschlossen:</span> {new Date(selectedTransaction.completed_at).toLocaleDateString('de-DE')}</div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-3">Kunde</h3>
                    <div className="space-y-2 text-sm">
                      <div><span className="text-gray-500">Name:</span> {selectedTransaction.customer_name}</div>
                      <div><span className="text-gray-500">E-Mail:</span> {selectedTransaction.customer_email}</div>
                      <div><span className="text-gray-500">Bestellung:</span> {selectedTransaction.order_id}</div>
                      <div><span className="text-gray-500">Mahnungen:</span> {selectedTransaction.reminder_count}</div>
                    </div>
                  </div>
                </div>
                
                {selectedTransaction.failure_reason && (
                  <div>
                    <h3 className="font-semibold mb-3">Fehlergrund</h3>
                    <div className="bg-red-50 p-4 rounded-lg text-sm text-red-800">
                      {selectedTransaction.failure_reason}
                    </div>
                  </div>
                )}
                
                {selectedTransaction.notes && (
                  <div>
                    <h3 className="font-semibold mb-3">Notizen</h3>
                    <div className="bg-gray-50 p-4 rounded-lg text-sm">
                      {selectedTransaction.notes}
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="reminders" className="space-y-4">
                <div className="space-y-4">
                  {reminders
                    .filter(r => r.transaction_id === selectedTransaction.id)
                    .map((reminder) => (
                      <div key={reminder.id} className="border border-gray-200 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{getReminderTypeLabel(reminder.type)}</span>
                          <span className="text-sm text-gray-500">
                            {new Date(reminder.sent_at).toLocaleDateString('de-DE')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">Template: {reminder.template_used}</p>
                        <div className="flex items-center gap-2 mt-2">
                          {reminder.response_received ? (
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                              Antwort erhalten
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-800 border-gray-200">
                              Keine Antwort
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  
                  {reminders.filter(r => r.transaction_id === selectedTransaction.id).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      Noch keine Mahnungen gesendet
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="actions" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    onClick={() => {
                      setShowReminderDialog(true);
                      setShowDetailsDialog(false);
                    }}
                    disabled={selectedTransaction.status === 'completed'}
                    className="w-full"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Mahnung senden
                  </Button>
                  
                  <Button 
                    onClick={() => handleStatusUpdate(selectedTransaction.id, 'completed')}
                    disabled={selectedTransaction.status === 'completed'}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Als bezahlt markieren
                  </Button>
                  
                  <Button 
                    onClick={() => processRefund(selectedTransaction.id, selectedTransaction.amount)}
                    disabled={selectedTransaction.status !== 'completed'}
                    variant="outline"
                    className="w-full"
                  >
                    <TrendingDown className="h-4 w-4 mr-2" />
                    Rückerstattung
                  </Button>
                  
                  <Button 
                    onClick={() => handleStatusUpdate(selectedTransaction.id, 'disputed')}
                    disabled={selectedTransaction.status === 'disputed'}
                    variant="outline"
                    className="w-full"
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Als bestritten markieren
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}

      {/* Send Reminder Dialog */}
      <Dialog open={showReminderDialog} onOpenChange={setShowReminderDialog}>
        <DialogContent className="max-w-2xl" aria-describedby="reminder-dialog-description">
          <DialogHeader>
            <DialogTitle>Zahlungserinnerung senden</DialogTitle>
          </DialogHeader>
          <div id="reminder-dialog-description" className="sr-only">
            Dialog zum Senden einer Zahlungserinnerung mit Mahnungstyp und Nachrichtentext
          </div>
          
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-500">Kunde:</span> {selectedTransaction.customer_name}</div>
                  <div><span className="text-gray-500">E-Mail:</span> {selectedTransaction.customer_email}</div>
                  <div><span className="text-gray-500">Betrag:</span> {selectedTransaction.amount.toFixed(2)}€</div>
                  <div><span className="text-gray-500">Bisherige Mahnungen:</span> {selectedTransaction.reminder_count}</div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Mahnungstyp</label>
                <Select value={reminderType} onValueChange={(value: PaymentReminder['type']) => setReminderType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="first_reminder">Erste Erinnerung</SelectItem>
                    <SelectItem value="second_reminder">Zweite Mahnung</SelectItem>
                    <SelectItem value="final_notice">Letzte Mahnung</SelectItem>
                    <SelectItem value="dunning">Inkasso-Androhung</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Nachricht</label>
                <Textarea 
                  value={reminderMessage || reminderTemplates[reminderType]}
                  onChange={(e) => setReminderMessage(e.target.value)}
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>
              
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setShowReminderDialog(false)}>
                  Abbrechen
                </Button>
                <Button onClick={sendReminder}>
                  <Send className="w-4 h-4 mr-2" />
                  Mahnung senden
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}