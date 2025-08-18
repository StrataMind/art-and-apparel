'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCart, CartItem } from '@/contexts/cart-context'
import { Minus, Plus, X, Package } from 'lucide-react'

interface CartItemProps {
  item: CartItem
  showRemoveButton?: boolean
  compact?: boolean
  showSellerInfo?: boolean
}

export default function CartItemComponent({
  item,
  showRemoveButton = true,
  compact = false,
  showSellerInfo = true
}: CartItemProps) {
  const { updateQuantity, removeItem } = useCart()
  const [isUpdating, setIsUpdating] = useState(false)

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 0 || newQuantity > item.maxQuantity) return
    
    setIsUpdating(true)
    updateQuantity(item.id, newQuantity)
    
    // Simulate API delay for better UX
    setTimeout(() => setIsUpdating(false), 300)
  }

  const handleRemove = () => {
    removeItem(item.id)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  const discountPercentage = item.compareAtPrice && item.compareAtPrice > item.price
    ? Math.round(((item.compareAtPrice - item.price) / item.compareAtPrice) * 100)
    : 0

  if (compact) {
    return (
      <div className="flex items-center space-x-3 py-3">
        <div className="flex-shrink-0 w-12 h-12 bg-gray-200 rounded overflow-hidden">
          {item.image ? (
            <Image
              src={item.image}
              alt={item.name}
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-6 h-6 text-gray-400" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {item.name}
          </p>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-sm text-gray-900 font-medium">
              {formatPrice(item.price)}
            </span>
            <span className="text-sm text-gray-500">
              × {item.quantity}
            </span>
          </div>
        </div>

        <div className="text-sm font-medium text-gray-900">
          {formatPrice(item.price * item.quantity)}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start space-x-4 py-6">
      {/* Product Image */}
      <div className="flex-shrink-0 w-20 h-20 bg-gray-200 rounded-lg overflow-hidden">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            width={80}
            height={80}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1 pr-4">
            <Link href={`/products/${item.slug}`} className="group">
              <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                {item.name}
              </h3>
            </Link>
            
            {showSellerInfo && (
              <p className="text-sm text-gray-600 mt-1">
                by {item.seller.businessName}
              </p>
            )}

            {item.variant && (
              <p className="text-sm text-gray-600 mt-1">
                {item.variant.name}: {item.variant.value}
              </p>
            )}

            {/* Price */}
            <div className="flex items-center space-x-2 mt-2">
              <span className="text-lg font-medium text-gray-900">
                {formatPrice(item.price)}
              </span>
              {item.compareAtPrice && item.compareAtPrice > item.price && (
                <>
                  <span className="text-sm text-gray-500 line-through">
                    {formatPrice(item.compareAtPrice)}
                  </span>
                  <span className="text-sm font-medium text-green-600">
                    {discountPercentage}% off
                  </span>
                </>
              )}
            </div>

            {/* Stock Warning */}
            {item.quantity >= item.maxQuantity && (
              <p className="text-sm text-amber-600 mt-1">
                Maximum quantity reached ({item.maxQuantity} available)
              </p>
            )}
          </div>

          {/* Remove Button */}
          {showRemoveButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="text-gray-400 hover:text-red-600 p-1"
              aria-label="Remove item"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-gray-700">Quantity:</span>
            
            <div className="flex items-center border border-gray-300 rounded-md">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleQuantityChange(item.quantity - 1)}
                disabled={item.quantity <= 1 || isUpdating}
                className="w-8 h-8 p-0 border-0 hover:bg-gray-100"
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4" />
              </Button>
              
              <Input
                type="number"
                value={item.quantity}
                onChange={(e) => {
                  const newQuantity = parseInt(e.target.value) || 1
                  if (newQuantity !== item.quantity) {
                    handleQuantityChange(newQuantity)
                  }
                }}
                min={1}
                max={item.maxQuantity}
                disabled={isUpdating}
                className="w-16 text-center border-0 focus:ring-0 focus:border-0 px-2"
              />
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleQuantityChange(item.quantity + 1)}
                disabled={item.quantity >= item.maxQuantity || isUpdating}
                className="w-8 h-8 p-0 border-0 hover:bg-gray-100"
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            <span className="text-sm text-gray-500">
              ({item.maxQuantity} available)
            </span>
          </div>

          {/* Total Price */}
          <div className="text-right">
            <div className="text-lg font-semibold text-gray-900">
              {formatPrice(item.price * item.quantity)}
            </div>
            {item.quantity > 1 && (
              <div className="text-sm text-gray-500">
                {formatPrice(item.price)} each
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Warning */}
        {item.maxQuantity <= 5 && item.maxQuantity > 0 && (
          <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md">
            <p className="text-sm text-amber-800">
              Only {item.maxQuantity} left in stock!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}