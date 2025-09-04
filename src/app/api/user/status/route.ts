import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get fresh user data from database
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        role: true,
        isSuperuser: true,
        superuserLevel: true,
        canCreateProducts: true,
        canModerateContent: true,
        canViewAnalytics: true,
        canManageUsers: true,
        canFeatureProducts: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        role: user.role,
        isSuperuser: user.isSuperuser,
        superuserLevel: user.superuserLevel,
        permissions: {
          canCreateProducts: user.canCreateProducts,
          canModerateContent: user.canModerateContent,
          canViewAnalytics: user.canViewAnalytics,
          canManageUsers: user.canManageUsers,
          canFeatureProducts: user.canFeatureProducts
        }
      }
    })

  } catch (error) {
    console.error('Error fetching user status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}