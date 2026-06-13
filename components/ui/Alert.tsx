// components/ui/Alert.tsx
import { CSSProperties, ReactNode } from 'react'

type Tone = 'info' | 'success' | 'warn' | 'danger'

const styles: Record<Tone, CSSProperties> = {
  info: { background: '#eff6ff', borderColor: '#bfdbfe', color: '#1e3a8a' },
  success: { background: '#f0fdf4', borderColor: '#bbf7d0', color: '#14532d' },
  warn: { background: '#fffbeb', borderColor: '#fde68a', color: '#78350f' },
  danger: { background: '#fef2f2', borderColor: '#fecaca', color: '#7f1d1d' },
}

export function Alert({ tone = 'info', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <div
      role="alert"
      style={{
        ...styles[tone],
        border: '1px solid',
        borderRadius: 'var(--radius)',
        padding: '10px 14px',
        marginBottom: 16,
        fontSize: 13,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      {children}
    </div>
  )
}
