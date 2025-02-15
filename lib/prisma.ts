import { PrismaClient } from '@prisma/client'

function prismaClientSingleton() {
  return new PrismaClient()
}

declare global {
  var prisma: ReturnType<typeof prismaClientSingleton> | undefined
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma

export { prisma }

