import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const updateCartItemSchema = z.object({
  quantity: z.number().min(1),
})

// Update cart item quantity
export async function PATCH(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = updateCartItemSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { quantity } = validation.data

    // Find user by email
    const user = await db.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Find cart item and verify ownership
    const cartItem = await db.cartItem.findFirst({
      where: {
        id: params.itemId,
        cart: {
          userId: user.id
        }
      },
      include: {
        product: true
      }
    })

    if (!cartItem) {
      return NextResponse.json({ error: 'Cart item not found' }, { status: 404 })
    }

    // Check stock availability
    if (quantity > cartItem.product.inventory) {
      return NextResponse.json({ 
        error: 'Insufficient stock',
        available: cartItem.product.inventory 
      }, { status: 400 })
    }

    // Update quantity
    await db.cartItem.update({
      where: { id: params.itemId },
      data: { quantity }
    })

    return NextResponse.json({ 
      message: 'Cart item updated successfully',
      quantity
    })

  } catch (error) {
    console.error('Error updating cart item:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Remove item from cart
export async function DELETE(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find user by email
    const user = await db.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Find cart item and verify ownership
    const cartItem = await db.cartItem.findFirst({
      where: {
        id: params.itemId,
        cart: {
          userId: user.id
        }
      },
      include: {
        product: {
          select: {
            name: true
          }
        }
      }
    })

    if (!cartItem) {
      return NextResponse.json({ error: 'Cart item not found' }, { status: 404 })
    }

    // Delete cart item
    await db.cartItem.delete({
      where: { id: params.itemId }
    })

    return NextResponse.json({ 
      message: 'Item removed from cart',
      productName: cartItem.product.name
    })

  } catch (error) {
    console.error('Error removing cart item:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}