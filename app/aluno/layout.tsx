import { DynamicShell } from '@/components/shared/DynamicShell'

export default function AlunoLayout({ children }: { children: React.ReactNode }) {
  return (
    <DynamicShell
      title="Portal do Aluno"
      fallbackNav={[
        { href: '/aluno/dashboard',    label: 'Início' },
        { href: '/aluno/perfil',       label: 'Perfil' },
        { href: '/aluno/notas',        label: 'Notas' },
        { href: '/aluno/historico',    label: 'Histórico' },
        { href: '/aluno/frequencia',   label: 'Frequência' },
        { href: '/aluno/horario',      label: 'Horário' },
        { href: '/aluno/calendario',   label: 'Calendário' },
        { href: '/aluno/solicitacoes', label: 'Solicitações' },
        { href: '/aluno/pagamento',    label: 'Pagamentos' },
        { href: '/aluno/downloads',    label: 'Downloads' },
      ]}
    >
      {children}
    </DynamicShell>
  )
}
