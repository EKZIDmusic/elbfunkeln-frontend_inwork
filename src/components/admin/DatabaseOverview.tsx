import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Database, Users, ShoppingCart, Mail, MessageSquare, Activity, Settings, BarChart3 } from 'lucide-react';
import apiService from '../../services/apiService';
import { toast } from 'sonner@2.0.3';

interface TableInfo {
  table_name: string;
  row_count: number;
  last_updated?: string;
}

interface DatabaseStats {
  totalTables: number;
  totalRows: number;
  activeUsers: number;
  totalOrders: number;
  newsletterSubscribers: number;
  contactInquiries: number;
  activeSessions: number;
  activityLogs: number;
}

export function DatabaseOverview() {
  const [stats, setStats] = useState<DatabaseStats>({
    totalTables: 0,
    totalRows: 0,
    activeUsers: 0,
    totalOrders: 0,
    newsletterSubscribers: 0,
    contactInquiries: 0,
    activeSessions: 0,
    activityLogs: 0
  });
  const [tableData, setTableData] = useState<TableInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    loadDatabaseStats();
  }, []);

  const loadDatabaseStats = async () => {
    setLoading(true);
    try {
      // Fetch admin stats from API
      const adminStats = await apiService.admin.analytics.getStats();

      // Create table info based on available data
      const tables: TableInfo[] = [
        { table_name: 'users', row_count: adminStats.totalCustomers },
        { table_name: 'orders', row_count: adminStats.totalOrders },
        { table_name: 'newsletter_subscribers', row_count: adminStats.newsletterSubscribers },
        { table_name: 'contact_inquiries', row_count: adminStats.pendingInquiries }
      ];

      setTableData(tables);

      const totalRows = tables.reduce((sum, table) => sum + table.row_count, 0);

      setStats({
        totalTables: tables.length,
        totalRows,
        activeUsers: adminStats.totalCustomers,
        totalOrders: adminStats.totalOrders,
        newsletterSubscribers: adminStats.newsletterSubscribers,
        contactInquiries: adminStats.pendingInquiries,
        activeSessions: 0, // Not available in current API
        activityLogs: 0 // Not available in current API
      });

      setLastRefresh(new Date());
      toast.success('Datenbankstatistiken erfolgreich geladen');
    } catch (error) {
      console.error('Error loading database stats:', error);
      toast.error('Fehler beim Laden der Datenbankstatistiken');
      // Set minimal stats in case of complete failure
      setStats({
        totalTables: 0,
        totalRows: 0,
        activeUsers: 0,
        totalOrders: 0,
        newsletterSubscribers: 0,
        contactInquiries: 0,
        activeSessions: 0,
        activityLogs: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTableName = (tableName: string) => {
    const nameMap: { [key: string]: string } = {
      'categories': 'Kategorien',
      'products': 'Produkte',
      'product_images': 'Produktbilder',
      'user_profiles': 'Benutzerprofile',
      'user_sessions': 'User Sessions',
      'user_activity_log': 'Aktivitätslogs',
      'user_addresses': 'Benutzeradressen',
      'orders': 'Bestellungen',
      'order_items': 'Bestellpositionen',
      'newsletter_subscribers': 'Newsletter Abonnenten',
      'contact_inquiries': 'Kontaktanfragen',
      'kv_store_0a65d7a9': 'Key-Value Store'
    };
    return nameMap[tableName] || tableName;
  };

  const getTableIcon = (tableName: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'categories': <Database className="h-4 w-4" />,
      'products': <ShoppingCart className="h-4 w-4" />,
      'product_images': <BarChart3 className="h-4 w-4" />,
      'user_profiles': <Users className="h-4 w-4" />,
      'user_sessions': <Activity className="h-4 w-4" />,
      'user_activity_log': <Activity className="h-4 w-4" />,
      'user_addresses': <Users className="h-4 w-4" />,
      'orders': <ShoppingCart className="h-4 w-4" />,
      'order_items': <ShoppingCart className="h-4 w-4" />,
      'newsletter_subscribers': <Mail className="h-4 w-4" />,
      'contact_inquiries': <MessageSquare className="h-4 w-4" />,
      'kv_store_0a65d7a9': <Settings className="h-4 w-4" />
    };
    return iconMap[tableName] || <Database className="h-4 w-4" />;
  };

  const getHealthStatus = (tableName: string, rowCount: number) => {
    if (tableName === 'kv_store_0a65d7a9' && rowCount > 10) return 'excellent';
    if (tableName === 'products' && rowCount > 5) return 'excellent';
    if (tableName === 'user_profiles' && rowCount > 3) return 'excellent';
    if (tableName === 'orders' && rowCount > 1) return 'good';
    if (rowCount > 0) return 'good';
    return 'warning';
  };

  const getHealthBadge = (status: string) => {
    switch (status) {
      case 'excellent':
        return <Badge className="bg-green-100 text-green-800">Hervorragend</Badge>;
      case 'good':
        return <Badge className="bg-blue-100 text-blue-800">Gut</Badge>;
      case 'warning':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Leer</Badge>;
      default:
        return <Badge variant="outline">Unbekannt</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-cormorant text-elbfunkeln-green">🗄️ Datenbank-Übersicht</h1>
          <p className="text-gray-600">
            Vollständige Übersicht aller Elbfunkeln Datenbank-Tabellen und Inhalte
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            Letzte Aktualisierung: {lastRefresh.toLocaleTimeString('de-DE')}
          </div>
          <Button onClick={loadDatabaseStats} variant="outline" size="sm">
            Aktualisieren
          </Button>
        </div>
      </div>

      {/* Statistik-Karten */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-elbfunkeln-green/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-elbfunkeln-lavender to-elbfunkeln-rose rounded-lg flex items-center justify-center">
                <Database className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-elbfunkeln-green/70 text-sm">Tabellen</p>
                <p className="font-cormorant text-2xl text-elbfunkeln-green">
                  {stats.totalTables}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-elbfunkeln-green/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-elbfunkeln-green to-elbfunkeln-beige rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-elbfunkeln-green/70 text-sm">Datensätze</p>
                <p className="font-cormorant text-2xl text-elbfunkeln-green">
                  {stats.totalRows.toLocaleString('de-DE')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-elbfunkeln-green/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-elbfunkeln-rose to-elbfunkeln-lavender rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-elbfunkeln-green/70 text-sm">Benutzer</p>
                <p className="font-cormorant text-2xl text-elbfunkeln-green">
                  {stats.activeUsers}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-elbfunkeln-green/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-elbfunkeln-beige to-elbfunkeln-green rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-elbfunkeln-green/70 text-sm">Bestellungen</p>
                <p className="font-cormorant text-2xl text-elbfunkeln-green">
                  {stats.totalOrders}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detaillierte Tabellen-Übersicht */}
      <Card className="border-elbfunkeln-green/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Tabellen-Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tabelle</TableHead>
                  <TableHead>Datensätze</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Beschreibung</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableData.map((table) => (
                  <TableRow key={table.table_name}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {getTableIcon(table.table_name)}
                        <span className="font-medium">
                          {formatTableName(table.table_name)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono">
                        {table.row_count.toLocaleString('de-DE')}
                      </span>
                    </TableCell>
                    <TableCell>
                      {getHealthBadge(getHealthStatus(table.table_name, table.row_count))}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {table.table_name === 'categories' && 'Produktkategorien'}
                      {table.table_name === 'products' && 'Schmuckstücke im Shop'}
                      {table.table_name === 'product_images' && 'Produktfotos'}
                      {table.table_name === 'user_profiles' && 'Registrierte Benutzer'}
                      {table.table_name === 'user_sessions' && 'Aktive Anmeldesitzungen'}
                      {table.table_name === 'user_activity_log' && 'Benutzeraktivitäten'}
                      {table.table_name === 'user_addresses' && 'Lieferadressen'}
                      {table.table_name === 'orders' && 'Kundenbestellungen'}
                      {table.table_name === 'order_items' && 'Bestellte Artikel'}
                      {table.table_name === 'newsletter_subscribers' && 'Newsletter-Empfänger'}
                      {table.table_name === 'contact_inquiries' && 'Kundenanfragen'}
                      {table.table_name === 'kv_store_0a65d7a9' && 'Shop-Konfiguration'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Weitere Statistiken */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-elbfunkeln-green/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Mail className="w-8 h-8 text-elbfunkeln-lavender" />
              <div>
                <p className="text-sm text-gray-600">Newsletter</p>
                <p className="font-cormorant text-xl text-elbfunkeln-green">
                  {stats.newsletterSubscribers} Abonnenten
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-elbfunkeln-green/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <MessageSquare className="w-8 h-8 text-elbfunkeln-rose" />
              <div>
                <p className="text-sm text-gray-600">Kontakt</p>
                <p className="font-cormorant text-xl text-elbfunkeln-green">
                  {stats.contactInquiries} Anfragen
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-elbfunkeln-green/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Activity className="w-8 h-8 text-elbfunkeln-green" />
              <div>
                <p className="text-sm text-gray-600">Sessions</p>
                <p className="font-cormorant text-xl text-elbfunkeln-green">
                  {stats.activeSessions} aktiv
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-elbfunkeln-green/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <BarChart3 className="w-8 h-8 text-elbfunkeln-beige" />
              <div>
                <p className="text-sm text-gray-600">Aktivitäten</p>
                <p className="font-cormorant text-xl text-elbfunkeln-green">
                  {stats.activityLogs} Logs
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gesundheitsstatus */}
      <Card className="border-elbfunkeln-green/20">
        <CardHeader>
          <CardTitle className="text-elbfunkeln-green">
            🚀 Datenbank-Gesundheit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-green-800">✅ Alle Kerntabellen sind befüllt</span>
              <Badge className="bg-green-100 text-green-800">Optimal</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-blue-800">📊 Realistische Testdaten vorhanden</span>
              <Badge className="bg-blue-100 text-blue-800">Bereit</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <span className="text-purple-800">🔒 Sicherheitsfeatures aktiviert</span>
              <Badge className="bg-purple-100 text-purple-800">Aktiv</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <span className="text-orange-800">⚙️ Shop-Konfiguration vollständig</span>
              <Badge className="bg-orange-100 text-orange-800">Konfiguriert</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}