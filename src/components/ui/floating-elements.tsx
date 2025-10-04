import { motion, useScroll, useTransform, useSpring } from 'motion/react';
import { useEffect, useState } from 'react';

// Floating Orbs Background Component
export function FloatingOrbs() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Large Background Orbs */}
      <motion.div
        className="absolute w-96 h-96 bg-gradient-to-br from-elbfunkeln-lavender/20 to-elbfunkeln-beige/30 rounded-full blur-3xl"
        animate={{
          x: mousePosition.x * 0.02,
          y: mousePosition.y * 0.02,
        }}
        transition={{ type: "spring", stiffness: 50, damping: 30 }}
        style={{
          top: '10%',
          left: '80%',
        }}
      />
      
      <motion.div
        className="absolute w-80 h-80 bg-gradient-to-br from-elbfunkeln-rose/15 to-elbfunkeln-lavender/20 rounded-full blur-3xl"
        animate={{
          x: mousePosition.x * -0.015,
          y: mousePosition.y * 0.025,
        }}
        transition={{ type: "spring", stiffness: 40, damping: 25 }}
        style={{
          top: '60%',
          left: '5%',
        }}
      />

      <motion.div
        className="absolute w-64 h-64 bg-gradient-to-br from-elbfunkeln-green/20 to-elbfunkeln-beige/25 rounded-full blur-2xl"
        animate={{
          x: mousePosition.x * 0.01,
          y: mousePosition.y * -0.02,
        }}
        transition={{ type: "spring", stiffness: 60, damping: 20 }}
        style={{
          top: '30%',
          left: '40%',
        }}
      />

      {/* Small Floating Particles */}
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-elbfunkeln-lavender/40 rounded-full"
          animate={{
            y: [0, -20, 0],
            x: [0, Math.sin(i) * 10, 0],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 4 + i * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            top: `${20 + i * 15}%`,
            left: `${10 + i * 12}%`,
          }}
        />
      ))}
    </div>
  );
}

// Scroll Progress Indicator
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-elbfunkeln-lavender via-elbfunkeln-rose to-elbfunkeln-green z-50 origin-left"
      style={{ scaleX }}
    />
  );
}

// Parallax Container
interface ParallaxContainerProps {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}

export function ParallaxContainer({ children, speed = 0.5, className = "" }: ParallaxContainerProps) {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, 1000 * speed]);

  return (
    <motion.div style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}

// Magnetic Button Effect
interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function MagneticButton({ children, className = "", onClick }: MagneticButtonProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = (e.clientX - centerX) * 0.15;
    const deltaY = (e.clientY - centerY) * 0.15;
    
    setPosition({ x: deltaX, y: deltaY });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.button
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      animate={position}
      transition={{ type: "spring", stiffness: 150, damping: 15 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.button>
  );
}

// Floating Action Button
interface FloatingActionButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  className?: string;
}

export function FloatingActionButton({ 
  icon, 
  onClick, 
  position = 'bottom-right',
  className = ""
}: FloatingActionButtonProps) {
  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
  };

  return (
    <motion.button
      className={`fixed ${positionClasses[position]} w-14 h-14 bg-gradient-to-br from-elbfunkeln-lavender to-elbfunkeln-rose rounded-full shadow-lg flex items-center justify-center text-white z-40 ${className}`}
      onClick={onClick}
      whileHover={{ 
        scale: 1.1,
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
      }}
      whileTap={{ scale: 0.9 }}
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ 
        type: "spring", 
        stiffness: 260, 
        damping: 20,
        delay: 0.5
      }}
    >
      {icon}
    </motion.button>
  );
}

// Reveal Text Animation
interface RevealTextProps {
  children: string;
  className?: string;
}

export function RevealText({ children, className = "" }: RevealTextProps) {
  const words = children.split(' ');

  return (
    <div className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: i * 0.1,
            ease: "easeOut"
          }}
          className="inline-block mr-2"
        >
          {word}
        </motion.span>
      ))}
    </div>
  );
}