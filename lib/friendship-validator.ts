import { prisma } from "@/lib/prisma"
import { FriendshipStatus } from "@prisma/client"

export class FriendshipValidator {
  static async validateAndCleanup(userId: string) {
    // Проверяем и исправляем конфликтующие статусы
    const conflictingFriendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      }
    })

    const seen = new Set<string>()
    for (const friendship of conflictingFriendships) {
      const key = [friendship.senderId, friendship.receiverId].sort().join('-')
      
      if (seen.has(key)) {
        // Удаляем дубликат
        await prisma.friendship.delete({
          where: { id: friendship.id }
        })
      } else {
        seen.add(key)
      }
    }
  }

  static async getFriendshipStatus(userId: string, targetUserId: string): Promise<FriendshipStatus> {
    if (userId === targetUserId) {
      return 'NONE' as FriendshipStatus
    }

    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { senderId: userId, receiverId: targetUserId },
          { senderId: targetUserId, receiverId: userId }
        ]
      }
    })

    return (friendship?.status ?? 'NONE') as FriendshipStatus
  }

  static async areMutualFriends(userId: string, targetUserId: string): Promise<boolean> {
    const status = await this.getFriendshipStatus(userId, targetUserId)
    return status === 'ACCEPTED'
  }
} 