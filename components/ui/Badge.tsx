// components/ui/Badge.tsx
import { CSSProperties, ReactNode } from 'react'

type Tone = 'neutral' | 'success' | 'warn' | 'danger' | 'info' | 'accent'

// Tons em tinta suave (fundo translucido + texto escuro AA), alinhados aos tokens.
const tones: Record<Tone, CSSProperties> = {
  neutral: { background: 'var(--surface-2)', color: 'var(--text-muted)' },
  success: { background: 'rgba(31, 138, 76, .12)', color: '#176b3a' },
  warn: { background: 'rgba(217, 97, 15, .13)', color: '#a04a0c' },
  danger: { background: 'rgba(192, 57, 43, .12)', color: '#9c2c20' },
  info: { background: 'rgba(37, 99, 201, .12)', color: '#1d4ea0' },
  accent: { background: 'rgba(0, 166, 214, .14)', color: 'var(--accent-strong)' },
}

const ESTADO_TONE: Record<string, Tone> = {
  pendente: 'warn', aberta: 'success', fechada: 'neutral',
  pago: 'success', aprovada: 'success', convertida: 'info',
  rejeitada: 'danger', vencido: 'danger', cancelado: 'neutral',
  isento: 'info', parcial: 'warn', publicada: 'success',
  activa: 'success', ativo: 'success', inactivo: 'neutral',
}

export function Badge({ children, tone = 'neutral', estado }: {
  children?: ReactNode
  tone?: Tone
  estado?: string
}) {
  const resolved = estado ? (ESTADO_TONE[estado.toLowerCase()] ?? 'neutral') : tone
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '3px 11px',
      borderRadius: 'var(--radius-pill)',
      fontSize: 11,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      fontFamily: 'var(--font-body)',
      ...tones[resolved],
    }}>
      {children ?? estado}
    </span>
  )
}
