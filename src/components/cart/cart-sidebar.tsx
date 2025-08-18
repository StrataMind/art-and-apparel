'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useCart } from '@/contexts/cart-context'
import CartItemComponent from './cart-item'
import { X, ShoppingBag, Truck, Gift } from 'lucide-react'

export default function CartSidebar() {
  const {
    state,
    closeCart,
    clearCart,
    getFreeShippingProgress
  } = useCart()
  const sidebarRef = useRef<HTMLDivElement>(null)

  // Close cart when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        closeCart()
      }
    }

    if (state.isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'unset'
    }
  }, [state.isOpen, closeCart])

  // Close cart on escape key
  useEffect(() => {
    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        closeCart()
      }
    }

    if (state.isOpen) {
      document.addEventListener('keydown', handleEscapeKey)
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [state.isOpen, closeCart])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  const freeShippingProgress = getFreeShippingProgress()

  if (!state.isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50 transition-opacity" />

      {/* Sidebar */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div ref={sidebarRef} className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-6 h-6 text-gray-700" />
              <h2 className="text-lg font-semibold text-gray-900">
                Shopping Cart ({state.totalItems})
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={closeCart}
              className="p-2 hover:bg-gray-100 rounded-full"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          {state.items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center px-6">
              <div className="text-center">
                <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Your cart is empty
                </h3>
                <p className="text-gray-600 mb-6">
                  Add some products to get started
                </p>
                <Button onClick={closeCart} className="w-full">
                  Continue Shopping
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Free Shipping Progress */}
              {!freeShippingProgress.qualified && (
                <div className="px-6 py-4 bg-blue-50 border-b">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Truck className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">
                        Free Shipping
                      </span>
                    </div>
                    <span className="text-sm text-blue-700">
                      {formatPrice(freeShippingProgress.remaining)} to go
                    </span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, (freeShippingProgress.current / freeShippingProgress.target) * 100)}%`
                      }}
                    />
                  </div>
                </div>
              )}

              {freeShippingProgress.qualified && (
                <div className="px-6 py-3 bg-green-50 border-b">
                  <div className="flex items-center space-x-2">
                    <Gift className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-900">
                      You qualify for free shipping! 🎉
                    </span>
                  </div>
                </div>
              )}

              {/* Items */}
              <div className="flex-1 overflow-y-auto px-6">
                <div className="divide-y divide-gray-200">
                  {state.items.map((item) => (
                    <CartItemComponent
                      key={item.id}
                      item={item}
                      compact={true}
                      showSellerInfo={false}
                    />
                  ))}
                </div>

                {/* Clear Cart */}
                {state.items.length > 1 && (
                  <div className="py-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearCart}
                      className="w-full text-red-600 border-red-200 hover:bg-red-50"
                    >
                      Clear Cart
                    </Button>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                {/* Order Summary */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-gray-900">
                      {formatPrice(state.subtotal)}
                    </span>
                  </div>
                  
                  {state.discount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Discount</span>
                      <span className="font-medium text-green-600">
                        -{formatPrice(state.discount)}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium text-gray-900">
                      {state.shipping === 0 ? 'Free' : formatPrice(state.shipping)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium text-gray-900">
                      {formatPrice(state.tax)}
                    </span>
                  </div>
                  
                  <div className="border-t pt-2 flex items-center justify-between">
                    <span className="text-base font-semibold text-gray-900">Total</span>
                    <span className="text-lg font-bold text-gray-900">
                      {formatPrice(state.totalPrice)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Link href="/checkout" onClick={closeCart}>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Checkout ({formatPrice(state.totalPrice)})
                    </Button>
                  </Link>
                  
                  <Link href="/cart" onClick={closeCart}>
                    <Button variant="outline" className="w-full">
                      View Cart Details
                    </Button>
                  </Link>
                </div>

                {/* Continue Shopping */}
                <div className="mt-4 text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={closeCart}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Continue Shopping
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}