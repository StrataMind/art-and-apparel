'use client'

import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { toast } from 'sonner'

export interface CartItem {
  id: string
  productId: string
  name: string
  slug: string
  price: number
  compareAtPrice?: number
  quantity: number
  maxQuantity: number
  image?: string
  seller: {
    id: string
    businessName: string
  }
  variant?: {
    id: string
    name: string
    value: string
  }
}

export interface CartState {
  items: CartItem[]
  isOpen: boolean
  totalItems: number
  totalPrice: number
  subtotal: number
  tax: number
  shipping: number
  discount: number
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'quantity'> & { quantity?: number } }
  | { type: 'REMOVE_ITEM'; payload: { id: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'OPEN_CART' }
  | { type: 'CLOSE_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] }
  | { type: 'UPDATE_SHIPPING'; payload: { shipping: number } }
  | { type: 'APPLY_DISCOUNT'; payload: { discount: number } }

const TAX_RATE = 0.08 // 8% tax
const FREE_SHIPPING_THRESHOLD = 50

function calculateTotals(items: CartItem[], shipping: number = 0, discount: number = 0) {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const tax = subtotal * TAX_RATE
  const totalPrice = subtotal + tax + shipping - discount

  return {
    totalItems,
    subtotal,
    tax,
    totalPrice: Math.max(0, totalPrice),
    shipping,
    discount
  }
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItemIndex = state.items.findIndex(item => item.id === action.payload.id)
      let newItems: CartItem[]

      if (existingItemIndex >= 0) {
        // Update existing item quantity
        const existingItem = state.items[existingItemIndex]
        const newQuantity = Math.min(
          existingItem.quantity + (action.payload.quantity || 1),
          existingItem.maxQuantity
        )
        
        if (newQuantity === existingItem.quantity) {
          // Already at max quantity
          toast.error(`Maximum quantity (${existingItem.maxQuantity}) reached for ${existingItem.name}`)
          return state
        }

        newItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: newQuantity }
            : item
        )
      } else {
        // Add new item
        const quantity = Math.min(action.payload.quantity || 1, action.payload.maxQuantity)
        newItems = [
          ...state.items,
          {
            ...action.payload,
            quantity
          } as CartItem
        ]
      }

      const totals = calculateTotals(newItems, state.shipping, state.discount)
      
      return {
        ...state,
        items: newItems,
        ...totals
      }
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.id !== action.payload.id)
      const totals = calculateTotals(newItems, state.shipping, state.discount)
      
      return {
        ...state,
        items: newItems,
        ...totals
      }
    }

    case 'UPDATE_QUANTITY': {
      const { id, quantity } = action.payload
      
      if (quantity <= 0) {
        return cartReducer(state, { type: 'REMOVE_ITEM', payload: { id } })
      }

      const newItems = state.items.map(item =>
        item.id === id
          ? { ...item, quantity: Math.min(quantity, item.maxQuantity) }
          : item
      )

      const totals = calculateTotals(newItems, state.shipping, state.discount)
      
      return {
        ...state,
        items: newItems,
        ...totals
      }
    }

    case 'CLEAR_CART': {
      return {
        ...state,
        items: [],
        totalItems: 0,
        totalPrice: 0,
        subtotal: 0,
        tax: 0,
        discount: 0
      }
    }

    case 'TOGGLE_CART':
      return { ...state, isOpen: !state.isOpen }

    case 'OPEN_CART':
      return { ...state, isOpen: true }

    case 'CLOSE_CART':
      return { ...state, isOpen: false }

    case 'LOAD_CART': {
      const totals = calculateTotals(action.payload, state.shipping, state.discount)
      return {
        ...state,
        items: action.payload,
        ...totals
      }
    }

    case 'UPDATE_SHIPPING': {
      const totals = calculateTotals(state.items, action.payload.shipping, state.discount)
      return {
        ...state,
        ...totals
      }
    }

    case 'APPLY_DISCOUNT': {
      const totals = calculateTotals(state.items, state.shipping, action.payload.discount)
      return {
        ...state,
        ...totals
      }
    }

    default:
      return state
  }
}

const initialState: CartState = {
  items: [],
  isOpen: false,
  totalItems: 0,
  totalPrice: 0,
  subtotal: 0,
  tax: 0,
  shipping: 0,
  discount: 0
}

interface CartContextType {
  state: CartState
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
  getItemCount: (productId: string) => number
  isInCart: (productId: string) => boolean
  getTotalItemsCount: () => number
  getCartValue: () => number
  getFreeShippingProgress: () => { current: number; target: number; remaining: number; qualified: boolean }
  updateShipping: (amount: number) => void
  applyDiscount: (amount: number) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const STORAGE_KEY = 'findora_cart'

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  // Load cart from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedCart = localStorage.getItem(STORAGE_KEY)
        if (savedCart) {
          const items: CartItem[] = JSON.parse(savedCart)
          dispatch({ type: 'LOAD_CART', payload: items })
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && state.items.length >= 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items))
      } catch (error) {
        console.error('Error saving cart to localStorage:', error)
      }
    }
  }, [state.items])

  // Update shipping based on cart value
  useEffect(() => {
    const shouldHaveFreeShipping = state.subtotal >= FREE_SHIPPING_THRESHOLD
    const currentShipping = state.shipping
    
    if (shouldHaveFreeShipping && currentShipping > 0) {
      dispatch({ type: 'UPDATE_SHIPPING', payload: { shipping: 0 } })
    } else if (!shouldHaveFreeShipping && currentShipping === 0 && state.items.length > 0) {
      dispatch({ type: 'UPDATE_SHIPPING', payload: { shipping: 9.99 } })
    }
  }, [state.subtotal, state.items.length])

  const addItem = (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    dispatch({ type: 'ADD_ITEM', payload: item })
    
    const quantity = item.quantity || 1
    toast.success(`${quantity > 1 ? `${quantity} × ` : ''}${item.name} added to cart`, {
      action: {
        label: 'View Cart',
        onClick: () => dispatch({ type: 'OPEN_CART' })
      }
    })
  }

  const removeItem = (id: string) => {
    const item = state.items.find(item => item.id === id)
    dispatch({ type: 'REMOVE_ITEM', payload: { id } })
    
    if (item) {
      toast.success(`${item.name} removed from cart`)
    }
  }

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } })
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
    toast.success('Cart cleared')
  }

  const toggleCart = () => dispatch({ type: 'TOGGLE_CART' })
  const openCart = () => dispatch({ type: 'OPEN_CART' })
  const closeCart = () => dispatch({ type: 'CLOSE_CART' })

  const getItemCount = (productId: string): number => {
    return state.items
      .filter(item => item.productId === productId)
      .reduce((sum, item) => sum + item.quantity, 0)
  }

  const isInCart = (productId: string): boolean => {
    return state.items.some(item => item.productId === productId)
  }

  const getTotalItemsCount = (): number => state.totalItems

  const getCartValue = (): number => state.totalPrice

  const getFreeShippingProgress = () => {
    const current = state.subtotal
    const target = FREE_SHIPPING_THRESHOLD
    const remaining = Math.max(0, target - current)
    const qualified = current >= target

    return { current, target, remaining, qualified }
  }

  const updateShipping = (amount: number) => {
    dispatch({ type: 'UPDATE_SHIPPING', payload: { shipping: amount } })
  }

  const applyDiscount = (amount: number) => {
    dispatch({ type: 'APPLY_DISCOUNT', payload: { discount: amount } })
  }

  return (
    <CartContext.Provider
      value={{
        state,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        toggleCart,
        openCart,
        closeCart,
        getItemCount,
        isInCart,
        getTotalItemsCount,
        getCartValue,
        getFreeShippingProgress,
        updateShipping,
        applyDiscount
      }}
    >
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

export function useCartItem(productId: string) {
  const { state, getItemCount, isInCart } = useCart()
  
  return {
    quantity: getItemCount(productId),
    isInCart: isInCart(productId),
    item: state.items.find(item => item.productId === productId)
  }
}