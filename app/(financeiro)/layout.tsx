// app/(financeiro)/layout.tsx
import { AppShell } from '@/components/shared/AppShell'

export default function FinanceiroLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      title="Financeiro"
      nav={[{ href: '/propinas', label: 'Propinas' }]}
    >
      {children}
    </AppShell>
  )
}
