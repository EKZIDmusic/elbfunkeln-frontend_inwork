import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { useState, useRef } from 'react';
import { cn } from './utils';

// 3D Tilt Card
interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  tiltDegree?: number;
  scale?: number;
}

export function TiltCard({ 
  children, 
  className = "",
  tiltDegree = 20,
  scale = 1.05
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [tiltDegree, -tiltDegree]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-tiltDegree, tiltDegree]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateY: rotateY,
        rotateX: rotateX,
        transformStyle: "preserve-3d",
      }}
      whileHover={{ scale }}
      className={cn("cursor-pointer", className)}
    >
      <div style={{ transform: "translateZ(75px)", transformStyle: "preserve-3d" }}>
        {children}
      </div>
    </motion.div>
  );
}

// Expandable Card
interface ExpandableCardProps {
  children: React.ReactNode;
  expandedContent: React.ReactNode;
  className?: string;
  title?: string;
}

export function ExpandableCard({ 
  children, 
  expandedContent, 
  className = "",
  title 
}: ExpandableCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      className={cn(
        "bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer",
        className
      )}
      layout
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <motion.div layout="position" className="p-6">
        {title && (
          <motion.h3 layout="position" className="font-cormorant text-xl text-elbfunkeln-green mb-4">
            {title}
          </motion.h3>
        )}
        {children}
      </motion.div>
      
      <motion.div
        initial={false}
        animate={isExpanded ? "open" : "closed"}
        variants={{
          open: { opacity: 1, height: "auto" },
          closed: { opacity: 0, height: 0 }
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <div className="p-6 pt-0 border-t border-elbfunkeln-beige/20">
          {expandedContent}
        </div>
      </motion.div>
    </motion.div>
  );
}

// Flip Card
interface FlipCardProps {
  frontContent: React.ReactNode;
  backContent: React.ReactNode;
  className?: string;
  flipDirection?: 'horizontal' | 'vertical';
}

export function FlipCard({ 
  frontContent, 
  backContent, 
  className = "",
  flipDirection = 'horizontal'
}: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const flipVariants = {
    horizontal: {
      front: { rotateY: 0 },
      back: { rotateY: 180 }
    },
    vertical: {
      front: { rotateX: 0 },
      back: { rotateX: 180 }
    }
  };

  return (
    <div 
      className={cn("relative h-64 w-full cursor-pointer", className)}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div
        className="absolute inset-0 w-full h-full backface-hidden"
        animate={isFlipped ? flipVariants[flipDirection].back : flipVariants[flipDirection].front}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="absolute inset-0 w-full h-full bg-white rounded-xl shadow-lg p-6 backface-hidden">
          {frontContent}
        </div>
      </motion.div>
      
      <motion.div
        className="absolute inset-0 w-full h-full backface-hidden"
        animate={isFlipped ? flipVariants[flipDirection].front : flipVariants[flipDirection].back}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        style={{ 
          transformStyle: "preserve-3d",
          rotateY: flipDirection === 'horizontal' ? 180 : 0,
          rotateX: flipDirection === 'vertical' ? 180 : 0
        }}
      >
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-elbfunkeln-lavender to-elbfunkeln-rose rounded-xl shadow-lg p-6 backface-hidden">
          {backContent}
        </div>
      </motion.div>
    </div>
  );
}

// Morphing Card
interface MorphingCardProps {
  children: React.ReactNode;
  className?: string;
  morphOnHover?: boolean;
}

export function MorphingCard({ 
  children, 
  className = "",
  morphOnHover = true
}: MorphingCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className={cn("bg-white rounded-xl shadow-lg overflow-hidden", className)}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      animate={{
        borderRadius: isHovered && morphOnHover ? "2rem" : "0.75rem",
        scale: isHovered ? 1.02 : 1,
      }}
      transition={{ 
        duration: 0.3, 
        ease: "easeInOut",
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
    >
      <motion.div
        animate={{
          background: isHovered 
            ? "linear-gradient(135deg, var(--elbfunkeln-lavender), var(--elbfunkeln-rose))"
            : "linear-gradient(135deg, #ffffff, #ffffff)"
        }}
        transition={{ duration: 0.3 }}
        className="h-full"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

// Parallax Card
interface ParallaxCardProps {
  children: React.ReactNode;
  className?: string;
  depth?: number;
}

export function ParallaxCard({ 
  children, 
  className = "",
  depth = 50
}: ParallaxCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
    const y = (e.clientY - rect.top - rect.height / 2) / rect.height;

    setMousePosition({ x: x * depth, y: y * depth });
  };

  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={ref}
      className={cn("relative overflow-hidden", className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        animate={mousePosition}
        transition={{ type: "spring", stiffness: 150, damping: 15 }}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

// Glow Card
interface GlowCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  intensity?: 'low' | 'medium' | 'high';
}

export function GlowCard({ 
  children, 
  className = "",
  glowColor = "elbfunkeln-lavender",
  intensity = 'medium'
}: GlowCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const intensityStyles = {
    low: "shadow-lg",
    medium: "shadow-xl",
    high: "shadow-2xl"
  };

  return (
    <motion.div
      className={cn(
        "bg-white rounded-xl transition-all duration-300",
        intensityStyles[intensity],
        className
      )}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      animate={{
        boxShadow: isHovered
          ? `0 0 30px rgba(196, 204, 255, 0.4), 0 0 60px rgba(196, 204, 255, 0.2)`
          : "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
      }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

// Stack Card (Layered Effect)
interface StackCardProps {
  children: React.ReactNode;
  className?: string;
  layers?: number;
}

export function StackCard({ 
  children, 
  className = "",
  layers = 3
}: StackCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className={cn("relative", className)}>
      {Array.from({ length: layers }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute inset-0 bg-white rounded-xl shadow-lg border border-elbfunkeln-beige/20"
          animate={{
            x: isHovered ? (i + 1) * 4 : (i + 1) * 2,
            y: isHovered ? (i + 1) * 4 : (i + 1) * 2,
            scale: 1 - (i * 0.02),
            opacity: 0.8 - (i * 0.2)
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          style={{ zIndex: layers - i }}
        />
      ))}
      <motion.div
        className="relative bg-white rounded-xl shadow-xl border border-elbfunkeln-beige/20 z-10"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </div>
  );
}