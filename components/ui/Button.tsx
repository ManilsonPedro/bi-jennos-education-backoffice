// components/ui/Button.tsx
import { ButtonHTMLAttributes, CSSProperties } from 'react'

type Variant = 'primary' | 'accent' | 'outline' | 'ghost' | 'danger' | 'success'
type Size = 'sm' | 'md' | 'lg'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const base: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  fontWeight: 600,
  borderRadius: 'var(--radius)',
  border: '1px solid transparent',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
  fontFamily: 'inherit',
  whiteSpace: 'nowrap',
  lineHeight: 1.2,
}

const sizes: Record<Size, CSSProperties> = {
  sm: { padding: '6px 12px', fontSize: 12 },
  md: { padding: '9px 16px', fontSize: 13 },
  lg: { padding: '12px 22px', fontSize: 14 },
}

const variants: Record<Variant, CSSProperties> = {
  primary: { background: 'var(--primary)', color: '#fff', borderColor: 'var(--primary)' },
  accent: { background: 'var(--accent)', color: '#fff', borderColor: 'var(--accent)' },
  outline: { background: '#fff', color: 'var(--primary)', borderColor: 'var(--border-strong)' },
  ghost: { background: 'transparent', color: 'var(--text)', borderColor: 'transparent' },
  danger: { background: 'var(--danger)', color: '#fff', borderColor: 'var(--danger)' },
  success: { background: 'var(--success)', color: '#fff', borderColor: 'var(--success)' },
}

export function Button({
  variant = 'primary',
  size = 'md',
  disabled,
  style,
  ...props
}: Props) {
  const merged: CSSProperties = {
    ...base,
    ...sizes[size],
    ...variants[variant],
    opacity: disabled ? 0.55 : 1,
    cursor: disabled ? 'not-allowed' : 'pointer',
    ...style,
  }
  return <button {...props} disabled={disabled} style={merged} />
}
