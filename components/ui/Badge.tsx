// components/ui/Badge.tsx
import { CSSProperties, ReactNode } from 'react'

type Tone = 'neutral' | 'success' | 'warn' | 'danger' | 'info' | 'accent'

const tones: Record<Tone, CSSProperties> = {
  neutral: { background: '#e2e8f0', color: '#334155' },
  success: { background: '#dcfce7', color: '#166534' },
  warn: { background: '#fef3c7', color: '#854d0e' },
  danger: { background: '#fee2e2', color: '#991b1b' },
  info: { background: '#dbeafe', color: '#1e40af' },
  accent: { background: '#fee2e2', color: 'var(--accent-strong)' },
}

const ESTADO_TONE: Record<string, Tone> = {
  pendente: 'warn', aberta: 'success', fechada: 'neutral',
  pago: 'success', aprovada: 'success', convertida: 'info',
  rejeitada: 'danger', vencido: 'danger', cancelado: 'neutral',
  isento: 'info', parcial: 'warn', publicada: 'success',
}

export function Badge({ children, tone = 'neutral', estado }: {
  children?: ReactNode
  tone?: Tone
  estado?: string
}) {
  const resolved = estado ? (ESTADO_TONE[estado.toLowerCase()] ?? 'neutral') : tone
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 10px',
      borderRadius: 999,
      fontSize: 11,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
      ...tones[resolved],
    }}>
      {children ?? estado}
    </span>
  )
}
