import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createSuperuserProduct, getSuperuserPermissions } from '@/lib/superuser'
import { superuserProductSchema } from '@/lib/validations/superuser'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get fresh user data to verify superuser status
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        isSuperuser: true,
        superuserLevel: true,
        canCreateProducts: true,
        canModerateContent: true,
        canViewAnalytics: true,
        canManageUsers: true,
        canFeatureProducts: true
      }
    })

    if (!user || !user.isSuperuser) {
      return NextResponse.json(
        { error: 'Superuser access required' },
        { status: 403 }
      )
    }

    const permissions = getSuperuserPermissions(user as any)
    
    if (!permissions.canCreateProducts) {
      return NextResponse.json(
        { error: 'Product creation permission required' },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await req.json()
    const validatedData = superuserProductSchema.parse(body)

    // Create the product with superuser privileges
    const product = await createSuperuserProduct(user.id, validatedData)

    return NextResponse.json({
      success: true,
      product: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        status: product.status,
        featured: product.featured,
        isOfficial: product.isOfficial,
        priority: product.priority
      }
    })

  } catch (error) {
    console.error('Error creating superuser product:', error)
    
    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json(
        { error: 'Invalid product data', details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get fresh user data to verify superuser status
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        isSuperuser: true,
        canViewAnalytics: true
      }
    })

    if (!user || !user.isSuperuser) {
      return NextResponse.json(
        { error: 'Superuser access required' },
        { status: 403 }
      )
    }

    // Get all products created by this superuser
    const products = await prisma.product.findMany({
      where: { sellerUserId: user.id },
      include: {
        images: true,
        category: true,
        seller: {
          select: {
            businessName: true,
            isOfficial: true
          }
        },
        _count: {
          select: {
            reviews: true,
            orderItems: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Get summary stats
    const stats = {
      total: products.length,
      published: products.filter(p => p.status === 'ACTIVE').length,
      featured: products.filter(p => p.featured).length,
      official: products.filter(p => p.isOfficial).length
    }

    return NextResponse.json({
      success: true,
      products,
      stats
    })

  } catch (error) {
    console.error('Error fetching superuser products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}