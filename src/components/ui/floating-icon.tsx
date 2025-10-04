import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';
import { cn } from './utils';

interface FloatingIconProps {
  Icon: LucideIcon;
  size?: number;
  className?: string;
  color?: 'beige' | 'lavender' | 'rose' | 'green' | 'auto';
  delay?: number;
  duration?: number;
  amplitude?: number;
  children?: React.ReactNode;
}

const colorClasses = {
  beige: 'text-elbfunkeln-beige',
  lavender: 'text-elbfunkeln-lavender',
  rose: 'text-elbfunkeln-rose',
  green: 'text-elbfunkeln-green',
  auto: '', // Lässt die Standard-Farbe durch
};

export function FloatingIcon({
  Icon,
  size = 20,
  className = '',
  color = 'green',
  delay = 0,
  duration = 3,
  amplitude = 8,
  children,
  ...props
}: FloatingIconProps & React.ComponentProps<'div'>) {
  return (
    <motion.div
      className={cn('inline-flex items-center', className)}
      animate={{
        y: [-amplitude/2, amplitude/2, -amplitude/2],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
      {...props}
    >
      <Icon 
        size={size} 
        className={cn(
          colorClasses[color],
          'transition-colors duration-300'
        )}
      />
      {children}
    </motion.div>
  );
}

// Spezielle Varianten für häufig verwendete Icons
export function FloatingHeart({ className, ...props }: Omit<FloatingIconProps, 'Icon'>) {
  return <FloatingIcon Icon={require('lucide-react').Heart} color="rose" className={className} {...props} />;
}

export function FloatingShoppingBag({ className, ...props }: Omit<FloatingIconProps, 'Icon'>) {
  return <FloatingIcon Icon={require('lucide-react').ShoppingBag} color="green" className={className} {...props} />;
}

export function FloatingUser({ className, ...props }: Omit<FloatingIconProps, 'Icon'>) {
  return <FloatingIcon Icon={require('lucide-react').User} color="lavender" className={className} {...props} />;
}

export function FloatingSearch({ className, ...props }: Omit<FloatingIconProps, 'Icon'>) {
  return <FloatingIcon Icon={require('lucide-react').Search} color="green" className={className} {...props} />;
}