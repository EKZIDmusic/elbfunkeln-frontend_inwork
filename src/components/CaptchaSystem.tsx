import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { RefreshCw, Shield, Check, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';

interface CaptchaSystemProps {
  onVerify: (isValid: boolean) => void;
  onReset?: () => void;
  className?: string;
}

// Simple math-based CAPTCHA that matches Elbfunkeln design
export function CaptchaSystem({ onVerify, onReset, className = "" }: CaptchaSystemProps) {
  const [captchaQuestion, setCaptchaQuestion] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [isError, setIsError] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    generateCaptcha();
  }, []);

  const generateCaptcha = () => {
    // Generate simple math problem
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operations = ['+', '-', '×'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let answer: number;
    let question: string;
    
    switch (operation) {
      case '+':
        answer = num1 + num2;
        question = `${num1} + ${num2}`;
        break;
      case '-':
        // Ensure positive result
        const larger = Math.max(num1, num2);
        const smaller = Math.min(num1, num2);
        answer = larger - smaller;
        question = `${larger} - ${smaller}`;
        break;
      case '×':
        // Keep numbers small for multiplication
        const small1 = Math.floor(Math.random() * 5) + 1;
        const small2 = Math.floor(Math.random() * 5) + 1;
        answer = small1 * small2;
        question = `${small1} × ${small2}`;
        break;
      default:
        answer = num1 + num2;
        question = `${num1} + ${num2}`;
    }
    
    setCaptchaQuestion(question);
    setCaptchaAnswer(answer);
    setUserAnswer('');
    setIsError(false);
    setIsVerified(false);
    
    // Draw captcha on canvas
    drawCaptcha(question);
  };

  const drawCaptcha = (question: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set Elbfunkeln-style background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#ddd4ce'); // elbfunkeln-beige
    gradient.addColorStop(0.5, '#c4ccff'); // elbfunkeln-lavender
    gradient.addColorStop(1, '#a67171'); // elbfunkeln-rose
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add noise lines for security
    ctx.strokeStyle = '#68685f'; // elbfunkeln-green
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;
    
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }
    
    // Add dots
    for (let i = 0; i < 20; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1, 0, 2 * Math.PI);
      ctx.fill();
    }
    
    ctx.globalAlpha = 1;
    
    // Draw question text
    ctx.font = 'bold 24px Cormorant, serif';
    ctx.fillStyle = '#68685f'; // elbfunkeln-green
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Add text shadow for better readability
    ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
    ctx.shadowBlur = 2;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    
    ctx.fillText(question, canvas.width / 2, canvas.height / 2);
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  };

  const verifyCaptcha = () => {
    const userNum = parseInt(userAnswer);
    
    if (userNum === captchaAnswer) {
      setIsVerified(true);
      setIsError(false);
      onVerify(true);
    } else {
      setIsError(true);
      setAttempts(prev => prev + 1);
      
      // Generate new captcha after failed attempt
      setTimeout(() => {
        generateCaptcha();
      }, 1500);
      
      onVerify(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && userAnswer && !isVerified) {
      verifyCaptcha();
    }
  };

  const resetCaptcha = () => {
    generateCaptcha();
    setAttempts(0);
    onReset?.();
  };

  return (
    <motion.div
      className={`${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-4 border-elbfunkeln-rose/30">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-5 h-5 text-elbfunkeln-green" />
          <span className="font-medium text-elbfunkeln-green">
            Sicherheitsüberprüfung
          </span>
        </div>
        
        <div className="space-y-4">
          {/* Canvas CAPTCHA */}
          <div className="flex flex-col items-center gap-3">
            <canvas
              ref={canvasRef}
              width={200}
              height={80}
              className="border border-elbfunkeln-rose/30 rounded-lg shadow-sm"
            />
            
            <div className="text-sm text-elbfunkeln-green/70 text-center">
              Lösen Sie die Rechenaufgabe: <strong>{captchaQuestion} = ?</strong>
            </div>
          </div>
          
          {/* Input and Verification */}
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Antwort eingeben"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isVerified}
              className={`flex-1 text-center ${
                isError 
                  ? 'border-red-500 focus:border-red-500' 
                  : isVerified 
                    ? 'border-green-500 focus:border-green-500'
                    : 'border-elbfunkeln-rose/30 focus:border-elbfunkeln-green'
              }`}
            />
            
            <Button
              onClick={verifyCaptcha}
              disabled={!userAnswer || isVerified}
              className={`${
                isVerified 
                  ? 'bg-green-500 hover:bg-green-600' 
                  : 'bg-elbfunkeln-green hover:bg-elbfunkeln-green/90'
              } text-white`}
            >
              {isVerified ? <Check className="w-4 h-4" /> : 'Prüfen'}
            </Button>
            
            <Button
              onClick={resetCaptcha}
              variant="outline"
              className="border-elbfunkeln-rose/30 text-elbfunkeln-green hover:bg-elbfunkeln-rose/10"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Status Messages */}
          {isError && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 text-red-600 text-sm"
            >
              <X className="w-4 h-4" />
              Falsche Antwort. Versuchen Sie es erneut.
              {attempts > 2 && (
                <span className="text-xs">(Versuch {attempts})</span>
              )}
            </motion.div>
          )}
          
          {isVerified && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 text-green-600 text-sm"
            >
              <Check className="w-4 h-4" />
              Erfolgreich verifiziert!
            </motion.div>
          )}
          
          {attempts > 5 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-elbfunkeln-rose bg-elbfunkeln-rose/10 p-2 rounded text-center"
            >
              Zu viele fehlgeschlagene Versuche. Bitte versuchen Sie es später erneut.
            </motion.div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

// Simplified CAPTCHA for less critical operations
export function SimpleCaptcha({ onVerify, className = "" }: CaptchaSystemProps) {
  const [isChecked, setIsChecked] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const handleVerify = () => {
    if (!isChecked) {
      setIsChecked(true);
      // Simulate verification delay
      setTimeout(() => {
        setIsVerified(true);
        onVerify(true);
      }, 1000);
    }
  };

  return (
    <motion.div
      className={`${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-4 border-elbfunkeln-rose/30">
        <div className="flex items-center gap-3">
          <div
            className={`w-6 h-6 border-2 rounded cursor-pointer flex items-center justify-center transition-all duration-200 ${
              isVerified 
                ? 'border-green-500 bg-green-500' 
                : isChecked 
                  ? 'border-elbfunkeln-green bg-elbfunkeln-green animate-pulse' 
                  : 'border-elbfunkeln-rose/50 hover:border-elbfunkeln-green'
            }`}
            onClick={handleVerify}
          >
            {isVerified && <Check className="w-4 h-4 text-white" />}
            {isChecked && !isVerified && (
              <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-elbfunkeln-green" />
            <span className="text-sm text-elbfunkeln-green">
              {isVerified 
                ? 'Verifiziert' 
                : isChecked 
                  ? 'Überprüfung läuft...' 
                  : 'Ich bin kein Roboter'
              }
            </span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}