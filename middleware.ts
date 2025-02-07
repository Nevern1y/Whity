import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function middleware(request: NextRequest) {
  console.log(`[Middleware] Processing ${request.method} ${request.nextUrl.pathname}`)

  // Если это API запрос или WebSocket, пропускаем
  if (
    request.nextUrl.pathname.startsWith('/api/') ||
    request.headers.get("upgrade") === "websocket"
  ) {
    console.log('[Middleware] Skipping API/WebSocket request')
    return NextResponse.next()
  }

  // Кэшируем результат getToken для одного запроса
  const tokenPromise = getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  })
  
  const token = await tokenPromise
  
  console.log('[Middleware] Token:', token ? 'exists' : 'missing')
  
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

  // Обработка WebSocket запросов
  if (request.nextUrl.pathname.startsWith('/api/socket.io')) {
    const response = NextResponse.next()
    
    // Устанавливаем CORS заголовки только для WebSocket
    if (request.headers.get("upgrade") === "websocket") {
      response.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_APP_URL || '*')
      response.headers.set('Access-Control-Allow-Methods', 'GET,POST')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      response.headers.set('Access-Control-Allow-Credentials', 'true')
    }
    
    return response
  }

  // Обработка статических файлов
  if (request.nextUrl.pathname.startsWith('/uploads/')) {
    // Устанавливаем правильные заголовки для изображений
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
    response.headers.set('Content-Type', 'image/jpeg') // или другой тип в зависимости от файла
    return response
  }

  // Устанавливаем заголовок для идентификации пользователя
  if (token?.sub) {
    response.headers.set('x-user-id', token.sub)
  }

  return response
}

// Обновляем конфигурацию matcher
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    "/api/users/:path*",
    "/api/friends/:path*",
    "/api/messages/:path*",
    "/messages/:path*"
  ]
}

