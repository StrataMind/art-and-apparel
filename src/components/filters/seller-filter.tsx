'use client'

import { Shield, Star, Award, Users } from 'lucide-react'

interface SellerFilterProps {
  value: string[]
  onValueChange: (sellers: string[]) => void
  showCounts?: boolean
  className?: string
}

export default function SellerFilter({
  value,
  onValueChange,
  showCounts = false,
  className = ""
}: SellerFilterProps) {
  const sellerTypes = [
    {
      id: 'VERIFIED',
      label: 'Verified Sellers',
      description: 'Identity and business verified',
      icon: Shield,
      color: 'text-green-600',
      count: showCounts ? 342 : undefined
    },
    {
      id: 'PREMIUM',
      label: 'Premium Sellers',
      description: 'Premium membership with benefits',
      icon: Award,
      color: 'text-purple-600',
      count: showCounts ? 156 : undefined
    },
    {
      id: 'TOP_RATED',
      label: 'Top Rated',
      description: '4.5+ average rating',
      icon: Star,
      color: 'text-yellow-600',
      count: showCounts ? 89 : undefined
    },
    {
      id: 'HIGH_VOLUME',
      label: 'High Volume',
      description: '1000+ products sold',
      icon: Users,
      color: 'text-blue-600',
      count: showCounts ? 67 : undefined
    }
  ]

  const handleToggle = (sellerId: string) => {
    if (value.includes(sellerId)) {
      onValueChange(value.filter(id => id !== sellerId))
    } else {
      onValueChange([...value, sellerId])
    }
  }

  const clearAll = () => {
    onValueChange([])
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Seller Type</span>
        {value.length > 0 && (
          <button
            onClick={clearAll}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            Clear all
          </button>
        )}
      </div>
      
      {sellerTypes.map(({ id, label, description, icon: Icon, color, count }) => (
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