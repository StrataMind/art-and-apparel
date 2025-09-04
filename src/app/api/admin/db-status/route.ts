import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get counts from all main tables
    const [
      userCount,
      categoryCount,
      sellerProfileCount, 
      productCount,
      orderCount,
      cartCount
    ] = await Promise.all([
      db.user.count().catch(() => 'ERROR'),
      db.category.count().catch(() => 'ERROR'),
      db.sellerProfile.count().catch(() => 'ERROR'),
      db.product.count().catch(() => 'ERROR'),
      db.order.count().catch(() => 'ERROR'),
      db.cart.count().catch(() => 'ERROR')
    ])

    // Try to get a sample product to test the full query
    const sampleProduct = await db.product.findFirst({
      include: {
        images: {
          orderBy: { position: 'asc' },
          take: 1
        },
        seller: {
          select: {
            businessName: true,
            averageRating: true
          }
        },
        category: {
          select: {
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
      }
    }).catch(error => {
      console.error('Sample product query error:', error)
      return null
    })

    // Check current user data
    const currentUser = await db.user.findUnique({
      where: { email: session.user.email },
      include: {
        sellerProfile: {
          select: {
            id: true,
            businessName: true,
            verificationStatus: true
          }
        }
      }
    }).catch(() => null)

    return NextResponse.json({
      database: {
        connected: true,
        tables: {
          users: userCount,
          categories: categoryCount,
          sellerProfiles: sellerProfileCount,
          products: productCount,
          orders: orderCount,
          carts: cartCount
        }
      },
      sampleData: {
        hasProducts: productCount > 0,
        sampleProduct: sampleProduct ? {
          id: sampleProduct.id,
          name: sampleProduct.name,
          hasImages: sampleProduct.images.length > 0,
          hasSeller: !!sampleProduct.seller,
          hasCategory: !!sampleProduct.category
        } : null
      },
      currentUser: currentUser ? {
        id: currentUser.id,
        role: currentUser.role,
        isSuperuser: currentUser.isSuperuser,
        hasSellerProfile: !!currentUser.sellerProfile
      } : null,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Database status error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to check database status',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}