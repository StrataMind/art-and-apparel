import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200, 'Product name too long'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  compareAtPrice: z.number().min(0).optional(),
  sku: z.string().optional(),
  inventory: z.number().int().min(0, 'Inventory cannot be negative'),
  weight: z.number().min(0).optional(),
  dimensions: z.string().optional(),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).default([]),
  status: z.enum(['DRAFT', 'ACTIVE', 'INACTIVE', 'OUT_OF_STOCK']).default('DRAFT'),
  featured: z.boolean().default(false),
  images: z.array(z.object({
    url: z.string(),
    altText: z.string().optional(),
    position: z.number().default(0)
  })).default([]),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
})

// Create Product
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is a seller
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: { sellerProfile: true }
    })

    if (!user?.sellerProfile) {
      return NextResponse.json({ 
        error: 'You must be a verified seller to create products' 
      }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = productSchema.parse(body)

    // Generate slug from name
    const baseSlug = validatedData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Ensure unique slug
    let slug = baseSlug
    let counter = 1
    while (await db.product.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    // Create product
    const product = await db.product.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        price: validatedData.price,
        compareAtPrice: validatedData.compareAtPrice,
        sku: validatedData.sku,
        inventory: validatedData.inventory,
        weight: validatedData.weight,
        dimensions: validatedData.dimensions,
        slug,
        metaTitle: validatedData.metaTitle,
        metaDescription: validatedData.metaDescription,
        status: validatedData.status,
        featured: validatedData.featured,
        categoryId: validatedData.categoryId,
        tags: validatedData.tags,
        sellerId: user.sellerProfile.id,
        sellerUserId: session.user.id,
        publishedAt: validatedData.status === 'ACTIVE' ? new Date() : null,
        images: {
          create: validatedData.images.map((img, index) => ({
            url: img.url,
            altText: img.altText || `${validatedData.name} - Image ${index + 1}`,
            position: index
          }))
        }
      },
      include: {
        images: true,
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
    console.error('Product creation error:', error)
    
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

// Get Products (for seller)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      sellerUserId: session.user.id
    }

    if (status && status !== 'ALL') {
      where.status = status
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get products with pagination
    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: {
          images: {
            orderBy: { position: 'asc' },
            take: 1 // Just the first image for listing
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          },
          _count: {
            select: {
              reviews: true,
              orderItems: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      db.product.count({ where })
    ])

    return NextResponse.json({
      success: true,
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Get products error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}