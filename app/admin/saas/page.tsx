'use client'

import { useEffect, useState } from 'react'
import { fetchAPI } from '@/lib/api'
import { PageHeader } from '@/components/ui/PageHeader'
import { kz } from '@/lib/fmt'
import { StatCard } from '@/components/ui/StatCard'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

interface DashboardSaas {
  total_schools: number
  schools_activas: number
  assinaturas_activas: number
  receita_total: string
}

interface School {
  id: string
  nome: string
  codigo: string
  is_activa: string
  tenant_id: string
}

interface Plan {
  id: string
  nome: string
  tipo: string
  preco_mensal: string
  max_alunos: number | null
  max_utilizadores: number | null
}

interface Subscription {
  id: string
  school_id: string
  plan_id: string
  estado: string
  data_inicio: string
  data_fim: string | null
}

const SCHOOL_COLS: Column<School>[] = [
  { key: 'nome', label: 'Escola' },
  { key: 'codigo', label: 'Código' },
  {
    key: 'is_activa', label: 'Estado',
    render: (r) => (
      <Badge tone={r.is_activa === 'S' ? 'success' : 'danger'}>
        {r.is_activa === 'S' ? 'Activa' : 'Inactiva'}
      </Badge>
    )
  },
  { key: 'tenant_id', label: 'Tenant ID', render: (r) => r.tenant_id.slice(0, 8) + '...' },
]

const PLAN_COLS: Column<Plan>[] = [
  { key: 'nome', label: 'Plano' },
  {
    key: 'tipo', label: 'Tipo',
    render: (r) => {
      const tone = r.tipo === 'enterprise' ? 'accent' : r.tipo === 'business' ? 'info' : 'neutral'
      return <Badge tone={tone}>{r.tipo}</Badge>
    }
  },
  { key: 'preco_mensal', label: 'Preço/mês', render: (r) => kz(r.preco_mensal) },
  { key: 'max_alunos', label: 'Max Alunos', render: (r) => r.max_alunos ? String(r.max_alunos) : 'Ilimitado' },
  { key: 'max_utilizadores', label: 'Max Users', render: (r) => r.max_utilizadores ? String(r.max_utilizadores) : 'Ilimitado' },
]

const ESTADO_TONE: Record<string, 'success' | 'warn' | 'danger' | 'info'> = {
  activa: 'success', trial: 'info', suspensa: 'warn', cancelada: 'danger', expirada: 'danger',
}

export default function SaaSPage() {
  const [tab, setTab] = useState<'escolas' | 'planos' | 'assinaturas'>('escolas')
  const [dashboard, setDashboard] = useState<DashboardSaas | null>(null)
  const [schools, setSchools] = useState<School[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState('')

  // Escola form
  const [mostrarNovaEscola, setMostrarNovaEscola] = useState(false)
  const [nomeEscola, setNomeEscola] = useState('')
  const [codigoEscola, setCodigoEscola] = useState('')
  const [emailEscola, setEmailEscola] = useState('')
  const [criandoEscola, setCriandoEscola] = useState(false)

  // Assinatura form
  const [mostrarNovaAssinatura, setMostrarNovaAssinatura] = useState(false)
  const [schoolSel, setSchoolSel] = useState('')
  const [planSel, setPlanSel] = useState('')
  const [dataInicio, setDataInicio] = useState(new Date().toISOString().split('T')[0])
  const [criandoAssinatura, setCriandoAssinatura] = useState(false)

  const carregar = () => {
    fetchAPI<DashboardSaas>('/saas/dashboard').then(setDashboard).catch(() => {})
    fetchAPI<School[]>('/saas/schools').then(setSchools).catch(() => {})
    fetchAPI<Plan[]>('/saas/plans').then(setPlans).catch(() => {})
    fetchAPI<Subscription[]>('/saas/subscriptions').then(setSubscriptions).catch(() => {})
  }

  useEffect(() => { carregar() }, [])

  const criarEscola = async () => {
    if (!nomeEscola || !codigoEscola) return
    setCriandoEscola(true)
    setErro('')
    try {
      await fetchAPI('/saas/schools', {
        method: 'POST',
        body: JSON.stringify({ nome: nomeEscola, codigo: codigoEscola, email_contacto: emailEscola || null }),
      })
      setMensagem('Escola registada com sucesso!')
      setMostrarNovaEscola(false)
      setNomeEscola(''); setCodigoEscola(''); setEmailEscola('')
      carregar()
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao criar escola')
    } finally {
      setCriandoEscola(false)
    }
  }

  const criarAssinatura = async () => {
    if (!schoolSel || !planSel) return
    setCriandoAssinatura(true)
    setErro('')
    try {
      await fetchAPI('/saas/subscriptions', {
        method: 'POST',
        body: JSON.stringify({ school_id: schoolSel, plan_id: planSel, data_inicio: dataInicio }),
      })
      setMensagem('Assinatura criada com sucesso!')
      setMostrarNovaAssinatura(false)
      setSchoolSel(''); setPlanSel('')
      carregar()
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao criar assinatura')
    } finally {
      setCriandoAssinatura(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: 8,
    border: '1px solid var(--border-strong)', fontSize: 14,
    background: 'var(--input-bg)', color: 'var(--text)', boxSizing: 'border-box' as const,
  }

  const tabStyle = (active: boolean) => ({
    padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
    fontSize: 14, fontWeight: 600,
    background: active ? 'var(--primary)' : 'var(--surface-raised)',
    color: active ? '#fff' : 'var(--text)',
  })

  return (
    <div className="animate-fade">
      <PageHeader
        title="Super Admin — SaaS Multi-Escola"
        subtitle="Gestao global de escolas, planos e assinaturas"
        breadcrumb={['Admin', 'SaaS']}
        accent="var(--cat-admin)"
      />

      {mensagem && <Alert tone="success">{mensagem}</Alert>}
      {erro && <Alert tone="danger">{erro}</Alert>}

      {/* KPI Cards */}
      {dashboard && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
          <StatCard label="Total Escolas" value={dashboard.total_schools} />
          <StatCard label="Escolas Activas" value={dashboard.schools_activas} />
          <StatCard label="Assinaturas Activas" value={dashboard.assinaturas_activas} />
          <StatCard label="Receita Total" value={kz(dashboard.receita_total)} />
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button style={tabStyle(tab === 'escolas')} onClick={() => setTab('escolas')}>Escolas</button>
        <button style={tabStyle(tab === 'planos')} onClick={() => setTab('planos')}>Planos</button>
        <button style={tabStyle(tab === 'assinaturas')} onClick={() => setTab('assinaturas')}>Assinaturas</button>
      </div>

      {/* ── ESCOLAS ── */}
      {tab === 'escolas' && (
        <>
          <div style={{ marginBottom: 16 }}>
            <Button onClick={() => setMostrarNovaEscola(!mostrarNovaEscola)}>+ Nova Escola</Button>
          </div>

          {mostrarNovaEscola && (
            <Card title="Registar Nova Escola" maxWidth={560} style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                    Nome da Escola *
                  </label>
                  <input value={nomeEscola} onChange={(e) => setNomeEscola(e.target.value)}
                    placeholder="Ex: Colegio Sagrada Familia" style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                    Codigo Unico *
                  </label>
                  <input value={codigoEscola} onChange={(e) => setCodigoEscola(e.target.value.toUpperCase())}
                    placeholder="Ex: CSF-2025" style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                    Email de Contacto
                  </label>
                  <input value={emailEscola} onChange={(e) => setEmailEscola(e.target.value)}
                    type="email" placeholder="admin@escola.ao" style={inputStyle} />
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button onClick={() => setMostrarNovaEscola(false)}
                    style={{ padding: '10px 18px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', fontSize: 14 }}>
                    Cancelar
                  </button>
                  <button onClick={criarEscola} disabled={criandoEscola || !nomeEscola || !codigoEscola}
                    style={{ padding: '10px 22px', borderRadius: 8, border: 'none', background: 'var(--primary)', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600, opacity: criandoEscola ? 0.7 : 1 }}>
                    {criandoEscola ? 'A criar...' : 'Criar Escola'}
                  </button>
                </div>
              </div>
            </Card>
          )}

          <DataTable columns={SCHOOL_COLS} rows={schools} emptyMessage="Sem escolas registadas." />
        </>
      )}

      {/* ── PLANOS ── */}
      {tab === 'planos' && (
        <>
          <Card title="Planos Disponíveis" subtitle="Planos SaaS configurados no sistema">
            <DataTable columns={PLAN_COLS} rows={plans} emptyMessage="Sem planos configurados." />
          </Card>
        </>
      )}

      {/* ── ASSINATURAS ── */}
      {tab === 'assinaturas' && (
        <>
          <div style={{ marginBottom: 16 }}>
            <Button onClick={() => setMostrarNovaAssinatura(!mostrarNovaAssinatura)}>+ Nova Assinatura</Button>
          </div>

          {mostrarNovaAssinatura && (
            <Card title="Criar Assinatura" maxWidth={480} style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                    Escola *
                  </label>
                  <select value={schoolSel} onChange={(e) => setSchoolSel(e.target.value)} style={inputStyle}>
                    <option value="">Seleccione uma escola...</option>
                    {schools.map((s) => (
                      <option key={s.id} value={s.id}>{s.nome} ({s.codigo})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                    Plano *
                  </label>
                  <select value={planSel} onChange={(e) => setPlanSel(e.target.value)} style={inputStyle}>
                    <option value="">Seleccione um plano...</option>
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>{p.nome} — {kz(p.preco_mensal)}/mês</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                    Data de Inicio *
                  </label>
                  <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} style={inputStyle} />
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button onClick={() => setMostrarNovaAssinatura(false)}
                    style={{ padding: '10px 18px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', fontSize: 14 }}>
                    Cancelar
                  </button>
                  <button onClick={criarAssinatura} disabled={criandoAssinatura || !schoolSel || !planSel}
                    style={{ padding: '10px 22px', borderRadius: 8, border: 'none', background: 'var(--primary)', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600, opacity: criandoAssinatura ? 0.7 : 1 }}>
                    {criandoAssinatura ? 'A criar...' : 'Criar Assinatura'}
                  </button>
                </div>
              </div>
            </Card>
          )}

          <DataTable
            columns={[
              { key: 'school_id', label: 'Escola', render: (r) => {
                const s = schools.find((sc) => sc.id === r.school_id)
                return s ? s.nome : r.school_id.slice(0, 8) + '...'
              }},
              { key: 'plan_id', label: 'Plano', render: (r) => {
                const p = plans.find((pl) => pl.id === r.plan_id)
                return p ? p.nome : r.plan_id.slice(0, 8) + '...'
              }},
              { key: 'estado', label: 'Estado', render: (r) => (
                <Badge tone={ESTADO_TONE[r.estado] ?? 'default'}>{r.estado}</Badge>
              )},
              { key: 'data_inicio', label: 'Inicio', render: (r) => r.data_inicio.split('T')[0] },
              { key: 'data_fim', label: 'Fim', render: (r) => r.data_fim ? r.data_fim.split('T')[0] : '—' },
            ] as Column<Subscription>[]}
            rows={subscriptions}
            emptyMessage="Sem assinaturas registadas."
          />
        </>
      )}
    </div>
  )
}
