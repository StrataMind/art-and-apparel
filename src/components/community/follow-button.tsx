'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { 
  UserPlus, 
  UserMinus, 
  Bell, 
  BellOff, 
  Settings,
  Heart,
  Check,
  Users
} from 'lucide-react'
import { toast } from 'sonner'
import { followingSystem, NotificationPreference, FollowStatus } from '@/lib/following-system'

interface FollowButtonProps {
  sellerId: string
  sellerName: string
  initialFollowStatus?: FollowStatus
  initialFollowerCount?: number
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outline' | 'ghost'
  showFollowerCount?: boolean
  className?: string
}

export default function FollowButton({
  sellerId,
  sellerName,
  initialFollowStatus = 'not_following',
  initialFollowerCount = 0,
  size = 'md',
  variant = 'default',
  showFollowerCount = false,
  className = ''
}: FollowButtonProps) {
  const [followStatus, setFollowStatus] = useState<FollowStatus>(initialFollowStatus)
  const [followerCount, setFollowerCount] = useState(initialFollowerCount)
  const [notificationPreference, setNotificationPreference] = useState<NotificationPreference>('important_only')
  const [isLoading, setIsLoading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const isFollowing = followStatus === 'following'

  const handleFollowToggle = async () => {
    if (isLoading) return

    setIsLoading(true)
    try {
      if (isFollowing) {
        await followingSystem.unfollowSeller('current_user_id', sellerId)
        setFollowStatus('not_following')
        setFollowerCount(prev => prev - 1)
        toast.success(`Unfollowed ${sellerName}`)
      } else {
        await followingSystem.followSeller('current_user_id', sellerId, 'follow_button', notificationPreference)
        setFollowStatus('following')
        setFollowerCount(prev => prev + 1)
        toast.success(`Following ${sellerName}!`)
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleNotificationPreferenceChange = async (preference: NotificationPreference) => {
    if (!isFollowing) return

    try {
      await followingSystem.updateNotificationPreference('current_user_id', sellerId, preference)
      setNotificationPreference(preference)
      
      const messages = {
        all: 'You\'ll receive all updates from this seller',
        important_only: 'You\'ll receive important updates only',
        none: 'You won\'t receive any notifications'
      }
      
      toast.success(messages[preference])
    } catch (error) {
      toast.error('Failed to update notification preferences')
    }
  }

  const sizeClasses = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-9 px-4 text-sm',
    lg: 'h-10 px-6 text-base'
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  if (isFollowing) {
    return (
      <div className="flex items-center space-x-2">
        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogTrigger asChild>
            <Button
              variant={variant}
              className={`${sizeClasses[size]} ${className} ${
                variant === 'default' ? 'bg-green-600 hover:bg-green-700' : ''
              }`}
              disabled={isLoading}
            >
              <Check className={`${iconSizes[size]} mr-2`} />
              Following
              {showFollowerCount && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {followerCount.toLocaleString()}
                </Badge>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Following {sellerName}</DialogTitle>
              <DialogDescription>
                Manage your notification preferences and following settings
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Heart className="w-5 h-5 text-green-600 fill-current" />
                  </div>
                  <div>
                    <p className="font-semibold text-green-900">Following {sellerName}</p>
                    <p className="text-sm text-green-700">
                      {followerCount.toLocaleString()} followers
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Notification Preferences</h4>
                <div className="space-y-2">
                  {[
                    { value: 'all', label: 'All Updates', description: 'Get notified about all seller activities', icon: Bell },
                    { value: 'important_only', label: 'Important Only', description: 'Only price drops, new products, and sales', icon: Bell },
                    { value: 'none', label: 'No Notifications', description: 'Follow silently without notifications', icon: BellOff }
                  ].map(({ value, label, description, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => handleNotificationPreferenceChange(value as NotificationPreference)}
                      className={`w-full p-3 text-left rounded-lg border transition-colors ${
                        notificationPreference === value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <Icon className={`w-5 h-5 mt-0.5 ${
                          notificationPreference === value ? 'text-blue-600' : 'text-gray-500'
                        }`} />
                        <div>
                          <p className={`font-medium ${
                            notificationPreference === value ? 'text-blue-900' : 'text-gray-900'
                          }`}>
                            {label}
                          </p>
                          <p className={`text-sm ${
                            notificationPreference === value ? 'text-blue-700' : 'text-gray-600'
                          }`}>
                            {description}
                          </p>
                        </div>
                        {notificationPreference === value && (
                          <Check className="w-5 h-5 text-blue-600 ml-auto" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={handleFollowToggle}
                  disabled={isLoading}
                  className="w-full text-red-600 border-red-200 hover:bg-red-50"
                >
                  <UserMinus className="w-4 h-4 mr-2" />
                  Unfollow {sellerName}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <Button
      onClick={handleFollowToggle}
      disabled={isLoading}
      variant={variant}
      className={`${sizeClasses[size]} ${className}`}
    >
      <UserPlus className={`${iconSizes[size]} mr-2`} />
      {isLoading ? 'Following...' : 'Follow'}
      {showFollowerCount && (
        <Badge variant="secondary" className="ml-2 text-xs">
          {followerCount.toLocaleString()}
        </Badge>
      )}
    </Button>
  )
}

// Compact follow button for product cards
interface CompactFollowButtonProps {
  sellerId: string
  sellerName: string
  initialFollowStatus?: FollowStatus
  className?: string
}

export function CompactFollowButton({
  sellerId,
  sellerName,
  initialFollowStatus = 'not_following',
  className = ''
}: CompactFollowButtonProps) {
  const [followStatus, setFollowStatus] = useState<FollowStatus>(initialFollowStatus)
  const [isLoading, setIsLoading] = useState(false)

  const isFollowing = followStatus === 'following'

  const handleFollowToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isLoading) return

    setIsLoading(true)
    try {
      if (isFollowing) {
        await followingSystem.unfollowSeller('current_user_id', sellerId)
        setFollowStatus('not_following')
        toast.success(`Unfollowed ${sellerName}`)
      } else {
        await followingSystem.followSeller('current_user_id', sellerId, 'product_card')
        setFollowStatus('following')
        toast.success(`Following ${sellerName}!`)
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleFollowToggle}
      disabled={isLoading}
      className={`p-2 rounded-full transition-colors ${
        isFollowing
          ? 'bg-green-100 text-green-600 hover:bg-green-200'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      } ${className}`}
      title={isFollowing ? `Following ${sellerName}` : `Follow ${sellerName}`}
    >
      {isFollowing ? (
        <Heart className="w-4 h-4 fill-current" />
      ) : (
        <UserPlus className="w-4 h-4" />
      )}
    </button>
  )
}

// Seller stats component
interface SellerFollowStatsProps {
  sellerId: string
  className?: string
}

export function SellerFollowStats({ sellerId, className = '' }: SellerFollowStatsProps) {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const sellerStats = await followingSystem.getSellerFollowStats(sellerId)
        setStats(sellerStats)
      } catch (error) {
        console.error('Failed to load seller stats:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [sellerId])

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className={`flex items-center space-x-4 text-sm text-gray-600 ${className}`}>
      <div className="flex items-center space-x-1">
        <Users className="w-4 h-4" />
        <span>{stats.totalFollowers.toLocaleString()} followers</span>
      </div>
      {stats.followersGrowth.monthly > 0 && (
        <Badge variant="outline" className="text-green-600 border-green-200">
          +{stats.followersGrowth.monthly} this month
        </Badge>
      )}
    </div>
  )
}

export { FollowButton, CompactFollowButton, SellerFollowStats }