'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { fetchAPI } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { FormField, Input } from '@/components/ui/Field'
import { Logo } from '@/components/ui/Logo'

function ResetForm() {
  const router = useRouter()
  const params = useSearchParams()
  const token = params.get('token') ?? ''

  const [novaSenha, setNovaSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [erro, setErro] = useState('')

  if (!token) {
    return (
      <p style={{ color: 'var(--danger)', textAlign: 'center' }}>
        Link inválido. Solicite um novo link de recuperação.
      </p>
    )
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    if (novaSenha.length < 8) { setErro('A senha deve ter no mínimo 8 caracteres.'); return }
    if (novaSenha !== confirmar) { setErro('As senhas não coincidem.'); return }
    setLoading(true)
    try {
      await fetchAPI('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, nova_senha: novaSenha }),
      })
      setMsg('Senha redefinida com sucesso! A redirecionar para o login...')
      setTimeout(() => router.push('/login'), 2500)
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Link inválido ou expirado.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="animate-fade" style={{
      background: 'var(--surface)', padding: 40, borderRadius: 'var(--radius-lg)',
      width: '100%', maxWidth: 400, boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)',
    }}>
      <div style={{ marginBottom: 24, textAlign: 'center' }}>
        <Logo size={56} />
      </div>
      <h2 style={{ margin: '0 0 6px' }}>Redefinir senha</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: 14 }}>
        Introduza a sua nova palavra-passe.
      </p>

      {msg && (
        <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 14, color: '#166534' }}>
          {msg}
        </div>
      )}
      {erro && (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 14, color: '#991b1b' }}>
          {erro}
        </div>
      )}

      {!msg && (
        <>
          <FormField label="Nova senha">
            <Input
              type="password"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              required
              autoFocus
            />
          </FormField>
          <FormField label="Confirmar senha">
            <Input
              type="password"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              placeholder="Repita a nova senha"
              required
            />
          </FormField>
          <Button type="submit" variant="accent" size="lg" disabled={loading} style={{ width: '100%', marginTop: 8 }}>
            {loading ? 'A guardar...' : 'Definir nova senha'}
          </Button>
        </>
      )}

      <p style={{ marginTop: 20, fontSize: 13, textAlign: 'center' }}>
        <a href="/login" style={{ color: 'var(--primary)' }}>Voltar ao login</a>
      </p>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <main style={{
      minHeight: '100vh', display: 'grid', placeItems: 'center',
      background: 'var(--bg)', padding: 24,
    }}>
      <Suspense fallback={<p>A carregar...</p>}>
        <ResetForm />
      </Suspense>
    </main>
  )
}
