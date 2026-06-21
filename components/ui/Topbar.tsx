// components/ui/Topbar.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { Bell, ChevronDown, LogOut, Search, User } from 'lucide-react'
import { authAPI } from '@/lib/api'
import { logout } from '@/lib/auth'

interface Me {
  nome_completo?: string
  email?: string
  role?: string
}

export function Topbar() {
  const [me, setMe] = useState<Me | null>(null)
  const [openMenu, setOpenMenu] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    authAPI.me().then((d) => setMe(d as Me)).catch(() => setMe(null))
  }, [])

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpenMenu(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const nome = me?.nome_completo || 'Utilizador'
  const iniciais = nome
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '12px 24px',
        background: 'color-mix(in srgb, var(--surface) 86%, transparent)',
        backdropFilter: 'saturate(160%) blur(8px)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {/* Pesquisa global */}
      <label
        style={{
          flex: 1,
          maxWidth: 420,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          background: 'var(--surface-2)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-pill)',
          color: 'var(--text-muted)',
        }}
      >
        <Search size={16} />
        <input
          aria-label="Pesquisa global"
          placeholder="Pesquisa global..."
          style={{
            flex: 1,
            border: 'none',
            background: 'transparent',
            outline: 'none',
            fontSize: 13,
            color: 'var(--text)',
            padding: 0,
          }}
        />
        <kbd
          style={{
            fontSize: 11,
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 6,
            padding: '1px 6px',
          }}
        >
          ⌘K
        </kbd>
      </label>

      <div style={{ flex: 1 }} />

      {/* Notificacoes */}
      <button
        type="button"
        aria-label="Notificações"
        style={{
          position: 'relative',
          display: 'grid',
          placeItems: 'center',
          width: 38,
          height: 38,
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          background: 'var(--surface)',
          color: 'var(--text-muted)',
          cursor: 'pointer',
        }}
      >
        <Bell size={18} />
        <span
          style={{
            position: 'absolute',
            top: 8,
            right: 9,
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: 'var(--brand-cyan)',
          }}
        />
      </button>

      {/* Utilizador */}
      <div ref={ref} style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={() => setOpenMenu((v) => !v)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '5px 10px 5px 5px',
            borderRadius: 'var(--radius-pill)',
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            cursor: 'pointer',
            color: 'var(--text)',
          }}
        >
          <span
            style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              display: 'grid',
              placeItems: 'center',
              background: 'var(--brand-gradient-h)',
              color: '#fff',
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {iniciais || <User size={15} />}
          </span>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{nome}</span>
          <ChevronDown size={15} style={{ color: 'var(--text-muted)' }} />
        </button>

        {openMenu && (
          <div
            className="animate-fade"
            style={{
              position: 'absolute',
              right: 0,
              top: 'calc(100% + 8px)',
              minWidth: 220,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              boxShadow: 'var(--shadow-lg)',
              padding: 8,
            }}
          >
            <div style={{ padding: '8px 10px 10px', borderBottom: '1px solid var(--border)', marginBottom: 6 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{nome}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{me?.email}</div>
            </div>
            <button
              type="button"
              onClick={logout}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 10px',
                border: 'none',
                background: 'transparent',
                color: 'var(--danger)',
                cursor: 'pointer',
                borderRadius: 'var(--radius-sm)',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              <LogOut size={16} /> Terminar sessão
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
