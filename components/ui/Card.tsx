// components/ui/Card.tsx
import { CSSProperties, ReactNode } from 'react'

interface Props {
  title?: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
  accent?: string         // cor lateral / topo (ex: var(--cat-financeiro))
  padding?: number | string
  maxWidth?: number | string
  style?: CSSProperties
  children: ReactNode
}

export function Card({
  title, subtitle, actions, accent, padding = 24, maxWidth, style, children,
}: Props) {
  return (
    <section
      className="animate-fade"
      style={{
        background: 'var(--surface)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--border)',
        overflow: 'hidden',
        marginBottom: 20,
        maxWidth,
        ...style,
      }}
    >
      {accent && (
        <div style={{ height: 4, background: accent }} />
      )}
      {(title || actions) && (
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 24px',
            borderBottom: '1px solid var(--border)',
            background: 'var(--surface-2)',
          }}
        >
          <div>
            {title && <h3 style={{ margin: 0 }}>{title}</h3>}
            {subtitle && (
              <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
                {subtitle}
              </p>
            )}
          </div>
          {actions && <div style={{ display: 'flex', gap: 8 }}>{actions}</div>}
        </header>
      )}
      <div style={{ padding }}>{children}</div>
    </section>
  )
}
