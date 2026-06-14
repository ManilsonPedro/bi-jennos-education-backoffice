import { DynamicShell } from '@/components/shared/DynamicShell'

export default function DocenteLayout({ children }: { children: React.ReactNode }) {
  return (
    <DynamicShell
      title="Portal do Docente"
      fallbackNav={[
        { href: '/docente/dashboard',   label: 'Dashboard' },
        { href: '/docente/turmas',      label: 'Minhas Turmas' },
        { href: '/docente/avaliacoes',  label: 'Avaliações' },
        { href: '/docente/frequencia',  label: 'Frequência' },
        { href: '/docente/conteudos',   label: 'Conteúdos' },
        { href: '/docente/plano-aula',  label: 'Plano de Aula' },
        { href: '/docente/diario',      label: 'Diário de Aula' },
      ]}
    >
      {children}
    </DynamicShell>
  )
}
