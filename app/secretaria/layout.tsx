import { DynamicShell } from '@/components/shared/DynamicShell'

export default function SecretariaLayout({ children }: { children: React.ReactNode }) {
  return (
    <DynamicShell
      title="Secretaria"
      fallbackNav={[
        { href: '/secretaria/dashboard',      label: 'Dashboard' },
        { href: '/secretaria/matriculas',     label: 'Matrículas' },
        { href: '/secretaria/inscricoes',     label: 'Inscrições' },
        { href: '/secretaria/pre-inscricoes', label: 'Pré-Inscrições' },
        { href: '/secretaria/solicitacoes',   label: 'Solicitações' },
      ]}
    >
      {children}
    </DynamicShell>
  )
}
