import "next-auth"
import { JWT } from "next-auth/jwt"
import { DefaultSession } from "next-auth"

export type UserRole = "USER" | "ADMIN"

declare module "next-auth" {
  interface User {
    id: string
    role: UserRole
    name?: string | null
    email?: string | null
    image?: string | null
  }

  interface Session {
    user?: {
      id: string
      role?: string
      coursesCompleted?: number
      achievementsCount?: number
    } & DefaultSession["user"]
    expires: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: UserRole
    email?: string | null
    name?: string | null
    picture?: string | null
  }
} 