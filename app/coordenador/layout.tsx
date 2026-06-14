import { DynamicShell } from '@/components/shared/DynamicShell'

export default function CoordenadorLayout({ children }: { children: React.ReactNode }) {
  return (
    <DynamicShell
      title="Coordenação"
      fallbackNav={[
        { href: '/coordenador/dashboard', label: 'Dashboard' },
      ]}
    >
      {children}
    </DynamicShell>
  )
}
