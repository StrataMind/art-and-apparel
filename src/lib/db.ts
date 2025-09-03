import { PrismaClient } from '@prisma/client'
import { neon } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const databaseUrl = process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL
  
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    // Use Neon adapter in production/Vercel (serverless)
    if (!databaseUrl) {
      throw new Error('DATABASE_URL or POSTGRES_PRISMA_URL must be set for production')
    }
    const neonClient = neon(databaseUrl)
    const adapter = new PrismaNeon(neonClient)
    return new PrismaClient({ 
      adapter,
      log: ['error', 'warn']
    } as any)
  } else {
    // Use regular Prisma in development
    return new PrismaClient({
      log: ['query'],
    })
  }
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db