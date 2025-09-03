import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { db } from './db'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const authOptions: NextAuthOptions = {
  // Temporarily disable adapter to test OAuth flow
  // adapter: PrismaAdapter(db),
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/signin', // Redirect errors back to sign-in page
  },
  debug: true, // Force debug mode to see detailed logs
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
    async signIn({ user, account, profile, email, credentials }) {
      console.log('🔄 SignIn callback triggered')
      console.log('Environment check:')
      console.log('- NEXTAUTH_URL:', process.env.NEXTAUTH_URL)
      console.log('- NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? 'SET' : 'MISSING')
      console.log('- GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'MISSING')
      
      try {
        console.log('=== SIGNIN CALLBACK ===')
        console.log('User:', JSON.stringify(user, null, 2))
        console.log('Account:', JSON.stringify(account, null, 2))
        console.log('Provider:', account?.provider)
        console.log('Profile:', JSON.stringify(profile, null, 2))
        
        // Always allow OAuth sign ins
        if (account?.provider === 'google') {
          console.log('✅ Google OAuth sign in successful for:', user?.email)
          return true
        }
        
        // Always allow credential sign ins
        if (account?.provider === 'credentials') {
          console.log('✅ Credentials sign in successful for:', user?.email)
          return true
        }
        
        console.log('✅ Generic sign in successful with provider:', account?.provider)
        return true
      } catch (error) {
        console.error('❌ SignIn callback error:', error)
        console.error('Error details:', JSON.stringify(error, null, 2))
        return false
      }
    },
    async redirect({ url, baseUrl }) {
      console.log('NextAuth redirect:', { url, baseUrl })
      
      // Always redirect to home page after any auth operation
      if (url.includes('/auth/') || url.includes('/api/auth/')) {
        console.log('Redirecting to home page:', baseUrl)
        return baseUrl
      }
      
      // If someone tries to access /dashboard, redirect to home
      if (url.includes('/dashboard')) {
        console.log('Dashboard redirect to home:', baseUrl)
        return baseUrl
      }
      
      // For any other relative URL, allow it if it's safe
      if (url.startsWith('/') && !url.includes('/auth/')) {
        return `${baseUrl}${url}`
      }
      
      // For same origin URLs
      try {
        if (new URL(url).origin === baseUrl) {
          return url
        }
      } catch (e) {
        // Invalid URL, default to home
      }
      
      console.log('Default redirect to home:', baseUrl)
      return baseUrl
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        token.role = user.role
      }
      
      // Refresh user data from database for superuser info
      if (token.sub) {
        const dbUser = await db.user.findUnique({
          where: { id: token.sub },
          select: {
            id: true,
            role: true,
            isSuperuser: true,
            superuserLevel: true
          }
        })
        
        if (dbUser) {
          token.role = dbUser.role
          token.isSuperuser = dbUser.isSuperuser
          token.superuserLevel = dbUser.superuserLevel
        }
      }
      
      return token
    },
    async session({ token, session }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role
        session.user.isSuperuser = token.isSuperuser
        session.user.superuserLevel = token.superuserLevel
      }
      return session
    },
  },
}