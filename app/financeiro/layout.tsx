// app/financeiro/layout.tsx
import { DynamicShell } from '@/components/shared/DynamicShell'

export default function FinanceiroLayout({ children }: { children: React.ReactNode }) {
  return (
    <DynamicShell
      title="Financeiro"
      fallbackNav={[
        { href: '/financeiro/propinas', label: 'Propinas' },
        { href: '/financeiro/multas', label: 'Multas' },
        { href: '/financeiro/caixa', label: 'Caixa Diaria' },
      ]}
    >
      {children}
    </DynamicShell>
  )
}
