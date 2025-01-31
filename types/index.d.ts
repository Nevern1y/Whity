export interface Activity {
  id: string
  type: string
  description: string
  userId: string
  user: {
    name: string | null
    image: string | null
  }
  createdAt: Date
}

export interface News {
  id: string
  title: string
  content: string
  image?: string
  authorId: string
  author: {
    name: string | null
    image: string | null
  }
  createdAt: Date
  updatedAt: Date
} 