'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCart } from '@/contexts/cart-context'
import CartItemComponent from '@/components/cart/cart-item'
import {
  ShoppingBag,
  ArrowLeft,
  Truck,
  Shield,
  RefreshCw,
  Gift,
  Tag,
  CreditCard,
  Lock
} from 'lucide-react'

export default function CartPage() {
  const router = useRouter()
  const {
    state,
    clearCart,
    getFreeShippingProgress,
    applyDiscount
  } = useCart()
  
  const [promoCode, setPromoCode] = useState('')
  const [isApplyingPromo, setIsApplyingPromo] = useState(false)
  const [promoError, setPromoError] = useState('')

  useEffect(() => {
    // Track cart page view
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'view_cart', {
        currency: 'USD',
        value: state.totalPrice
      })
    }
  }, [state.totalPrice])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) return

    setIsApplyingPromo(true)
    setPromoError('')

    // Simulate promo code validation
    setTimeout(() => {
      const validPromoCodes = ['SAVE10', 'WELCOME15', 'FREESHIP']
      const promoUpper = promoCode.toUpperCase()
      
      if (validPromoCodes.includes(promoUpper)) {
        let discountAmount = 0
        
        switch (promoUpper) {
          case 'SAVE10':
            discountAmount = state.subtotal * 0.1
            break
          case 'WELCOME15':
            discountAmount = state.subtotal * 0.15
            break
          case 'FREESHIP':
            discountAmount = state.shipping
            break
        }
        
        applyDiscount(discountAmount)
        setPromoCode('')
      } else {
        setPromoError('Invalid promo code')
      }
      
      setIsApplyingPromo(false)
    }, 1000)
  }

  const handleCheckout = () => {
    // Track checkout initiation
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'begin_checkout', {
        currency: 'USD',
        value: state.totalPrice,
        items: state.items.map(item => ({
          item_id: item.productId,
          item_name: item.name,
          quantity: item.quantity,
          price: item.price
        }))
      })
    }
    
    router.push('/checkout')
  }

  const freeShippingProgress = getFreeShippingProgress()

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-8" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Your cart is empty
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Looks like you haven't added any items to your cart yet.
            </p>
            <div className="space-y-4">
              <Link href="/products">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  Start Shopping
                </Button>
              </Link>
              <div>
                <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium">
                  ← Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link href="/products">
              <Button variant="ghost" size="sm" className="text-gray-600">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Continue Shopping
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Shopping Cart ({state.totalItems} {state.totalItems === 1 ? 'item' : 'items'})
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Items in your cart
                  </h2>
                  {state.items.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearCart}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      Clear All
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="divide-y divide-gray-200">
                {state.items.map((item) => (
                  <div key={item.id} className="px-6">
                    <CartItemComponent item={item} />
                  </div>
                ))}
              </div>
            </div>

            {/* Trust Badges */}
            <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="flex flex-col items-center">
                  <Shield className="w-8 h-8 text-green-600 mb-2" />
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">
                    Secure Checkout
                  </h3>
                  <p className="text-xs text-gray-600">
                    256-bit SSL encryption
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <Truck className="w-8 h-8 text-blue-600 mb-2" />
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">
                    Free Shipping
                  </h3>
                  <p className="text-xs text-gray-600">
                    On orders over $50
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <RefreshCw className="w-8 h-8 text-purple-600 mb-2" />
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">
                    30-Day Returns
                  </h3>
                  <p className="text-xs text-gray-600">
                    Easy return policy
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              {/* Free Shipping Progress */}
              {!freeShippingProgress.qualified && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
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
                  <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, (freeShippingProgress.current / freeShippingProgress.target) * 100)}%`
                      }}
                    />
                  </div>
                  <p className="text-xs text-blue-800">
                    Add {formatPrice(freeShippingProgress.remaining)} more to qualify for free shipping!
                  </p>
                </div>
              )}

              {freeShippingProgress.qualified && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-2">
                    <Gift className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-900">
                      You qualify for free shipping! 🎉
                    </span>
                  </div>
                </div>
              )}

              {/* Promo Code */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Promo Code
                </h3>
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <Input
                      type="text"
                      placeholder="Enter promo code"
                      value={promoCode}
                      onChange={(e) => {
                        setPromoCode(e.target.value)
                        setPromoError('')
                      }}
                      disabled={isApplyingPromo}
                      className={promoError ? 'border-red-300' : ''}
                    />
                    {promoError && (
                      <p className="text-sm text-red-600 mt-1">{promoError}</p>
                    )}
                  </div>
                  <Button
                    onClick={handleApplyPromoCode}
                    disabled={isApplyingPromo || !promoCode.trim()}
                    variant="outline"
                  >
                    {isApplyingPromo ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Tag className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <div className="mt-3 text-xs text-gray-600">
                  Try: SAVE10, WELCOME15, or FREESHIP
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Order Summary
                </h3>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      Subtotal ({state.totalItems} items)
                    </span>
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
                    <span className="text-gray-600">Estimated Tax</span>
                    <span className="font-medium text-gray-900">
                      {formatPrice(state.tax)}
                    </span>
                  </div>
                  
                  <div className="border-t pt-3 flex items-center justify-between">
                    <span className="text-base font-semibold text-gray-900">
                      Total
                    </span>
                    <span className="text-xl font-bold text-gray-900">
                      {formatPrice(state.totalPrice)}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleCheckout}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                  size="lg"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Secure Checkout
                </Button>

                <div className="mt-4 text-center">
                  <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                    <CreditCard className="w-4 h-4" />
                    <span>Secure payment with SSL encryption</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}