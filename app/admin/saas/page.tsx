'use client'

import { useEffect, useState } from 'react'
import { fetchAPI } from '@/lib/api'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatCard } from '@/components/ui/StatCard'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { Card } from '@/components/ui/Card'

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

const SCHOOL_COLS: Column<School>[] = [
  { key: 'nome', label: 'Escola' },
  { key: 'codigo', label: 'Código' },
  { key: 'is_activa', label: 'Activa', render: (r) => r.is_activa === 'S' ? '✓' : '✗' },
  { key: 'tenant_id', label: 'Tenant', render: (r) => r.tenant_id.slice(0, 8) + '...' },
]

export default function SaaSPage() {
  const [dashboard, setDashboard] = useState<DashboardSaas | null>(null)
  const [schools, setSchools] = useState<School[]>([])
  const [mostrarNovo, setMostrarNovo] = useState(false)
  const [nome, setNome] = useState('')
  const [codigo, setCodigo] = useState('')
  const [email, setEmail] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState('')

  const carregar = () => {
    fetchAPI<DashboardSaas>('/saas/dashboard').then(setDashboard).catch(() => {})
    fetchAPI<School[]>('/saas/schools').then(setSchools).catch(() => {})
  }

  useEffect(() => { carregar() }, [])

  const criar = async () => {
    try {
      await fetchAPI('/saas/schools', {
        method: 'POST',
        body: JSON.stringify({ nome, codigo, email_contacto: email || null }),
      })
      setMensagem('Escola criada!'); setMostrarNovo(false); setNome(''); setCodigo(''); setEmail(''); carregar()
    } catch (e) { setErro(e instanceof Error ? e.message : 'Erro') }
  }

  return (
    <div>
      <PageHeader title="Super Admin — SaaS Multi-Escola" subtitle="Gestão de escolas e assinaturas" />

      {mensagem && <Alert type="success" message={mensagem} onClose={() => setMensagem('')} />}
      {erro && <Alert type="error" message={erro} onClose={() => setErro('')} />}

      {dashboard && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
          <StatCard label="Total Escolas" value={dashboard.total_schools} />
          <StatCard label="Escolas Activas" value={dashboard.schools_activas} />
          <StatCard label="Assinaturas Activas" value={dashboard.assinaturas_activas} />
          <StatCard label="Receita Total" value={`Kz ${Number(dashboard.receita_total).toLocaleString()}`} />
        </div>
      )}

      <div style={{ marginBottom: 20 }}>
        <Button label="Nova Escola" onClick={() => setMostrarNovo(!mostrarNovo)} />
      </div>

      {mostrarNovo && (
        <Card>
          <h3 style={{ marginTop: 0 }}>Registar Nova Escola</h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Nome</label>
              <input value={nome} onChange={(e) => setNome(e.target.value)} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Código</label>
              <input value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="Ex: ESCOLA-001" style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd' }} />
            </div>
            <Button label="Criar" onClick={criar} />
            <Button label="Cancelar" onClick={() => setMostrarNovo(false)} />
          </div>
        </Card>
      )}

      <h2>Escolas Registadas</h2>
      <DataTable columns={SCHOOL_COLS} rows={schools} emptyMessage="Sem escolas registadas." />
    </div>
  )
}
