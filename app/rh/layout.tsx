import { DynamicShell } from '@/components/shared/DynamicShell'

export default function RHLayout({ children }: { children: React.ReactNode }) {
  return (
    <DynamicShell
      title="Recursos Humanos"
      fallbackNav={[
        { href: '/rh/funcionarios', label: 'Funcionários' },
        { href: '/rh/salarios',     label: 'Salários' },
      ]}
    >
      {children}
    </DynamicShell>
  )
}
