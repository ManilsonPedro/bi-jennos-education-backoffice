// components/shared/DynamicShell.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { uiAPI, type ModuloTree } from '@/lib/api'
import { logout } from '@/lib/auth'
import { Logo } from '@/components/ui/Logo'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

interface DynamicShellProps {
  title: string
  fallbackNav?: Array<{ href: string; label: string }>
  children: React.ReactNode
}

// Cor lateral por nome de módulo
const MODULO_ACCENT: Record<string, string> = {
  Academico: 'var(--cat-academico)',
  Secretaria: 'var(--cat-secretaria)',
  Financeiro: 'var(--cat-financeiro)',
  RH: 'var(--cat-rh)',
  Administracao: 'var(--cat-administrativo)',
  'Meu Curso': 'var(--cat-curso)',
  Estudante: 'var(--cat-estudante)',
}

export function DynamicShell({ title, fallbackNav = [], children }: DynamicShellProps) {
  const pathname = usePathname()
  const [tree, setTree] = useState<ModuloTree[] | null>(null)
  const [erro, setErro] = useState('')
  const [openModuloId, setOpenModuloId] = useState<string | null>(null)

  useEffect(() => {
    uiAPI.menus()
      .then((t) => {
        setTree(t)
        // Abrir módulo cujo conteúdo bate com a rota actual
        const activo = t.find((m) =>
          m.menus.some((mn) => mn.paginas.some((p) => pathname?.startsWith(p.rota))),
        )
        setOpenModuloId(activo?.id ?? t[0]?.id ?? null)
      })
      .catch((e) => setErro((e as Error).message))
  }, [pathname])

  const usaFallback = tree !== null && tree.length === 0
  const carregando = tree === null && !erro

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 280,
          background: 'var(--surface)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Brand / cabeçalho aside */}
        <div
          style={{
            padding: '20px 20px 18px',
            background: 'var(--brand-gradient)',
            color: '#fff',
            borderBottom: '3px solid var(--brand-cyan)',
          }}
        >
          <Logo size={42} inverted tagline="EDUCATIONE" />
          <div style={{
            marginTop: 14, paddingTop: 12,
            borderTop: '1px solid rgba(255,255,255,0.15)',
            fontSize: 11, opacity: 0.75,
            letterSpacing: '0.12em', textTransform: 'uppercase',
          }}>
            {title}
          </div>
        </div>

        {/* Navegação */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 8px' }}>
          {carregando && (
            <p style={{ color: 'var(--text-muted)', fontSize: 12, padding: '0 16px' }}>A carregar menus...</p>
          )}
          {erro && (
            <div style={{
              margin: 8, padding: 10, background: '#fef2f2', color: '#7f1d1d',
              borderRadius: 'var(--radius)', fontSize: 11,
            }}>
              {erro}
            </div>
          )}

          {tree && tree.map((mod) => {
            const aberto = openModuloId === mod.id
            const accent = MODULO_ACCENT[mod.nome] ?? 'var(--primary)'
            return (
              <div key={mod.id} style={{ marginBottom: 4 }}>
                <button
                  type="button"
                  onClick={() => setOpenModuloId(aberto ? null : mod.id)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    background: aberto ? 'var(--surface-2)' : 'transparent',
                    border: 'none',
                    color: 'var(--text)',
                    padding: '10px 14px',
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: 'pointer',
                    borderRadius: 'var(--radius)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                    fontFamily: 'inherit',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{
                      display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
                      background: accent,
                    }} />
                    {mod.nome}
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>{aberto ? '▼' : '▶'}</span>
                </button>
                {aberto && (
                  <div style={{ paddingLeft: 8, marginTop: 2 }}>
                    {mod.menus.map((menu) => (
                      <div key={menu.id} style={{ marginBottom: 6 }}>
                        <div style={{
                          color: 'var(--text-muted)', fontSize: 10, fontWeight: 600,
                          textTransform: 'uppercase', letterSpacing: '0.06em',
                          margin: '6px 14px 4px',
                        }}>{menu.nome}</div>
                        {menu.paginas.map((p) => {
                          const activo = pathname === p.rota
                          return (
                            <Link
                              key={p.id}
                              href={p.rota}
                              style={{
                                display: 'block',
                                padding: '7px 14px',
                                margin: '2px 0',
                                color: activo ? 'var(--accent)' : 'var(--text)',
                                background: activo ? '#fef2f2' : 'transparent',
                                fontSize: 13,
                                fontWeight: activo ? 600 : 400,
                                borderRadius: 'var(--radius)',
                                borderLeft: activo ? `3px solid var(--accent)` : '3px solid transparent',
                              }}
                            >
                              {p.nome}
                            </Link>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}

          {(usaFallback || erro) && fallbackNav.map((n) => {
            const activo = pathname === n.href
            return (
              <Link
                key={n.href}
                href={n.href}
                style={{
                  display: 'block',
                  padding: '9px 14px',
                  color: activo ? 'var(--accent)' : 'var(--text)',
                  background: activo ? '#fef2f2' : 'transparent',
                  borderRadius: 'var(--radius)',
                  fontSize: 13,
                  fontWeight: activo ? 600 : 500,
                  margin: '2px 0',
                }}
              >
                {n.label}
              </Link>
            )
          })}
        </nav>

        {/* Footer com toggle de tema + sair */}
        <div style={{
          padding: 16, borderTop: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          <ThemeToggle />
          <button
            type="button"
            onClick={logout}
            style={{
              width: '100%',
              background: 'transparent',
              border: '1px solid var(--border-strong)',
              color: 'var(--text)',
              padding: '9px 12px',
              borderRadius: 'var(--radius)',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 500,
              fontFamily: 'inherit',
            }}
          >
            Terminar sessão
          </button>
        </div>
      </aside>

      {/* Conteúdo */}
      <main style={{ flex: 1, padding: '32px 40px', overflowX: 'auto' }}>
        {children}
      </main>
    </div>
  )
}
