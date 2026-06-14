'use client'

import { useEffect, useState } from 'react'
import { dashboardAPI, type DashboardResumo } from '@/lib/api'
import { StatCard } from '@/components/ui/StatCard'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { Alert } from '@/components/ui/Alert'
import { kz } from '@/lib/fmt'

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0
  return (
    <div style={{ background: 'var(--border)', borderRadius: 8, height: 8, overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 8, transition: 'width 0.6s ease' }} />
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
      letterSpacing: '0.1em', color: 'var(--text-muted)',
      borderBottom: '1px solid var(--border)', paddingBottom: 8, marginBottom: 16, marginTop: 32,
    }}>{children}</div>
  )
}

export default function DashboardPage() {
  const [resumo, setResumo] = useState<DashboardResumo | null>(null)
  const [erro, setErro] = useState('')

  useEffect(() => {
    dashboardAPI.resumo()
      .then(setResumo)
      .catch((e) => setErro(e instanceof Error ? e.message : 'Erro ao carregar'))
  }, [])

  const totalRecebido = resumo ? Number(resumo.total_recebido) : 0
  const propinas = resumo?.propinas_pendentes ?? 0

  return (
    <div className="animate-fade">
      <PageHeader
        title="Dashboard"
        subtitle="Visão geral da escola em tempo real"
        breadcrumb={['Bi Jennos', 'Dashboard']}
        accent="var(--primary)"
      />

      {erro && <Alert tone="danger">{erro}</Alert>}

      {!resumo && !erro && (
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>A carregar indicadores...</p>
      )}

      {resumo && (
        <>
          <SectionTitle>Indicadores Gerais</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <StatCard
              label="Total de Alunos"
              value={resumo.total_alunos}
              hint="Alunos registados"
              accent="var(--cat-academico)"
            />
            <StatCard
              label="Turmas Activas"
              value={resumo.total_turmas}
              hint="Turmas em funcionamento"
              accent="var(--cat-academico)"
            />
            <StatCard
              label="Matrículas Activas"
              value={resumo.matriculas_activas}
              hint="Matrículas confirmadas"
              accent="var(--primary)"
            />
            <StatCard
              label="Certificados Emitidos"
              value={resumo.certificados_gerados}
              hint="Total de certificados"
              accent="var(--cat-rh)"
            />
          </div>

          <SectionTitle>Situação Financeira</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
            <StatCard
              label="Total Cobrado"
              value={kz(totalRecebido)}
              hint="Propinas recebidas"
              accent="var(--success)"
            />
            <StatCard
              label="Propinas Pendentes"
              value={propinas}
              hint={propinas > 0 ? 'Requerem atenção' : 'Tudo em dia'}
              accent={propinas > 20 ? 'var(--danger)' : propinas > 5 ? 'var(--warning)' : 'var(--success)'}
            />
          </div>

          <Card title="Taxa de Cobrança" subtitle="Progresso das propinas pagas vs pendentes" maxWidth={640}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <ProgressBar
                  value={resumo.matriculas_activas - propinas}
                  max={resumo.matriculas_activas}
                  color={propinas > 20 ? 'var(--danger)' : propinas > 5 ? 'var(--warning)' : 'var(--success)'}
                />
              </div>
              <span style={{ fontWeight: 700, fontSize: 18, minWidth: 48, textAlign: 'right' }}>
                {resumo.matriculas_activas > 0
                  ? `${Math.round(((resumo.matriculas_activas - propinas) / resumo.matriculas_activas) * 100)}%`
                  : '—'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 24, fontSize: 12, color: 'var(--text-muted)' }}>
              <span>✅ Pagos: {resumo.matriculas_activas - propinas}</span>
              <span>⏳ Pendentes: {propinas}</span>
              <span>📊 Total: {resumo.matriculas_activas}</span>
            </div>
          </Card>

          <SectionTitle>Acesso Rápido</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
            {[
              { label: 'Novo Aluno', href: '/admin/alunos/novo', color: 'var(--cat-academico)' },
              { label: 'Nova Inscrição', href: '/secretaria/inscricoes', color: 'var(--cat-secretaria)' },
              { label: 'Caixa Diária', href: '/financeiro/caixa', color: 'var(--cat-financeiro)' },
              { label: 'Lançar Notas', href: '/docente/avaliacoes', color: 'var(--cat-academico)' },
              { label: 'Emitir Pauta', href: '/admin/pautas', color: 'var(--primary)' },
              { label: 'Auditoria', href: '/admin/auditoria', color: 'var(--text-muted)' },
            ].map((a) => (
              <a
                key={a.href}
                href={a.href}
                style={{
                  display: 'block', padding: '14px 16px',
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderLeft: `4px solid ${a.color}`,
                  borderRadius: 'var(--radius)', fontSize: 13, fontWeight: 600,
                  color: 'var(--text)', textDecoration: 'none',
                  transition: 'box-shadow 0.15s',
                }}
              >
                {a.label}
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
