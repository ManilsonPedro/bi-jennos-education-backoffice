'use client'

import { useEffect, useState } from 'react'
import { fetchAPI } from '@/lib/api'
import { PageHeader } from '@/components/ui/PageHeader'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'

interface Solicitacao {
  id: string
  numero_solicitacao: string
  tipo: string
  estado: string
  observacoes: string | null
  created_at: string
}

const ESTADO_CORES: Record<string, string> = {
  pendente: '#f59e0b',
  em_analise: '#6366f1',
  aprovada: '#22c55e',
  rejeitada: '#ef4444',
  concluida: '#6b7280',
}

const ESTADOS = ['pendente', 'em_analise', 'aprovada', 'rejeitada', 'concluida']

export default function SecretariaSolicitacoesPage() {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([])
  const [filtro, setFiltro] = useState('')
  const [seleccionada, setSeleccionada] = useState<string | null>(null)
  const [novoEstado, setNovoEstado] = useState('')
  const [resposta, setResposta] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState('')

  const carregar = (estado?: string) => {
    fetchAPI<Solicitacao[]>(`/solicitacoes${estado ? `?estado=${estado}` : ''}`)
      .then(setSolicitacoes)
      .catch((e) => setErro(e instanceof Error ? e.message : 'Erro'))
  }

  useEffect(() => { carregar() }, [])

  const actualizar = async () => {
    if (!seleccionada || !novoEstado) return
    try {
      await fetchAPI(`/solicitacoes/${seleccionada}/estado`, {
        method: 'PATCH',
        body: JSON.stringify({ estado: novoEstado, resposta: resposta || null }),
      })
      setMensagem('Estado actualizado com sucesso!')
      setSeleccionada(null)
      setNovoEstado('')
      setResposta('')
      carregar(filtro || undefined)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro')
    }
  }

  const COLUMNS: Column<Solicitacao>[] = [
    { key: 'numero_solicitacao', label: 'N.º' },
    { key: 'tipo', label: 'Tipo' },
    {
      key: 'estado',
      label: 'Estado',
      render: (r) => <Badge estado={r.estado}>{r.estado.replace('_', ' ').toUpperCase()}</Badge>,
    },
    { key: 'created_at', label: 'Data', render: (r) => new Date(r.created_at).toLocaleDateString('pt-AO') },
    {
      key: 'id',
      label: 'Acção',
      render: (r) => (
        <Button onClick={() => { setSeleccionada(r.id); setNovoEstado(r.estado) }}>Gerir</Button>
      ),
    },
  ]

  return (
    <div>
      <PageHeader title="Gestão de Solicitações" subtitle="Processar pedidos de documentos" />

      {mensagem && <Alert tone="success">{mensagem}</Alert>}
      {erro && <Alert tone="danger">{erro}</Alert>}

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' }}>
        <label style={{ fontWeight: 600 }}>Filtrar por estado:</label>
        <select
          value={filtro}
          onChange={(e) => { setFiltro(e.target.value); carregar(e.target.value || undefined) }}
          style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #ddd' }}
        >
          <option value="">Todos</option>
          {ESTADOS.map((e) => <option key={e} value={e}>{e.replace('_', ' ')}</option>)}
        </select>
      </div>

      {seleccionada && (
        <div style={{ background: '#fff', padding: 20, borderRadius: 10, marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginTop: 0 }}>Actualizar Estado</h3>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Novo Estado</label>
            <select
              value={novoEstado}
              onChange={(e) => setNovoEstado(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd' }}
            >
              {ESTADOS.map((e) => <option key={e} value={e}>{e.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Resposta (opcional)</label>
            <textarea
              value={resposta}
              onChange={(e) => setResposta(e.target.value)}
              rows={3}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Button onClick={actualizar} >Guardar</Button>
            <Button onClick={() => setSeleccionada(null)}>Cancelar</Button>
          </div>
        </div>
      )}

      <DataTable columns={COLUMNS} rows={solicitacoes} emptyMessage="Sem solicitações." />
    </div>
  )
}
