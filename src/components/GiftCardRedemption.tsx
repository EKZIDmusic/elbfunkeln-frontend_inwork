import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Loader2, Gift, Check, AlertCircle, Calendar, CreditCard } from 'lucide-react';
import apiService, { type GiftCardBalance } from '../services/apiService';

interface GiftCardRedemptionProps {
  orderId?: string;
  onRedemptionSuccess?: (code: string, amount: number, remainingBalance: number) => void;
}

export function GiftCardRedemption({ orderId, onRedemptionSuccess }: GiftCardRedemptionProps) {
  const [code, setCode] = useState('');
  const [amount, setAmount] = useState('');
  const [isCheckingBalance, setIsCheckingBalance] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [balance, setBalance] = useState<GiftCardBalance | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleCheckBalance = async () => {
    if (!code.trim()) {
      setError('Bitte gib einen Gutscheincode ein');
      return;
    }

    setIsCheckingBalance(true);
    setError(null);
    setBalance(null);

    try {
      const balanceData = await apiService.giftCards.getBalance(code.trim());

      if (!balanceData.isActive) {
        setError('Diese Geschenkkarte ist nicht aktiv');
        return;
      }

      if (balanceData.expiresAt && new Date(balanceData.expiresAt) < new Date()) {
        setError('Diese Geschenkkarte ist abgelaufen');
        return;
      }

      setBalance(balanceData);
    } catch (error: any) {
      setError(error.message || 'Fehler beim Abrufen des Guthabens');
    } finally {
      setIsCheckingBalance(false);
    }
  };

  const handleRedeem = async () => {
    if (!orderId) {
      setError('Keine Bestellung gefunden. Bitte erstelle zuerst eine Bestellung.');
      return;
    }

    if (!code.trim()) {
      setError('Bitte gib einen Gutscheincode ein');
      return;
    }

    const redeemAmount = parseFloat(amount);
    if (!redeemAmount || redeemAmount <= 0) {
      setError('Bitte gib einen gültigen Betrag ein');
      return;
    }

    if (balance && redeemAmount > balance.balance) {
      setError(`Der Betrag übersteigt das verfügbare Guthaben (${balance.balance.toFixed(2)}€)`);
      return;
    }

    setIsRedeeming(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await apiService.giftCards.redeem({
        code: code.trim(),
        orderId,
        amount: redeemAmount,
      });

      setSuccess(result.message || 'Geschenkkarte erfolgreich eingelöst!');

      if (onRedemptionSuccess) {
        onRedemptionSuccess(code.trim(), redeemAmount, result.remainingBalance);
      }

      // Update balance
      if (balance) {
        setBalance({
          ...balance,
          balance: result.remainingBalance,
        });
      }

      setAmount('');
    } catch (error: any) {
      setError(error.message || 'Fehler beim Einlösen der Geschenkkarte');
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" />
          Geschenkkarte einlösen
        </CardTitle>
        <CardDescription>
          Gib deinen Geschenkkartencode ein und löse dein Guthaben ein
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Code Input */}
        <div className="space-y-2">
          <Label htmlFor="gift-card-code" className="text-sm font-medium">
            Geschenkkartencode
          </Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Gift className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="gift-card-code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="XXXX-XXXX-XXXX"
                className="pl-9 uppercase"
                disabled={isCheckingBalance || !!balance}
              />
            </div>
            {balance ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCode('');
                  setBalance(null);
                  setAmount('');
                  setError(null);
                  setSuccess(null);
                }}
              >
                Zurücksetzen
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleCheckBalance}
                disabled={!code.trim() || isCheckingBalance}
              >
                {isCheckingBalance ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Prüfen...
                  </>
                ) : (
                  'Guthaben prüfen'
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Balance Display */}
        {balance && (
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-800">Verfügbares Guthaben:</span>
              <span className="text-2xl font-bold text-blue-900">
                {balance.balance.toFixed(2)}€
              </span>
            </div>

            {balance.expiresAt && (
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <Calendar className="h-4 w-4" />
                <span>
                  Gültig bis: {new Date(balance.expiresAt).toLocaleDateString('de-DE')}
                </span>
              </div>
            )}

            {/* Amount Input */}
            <div className="space-y-2 pt-2">
              <Label htmlFor="redeem-amount" className="text-sm font-medium text-blue-800">
                Einzulösender Betrag
              </Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="redeem-amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={balance.balance}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="pl-9"
                    disabled={isRedeeming}
                  />
                </div>
                <Button
                  type="button"
                  onClick={() => setAmount(balance.balance.toString())}
                  variant="outline"
                  disabled={isRedeeming}
                >
                  Max
                </Button>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleRedeem}
              disabled={!amount || isRedeeming || !orderId}
              className="w-full"
            >
              {isRedeeming ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Einlösen...
                </>
              ) : (
                <>
                  <Gift className="mr-2 h-4 w-4" />
                  Jetzt einlösen
                </>
              )}
            </Button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Success Message */}
        {success && (
          <Alert>
            <Check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              {success}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
