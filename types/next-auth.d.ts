import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

export type UserRole = "USER" | "ADMIN"

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string
      role: string
    } & DefaultSession["user"]
    accessToken: string
  }

  interface User {
    id: string
    role: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    accessToken: string
  }
} 