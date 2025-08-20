'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { 
  Bell,
  BellOff,
  Package,
  TrendingDown,
  Megaphone,
  Award,
  Star,
  Clock,
  Check,
  Trash2,
  Settings,
  Filter,
  MoreHorizontal,
  X
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import { followingSystem, FollowerNotification, UpdateType } from '@/lib/following-system'

interface NotificationsCenterProps {
  userId: string
  className?: string
}

const NOTIFICATION_ICONS = {
  new_product: Package,
  price_drop: TrendingDown,
  back_in_stock: Package,
  sale_started: Megaphone,
  sale_ended: Megaphone,
  store_announcement: Megaphone,
  achievement: Award,
  review_milestone: Star
}

const NOTIFICATION_COLORS = {
  new_product: 'text-blue-600',
  price_drop: 'text-red-600',
  back_in_stock: 'text-green-600',
  sale_started: 'text-orange-600',
  sale_ended: 'text-gray-600',
  store_announcement: 'text-purple-600',
  achievement: 'text-yellow-600',
  review_milestone: 'text-pink-600'
}

export default function NotificationsCenter({ userId, className = '' }: NotificationsCenterProps) {
  const [notifications, setNotifications] = useState<FollowerNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread' | UpdateType>('all')
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    loadNotifications()
    // Set up real-time notifications (WebSocket/SSE)
    // TODO: Implement real-time connection
  }, [userId])

  const loadNotifications = async () => {
    try {
      const { notifications: notifs, unreadCount: count } = await followingSystem.getUserNotifications(userId, {
        unreadOnly: filter === 'unread',
        type: typeof filter === 'string' && filter !== 'all' && filter !== 'unread' ? filter as UpdateType : undefined
      })
      setNotifications(notifs)
      setUnreadCount(count)
    } catch (error) {
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      await followingSystem.markNotificationAsRead(notificationId)
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, isRead: true, readAt: new Date() } : notif
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      toast.error('Failed to mark as read')
    }
  }

  const markAllAsRead = async () => {
    try {
      await followingSystem.markAllNotificationsAsRead(userId)
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isRead: true, readAt: new Date() }))
      )
      setUnreadCount(0)
      toast.success('All notifications marked as read')
    } catch (error) {
      toast.error('Failed to mark all as read')
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      // TODO: Implement delete notification API
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId))
      toast.success('Notification deleted')
    } catch (error) {
      toast.error('Failed to delete notification')
    }
  }

  const handleNotificationClick = async (notification: FollowerNotification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id)
    }
    
    if (notification.actionUrl) {
      window.open(notification.actionUrl, '_blank')
    }
    
    setIsOpen(false)
  }

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'all') return true
    if (filter === 'unread') return !notif.isRead
    return notif.type === filter
  })

  const NotificationsBell = () => (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className={`relative ${className}`}>
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="border-b p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                  <Check className="w-4 h-4" />
                </Button>
              )}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Settings className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Notification Settings</DialogTitle>
                    <DialogDescription>
                      Manage your notification preferences for followed sellers
                    </DialogDescription>
                  </DialogHeader>
                  <NotificationSettings userId={userId} />
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          {/* Filter Tabs */}
          <div className="flex space-x-2 mt-3">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                filter === 'unread'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredNotifications.length > 0 ? (
            <div className="divide-y">
              {filteredNotifications.slice(0, 10).map((notification) => {
                const Icon = NOTIFICATION_ICONS[notification.type]
                const iconColor = NOTIFICATION_COLORS[notification.type]
                
                return (
                  <div
                    key={notification.id}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      !notification.isRead ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-4 h-4 ${iconColor}`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className={`text-sm ${!notification.isRead ? 'font-semibold' : 'font-medium'}`}>
                              {notification.title}
                            </p>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Clock className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-500">
                                {notification.sentAt ? formatDistanceToNow(notification.sentAt, { addSuffix: true }) : 'Just now'}
                              </span>
                            </div>
                          </div>
                          
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></div>
                          )}
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteNotification(notification.id)
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                    
                    {notification.imageUrl && (
                      <div className="mt-3 ml-11">
                        <img
                          src={notification.imageUrl}
                          alt=""
                          className="w-16 h-16 object-cover rounded border"
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="p-8 text-center">
              <BellOff className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </p>
            </div>
          )}
          
          {filteredNotifications.length > 10 && (
            <div className="p-4 border-t">
              <Button variant="ghost" size="sm" className="w-full">
                View All Notifications
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )

  return <NotificationsBell />
}

// Notification Settings Component
interface NotificationSettingsProps {
  userId: string
}

function NotificationSettings({ userId }: NotificationSettingsProps) {
  const [settings, setSettings] = useState({
    email: true,
    push: true,
    newProducts: true,
    priceDrops: true,
    backInStock: true,
    sales: true,
    announcements: false
  })

  const handleSettingChange = (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    // TODO: Save to backend
    toast.success('Notification preferences updated')
  }

  return (
    <div className="space-y-6">
      <div>
        <h4 className="font-semibold mb-3">Delivery Methods</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-gray-600">Receive notifications via email</p>
            </div>
            <input
              type="checkbox"
              checked={settings.email}
              onChange={(e) => handleSettingChange('email', e.target.checked)}
              className="rounded"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Push Notifications</p>
              <p className="text-sm text-gray-600">Receive push notifications in browser</p>
            </div>
            <input
              type="checkbox"
              checked={settings.push}
              onChange={(e) => handleSettingChange('push', e.target.checked)}
              className="rounded"
            />
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-semibold mb-3">Notification Types</h4>
        <div className="space-y-3">
          {[
            { key: 'newProducts', label: 'New Products', description: 'When sellers add new products' },
            { key: 'priceDrops', label: 'Price Drops', description: 'When product prices decrease' },
            { key: 'backInStock', label: 'Back in Stock', description: 'When out-of-stock items return' },
            { key: 'sales', label: 'Sales & Offers', description: 'Special promotions and discounts' },
            { key: 'announcements', label: 'Store Announcements', description: 'General updates from sellers' }
          ].map(({ key, label, description }) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{label}</p>
                <p className="text-sm text-gray-600">{description}</p>
              </div>
              <input
                type="checkbox"
                checked={settings[key as keyof typeof settings] as boolean}
                onChange={(e) => handleSettingChange(key, e.target.checked)}
                className="rounded"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export { NotificationsCenter }