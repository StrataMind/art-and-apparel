import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is superuser/CEO
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, isSuperuser: true, role: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (!user.isSuperuser && user.role !== 'CEO') {
      return NextResponse.json({ error: 'Access denied. CEO privileges required.' }, { status: 403 })
    }

    // Check if we already have categories
    const categoryCount = await db.category.count()
    if (categoryCount === 0) {
      // Create sample categories
      await db.category.createMany({
        data: [
          {
            name: 'Electronics',
            slug: 'electronics',
            description: 'Electronic devices and accessories'
          },
          {
            name: 'Clothing',
            slug: 'clothing', 
            description: 'Fashion and apparel'
          },
          {
            name: 'Home & Garden',
            slug: 'home-garden',
            description: 'Home improvement and gardening supplies'
          }
        ]
      })
    }

    // Check if we already have a seller profile for the CEO
    const existingProfile = await db.sellerProfile.findUnique({
      where: { userId: user.id }
    })

    let sellerId = existingProfile?.id
    
    if (!existingProfile) {
      // Create a seller profile for the CEO user
      const newProfile = await db.sellerProfile.create({
        data: {
          userId: user.id,
          businessName: 'Findora Official Store',
          businessType: 'CORPORATION',
          description: 'Official Findora marketplace products',
          phone: '+1-555-0123',
          businessEmail: session.user.email,
          addressLine1: '123 Business Ave',
          city: 'Business City',
          state: 'CA',
          country: 'USA',
          postalCode: '90210',
          taxId: 'TAX123456',
          businessLicense: 'BL123456',
          contactPersonName: session.user.name || 'CEO',
          verificationStatus: 'VERIFIED', // Auto-verify CEO
          isOfficial: true,
          autoVerified: true,
          termsAccepted: true,
          termsAcceptedAt: new Date()
        }
      })
      sellerId = newProfile.id
    }

    // Check if we have products
    const productCount = await db.product.count()
    
    if (productCount === 0) {
      // Get categories for products
      const categories = await db.category.findMany()
      const electronicsCategory = categories.find(c => c.slug === 'electronics')
      const clothingCategory = categories.find(c => c.slug === 'clothing')

      // Create sample products
      const products = await db.product.createMany({
        data: [
          {
            name: 'Wireless Bluetooth Headphones',
            slug: 'wireless-bluetooth-headphones',
            description: 'High-quality wireless headphones with noise cancellation and premium sound quality. Perfect for music, calls, and gaming.',
            price: 79.99,
            compareAtPrice: 99.99,
            sku: 'WBH-001',
            inventory: 50,
            status: 'ACTIVE',
            featured: true,
            sellerId: sellerId!,
            sellerUserId: user.id,
            categoryId: electronicsCategory?.id,
            tags: ['electronics', 'audio', 'wireless', 'bluetooth'],
            isOfficial: true,
            priority: 'HIGH'
          },
          {
            name: 'Cotton Blend T-Shirt',
            slug: 'cotton-blend-t-shirt',
            description: 'Comfortable and stylish cotton blend t-shirt available in multiple colors. Perfect for casual wear.',
            price: 24.99,
            compareAtPrice: 34.99,
            sku: 'CBT-001',
            inventory: 100,
            status: 'ACTIVE',
            featured: true,
            sellerId: sellerId!,
            sellerUserId: user.id,
            categoryId: clothingCategory?.id,
            tags: ['clothing', 'casual', 'cotton', 't-shirt'],
            isOfficial: true,
            priority: 'NORMAL'
          },
          {
            name: 'Smartphone Case',
            slug: 'smartphone-case',
            description: 'Durable protective case for smartphones with military-grade drop protection.',
            price: 19.99,
            compareAtPrice: 29.99,
            sku: 'SPC-001',
            inventory: 75,
            status: 'ACTIVE',
            featured: false,
            sellerId: sellerId!,
            sellerUserId: user.id,
            categoryId: electronicsCategory?.id,
            tags: ['electronics', 'phone', 'protection', 'case'],
            isOfficial: true,
            priority: 'NORMAL'
          }
        ]
      })

      return NextResponse.json({
        success: true,
        message: 'Sample data created successfully',
        created: {
          categories: categoryCount === 0 ? 3 : 0,
          sellerProfile: existingProfile ? 0 : 1,
          products: 3
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Sample data already exists',
      counts: {
        categories: categoryCount,
        products: productCount,
        hasSellerProfile: !!existingProfile
      }
    })

  } catch (error) {
    console.error('Error creating sample data:', error)
    return NextResponse.json(
      { error: 'Failed to create sample data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}