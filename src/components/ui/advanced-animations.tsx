import { motion, useInView, useAnimation, AnimatePresence } from 'motion/react';
import { useRef, useEffect, useState } from 'react';

// Stagger Animation Container
interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function StaggerContainer({ children, className = "", staggerDelay = 0.1 }: StaggerContainerProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: staggerDelay
            }
          }
        }}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

// Stagger Item
interface StaggerItemProps {
  children: React.ReactNode;
  className?: string;
}

export function StaggerItem({ children, className = "" }: StaggerItemProps) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: {
            type: "spring",
            stiffness: 100,
            damping: 15
          }
        }
      }}
    >
      {children}
    </motion.div>
  );
}

// Typewriter Effect
interface TypewriterProps {
  text: string;
  className?: string;
  speed?: number;
  cursor?: boolean;
}

export function Typewriter({ text, className = "", speed = 50, cursor = true }: TypewriterProps) {
  const [displayText, setDisplayText] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayText(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
        if (cursor) {
          // Blink cursor after typing is done
          setInterval(() => {
            setShowCursor(prev => !prev);
          }, 530);
        }
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed, cursor]);

  return (
    <span className={className}>
      {displayText}
      {cursor && <span className={`${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity`}>|</span>}
    </span>
  );
}

// Morphing Shape
interface MorphingShapeProps {
  className?: string;
  shapes?: string[];
  duration?: number;
}

export function MorphingShape({ 
  className = "", 
  shapes = [
    "M50,10 C80,10 90,40 90,50 C90,80 60,90 50,90 C20,90 10,60 10,50 C10,20 30,10 50,10",
    "M50,5 C85,5 95,35 95,50 C95,85 65,95 50,95 C15,95 5,65 5,50 C5,15 25,5 50,5",
    "M50,15 C75,15 85,35 85,50 C85,75 65,85 50,85 C25,85 15,65 15,50 C15,25 35,15 50,15"
  ],
  duration = 3
}: MorphingShapeProps) {
  const [currentShape, setCurrentShape] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentShape(prev => (prev + 1) % shapes.length);
    }, duration * 1000);

    return () => clearInterval(interval);
  }, [shapes.length, duration]);

  return (
    <svg className={className} viewBox="0 0 100 100">
      <motion.path
        d={shapes[currentShape]}
        fill="currentColor"
        animate={{ d: shapes[currentShape] }}
        transition={{ 
          duration: duration,
          ease: "easeInOut"
        }}
      />
    </svg>
  );
}

// Floating Text Animation
interface FloatingTextProps {
  children: string;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
}

export function FloatingText({ 
  children, 
  className = "",
  direction = 'up'
}: FloatingTextProps) {
  const directionVariants = {
    up: { y: [0, -10, 0] },
    down: { y: [0, 10, 0] },
    left: { x: [0, -10, 0] },
    right: { x: [0, 10, 0] }
  };

  return (
    <motion.span
      className={className}
      animate={directionVariants[direction]}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.span>
  );
}

// Page Transition Wrapper
interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransition({ children, className = "" }: PageTransitionProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        duration: 0.4
      }}
    >
      {children}
    </motion.div>
  );
}

// Pulse Loading Animation
interface PulseLoaderProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export function PulseLoader({ 
  className = "", 
  size = 'md',
  color = "bg-elbfunkeln-lavender"
}: PulseLoaderProps) {
  const sizes = {
    sm: 'w-2 h-2',
    md: 'w-4 h-4',
    lg: 'w-6 h-6'
  };

  return (
    <div className={`flex space-x-2 ${className}`}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={`${sizes[size]} ${color} rounded-full`}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
}

// Scroll Triggered Animation
interface ScrollTriggeredProps {
  children: React.ReactNode;
  className?: string;
  threshold?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}

export function ScrollTriggered({ 
  children, 
  className = "",
  threshold = 0.1,
  direction = 'up'
}: ScrollTriggeredProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: threshold });

  const directionVariants = {
    up: { opacity: 0, y: 50 },
    down: { opacity: 0, y: -50 },
    left: { opacity: 0, x: 50 },
    right: { opacity: 0, x: -50 }
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={directionVariants[direction]}
      animate={isInView ? { 
        opacity: 1, 
        y: 0, 
        x: 0,
        transition: {
          type: "spring",
          stiffness: 100,
          damping: 20,
          duration: 0.8
        }
      } : directionVariants[direction]}
    >
      {children}
    </motion.div>
  );
}

// Magnetic Hover Effect
interface MagneticHoverProps {
  children: React.ReactNode;
  className?: string;
  strength?: number;
}

export function MagneticHover({ children, className = "", strength = 0.2 }: MagneticHoverProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = (e.clientX - centerX) * strength;
    const deltaY = (e.clientY - centerY) * strength;
    
    setPosition({ x: deltaX, y: deltaY });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={position}
      transition={{ type: "spring", stiffness: 150, damping: 15 }}
    >
      {children}
    </motion.div>
  );
}