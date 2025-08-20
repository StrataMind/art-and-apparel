/**
 * Following System
 * 
 * This module provides comprehensive seller following functionality with
 * updates feed, notifications, and activity tracking.
 */

export type FollowStatus = 'following' | 'not_following' | 'pending' | 'blocked'
export type UpdateType = 'new_product' | 'price_drop' | 'back_in_stock' | 'sale_started' | 'sale_ended' | 'store_announcement' | 'achievement' | 'review_milestone'
export type NotificationPreference = 'all' | 'important_only' | 'none'

export interface Following {
  id: string
  followerId: string
  sellerId: string
  status: FollowStatus
  notificationPreference: NotificationPreference
  followedAt: Date
  unfollowedAt?: Date
  metadata?: {
    source: string // 'product_page', 'search', 'recommendation', etc.
    initialProduct?: string
    tags?: string[]
  }
}

export interface SellerUpdate {
  id: string
  sellerId: string
  type: UpdateType
  title: string
  description: string
  imageUrl?: string
  productId?: string
  metadata?: {
    oldPrice?: number
    newPrice?: number
    discountPercentage?: number
    stockQuantity?: number
    category?: string
    tags?: string[]
  }
  isPublic: boolean
  isPinned: boolean
  scheduledFor?: Date
  publishedAt: Date
  expiresAt?: Date
  engagementStats: {
    views: number
    likes: number
    shares: number
    clicks: number
    orders: number
  }
  createdAt: Date
  updatedAt: Date
}

export interface FollowerNotification {
  id: string
  followerId: string
  sellerId: string
  updateId: string
  type: UpdateType
  title: string
  message: string
  imageUrl?: string
  actionUrl?: string
  isRead: boolean
  isDelivered: boolean
  deliveryMethod: 'in_app' | 'email' | 'push' | 'sms'
  priority: 'low' | 'medium' | 'high'
  scheduledFor?: Date
  sentAt?: Date
  readAt?: Date
  createdAt: Date
}

export interface FollowingFeed {
  updates: SellerUpdate[]
  pagination: {
    page: number
    limit: number
    total: number
    hasMore: boolean
  }
  filters: {
    types?: UpdateType[]
    sellerId?: string
    dateRange?: {
      from: Date
      to: Date
    }
  }
}

export interface SellerFollowStats {
  sellerId: string
  totalFollowers: number
  activeFollowers: number
  followersGrowth: {
    daily: number
    weekly: number
    monthly: number
  }
  engagementRate: number
  topUpdateTypes: Array<{
    type: UpdateType
    count: number
    averageEngagement: number
  }>
  followerDemographics: {
    locations: Array<{ country: string; count: number }>
    ageGroups: Array<{ range: string; count: number }>
    interests: Array<{ category: string; count: number }>
  }
}

export interface FollowingStats {
  userId: string
  totalFollowing: number
  categoriesFollowed: Array<{
    category: string
    count: number
  }>
  averageEngagement: number
  notificationPreferences: {
    all: number
    important: number
    none: number
  }
  topSellers: Array<{
    sellerId: string
    businessName: string
    interactionScore: number
  }>
}

class FollowingSystem {
  /**
   * Follow a seller
   */
  async followSeller(
    followerId: string,
    sellerId: string,
    source: string = 'direct',
    notificationPreference: NotificationPreference = 'important_only'
  ): Promise<Following> {
    // Check if already following
    const existingFollow = await this.getFollowing(followerId, sellerId)
    if (existingFollow && existingFollow.status === 'following') {
      return existingFollow
    }

    const following: Following = {
      id: `follow_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      followerId,
      sellerId,
      status: 'following',
      notificationPreference,
      followedAt: new Date(),
      metadata: {
        source
      }
    }

    // TODO: Store in database
    console.log('User followed seller:', following)
    
    // Create welcome notification
    await this.createFollowerNotification(
      followerId,
      sellerId,
      'store_announcement',
      'Welcome to our store!',
      'Thank you for following us. You\'ll now receive updates about new products, sales, and exclusive offers.',
      'high'
    )

    return following
  }

  /**
   * Unfollow a seller
   */
  async unfollowSeller(followerId: string, sellerId: string): Promise<void> {
    const following = await this.getFollowing(followerId, sellerId)
    if (!following || following.status !== 'following') {
      return
    }

    following.status = 'not_following'
    following.unfollowedAt = new Date()

    // TODO: Update in database
    console.log('User unfollowed seller:', following)
  }

  /**
   * Update notification preferences
   */
  async updateNotificationPreference(
    followerId: string,
    sellerId: string,
    preference: NotificationPreference
  ): Promise<Following> {
    const following = await this.getFollowing(followerId, sellerId)
    if (!following) {
      throw new Error('Following relationship not found')
    }

    following.notificationPreference = preference
    
    // TODO: Update in database
    console.log('Updated notification preference:', following)
    return following
  }

  /**
   * Create seller update
   */
  async createSellerUpdate(
    sellerId: string,
    type: UpdateType,
    title: string,
    description: string,
    options?: {
      imageUrl?: string
      productId?: string
      metadata?: SellerUpdate['metadata']
      isPublic?: boolean
      isPinned?: boolean
      scheduledFor?: Date
      expiresAt?: Date
    }
  ): Promise<SellerUpdate> {
    const update: SellerUpdate = {
      id: `update_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      sellerId,
      type,
      title,
      description,
      imageUrl: options?.imageUrl,
      productId: options?.productId,
      metadata: options?.metadata,
      isPublic: options?.isPublic ?? true,
      isPinned: options?.isPinned ?? false,
      scheduledFor: options?.scheduledFor,
      publishedAt: options?.scheduledFor || new Date(),
      expiresAt: options?.expiresAt,
      engagementStats: {
        views: 0,
        likes: 0,
        shares: 0,
        clicks: 0,
        orders: 0
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // TODO: Store in database
    console.log('Created seller update:', update)

    // Notify followers if published immediately
    if (!options?.scheduledFor || options.scheduledFor <= new Date()) {
      await this.notifyFollowers(update)
    }

    return update
  }

  /**
   * Get following feed for user
   */
  async getFollowingFeed(
    userId: string,
    options?: {
      page?: number
      limit?: number
      types?: UpdateType[]
      sellerId?: string
      dateRange?: { from: Date; to: Date }
    }
  ): Promise<FollowingFeed> {
    const page = options?.page ?? 1
    const limit = options?.limit ?? 20
    
    // TODO: Implement database query to get updates from followed sellers
    // This would join Following table with SellerUpdate table
    
    // Mock data for demonstration
    const mockUpdates: SellerUpdate[] = [
      {
        id: 'update_1',
        sellerId: 'seller_123',
        type: 'new_product',
        title: 'New Wireless Earbuds Available!',
        description: 'Check out our latest premium wireless earbuds with noise cancellation',
        imageUrl: '/api/placeholder/400/200',
        productId: 'product_456',
        isPublic: true,
        isPinned: false,
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        engagementStats: {
          views: 245,
          likes: 32,
          shares: 8,
          clicks: 56,
          orders: 12
        },
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        id: 'update_2',
        sellerId: 'seller_124',
        type: 'price_drop',
        title: '30% Off Smart Watches!',
        description: 'Limited time price drop on our bestselling smart watches',
        imageUrl: '/api/placeholder/400/200',
        productId: 'product_457',
        metadata: {
          oldPrice: 4999,
          newPrice: 3499,
          discountPercentage: 30
        },
        isPublic: true,
        isPinned: true,
        publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // Expires in 48 hours
        engagementStats: {
          views: 892,
          likes: 156,
          shares: 43,
          clicks: 234,
          orders: 67
        },
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000)
      },
      {
        id: 'update_3',
        sellerId: 'seller_125',
        type: 'back_in_stock',
        title: 'Popular Gaming Mouse Back in Stock!',
        description: 'The gaming mouse you\'ve been waiting for is back in stock. Limited quantity available.',
        imageUrl: '/api/placeholder/400/200',
        productId: 'product_458',
        metadata: {
          stockQuantity: 25
        },
        isPublic: true,
        isPinned: false,
        publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        engagementStats: {
          views: 445,
          likes: 87,
          shares: 19,
          clicks: 123,
          orders: 18
        },
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    ]

    return {
      updates: mockUpdates,
      pagination: {
        page,
        limit,
        total: mockUpdates.length,
        hasMore: false
      },
      filters: options || {}
    }
  }

  /**
   * Get seller's followers
   */
  async getSellerFollowers(
    sellerId: string,
    options?: { page?: number; limit?: number }
  ): Promise<{ followers: Following[]; total: number }> {
    // TODO: Implement database query
    return { followers: [], total: 0 }
  }

  /**
   * Get user's following list
   */
  async getUserFollowing(
    userId: string,
    options?: { page?: number; limit?: number }
  ): Promise<{ following: Following[]; total: number }> {
    // TODO: Implement database query
    return { following: [], total: 0 }
  }

  /**
   * Check if user is following seller
   */
  async isFollowing(followerId: string, sellerId: string): Promise<boolean> {
    const following = await this.getFollowing(followerId, sellerId)
    return following?.status === 'following' ?? false
  }

  /**
   * Get follower statistics for seller
   */
  async getSellerFollowStats(sellerId: string): Promise<SellerFollowStats> {
    // TODO: Implement database aggregation queries
    return {
      sellerId,
      totalFollowers: 1250,
      activeFollowers: 1100,
      followersGrowth: {
        daily: 15,
        weekly: 98,
        monthly: 320
      },
      engagementRate: 8.5,
      topUpdateTypes: [
        { type: 'new_product', count: 45, averageEngagement: 12.3 },
        { type: 'price_drop', count: 23, averageEngagement: 18.7 },
        { type: 'back_in_stock', count: 18, averageEngagement: 9.2 }
      ],
      followerDemographics: {
        locations: [
          { country: 'India', count: 856 },
          { country: 'USA', count: 234 },
          { country: 'UK', count: 160 }
        ],
        ageGroups: [
          { range: '18-25', count: 445 },
          { range: '26-35', count: 523 },
          { range: '36-45', count: 282 }
        ],
        interests: [
          { category: 'Electronics', count: 678 },
          { category: 'Fashion', count: 342 },
          { category: 'Home & Garden', count: 230 }
        ]
      }
    }
  }

  /**
   * Get following statistics for user
   */
  async getFollowingStats(userId: string): Promise<FollowingStats> {
    // TODO: Implement database aggregation queries
    return {
      userId,
      totalFollowing: 42,
      categoriesFollowed: [
        { category: 'Electronics', count: 15 },
        { category: 'Fashion', count: 12 },
        { category: 'Books', count: 8 },
        { category: 'Home & Garden', count: 7 }
      ],
      averageEngagement: 6.8,
      notificationPreferences: {
        all: 8,
        important: 28,
        none: 6
      },
      topSellers: [
        { sellerId: 'seller_1', businessName: 'TechGear Pro', interactionScore: 95.2 },
        { sellerId: 'seller_2', businessName: 'Fashion Forward', interactionScore: 87.6 },
        { sellerId: 'seller_3', businessName: 'Book Haven', interactionScore: 76.3 }
      ]
    }
  }

  /**
   * Track engagement with seller update
   */
  async trackEngagement(
    updateId: string,
    userId: string,
    action: 'view' | 'like' | 'share' | 'click' | 'order'
  ): Promise<void> {
    // TODO: Update engagement stats in database
    console.log(`User ${userId} performed ${action} on update ${updateId}`)
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(
    userId: string,
    options?: {
      page?: number
      limit?: number
      unreadOnly?: boolean
      type?: UpdateType
    }
  ): Promise<{ notifications: FollowerNotification[]; unreadCount: number }> {
    // TODO: Implement database query
    const mockNotifications: FollowerNotification[] = [
      {
        id: 'notif_1',
        followerId: userId,
        sellerId: 'seller_123',
        updateId: 'update_1',
        type: 'new_product',
        title: 'New Product Alert',
        message: 'TechGear Pro just added a new wireless earbuds to their store!',
        imageUrl: '/api/placeholder/100/100',
        actionUrl: '/products/wireless-earbuds-pro',
        isRead: false,
        isDelivered: true,
        deliveryMethod: 'in_app',
        priority: 'medium',
        sentAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        createdAt: new Date(Date.now() - 30 * 60 * 1000)
      },
      {
        id: 'notif_2',
        followerId: userId,
        sellerId: 'seller_124',
        updateId: 'update_2',
        type: 'price_drop',
        title: 'Price Drop Alert',
        message: 'Smart Watches are now 30% off at Fashion Forward!',
        imageUrl: '/api/placeholder/100/100',
        actionUrl: '/products/smart-watch-collection',
        isRead: true,
        isDelivered: true,
        deliveryMethod: 'in_app',
        priority: 'high',
        sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        readAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      }
    ]

    const unreadCount = mockNotifications.filter(n => !n.isRead).length

    return { notifications: mockNotifications, unreadCount }
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(notificationId: string): Promise<void> {
    // TODO: Update notification in database
    console.log(`Marked notification ${notificationId} as read`)
  }

  /**
   * Mark all notifications as read
   */
  async markAllNotificationsAsRead(userId: string): Promise<void> {
    // TODO: Update all user notifications in database
    console.log(`Marked all notifications as read for user ${userId}`)
  }

  // Private helper methods

  private async getFollowing(followerId: string, sellerId: string): Promise<Following | null> {
    // TODO: Implement database query
    return null
  }

  private async notifyFollowers(update: SellerUpdate): Promise<void> {
    // TODO: Get all followers of the seller and create notifications based on their preferences
    const followers = await this.getSellerFollowers(update.sellerId)
    
    for (const following of followers.followers) {
      if (this.shouldNotifyFollower(following, update)) {
        await this.createFollowerNotification(
          following.followerId,
          update.sellerId,
          update.type,
          update.title,
          update.description,
          this.getNotificationPriority(update.type),
          update.id
        )
      }
    }
  }

  private shouldNotifyFollower(following: Following, update: SellerUpdate): boolean {
    if (following.notificationPreference === 'none') return false
    if (following.notificationPreference === 'all') return true
    
    // Important only - only notify for high-priority updates
    const importantTypes: UpdateType[] = ['price_drop', 'back_in_stock', 'sale_started']
    return importantTypes.includes(update.type)
  }

  private getNotificationPriority(type: UpdateType): 'low' | 'medium' | 'high' {
    const highPriority: UpdateType[] = ['price_drop', 'back_in_stock', 'sale_started']
    const mediumPriority: UpdateType[] = ['new_product', 'sale_ended']
    
    if (highPriority.includes(type)) return 'high'
    if (mediumPriority.includes(type)) return 'medium'
    return 'low'
  }

  private async createFollowerNotification(
    followerId: string,
    sellerId: string,
    type: UpdateType,
    title: string,
    message: string,
    priority: 'low' | 'medium' | 'high',
    updateId?: string
  ): Promise<FollowerNotification> {
    const notification: FollowerNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      followerId,
      sellerId,
      updateId: updateId || '',
      type,
      title,
      message,
      isRead: false,
      isDelivered: false,
      deliveryMethod: 'in_app',
      priority,
      createdAt: new Date()
    }

    // TODO: Store in database and trigger notification delivery
    console.log('Created follower notification:', notification)
    return notification
  }
}

// Export singleton instance
export const followingSystem = new FollowingSystem()
export default followingSystem