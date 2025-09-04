import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
      isSuperuser?: boolean
      superuserLevel?: string
    } & DefaultSession['user']
  }

  interface User {
    role: string
    isSuperuser?: boolean
    superuserLevel?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string
    userId?: string
    isSuperuser?: boolean
    superuserLevel?: string
  }
}