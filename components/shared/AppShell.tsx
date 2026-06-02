// components/shared/AppShell.tsx
'use client'

import Link from 'next/link'
import { logout } from '@/lib/auth'

export interface NavItem {
  href: string
  label: string
}

interface AppShellProps {
  title: string
  nav: NavItem[]
  children: React.ReactNode
}

export function AppShell({ title, nav, children }: AppShellProps) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside
        style={{ width: 240, background: 'var(--primary)', color: '#fff', padding: 20 }}
      >
        <h2 style={{ fontSize: 18 }}>{title}</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 24 }}>
          {nav.map((n) => (
            <Link key={n.href} href={n.href} style={{ color: '#cdd9e5' }}>
              {n.label}
            </Link>
          ))}
        </nav>
        <button
          onClick={logout}
          style={{
            marginTop: 32,
            background: 'transparent',
            border: '1px solid #cdd9e5',
            color: '#cdd9e5',
            padding: '8px 12px',
            borderRadius: 8,
          }}
        >
          Terminar sessao
        </button>
      </aside>
      <main style={{ flex: 1, padding: 32 }}>{children}</main>
    </div>
  )
}
