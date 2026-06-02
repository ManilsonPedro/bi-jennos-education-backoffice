// app/secretaria/layout.tsx
import { AppShell } from '@/components/shared/AppShell'

export default function SecretariaLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      title="Secretaria"
      nav={[
        { href: '/secretaria/matriculas', label: 'Matriculas' },
        { href: '/secretaria/pre-inscricoes', label: 'Pedidos (leads)' },
      ]}
    >
      {children}
    </AppShell>
  )
}
