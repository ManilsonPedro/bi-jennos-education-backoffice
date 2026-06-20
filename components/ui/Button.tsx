// components/ui/Button.tsx
'use client'

import { ButtonHTMLAttributes, CSSProperties, useState } from 'react'

type Variant = 'primary' | 'accent' | 'outline' | 'ghost' | 'danger' | 'success' | 'brand'
type Size = 'sm' | 'md' | 'lg'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const base: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  fontFamily: 'var(--font-body)',
  fontWeight: 600,
  borderRadius: 'var(--radius)',
  border: '1px solid transparent',
  cursor: 'pointer',
  transition:
    'transform var(--dur) var(--ease), box-shadow var(--dur) var(--ease), background var(--dur) var(--ease)',
  whiteSpace: 'nowrap',
  lineHeight: 1.2,
  letterSpacing: '0.01em',
}

const sizes: Record<Size, CSSProperties> = {
  sm: { padding: '7px 13px', fontSize: 12.5 },
  md: { padding: '10px 18px', fontSize: 13.5 },
  lg: { padding: '13px 24px', fontSize: 14.5 },
}

const variants: Record<Variant, CSSProperties> = {
  primary: { background: 'var(--primary)', color: '#fff', borderColor: 'var(--primary)' },
  accent: { background: 'var(--accent)', color: '#fff', borderColor: 'var(--accent)' },
  // Variante de MARCA — unico uso do gradiente do logo num botao (CTA de destaque).
  brand: { background: 'var(--brand-gradient-h)', color: '#fff', borderColor: 'transparent' },
  outline: { background: 'var(--surface)', color: 'var(--primary)', borderColor: 'var(--border-strong)' },
  ghost: { background: 'transparent', color: 'var(--text)', borderColor: 'transparent' },
  danger: { background: 'var(--danger)', color: '#fff', borderColor: 'var(--danger)' },
  success: { background: 'var(--success)', color: '#fff', borderColor: 'var(--success)' },
}

export function Button({
  variant = 'primary',
  size = 'md',
  disabled,
  style,
  onMouseEnter,
  onMouseLeave,
  ...props
}: Props) {
  const [hover, setHover] = useState(false)
  const lift = hover && !disabled && variant !== 'ghost'
  const merged: CSSProperties = {
    ...base,
    ...sizes[size],
    ...variants[variant],
    opacity: disabled ? 0.5 : 1,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transform: lift ? 'translateY(-1px)' : 'none',
    boxShadow: lift ? 'var(--shadow-md)' : 'none',
    ...style,
  }
  return (
    <button
      {...props}
      disabled={disabled}
      style={merged}
      onMouseEnter={(e) => {
        setHover(true)
        onMouseEnter?.(e)
      }}
      onMouseLeave={(e) => {
        setHover(false)
        onMouseLeave?.(e)
      }}
    />
  )
}
