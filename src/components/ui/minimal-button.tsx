'use client'

import React from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MinimalButtonProps extends Omit<HTMLMotionProps<'button'>, 'size'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  children: React.ReactNode
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
}

const variantStyles = {
  primary: 'bg-gray-900 text-white hover:bg-gray-800 shadow-sm',
  secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
  outline: 'border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50',
  ghost: 'text-gray-700 hover:bg-gray-100'
}

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm font-medium',
  md: 'px-4 py-2 text-base font-medium',
  lg: 'px-6 py-3 text-lg font-medium'
}

const minimalistButtonVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.98 }
}

export default function MinimalButton({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  children,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className,
  ...props
}: MinimalButtonProps) {
  const isDisabled = disabled || loading

  return (
    <motion.button
      className={cn(
        // Base styles - clean and minimal
        'relative inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed btn-hover',
        
        // Variant styles
        variantStyles[variant],
        
        // Size styles
        sizeStyles[size],
        
        // Full width
        fullWidth && 'w-full',
        
        className
      )}
      variants={minimalistButtonVariants}
      initial="rest"
      whileHover={!isDisabled ? "hover" : "rest"}
      whileTap={!isDisabled ? "tap" : "rest"}
      disabled={isDisabled}
      {...props}
    >
      {/* Content */}
      <span className="flex items-center justify-center gap-2">
        {loading && (
          <Loader2 className="w-4 h-4 animate-spin" />
        )}
        
        {!loading && icon && iconPosition === 'left' && (
          <span className="w-4 h-4">{icon}</span>
        )}
        
        <span>{children}</span>
        
        {!loading && icon && iconPosition === 'right' && (
          <span className="w-4 h-4">{icon}</span>
        )}
      </span>
    </motion.button>
  )
}