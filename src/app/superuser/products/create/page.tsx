import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSuperuserPermissions } from '@/lib/superuser'
import { SuperuserProductForm } from '@/components/superuser/product-form'
import { prisma } from '@/lib/prisma'
import { Package, ArrowLeft, Zap } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function SuperuserCreateProductPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  // Get fresh user data to check superuser status
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      isSuperuser: true,
      superuserLevel: true,
      canCreateProducts: true,
      canModerateContent: true,
      canViewAnalytics: true,
      canManageUsers: true,
      canFeatureProducts: true
    }
  })

  if (!user || !user.isSuperuser) {
    redirect('/dashboard')
  }

  const permissions = getSuperuserPermissions(user as any)
  
  if (!permissions.canCreateProducts) {
    redirect('/superuser')
  }

  // Get categories for the form
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      slug: true
    },
    orderBy: { name: 'asc' }
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          {/* Back Button */}
          <div className="mb-4">
            <Link href="/superuser">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Superuser Dashboard
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-purple-500 to-blue-600 p-3 rounded-lg">
              <Package className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                Superuser Product Creation
                <Zap className="h-6 w-6 text-yellow-500" />
              </h1>
              <p className="text-gray-600 mt-1">
                Create products with enhanced privileges and instant verification
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Superuser Benefits Banner */}
          <div className="bg-gradient-to-r from-purple-100 to-blue-100 border border-purple-200 rounded-xl p-6 mb-8">
            <h2 className="text-lg font-bold text-purple-900 mb-3 flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Superuser Privileges Active
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2 text-purple-800">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Instant Verification
              </div>
              <div className="flex items-center gap-2 text-purple-800">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Auto-Featured Option
              </div>
              <div className="flex items-center gap-2 text-purple-800">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Priority Levels
              </div>
              <div className="flex items-center gap-2 text-purple-800">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Enhanced SEO Controls
              </div>
            </div>
          </div>

          <SuperuserProductForm 
            user={user} 
            permissions={permissions}
            categories={categories}
          />
        </div>
      </div>
    </div>
  )
}