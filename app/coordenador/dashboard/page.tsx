'use client'

import { useEffect, useState } from 'react'
import { dashboardBIAPI, authAPI } from '@/lib/api'
import { StatCard } from '@/components/ui/StatCard'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import Link from 'next/link'

function Bar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
        <span style={{ color: 'var(--text)' }}>{label}</span>
        <span style={{ fontWeight: 700 }}>{value} <span style={{ color: 'var(--text-muted)' }}>/ {max}</span></span>
      </div>
      <div style={{ background: 'var(--border)', borderRadius: 4, height: 8, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.6s ease' }} />
      </div>
    </div>
  )
}

export default function CoordenadorDashboard() {
  const [nome, setNome] = useState('')
  const [pedagogico, setPedagogico] = useState<Awaited<ReturnType<typeof dashboardBIAPI.pedagogico>> | null>(null)
  const [executivo, setExecutivo] = useState<Awaited<ReturnType<typeof dashboardBIAPI.executivo>> | null>(null)
  const [erro, setErro] = useState('')

  useEffect(() => {
    authAPI.me().then((u: { nome_completo: string }) => setNome(u.nome_completo)).catch(() => {})
    Promise.all([
      dashboardBIAPI.pedagogico(),
      dashboardBIAPI.executivo(),
    ])
      .then(([p, e]) => { setPedagogico(p); setExecutivo(e) })
      .catch((err) => setErro(err instanceof Error ? err.message : 'Erro ao carregar'))
  }, [])

  const taxaAprovacao = pedagogico?.taxa_aprovacao ?? 0

  const quickLinks = [
    { label: 'Turmas',         href: '/admin/turmas',     color: 'var(--cat-academico)' },
    { label: 'Horários',       href: '/admin/horarios',   color: 'var(--primary)' },
    { label: 'Pautas',         href: '/admin/pautas',     color: 'var(--cat-rh)' },
    { label: 'Resultados',     href: '/admin/resultados', color: 'var(--success)' },
    { label: 'Calendário',     href: '/admin/calendario', color: 'var(--cat-financeiro)' },
    { label: 'Conteúdos',      href: '/docente/conteudos',color: 'var(--text-muted)' },
  ]

  return (
    <div className="animate-fade">
      <PageHeader
        title={nome ? `Coordenação — ${nome.split(' ').slice(0, 2).join(' ')}` : 'Dashboard Coordenador'}
        subtitle="Supervisão pedagógica e acompanhamento de turmas"
        breadcrumb={['Coordenação', 'Dashboard']}
        accent="var(--primary)"
      />

      {erro && <Alert tone="danger">{erro}</Alert>}

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
        {executivo && (
          <>
            <StatCard label="Total de Alunos"    value={executivo.total_alunos}       accent="var(--cat-academico)" />
            <StatCard label="Matrículas Activas"  value={executivo.matriculas_activas} accent="var(--primary)" />
          </>
        )}
        {pedagogico && (
          <>
            <StatCard label="Taxa de Aprovação"
              value={`${taxaAprovacao}%`}
              accent={taxaAprovacao >= 70 ? 'var(--success)' : taxaAprovacao >= 50 ? 'var(--warning)' : 'var(--danger)'}
              hint={taxaAprovacao >= 70 ? 'Bom desempenho' : 'Requer atenção'}
            />
            <StatCard label="Média Geral"
              value={pedagogico.media_geral ? `${Number(pedagogico.media_geral).toFixed(1)} val` : '—'}
              accent="var(--cat-rh)"
            />
          </>
        )}
      </div>

      {pedagogico && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Aprovação vs Reprovação */}
          <Card title="Resultados Escolares" accent="var(--cat-academico)">
            <Bar label="Avaliados"  value={pedagogico.total_avaliados} max={pedagogico.total_avaliados} color="var(--primary)" />
            <Bar label="Aprovados"  value={pedagogico.aprovados}       max={pedagogico.total_avaliados} color="var(--success)" />
            <Bar label="Reprovados" value={pedagogico.reprovados}      max={pedagogico.total_avaliados} color="var(--danger)" />
            <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
              <div style={{ flex: 1, padding: 12, background: 'rgba(34,197,94,0.08)', borderRadius: 'var(--radius)', textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--success)' }}>{taxaAprovacao}%</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Aprovação</div>
              </div>
              <div style={{ flex: 1, padding: 12, background: 'rgba(220,38,38,0.08)', borderRadius: 'var(--radius)', textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--danger)' }}>{pedagogico.taxa_reprovacao}%</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Reprovação</div>
              </div>
            </div>
          </Card>

          {/* Estado Geral */}
          <Card title="Indicadores Pedagógicos" accent="var(--primary)">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ padding: 14, background: 'var(--surface-2)', borderRadius: 'var(--radius)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Média Geral da Escola</div>
                <div style={{ fontSize: 32, fontWeight: 800, marginTop: 4 }}>
                  {pedagogico.media_geral ? Number(pedagogico.media_geral).toFixed(1) : '—'}
                  <span style={{ fontSize: 14, color: 'var(--text-muted)', marginLeft: 6 }}>valores</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <Badge tone={taxaAprovacao >= 70 ? 'success' : taxaAprovacao >= 50 ? 'warn' : 'danger'}>
                    {taxaAprovacao >= 70 ? 'Desempenho Satisfatório' : taxaAprovacao >= 50 ? 'Atenção Necessária' : 'Situação Crítica'}
                  </Badge>
                </div>
              </div>
              <Link href="/admin/resultados" style={{
                display: 'block', padding: '10px 14px', textAlign: 'center',
                background: 'var(--primary)', color: '#fff', borderRadius: 'var(--radius)',
                fontSize: 13, fontWeight: 600, textDecoration: 'none',
              }}>Ver Resultados Detalhados</Link>
            </div>
          </Card>
        </div>
      )}

      {/* Acesso Rápido */}
      <div style={{ marginTop: 24 }}>
        <div style={{
          fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
          color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', paddingBottom: 8, marginBottom: 14,
        }}>Acesso Rápido</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
          {quickLinks.map((l) => (
            <Link key={l.href} href={l.href} style={{
              display: 'block', padding: '12px 16px',
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderLeft: `4px solid ${l.color}`,
              borderRadius: 'var(--radius)', fontSize: 13, fontWeight: 600,
              color: 'var(--text)', textDecoration: 'none',
            }}>{l.label}</Link>
          ))}
        </div>
      </div>
    </div>
  )
}
