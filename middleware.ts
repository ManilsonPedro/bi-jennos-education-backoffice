// middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { decodeJwt } from 'jose'

// Roles normalizadas para lowercase para comparacao case-insensitive
const ROUTE_ROLES: Record<string, string[]> = {
  '/admin':        ['admin', 'direcao'],
  '/coordenador':  ['admin', 'direcao', 'coordenador'],
  '/secretaria':   ['admin', 'secretaria'],
  '/docente':      ['admin', 'docente'],
  '/aluno':        ['admin', 'aluno', 'encarregado'],
  '/encarregado':  ['admin', 'encarregado'],
  '/financeiro':   ['admin', 'financeiro'],
  '/rh':           ['admin', 'direcao'],
  '/dashboard':    ['admin', 'direcao', 'coordenador', 'secretaria', 'docente', 'aluno', 'encarregado', 'financeiro'],
}

const ROLE_HOME: Record<string, string> = {
  admin:        '/admin/dashboard',
  direcao:      '/admin/dashboard',
  coordenador:  '/coordenador/dashboard',
  secretaria:   '/secretaria/dashboard',
  docente:      '/docente/dashboard',
  aluno:        '/aluno/dashboard',
  encarregado:  '/encarregado/dashboard',
  financeiro:   '/financeiro/dashboard',
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('access_token')?.value

  // Redireciona /dashboard genérico para o dashboard do perfil
  if (pathname === '/dashboard') {
    if (!token) return NextResponse.redirect(new URL('/login', request.url))
    try {
      const payload = decodeJwt(token) as { role: string; exp: number }
      if (payload.exp * 1000 < Date.now())
        return NextResponse.redirect(new URL('/login?reason=expired', request.url))
      const role = payload.role.toLowerCase()
      const home = ROLE_HOME[role] ?? '/dashboard-fallback'
      return NextResponse.redirect(new URL(home, request.url))
    } catch {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  const requiredRoles = Object.entries(ROUTE_ROLES).find(([prefix]) =>
    pathname.startsWith(prefix),
  )?.[1]

  if (!requiredRoles) return NextResponse.next()
  if (!token) return NextResponse.redirect(new URL('/login', request.url))

  try {
    const payload = decodeJwt(token) as { role: string; exp: number }
    if (payload.exp * 1000 < Date.now())
      return NextResponse.redirect(new URL('/login?reason=expired', request.url))
    const roleNorm = payload.role.toLowerCase()
    if (!requiredRoles.includes(roleNorm))
      return NextResponse.redirect(new URL('/sem-permissao', request.url))

    const response = NextResponse.next()
    response.headers.set('x-user-role', roleNorm)
    return response
  } catch {
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/coordenador/:path*',
    '/secretaria/:path*',
    '/docente/:path*',
    '/aluno/:path*',
    '/encarregado/:path*',
    '/financeiro/:path*',
    '/rh/:path*',
    '/dashboard',
  ],
}
