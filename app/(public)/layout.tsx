// app/(public)/layout.tsx
import Link from 'next/link'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <header
        style={{
          background: 'var(--primary)',
          color: '#fff',
          padding: '16px 32px',
          display: 'flex',
          gap: 24,
          alignItems: 'center',
        }}
      >
        <Link href="/cursos" style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>
          Bi.Jennos.Educatione
        </Link>
        <nav style={{ display: 'flex', gap: 16, marginLeft: 'auto' }}>
          <Link href="/cursos" style={{ color: '#cdd9e5' }}>
            Cursos
          </Link>
          <Link href="/inscricao" style={{ color: '#cdd9e5' }}>
            Inscricao
          </Link>
          <Link href="/login" style={{ color: '#cdd9e5' }}>
            Entrar
          </Link>
        </nav>
      </header>
      <main style={{ maxWidth: 900, margin: '0 auto', padding: 32 }}>{children}</main>
    </div>
  )
}
