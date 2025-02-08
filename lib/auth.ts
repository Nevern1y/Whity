import NextAuth, { type NextAuthOptions, type User } from "next-auth"
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

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Email and password are required')
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            select: {
              id: true,
              email: true,
              name: true,
              hashedPassword: true,
              role: true,
              emailVerified: true,
            },
          })

          if (!user || !user.hashedPassword) {
            throw new Error('No user found with this email')
          }

          const isPasswordValid = await compare(
            credentials.password,
            user.hashedPassword
          )

          if (!isPasswordValid) {
            throw new Error('Invalid password')
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role as UserRole,
            emailVerified: user.emailVerified,
          }
        } catch (error) {
          console.error("[AUTH] Error:", error)
          throw error
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
  },
  debug: process.env.NODE_ENV === 'development',
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.role = user.role as UserRole
        token.emailVerified = user.emailVerified
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.role = token.role as UserRole
        session.user.emailVerified = token.emailVerified
      }
      return session
    },
  },
}

// Создаем и экспортируем auth функции
const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }

// Хелпер для проверки авторизации
export async function auth() {
  return await getServerSession(authOptions)
}

// Хелпер для проверки авторизации
export async function checkAuth() {
  console.log("[AUTH] Checking auth...")
  const session = await getServerSession(authOptions)
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