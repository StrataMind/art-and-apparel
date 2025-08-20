'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  MapPin,
  Globe,
  Calendar,
  Award,
  Star,
  Heart,
  Users,
  ShoppingBag,
  MessageSquare,
  Settings,
  Lock,
  Eye,
  EyeOff,
  Share2,
  ExternalLink,
  TrendingUp,
  Trophy,
  Clock,
  CheckCircle,
  Camera,
  Edit3
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import { 
  userProfilesSystem, 
  UserProfile, 
  PurchaseHistoryItem, 
  ReviewHistoryItem, 
  ProfileStats, 
  ProfileBadge 
} from '@/lib/user-profiles'

interface UserProfileProps {
  userId: string
  viewerUserId?: string | null
  isOwnProfile?: boolean
  className?: string
}

const BADGE_CONFIGS = {
  verified_buyer: { 
    icon: CheckCircle, 
    color: 'bg-blue-100 text-blue-800', 
    label: 'Verified Buyer',
    description: 'Made at least one purchase'
  },
  top_reviewer: { 
    icon: Star, 
    color: 'bg-yellow-100 text-yellow-800', 
    label: 'Top Reviewer',
    description: '50+ reviews with 4.0+ average rating'
  },
  community_helper: { 
    icon: Heart, 
    color: 'bg-pink-100 text-pink-800', 
    label: 'Community Helper',
    description: '100+ helpful votes received'
  },
  early_adopter: { 
    icon: Trophy, 
    color: 'bg-purple-100 text-purple-800', 
    label: 'Early Adopter',
    description: 'Joined before 2024'
  },
  power_buyer: { 
    icon: TrendingUp, 
    color: 'bg-green-100 text-green-800', 
    label: 'Power Buyer',
    description: 'Spent over ₹50,000'
  },
  trusted_member: { 
    icon: Award, 
    color: 'bg-orange-100 text-orange-800', 
    label: 'Trusted Member',
    description: '12+ months member with 25+ reviews'
  }
}

export default function UserProfile({ 
  userId, 
  viewerUserId = null, 
  isOwnProfile = false, 
  className = '' 
}: UserProfileProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [profileStats, setProfileStats] = useState<ProfileStats | null>(null)
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseHistoryItem[]>([])
  const [reviewHistory, setReviewHistory] = useState<ReviewHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [isFollowing, setIsFollowing] = useState(false)
  const [isEditingProfile, setIsEditingProfile] = useState(false)

  useEffect(() => {
    loadProfileData()
  }, [userId])

  const loadProfileData = async () => {
    try {
      const [profileData, statsData, purchasesData, reviewsData] = await Promise.all([
        userProfilesSystem.getUserProfile(userId),
        userProfilesSystem.getProfileStats(userId),
        userProfilesSystem.getPurchaseHistory(userId, { limit: 10 }),
        userProfilesSystem.getReviewHistory(userId, { limit: 10 })
      ])

      setProfile(profileData)
      setProfileStats(statsData)
      setPurchaseHistory(purchasesData.items)
      setReviewHistory(reviewsData.items)
    } catch (error) {
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const canViewContent = (contentType: 'profile' | 'purchases' | 'reviews' | 'wishlist' | 'following' | 'followers') => {
    if (!profile) return false
    return userProfilesSystem.canViewContent(
      viewerUserId,
      userId,
      contentType,
      profile,
      isFollowing
    )
  }

  const handleFollow = async () => {
    // TODO: Implement follow functionality
    setIsFollowing(!isFollowing)
    toast.success(isFollowing ? 'Unfollowed user' : 'Following user')
  }

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${profile?.displayName}'s Profile`,
          text: `Check out ${profile?.displayName}'s profile on Findora`,
          url: window.location.href
        })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        toast.success('Profile link copied to clipboard!')
      }
    } catch (error) {
      console.error('Share failed:', error)
    }
  }

  if (loading) {
    return (
      <div className={`max-w-4xl mx-auto ${className}`}>
        <div className="animate-pulse">
          <div className="h-48 bg-gray-200 rounded-lg mb-6"></div>
          <div className="flex items-start space-x-6 mb-8">
            <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-3">
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!profile || !canViewContent('profile')) {
    return (
      <div className={`max-w-4xl mx-auto text-center py-12 ${className}`}>
        <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Profile Not Available</h3>
        <p className="text-gray-600">
          This profile is private or you don't have permission to view it.
        </p>
      </div>
    )
  }

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      {/* Cover Image */}
      {profile.coverImage && (
        <div className="relative h-48 rounded-lg overflow-hidden mb-6">
          <img
            src={profile.coverImage}
            alt="Cover"
            className="w-full h-full object-cover"
          />
          {isOwnProfile && (
            <Button 
              variant="secondary" 
              size="sm"
              className="absolute bottom-4 right-4"
            >
              <Camera className="w-4 h-4 mr-2" />
              Change Cover
            </Button>
          )}
        </div>
      )}

      {/* Profile Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-start space-x-6">
          <div className="relative">
            <Avatar className="w-24 h-24">
              <AvatarImage src={profile.avatar} />
              <AvatarFallback className="text-xl">
                {profile.displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {profile.isVerified && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{profile.displayName}</h1>
              {profile.badges.length > 0 && (
                <div className="flex space-x-1">
                  {profile.badges.slice(0, 3).map((badge) => {
                    const config = BADGE_CONFIGS[badge]
                    const Icon = config.icon
                    return (
                      <div
                        key={badge}
                        title={config.description}
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
                      >
                        <Icon className="w-3 h-3 mr-1" />
                        {config.label}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {profile.bio && (
              <p className="text-gray-700 mb-3 max-w-2xl">{profile.bio}</p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              {profile.location && (
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{profile.location}</span>
                </div>
              )}
              
              {profile.website && (
                <div className="flex items-center space-x-1">
                  <Globe className="w-4 h-4" />
                  <a 
                    href={profile.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {profile.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
              
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>Joined {format(profile.joinDate, 'MMMM yyyy')}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex space-x-6 mt-4 text-sm">
              <div className="text-center">
                <div className="font-semibold text-gray-900">{profile.stats.following}</div>
                <div className="text-gray-600">Following</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-900">{profile.stats.followers}</div>
                <div className="text-gray-600">Followers</div>
              </div>
              {canViewContent('reviews') && (
                <div className="text-center">
                  <div className="font-semibold text-gray-900">{profile.stats.reviewsCount}</div>
                  <div className="text-gray-600">Reviews</div>
                </div>
              )}
              {canViewContent('purchases') && (
                <div className="text-center">
                  <div className="font-semibold text-gray-900">{profile.stats.totalPurchases}</div>
                  <div className="text-gray-600">Orders</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          {isOwnProfile ? (
            <Button
              variant="outline"
              onClick={() => setIsEditingProfile(true)}
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <>
              <Button
                variant={isFollowing ? "outline" : "default"}
                onClick={handleFollow}
              >
                <Users className="w-4 h-4 mr-2" />
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
              <Button variant="outline">
                <MessageSquare className="w-4 h-4 mr-2" />
                Message
              </Button>
            </>
          )}
          
          <Button variant="ghost" size="icon" onClick={handleShare}>
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Profile Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="reviews" disabled={!canViewContent('reviews')}>
            Reviews
          </TabsTrigger>
          <TabsTrigger value="purchases" disabled={!canViewContent('purchases')}>
            Purchases
          </TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Overview */}
          {profileStats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Shopping Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Orders:</span>
                    <span className="font-semibold">{profileStats.totalOrders}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Spent:</span>
                    <span className="font-semibold">₹{profileStats.totalSpent.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Average Order:</span>
                    <span className="font-semibold">₹{profileStats.averageOrderValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Favorite Category:</span>
                    <span className="font-semibold">{profileStats.favoriteCategory}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Review Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Reviews:</span>
                    <span className="font-semibold">{profileStats.totalReviews}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Average Rating:</span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{profileStats.averageRating.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Helpful Votes:</span>
                    <span className="font-semibold">{profileStats.helpfulVotes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">This Year:</span>
                    <span className="font-semibold">{profileStats.reviewsThisYear}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Activity Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Profile Views:</span>
                    <span className="font-semibold">{profileStats.profileViews}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Days Active:</span>
                    <span className="font-semibold">{profileStats.daysSinceJoining}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Most Active:</span>
                    <span className="font-semibold">{profileStats.mostActiveMonth}</span>
                  </div>
                  {profileStats.lastPurchaseDate && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Last Purchase:</span>
                      <span className="font-semibold">
                        {formatDistanceToNow(profileStats.lastPurchaseDate, { addSuffix: true })}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Interests & Categories */}
          {profile.interests.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Interests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest) => (
                    <Badge key={interest} variant="secondary">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="reviews" className="space-y-6">
          {reviewHistory.length > 0 ? (
            <div className="space-y-4">
              {reviewHistory.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <img
                        src={review.productImage}
                        alt={review.productName}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">{review.title}</h4>
                            <p className="text-sm text-gray-600">{review.productName}</p>
                          </div>
                          <div className="flex items-center space-x-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating 
                                    ? 'fill-yellow-400 text-yellow-400' 
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-700 mb-3">{review.content}</p>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center space-x-4">
                            <span>{format(review.reviewDate, 'MMM d, yyyy')}</span>
                            {review.isVerifiedPurchase && (
                              <Badge variant="outline" className="text-xs">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Verified Purchase
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Heart className="w-4 h-4" />
                            <span>{review.helpfulVotes} helpful</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reviews Yet</h3>
              <p className="text-gray-600">
                {isOwnProfile ? "You haven't written any reviews yet." : "This user hasn't written any reviews yet."}
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="purchases" className="space-y-6">
          {purchaseHistory.length > 0 ? (
            <div className="space-y-4">
              {purchaseHistory.map((purchase) => (
                <Card key={purchase.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <img
                        src={purchase.productImage}
                        alt={purchase.productName}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">{purchase.productName}</h4>
                            <p className="text-sm text-gray-600">by {purchase.sellerName}</p>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-gray-900">₹{purchase.price.toLocaleString()}</div>
                            <div className="text-sm text-gray-600">Qty: {purchase.quantity}</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Badge 
                              variant={
                                purchase.status === 'delivered' ? 'default' :
                                purchase.status === 'in_transit' ? 'secondary' :
                                purchase.status === 'cancelled' ? 'destructive' : 'outline'
                              }
                            >
                              {purchase.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {format(purchase.purchaseDate, 'MMM d, yyyy')}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {purchase.isReviewed && purchase.rating && (
                              <div className="flex items-center space-x-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm">{purchase.rating}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Purchases Yet</h3>
              <p className="text-gray-600">
                {isOwnProfile ? "You haven't made any purchases yet." : "This user hasn't made any purchases yet."}
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          {/* Badges */}
          {profile.badges.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Badges</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.badges.map((badge) => {
                    const config = BADGE_CONFIGS[badge]
                    const Icon = config.icon
                    return (
                      <div key={badge} className="flex items-center space-x-3 p-3 border rounded-lg">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${config.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-semibold">{config.label}</div>
                          <div className="text-sm text-gray-600">{config.description}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Achievements */}
          {profile.achievements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profile.achievements.map((achievement) => (
                    <div key={achievement.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{achievement.title}</h4>
                        <p className="text-sm text-gray-600">{achievement.description}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            Earned {formatDistanceToNow(achievement.earnedAt, { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                      {achievement.progress && (
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {achievement.progress.current}/{achievement.progress.target}
                          </div>
                          <div className="w-20 h-2 bg-gray-200 rounded-full mt-1">
                            <div 
                              className="h-full bg-blue-600 rounded-full"
                              style={{ 
                                width: `${(achievement.progress.current / achievement.progress.target) * 100}%` 
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Activity Feed</h3>
                <p className="text-gray-600">Activity timeline will be implemented here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Profile Dialog */}
      {isEditingProfile && (
        <EditProfileDialog 
          profile={profile}
          onClose={() => setIsEditingProfile(false)}
          onSave={(updatedProfile) => {
            setProfile(updatedProfile)
            setIsEditingProfile(false)
          }}
        />
      )}
    </div>
  )
}

// Edit Profile Dialog Component
interface EditProfileDialogProps {
  profile: UserProfile
  onClose: () => void
  onSave: (profile: UserProfile) => void
}

function EditProfileDialog({ profile, onClose, onSave }: EditProfileDialogProps) {
  const [formData, setFormData] = useState({
    displayName: profile.displayName,
    bio: profile.bio || '',
    location: profile.location || '',
    website: profile.website || '',
    interests: profile.interests,
    visibility: profile.visibility,
    showPurchaseHistory: profile.showPurchaseHistory,
    showReviewHistory: profile.showReviewHistory,
    showWishlist: profile.showWishlist,
    showFollowing: profile.showFollowing,
    showFollowers: profile.showFollowers,
    allowMessages: profile.allowMessages
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const updatedProfile = await userProfilesSystem.updateUserProfile(profile.userId, formData)
      onSave(updatedProfile)
      toast.success('Profile updated successfully!')
    } catch (error) {
      toast.error('Failed to update profile')
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your profile information and privacy settings
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="font-semibold">Basic Information</h4>
            
            <div>
              <label className="block text-sm font-medium mb-1">Display Name</label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md"
                rows={3}
                placeholder="Tell others about yourself..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="City, Country"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Website</label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="https://your-website.com"
              />
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="space-y-4">
            <h4 className="font-semibold">Privacy Settings</h4>
            
            <div>
              <label className="block text-sm font-medium mb-1">Profile Visibility</label>
              <select
                value={formData.visibility}
                onChange={(e) => setFormData(prev => ({ ...prev, visibility: e.target.value as any }))}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="public">Public - Anyone can view</option>
                <option value="friends">Friends Only</option>
                <option value="private">Private - Only me</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Purchase History</label>
              <select
                value={formData.showPurchaseHistory}
                onChange={(e) => setFormData(prev => ({ ...prev, showPurchaseHistory: e.target.value as any }))}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="public">Public</option>
                <option value="followers">Followers Only</option>
                <option value="private">Private</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Review History</label>
              <select
                value={formData.showReviewHistory}
                onChange={(e) => setFormData(prev => ({ ...prev, showReviewHistory: e.target.value as any }))}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="public">Public</option>
                <option value="followers">Followers Only</option>
                <option value="private">Private</option>
              </select>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="submit" className="flex-1">Save Changes</Button>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export { UserProfile }