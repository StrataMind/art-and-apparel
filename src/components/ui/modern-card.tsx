'use client'

import React from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'
import { cva, type VariantProps } from "class-variance-authority"

const modernCardVariants = cva(
  "relative overflow-hidden transition-all duration-300 group",
  {
    variants: {
      variant: {
        default: "bg-white border border-gray-200 shadow-sm hover:shadow-lg",
        glass: "bg-white/10 backdrop-blur-md border border-white/20 shadow-lg",
        gradient: "bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-sm hover:shadow-lg",
        premium: "bg-white border-l-4 border-l-coral shadow-md hover:shadow-xl",
        minimal: "bg-minimal-white border border-minimal-gray-200 shadow-sm hover:shadow-md",
        floating: "bg-white shadow-lg hover:shadow-2xl border-0",
        neon: "bg-gray-900 border border-coral/50 shadow-lg shadow-coral/20 hover:shadow-coral/40",
      },
      size: {
        sm: "p-4 rounded-lg",
        default: "p-6 rounded-xl",
        lg: "p-8 rounded-2xl",
        xl: "p-10 rounded-3xl",
      },
      animation: {
        none: "",
        hover: "hover:scale-[1.02] hover:-translate-y-1",
        lift: "hover:-translate-y-2",
        tilt: "hover:rotate-1",
        glow: "hover:shadow-coral/20 hover:shadow-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animation: "hover",
    },
  }
)

export interface ModernCardProps
  extends Omit<HTMLMotionProps<"div">, "size">,
    VariantProps<typeof modernCardVariants> {
  spotlight?: boolean
  shimmer?: boolean
  gradient?: boolean
}

const ModernCard = React.forwardRef<HTMLDivElement, ModernCardProps>(
  ({ 
    className, 
    variant, 
    size, 
    animation,
    spotlight = false,
    shimmer = false,
    gradient = false,
    children,
    ...props 
  }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(modernCardVariants({ variant, size, animation, className }))}
        whileHover={
          animation === "hover" ? { scale: 1.02, y: -4 } :
          animation === "lift" ? { y: -8 } :
          animation === "tilt" ? { rotate: 1 } :
          {}
        }
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        {...props}
      >
        {/* Gradient Overlay */}
        {gradient && (
          <div className="absolute inset-0 bg-gradient-to-br from-coral/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        )}
        
        {/* Spotlight Effect */}
        {spotlight && (
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-gradient-radial from-white/20 to-transparent rounded-full blur-xl" />
          </div>
        )}
        
        {/* Shimmer Effect */}
        {shimmer && (
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          </div>
        )}
        
        {/* Border Glow */}
        <div className="absolute inset-0 rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-coral/20 via-purple-500/20 to-gold/20 blur-sm -z-10" />
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </motion.div>
    )
  }
)

ModernCard.displayName = "ModernCard"

const ModernCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-2 mb-4', className)}
    {...props}
  />
))
ModernCardHeader.displayName = 'ModernCardHeader'

const ModernCardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-xl font-semibold leading-tight tracking-tight text-gray-900', className)}
    {...props}
  />
))
ModernCardTitle.displayName = 'ModernCardTitle'

const ModernCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-gray-600 leading-relaxed', className)}
    {...props}
  />
))
ModernCardDescription.displayName = 'ModernCardDescription'

const ModernCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('', className)} {...props} />
))
ModernCardContent.displayName = 'ModernCardContent'

const ModernCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center justify-between mt-6 pt-4 border-t border-gray-100', className)}
    {...props}
  />
))
ModernCardFooter.displayName = 'ModernCardFooter'

export { 
  ModernCard, 
  ModernCardHeader, 
  ModernCardFooter, 
  ModernCardTitle, 
  ModernCardDescription, 
  ModernCardContent,
  modernCardVariants
}