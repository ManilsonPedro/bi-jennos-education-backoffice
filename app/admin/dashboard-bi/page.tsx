'use client'

import { useEffect, useState } from 'react'
import { dashboardBIAPI } from '@/lib/api'
import { StatCard } from '@/components/ui/StatCard'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'

function Bar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
        <span style={{ color: 'var(--text)' }}>{label}</span>
        <span style={{ fontWeight: 700, color: 'var(--text)' }}>{value}</span>
      </div>
      <div style={{ background: 'var(--border)', borderRadius: 6, height: 10, overflow: 'hidden' }}>
        <div style={{
          width: `${pct}%`, height: '100%', background: color,
          borderRadius: 6, transition: 'width 0.7s ease',
        }} />
      </div>
    </div>
  )
}

function Kz(v: string | number) {
  return `Kz ${Number(v).toLocaleString('pt-AO')}`
}

function SectionTitle({ children, accent = 'var(--primary)' }: { children: React.ReactNode; accent?: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      fontSize: 13, fontWeight: 700, textTransform: 'uppercase',
      letterSpacing: '0.08em', color: 'var(--text-muted)',
      borderBottom: '2px solid var(--border)', paddingBottom: 10,
      marginBottom: 16, marginTop: 32,
    }}>
      <span style={{ width: 4, height: 20, background: accent, borderRadius: 2, display: 'inline-block' }} />
      {children}
    </div>
  )
}

export default function DashboardBIPage() {
  const [executivo, setExecutivo] = useState<Awaited<ReturnType<typeof dashboardBIAPI.executivo>> | null>(null)
  const [pedagogico, setPedagogico] = useState<Awaited<ReturnType<typeof dashboardBIAPI.pedagogico>> | null>(null)
  const [financeiro, setFinanceiro] = useState<Awaited<ReturnType<typeof dashboardBIAPI.financeiro>> | null>(null)
  const [rh, setRh] = useState<Awaited<ReturnType<typeof dashboardBIAPI.rh>> | null>(null)
  const [erro, setErro] = useState('')

  useEffect(() => {
    Promise.all([
      dashboardBIAPI.executivo(),
      dashboardBIAPI.pedagogico(),
      dashboardBIAPI.financeiro(),
      dashboardBIAPI.rh(),
    ])
      .then(([e, p, f, r]) => { setExecutivo(e); setPedagogico(p); setFinanceiro(f); setRh(r) })
      .catch((e) => setErro(e instanceof Error ? e.message : 'Erro ao carregar BI'))
  }, [])

  const taxaCobranca = financeiro?.taxa_cobranca ?? 0
  const taxaAprovacao = pedagogico?.taxa_aprovacao ?? 0

  return (
    <div className="animate-fade">
      <PageHeader
        title="Dashboard BI"
        subtitle="Business Intelligence — indicadores executivos da escola"
        breadcrumb={['Dashboard', 'BI Executivo']}
        accent="var(--primary)"
      />

      {erro && <Alert tone="danger">{erro}</Alert>}
      {!executivo && !erro && <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>A carregar indicadores...</p>}

      {/* ── DIRECÇÃO GERAL ─────────────────────────────────── */}
      {executivo && (
        <>
          <SectionTitle accent="var(--primary)">Direcção Geral</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 14 }}>
            <StatCard label="Total de Alunos"      value={executivo.total_alunos}        accent="var(--cat-academico)" />
            <StatCard label="Matrículas Activas"   value={executivo.matriculas_activas}  accent="var(--primary)" />
            <StatCard label="Propinas Pendentes"   value={executivo.propinas_pendentes}  accent={executivo.propinas_pendentes > 20 ? 'var(--danger)' : 'var(--success)'} />
            <StatCard label="Receita Cobrada"      value={Kz(executivo.receita_total)}   accent="var(--success)" />
            <StatCard label="Por Cobrar"           value={Kz(executivo.receita_pendente)} accent="var(--warning)" />
            <StatCard label="Funcionários Activos" value={executivo.funcionarios_activos} accent="var(--cat-rh)" />
          </div>
        </>
      )}

      {/* ── FINANCEIRO ─────────────────────────────────────── */}
      {financeiro && (
        <>
          <SectionTitle accent="var(--cat-financeiro)">Financeiro</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <StatCard label="Total Esperado"  value={Kz(financeiro.total_esperado)} accent="var(--text-muted)" />
              <StatCard label="Total Recebido"  value={Kz(financeiro.total_recebido)} accent="var(--success)" />
              <StatCard label="Total Pendente"  value={Kz(financeiro.total_pendente)} accent="var(--warning)" />
              <StatCard label="Total Vencido"   value={Kz(financeiro.total_vencido)}  accent="var(--danger)" />
            </div>
            <Card title="Taxa de Cobrança" accent="var(--cat-financeiro)">
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <span style={{
                  fontSize: 52, fontWeight: 800,
                  color: taxaCobranca >= 80 ? 'var(--success)' : taxaCobranca >= 60 ? 'var(--warning)' : 'var(--danger)',
                }}>
                  {taxaCobranca}%
                </span>
                <div style={{ marginTop: 4 }}>
                  <Badge tone={taxaCobranca >= 80 ? 'success' : taxaCobranca >= 60 ? 'warn' : 'danger'}>
                    {taxaCobranca >= 80 ? 'Excelente' : taxaCobranca >= 60 ? 'Aceitável' : 'Crítico'}
                  </Badge>
                </div>
              </div>
              <div style={{ background: 'var(--border)', borderRadius: 8, height: 14, overflow: 'hidden' }}>
                <div style={{
                  width: `${Math.min(taxaCobranca, 100)}%`, height: '100%',
                  background: taxaCobranca >= 80 ? 'var(--success)' : taxaCobranca >= 60 ? 'var(--warning)' : 'var(--danger)',
                  borderRadius: 8, transition: 'width 0.7s ease',
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
                <span>0%</span><span>Meta: 90%</span><span>100%</span>
              </div>
            </Card>
          </div>
        </>
      )}

      {/* ── PEDAGÓGICO ─────────────────────────────────────── */}
      {pedagogico && (
        <>
          <SectionTitle accent="var(--cat-academico)">Direcção Pedagógica</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Card title="Resultados Escolares" accent="var(--cat-academico)">
              <Bar label="Total Avaliados"  value={pedagogico.total_avaliados} max={pedagogico.total_avaliados} color="var(--primary)" />
              <Bar label="Aprovados"        value={pedagogico.aprovados}       max={pedagogico.total_avaliados} color="var(--success)" />
              <Bar label="Reprovados"       value={pedagogico.reprovados}      max={pedagogico.total_avaliados} color="var(--danger)" />
            </Card>
            <Card title="Taxas de Desempenho" accent="var(--cat-academico)">
              <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <span style={{
                  fontSize: 52, fontWeight: 800,
                  color: taxaAprovacao >= 70 ? 'var(--success)' : taxaAprovacao >= 50 ? 'var(--warning)' : 'var(--danger)',
                }}>
                  {taxaAprovacao}%
                </span>
                <div style={{ marginTop: 4, marginBottom: 16 }}>
                  <Badge tone={taxaAprovacao >= 70 ? 'success' : taxaAprovacao >= 50 ? 'warn' : 'danger'}>
                    Taxa de Aprovação
                  </Badge>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <StatCard label="Aprovados"  value={`${pedagogico.taxa_aprovacao}%`}  accent="var(--success)" />
                <StatCard label="Reprovados" value={`${pedagogico.taxa_reprovacao}%`} accent="var(--danger)" />
              </div>
              {pedagogico.media_geral && (
                <div style={{ marginTop: 12, textAlign: 'center', padding: 12, background: 'var(--surface-2)', borderRadius: 'var(--radius)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Média Geral</div>
                  <div style={{ fontSize: 28, fontWeight: 700, marginTop: 4 }}>{Number(pedagogico.media_geral).toFixed(1)} <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>val</span></div>
                </div>
              )}
            </Card>
          </div>
        </>
      )}

      {/* ── RECURSOS HUMANOS ───────────────────────────────── */}
      {rh && (
        <>
          <SectionTitle accent="var(--cat-rh)">Recursos Humanos</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
            <StatCard label="Funcionários Activos"  value={rh.funcionarios_activos}                          accent="var(--cat-rh)" />
            <StatCard label="Custo Salarial Base"   value={Kz(rh.custo_salarial_base)}                       accent="var(--cat-financeiro)" />
            <StatCard label="Contratos a Expirar"   value={rh.contratos_a_expirar}
              hint={rh.contratos_a_expirar > 0 ? 'Renovação necessária' : 'Tudo em ordem'}
              accent={rh.contratos_a_expirar > 0 ? 'var(--warning)' : 'var(--success)'}
            />
          </div>
        </>
      )}
    </div>
  )
}
