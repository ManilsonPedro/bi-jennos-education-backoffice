interface Props {
  label: string
  value: string | number
  hint?: string
  accent?: string
}

export function StatCard({ label, value, hint, accent = 'var(--primary)' }: Props) {
  const str = String(value)
  const fontSize = str.length > 14 ? 18 : str.length > 10 ? 22 : 30

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
        fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em',
        color: 'var(--text-muted)', fontWeight: 700, marginBottom: 10,
      }}>{label}</div>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize,
        fontWeight: 600,
        color: 'var(--text)',
        lineHeight: 1.05,
        letterSpacing: '-0.02em',
        wordBreak: 'break-word',
      }}>
        {value}
      </div>
      {hint && (
        <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>{hint}</div>
      )}
    </div>
  )
}
