import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Database } from 'lucide-react';
import { checkDatabaseStatus } from '../../utils/supabase/errorHandler';

interface DatabaseStatus {
  connected: boolean;
  tables: {
    products: boolean;
    orders: boolean;
    users: boolean;
    newsletter: boolean;
  };
  recommendFallback: boolean;
}

export function DatabaseStatusChecker() {
  const [status, setStatus] = useState<DatabaseStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const performCheck = async () => {
    setLoading(true);
    try {
      const result = await checkDatabaseStatus();
      setStatus(result);
      setLastCheck(new Date());
    } catch (error) {
      console.error('Status check failed:', error);
      setStatus({
        connected: false,
        tables: { products: false, orders: false, users: false, newsletter: false },
        recommendFallback: true
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    performCheck();
  }, []);

  const getStatusIcon = (isOk: boolean) => {
    if (isOk) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    return <XCircle className="w-4 h-4 text-red-500" />;
  };

  const getOverallStatusBadge = () => {
    if (!status) return null;
    
    if (status.connected) {
      return <Badge className="bg-green-100 text-green-800">✅ Vollständig Verbunden</Badge>;
    }
    
    const workingTables = Object.values(status.tables).filter(Boolean).length;
    if (workingTables > 0) {
      return <Badge className="bg-yellow-100 text-yellow-800">⚠️ Teilweise Verbunden</Badge>;
    }
    
    return <Badge className="bg-red-100 text-red-800">❌ Nicht Verbunden</Badge>;
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-elbfunkeln-green" />
          <h3 className="font-cormorant text-xl text-elbfunkeln-green">Datenbank Status</h3>
        </div>
        <div className="flex items-center gap-2">
          {getOverallStatusBadge()}
          <Button
            onClick={performCheck}
            disabled={loading}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Prüfen
          </Button>
        </div>
      </div>

      {status && (
        <div className="space-y-4">
          {/* Overall Status */}
          <div className="flex items-center gap-2 p-3 bg-elbfunkeln-beige/20 rounded-lg">
            {status.connected ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-yellow-500" />
            )}
            <span className="font-inter text-sm">
              {status.connected 
                ? 'Alle Datenbanktabellen sind verfügbar' 
                : 'Fallback-Modus aktiv - Demo-Daten werden verwendet'
              }
            </span>
          </div>

          {/* Table Status Details */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center justify-between p-2 border border-elbfunkeln-lavender/30 rounded">
              <span className="font-inter text-sm text-elbfunkeln-green">Products</span>
              {getStatusIcon(status.tables.products)}
            </div>
            <div className="flex items-center justify-between p-2 border border-elbfunkeln-lavender/30 rounded">
              <span className="font-inter text-sm text-elbfunkeln-green">Orders</span>
              {getStatusIcon(status.tables.orders)}
            </div>
            <div className="flex items-center justify-between p-2 border border-elbfunkeln-lavender/30 rounded">
              <span className="font-inter text-sm text-elbfunkeln-green">Users</span>
              {getStatusIcon(status.tables.users)}
            </div>
            <div className="flex items-center justify-between p-2 border border-elbfunkeln-lavender/30 rounded">
              <span className="font-inter text-sm text-elbfunkeln-green">Newsletter</span>
              {getStatusIcon(status.tables.newsletter)}
            </div>
          </div>

          {/* Last Check Info */}
          {lastCheck && (
            <div className="text-xs text-elbfunkeln-green/60 text-center">
              Letzte Prüfung: {lastCheck.toLocaleString('de-DE')}
            </div>
          )}

          {/* Recommendations */}
          {status.recommendFallback && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-inter text-sm font-medium text-yellow-800 mb-2">
                📋 Empfohlene Maßnahmen:
              </h4>
              <ul className="text-xs text-yellow-700 space-y-1">
                <li>• Überprüfen Sie die Supabase-Verbindungseinstellungen</li>
                <li>• Stellen Sie sicher, dass alle Datenbank-Migrations ausgeführt wurden</li>
                <li>• Demo-Daten funktionieren weiterhin für Tests</li>
                <li>• Kontaktieren Sie den technischen Support bei anhaltenden Problemen</li>
              </ul>
            </div>
          )}
        </div>
      )}

      {loading && !status && (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin text-elbfunkeln-lavender" />
          <span className="ml-2 font-inter text-elbfunkeln-green">Prüfe Datenbankverbindung...</span>
        </div>
      )}
    </Card>
  );
}