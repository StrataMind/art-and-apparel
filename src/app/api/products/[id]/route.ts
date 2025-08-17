import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const updateProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200, 'Product name too long').optional(),
  description: z.string().min(10, 'Description must be at least 10 characters').optional(),
  price: z.number().min(0.01, 'Price must be greater than 0').optional(),
  compareAtPrice: z.number().min(0).optional(),
  sku: z.string().optional(),
  inventory: z.number().int().min(0, 'Inventory cannot be negative').optional(),
  weight: z.number().min(0).optional(),
  dimensions: z.string().optional(),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'INACTIVE', 'OUT_OF_STOCK']).optional(),
  featured: z.boolean().optional(),
  images: z.array(z.object({
    url: z.string(),
    altText: z.string().optional(),
    position: z.number().default(0)
  })).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
})

// Get Single Product
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const product = await db.product.findFirst({
      where: {
        id: params.id,
        sellerUserId: session.user.id
      },
      include: {
        images: {
          orderBy: { position: 'asc' }
        },
        category: true,
        seller: {
          select: {
            businessName: true,
            verificationStatus: true
          }
        },
        reviews: {
          include: {
            user: {
              select: {
                name: true,
                image: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        _count: {
          select: {
            reviews: true,
            orderItems: true
          }
        }
      }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      product
    })

  } catch (error) {
    console.error('Get product error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Update Product
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateProductSchema.parse(body)

    // Check if product exists and belongs to user
    const existingProduct = await db.product.findFirst({
      where: {
        id: params.id,
        sellerUserId: session.user.id
      },
      include: { images: true }
    })

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // If updating images, delete old ones and create new ones
    const updateData: any = { ...validatedData }
    
    if (validatedData.images) {
      updateData.images = {
        deleteMany: {},
        create: validatedData.images.map((img, index) => ({
          url: img.url,
          altText: img.altText || `${validatedData.name || existingProduct.name} - Image ${index + 1}`,
          position: index
        }))
      }
    }

    // If status is changing to ACTIVE, set publishedAt
    if (validatedData.status === 'ACTIVE' && existingProduct.status !== 'ACTIVE') {
      updateData.publishedAt = new Date()
    }

    // Update product
    const product = await db.product.update({
      where: { id: params.id },
      data: updateData,
      include: {
        images: {
          orderBy: { position: 'asc' }
        },
        category: true,
        seller: {
          select: {
            businessName: true,
            verificationStatus: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      product
    })

  } catch (error) {
    console.error('Product update error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Delete Product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if product exists and belongs to user
    const existingProduct = await db.product.findFirst({
      where: {
        id: params.id,
        sellerUserId: session.user.id
      }
    })

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Check if product has orders
    const orderCount = await db.orderItem.count({
      where: { productId: params.id }
    })

    if (orderCount > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete product with existing orders. Set status to inactive instead.' 
      }, { status: 400 })
    }

    // Delete product (this will cascade delete images and reviews)
    await db.product.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    })

  } catch (error) {
    console.error('Product deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}