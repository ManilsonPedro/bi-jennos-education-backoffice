// app/dashboard/layout.tsx
import { DynamicShell } from '@/components/shared/DynamicShell'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DynamicShell title="Bi Jennos Investiment" fallbackNav={[{ href: '/dashboard', label: 'Início' }]}>
      {children}
    </DynamicShell>
  )
}
