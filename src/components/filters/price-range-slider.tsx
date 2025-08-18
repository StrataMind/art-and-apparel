'use client'

import { useState, useEffect } from 'react'
import { Slider } from '@/components/ui/slider'

interface PriceRangeSliderProps {
  min?: number
  max?: number
  step?: number
  value: [number, number]
  onValueChange: (value: [number, number]) => void
  formatValue?: (value: number) => string
  className?: string
}

export default function PriceRangeSlider({
  min = 0,
  max = 1000,
  step = 10,
  value,
  onValueChange,
  formatValue = (val) => `$${val}`,
  className = ""
}: PriceRangeSliderProps) {
  const [localValue, setLocalValue] = useState<[number, number]>(value)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const handleValueChange = (newValue: number[]) => {
    const range = [newValue[0], newValue[1]] as [number, number]
    setLocalValue(range)
  }

  const handleValueCommit = (newValue: number[]) => {
    const range = [newValue[0], newValue[1]] as [number, number]
    onValueChange(range)
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="px-2">
        <Slider
          min={min}
          max={max}
          step={step}
          value={localValue}
          onValueChange={handleValueChange}
          onValueCommit={handleValueCommit}
          className="w-full"
        />
      </div>
      
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>{formatValue(localValue[0])}</span>
        <span className="text-gray-400">to</span>
        <span>{formatValue(localValue[1])}</span>
      </div>
      
      <div className="flex space-x-2">
        <div className="flex-1">
          <label className="block text-xs text-gray-500 mb-1">Min Price</label>
          <input
            type="number"
            min={min}
            max={max}
            value={localValue[0]}
            onChange={(e) => {
              const val = Math.max(min, Math.min(Number(e.target.value), localValue[1]))
              const newRange = [val, localValue[1]] as [number, number]
              setLocalValue(newRange)
              onValueChange(newRange)
            }}
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs text-gray-500 mb-1">Max Price</label>
          <input
            type="number"
            min={min}
            max={max}
            value={localValue[1]}
            onChange={(e) => {
              const val = Math.min(max, Math.max(Number(e.target.value), localValue[0]))
              const newRange = [localValue[0], val] as [number, number]
              setLocalValue(newRange)
              onValueChange(newRange)
            }}
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>
    </div>
  )
}