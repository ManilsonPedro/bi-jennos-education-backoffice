'use client'

import { useEffect, useState } from 'react'
import { fetchAPI } from '@/lib/api'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatCard } from '@/components/ui/StatCard'
import { Card } from '@/components/ui/Card'

interface DashboardExecutivo {
  total_alunos: number
  matriculas_activas: number
  propinas_pendentes: number
  receita_total: string
  receita_pendente: string
  funcionarios_activos: number
}

interface DashboardPedagogico {
  total_avaliados: number
  aprovados: number
  reprovados: number
  taxa_aprovacao: number
  taxa_reprovacao: number
  media_geral: string | null
}

interface DashboardFinanceiro {
  total_esperado: string
  total_recebido: string
  total_pendente: string
  total_vencido: string
  taxa_cobranca: number
}

export default function DashboardBIPage() {
  const [executivo, setExecutivo] = useState<DashboardExecutivo | null>(null)
  const [pedagogico, setPedagogico] = useState<DashboardPedagogico | null>(null)
  const [financeiro, setFinanceiro] = useState<DashboardFinanceiro | null>(null)
  const [erro, setErro] = useState('')

  useEffect(() => {
    Promise.all([
      fetchAPI<DashboardExecutivo>('/dashboard/executivo'),
      fetchAPI<DashboardPedagogico>('/dashboard/pedagogico'),
      fetchAPI<DashboardFinanceiro>('/dashboard/financeiro'),
    ])
      .then(([e, p, f]) => { setExecutivo(e); setPedagogico(p); setFinanceiro(f) })
      .catch((e) => setErro(e instanceof Error ? e.message : 'Erro ao carregar BI'))
  }, [])

  return (
    <div>
      <PageHeader title="Dashboard Executivo" subtitle="Indicadores de gestão da escola" />
      {erro && <p style={{ color: 'var(--danger)' }}>{erro}</p>}

      {executivo && (
        <>
          <h2 style={{ color: 'var(--primary)', marginTop: 24 }}>Direção Geral</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
            <StatCard label="Total de Alunos" value={executivo.total_alunos} />
            <StatCard label="Matrículas Activas" value={executivo.matriculas_activas} />
            <StatCard label="Propinas Pendentes" value={executivo.propinas_pendentes} />
            <StatCard label="Receita Cobrada" value={`Kz ${Number(executivo.receita_total).toLocaleString()}`} />
            <StatCard label="Por Cobrar" value={`Kz ${Number(executivo.receita_pendente).toLocaleString()}`} />
            <StatCard label="Funcionários" value={executivo.funcionarios_activos} />
          </div>
        </>
      )}

      {pedagogico && (
        <>
          <h2 style={{ color: 'var(--primary)' }}>Direção Pedagógica</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
            <StatCard label="Avaliados" value={pedagogico.total_avaliados} />
            <StatCard label="Aprovados" value={pedagogico.aprovados} />
            <StatCard label="Reprovados" value={pedagogico.reprovados} />
            <StatCard label="Taxa de Aprovação" value={`${pedagogico.taxa_aprovacao}%`} />
            <StatCard label="Taxa de Reprovação" value={`${pedagogico.taxa_reprovacao}%`} />
            <StatCard label="Média Geral" value={pedagogico.media_geral ? `${pedagogico.media_geral} val` : '—'} />
          </div>
        </>
      )}

      {financeiro && (
        <>
          <h2 style={{ color: 'var(--primary)' }}>Financeiro</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
            <StatCard label="Total Esperado" value={`Kz ${Number(financeiro.total_esperado).toLocaleString()}`} />
            <StatCard label="Total Recebido" value={`Kz ${Number(financeiro.total_recebido).toLocaleString()}`} />
            <StatCard label="Total Pendente" value={`Kz ${Number(financeiro.total_pendente).toLocaleString()}`} />
            <StatCard label="Total Vencido" value={`Kz ${Number(financeiro.total_vencido).toLocaleString()}`} />
            <StatCard label="Taxa de Cobrança" value={`${financeiro.taxa_cobranca}%`} />
          </div>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ marginBottom: 6, fontSize: 13, color: '#666' }}>Progresso de Cobrança</div>
                <div style={{ background: '#f0f0f0', borderRadius: 10, height: 16, overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${Math.min(financeiro.taxa_cobranca, 100)}%`,
                      height: '100%',
                      background: financeiro.taxa_cobranca >= 80 ? '#22c55e' : financeiro.taxa_cobranca >= 60 ? '#f59e0b' : '#ef4444',
                      borderRadius: 10,
                      transition: 'width 0.5s ease',
                    }}
                  />
                </div>
              </div>
              <span style={{ fontWeight: 700, fontSize: 20 }}>{financeiro.taxa_cobranca}%</span>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
