// components/ui/Field.tsx
import { CSSProperties, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react'

const labelStyle: CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  marginBottom: 6,
}

const controlStyle: CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '10px 12px',
  border: '1px solid var(--border-strong)',
  borderRadius: 'var(--radius)',
  background: '#fff',
  fontFamily: 'inherit',
  fontSize: 13,
  color: 'var(--text)',
  transition: 'border-color 0.15s, box-shadow 0.15s',
  outline: 'none',
}

const wrapperStyle: CSSProperties = { marginBottom: 16 }

export function FormField({
  label, hint, error, children,
}: {
  label?: string
  hint?: string
  error?: string
  children: ReactNode
}) {
  return (
    <div style={wrapperStyle}>
      {label && <label style={labelStyle}>{label}</label>}
      {children}
      {hint && !error && (
        <small style={{ display: 'block', marginTop: 4, color: 'var(--text-muted)', fontSize: 11 }}>{hint}</small>
      )}
      {error && (
        <small style={{ display: 'block', marginTop: 4, color: 'var(--danger)', fontSize: 11 }}>{error}</small>
      )}
    </div>
  )
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} style={{ ...controlStyle, ...props.style }} />
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} style={{ ...controlStyle, ...props.style }} />
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} style={{ ...controlStyle, minHeight: 80, resize: 'vertical', ...props.style }} />
}
