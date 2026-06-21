import type { LucideIcon } from 'lucide-react'

interface Props {
  label: string
  value: string | number
  hint?: string
  accent?: string
  /** Icone Lucide opcional — renderizado num tile colorido (estilo ERP). */
  icon?: LucideIcon
}

export function StatCard({ label, value, hint, accent = 'var(--primary)', icon: Icon }: Props) {
  const str = String(value)
  const fontSize = str.length > 14 ? 18 : str.length > 10 ? 22 : 28

  return (
    <div
      className="animate-fade"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: 18,
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 14,
        minWidth: 0,
      }}
    >
      {Icon && (
        <div
          style={{
            flexShrink: 0,
            width: 44,
            height: 44,
            borderRadius: 'var(--radius)',
            display: 'grid',
            placeItems: 'center',
            // Tile com a cor de accent suave + icone na cor cheia
            background: `color-mix(in srgb, ${accent} 14%, transparent)`,
            color: accent,
          }}
        >
          <Icon size={22} strokeWidth={2.2} />
        </div>
      )}
      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--text-muted)',
            fontWeight: 700,
            marginBottom: 6,
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize,
            fontWeight: 800,
            color: 'var(--text)',
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            wordBreak: 'break-word',
          }}
        >
          {value}
        </div>
        {hint && <div style={{ marginTop: 6, fontSize: 12, color: 'var(--text-muted)' }}>{hint}</div>}
      </div>
    </div>
  )
}
