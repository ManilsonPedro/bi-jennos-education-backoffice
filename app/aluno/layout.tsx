// app/aluno/layout.tsx
import { DynamicShell } from '@/components/shared/DynamicShell'

export default function AlunoLayout({ children }: { children: React.ReactNode }) {
  return (
    <DynamicShell
      title="Portal do Aluno"
      fallbackNav={[
      { href: '/aluno/perfil', label: 'Perfil' },
      { href: '/aluno/notas', label: 'Notas' },
      { href: '/aluno/historico', label: 'Histórico' },
      { href: '/aluno/frequencia', label: 'Frequência' },
      { href: '/aluno/horario', label: 'Horário' },
      { href: '/aluno/calendario', label: 'Calendário' },
      { href: '/aluno/solicitacoes', label: 'Solicitações' },
      { href: '/aluno/downloads', label: 'Downloads' },
    ]}
    >
      {children}
    </DynamicShell>
  )
}
