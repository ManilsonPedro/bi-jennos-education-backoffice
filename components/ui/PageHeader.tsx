// components/ui/PageHeader.tsx
import { ReactNode } from 'react'

interface Props {
  title: string
  subtitle?: string
  breadcrumb?: string[]
  actions?: ReactNode
  /** Cor de categoria opcional; se omitida usa o signature gradient da marca. */
  accent?: string
}

export function PageHeader({ title, subtitle, breadcrumb, actions, accent }: Props) {
  // Signature element: trilho+no com gradiente (ou cor de categoria, se fornecida).
  const railStyle = accent
    ? { borderLeft: `4px solid ${accent}`, paddingLeft: 16 }
    : undefined

  return (
    <div
      style={{
        marginBottom: 24,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 16,
      }}
    >
      <div className={accent ? undefined : 'brand-rail'} style={railStyle}>
        {breadcrumb && breadcrumb.length > 0 && (
          <nav style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
            {breadcrumb.map((b, i) => (
              <span key={i}>
                {b}
                {i < breadcrumb.length - 1 && (
                  <span style={{ margin: '0 6px', color: 'var(--border-strong)' }}>/</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <h1 style={{ margin: 0 }}>{title}</h1>
        <div className="brand-underline" style={{ marginTop: 10 }} />
        {subtitle && (
          <p style={{ margin: '10px 0 0', color: 'var(--text-muted)', fontSize: 14 }}>
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>{actions}</div>}
    </div>
  )
}
