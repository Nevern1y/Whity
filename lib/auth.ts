import NextAuth, { type NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import GithubProvider from "next-auth/providers/github"
import { compare } from "bcryptjs"
import { getServerSession } from "next-auth/next"
import { UserRole } from "@/types/next-auth"
import { cache } from 'react'

// Кэшируем адаптер
const adapter = cache(() => PrismaAdapter(prisma))()

export const authConfig: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.hashedPassword) {
          return null
        }

        const isValid = await compare(credentials.password, user.hashedPassword)
        if (!isValid) {
          return null
        }

        return user
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    }
  },
  pages: {
    signIn: '/login',
    error: '/error',
  },
  events: {
    async signOut({ token }) {
      if (token?.sub) {
        await prisma.user.update({
          where: { id: token.sub },
          data: { 
            isOnline: false,
            lastActive: new Date()
          }
        })
      }
    }
  },
  debug: process.env.NODE_ENV === 'development',
}

// Создаем и экспортируем auth функции
const handler = NextAuth(authConfig)
export { handler as GET, handler as POST }

// Хелпер для проверки авторизации
export async function auth() {
  return await getServerSession(authConfig)
}

// Хелпер для проверки авторизации
export async function checkAuth() {
  console.log("[AUTH] Checking auth...")
  const session = await getServerSession(authConfig)
  console.log("[AUTH] Session:", {
    exists: !!session,
    userId: session?.user?.id,
    headers: session?.user ? "Present" : "Missing"
  })
  
  if (!session?.user?.id) {
    console.log("[AUTH] No valid session found")
    return null
  }
  return session
} 