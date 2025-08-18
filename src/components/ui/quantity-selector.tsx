'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Minus, Plus } from 'lucide-react'

interface QuantitySelectorProps {
  value: number
  onChange: (quantity: number) => void
  min?: number
  max?: number
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  showStock?: boolean
  stockLabel?: string
  className?: string
}

export default function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled = false,
  size = 'md',
  showStock = true,
  stockLabel,
  className = ''
}: QuantitySelectorProps) {
  const [inputValue, setInputValue] = useState(value.toString())

  useEffect(() => {
    setInputValue(value.toString())
  }, [value])

  const handleDecrease = () => {
    const newValue = Math.max(min, value - 1)
    if (newValue !== value) {
      onChange(newValue)
    }
  }

  const handleIncrease = () => {
    const newValue = Math.min(max, value + 1)
    if (newValue !== value) {
      onChange(newValue)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value
    setInputValue(inputVal)

    // Only update if it's a valid number within range
    const numValue = parseInt(inputVal)
    if (!isNaN(numValue) && numValue >= min && numValue <= max) {
      onChange(numValue)
    }
  }

  const handleInputBlur = () => {
    const numValue = parseInt(inputValue)
    if (isNaN(numValue) || numValue < min || numValue > max) {
      // Reset to current valid value
      setInputValue(value.toString())
    }
  }

  const sizeClasses = {
    sm: {
      button: 'w-6 h-6 p-0',
      input: 'w-10 h-6 text-xs',
      text: 'text-xs'
    },
    md: {
      button: 'w-8 h-8 p-0',
      input: 'w-14 h-8 text-sm',
      text: 'text-sm'
    },
    lg: {
      button: 'w-10 h-10 p-0',
      input: 'w-16 h-10 text-base',
      text: 'text-base'
    }
  }

  const currentSize = sizeClasses[size]

  return (
    <div className={`flex flex-col space-y-2 ${className}`}>
      <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleDecrease}
          disabled={disabled || value <= min}
          className={`${currentSize.button} border-0 hover:bg-gray-100 disabled:opacity-50`}
          aria-label="Decrease quantity"
        >
          <Minus className="w-3 h-3" />
        </Button>
        
        <Input
          type="number"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          min={min}
          max={max}
          disabled={disabled}
          className={`${currentSize.input} text-center border-0 focus:ring-0 focus:border-0 px-1`}
          aria-label="Quantity"
        />
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleIncrease}
          disabled={disabled || value >= max}
          className={`${currentSize.button} border-0 hover:bg-gray-100 disabled:opacity-50`}
          aria-label="Increase quantity"
        >
          <Plus className="w-3 h-3" />
        </Button>
      </div>
      
      {showStock && (
        <div className={`${currentSize.text} text-gray-500 text-center`}>
          {stockLabel || `${max} available`}
        </div>
      )}
      
      {value >= max && max > 0 && (
        <div className={`${currentSize.text} text-amber-600 text-center`}>
          Maximum quantity reached
        </div>
      )}
    </div>
  )
}