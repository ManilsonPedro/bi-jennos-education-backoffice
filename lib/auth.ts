// lib/auth.ts
'use client'

import { authAPI } from './api'

const ACCESS_COOKIE = 'access_token'

function setCookie(name: string, value: string, maxAgeSeconds: number) {
  document.cookie = `${name}=${value}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`
}

function clearCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0`
}

export async function login(email: string, password: string): Promise<void> {
  const tokens = await authAPI.login(email, password)
  // O middleware le este cookie para proteger as rotas por role.
  setCookie(ACCESS_COOKIE, tokens.access_token, tokens.expires_in)
}

export function logout(): void {
  clearCookie(ACCESS_COOKIE)
  window.location.href = '/login'
}

export function getToken(): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${ACCESS_COOKIE}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}
