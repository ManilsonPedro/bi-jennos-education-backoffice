// middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { decodeJwt } from 'jose'

const ROUTE_ROLES: Record<string, string[]> = {
  '/admin': ['admin', 'direcao'],
  '/secretaria': ['admin', 'secretaria'],
  '/docente': ['admin', 'docente'],
  '/aluno': ['admin', 'aluno', 'encarregado'],
  '/encarregado': ['admin', 'encarregado'],
  '/financeiro': ['admin', 'financeiro'],
  '/rh': ['admin', 'direcao'],
  // /dashboard: qualquer utilizador autenticado
  '/dashboard': ['admin', 'direcao', 'secretaria', 'docente', 'aluno', 'encarregado', 'financeiro'],
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('access_token')?.value
  const requiredRoles = Object.entries(ROUTE_ROLES).find(([prefix]) =>
    pathname.startsWith(prefix),
  )?.[1]

  if (!requiredRoles) return NextResponse.next()
  if (!token) return NextResponse.redirect(new URL('/login', request.url))

  try {
    const payload = decodeJwt(token) as { role: string; exp: number }
    if (payload.exp * 1000 < Date.now())
      return NextResponse.redirect(new URL('/login?reason=expired', request.url))
    if (!requiredRoles.includes(payload.role))
      return NextResponse.redirect(new URL('/sem-permissao', request.url))

    const response = NextResponse.next()
    response.headers.set('x-user-role', payload.role)
    return response
  } catch {
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/secretaria/:path*',
    '/docente/:path*',
    '/aluno/:path*',
    '/encarregado/:path*',
    '/financeiro/:path*',
    '/rh/:path*',
    '/dashboard',
  ],
}
