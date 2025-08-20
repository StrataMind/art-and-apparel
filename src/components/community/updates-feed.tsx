'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Heart,
  Share2,
  Eye,
  ShoppingCart,
  Clock,
  TrendingDown,
  Package,
  Megaphone,
  Award,
  Star,
  ExternalLink,
  Filter,
  RefreshCw
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import { followingSystem, SellerUpdate, UpdateType, FollowingFeed } from '@/lib/following-system'

interface UpdatesFeedProps {
  userId: string
  className?: string
}

const UPDATE_ICONS = {
  new_product: Package,
  price_drop: TrendingDown,
  back_in_stock: Package,
  sale_started: Megaphone,
  sale_ended: Megaphone,
  store_announcement: Megaphone,
  achievement: Award,
  review_milestone: Star
}

const UPDATE_COLORS = {
  new_product: 'bg-blue-50 text-blue-600 border-blue-200',
  price_drop: 'bg-red-50 text-red-600 border-red-200',
  back_in_stock: 'bg-green-50 text-green-600 border-green-200',
  sale_started: 'bg-orange-50 text-orange-600 border-orange-200',
  sale_ended: 'bg-gray-50 text-gray-600 border-gray-200',
  store_announcement: 'bg-purple-50 text-purple-600 border-purple-200',
  achievement: 'bg-yellow-50 text-yellow-600 border-yellow-200',
  review_milestone: 'bg-pink-50 text-pink-600 border-pink-200'
}

const UPDATE_LABELS = {
  new_product: 'New Product',
  price_drop: 'Price Drop',
  back_in_stock: 'Back in Stock',
  sale_started: 'Sale Started',
  sale_ended: 'Sale Ended',
  store_announcement: 'Announcement',
  achievement: 'Achievement',
  review_milestone: 'Milestone'
}

export default function UpdatesFeed({ userId, className = '' }: UpdatesFeedProps) {
  const [feed, setFeed] = useState<FollowingFeed | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedTypes, setSelectedTypes] = useState<UpdateType[]>([])
  const [likedUpdates, setLikedUpdates] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadFeed()
  }, [userId, selectedTypes])

  const loadFeed = async (refresh = false) => {
    if (refresh) setRefreshing(true)
    else setLoading(true)

    try {
      const feedData = await followingSystem.getFollowingFeed(userId, {
        types: selectedTypes.length > 0 ? selectedTypes : undefined
      })
      setFeed(feedData)
    } catch (error) {
      toast.error('Failed to load feed')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleLike = async (updateId: string) => {
    try {
      await followingSystem.trackEngagement(updateId, userId, 'like')
      
      setLikedUpdates(prev => {
        const newSet = new Set(prev)
        if (newSet.has(updateId)) {
          newSet.delete(updateId)
        } else {
          newSet.add(updateId)
        }
        return newSet
      })

      // Update the feed data optimistically
      if (feed) {
        setFeed(prev => ({
          ...prev!,
          updates: prev!.updates.map(update => 
            update.id === updateId
              ? {
                  ...update,
                  engagementStats: {
                    ...update.engagementStats,
                    likes: likedUpdates.has(updateId) 
                      ? update.engagementStats.likes - 1
                      : update.engagementStats.likes + 1
                  }
                }
              : update
          )
        }))
      }
    } catch (error) {
      toast.error('Failed to update like')
    }
  }

  const handleShare = async (update: SellerUpdate) => {
    try {
      await followingSystem.trackEngagement(update.id, userId, 'share')
      
      if (navigator.share) {
        await navigator.share({
          title: update.title,
          text: update.description,
          url: update.productId ? `/products/${update.productId}` : `/sellers/${update.sellerId}`
        })
      } else {
        await navigator.clipboard.writeText(
          `${update.title}\n\n${update.description}\n\n${window.location.origin}/products/${update.productId || update.sellerId}`
        )
        toast.success('Link copied to clipboard!')
      }
    } catch (error) {
      console.error('Share failed:', error)
    }
  }

  const handleProductClick = async (update: SellerUpdate) => {
    if (update.productId) {
      await followingSystem.trackEngagement(update.id, userId, 'click')
      // Navigate to product page
      window.open(`/products/${update.productId}`, '_blank')
    }
  }

  const formatEngagementStats = (stats: SellerUpdate['engagementStats']) => {
    const items = []
    if (stats.views > 0) items.push(`${stats.views} views`)
    if (stats.likes > 0) items.push(`${stats.likes} likes`)
    if (stats.orders > 0) items.push(`${stats.orders} orders`)
    return items.join(' • ')
  }

  const toggleTypeFilter = (type: UpdateType) => {
    setSelectedTypes(prev => 
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!feed || feed.updates.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Updates Yet</h3>
        <p className="text-gray-600 mb-6">
          Follow some sellers to see their latest updates, new products, and special offers here.
        </p>
        <Button onClick={() => window.location.href = '/sellers'}>
          Discover Sellers
        </Button>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Filter Bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filter by type:</span>
          <div className="flex flex-wrap gap-2">
            {Object.entries(UPDATE_LABELS).map(([type, label]) => (
              <button
                key={type}
                onClick={() => toggleTypeFilter(type as UpdateType)}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  selectedTypes.includes(type as UpdateType)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
            {selectedTypes.length > 0 && (
              <button
                onClick={() => setSelectedTypes([])}
                className="px-3 py-1 text-xs rounded-full bg-red-100 text-red-700 hover:bg-red-200"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => loadFeed(true)}
          disabled={refreshing}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Updates Feed */}
      <div className="space-y-6">
        {feed.updates.map((update) => {
          const Icon = UPDATE_ICONS[update.type]
          const isLiked = likedUpdates.has(update.id)
          
          return (
            <Card key={update.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={`/api/placeholder/40/40`} />
                        <AvatarFallback>S</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold">Seller Name</h4>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Clock className="w-3 h-3" />
                          <span>{formatDistanceToNow(update.publishedAt, { addSuffix: true })}</span>
                        </div>
                      </div>
                    </div>
                    
                    <Badge className={`${UPDATE_COLORS[update.type]} border`}>
                      <Icon className="w-3 h-3 mr-1" />
                      {UPDATE_LABELS[update.type]}
                    </Badge>
                  </div>

                  {/* Content */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {update.title}
                      </h3>
                      <p className="text-gray-700">{update.description}</p>
                    </div>

                    {/* Price Drop Info */}
                    {update.type === 'price_drop' && update.metadata && (
                      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-red-800">Price dropped by {update.metadata.discountPercentage}%</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-lg font-bold text-red-600">
                                ₹{update.metadata.newPrice?.toLocaleString()}
                              </span>
                              <span className="text-sm text-gray-500 line-through">
                                ₹{update.metadata.oldPrice?.toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <Badge className="bg-red-600 text-white">
                            Save ₹{((update.metadata.oldPrice || 0) - (update.metadata.newPrice || 0)).toLocaleString()}
                          </Badge>
                        </div>
                      </div>
                    )}

                    {/* Stock Info */}
                    {update.type === 'back_in_stock' && update.metadata?.stockQuantity && (
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <p className="text-green-800 font-medium">
                          Back in stock! Only {update.metadata.stockQuantity} items available.
                        </p>
                      </div>
                    )}

                    {/* Expiry Warning */}
                    {update.expiresAt && update.expiresAt > new Date() && (
                      <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                        <div className="flex items-center space-x-2 text-orange-800">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            Expires {formatDistanceToNow(update.expiresAt, { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Product Image */}
                    {update.imageUrl && (
                      <div 
                        className="relative cursor-pointer rounded-lg overflow-hidden"
                        onClick={() => handleProductClick(update)}
                      >
                        <img
                          src={update.imageUrl}
                          alt={update.title}
                          className="w-full h-48 object-cover hover:scale-105 transition-transform"
                        />
                        {update.productId && (
                          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all flex items-center justify-center">
                            <div className="bg-white bg-opacity-90 rounded-full p-2 opacity-0 hover:opacity-100 transition-opacity">
                              <ExternalLink className="w-5 h-5 text-gray-700" />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Engagement Stats */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Eye className="w-4 h-4" />
                      <span>{formatEngagementStats(update.engagementStats)}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleLike(update.id)}
                        className={`flex items-center space-x-1 px-3 py-1.5 rounded-full transition-colors ${
                          isLiked
                            ? 'bg-red-100 text-red-600'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                        <span className="text-sm">{update.engagementStats.likes}</span>
                      </button>

                      <button
                        onClick={() => handleShare(update)}
                        className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                      >
                        <Share2 className="w-4 h-4" />
                        <span className="text-sm">Share</span>
                      </button>

                      {update.productId && (
                        <Button
                          onClick={() => handleProductClick(update)}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <ShoppingCart className="w-4 h-4 mr-1" />
                          View Product
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {/* Load More */}
        {feed.pagination.hasMore && (
          <div className="text-center pt-6">
            <Button variant="outline" onClick={() => loadFeed()}>
              Load More Updates
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export { UpdatesFeed }