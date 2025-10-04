import { motion } from 'motion/react';
import { cn } from './utils';

// Base Skeleton Component
interface SkeletonProps {
  className?: string;
  variant?: 'default' | 'elbfunkeln';
}

export function Skeleton({ className = "", variant = 'default' }: SkeletonProps) {
  const variants = {
    default: "bg-gray-200",
    elbfunkeln: "bg-gradient-to-r from-elbfunkeln-beige/30 via-elbfunkeln-lavender/20 to-elbfunkeln-beige/30"
  };

  return (
    <motion.div
      className={cn(
        "rounded-md animate-pulse",
        variants[variant],
        className
      )}
      animate={{
        opacity: [0.5, 0.8, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  );
}

// Product Card Skeleton
export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <Skeleton variant="elbfunkeln" className="w-full h-48 mb-4 rounded-lg" />
      <Skeleton variant="elbfunkeln" className="h-6 w-3/4 mb-2" />
      <Skeleton variant="elbfunkeln" className="h-4 w-1/2 mb-3" />
      <Skeleton variant="elbfunkeln" className="h-5 w-1/3" />
    </div>
  );
}

// User Profile Skeleton
export function UserProfileSkeleton() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <div className="flex items-center space-x-4 mb-6">
        <Skeleton variant="elbfunkeln" className="w-16 h-16 rounded-full" />
        <div className="space-y-2">
          <Skeleton variant="elbfunkeln" className="h-6 w-32" />
          <Skeleton variant="elbfunkeln" className="h-4 w-24" />
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton variant="elbfunkeln" className="h-4 w-full" />
        <Skeleton variant="elbfunkeln" className="h-4 w-5/6" />
        <Skeleton variant="elbfunkeln" className="h-4 w-4/6" />
      </div>
    </div>
  );
}

// Blog Post Skeleton
export function BlogPostSkeleton() {
  return (
    <article className="bg-white rounded-xl overflow-hidden shadow-lg">
      <Skeleton variant="elbfunkeln" className="w-full h-48" />
      <div className="p-6">
        <Skeleton variant="elbfunkeln" className="h-8 w-4/5 mb-3" />
        <Skeleton variant="elbfunkeln" className="h-4 w-full mb-2" />
        <Skeleton variant="elbfunkeln" className="h-4 w-5/6 mb-2" />
        <Skeleton variant="elbfunkeln" className="h-4 w-3/4 mb-4" />
        <div className="flex items-center space-x-4">
          <Skeleton variant="elbfunkeln" className="w-8 h-8 rounded-full" />
          <Skeleton variant="elbfunkeln" className="h-4 w-24" />
        </div>
      </div>
    </article>
  );
}

// Order Item Skeleton
export function OrderItemSkeleton() {
  return (
    <div className="bg-white rounded-lg p-4 shadow border border-elbfunkeln-beige/20">
      <div className="flex items-center space-x-4">
        <Skeleton variant="elbfunkeln" className="w-16 h-16 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="elbfunkeln" className="h-5 w-3/4" />
          <Skeleton variant="elbfunkeln" className="h-4 w-1/2" />
          <Skeleton variant="elbfunkeln" className="h-4 w-1/3" />
        </div>
        <Skeleton variant="elbfunkeln" className="h-6 w-16" />
      </div>
    </div>
  );
}

// Table Row Skeleton
interface TableRowSkeletonProps {
  columns: number;
}

export function TableRowSkeleton({ columns }: TableRowSkeletonProps) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <Skeleton 
            variant="elbfunkeln" 
            className={cn(
              "h-4",
              i === 0 ? "w-12" : i === columns - 1 ? "w-20" : "w-full"
            )} 
          />
        </td>
      ))}
    </tr>
  );
}

// Dashboard Card Skeleton
export function DashboardCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-elbfunkeln-beige/20">
      <div className="flex items-center justify-between mb-4">
        <Skeleton variant="elbfunkeln" className="w-12 h-12 rounded-lg" />
        <Skeleton variant="elbfunkeln" className="w-6 h-6" />
      </div>
      <Skeleton variant="elbfunkeln" className="h-8 w-20 mb-2" />
      <Skeleton variant="elbfunkeln" className="h-4 w-32" />
    </div>
  );
}

// Navigation Skeleton
export function NavigationSkeleton() {
  return (
    <nav className="bg-white border-b border-elbfunkeln-beige/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Skeleton variant="elbfunkeln" className="w-32 h-8" />
          <div className="flex space-x-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} variant="elbfunkeln" className="w-16 h-6" />
            ))}
          </div>
          <div className="flex items-center space-x-4">
            <Skeleton variant="elbfunkeln" className="w-8 h-8 rounded-full" />
            <Skeleton variant="elbfunkeln" className="w-8 h-8 rounded-full" />
          </div>
        </div>
      </div>
    </nav>
  );
}

// Staggered Loading Animation
interface StaggeredSkeletonProps {
  count: number;
  children: React.ReactNode;
  delay?: number;
}

export function StaggeredSkeleton({ count, children, delay = 0.1 }: StaggeredSkeletonProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: i * delay,
            duration: 0.3,
            ease: "easeOut"
          }}
        >
          {children}
        </motion.div>
      ))}
    </div>
  );
}

// Progressive Loading States
interface ProgressiveLoaderProps {
  steps: string[];
  currentStep: number;
  className?: string;
}

export function ProgressiveLoader({ steps, currentStep, className = "" }: ProgressiveLoaderProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {steps.map((step, index) => (
        <motion.div
          key={index}
          className="flex items-center space-x-3"
          initial={{ opacity: 0.3 }}
          animate={{ 
            opacity: index <= currentStep ? 1 : 0.3,
            scale: index === currentStep ? 1.05 : 1
          }}
          transition={{ duration: 0.3 }}
        >
          <div className={cn(
            "w-4 h-4 rounded-full border-2",
            index < currentStep 
              ? "bg-elbfunkeln-lavender border-elbfunkeln-lavender" 
              : index === currentStep
              ? "border-elbfunkeln-lavender animate-pulse"
              : "border-elbfunkeln-beige"
          )} />
          <span className={cn(
            "font-inter",
            index <= currentStep ? "text-elbfunkeln-green" : "text-elbfunkeln-green/50"
          )}>
            {step}
          </span>
        </motion.div>
      ))}
    </div>
  );
}