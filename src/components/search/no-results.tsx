'use client'

import { Search, TrendingUp, Filter, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface NoResultsProps {
  searchTerm?: string
  totalFilters?: number
  onClearFilters?: () => void
  onClearSearch?: () => void
  suggestions?: string[]
  popularSearches?: string[]
  className?: string
}

export default function NoResults({
  searchTerm,
  totalFilters = 0,
  onClearFilters,
  onClearSearch,
  suggestions = [
    'Try different keywords',
    'Check your spelling',
    'Use more general terms',
    'Remove some filters'
  ],
  popularSearches = [
    'Electronics',
    'Clothing',
    'Books',
    'Home & Garden',
    'Sports Equipment'
  ],
  className = ""
}: NoResultsProps) {
  const hasActiveFilters = totalFilters > 0
  const hasSearchTerm = searchTerm && searchTerm.length > 0

  return (
    <div className={`text-center py-12 ${className}`}>
      {/* Icon */}
      <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <Search className="w-10 h-10 text-gray-400" />
      </div>

      {/* Main Message */}
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        No products found
      </h3>
      
      {hasSearchTerm && (
        <p className="text-gray-600 mb-4">
          We couldn't find any products matching "{searchTerm}"
        </p>
      )}

      {hasActiveFilters && (
        <p className="text-gray-600 mb-4">
          Try removing some filters to see more results
        </p>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
        {hasSearchTerm && onClearSearch && (
          <Button variant="outline" onClick={onClearSearch}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Clear Search
          </Button>
        )}
        
        {hasActiveFilters && onClearFilters && (
          <Button variant="outline" onClick={onClearFilters}>
            <Filter className="w-4 h-4 mr-2" />
            Clear All Filters
          </Button>
        )}
        
        <Link href="/products">
          <Button>
            Browse All Products
          </Button>
        </Link>
      </div>

      {/* Suggestions */}
      <div className="max-w-md mx-auto space-y-6">
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Suggestions:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-center">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-3"></span>
                {suggestion}
              </li>
            ))}
          </ul>
        </div>

        {/* Popular Searches */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 mr-2" />
            Popular Searches:
          </h4>
          <div className="flex flex-wrap gap-2 justify-center">
            {popularSearches.map((search, index) => (
              <Link
                key={index}
                href={`/products?search=${encodeURIComponent(search)}`}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                {search}
              </Link>
            ))}
          </div>
        </div>

        {/* Category Links */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Browse by Category:</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <Link href="/categories/electronics" className="text-blue-600 hover:text-blue-800">
              Electronics
            </Link>
            <Link href="/categories/fashion" className="text-blue-600 hover:text-blue-800">
              Fashion
            </Link>
            <Link href="/categories/home-garden" className="text-blue-600 hover:text-blue-800">
              Home & Garden
            </Link>
            <Link href="/categories/books" className="text-blue-600 hover:text-blue-800">
              Books
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}