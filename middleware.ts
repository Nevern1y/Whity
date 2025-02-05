import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import { prisma } from "@/lib/prisma"

export async function middleware(request: NextRequest) {
  // Пропускаем WebSocket и API запросы
  if (request.headers.get("upgrade") === "websocket" || 
      request.nextUrl.pathname.startsWith('/api/socket.io') ||
      request.nextUrl.pathname.startsWith('/api/users/update-status') ||
      request.nextUrl.pathname.startsWith('/api/users/offline') ||
      request.nextUrl.pathname.startsWith('/api/users/status')) {
    return NextResponse.next()
  }

  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  })
  
  // Защищенные роуты
  const protectedPaths = ['/admin', '/courses/create', '/settings', '/profile', '/messages']
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )

  if (isProtectedPath && !token) {
    const url = new URL('/login', request.url)
    url.searchParams.set('callbackUrl', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // Проверка прав администратора
  const adminPaths = ['/admin', '/courses/create']
  const isAdminPath = adminPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )
  
  if (isAdminPath && token?.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Редирект с /login если пользователь уже авторизован
  if (request.nextUrl.pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  const response = NextResponse.next()

  // Set the show-sidebar cookie based on the current path
  if (request.nextUrl.pathname === "/") {
    response.cookies.set("show-sidebar", "0")
  } else {
    response.cookies.set("show-sidebar", "1")
  }

  if (request.nextUrl.pathname.startsWith('/api/socketio')) {
    response.headers.set('Access-Control-Allow-Origin', '*')
  }

  // Обработка статических файлов
  if (request.nextUrl.pathname.startsWith('/uploads/')) {
    // Устанавливаем правильные заголовки для изображений
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
    response.headers.set('Content-Type', 'image/jpeg') // или другой тип в зависимости от файла
    return response
  }

  // В существующем middleware добавить обработку timeout
  const TIMEOUT = 5 * 60 * 1000 // 5 минут

  if (token?.id) {
    // Вызываем API роут для обновления статуса
    await fetch(`${request.nextUrl.origin}/api/users/update-status`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  }

  return response
}

// Обновляем конфигурацию matcher
export const config = {
  matcher: [
    '/admin/:path*',
    '/courses/create',
    '/settings',
    '/profile',
    '/messages',
    '/login',
    '/uploads/:path*',
    '/api/users/:path*',
    '/api/socket.io/:path*'
  ]
}

