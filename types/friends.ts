import { Friendship, User } from "@prisma/client"

export interface FriendshipWithUsers extends Friendship {
  sender: Pick<User, 'id' | 'name' | 'email' | 'image'> | null
  receiver: Pick<User, 'id' | 'name' | 'email' | 'image'> | null
} 