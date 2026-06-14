// app/dashboard/page.tsx
// Esta pagina e interceptada pelo middleware que redireciona para o dashboard do perfil.
// Se o utilizador chegar aqui, e porque o middleware nao reconheceu o role.
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Fallback: se o middleware nao redirecionou, tentar /login
    router.replace('/login')
  }, [router])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: 16,
      color: 'var(--text-muted)',
    }}>
      <div style={{
        width: 40,
        height: 40,
        border: '3px solid var(--border)',
        borderTop: '3px solid var(--primary)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <p style={{ margin: 0, fontSize: 14 }}>A redirecionar...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
