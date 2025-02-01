export enum Level {
  BEGINNER = "BEGINNER",
  INTERMEDIATE = "INTERMEDIATE",
  ADVANCED = "ADVANCED"
}

export interface User {
  id: string
  name: string | null
  email: string | null
  image: string | null
  role: string
  hashedPassword: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Course {
  id: string
  title: string
  description: string
  image: string | null
  level: string
  duration: number
  published: boolean
  authorId: string
  author: {
    id: string
    name: string | null
    image: string | null
  }
  _count: {
    students: number
  }
  createdAt: Date
  updatedAt: Date
}

export interface Achievement {
  id: string
  title: string
  description: string
  image: string | null
  type: string
  createdAt: Date
  updatedAt: Date
}

export interface Message {
  id: string
  content: string
  senderId: string
  receiverId: string
  read: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Friendship {
  id: string
  senderId: string
  receiverId: string
  status: string
  createdAt: Date
  updatedAt: Date
}

export interface Activity {
  id: string
  userId: string
  type: string
  data: any
  createdAt: Date
}

export interface Lesson {
  id: string
  title: string
  content: string
  courseId: string
  createdAt: Date
  updatedAt: Date
}

export interface PrismaClient {
  user: any
  course: any
  lesson: any
  news: any
  message: any
  session: any
  // добавьте другие необходимые модели
} 