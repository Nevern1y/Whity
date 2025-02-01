import { prisma as client } from "@/lib/prisma"
import type { PrismaClient as PrismaClientType } from "@/types/prisma"

declare global {
  var prisma: PrismaClientType | undefined
}

export const db = globalThis.prisma || client

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = db
} 