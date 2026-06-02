// app/aluno/layout.tsx
import { AppShell } from '@/components/shared/AppShell'

export default function AlunoLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell title="Portal do Aluno" nav={[{ href: '/aluno/notas', label: 'As minhas notas' }]}>
      {children}
    </AppShell>
  )
}
