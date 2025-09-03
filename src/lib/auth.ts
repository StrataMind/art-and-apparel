import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { PrismaClient } from '@prisma/client'
import { db } from './db'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

// Create a separate Prisma client for NextAuth adapter
const authDb = new PrismaClient()

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const authOptions: NextAuthOptions = {
  // Don't use adapter - handle database operations manually
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: 'BUYER' // Default role for new users
        }
      }
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials) {
          return null
        }

        const validatedFields = loginSchema.safeParse(credentials)
        if (!validatedFields.success) {
          return null
        }

        const { email, password } = validatedFields.data

        const user = await db.user.findUnique({
          where: { email },
        })

        if (!user || !user.password) {
          return null
        }

        const passwordsMatch = await bcrypt.compare(password, user.password)
        
        if (!passwordsMatch) return null
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          // Check if user already exists
          const existingUser = await db.user.findUnique({
            where: { email: user.email! }
          })

          if (!existingUser) {
            // Create new user from Google OAuth
            await db.user.create({
              data: {
                email: user.email!,
                name: user.name!,
                image: user.image,
                role: 'BUYER',
                emailVerified: new Date(), // Google emails are pre-verified
              }
            })
          }
        } catch (error) {
          console.error('Error saving Google OAuth user:', error)
          // Still allow sign in even if database save fails
        }
      }
      return true
    },
    async redirect({ url, baseUrl }) {
      // Always redirect to home page (/) after any auth operation
      return baseUrl
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      
      // Get user data from database for existing users
      if (token.email) {
        const dbUser = await db.user.findUnique({
          where: { email: token.email },
          select: {
            id: true,
            role: true,
            isSuperuser: true,
            superuserLevel: true
          }
        })
        
        if (dbUser) {
          token.userId = dbUser.id
          token.role = dbUser.role
          token.isSuperuser = dbUser.isSuperuser
          token.superuserLevel = dbUser.superuserLevel
        }
      }
      
      return token
    },
    async session({ token, session }) {
      if (token) {
        session.user.id = token.userId || token.sub!
        session.user.role = token.role
        session.user.isSuperuser = token.isSuperuser
        session.user.superuserLevel = token.superuserLevel
      }
      return session
    },
  },
}