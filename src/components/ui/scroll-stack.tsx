import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'motion/react';

interface ScrollStackProps {
  children: React.ReactNode[];
  className?: string;
  spacing?: number;
  scale?: number;
  offset?: number;
}

export function ScrollStack({ 
  children, 
  className = "", 
  spacing = 20, 
  scale = 0.95,
  offset = 100 
}: ScrollStackProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {children.map((child, index) => (
        <ScrollStackItem
          key={index}
          index={index}
          total={children.length}
          spacing={spacing}
          scale={scale}
          offset={offset}
          scrollProgress={scrollYProgress}
        >
          {child}
        </ScrollStackItem>
      ))}
    </div>
  );
}

interface ScrollStackItemProps {
  children: React.ReactNode;
  index: number;
  total: number;
  spacing: number;
  scale: number;
  offset: number;
  scrollProgress: any;
}

function ScrollStackItem({ 
  children, 
  index, 
  total, 
  spacing, 
  scale, 
  offset,
  scrollProgress 
}: ScrollStackItemProps) {
  const itemRef = useRef<HTMLDivElement>(null);
  
  // Calculate transform values based on scroll and index
  const y = useTransform(
    scrollProgress,
    [0, 1],
    [index * spacing, -offset * (total - index - 1)]
  );
  
  const scaleTransform = useTransform(
    scrollProgress,
    [0, 0.5, 1],
    [1, scale, scale * 0.9]
  );
  
  const opacity = useTransform(
    scrollProgress,
    [0, 0.1, 0.9, 1],
    [1, 1, 1, 0.3]
  );

  // Spring animations for smoother movement
  const springY = useSpring(y, { stiffness: 100, damping: 30 });
  const springScale = useSpring(scaleTransform, { stiffness: 100, damping: 30 });
  const springOpacity = useSpring(opacity, { stiffness: 100, damping: 30 });

  return (
    <motion.div
      ref={itemRef}
      style={{
        y: springY,
        scale: springScale,
        opacity: springOpacity,
        zIndex: total - index,
        position: index === 0 ? 'relative' : 'absolute',
        top: index === 0 ? 0 : `${index * spacing}px`,
        left: 0,
        right: 0,
      }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}

// Horizontal Scroll Stack for side-by-side content
interface HorizontalScrollStackProps {
  children: React.ReactNode[];
  className?: string;
  gap?: string;
  snapType?: 'mandatory' | 'proximity' | 'none';
}

export function HorizontalScrollStack({ 
  children, 
  className = "",
  gap = "gap-6",
  snapType = 'mandatory'
}: HorizontalScrollStackProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollability = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScrollability();
    const element = scrollRef.current;
    if (element) {
      element.addEventListener('scroll', checkScrollability);
      return () => element.removeEventListener('scroll', checkScrollability);
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Left scroll button */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition-colors"
          aria-label="Scroll left"
        >
          <svg className="w-6 h-6 text-elbfunkeln-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Right scroll button */}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition-colors"
          aria-label="Scroll right"
        >
          <svg className="w-6 h-6 text-elbfunkeln-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Scrollable container */}
      <div
        ref={scrollRef}
        className={`flex overflow-x-auto ${gap} pb-4 ${
          snapType !== 'none' ? `scroll-snap-type-x-${snapType}` : ''
        }`}
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitScrollbar: { display: 'none' }
        }}
      >
        {children.map((child, index) => (
          <motion.div
            key={index}
            className="flex-shrink-0 scroll-snap-align-start"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
          >
            {child}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Masonry Stack for Pinterest-like layouts
interface MasonryStackProps {
  children: React.ReactNode[];
  columns?: { [key: string]: number };
  gap?: string;
  className?: string;
}

export function MasonryStack({ 
  children, 
  columns = { sm: 1, md: 2, lg: 3, xl: 4 },
  gap = "gap-6",
  className = ""
}: MasonryStackProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${gap} ${className}`}>
        {children}
      </div>
    );
  }

  const getColumnClasses = () => {
    const classes = [];
    Object.entries(columns).forEach(([breakpoint, cols]) => {
      if (breakpoint === 'sm') classes.push(`columns-${cols}`);
      else classes.push(`${breakpoint}:columns-${cols}`);
    });
    return classes.join(' ');
  };

  return (
    <div className={`${getColumnClasses()} ${gap} ${className}`}>
      {children.map((child, index) => (
        <motion.div
          key={index}
          className="break-inside-avoid mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.05 }}
          viewport={{ once: true }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
}