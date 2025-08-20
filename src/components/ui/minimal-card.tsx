'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface MinimalCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
  border?: boolean
  shadow?: 'none' | 'sm' | 'md'
}

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8'
}

const shadowStyles = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow-md'
}

const cardVariants = {
  rest: { y: 0, boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' },
  hover: { y: -2, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }
}

export default function MinimalCard({
  children,
  className,
  hover = true,
  padding = 'md',
  border = true,
  shadow = 'sm',
  ...props
}: MinimalCardProps) {
  return (
    <motion.div
      className={cn(
        // Base styles
        'bg-white rounded-2xl transition-all duration-200 card-hover',
        
        // Border
        border && 'border border-gray-100',
        
        // Padding
        paddingStyles[padding],
        
        // Shadow
        shadowStyles[shadow],
        
        className
      )}
      variants={hover ? cardVariants : undefined}
      initial="rest"
      whileHover={hover ? "hover" : undefined}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function MinimalCardHeader({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string 
}) {
  return (
    <div className={cn('mb-4', className)}>
      {children}
    </div>
  )
}

export function MinimalCardTitle({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string 
}) {
  return (
    <h3 className={cn('text-lg font-semibold text-gray-900 mb-2', className)}>
      {children}
    </h3>
  )
}

export function MinimalCardContent({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string 
}) {
  return (
    <div className={cn('text-gray-700', className)}>
      {children}
    </div>
  )
}

export function MinimalCardFooter({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string 
}) {
  return (
    <div className={cn('mt-4 pt-4 border-t border-gray-200', className)}>
      {children}
    </div>
  )
}