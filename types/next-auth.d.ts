import "next-auth"
import { JWT } from "next-auth/jwt"

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
    user: User & {
      id: string
      role: UserRole
    }
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