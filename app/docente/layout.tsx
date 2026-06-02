// app/docente/layout.tsx
import { AppShell } from '@/components/shared/AppShell'

export default function DocenteLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      title="Docente"
      nav={[
        { href: '/docente/turmas', label: 'Turmas' },
        { href: '/docente/avaliacoes', label: 'Avaliacoes' },
      ]}
    >
      {children}
    </AppShell>
  )
}
