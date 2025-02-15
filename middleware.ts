import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function middleware(request: NextRequest) {
  // Пропускаем статические файлы и API запросы
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/api/socket.io') ||
    request.nextUrl.pathname.startsWith('/static') ||
    request.headers.get("upgrade") === "websocket"
  ) {
    return NextResponse.next()
  }

  const token = await getToken({ req: request })

  // Public paths that don't require authentication
  const publicPaths = [
    '/',
    '/login',
    '/register',
    '/auth/signin',
    '/auth/signup',
    '/about',
    '/contact'
  ]

  // Paths that require authentication
  const protectedPaths = [
    '/admin',
    '/courses/create',
    '/settings',
    '/profile',
    '/messages'
  ]

  // Paths that require admin role
  const adminPaths = [
    '/admin',
    '/admin/users',
    '/admin/courses',
    '/admin/articles',
    '/admin/database',
    '/admin/security',
    '/admin/settings',
    '/courses/create'
  ]

  // Paths that require manager role
  const managerPaths = [
    '/admin',
    '/admin/courses',
    '/admin/articles',
    '/admin/activity'
  ]

  const { pathname } = request.nextUrl

  // Check if path is protected
  const isProtectedPath = protectedPaths.some(path => 
    pathname.startsWith(path)
  )

  // Check if path requires admin role
  const isAdminPath = adminPaths.some(path => 
    pathname.startsWith(path)
  )

  // Check if path requires manager role
  const isManagerPath = managerPaths.some(path => 
    pathname.startsWith(path)
  )

  // Redirect to login if accessing protected path without token
  if (isProtectedPath && !token) {
    const url = new URL('/login', request.url)
    url.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(url)
  }

  // Redirect to home if accessing admin path without admin role
  if (isAdminPath && token?.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Redirect to home if accessing manager path without admin or manager role
  if (isManagerPath && !['ADMIN', 'MANAGER'].includes(token?.role as string)) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Redirect to home if accessing login/register while authenticated
  if (token && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  const response = NextResponse.next()

  // Set the show-sidebar cookie based on the current path
  if (pathname === "/") {
    response.cookies.set("show-sidebar", "0")
  } else {
    response.cookies.set("show-sidebar", "1")
  }

  // Обработка WebSocket запросов
  if (pathname.startsWith('/api/socket.io')) {
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
  if (pathname.startsWith('/uploads/')) {
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
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}

