'use client'

import { Star } from 'lucide-react'

interface RatingFilterProps {
  value: number
  onValueChange: (rating: number) => void
  showCounts?: boolean
  className?: string
}

export default function RatingFilter({
  value,
  onValueChange,
  showCounts = false,
  className = ""
}: RatingFilterProps) {
  const ratings = [
    { stars: 4, label: '4+ Stars', count: showCounts ? 245 : undefined },
    { stars: 3, label: '3+ Stars', count: showCounts ? 567 : undefined },
    { stars: 2, label: '2+ Stars', count: showCounts ? 789 : undefined },
    { stars: 1, label: '1+ Stars', count: showCounts ? 123 : undefined },
  ]

  const renderStars = (count: number, filled: boolean = true) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-3 w-3 ${
          index < count
            ? filled 
              ? 'text-yellow-400 fill-current' 
              : 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ))
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div>
        <button
          onClick={() => onValueChange(0)}
          className={`w-full text-left p-2 rounded-md text-sm transition-colors ${
            value === 0
              ? 'bg-blue-100 text-blue-900'
              : 'hover:bg-gray-50'
          }`}
        >
          All Ratings
        </button>
      </div>
      
      {ratings.map(({ stars, label, count }) => (
        <div key={stars}>
          <button
            onClick={() => onValueChange(stars)}
            className={`w-full text-left p-2 rounded-md transition-colors ${
              value === stars
                ? 'bg-blue-100 text-blue-900'
                : 'hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="flex">
                  {renderStars(stars)}
                </div>
                <span className="text-sm text-gray-700">{label}</span>
              </div>
              {count !== undefined && (
                <span className="text-xs text-gray-500">({count})</span>
              )}
            </div>
          </button>
        </div>
      ))}
    </div>
  )
}