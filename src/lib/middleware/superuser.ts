import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSuperuserPermissions, SuperuserPermissions } from '@/lib/superuser'
import { db } from '@/lib/db'

export interface SuperuserRequest extends NextRequest {
  user?: {
    id: string
    email: string
    name?: string
    isSuperuser: boolean
    superuserLevel?: string
    permissions: SuperuserPermissions
  }
}

/**
 * Middleware to check if user is a superuser
 */
export async function requireSuperuser(req: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }

  // Get fresh user data from database
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
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
    return NextResponse.json(
      { error: 'Superuser access required' },
      { status: 403 }
    )
  }

  const permissions = getSuperuserPermissions(user as any)

  // Add user info to request
  ;(req as SuperuserRequest).user = {
    id: user.id,
    email: user.email,
    name: user.name || undefined,
    isSuperuser: user.isSuperuser,
    superuserLevel: user.superuserLevel || undefined,
    permissions
  }

  return null // Allow request to continue
}

/**
 * Check specific permission
 */
export async function requirePermission(
  req: NextRequest, 
  permission: keyof SuperuserPermissions
) {
  const superuserCheck = await requireSuperuser(req)
  if (superuserCheck) return superuserCheck

  const user = (req as SuperuserRequest).user!
  
  if (!user.permissions[permission]) {
    return NextResponse.json(
      { error: `Permission required: ${permission}` },
      { status: 403 }
    )
  }

  return null // Allow request to continue
}

/**
 * Require CEO level access
 */
export async function requireCEO(req: NextRequest) {
  const superuserCheck = await requireSuperuser(req)
  if (superuserCheck) return superuserCheck

  const user = (req as SuperuserRequest).user!
  
  if (user.superuserLevel !== 'CEO') {
    return NextResponse.json(
      { error: 'CEO access required' },
      { status: 403 }
    )
  }

  return null // Allow request to continue
}

/**
 * Higher-order function to create protected API routes
 */
export function withSuperuser<T extends any[]>(
  handler: (req: SuperuserRequest, ...args: T) => Promise<NextResponse>
) {
  return async (req: NextRequest, ...args: T): Promise<NextResponse> => {
    const authCheck = await requireSuperuser(req)
    if (authCheck) return authCheck

    return handler(req as SuperuserRequest, ...args)
  }
}

/**
 * Higher-order function for permission-based routes
 */
export function withPermission<T extends any[]>(
  permission: keyof SuperuserPermissions,
  handler: (req: SuperuserRequest, ...args: T) => Promise<NextResponse>
) {
  return async (req: NextRequest, ...args: T): Promise<NextResponse> => {
    const permissionCheck = await requirePermission(req, permission)
    if (permissionCheck) return permissionCheck

    return handler(req as SuperuserRequest, ...args)
  }
}

/**
 * Higher-order function for CEO-only routes
 */
export function withCEO<T extends any[]>(
  handler: (req: SuperuserRequest, ...args: T) => Promise<NextResponse>
) {
  return async (req: NextRequest, ...args: T): Promise<NextResponse> => {
    const ceoCheck = await requireCEO(req)
    if (ceoCheck) return ceoCheck

    return handler(req as SuperuserRequest, ...args)
  }
}