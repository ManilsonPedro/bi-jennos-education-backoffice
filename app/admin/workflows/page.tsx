'use client'

import { useEffect, useState } from 'react'
import { fetchAPI } from '@/lib/api'
import { PageHeader } from '@/components/ui/PageHeader'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Alert } from '@/components/ui/Alert'

interface Workflow { id: string; nome: string; tipo: string; descricao: string | null }

interface WfInstance {
  id: string
  workflow_id: string
  estado: string
  step_actual: number
  referencia_tipo: string | null
  created_at: string
}

const ESTADO_CORES: Record<string, string> = {
  pendente: '#f59e0b',
  em_analise: '#6366f1',
  aprovado: '#22c55e',
  rejeitado: '#ef4444',
}

const TIPOS = ['matricula', 'transferencia', 'certificado', 'bolsa', 'desconto', 'outro']

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [instancias, setInstancias] = useState<WfInstance[]>([])
  const [mostrarNovo, setMostrarNovo] = useState(false)
  const [nome, setNome] = useState('')
  const [tipo, setTipo] = useState('outro')
  const [seleccionada, setSeleccionada] = useState<string | null>(null)
  const [novoEstado, setNovoEstado] = useState('em_analise')
  const [observacao, setObservacao] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState('')

  const carregar = () => {
    fetchAPI<Workflow[]>('/workflows').then(setWorkflows).catch(() => {})
    fetchAPI<WfInstance[]>('/workflows/instancias').then(setInstancias).catch(() => {})
  }

  useEffect(() => { carregar() }, [])

  const criarWorkflow = async () => {
    try {
      await fetchAPI('/workflows', { method: 'POST', body: JSON.stringify({ nome, tipo }) })
      setMensagem('Workflow criado!'); setMostrarNovo(false); setNome(''); carregar()
    } catch (e) { setErro(e instanceof Error ? e.message : 'Erro') }
  }

  const avancar = async () => {
    if (!seleccionada) return
    try {
      await fetchAPI(`/workflows/instancias/${seleccionada}/avancar`, {
        method: 'PATCH',
        body: JSON.stringify({ estado: novoEstado, observacao: observacao || null }),
      })
      setMensagem('Estado actualizado!'); setSeleccionada(null); setObservacao(''); carregar()
    } catch (e) { setErro(e instanceof Error ? e.message : 'Erro') }
  }

  const WF_COLS: Column<Workflow>[] = [
    { key: 'nome', label: 'Nome' },
    { key: 'tipo', label: 'Tipo' },
    { key: 'descricao', label: 'Descrição', render: (r) => r.descricao ?? '—' },
  ]

  const INST_COLS: Column<WfInstance>[] = [
    { key: 'referencia_tipo', label: 'Tipo Ref.', render: (r) => r.referencia_tipo ?? '—' },
    { key: 'estado', label: 'Estado', render: (r) => <Badge estado={r.estado}>{r.estado}</Badge> },
    { key: 'step_actual', label: 'Step' },
    { key: 'created_at', label: 'Iniciado', render: (r) => new Date(r.created_at).toLocaleDateString('pt-AO') },
    {
      key: 'id',
      label: 'Acção',
      render: (r) => !['aprovado', 'rejeitado'].includes(r.estado) ? (
        <Button onClick={() => setSeleccionada(r.id)}>Avançar</Button>
      ) : null,
    },
  ]

  return (
    <div>
      <PageHeader title="Workflows de Aprovação" subtitle="Gestão de processos de aprovação" />

      {mensagem && <Alert type="success" message={mensagem} onClose={() => setMensagem('')} />}
      {erro && <Alert type="error" message={erro} onClose={() => setErro('')} />}

      <Button onClick={() => setMostrarNovo(!mostrarNovo)}>Novo Workflow</Button>

      {mostrarNovo && (
        <div style={{ background: '#fff', padding: 20, borderRadius: 10, margin: '16px 0', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginTop: 0 }}>Novo Workflow</h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Nome</label>
              <input value={nome} onChange={(e) => setNome(e.target.value)} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Tipo</label>
              <select value={tipo} onChange={(e) => setTipo(e.target.value)} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd' }}>
                {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <Button onClick={criarWorkflow} >Criar</Button>
          </div>
        </div>
      )}

      {seleccionada && (
        <div style={{ background: '#fff', padding: 20, borderRadius: 10, margin: '16px 0', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginTop: 0 }}>Avançar Instância</h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <select value={novoEstado} onChange={(e) => setNovoEstado(e.target.value)} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd' }}>
              {['em_analise', 'aprovado', 'rejeitado'].map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
            <input value={observacao} onChange={(e) => setObservacao(e.target.value)} placeholder="Observação..." style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', flex: 1 }} />
            <Button onClick={avancar} >Confirmar</Button>
            <Button onClick={() => setSeleccionada(null)}>Cancelar</Button>
          </div>
        </div>
      )}

      <h2>Workflows Configurados</h2>
      <DataTable columns={WF_COLS} rows={workflows} emptyMessage="Sem workflows." />

      <h2 style={{ marginTop: 24 }}>Instâncias em Curso</h2>
      <DataTable columns={INST_COLS} rows={instancias} emptyMessage="Sem instâncias activas." />
    </div>
  )
}
