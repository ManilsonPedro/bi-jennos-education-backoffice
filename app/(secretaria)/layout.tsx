// app/(secretaria)/layout.tsx
import { AppShell } from '@/components/shared/AppShell'

export default function SecretariaLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      title="Secretaria"
      nav={[{ href: '/matriculas', label: 'Matriculas' }]}
    >
      {children}
    </AppShell>
  )
}
