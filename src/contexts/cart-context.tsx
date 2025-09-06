'use client'

import React, { createContext, useContext, useReducer, useEffect } from 'react'

export interface CartItem {
  id: string
  name: string
  price: number
  image?: string
  quantity: number
  slug: string
}

interface CartState {
  items: CartItem[]
  totalItems: number
  totalPrice: number
  subtotal: number
  tax: number
  shipping: number
  discount: number
  isOpen: boolean
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'quantity'> }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] }
  | { type: 'TOGGLE_CART' }
  | { type: 'OPEN_CART' }
  | { type: 'CLOSE_CART' }

const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  subtotal: 0,
  tax: 0,
  shipping: 0,
  discount: 0,
  isOpen: false
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.id === action.payload.id)
      
      let newItems: CartItem[]
      if (existingItem) {
        newItems = state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      } else {
        newItems = [...state.items, { ...action.payload, quantity: 1 }]
      }

      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0)
      const subtotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      const tax = subtotal * 0.08 // 8% tax
      const shipping = subtotal >= 50 ? 0 : 5 // Free shipping over $50
      const totalPrice = subtotal + tax + shipping

      return {
        ...state,
        items: newItems,
        totalItems,
        subtotal,
        tax,
        shipping,
        totalPrice,
        isOpen: true // Open cart when item added
      }
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.id !== action.payload)
      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0)
      const subtotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      const tax = subtotal * 0.08
      const shipping = subtotal >= 50 ? 0 : (subtotal > 0 ? 5 : 0)
      const totalPrice = subtotal + tax + shipping

      return {
        ...state,
        items: newItems,
        totalItems,
        subtotal,
        tax,
        shipping,
        totalPrice
      }
    }

    case 'UPDATE_QUANTITY': {
      const newItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: Math.max(0, action.payload.quantity) }
          : item
      ).filter(item => item.quantity > 0)

      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0)
      const subtotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      const tax = subtotal * 0.08
      const shipping = subtotal >= 50 ? 0 : (subtotal > 0 ? 5 : 0)
      const totalPrice = subtotal + tax + shipping

      return {
        ...state,
        items: newItems,
        totalItems,
        subtotal,
        tax,
        shipping,
        totalPrice
      }
    }

    case 'CLEAR_CART':
      return { ...initialState, isOpen: state.isOpen }

    case 'LOAD_CART': {
      const totalItems = action.payload.reduce((sum, item) => sum + item.quantity, 0)
      const subtotal = action.payload.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      const tax = subtotal * 0.08
      const shipping = subtotal >= 50 ? 0 : (subtotal > 0 ? 5 : 0)
      const totalPrice = subtotal + tax + shipping

      return {
        ...state,
        items: action.payload,
        totalItems,
        subtotal,
        tax,
        shipping,
        totalPrice
      }
    }

    case 'TOGGLE_CART':
      return { ...state, isOpen: !state.isOpen }

    case 'OPEN_CART':
      return { ...state, isOpen: true }

    case 'CLOSE_CART':
      return { ...state, isOpen: false }

    default:
      return state
  }
}

interface CartContextType {
  state: CartState
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  getItemQuantity: (id: string) => number
  isItemInCart: (id: string) => boolean
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
  getFreeShippingProgress: () => { qualified: boolean; current: number; target: number; remaining: number }
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)
  const [isHydrated, setIsHydrated] = React.useState(false)

  // Handle hydration and load cart from localStorage
  useEffect(() => {
    setIsHydrated(true)
    
    // Only access localStorage after hydration
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('findora-cart')
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart)
          if (Array.isArray(parsedCart)) {
            dispatch({ type: 'LOAD_CART', payload: parsedCart })
          }
        } catch (error) {
          // Silently handle localStorage errors in production
          if (process.env.NODE_ENV === 'development') {
            console.error('Error loading cart from localStorage:', error)
          }
          // Clear invalid data
          localStorage.removeItem('findora-cart')
        }
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes (only after hydration)
  useEffect(() => {
    if (isHydrated && typeof window !== 'undefined') {
      try {
        localStorage.setItem('findora-cart', JSON.stringify(state.items))
      } catch (error) {
        // Handle localStorage errors gracefully
        if (process.env.NODE_ENV === 'development') {
          console.error('Error saving cart to localStorage:', error)
        }
      }
    }
  }, [state.items, isHydrated])

  const addItem = (item: Omit<CartItem, 'quantity'>) => {
    dispatch({ type: 'ADD_ITEM', payload: item })
  }

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id })
  }

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } })
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
  }

  const getItemQuantity = (id: string): number => {
    const item = state.items.find(item => item.id === id)
    return item ? item.quantity : 0
  }

  const isItemInCart = (id: string): boolean => {
    return state.items.some(item => item.id === id)
  }

  const toggleCart = () => {
    dispatch({ type: 'TOGGLE_CART' })
  }

  const openCart = () => {
    dispatch({ type: 'OPEN_CART' })
  }

  const closeCart = () => {
    dispatch({ type: 'CLOSE_CART' })
  }

  const getFreeShippingProgress = () => {
    const target = 50 // $50 for free shipping
    const current = state.subtotal
    const remaining = Math.max(0, target - current)
    const qualified = current >= target

    return {
      qualified,
      current,
      target,
      remaining
    }
  }

  return (
    <CartContext.Provider value={{
      state,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      getItemQuantity,
      isItemInCart,
      toggleCart,
      openCart,
      closeCart,
      getFreeShippingProgress
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}