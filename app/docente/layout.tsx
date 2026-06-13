// app/docente/layout.tsx
import { DynamicShell } from '@/components/shared/DynamicShell'

export default function DocenteLayout({ children }: { children: React.ReactNode }) {
  return (
    <DynamicShell
      title="Docente"
      fallbackNav={[
        { href: '/docente/turmas', label: 'Turmas' },
        { href: '/docente/avaliacoes', label: 'Avaliacoes' },
        { href: '/docente/conteudos', label: 'Conteudos' },
      ]}
    >
      {children}
    </DynamicShell>
  )
}
