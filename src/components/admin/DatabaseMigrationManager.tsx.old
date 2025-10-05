import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { CheckCircle, Database, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { 
  checkDatabaseStatus, 
  runDatabaseMigration, 
  REQUIRED_TABLES, 
  getTableInfo,
  type MigrationStatus,
  type MigrationResult 
} from '../../utils/migration';
import { DatabaseSetupGuide } from './DatabaseSetupGuide';

export function DatabaseMigrationManager() {
  const [isLoading, setIsLoading] = useState(false);
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null);
  const [migrationStatus, setMigrationStatus] = useState<MigrationStatus | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [showManualGuide, setShowManualGuide] = useState(false);

  const checkTableStatus = async () => {
    setIsChecking(true);
    try {
      const result = await checkDatabaseStatus();
      setMigrationStatus(result);
    } catch (error) {
      console.error('Error checking table status:', error);
      setMigrationStatus({
        tablesExist: false,
        existingTables: [],
        count: 0
      });
    } finally {
      setIsChecking(false);
    }
  };

  const runMigration = async () => {
    setIsLoading(true);
    setMigrationResult(null);

    try {
      const result = await runDatabaseMigration();
      setMigrationResult(result);

      if (result.success) {
        // Refresh table status after successful migration
        setTimeout(() => {
          checkTableStatus().catch(console.error);
        }, 2000);
      }
    } catch (error) {
      console.error('Migration error:', error);
      setMigrationResult({
        success: false,
        error: 'Migration failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Check status on component mount
  React.useEffect(() => {
    // Check table status when component mounts
    const initialCheck = async () => {
      try {
        await checkTableStatus();
      } catch (error) {
        console.log('Initial table check failed, will retry when user requests');
      }
    };
    
    initialCheck();
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Elbfunkeln Datenbank Migration
          </CardTitle>
          <CardDescription>
            Automatisierte Erstellung aller 20 E-Commerce Tabellen in Supabase
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status Check */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Tabellen Status</h3>
              <p className="text-sm text-muted-foreground">
                {migrationStatus ? 
                  `${migrationStatus.count} von ${REQUIRED_TABLES.length} Tabellen vorhanden` :
                  'Status wird geprüft...'
                }
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={checkTableStatus}
              disabled={isChecking}
            >
              {isChecking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Status prüfen
            </Button>
          </div>

          {/* Current Status */}
          {migrationStatus && (
            <div className="space-y-3">
              {migrationStatus.tablesExist ? (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Datenbank bereits konfiguriert!</strong><br />
                    {migrationStatus.count} Tabellen gefunden: {(migrationStatus.existingTables || []).join(', ')}
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Migration erforderlich</strong><br />
                    Keine E-Commerce Tabellen in der Datenbank gefunden.
                  </AlertDescription>
                </Alert>
              )}

              {/* Required Tables Overview */}
              <div>
                <h4 className="font-medium mb-2">Elbfunkeln E-Commerce Tabellen:</h4>
                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                  {getTableInfo().map((table) => {
                    const tableExists = migrationStatus?.existingTables?.includes(table.name) || false;
                    return (
                      <div 
                        key={table.name}
                        className="flex items-center justify-between p-2 rounded border"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={tableExists ? "default" : "secondary"}
                              className="shrink-0"
                            >
                              {tableExists && (
                                <CheckCircle className="h-3 w-3 mr-1" />
                              )}
                              {table.name}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            {table.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Migration Button */}
          <div className="pt-4 border-t">
            <Button
              onClick={runMigration}
              disabled={isLoading || (migrationStatus?.tablesExist && (migrationStatus?.count || 0) >= 3)}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Migration läuft...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4 mr-2" />
                  {migrationStatus?.tablesExist ? 'Migration bereits abgeschlossen' : 'Datenbank Migration starten'}
                </>
              )}
            </Button>
            
            {!migrationStatus?.tablesExist && (
              <p className="text-sm text-muted-foreground mt-2 text-center">
                ✨ Erstellt automatisch alle {REQUIRED_TABLES.length} Elbfunkeln E-Commerce Tabellen<br/>
                🔐 Mit Beziehungen, RLS-Policies und Performance-Indizes
              </p>
            )}
          </div>

          {/* Migration Result */}
          {migrationResult && (
            <div className="pt-4 border-t">
              {migrationResult.success ? (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Migration erfolgreich! 🎉</strong><br />
                    {migrationResult.message}<br />
                    <small className="text-muted-foreground">
                      {migrationResult.tables_created?.length} Tabellen erstellt um {new Date(migrationResult.timestamp).toLocaleTimeString('de-DE')}
                    </small>
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Migration fehlgeschlagen</strong><br />
                    {migrationResult.details || migrationResult.error}
                    {migrationResult.existing && (
                      <span className="block mt-1 text-sm">
                        (Tabellen existieren bereits - kein Fehler)
                      </span>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Manual SQL Option */}
          <div className="pt-4 border-t">
            <Alert>
              <Database className="h-4 w-4" />
              <AlertDescription>
                <strong>Alternative:</strong> Falls die automatische Migration fehlschlägt, 
                können Sie die Tabellen manuell in der Supabase SQL Editor erstellen.
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-blue-600 ml-2"
                  onClick={() => setShowManualGuide(!showManualGuide)}
                >
                  Anleitung anzeigen →
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      {/* Migration Features Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Migration Features</CardTitle>
          <CardDescription>Was wird automatisch erstellt</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Tabellen & Beziehungen
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 20 vollständige E-Commerce Tabellen</li>
                <li>• Foreign Key Beziehungen</li>
                <li>• UUID Primary Keys</li>
                <li>• Timestamps & Trigger</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Sicherheit & Performance
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Row Level Security (RLS)</li>
                <li>• Performance-Indizes</li>
                <li>• Admin/User Policies</li>
                <li>• Datenvalidierung</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Sample Daten
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Elbfunkeln Kategorien</li>
                <li>• Grundkonfiguration</li>
                <li>• Test-Datensätze</li>
                <li>• Drahtschmuck-Spezifisch</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                E-Commerce Features
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Produktkatalog & Varianten</li>
                <li>• Warenkorb & Bestellungen</li>
                <li>• User-Management</li>
                <li>• Blog & Newsletter</li>
              </ul>
            </div>
          </div>

          {/* Manual Setup Guide */}
          {showManualGuide && (
            <div className="pt-4 border-t">
              <DatabaseSetupGuide />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}