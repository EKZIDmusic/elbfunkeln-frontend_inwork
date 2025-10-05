import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Loader2, Send, Mail, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import apiService, { type NewsletterResult } from '../../services/apiService';
import { useAuth } from '../AuthContext';

export function NewsletterEditor() {
  const { isAdmin } = useAuth();
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<NewsletterResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isAdmin()) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Du hast keine Berechtigung, auf diese Funktion zuzugreifen.
        </AlertDescription>
      </Alert>
    );
  }

  const handleSend = async () => {
    if (!subject.trim() || !content.trim()) {
      setError('Betreff und Inhalt sind erforderlich');
      return;
    }

    setIsSending(true);
    setError(null);
    setResult(null);

    try {
      const sendResult = await apiService.newsletter.send({
        subject: subject.trim(),
        content: content.trim(),
        htmlContent: htmlContent.trim() || undefined,
      });

      setResult(sendResult);

      // Reset form on success
      if (sendResult.sent > 0) {
        setSubject('');
        setContent('');
        setHtmlContent('');
      }
    } catch (error: any) {
      setError(error.message || 'Fehler beim Versenden des Newsletters');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Newsletter versenden
          </CardTitle>
          <CardDescription>
            Erstelle und versende einen Newsletter an alle aktiven Abonnenten
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="newsletter-subject">
              Betreff <span className="text-red-500">*</span>
            </Label>
            <Input
              id="newsletter-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="z.B. Neue Produkte im Elbfunkeln Shop!"
              disabled={isSending}
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground">
              {subject.length}/200 Zeichen
            </p>
          </div>

          {/* Content Tabs */}
          <Tabs defaultValue="text" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="text">Text-Version</TabsTrigger>
              <TabsTrigger value="html">HTML-Version (Optional)</TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="space-y-2">
              <Label htmlFor="newsletter-content">
                Inhalt (Plain Text) <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="newsletter-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Schreibe hier deinen Newsletter-Inhalt..."
                className="min-h-[300px] font-mono text-sm"
                disabled={isSending}
              />
              <p className="text-xs text-muted-foreground">
                Diese Version wird an alle E-Mail-Clients gesendet, die kein HTML unterstützen.
              </p>
            </TabsContent>

            <TabsContent value="html" className="space-y-2">
              <Label htmlFor="newsletter-html">HTML-Inhalt (Optional)</Label>
              <Textarea
                id="newsletter-html"
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                placeholder="<html>&#10;  <body>&#10;    <h1>Newsletter Titel</h1>&#10;    <p>Dein Newsletter-Inhalt...</p>&#10;  </body>&#10;</html>"
                className="min-h-[300px] font-mono text-sm"
                disabled={isSending}
              />
              <p className="text-xs text-muted-foreground">
                Optional: Füge eine HTML-Version für formatierte E-Mails hinzu.
              </p>
            </TabsContent>
          </Tabs>

          {/* Send Button */}
          <div className="flex gap-2">
            <Button
              onClick={handleSend}
              disabled={!subject.trim() || !content.trim() || isSending}
              className="flex-1"
            >
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Newsletter wird versendet...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Newsletter versenden
                </>
              )}
            </Button>
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Result Display */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Versand-Statistiken
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Total */}
              <div className="rounded-lg border p-4 space-y-1">
                <p className="text-sm text-muted-foreground">Gesamt</p>
                <p className="text-2xl font-bold">{result.total}</p>
                <Badge variant="secondary">Abonnenten</Badge>
              </div>

              {/* Sent */}
              <div className="rounded-lg border p-4 space-y-1">
                <p className="text-sm text-muted-foreground">Erfolgreich versendet</p>
                <p className="text-2xl font-bold text-green-600">{result.sent}</p>
                <Badge variant="default" className="bg-green-600">Gesendet</Badge>
              </div>

              {/* Failed */}
              <div className="rounded-lg border p-4 space-y-1">
                <p className="text-sm text-muted-foreground">Fehlgeschlagen</p>
                <p className="text-2xl font-bold text-red-600">{result.failed}</p>
                <Badge variant="destructive">Fehler</Badge>
              </div>
            </div>

            {/* Success Rate */}
            <div className="rounded-lg bg-muted p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Erfolgsquote</span>
                <span className="text-sm font-bold">
                  {result.total > 0 ? ((result.sent / result.total) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${result.total > 0 ? (result.sent / result.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Errors */}
            {result.errors && result.errors.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-red-600">
                  Fehlermeldungen ({result.errors.length})
                </Label>
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 max-h-40 overflow-y-auto">
                  <ul className="space-y-1 text-sm text-red-700">
                    {result.errors.slice(0, 10).map((error, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-red-400 mt-1">•</span>
                        <span>{error}</span>
                      </li>
                    ))}
                    {result.errors.length > 10 && (
                      <li className="text-xs text-red-500 italic">
                        ... und {result.errors.length - 10} weitere Fehler
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            )}

            {/* Success Message */}
            {result.sent > 0 && (
              <Alert>
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  Newsletter wurde erfolgreich an {result.sent} Abonnenten versendet!
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
