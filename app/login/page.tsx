// app/login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { login } from '@/lib/auth'
import { Button } from '@/components/ui/Button'
import { FormField, Input } from '@/components/ui/Field'
import { Alert } from '@/components/ui/Alert'
import { Logo } from '@/components/ui/Logo'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  // Recuperar senha
  const [mostrarRecuperar, setMostrarRecuperar] = useState(false)
  const [emailRecuperar, setEmailRecuperar] = useState('')
  const [recuperarLoading, setRecuperarLoading] = useState(false)
  const [recuperarMsg, setRecuperarMsg] = useState('')
  const [recuperarErro, setRecuperarErro] = useState('')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setLoading(true)
    try {
      await login(email, password)
      router.push('/dashboard')
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Falha no login')
    } finally {
      setLoading(false)
    }
  }

  async function onRecuperar(e: React.FormEvent) {
    e.preventDefault()
    setRecuperarErro('')
    setRecuperarMsg('')
    setRecuperarLoading(true)
    try {
      const { fetchAPI } = await import('@/lib/api')
      await fetchAPI('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: emailRecuperar }),
      })
      setRecuperarMsg('Se o email existir na plataforma, receberá as instruções em breve.')
    } catch {
      setRecuperarErro('Erro ao enviar pedido. Tente mais tarde.')
    } finally {
      setRecuperarLoading(false)
    }
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        background: 'var(--bg)',
      }}
    >
      {/* Painel esquerdo — branding */}
      <aside
        style={{
          background: 'var(--brand-gradient)',
          color: '#fff',
          padding: '80px 64px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* === Logo gigante em watermark === */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: '50%',
            right: '-15%',
            transform: 'translateY(-50%) rotate(-8deg)',
            width: 780,
            height: 780,
            backgroundImage: 'url(/logo.png)',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundSize: 'contain',
            opacity: 0.13,
            mixBlendMode: 'screen',
            filter: 'blur(0.5px)',
            pointerEvents: 'none',
          }}
        />

        {/* Glows decorativos */}
        <div style={{
          position: 'absolute', top: '-20%', right: '-20%', width: 500, height: 500,
          background: 'radial-gradient(circle, rgba(27,181,232,0.35) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-30%', left: '-20%', width: 600, height: 600,
          background: 'radial-gradient(circle, rgba(107,31,166,0.5) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Conteúdo topo */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Logo size={108} inverted />
          <div style={{
            marginTop: 56,
            fontSize: 12, letterSpacing: '0.22em', textTransform: 'uppercase',
            opacity: 0.8, marginBottom: 14,
          }}>Plataforma de gestão escolar</div>
          <h2 style={{
            fontSize: 38, color: '#fff', lineHeight: 1.15,
            marginBottom: 18, fontWeight: 800, letterSpacing: '-0.01em',
          }}>
            Educação que vai <span style={{ color: 'var(--brand-cyan)' }}>além</span>.
          </h2>
          <p style={{ fontSize: 16, opacity: 0.88, maxWidth: 440, lineHeight: 1.65 }}>
            Académico, financeiro, secretaria e RH numa única plataforma — gerida com a elegância e segurança que a tua instituição merece.
          </p>
        </div>

        {/* Stats rodapé */}
        <div style={{
          display: 'flex', gap: 36, fontSize: 13, opacity: 0.95,
          position: 'relative', zIndex: 1,
        }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 30, color: 'var(--brand-cyan)' }}>360°</div>
            <div style={{ opacity: 0.7 }}>Gestão integrada</div>
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 30, color: 'var(--brand-cyan)' }}>RBAC</div>
            <div style={{ opacity: 0.7 }}>Permissões dinâmicas</div>
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 30, color: 'var(--brand-cyan)' }}>v3.0</div>
            <div style={{ opacity: 0.7 }}>Master Prompt</div>
          </div>
        </div>
      </aside>

      {/* Painel direito — formulário */}
      <section style={{ display: 'grid', placeItems: 'center', padding: 32 }}>
        <form
          onSubmit={onSubmit}
          className="animate-fade"
          style={{
            background: 'var(--surface)',
            padding: 40,
            borderRadius: 'var(--radius-lg)',
            width: '100%',
            maxWidth: 400,
            boxShadow: 'var(--shadow-md)',
            border: '1px solid var(--border)',
          }}
        >
          <h2 style={{ margin: '0 0 6px' }}>Iniciar sessão</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
            Acede ao backoffice com as tuas credenciais.
          </p>

          {erro && <Alert tone="danger">{erro}</Alert>}

          <FormField label="Email">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@bijennos.ao"
              required
              autoFocus
            />
          </FormField>

          <FormField label="Palavra-passe">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </FormField>

          <Button
            type="submit"
            variant="accent"
            size="lg"
            disabled={loading}
            style={{ width: '100%', marginTop: 8 }}
          >
            {loading ? 'A entrar...' : 'Entrar →'}
          </Button>

          <p style={{ marginTop: 20, fontSize: 13, textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => { setMostrarRecuperar(true); setRecuperarMsg(''); setRecuperarErro('') }}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: 13, textDecoration: 'underline' }}
            >
              Esqueceu a palavra-passe?
            </button>
          </p>
        </form>

        {/* Modal recuperar senha */}
        {mostrarRecuperar && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'grid', placeItems: 'center', zIndex: 100,
          }}>
            <div className="animate-fade" style={{
              background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
              padding: 36, width: '100%', maxWidth: 420,
              boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)',
            }}>
              <h3 style={{ margin: '0 0 6px' }}>Recuperar palavra-passe</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>
                Indique o seu email e receberá um link para redefinir a senha.
              </p>

              {recuperarMsg && (
                <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 14, color: '#166534' }}>
                  {recuperarMsg}
                </div>
              )}
              {recuperarErro && (
                <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 14, color: '#991b1b' }}>
                  {recuperarErro}
                </div>
              )}

              {!recuperarMsg && (
                <form onSubmit={onRecuperar} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <FormField label="Email">
                    <Input
                      type="email"
                      value={emailRecuperar}
                      onChange={(e) => setEmailRecuperar(e.target.value)}
                      placeholder="o-meu-email@escola.ao"
                      required
                      autoFocus
                    />
                  </FormField>
                  <Button type="submit" variant="accent" disabled={recuperarLoading} style={{ width: '100%' }}>
                    {recuperarLoading ? 'A enviar...' : 'Enviar link de recuperação'}
                  </Button>
                </form>
              )}

              <button
                type="button"
                onClick={() => setMostrarRecuperar(false)}
                style={{ marginTop: 16, width: '100%', padding: '10px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', fontSize: 14 }}
              >
                Voltar ao login
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}
