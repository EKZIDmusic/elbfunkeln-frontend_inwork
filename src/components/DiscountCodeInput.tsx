import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, Tag, Check, AlertCircle } from 'lucide-react';
import apiService, { type ValidateDiscountResponse } from '../services/apiService';

interface DiscountCodeInputProps {
  orderTotal: number;
  userId?: string;
  onDiscountApplied?: (code: string, savings: number) => void;
}

export function DiscountCodeInput({ orderTotal, userId, onDiscountApplied }: DiscountCodeInputProps) {
  const [code, setCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidateDiscountResponse | null>(null);
  const [appliedCode, setAppliedCode] = useState<string | null>(null);

  const handleValidate = async () => {
    if (!code.trim()) return;

    setIsValidating(true);
    setValidationResult(null);

    try {
      const result = await apiService.discounts.validate({
        code: code.trim(),
        orderTotal,
        userId,
      });

      setValidationResult(result);

      if (result.isValid && result.savings && onDiscountApplied) {
        setAppliedCode(code.trim());
        onDiscountApplied(code.trim(), result.savings);
      }
    } catch (error: any) {
      setValidationResult({
        isValid: false,
        error: error.message || 'Fehler beim Validieren des Rabattcodes',
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveDiscount = () => {
    setCode('');
    setAppliedCode(null);
    setValidationResult(null);
    if (onDiscountApplied) {
      onDiscountApplied('', 0);
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="discount-code" className="text-sm font-medium">
          Rabattcode
        </Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="discount-code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="CODE EINGEBEN"
              className="pl-9 uppercase"
              disabled={isValidating || !!appliedCode}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleValidate();
                }
              }}
            />
          </div>
          {appliedCode ? (
            <Button
              type="button"
              variant="outline"
              onClick={handleRemoveDiscount}
            >
              Entfernen
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleValidate}
              disabled={!code.trim() || isValidating}
            >
              {isValidating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Prüfen...
                </>
              ) : (
                'Anwenden'
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Validation Result */}
      {validationResult && (
        <Alert variant={validationResult.isValid ? 'default' : 'destructive'}>
          <div className="flex items-start gap-2">
            {validationResult.isValid ? (
              <Check className="h-4 w-4 text-green-600 mt-0.5" />
            ) : (
              <AlertCircle className="h-4 w-4 mt-0.5" />
            )}
            <div className="flex-1">
              <AlertDescription>
                {validationResult.isValid ? (
                  <div className="space-y-1">
                    <p className="font-medium text-green-700">
                      Rabattcode erfolgreich angewendet!
                    </p>
                    {validationResult.savings && (
                      <p className="text-sm text-green-600">
                        Du sparst {validationResult.savings.toFixed(2)}€
                      </p>
                    )}
                  </div>
                ) : (
                  <p>{validationResult.error || 'Ungültiger Rabattcode'}</p>
                )}
              </AlertDescription>
            </div>
          </div>
        </Alert>
      )}

      {/* Discount Info */}
      {appliedCode && validationResult?.isValid && validationResult.discount && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm">
          <div className="flex justify-between items-center">
            <span className="font-medium text-green-800">
              {validationResult.discount.type === 'PERCENTAGE'
                ? `${validationResult.discount.value}% Rabatt`
                : `${validationResult.discount.value.toFixed(2)}€ Rabatt`}
            </span>
            <span className="text-green-600 font-semibold">
              -{validationResult.savings?.toFixed(2)}€
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
