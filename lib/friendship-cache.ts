type FriendshipCache = {
  [key: string]: {
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
    timestamp: number
    isIncoming: boolean
  }
}

class FriendshipCacheManager {
  private static instance: FriendshipCacheManager
  private cache: FriendshipCache = {}
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 минут

  private constructor() {}

  static getInstance(): FriendshipCacheManager {
    if (!FriendshipCacheManager.instance) {
      FriendshipCacheManager.instance = new FriendshipCacheManager()
    }
    return FriendshipCacheManager.instance
  }

  set(userId: string, status: 'PENDING' | 'ACCEPTED' | 'REJECTED', isIncoming: boolean) {
    this.cache[userId] = {
      status,
      timestamp: Date.now(),
      isIncoming
    }
  }

  get(userId: string) {
    const cached = this.cache[userId]
    if (!cached) return null

    if (Date.now() - cached.timestamp > this.CACHE_DURATION) {
      delete this.cache[userId]
      return null
    }

    return cached
  }

  invalidate(userId: string) {
    delete this.cache[userId]
  }
}

export const friendshipCache = FriendshipCacheManager.getInstance() 