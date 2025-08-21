'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SuperuserPermissions } from '@/lib/superuser'
import { 
  Plus, 
  TrendingUp, 
  Users, 
  Package, 
  Star,
  Activity,
  Shield,
  Settings,
  BarChart3,
  Zap,
  Crown,
  UserPlus
} from 'lucide-react'

interface SuperuserDashboardProps {
  user: {
    id: string
    name: string | null
    email: string
    superuserLevel: string | null
    superuserSince: Date | null
  }
  permissions: SuperuserPermissions
  stats: {
    totalProducts: number
    totalUsers: number
    totalOrders: number
    recentActivity: any[]
  }
}

export function SuperuserDashboard({ user, permissions, stats }: SuperuserDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')

  const quickActions = [
    {
      title: 'Create Product',
      description: 'Add new products instantly with superuser privileges',
      icon: Plus,
      color: 'green',
      href: '/superuser/products/create',
      available: permissions.canCreateProducts
    },
    {
      title: 'Analytics Dashboard',
      description: 'View platform insights and performance metrics',
      icon: BarChart3,
      color: 'blue',
      href: '/superuser/analytics',
      available: permissions.canViewAnalytics
    },
    {
      title: 'Manage Users',
      description: 'User administration and team management',
      icon: Users,
      color: 'purple',
      href: '/superuser/users',
      available: permissions.canManageUsers
    },
    {
      title: 'Feature Products',
      description: 'Promote and feature products on the platform',
      icon: Star,
      color: 'orange',
      href: '/superuser/products/feature',
      available: permissions.canFeatureProducts
    },
    {
      title: 'Content Moderation',
      description: 'Moderate content and manage platform quality',
      icon: Shield,
      color: 'red',
      href: '/superuser/moderation',
      available: permissions.canModerateContent
    },
    {
      title: 'Team Management',
      description: 'Add and manage team members',
      icon: UserPlus,
      color: 'indigo',
      href: '/superuser/team',
      available: permissions.canManageUsers
    }
  ]

  const colorClasses = {
    green: 'border-green-200 bg-green-50 text-green-900',
    blue: 'border-blue-200 bg-blue-50 text-blue-900',
    purple: 'border-purple-200 bg-purple-50 text-purple-900',
    orange: 'border-orange-200 bg-orange-50 text-orange-900',
    red: 'border-red-200 bg-red-50 text-red-900',
    indigo: 'border-indigo-200 bg-indigo-50 text-indigo-900'
  }

  const iconColorClasses = {
    green: 'text-green-600',
    blue: 'text-blue-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
    red: 'text-red-600',
    indigo: 'text-indigo-600'
  }

  const availableActions = quickActions.filter(action => action.available)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Superuser Level Badge */}
      <div className="flex items-center justify-center mb-8">
        <div className="bg-gradient-to-r from-purple-500 to-blue-600 text-white px-6 py-3 rounded-full flex items-center gap-3 shadow-lg">
          <Crown className="h-6 w-6" />
          <span className="font-bold text-lg">
            {user.superuserLevel} ACCESS GRANTED
          </span>
          <Zap className="h-6 w-6" />
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {availableActions.map((action) => {
          const IconComponent = action.icon
          return (
            <Card key={action.title} className={`border-2 transition-all duration-300 hover:shadow-lg ${colorClasses[action.color as keyof typeof colorClasses]}`}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-white/50">
                    <IconComponent className={`h-8 w-8 ${iconColorClasses[action.color as keyof typeof iconColorClasses]}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{action.title}</h3>
                    <p className="text-sm opacity-80 mb-4">{action.description}</p>
                    <Link href={action.href}>
                      <Button className="w-full" variant="outline" size="sm">
                        Access Now
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Stats and Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Platform Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Platform Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Users</span>
              <span className="font-bold text-2xl">{stats.totalUsers.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Orders</span>
              <span className="font-bold text-2xl">{stats.totalOrders.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Your Products</span>
              <span className="font-bold text-2xl text-purple-600">{stats.totalProducts}</span>
            </div>
          </CardContent>
        </Card>

        {/* Your Permissions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Your Permissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(permissions).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {key.replace('can', '').replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <Badge variant={value ? "default" : "secondary"}>
                    {value ? "Granted" : "Denied"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentActivity.length > 0 ? (
                stats.recentActivity.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex justify-between items-start text-sm">
                    <span className="text-gray-600 flex-1">
                      {activity.action.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c: string) => c.toUpperCase())}
                    </span>
                    <span className="text-xs text-gray-400 ml-2">
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No recent activity</p>
              )}
              
              <Link href="/superuser/activity">
                <Button variant="ghost" size="sm" className="w-full mt-3">
                  View All Activity
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Tips */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Zap className="h-5 w-5" />
            Superuser Quick Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">🚀 Product Creation</h4>
              <p className="text-blue-800">
                Your products are automatically verified and can be set to featured status immediately.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">⭐ Featured Products</h4>
              <p className="text-blue-800">
                Use the feature products tool to highlight important items on the homepage.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">👥 Team Management</h4>
              <p className="text-blue-800">
                Add team members with different permission levels to help manage the platform.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">📊 Analytics Access</h4>
              <p className="text-blue-800">
                View comprehensive platform analytics to make data-driven decisions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}