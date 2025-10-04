import React from 'react';
import { motion } from 'motion/react';
import { cn } from './utils';

interface ElegantSectionProps {
  children: React.ReactNode;
  className?: string;
  background?: 'default' | 'gradient' | 'soft' | 'accent' | 'transparent';
  spacing?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  maxWidth?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | '7xl' | 'full';
  centerContent?: boolean;
  fadeIn?: boolean;
  stagger?: boolean;
}

const backgroundVariants = {
  default: 'bg-elbfunkeln-beige',
  gradient: 'bg-gradient-to-br from-elbfunkeln-beige via-elbfunkeln-beige/95 to-elbfunkeln-lavender/10',
  soft: 'bg-gradient-to-br from-elbfunkeln-beige/50 via-white/90 to-elbfunkeln-lavender/5',
  accent: 'bg-gradient-to-br from-elbfunkeln-lavender/10 via-elbfunkeln-beige to-elbfunkeln-rose/5',
  transparent: 'bg-transparent'
};

const spacingVariants = {
  none: 'py-0',
  sm: 'py-8 md:py-12',
  md: 'py-12 md:py-16',
  lg: 'py-16 md:py-20',
  xl: 'py-20 md:py-24'
};

const maxWidthVariants = {
  none: '',
  sm: 'max-w-sm mx-auto',
  md: 'max-w-md mx-auto',
  lg: 'max-w-lg mx-auto',
  xl: 'max-w-xl mx-auto',
  '2xl': 'max-w-2xl mx-auto',
  '4xl': 'max-w-4xl mx-auto',
  '6xl': 'max-w-6xl mx-auto',
  '7xl': 'max-w-7xl mx-auto',
  full: 'w-full'
};

export function ElegantSection({
  children,
  className = '',
  background = 'default',
  spacing = 'lg',
  maxWidth = '7xl',
  centerContent = false,
  fadeIn = true,
  stagger = false
}: ElegantSectionProps) {
  const MotionWrapper = fadeIn ? motion.section : 'section';
  const motionProps = fadeIn ? {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" },
    viewport: { once: true, margin: "-100px" }
  } : {};

  return (
    <MotionWrapper
      className={cn(
        backgroundVariants[background],
        spacingVariants[spacing],
        className
      )}
      {...motionProps}
    >
      <div className={cn(
        'px-4 sm:px-6 lg:px-8',
        maxWidthVariants[maxWidth],
        centerContent && 'text-center'
      )}>
        {stagger ? (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
          >
            {React.Children.map(children, (child, index) => (
              <motion.div
                key={index}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
              >
                {child}
              </motion.div>
            ))}
          </motion.div>
        ) : (
          children
        )}
      </div>
    </MotionWrapper>
  );
}

// Header component for sections
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  className?: string;
  titleClassName?: string;
  alignment?: 'left' | 'center' | 'right';
  animate?: boolean;
}

export function SectionHeader({
  title,
  subtitle,
  description,
  className = '',
  titleClassName = '',
  alignment = 'center',
  animate = true
}: SectionHeaderProps) {
  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };

  const MotionDiv = animate ? motion.div : 'div';
  const motionProps = animate ? {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
    viewport: { once: true }
  } : {};

  return (
    <MotionDiv
      className={cn(
        'mb-12 lg:mb-16',
        alignmentClasses[alignment],
        className
      )}
      {...motionProps}
    >
      {subtitle && (
        <p className="font-inter text-sm font-medium text-elbfunkeln-rose mb-3 tracking-wider uppercase">
          {subtitle}
        </p>
      )}
      <h2 className={cn(
        'font-cormorant text-3xl md:text-4xl lg:text-5xl text-elbfunkeln-green mb-4',
        titleClassName
      )}>
        {title}
      </h2>
      {description && (
        <p className="font-inter text-elbfunkeln-green/70 max-w-3xl text-lg leading-relaxed">
          {description}
        </p>
      )}
    </MotionDiv>
  );
}

// Card Grid for products, testimonials, etc.
interface CardGridProps {
  children: React.ReactNode;
  columns?: {
    base?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  };
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const gapVariants = {
  sm: 'gap-4',
  md: 'gap-6',
  lg: 'gap-8',
  xl: 'gap-10'
};

export function CardGrid({
  children,
  columns = { base: 1, sm: 2, lg: 3, xl: 4 },
  gap = 'lg',
  className = ''
}: CardGridProps) {
  const getGridClasses = () => {
    const { base = 1, sm, md, lg, xl, '2xl': xl2 } = columns;
    const classes = [`grid-cols-${base}`];
    
    if (sm) classes.push(`sm:grid-cols-${sm}`);
    if (md) classes.push(`md:grid-cols-${md}`);
    if (lg) classes.push(`lg:grid-cols-${lg}`);
    if (xl) classes.push(`xl:grid-cols-${xl}`);
    if (xl2) classes.push(`2xl:grid-cols-${xl2}`);
    
    return classes.join(' ');
  };

  return (
    <div className={cn(
      'grid',
      getGridClasses(),
      gapVariants[gap],
      className
    )}>
      {children}
    </div>
  );
}

// Divider with decorative elements
interface ElegantDividerProps {
  className?: string;
  variant?: 'simple' | 'ornamental' | 'gradient';
  spacing?: 'sm' | 'md' | 'lg';
}

const dividerSpacing = {
  sm: 'my-8',
  md: 'my-12',
  lg: 'my-16'
};

export function ElegantDivider({
  className = '',
  variant = 'simple',
  spacing = 'md'
}: ElegantDividerProps) {
  if (variant === 'ornamental') {
    return (
      <div className={cn(dividerSpacing[spacing], 'flex items-center justify-center', className)}>
        <div className="flex items-center">
          <div className="w-8 h-px bg-gradient-to-r from-transparent to-elbfunkeln-rose"></div>
          <div className="mx-4 w-2 h-2 bg-elbfunkeln-rose rounded-full"></div>
          <div className="w-8 h-px bg-gradient-to-l from-transparent to-elbfunkeln-rose"></div>
        </div>
      </div>
    );
  }

  if (variant === 'gradient') {
    return (
      <div className={cn(dividerSpacing[spacing], className)}>
        <div className="h-px bg-gradient-to-r from-transparent via-elbfunkeln-green/30 to-transparent"></div>
      </div>
    );
  }

  return (
    <div className={cn(dividerSpacing[spacing], className)}>
      <div className="h-px bg-elbfunkeln-green/20"></div>
    </div>
  );
}