import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const addToCartSchema = z.object({
  productId: z.string(),
  quantity: z.number().min(1).default(1),
})

// Get user's cart
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find user by email (since we might not have userId in session)
    const user = await db.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get or create cart
    let cart = await db.cart.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
                seller: {
                  select: {
                    businessName: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!cart) {
      cart = await db.cart.create({
        data: { userId: user.id },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: true,
                  seller: {
                    select: {
                      businessName: true
                    }
                  }
                }
              }
            }
          }
        }
      })
    }

    // Calculate totals
    const subtotal = cart.items.reduce((total, item) => {
      return total + (item.product.price * item.quantity)
    }, 0)

    const itemCount = cart.items.reduce((total, item) => total + item.quantity, 0)

    return NextResponse.json({
      cart: {
        ...cart,
        subtotal,
        itemCount
      }
    })

  } catch (error) {
    console.error('Error fetching cart:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Add item to cart
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = addToCartSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { productId, quantity } = validation.data

    // Find user by email
    const user = await db.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if product exists and is available
    const product = await db.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    if (product.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Product is not available' }, { status: 400 })
    }

    if (product.inventory < quantity) {
      return NextResponse.json({ 
        error: 'Insufficient stock',
        available: product.inventory 
      }, { status: 400 })
    }

    // Get or create cart
    let cart = await db.cart.upsert({
      where: { userId: user.id },
      create: { userId: user.id },
      update: {}
    })

    // Check if item already exists in cart
    const existingItem = await db.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: productId
        }
      }
    })

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity
      
      if (newQuantity > product.inventory) {
        return NextResponse.json({ 
          error: 'Insufficient stock',
          available: product.inventory,
          current: existingItem.quantity
        }, { status: 400 })
      }

      await db.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity }
      })
    } else {
      // Create new cart item
      await db.cartItem.create({
        data: {
          cartId: cart.id,
          productId: productId,
          quantity: quantity
        }
      })
    }

    return NextResponse.json({ 
      message: 'Item added to cart successfully',
      productName: product.name,
      quantity
    })

  } catch (error) {
    console.error('Error adding to cart:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}