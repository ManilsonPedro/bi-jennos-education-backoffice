// components/shared/DynamicShell.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  GraduationCap,
  LayoutGrid,
  type LucideIcon,
  Settings,
  Users,
  Wallet,
} from 'lucide-react'
import { uiAPI, type ModuloTree } from '@/lib/api'
import { logout } from '@/lib/auth'
import { Logo } from '@/components/ui/Logo'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

// Familia unica de icones (Lucide) — mapeia o modulo ao seu icone.
const MODULO_ICON: Record<string, LucideIcon> = {
  Academico: GraduationCap,
  Secretaria: ClipboardList,
  Financeiro: Wallet,
  RH: Users,
  Administracao: Settings,
  'Meu Curso': BookOpen,
  Estudante: GraduationCap,
}

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
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', alignItems: 'flex-start' }}>
      {/* Sidebar — sticky: fica parado enquanto o conteudo faz scroll */}
      <aside
        style={{
          width: 280,
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflowY: 'auto',
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
        <nav style={{ flex: 1, padding: '12px 8px' }}>
          {carregando && (
            <p style={{ color: 'var(--text-muted)', fontSize: 12, padding: '0 16px' }}>A carregar menus...</p>
          )}
          {erro && (
            <div style={{
              margin: 8, padding: 10,
              background: 'rgba(192, 57, 43, .1)', color: 'var(--danger)',
              borderRadius: 'var(--radius)', fontSize: 11,
            }}>
              {erro}
            </div>
          )}

          {tree && tree.map((mod) => {
            const aberto = openModuloId === mod.id
            const accent = MODULO_ACCENT[mod.nome] ?? 'var(--primary)'
            const Icon = MODULO_ICON[mod.nome] ?? LayoutGrid
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
                    <Icon size={17} style={{ color: accent, flexShrink: 0 }} strokeWidth={2} />
                    {mod.nome}
                  </span>
                  {aberto
                    ? <ChevronDown size={15} style={{ color: 'var(--text-muted)' }} />
                    : <ChevronRight size={15} style={{ color: 'var(--text-muted)' }} />}
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
                              aria-current={activo ? 'page' : undefined}
                              style={{
                                display: 'block',
                                padding: '7px 14px',
                                margin: '2px 0',
                                color: activo ? 'var(--primary)' : 'var(--text)',
                                background: activo ? 'var(--surface-2)' : 'transparent',
                                fontSize: 13,
                                fontWeight: activo ? 700 : 400,
                                borderRadius: 'var(--radius)',
                                // Signature: trilho com gradiente da marca no item activo
                                borderLeft: activo
                                  ? '3px solid transparent'
                                  : '3px solid transparent',
                                borderImage: activo
                                  ? 'linear-gradient(180deg, var(--brand-cyan), var(--brand-purple)) 1'
                                  : 'none',
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
                aria-current={activo ? 'page' : undefined}
                style={{
                  display: 'block',
                  padding: '9px 14px',
                  color: activo ? 'var(--primary)' : 'var(--text)',
                  background: activo ? 'var(--surface-2)' : 'transparent',
                  borderRadius: 'var(--radius)',
                  fontSize: 13,
                  fontWeight: activo ? 700 : 500,
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
