import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  // Пропускаем WebSocket запросы
  if (request.headers.get("upgrade") === "websocket") {
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
    '/uploads/:path*'  // Добавляем обработку uploads
  ],
}

