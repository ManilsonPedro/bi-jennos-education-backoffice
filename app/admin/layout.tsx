// app/admin/layout.tsx
import { DynamicShell } from '@/components/shared/DynamicShell'

const FALLBACK = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/alunos', label: 'Alunos' },
  { href: '/admin/turmas', label: 'Turmas' },
  { href: '/admin/certificados', label: 'Certificados' },
  { href: '/admin/calendario', label: 'Calendario' },
  { href: '/admin/horarios', label: 'Horarios' },
  { href: '/admin/pautas', label: 'Pautas' },
  { href: '/admin/resultados', label: 'Resultados' },
  { href: '/admin/grupos', label: 'Grupos' },
  { href: '/admin/permissoes', label: 'Permissoes' },
  { href: '/admin/auditoria', label: 'Auditoria' },
  { href: '/admin/relatorios', label: 'Relatorios' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DynamicShell title="Bi.Jennos" fallbackNav={FALLBACK}>
      {children}
    </DynamicShell>
  )
}
