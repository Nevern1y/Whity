import { PrismaClient } from "@prisma/client"
import { prisma as client } from "@/lib/prisma"

declare global {
  var prisma: PrismaClient | undefined
}

export const db = globalThis.prisma || client

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = db
} 