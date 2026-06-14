import { DynamicShell } from '@/components/shared/DynamicShell'

export default function FinanceiroLayout({ children }: { children: React.ReactNode }) {
  return (
    <DynamicShell
      title="Financeiro"
      fallbackNav={[
        { href: '/financeiro/dashboard', label: 'Dashboard' },
        { href: '/financeiro/propinas',  label: 'Propinas' },
        { href: '/financeiro/multas',    label: 'Multas' },
        { href: '/financeiro/caixa',     label: 'Caixa Diária' },
        { href: '/financeiro/relatorio', label: 'Relatório' },
      ]}
    >
      {children}
    </DynamicShell>
  )
}
