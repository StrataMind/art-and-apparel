/**
 * Enhanced User Profiles System
 * 
 * This module provides comprehensive user profile functionality with
 * privacy controls, purchase history, review history, and social features.
 */

export type ProfileVisibility = 'public' | 'friends' | 'private'
export type HistoryPrivacy = 'public' | 'followers' | 'private'
export type ProfileBadge = 'verified_buyer' | 'top_reviewer' | 'community_helper' | 'early_adopter' | 'power_buyer' | 'trusted_member'

export interface UserProfile {
  id: string
  userId: string
  displayName: string
  bio?: string
  location?: string
  website?: string
  avatar?: string
  coverImage?: string
  joinDate: Date
  lastActiveAt: Date
  
  // Privacy Settings
  visibility: ProfileVisibility
  showPurchaseHistory: HistoryPrivacy
  showReviewHistory: HistoryPrivacy
  showWishlist: HistoryPrivacy
  showFollowing: HistoryPrivacy
  showFollowers: HistoryPrivacy
  allowMessages: ProfileVisibility
  
  // Profile Stats
  stats: {
    totalPurchases: number
    totalSpent: number
    reviewsCount: number
    helpfulVotes: number
    following: number
    followers: number
    wishlistItems: number
    averageRating: number // as a reviewer
  }
  
  // Achievements & Badges
  badges: ProfileBadge[]
  achievements: Achievement[]
  
  // Social Features
  interests: string[]
  favoriteCategories: string[]
  topBrands: string[]
  
  // Verification
  isVerified: boolean
  verificationDate?: Date
  
  createdAt: Date
  updatedAt: Date
}

export interface Achievement {
  id: string
  type: 'purchase_milestone' | 'review_milestone' | 'social_milestone' | 'time_milestone' | 'category_expert'
  title: string
  description: string
  icon: string
  earnedAt: Date
  progress?: {
    current: number
    target: number
  }
  metadata?: Record<string, any>
}

export interface PurchaseHistoryItem {
  id: string
  orderId: string
  productId: string
  productName: string
  productImage: string
  sellerId: string
  sellerName: string
  quantity: number
  price: number
  purchaseDate: Date
  status: 'delivered' | 'in_transit' | 'cancelled' | 'returned'
  category: string
  isReviewed: boolean
  rating?: number
}

export interface ReviewHistoryItem {
  id: string
  productId: string
  productName: string
  productImage: string
  sellerId: string
  sellerName: string
  rating: number
  title: string
  content: string
  images?: string[]
  isVerifiedPurchase: boolean
  helpfulVotes: number
  totalVotes: number
  reviewDate: Date
  lastUpdated?: Date
  category: string
}

export interface ProfileStats {
  userId: string
  totalOrders: number
  totalSpent: number
  averageOrderValue: number
  favoriteCategory: string
  
  // Review Stats
  totalReviews: number
  averageRating: number
  helpfulVotes: number
  reviewsThisYear: number
  
  // Social Stats
  profileViews: number
  following: number
  followers: number
  
  // Activity Stats
  joinDate: Date
  daysSinceJoining: number
  lastPurchaseDate?: Date
  mostActiveMonth: string
  
  // Category Breakdown
  categorySpending: Array<{
    category: string
    amount: number
    percentage: number
  }>
  
  // Recent Activity
  recentPurchases: PurchaseHistoryItem[]
  recentReviews: ReviewHistoryItem[]
}

export interface UserBadgeRequirements {
  verified_buyer: { purchasesNeeded: 1 }
  top_reviewer: { reviewsNeeded: 50, averageRatingNeeded: 4.0 }
  community_helper: { helpfulVotesNeeded: 100 }
  early_adopter: { joinDateBefore: Date }
  power_buyer: { totalSpentNeeded: 50000 }
  trusted_member: { accountAgeMonths: 12, reviewsNeeded: 25 }
}

class UserProfilesSystem {
  /**
   * Get user profile by user ID
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    // TODO: Implement database query
    
    // Mock data for demonstration
    const mockProfile: UserProfile = {
      id: `profile_${userId}`,
      userId,
      displayName: 'John Doe',
      bio: 'Tech enthusiast and gadget lover. Always looking for the latest innovations!',
      location: 'Mumbai, India',
      website: 'https://johndoe.com',
      avatar: '/api/placeholder/120/120',
      coverImage: '/api/placeholder/800/200',
      joinDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1 year ago
      lastActiveAt: new Date(),
      
      visibility: 'public',
      showPurchaseHistory: 'followers',
      showReviewHistory: 'public',
      showWishlist: 'private',
      showFollowing: 'public',
      showFollowers: 'public',
      allowMessages: 'public',
      
      stats: {
        totalPurchases: 47,
        totalSpent: 125600,
        reviewsCount: 32,
        helpfulVotes: 156,
        following: 23,
        followers: 89,
        wishlistItems: 15,
        averageRating: 4.3
      },
      
      badges: ['verified_buyer', 'top_reviewer', 'community_helper'],
      achievements: [
        {
          id: 'achievement_1',
          type: 'purchase_milestone',
          title: 'Shopping Spree',
          description: 'Made 50 successful purchases',
          icon: '🛍️',
          earnedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          progress: { current: 47, target: 50 }
        },
        {
          id: 'achievement_2',
          type: 'review_milestone',
          title: 'Review Master',
          description: 'Left 25+ helpful reviews',
          icon: '⭐',
          earnedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
        }
      ],
      
      interests: ['Technology', 'Gaming', 'Photography', 'Travel'],
      favoriteCategories: ['Electronics', 'Books', 'Home & Garden'],
      topBrands: ['Apple', 'Samsung', 'Sony'],
      
      isVerified: true,
      verificationDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
      
      createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      updatedAt: new Date()
    }

    return mockProfile
  }

  /**
   * Update user profile
   */
  async updateUserProfile(
    userId: string,
    updates: Partial<Pick<UserProfile, 'displayName' | 'bio' | 'location' | 'website' | 'avatar' | 'coverImage' | 'interests' | 'visibility' | 'showPurchaseHistory' | 'showReviewHistory' | 'showWishlist' | 'showFollowing' | 'showFollowers' | 'allowMessages'>>
  ): Promise<UserProfile> {
    // TODO: Implement database update
    const existingProfile = await this.getUserProfile(userId)
    if (!existingProfile) {
      throw new Error('Profile not found')
    }

    const updatedProfile: UserProfile = {
      ...existingProfile,
      ...updates,
      updatedAt: new Date()
    }

    console.log('Profile updated:', updatedProfile)
    return updatedProfile
  }

  /**
   * Get purchase history for user
   */
  async getPurchaseHistory(
    userId: string,
    options?: {
      page?: number
      limit?: number
      category?: string
      dateFrom?: Date
      dateTo?: Date
      status?: PurchaseHistoryItem['status']
    }
  ): Promise<{ items: PurchaseHistoryItem[]; total: number }> {
    // TODO: Implement database query
    
    // Mock data
    const mockPurchases: PurchaseHistoryItem[] = [
      {
        id: 'purchase_1',
        orderId: 'order_123',
        productId: 'product_456',
        productName: 'Wireless Headphones Pro',
        productImage: '/api/placeholder/100/100',
        sellerId: 'seller_789',
        sellerName: 'TechGear Store',
        quantity: 1,
        price: 2999,
        purchaseDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        status: 'delivered',
        category: 'Electronics',
        isReviewed: true,
        rating: 5
      },
      {
        id: 'purchase_2',
        orderId: 'order_124',
        productId: 'product_457',
        productName: 'Smart Watch Series 5',
        productImage: '/api/placeholder/100/100',
        sellerId: 'seller_790',
        sellerName: 'Gadget Hub',
        quantity: 1,
        price: 15999,
        purchaseDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        status: 'delivered',
        category: 'Electronics',
        isReviewed: false
      }
    ]

    return { items: mockPurchases, total: mockPurchases.length }
  }

  /**
   * Get review history for user
   */
  async getReviewHistory(
    userId: string,
    options?: {
      page?: number
      limit?: number
      rating?: number
      category?: string
      dateFrom?: Date
      dateTo?: Date
    }
  ): Promise<{ items: ReviewHistoryItem[]; total: number }> {
    // TODO: Implement database query
    
    // Mock data
    const mockReviews: ReviewHistoryItem[] = [
      {
        id: 'review_1',
        productId: 'product_456',
        productName: 'Wireless Headphones Pro',
        productImage: '/api/placeholder/100/100',
        sellerId: 'seller_789',
        sellerName: 'TechGear Store',
        rating: 5,
        title: 'Excellent sound quality!',
        content: 'These headphones exceeded my expectations. The noise cancellation is fantastic and the battery life is impressive.',
        images: ['/api/placeholder/200/150'],
        isVerifiedPurchase: true,
        helpfulVotes: 23,
        totalVotes: 28,
        reviewDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        category: 'Electronics'
      },
      {
        id: 'review_2',
        productId: 'product_458',
        productName: 'Gaming Mouse RGB',
        productImage: '/api/placeholder/100/100',
        sellerId: 'seller_791',
        sellerName: 'Gaming Central',
        rating: 4,
        title: 'Good mouse, great price',
        content: 'Solid gaming mouse with responsive clicks. The RGB lighting is a nice touch. Only complaint is the scroll wheel could be smoother.',
        isVerifiedPurchase: true,
        helpfulVotes: 12,
        totalVotes: 15,
        reviewDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
        category: 'Electronics'
      }
    ]

    return { items: mockReviews, total: mockReviews.length }
  }

  /**
   * Get profile statistics
   */
  async getProfileStats(userId: string): Promise<ProfileStats> {
    // TODO: Implement database aggregation queries
    
    const mockStats: ProfileStats = {
      userId,
      totalOrders: 47,
      totalSpent: 125600,
      averageOrderValue: 2672,
      favoriteCategory: 'Electronics',
      
      totalReviews: 32,
      averageRating: 4.3,
      helpfulVotes: 156,
      reviewsThisYear: 28,
      
      profileViews: 234,
      following: 23,
      followers: 89,
      
      joinDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      daysSinceJoining: 365,
      lastPurchaseDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      mostActiveMonth: 'December',
      
      categorySpending: [
        { category: 'Electronics', amount: 78900, percentage: 62.8 },
        { category: 'Books', amount: 23400, percentage: 18.6 },
        { category: 'Fashion', amount: 15600, percentage: 12.4 },
        { category: 'Home & Garden', amount: 7700, percentage: 6.2 }
      ],
      
      recentPurchases: [],
      recentReviews: []
    }

    return mockStats
  }

  /**
   * Check and award badges
   */
  async checkAndAwardBadges(userId: string): Promise<ProfileBadge[]> {
    const profile = await this.getUserProfile(userId)
    if (!profile) return []

    const stats = await this.getProfileStats(userId)
    const newBadges: ProfileBadge[] = []

    // Check each badge requirement
    const requirements: UserBadgeRequirements = {
      verified_buyer: { purchasesNeeded: 1 },
      top_reviewer: { reviewsNeeded: 50, averageRatingNeeded: 4.0 },
      community_helper: { helpfulVotesNeeded: 100 },
      early_adopter: { joinDateBefore: new Date('2024-01-01') },
      power_buyer: { totalSpentNeeded: 50000 },
      trusted_member: { accountAgeMonths: 12, reviewsNeeded: 25 }
    }

    // Verified Buyer
    if (stats.totalOrders >= requirements.verified_buyer.purchasesNeeded && 
        !profile.badges.includes('verified_buyer')) {
      newBadges.push('verified_buyer')
    }

    // Top Reviewer
    if (stats.totalReviews >= requirements.top_reviewer.reviewsNeeded &&
        stats.averageRating >= requirements.top_reviewer.averageRatingNeeded &&
        !profile.badges.includes('top_reviewer')) {
      newBadges.push('top_reviewer')
    }

    // Community Helper
    if (stats.helpfulVotes >= requirements.community_helper.helpfulVotesNeeded &&
        !profile.badges.includes('community_helper')) {
      newBadges.push('community_helper')
    }

    // Power Buyer
    if (stats.totalSpent >= requirements.power_buyer.totalSpentNeeded &&
        !profile.badges.includes('power_buyer')) {
      newBadges.push('power_buyer')
    }

    // Trusted Member
    if (stats.daysSinceJoining >= requirements.trusted_member.accountAgeMonths * 30 &&
        stats.totalReviews >= requirements.trusted_member.reviewsNeeded &&
        !profile.badges.includes('trusted_member')) {
      newBadges.push('trusted_member')
    }

    // TODO: Update profile with new badges in database
    if (newBadges.length > 0) {
      console.log(`Awarded new badges to ${userId}:`, newBadges)
    }

    return newBadges
  }

  /**
   * Check if user can view another user's content
   */
  canViewContent(
    viewerUserId: string | null,
    targetUserId: string,
    contentType: 'profile' | 'purchases' | 'reviews' | 'wishlist' | 'following' | 'followers',
    targetProfile: UserProfile,
    isFollowing: boolean = false
  ): boolean {
    // Own profile - can always view
    if (viewerUserId === targetUserId) return true

    // Get privacy setting for content type
    let privacySetting: ProfileVisibility | HistoryPrivacy
    switch (contentType) {
      case 'profile':
        privacySetting = targetProfile.visibility
        break
      case 'purchases':
        privacySetting = targetProfile.showPurchaseHistory
        break
      case 'reviews':
        privacySetting = targetProfile.showReviewHistory
        break
      case 'wishlist':
        privacySetting = targetProfile.showWishlist
        break
      case 'following':
        privacySetting = targetProfile.showFollowing
        break
      case 'followers':
        privacySetting = targetProfile.showFollowers
        break
      default:
        return false
    }

    // Check privacy level
    switch (privacySetting) {
      case 'public':
        return true
      case 'followers':
        return viewerUserId !== null && isFollowing
      case 'friends':
        // TODO: Implement friends system
        return false
      case 'private':
        return false
      default:
        return false
    }
  }

  /**
   * Search public profiles
   */
  async searchProfiles(
    query: string,
    options?: {
      page?: number
      limit?: number
      location?: string
      badges?: ProfileBadge[]
    }
  ): Promise<{ profiles: UserProfile[]; total: number }> {
    // TODO: Implement database search query
    return { profiles: [], total: 0 }
  }

  /**
   * Get trending reviewers
   */
  async getTrendingReviewers(limit: number = 10): Promise<UserProfile[]> {
    // TODO: Implement database query to get top reviewers by recent activity
    return []
  }

  /**
   * Get profile activity feed
   */
  async getProfileActivity(
    userId: string,
    viewerUserId: string | null,
    options?: { page?: number; limit?: number }
  ): Promise<Array<{
    type: 'purchase' | 'review' | 'badge' | 'achievement'
    title: string
    description: string
    date: Date
    metadata?: any
  }>> {
    // TODO: Implement activity feed based on privacy settings
    return []
  }
}

// Export singleton instance
export const userProfilesSystem = new UserProfilesSystem()
export default userProfilesSystem