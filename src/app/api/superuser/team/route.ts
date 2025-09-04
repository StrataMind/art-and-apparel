import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { makeSuperuser, getSuperuserPermissions, removeSuperuser } from '@/lib/superuser'
import { makeSuperuserSchema } from '@/lib/validations/superuser'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get fresh user data to verify superuser status
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        isSuperuser: true,
        superuserLevel: true,
        canManageUsers: true
      }
    })

    if (!user || !user.isSuperuser) {
      return NextResponse.json(
        { error: 'Superuser access required' },
        { status: 403 }
      )
    }

    const permissions = getSuperuserPermissions(user as any)
    
    if (!permissions.canManageUsers) {
      return NextResponse.json(
        { error: 'User management permission required' },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await req.json()
    const { email, level } = makeSuperuserSchema.parse(body)

    // Find the target user
    const targetUser = await db.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, isSuperuser: true }
    })

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found. They must sign up first.' },
        { status: 404 }
      )
    }

    if (targetUser.isSuperuser) {
      return NextResponse.json(
        { error: 'User is already a superuser' },
        { status: 400 }
      )
    }

    // Make the user a superuser
    const updatedUser = await makeSuperuser(targetUser.id, level, user.id)

    return NextResponse.json({
      success: true,
      message: `${email} has been granted ${level} access`,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        superuserLevel: updatedUser.superuserLevel
      }
    })

  } catch (error) {
    console.error('Error adding team member:', error)
    
    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to add team member' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get fresh user data to verify superuser status
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        isSuperuser: true,
        canManageUsers: true
      }
    })

    if (!user || !user.isSuperuser) {
      return NextResponse.json(
        { error: 'Superuser access required' },
        { status: 403 }
      )
    }

    const permissions = getSuperuserPermissions(user as any)
    
    if (!permissions.canManageUsers) {
      return NextResponse.json(
        { error: 'User management permission required' },
        { status: 403 }
      )
    }

    // Get all superusers
    const superusers = await db.user.findMany({
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

    return NextResponse.json({
      success: true,
      superusers
    })

  } catch (error) {
    console.error('Error fetching team members:', error)
    return NextResponse.json(
      { error: 'Failed to fetch team members' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Only CEO can remove superusers
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        isSuperuser: true,
        superuserLevel: true
      }
    })

    if (!user || !user.isSuperuser || user.superuserLevel !== 'CEO') {
      return NextResponse.json(
        { error: 'CEO access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(req.url)
    const targetUserId = searchParams.get('userId')

    if (!targetUserId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }

    if (targetUserId === user.id) {
      return NextResponse.json(
        { error: 'Cannot remove yourself' },
        { status: 400 }
      )
    }

    // Remove superuser status
    const updatedUser = await removeSuperuser(targetUserId, user.id)

    return NextResponse.json({
      success: true,
      message: 'Superuser access removed',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email
      }
    })

  } catch (error) {
    console.error('Error removing team member:', error)
    return NextResponse.json(
      { error: 'Failed to remove team member' },
      { status: 500 }
    )
  }
}