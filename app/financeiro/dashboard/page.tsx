'use client'

import { useEffect, useState } from 'react'
import { dashboardBIAPI, tesourariaAPI, authAPI } from '@/lib/api'
import { StatCard } from '@/components/ui/StatCard'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import Link from 'next/link'
import { kz as Kz } from '@/lib/fmt'

export default function FinanceiroDashboard() {
  const [nome, setNome] = useState('')
  const [financeiro, setFinanceiro] = useState<Awaited<ReturnType<typeof dashboardBIAPI.financeiro>> | null>(null)
  const [caixa, setCaixa] = useState<{ saldo_abertura?: string; total_entradas?: string; total_saidas?: string; estado?: string } | null>(null)
  const [erro, setErro] = useState('')

  useEffect(() => {
    authAPI.me().then((u) => setNome(u.nome_completo)).catch(() => {})
    Promise.all([
      dashboardBIAPI.financeiro(),
      tesourariaAPI.hoje(),
    ])
      .then(([f, c]) => {
        setFinanceiro(f)
        if (c?.aberta) setCaixa(c)
      })
      .catch((e) => setErro(e instanceof Error ? e.message : 'Erro ao carregar'))
  }, [])

  const taxaCobranca = financeiro?.taxa_cobranca ?? 0

  const quickLinks = [
    { label: 'Propinas',          href: '/financeiro/propinas',  color: 'var(--primary)' },
    { label: 'Caixa Diária',      href: '/financeiro/caixa',     color: 'var(--success)' },
    { label: 'Multas',            href: '/financeiro/multas',    color: 'var(--danger)' },
    { label: 'Relatório',         href: '/financeiro/relatorio', color: 'var(--cat-financeiro)' },
    { label: 'Pagamento Aluno',   href: '/aluno/pagamento',      color: 'var(--text-muted)' },
  ]

  return (
    <div className="animate-fade">
      <PageHeader
        title={nome ? `Financeiro — ${nome.split(' ')[0]}` : 'Dashboard Financeiro'}
        subtitle="Gestão financeira, caixa e propinas"
        breadcrumb={['Financeiro', 'Dashboard']}
        accent="var(--cat-financeiro)"
      />

      {erro && <Alert tone="danger">{erro}</Alert>}

      {/* Caixa do Dia */}
      {caixa && (
        <div style={{
          padding: '14px 18px', marginBottom: 20,
          background: caixa.estado === 'ABERTA' ? 'rgba(34,197,94,0.08)' : 'var(--surface-2)',
          border: `1px solid ${caixa.estado === 'ABERTA' ? 'var(--success)' : 'var(--border)'}`,
          borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Caixa de Hoje</div>
            <div style={{ fontSize: 20, fontWeight: 700, marginTop: 2 }}>{Kz(caixa.saldo_abertura ?? '0')} abertura</div>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ textAlign: 'right', fontSize: 13 }}>
              <div style={{ color: 'var(--success)', fontWeight: 700 }}>+{Kz(caixa.total_entradas ?? '0')}</div>
              <div style={{ color: 'var(--danger)', fontWeight: 700 }}>−{Kz(caixa.total_saidas ?? '0')}</div>
            </div>
            <Badge tone={caixa.estado === 'ABERTA' ? 'success' : 'neutral'}>{caixa.estado}</Badge>
          </div>
        </div>
      )}

      {/* KPIs */}
      {financeiro && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
            <StatCard label="Total Esperado"  value={Kz(financeiro.total_esperado)} accent="var(--text-muted)" />
            <StatCard label="Total Recebido"  value={Kz(financeiro.total_recebido)} accent="var(--success)" />
            <StatCard label="Pendente"        value={Kz(financeiro.total_pendente)} accent="var(--warning)" />
            <StatCard label="Vencido"         value={Kz(financeiro.total_vencido)}  accent="var(--danger)" />
          </div>

          <Card title="Taxa de Cobrança" accent="var(--cat-financeiro)" maxWidth={500}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 12 }}>
              <span style={{
                fontSize: 48, fontWeight: 800,
                color: taxaCobranca >= 80 ? 'var(--success)' : taxaCobranca >= 60 ? 'var(--warning)' : 'var(--danger)',
              }}>{taxaCobranca}%</span>
              <div>
                <Badge tone={taxaCobranca >= 80 ? 'success' : taxaCobranca >= 60 ? 'warn' : 'danger'}>
                  {taxaCobranca >= 80 ? 'Excelente' : taxaCobranca >= 60 ? 'Aceitável' : 'Crítico'}
                </Badge>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>Meta: 90%</div>
              </div>
            </div>
            <div style={{ background: 'var(--border)', borderRadius: 8, height: 12, overflow: 'hidden' }}>
              <div style={{
                width: `${Math.min(taxaCobranca, 100)}%`, height: '100%',
                background: taxaCobranca >= 80 ? 'var(--success)' : taxaCobranca >= 60 ? 'var(--warning)' : 'var(--danger)',
                borderRadius: 8, transition: 'width 0.7s ease',
              }} />
            </div>
          </Card>
        </>
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
