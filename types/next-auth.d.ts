import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

export type UserRole = "ADMIN" | "USER"

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string
      role: UserRole
      emailVerified: Date | null
    } & DefaultSession["user"]
    accessToken: string
  }

  interface User {
    id: string
    role: UserRole
    emailVerified: Date | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: UserRole
    accessToken: string
    emailVerified: Date | null
  }
} 