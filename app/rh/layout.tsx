// app/rh/layout.tsx
import { DynamicShell } from '@/components/shared/DynamicShell'

export default function RHLayout({ children }: { children: React.ReactNode }) {
  return (
    <DynamicShell
      title="Recursos Humanos"
      fallbackNav={[
        { href: '/rh/funcionarios', label: 'Funcionarios' },
        { href: '/rh/salarios', label: 'Salarios' },
      ]}
    >
      {children}
    </DynamicShell>
  )
}
