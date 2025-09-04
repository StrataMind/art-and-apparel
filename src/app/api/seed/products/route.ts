import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST() {
  try {
    // First check if we have categories
    const categories = await db.category.findMany({ take: 5 })
    if (categories.length === 0) {
      return NextResponse.json({
        error: 'No categories found. Please seed categories first.',
        action: 'visit /api/seed/categories first'
      }, { status: 400 })
    }

    // Check if products already exist
    const existingCount = await db.product.count()
    if (existingCount > 0) {
      return NextResponse.json({
        message: `Products already exist (${existingCount} found)`,
        action: 'skipped'
      })
    }

    // Get the CEO user (you) to create products as
    const ceoUser = await db.user.findFirst({
      where: { isSuperuser: true, superuserLevel: 'CEO' },
      include: { sellerProfile: true }
    })

    if (!ceoUser || !ceoUser.sellerProfile) {
      return NextResponse.json({
        error: 'CEO user or seller profile not found',
        action: 'CEO must have a seller profile to create products'
      }, { status: 400 })
    }

    const sampleProducts = [
      {
        name: 'Premium Cotton T-Shirt',
        description: 'High-quality 100% organic cotton t-shirt with comfortable fit. Perfect for casual wear and everyday comfort. Available in multiple colors.',
        price: 29.99,
        compareAtPrice: 39.99,
        inventory: 100,
        categoryId: categories[0].id, // Clothing category
        featured: true,
        isOfficial: true,
        priority: 'HIGH',
        status: 'ACTIVE',
        images: [
          'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
          'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500'
        ]
      },
      {
        name: 'Wireless Bluetooth Headphones',
        description: 'Premium noise-cancelling wireless headphones with 30-hour battery life. Crystal clear audio quality for music and calls.',
        price: 79.99,
        compareAtPrice: 99.99,
        inventory: 50,
        categoryId: categories[1]?.id || categories[0].id,
        featured: true,
        isOfficial: true,
        priority: 'HIGH',
        status: 'ACTIVE',
        images: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
          'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500'
        ]
      },
      {
        name: 'Modern Ceramic Coffee Mug',
        description: 'Beautifully crafted ceramic mug perfect for your morning coffee or evening tea. Dishwasher and microwave safe.',
        price: 15.99,
        inventory: 200,
        categoryId: categories[2]?.id || categories[0].id,
        featured: false,
        isOfficial: true,
        priority: 'NORMAL',
        status: 'ACTIVE',
        images: [
          'https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?w=500'
        ]
      },
      {
        name: 'JavaScript Programming Guide',
        description: 'Comprehensive guide to modern JavaScript programming. Perfect for beginners and intermediate developers.',
        price: 24.99,
        inventory: 75,
        categoryId: categories[3]?.id || categories[0].id,
        featured: false,
        isOfficial: true,
        priority: 'NORMAL',
        status: 'ACTIVE',
        images: [
          'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500'
        ]
      },
      {
        name: 'Yoga Exercise Mat',
        description: 'Non-slip exercise mat perfect for yoga, pilates, and home workouts. Eco-friendly and durable material.',
        price: 34.99,
        inventory: 80,
        categoryId: categories[4]?.id || categories[0].id,
        featured: false,
        isOfficial: true,
        priority: 'NORMAL',
        status: 'ACTIVE',
        images: [
          'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500'
        ]
      }
    ]

    // Create products with images
    const createdProducts = []
    for (const productData of sampleProducts) {
      const { images, ...productFields } = productData
      
      const product = await db.product.create({
        data: {
          ...productFields,
          slug: productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now(),
          metaTitle: productData.name,
          metaDescription: productData.description.substring(0, 160),
          sellerId: ceoUser.sellerProfile.id,
          sellerUserId: ceoUser.id,
          publishedAt: new Date(),
          images: {
            create: images.map((url, index) => ({
              url,
              position: index,
              altText: `${productData.name} - Image ${index + 1}`
            }))
          }
        },
        include: {
          images: true,
          category: true
        }
      })
      
      createdProducts.push(product)
    }

    return NextResponse.json({
      message: `Created ${createdProducts.length} sample products`,
      action: 'created',
      products: createdProducts.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        category: p.category?.name,
        images: p.images.length
      }))
    })

  } catch (error) {
    console.error('Error seeding products:', error)
    return NextResponse.json({
      error: 'Failed to seed products',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  return POST() // Allow GET for easy browser testing
}