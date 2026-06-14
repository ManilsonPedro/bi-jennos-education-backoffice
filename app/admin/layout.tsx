import { DynamicShell } from '@/components/shared/DynamicShell'

const FALLBACK = [
  // ── Início ──────────────────────────────────────────────────────────────
  { href: '/admin/dashboard',         label: 'Dashboard' },
  // ── Académico ────────────────────────────────────────────────────────────
  { href: '/admin/anos-academicos',   label: 'Anos Académicos' },
  { href: '/admin/cursos',            label: 'Cursos' },
  { href: '/admin/classes',           label: 'Classes' },
  { href: '/admin/turmas',            label: 'Turmas' },
  { href: '/admin/alunos',            label: 'Alunos' },
  { href: '/admin/matriculas',        label: 'Matrículas' },
  { href: '/admin/notas',             label: 'Notas' },
  { href: '/admin/pautas',            label: 'Pautas' },
  { href: '/admin/resultados',        label: 'Resultados' },
  { href: '/admin/provas',            label: 'Provas' },
  // ── Horários ─────────────────────────────────────────────────────────────
  { href: '/admin/horarios',          label: 'Horários' },
  { href: '/admin/calendario',        label: 'Calendário' },
  // ── Documentos & Certificados ────────────────────────────────────────────
  { href: '/admin/certificados',      label: 'Certificados' },
  { href: '/admin/documentos',        label: 'Documentos PDF' },
  { href: '/admin/documental',        label: 'Arquivo Documental' },
  // ── Pessoal ──────────────────────────────────────────────────────────────
  { href: '/admin/funcionarios',      label: 'Funcionários' },
  // ── Eventos & Ocorrências ────────────────────────────────────────────────
  { href: '/admin/eventos',           label: 'Eventos' },
  { href: '/admin/ocorrencias',       label: 'Ocorrências' },
  // ── Workflows & Pedidos ──────────────────────────────────────────────────
  { href: '/admin/pedidos-reabertura',label: 'Pedidos de Reabertura' },
  { href: '/admin/workflows',         label: 'Workflows' },
  // ── LMS ─────────────────────────────────────────────────────────────────
  { href: '/admin/lms',               label: 'Plataforma LMS' },
  // ── Controlo de Acesso ───────────────────────────────────────────────────
  { href: '/admin/utilizadores',      label: 'Utilizadores' },
  { href: '/admin/grupos',            label: 'Grupos' },
  { href: '/admin/permissoes',        label: 'Permissões' },
  { href: '/admin/modulos',           label: 'Módulos UI' },
  // ── Análise & Relatórios ─────────────────────────────────────────────────
  { href: '/admin/dashboard-bi',      label: 'Business Intelligence' },
  { href: '/admin/relatorios',        label: 'Relatórios' },
  { href: '/admin/auditoria',         label: 'Auditoria' },
  // ── SaaS ─────────────────────────────────────────────────────────────────
  { href: '/admin/saas',              label: 'Gestão SaaS' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DynamicShell title="Bi.Jennos — Admin" fallbackNav={FALLBACK}>
      {children}
    </DynamicShell>
  )
}
