// components/ui/ThemeToggle.tsx
'use client'

import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark'
const STORAGE_KEY = 'bi-jennos-theme'

function readStored(): Theme | null {
  if (typeof window === 'undefined') return null
  const v = window.localStorage.getItem(STORAGE_KEY)
  return v === 'light' || v === 'dark' ? v : null
}

function systemPref(): Theme {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute('data-theme', theme)
}

/** Botão compacto para alternar tema. Coloca-se no rodapé da sidebar. */
export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const [theme, setTheme] = useState<Theme>('light')

  useEffect(() => {
    const initial = readStored() ?? systemPref()
    setTheme(initial)
    applyTheme(initial)
  }, [])

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    applyTheme(next)
    try { window.localStorage.setItem(STORAGE_KEY, next) } catch { /* noop */ }
  }

  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggle}
      title={isDark ? 'Tema claro' : 'Tema escuro'}
      aria-label="Alternar tema"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: compact ? 'center' : 'space-between',
        gap: 8,
        width: '100%',
        padding: compact ? 8 : '9px 12px',
        background: 'transparent',
        border: '1px solid var(--border-strong)',
        color: 'var(--text)',
        borderRadius: 'var(--radius)',
        cursor: 'pointer',
        fontSize: 13,
        fontFamily: 'inherit',
        fontWeight: 500,
        transition: 'background 0.15s, border-color 0.15s',
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {isDark ? (
            // sol (vai virar light)
            <>
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
            </>
          ) : (
            // lua (vai virar dark)
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
          )}
        </svg>
        {!compact && (isDark ? 'Tema claro' : 'Tema escuro')}
      </span>
      {!compact && (
        <span style={{
          fontSize: 10, padding: '2px 8px', borderRadius: 999,
          background: 'var(--surface-2)', color: 'var(--text-muted)',
          textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600,
        }}>
          {isDark ? 'dark' : 'light'}
        </span>
      )}
    </button>
  )
}

/**
 * Script de bootstrap para colar no <head> de forma a aplicar
 * o tema antes da hidratação e evitar FOUC.
 */
export const themeBootstrapScript = `
(function(){
  try {
    var t = localStorage.getItem('${STORAGE_KEY}');
    if (!t) t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', t);
  } catch (_) {}
})();
`
