'use client'

import { Package, Clock, AlertTriangle, CheckCircle } from 'lucide-react'

interface AvailabilityFilterProps {
  value: string[]
  onValueChange: (availability: string[]) => void
  showCounts?: boolean
  className?: string
}

export default function AvailabilityFilter({
  value,
  onValueChange,
  showCounts = false,
  className = ""
}: AvailabilityFilterProps) {
  const availabilityOptions = [
    {
      id: 'IN_STOCK',
      label: 'In Stock',
      description: 'Available for immediate shipping',
      icon: CheckCircle,
      color: 'text-green-600',
      count: showCounts ? 2456 : undefined
    },
    {
      id: 'LOW_STOCK',
      label: 'Low Stock',
      description: 'Limited quantity available',
      icon: AlertTriangle,
      color: 'text-yellow-600',
      count: showCounts ? 234 : undefined
    },
    {
      id: 'BACKORDER',
      label: 'Backorder',
      description: 'Available for pre-order',
      icon: Clock,
      color: 'text-blue-600',
      count: showCounts ? 145 : undefined
    },
    {
      id: 'PRE_ORDER',
      label: 'Pre-order',
      description: 'Coming soon items',
      icon: Package,
      color: 'text-purple-600',
      count: showCounts ? 67 : undefined
    }
  ]

  const handleToggle = (availabilityId: string) => {
    if (value.includes(availabilityId)) {
      onValueChange(value.filter(id => id !== availabilityId))
    } else {
      onValueChange([...value, availabilityId])
    }
  }

  const clearAll = () => {
    onValueChange([])
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Availability</span>
        {value.length > 0 && (
          <button
            onClick={clearAll}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            Clear all
          </button>
        )}
      </div>
      
      {availabilityOptions.map(({ id, label, description, icon: Icon, color, count }) => (
        <div key={id}>
          <label className="flex items-center p-2 rounded-md hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={value.includes(id)}
              onChange={() => handleToggle(id)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
            />
            <div className="flex items-center space-x-3 flex-1">
              <Icon className={`h-4 w-4 ${color}`} />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{label}</span>
                  {count !== undefined && (
                    <span className="text-xs text-gray-500">({count})</span>
                  )}
                </div>
                <p className="text-xs text-gray-500">{description}</p>
              </div>
            </div>
          </label>
        </div>
      ))}
    </div>
  )
}