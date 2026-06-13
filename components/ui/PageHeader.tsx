// components/ui/PageHeader.tsx
import { ReactNode } from 'react'

interface Props {
  title: string
  subtitle?: string
  breadcrumb?: string[]
  actions?: ReactNode
  accent?: string
}

export function PageHeader({ title, subtitle, breadcrumb, actions, accent }: Props) {
  return (
    <div style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
      <div style={{ borderLeft: accent ? `4px solid ${accent}` : 'none', paddingLeft: accent ? 16 : 0 }}>
        {breadcrumb && breadcrumb.length > 0 && (
          <nav style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
            {breadcrumb.map((b, i) => (
              <span key={i}>
                {b}
                {i < breadcrumb.length - 1 && <span style={{ margin: '0 6px', color: '#cbd5e1' }}>›</span>}
              </span>
            ))}
          </nav>
        )}
        <h1 style={{ margin: 0 }}>{title}</h1>
        {subtitle && (
          <p style={{ margin: '6px 0 0', color: 'var(--text-muted)', fontSize: 14 }}>{subtitle}</p>
        )}
      </div>
      {actions && <div style={{ display: 'flex', gap: 8 }}>{actions}</div>}
    </div>
  )
}
