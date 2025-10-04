import { motion } from 'motion/react';
import { cn } from './utils';

// Glassmorphism Card Component
interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'strong' | 'subtle';
  hover?: boolean;
}

export function GlassCard({ 
  children, 
  className = "", 
  variant = 'default',
  hover = true 
}: GlassCardProps) {
  const variants = {
    default: "bg-white/20 backdrop-blur-md border border-white/30",
    strong: "bg-white/30 backdrop-blur-lg border border-white/40",
    subtle: "bg-white/10 backdrop-blur-sm border border-white/20"
  };

  return (
    <motion.div
      className={cn(
        "rounded-xl shadow-xl",
        variants[variant],
        className
      )}
      whileHover={hover ? { 
        scale: 1.02, 
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" 
      } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {children}
    </motion.div>
  );
}

// Neumorphism Card Component
interface NeumorphismCardProps {
  children: React.ReactNode;
  className?: string;
  pressed?: boolean;
  clickable?: boolean;
}

export function NeumorphismCard({ 
  children, 
  className = "",
  pressed = false,
  clickable = false 
}: NeumorphismCardProps) {
  return (
    <motion.div
      className={cn(
        "rounded-2xl transition-all duration-300",
        pressed 
          ? "bg-elbfunkeln-beige shadow-inner-lg" 
          : "bg-elbfunkeln-beige shadow-[20px_20px_60px_#bebab5,-20px_-20px_60px_#f2ede7]",
        clickable && "cursor-pointer",
        className
      )}
      whileHover={clickable ? { scale: 1.02 } : undefined}
      whileTap={clickable ? { scale: 0.98 } : undefined}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      {children}
    </motion.div>
  );
}

// Floating Glass Panel
interface FloatingGlassPanelProps {
  children: React.ReactNode;
  className?: string;
  isVisible: boolean;
}

export function FloatingGlassPanel({ children, className = "", isVisible }: FloatingGlassPanelProps) {
  return (
    <motion.div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4",
        className
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.3 }}
      style={{ pointerEvents: isVisible ? 'auto' : 'none' }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Content */}
      <motion.div
        className="relative bg-white/30 backdrop-blur-xl border border-white/40 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ 
          scale: isVisible ? 1 : 0.8, 
          opacity: isVisible ? 1 : 0, 
          y: isVisible ? 0 : 20 
        }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 30,
          delay: 0.1 
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

// Gradient Border Card
interface GradientBorderCardProps {
  children: React.ReactNode;
  className?: string;
  gradientFrom?: string;
  gradientTo?: string;
}

export function GradientBorderCard({ 
  children, 
  className = "",
  gradientFrom = "from-elbfunkeln-lavender",
  gradientTo = "to-elbfunkeln-rose"
}: GradientBorderCardProps) {
  return (
    <div className={cn("p-[2px] rounded-xl bg-gradient-to-r", gradientFrom, gradientTo)}>
      <div className={cn("bg-white rounded-lg h-full", className)}>
        {children}
      </div>
    </div>
  );
}

// Frosted Glass Navigation
interface FrostedNavProps {
  children: React.ReactNode;
  className?: string;
}

export function FrostedNav({ children, className = "" }: FrostedNavProps) {
  return (
    <motion.nav
      className={cn(
        "bg-white/10 backdrop-blur-lg border-b border-white/20",
        className
      )}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {children}
    </motion.nav>
  );
}