'use client'

import * as React from "react"
import { motion, HTMLMotionProps } from "framer-motion"
import { cva, type VariantProps } from "class-variance-authority"
import { Eye, EyeOff, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"

const modernInputVariants = cva(
  "flex w-full rounded-lg border transition-all duration-300 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-gray-300 bg-white focus:border-coral focus:ring-2 focus:ring-coral/20",
        minimal: "border-minimal-gray-300 bg-minimal-white focus:border-minimal-accent focus:ring-2 focus:ring-minimal-accent/20",
        glass: "border-white/20 bg-white/10 backdrop-blur-md text-white placeholder:text-white/70 focus:border-white/40 focus:ring-2 focus:ring-white/20",
        floating: "border-gray-200 bg-gray-50 focus:bg-white focus:border-coral focus:ring-2 focus:ring-coral/20 hover:bg-white",
        premium: "border-2 border-gray-200 bg-white focus:border-coral focus:ring-4 focus:ring-coral/10 shadow-sm hover:shadow-md",
        neon: "border-coral/50 bg-gray-900 text-white placeholder:text-gray-400 focus:border-coral focus:ring-2 focus:ring-coral/30 shadow-lg shadow-coral/10",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        default: "h-11 px-4 text-sm",
        lg: "h-13 px-5 text-base",
        xl: "h-16 px-6 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ModernInputProps
  extends Omit<HTMLMotionProps<"input">, "size">,
    VariantProps<typeof modernInputVariants> {
  icon?: React.ReactNode
  rightIcon?: React.ReactNode
  clearable?: boolean
  onClear?: () => void
  label?: string
  error?: string
  success?: string
  loading?: boolean
}

const ModernInput = React.forwardRef<HTMLInputElement, ModernInputProps>(
  ({ 
    className, 
    variant, 
    size, 
    type = "text",
    icon,
    rightIcon,
    clearable = false,
    onClear,
    label,
    error,
    success,
    loading = false,
    value,
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const [isFocused, setIsFocused] = React.useState(false)
    const isPassword = type === "password"
    const inputType = isPassword && showPassword ? "text" : type
    const hasValue = value && value.toString().length > 0

    const handleClear = () => {
      onClear?.()
    }

    return (
      <div className="relative w-full">
        {/* Label */}
        {label && (
          <motion.label
            className={cn(
              "block text-sm font-medium mb-2 transition-colors",
              error ? "text-red-600" : success ? "text-mint" : "text-gray-700"
            )}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {label}
          </motion.label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
              {icon}
            </div>
          )}

          {/* Input Field */}
          <motion.input
            ref={ref}
            type={inputType}
            value={value}
            className={cn(
              modernInputVariants({ variant, size }),
              icon && "pl-10",
              (rightIcon || isPassword || clearable || loading) && "pr-10",
              error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
              success && "border-mint focus:border-mint focus:ring-mint/20",
              className
            )}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            whileFocus={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            {...props}
          />

          {/* Right Icons */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
            {/* Loading Spinner */}
            {loading && (
              <motion.div
                className="w-4 h-4 border-2 border-gray-300 border-t-coral rounded-full animate-spin"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              />
            )}

            {/* Clear Button */}
            {clearable && hasValue && !loading && (
              <motion.button
                type="button"
                onClick={handleClear}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <X className="w-4 h-4" />
              </motion.button>
            )}

            {/* Password Toggle */}
            {isPassword && !loading && (
              <motion.button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </motion.button>
            )}

            {/* Right Icon */}
            {rightIcon && !isPassword && !clearable && !loading && (
              <div className="text-gray-400">
                {rightIcon}
              </div>
            )}
          </div>

          {/* Focus Ring Animation */}
          <motion.div
            className={cn(
              "absolute inset-0 rounded-lg pointer-events-none",
              variant === "glass" ? "ring-white/20" : "ring-coral/20"
            )}
            initial={{ scale: 1, opacity: 0 }}
            animate={{ 
              scale: isFocused ? 1.02 : 1, 
              opacity: isFocused ? 1 : 0 
            }}
            transition={{ duration: 0.2 }}
            style={{
              boxShadow: isFocused ? `0 0 0 3px ${variant === "glass" ? "rgba(255,255,255,0.2)" : "rgba(255,107,107,0.2)"}` : "none"
            }}
          />
        </div>

        {/* Error/Success Message */}
        {(error || success) && (
          <motion.p
            className={cn(
              "mt-2 text-sm",
              error ? "text-red-600" : "text-mint"
            )}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {error || success}
          </motion.p>
        )}
      </div>
    )
  }
)

ModernInput.displayName = "ModernInput"

// Search Input Component
export const SearchInput = React.forwardRef<HTMLInputElement, ModernInputProps>(
  ({ placeholder = "Search...", ...props }, ref) => {
    return (
      <ModernInput
        ref={ref}
        type="search"
        placeholder={placeholder}
        icon={<Search className="w-4 h-4" />}
        clearable
        {...props}
      />
    )
  }
)

SearchInput.displayName = "SearchInput"

export { ModernInput, modernInputVariants }