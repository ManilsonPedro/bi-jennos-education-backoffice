// app/admin/layout.tsx
'use client'

import Link from 'next/link'
import { logout } from '@/lib/auth'

const NAV = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/alunos', label: 'Alunos' },
  { href: '/admin/turmas', label: 'Turmas' },
  { href: '/admin/certificados', label: 'Certificados' },
  { href: '/admin/relatorios', label: 'Relatorios' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside
        style={{
          width: 240,
          background: 'var(--primary)',
          color: '#fff',
          padding: 20,
        }}
      >
        <h2 style={{ fontSize: 18 }}>Bi.Jennos</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 24 }}>
          {NAV.map((n) => (
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
