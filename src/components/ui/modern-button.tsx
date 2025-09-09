'use client'

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { motion, HTMLMotionProps } from "framer-motion"
import { cn } from "@/lib/utils"

const modernButtonVariants = cva(
  "relative inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 overflow-hidden group",
  {
    variants: {
      variant: {
        primary: "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-blue-500/25 hover:shadow-xl",
        secondary: "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg hover:shadow-purple-500/25 hover:shadow-xl",
        outline: "border-2 border-blue-500 text-blue-500 bg-transparent hover:bg-blue-500 hover:text-white",
        ghost: "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
        glass: "bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20",
        gradient: "bg-gradient-to-r from-yellow-400 via-blue-500 to-purple-500 text-white shadow-lg hover:shadow-xl",
        minimal: "bg-minimal-gray-100 text-minimal-gray-900 hover:bg-minimal-gray-200 border border-minimal-gray-200",
        success: "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:shadow-green-500/25 hover:shadow-xl",
        danger: "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg hover:shadow-red-500/25 hover:shadow-xl",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        default: "h-11 px-6 text-sm",
        lg: "h-13 px-8 text-base",
        xl: "h-16 px-10 text-lg",
        icon: "h-11 w-11",
      },
      animation: {
        none: "",
        hover: "hover:scale-105 active:scale-95",
        bounce: "hover:animate-bounce",
        pulse: "hover:animate-pulse",
        glow: "hover:animate-pulse-glow",
        shimmer: "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
      animation: "hover",
    },
  }
)

export interface ModernButtonProps
  extends Omit<HTMLMotionProps<"button">, "size">,
    VariantProps<typeof modernButtonVariants> {
  asChild?: boolean
  icon?: React.ReactNode
  rightIcon?: React.ReactNode
  loading?: boolean
  glow?: boolean
}

const ModernButton = React.forwardRef<HTMLButtonElement, ModernButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    animation,
    asChild = false, 
    icon,
    rightIcon,
    loading = false,
    glow = false,
    children,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : motion.button
    
    return (
      <Comp
        className={cn(
          modernButtonVariants({ variant, size, animation, className }),
          glow && "animate-pulse-glow",
          loading && "cursor-not-allowed"
        )}
        ref={ref}
        whileHover={{ scale: animation === "hover" ? 1.02 : 1 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        disabled={loading}
        {...props}
      >
        {/* Shimmer Effect */}
        {animation === "shimmer" && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
        )}
        
        {/* Loading Spinner */}
        {loading && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          </motion.div>
        )}
        
        {/* Content */}
        <div className={cn(
          "flex items-center gap-2 relative z-10",
          loading && "opacity-0"
        )}>
          {icon && (
            <motion.div
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              {icon}
            </motion.div>
          )}
          {children}
          {rightIcon && (
            <motion.div
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.1, x: 2 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              {rightIcon}
            </motion.div>
          )}
        </div>
      </Comp>
    )
  }
)

ModernButton.displayName = "ModernButton"

export { ModernButton, modernButtonVariants }