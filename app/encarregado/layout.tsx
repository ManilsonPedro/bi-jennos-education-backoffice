import { DynamicShell } from '@/components/shared/DynamicShell'

export default function EncarregadoLayout({ children }: { children: React.ReactNode }) {
  return (
    <DynamicShell
      title="Portal do Encarregado"
      fallbackNav={[
        { href: '/encarregado/dashboard', label: 'Dashboard' },
        { href: '/encarregado/alunos', label: 'Os Meus Educandos' },
        { href: '/encarregado/notas', label: 'Notas' },
        { href: '/encarregado/frequencia', label: 'Frequência' },
        { href: '/encarregado/financeiro', label: 'Financeiro' },
      ]}
    >
      {children}
    </DynamicShell>
  )
}
