// components/ui/StatCard.tsx
interface Props {
  label: string
  value: string | number
  hint?: string
  accent?: string
}

export function StatCard({ label, value, hint, accent = 'var(--primary)' }: Props) {
  return (
    <div
      className="animate-fade"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: 20,
        boxShadow: 'var(--shadow-sm)',
        borderLeft: `4px solid ${accent}`,
        minWidth: 0,
      }}
    >
      <div style={{
        fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em',
        color: 'var(--text-muted)', fontWeight: 600, marginBottom: 8,
      }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)', lineHeight: 1.1 }}>
        {value}
      </div>
      {hint && (
        <div style={{ marginTop: 6, fontSize: 12, color: 'var(--text-muted)' }}>{hint}</div>
      )}
    </div>
  )
}
