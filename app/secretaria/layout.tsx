// app/secretaria/layout.tsx
import { DynamicShell } from '@/components/shared/DynamicShell'

export default function SecretariaLayout({ children }: { children: React.ReactNode }) {
  return (
    <DynamicShell
      title="Secretaria"
      fallbackNav={[
        { href: '/secretaria/matriculas', label: 'Matriculas' },
        { href: '/secretaria/pre-inscricoes', label: 'Pedidos (leads)' },
      ]}
    >
      {children}
    </DynamicShell>
  )
}
