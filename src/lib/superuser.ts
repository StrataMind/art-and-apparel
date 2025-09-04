import { User, SuperuserLevel, Priority } from '@prisma/client'
import { db as prisma } from '@/lib/db'

export interface SuperuserPermissions {
  canCreateProducts: boolean
  canModerateContent: boolean
  canViewAnalytics: boolean
  canManageUsers: boolean
  canFeatureProducts: boolean
}

export interface CreateSuperuserProductData {
  title: string
  description: string
  price: number
  inventory: number
  categoryId: string
  images: string[]
  // Superuser-specific fields
  isOfficial?: boolean
  isFeatured?: boolean
  isPromoted?: boolean
  priority?: Priority
  autoPublish?: boolean
  seoTitle?: string
  seoDescription?: string
  tags?: string[]
}

/**
 * Get superuser permissions based on user level
 */
export function getSuperuserPermissions(user: User): SuperuserPermissions {
  if (!user.isSuperuser) {
    return {
      canCreateProducts: false,
      canModerateContent: false,
      canViewAnalytics: false,
      canManageUsers: false,
      canFeatureProducts: false
    }
  }

  // Define permissions based on superuser level
  switch (user.superuserLevel) {
    case 'CEO':
      return {
        canCreateProducts: true,
        canModerateContent: true,
        canViewAnalytics: true,
        canManageUsers: true,
        canFeatureProducts: true
      }
    
    case 'CO_FOUNDER':
      return {
        canCreateProducts: true,
        canModerateContent: true,
        canViewAnalytics: true,
        canManageUsers: true,
        canFeatureProducts: true
      }
    
    case 'MANAGER':
      return {
        canCreateProducts: true,
        canModerateContent: true,
        canViewAnalytics: true,
        canManageUsers: false,
        canFeatureProducts: true
      }
    
    case 'TEAM_MEMBER':
      return {
        canCreateProducts: true,
        canModerateContent: false,
        canViewAnalytics: false,
        canManageUsers: false,
        canFeatureProducts: false
      }
    
    default:
      // Use individual permissions for custom setups
      return {
        canCreateProducts: user.canCreateProducts,
        canModerateContent: user.canModerateContent,
        canViewAnalytics: user.canViewAnalytics,
        canManageUsers: user.canManageUsers,
        canFeatureProducts: user.canFeatureProducts
      }
  }
}

/**
 * Make a user a superuser with specified level
 */
export async function makeSuperuser(
  targetUserId: string, 
  level: SuperuserLevel, 
  grantedByUserId: string
) {
  const permissions = getSuperuserPermissions({ 
    isSuperuser: true, 
    superuserLevel: level 
  } as User)

  // Update the user to superuser
  const updatedUser = await prisma.user.update({
    where: { id: targetUserId },
    data: {
      isSuperuser: true,
      superuserLevel: level,
      superuserSince: new Date(),
      grantedBy: grantedByUserId,
      role: level === 'CEO' ? 'CEO' : 'SUPERUSER',
      ...permissions
    }
  })

  // Create or update their seller profile automatically
  await createOfficialSellerProfile(targetUserId)
  
  // Log the action
  await logSuperuserActivity(grantedByUserId, 'GRANT_SUPERUSER', targetUserId, {
    level,
    permissions
  })

  return updatedUser
}

/**
 * Create or update seller profile to official status
 */
export async function createOfficialSellerProfile(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  
  if (!user) {
    throw new Error('User not found')
  }

  const existingProfile = await prisma.sellerProfile.findUnique({
    where: { userId }
  })

  if (existingProfile) {
    // Update existing profile to official
    return await prisma.sellerProfile.update({
      where: { userId },
      data: {
        verificationStatus: 'VERIFIED',
        isOfficial: true,
        accountType: 'OFFICIAL',
        autoVerified: true,
        verifiedAt: new Date()
      }
    })
  } else {
    // Create new official profile
    return await prisma.sellerProfile.create({
      data: {
        userId,
        businessName: `${user.name || 'Team'} - Findora Official`,
        businessType: 'CORPORATION',
        verificationStatus: 'VERIFIED',
        isOfficial: true,
        accountType: 'OFFICIAL',
        autoVerified: true,
        description: 'Official Findora team member store',
        businessEmail: user.email || '',
        phone: '+91-9999999999',
        addressLine1: 'Findora HQ',
        city: 'Mangalore',
        state: 'Karnataka',
        country: 'India',
        postalCode: '575001',
        taxId: 'AUTO_GENERATED',
        businessLicense: 'OFFICIAL_TEAM',
        contactPersonName: user.name || 'Team Member',
        termsAccepted: true,
        termsAcceptedAt: new Date(),
        verifiedAt: new Date()
      }
    })
  }
}

/**
 * Log superuser activity for audit trail
 */
export async function logSuperuserActivity(
  userId: string,
  action: string,
  target?: string,
  details?: any
) {
  return await prisma.superuserActivity.create({
    data: {
      userId,
      action,
      target,
      details
    }
  })
}

/**
 * Create product with superuser privileges
 */
export async function createSuperuserProduct(
  userId: string,
  data: CreateSuperuserProductData
) {
  // Get user's seller profile
  const sellerProfile = await prisma.sellerProfile.findUnique({
    where: { userId }
  })

  if (!sellerProfile) {
    throw new Error('Seller profile not found')
  }

  // Generate slug from title
  const slug = data.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

  // Create the product
  const product = await prisma.product.create({
    data: {
      name: data.title,
      description: data.description,
      price: data.price,
      inventory: data.inventory,
      slug: `${slug}-${Date.now()}`, // Ensure uniqueness
      metaTitle: data.seoTitle || data.title,
      metaDescription: data.seoDescription || data.description.substring(0, 160),
      status: data.autoPublish ? 'ACTIVE' : 'DRAFT',
      featured: data.isFeatured || false,
      isOfficial: data.isOfficial !== false, // Default to true for superusers
      isPromoted: data.isPromoted || false,
      priority: data.priority || 'NORMAL',
      sellerId: sellerProfile.id,
      sellerUserId: userId,
      categoryId: data.categoryId,
      tags: data.tags || [],
      publishedAt: data.autoPublish ? new Date() : null,
      // Create images
      images: {
        create: data.images.map((url, index) => ({
          url,
          position: index,
          altText: `${data.title} - Image ${index + 1}`
        }))
      }
    },
    include: {
      images: true,
      seller: true,
      category: true
    }
  })

  // Log the activity
  await logSuperuserActivity(userId, 'CREATE_SUPERUSER_PRODUCT', product.id, {
    productName: data.title,
    isOfficial: data.isOfficial,
    isFeatured: data.isFeatured,
    priority: data.priority
  })

  return product
}

/**
 * Feature a product (superuser action)
 */
export async function featureProduct(
  userId: string,
  productId: string,
  featured: boolean = true
) {
  const product = await prisma.product.update({
    where: { id: productId },
    data: { featured }
  })

  await logSuperuserActivity(userId, featured ? 'FEATURE_PRODUCT' : 'UNFEATURE_PRODUCT', productId, {
    productName: product.name
  })

  return product
}

/**
 * Get superuser dashboard stats
 */
export async function getSuperuserStats(userId: string) {
  const [
    totalProducts,
    totalUsers,
    totalOrders,
    recentActivity
  ] = await Promise.all([
    prisma.product.count({
      where: { sellerUserId: userId }
    }),
    prisma.user.count(),
    prisma.order.count(),
    prisma.superuserActivity.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    })
  ])

  return {
    totalProducts,
    totalUsers,
    totalOrders,
    recentActivity
  }
}

/**
 * Check if user has specific permission
 */
export function hasPermission(user: User, permission: keyof SuperuserPermissions): boolean {
  if (!user.isSuperuser) return false
  
  const permissions = getSuperuserPermissions(user)
  return permissions[permission]
}

/**
 * Get all superusers for management
 */
export async function getAllSuperusers() {
  return await prisma.user.findMany({
    where: { isSuperuser: true },
    select: {
      id: true,
      name: true,
      email: true,
      superuserLevel: true,
      superuserSince: true,
      canCreateProducts: true,
      canModerateContent: true,
      canViewAnalytics: true,
      canManageUsers: true,
      canFeatureProducts: true
    },
    orderBy: { superuserSince: 'desc' }
  })
}

/**
 * Remove superuser status
 */
export async function removeSuperuser(
  targetUserId: string,
  removedByUserId: string
) {
  const updatedUser = await prisma.user.update({
    where: { id: targetUserId },
    data: {
      isSuperuser: false,
      superuserLevel: null,
      role: 'SELLER', // Demote to seller
      canCreateProducts: false,
      canModerateContent: false,
      canViewAnalytics: false,
      canManageUsers: false,
      canFeatureProducts: false
    }
  })

  // Update seller profile to remove official status
  await prisma.sellerProfile.updateMany({
    where: { userId: targetUserId },
    data: {
      isOfficial: false,
      accountType: 'STANDARD',
      autoVerified: false
    }
  })

  // Log the action
  await logSuperuserActivity(removedByUserId, 'REMOVE_SUPERUSER', targetUserId, {
    previousLevel: updatedUser.superuserLevel
  })

  return updatedUser
}