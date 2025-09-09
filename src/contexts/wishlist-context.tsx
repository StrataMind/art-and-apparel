'use client'

import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { toast } from 'sonner'
import { trackAddToWishlist } from '@/lib/analytics'

export interface WishlistItem {
  id: string
  productId: string
  name: string
  slug: string
  price: number
  compareAtPrice?: number
  image?: string
  inStock: boolean
  seller: {
    id: string
    businessName: string
  }
  addedAt: string
  category?: {
    id: string
    name: string
  }
}

export interface WishlistState {
  items: WishlistItem[]
  totalItems: number
  isLoading: boolean
}

type WishlistAction =
  | { type: 'ADD_ITEM'; payload: Omit<WishlistItem, 'addedAt'> }
  | { type: 'REMOVE_ITEM'; payload: { productId: string } }
  | { type: 'CLEAR_WISHLIST' }
  | { type: 'LOAD_WISHLIST'; payload: WishlistItem[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'UPDATE_ITEM_STOCK'; payload: { productId: string; inStock: boolean } }
  | { type: 'MOVE_TO_CART'; payload: { productId: string } }

function wishlistReducer(state: WishlistState, action: WishlistAction): WishlistState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.productId === action.payload.productId)
      
      if (existingItem) {
        toast.info(`${action.payload.name} is already in your wishlist`)
        return state
      }

      const newItem: WishlistItem = {
        ...action.payload,
        addedAt: new Date().toISOString()
      }

      return {
        ...state,
        items: [newItem, ...state.items],
        totalItems: state.items.length + 1
      }
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.productId !== action.payload.productId)
      return {
        ...state,
        items: newItems,
        totalItems: newItems.length
      }
    }

    case 'CLEAR_WISHLIST': {
      return {
        ...state,
        items: [],
        totalItems: 0
      }
    }

    case 'LOAD_WISHLIST': {
      return {
        ...state,
        items: action.payload,
        totalItems: action.payload.length
      }
    }

    case 'SET_LOADING': {
      return {
        ...state,
        isLoading: action.payload
      }
    }

    case 'UPDATE_ITEM_STOCK': {
      const newItems = state.items.map(item => 
        item.productId === action.payload.productId 
          ? { ...item, inStock: action.payload.inStock }
          : item
      )
      return {
        ...state,
        items: newItems
      }
    }

    case 'MOVE_TO_CART': {
      // Remove from wishlist when moved to cart
      const newItems = state.items.filter(item => item.productId !== action.payload.productId)
      return {
        ...state,
        items: newItems,
        totalItems: newItems.length
      }
    }

    default:
      return state
  }
}

const initialState: WishlistState = {
  items: [],
  totalItems: 0,
  isLoading: false
}

interface WishlistContextType {
  state: WishlistState
  addItem: (item: Omit<WishlistItem, 'addedAt'>) => void
  removeItem: (productId: string) => void
  clearWishlist: () => void
  isInWishlist: (productId: string) => boolean
  moveToCart: (productId: string) => void
  shareWishlist: () => Promise<string | null>
  getWishlistStats: () => { totalItems: number; inStockItems: number; totalValue: number }
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

const STORAGE_KEY = 'findora_wishlist'

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(wishlistReducer, initialState)
  const [isHydrated, setIsHydrated] = React.useState(false)

  // Handle hydration and load wishlist from localStorage  
  useEffect(() => {
    setIsHydrated(true)
    
    if (typeof window !== 'undefined') {
      try {
        const savedWishlist = localStorage.getItem(STORAGE_KEY)
        if (savedWishlist) {
          const items: WishlistItem[] = JSON.parse(savedWishlist)
          if (Array.isArray(items)) {
            dispatch({ type: 'LOAD_WISHLIST', payload: items })
          }
        }
      } catch (error) {
        // Handle errors gracefully in production
        if (process.env.NODE_ENV === 'development') {
          console.error('Error loading wishlist from localStorage:', error)
        }
        // Clear invalid data
        localStorage.removeItem(STORAGE_KEY)
      }
    }
  }, [])

  // Save wishlist to localStorage whenever it changes (only after hydration)
  useEffect(() => {
    if (isHydrated && typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items))
      } catch (error) {
        // Handle localStorage errors gracefully
        if (process.env.NODE_ENV === 'development') {
          console.error('Error saving wishlist to localStorage:', error)
        }
      }
    }
  }, [state.items, isHydrated])

  // Periodically check stock status for wishlist items
  useEffect(() => {
    if (state.items.length === 0) return

    const checkStockStatus = async () => {
      try {
        const productIds = state.items.map(item => item.productId)
        const response = await fetch('/api/products/stock-check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productIds })
        })

        if (response.ok) {
          const { stockStatus } = await response.json()
          
          Object.entries(stockStatus).forEach(([productId, inStock]) => {
            const currentItem = state.items.find(item => item.productId === productId)
            if (currentItem && currentItem.inStock !== inStock) {
              dispatch({ 
                type: 'UPDATE_ITEM_STOCK', 
                payload: { productId, inStock: inStock as boolean } 
              })
              
              // Notify user if item went out of stock
              if (!inStock) {
                toast.warning(`${currentItem.name} is now out of stock`, {
                  action: {
                    label: 'View Wishlist',
                    onClick: () => {
                      if (typeof window !== 'undefined') {
                        window.location.href = '/wishlist'
                      }
                    }
                  }
                })
              }
            }
          })
        }
      } catch (error) {
        console.error('Error checking stock status:', error)
      }
    }

    // Check immediately and then every 5 minutes
    checkStockStatus()
    const interval = setInterval(checkStockStatus, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [state.items])

  const addItem = (item: Omit<WishlistItem, 'addedAt'>) => {
    dispatch({ type: 'ADD_ITEM', payload: item })
    
    toast.success(`${item.name} added to wishlist`, {
      action: {
        label: 'View Wishlist',
        onClick: () => {
          if (typeof window !== 'undefined') {
            window.location.href = '/wishlist'
          }
        }
      }
    })

    // Track wishlist addition with comprehensive analytics
    trackAddToWishlist({
      item_id: item.productId,
      item_name: item.name,
      item_category: item.category?.name,
      price: item.price,
      currency: 'USD'
    })
  }

  const removeItem = (productId: string) => {
    const item = state.items.find(item => item.productId === productId)
    dispatch({ type: 'REMOVE_ITEM', payload: { productId } })
    
    if (item) {
      toast.success(`${item.name} removed from wishlist`)
    }
  }

  const clearWishlist = () => {
    dispatch({ type: 'CLEAR_WISHLIST' })
    toast.success('Wishlist cleared')
  }

  const isInWishlist = (productId: string): boolean => {
    return state.items.some(item => item.productId === productId)
  }

  const moveToCart = (productId: string) => {
    const item = state.items.find(item => item.productId === productId)
    if (!item) return

    // Import cart context to add item
    import('@/contexts/cart-context').then(({ useCart }) => {
      // This would need to be handled differently in a real app
      // For now, we'll just remove from wishlist and show a message
      dispatch({ type: 'MOVE_TO_CART', payload: { productId } })
      toast.success(`${item.name} moved to cart`)
    })
  }

  const shareWishlist = async (): Promise<string | null> => {
    try {
      // Create a shareable wishlist URL
      const wishlistId = Math.random().toString(36).substring(2, 15)
      const shareableWishlist = {
        id: wishlistId,
        items: state.items.map(item => ({
          productId: item.productId,
          name: item.name,
          slug: item.slug,
          price: item.price,
          image: item.image
        })),
        createdAt: new Date().toISOString()
      }

      // In a real app, you'd save this to a database
      // For demo purposes, we'll use localStorage with a special key
      localStorage.setItem(`findora_shared_wishlist_${wishlistId}`, JSON.stringify(shareableWishlist))

      const shareUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/wishlist/shared/${wishlistId}`
        : `/wishlist/shared/${wishlistId}`

      // Try to use Web Share API if available
      if (navigator.share) {
        await navigator.share({
          title: 'My Findora Wishlist',
          text: `Check out the products I'm interested in!`,
          url: shareUrl
        })
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareUrl)
        toast.success('Wishlist link copied to clipboard!')
      }

      return shareUrl
    } catch (error) {
      console.error('Error sharing wishlist:', error)
      toast.error('Failed to share wishlist')
      return null
    }
  }

  const getWishlistStats = () => {
    const inStockItems = state.items.filter(item => item.inStock).length
    const totalValue = state.items.reduce((sum, item) => sum + item.price, 0)
    
    return {
      totalItems: state.totalItems,
      inStockItems,
      totalValue
    }
  }

  return (
    <WishlistContext.Provider
      value={{
        state,
        addItem,
        removeItem,
        clearWishlist,
        isInWishlist,
        moveToCart,
        shareWishlist,
        getWishlistStats
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return context
}

export function useWishlistItem(productId: string) {
  const { isInWishlist } = useWishlist()
  
  return {
    isInWishlist: isInWishlist(productId)
  }
}