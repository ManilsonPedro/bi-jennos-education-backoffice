// app/login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { login } from '@/lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setLoading(true)
    try {
      await login(email, password)
      router.push('/admin/dashboard')
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Falha no login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
      <form
        onSubmit={onSubmit}
        style={{
          background: '#fff',
          padding: 32,
          borderRadius: 12,
          width: 360,
          boxShadow: '0 4px 20px rgba(0,0,0,.08)',
        }}
      >
        <h1 style={{ color: 'var(--primary)', marginTop: 0 }}>Bi.Jennos.Educatione</h1>
        <p style={{ color: '#666', marginTop: -8 }}>Iniciar sessao</p>

        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={inputStyle}
        />

        <label>Palavra-passe</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={inputStyle}
        />

        {erro && <p style={{ color: '#c0392b' }}>{erro}</p>}

        <button type="submit" disabled={loading} style={btnStyle}>
          {loading ? 'A entrar...' : 'Entrar'}
        </button>
      </form>
    </main>
  )
}

const inputStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: 10,
  margin: '6px 0 16px',
  border: '1px solid #ddd',
  borderRadius: 8,
}

const btnStyle: React.CSSProperties = {
  width: '100%',
  padding: 12,
  background: 'var(--primary)',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  fontSize: 16,
}
