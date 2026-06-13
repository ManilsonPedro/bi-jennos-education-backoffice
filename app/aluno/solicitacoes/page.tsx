'use client'

import { useEffect, useState } from 'react'
import { fetchAPI } from '@/lib/api'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Alert } from '@/components/ui/Alert'

interface Solicitacao {
  id: string
  numero_solicitacao: string
  tipo: string
  estado: string
  observacoes: string | null
  resposta: string | null
  created_at: string
}

const ESTADO_CORES: Record<string, string> = {
  pendente: '#f59e0b',
  em_analise: '#6366f1',
  aprovada: '#22c55e',
  rejeitada: '#ef4444',
  concluida: '#6b7280',
}

const TIPOS = [
  { value: 'declaracao', label: 'Declaração de Matrícula' },
  { value: 'certificado', label: 'Certificado' },
  { value: 'historico', label: 'Histórico Escolar' },
  { value: 'boletim', label: 'Boletim' },
]

const COLUMNS: Column<Solicitacao>[] = [
  { key: 'numero_solicitacao', label: 'N.º' },
  { key: 'tipo', label: 'Tipo', render: (r) => TIPOS.find(t => t.value === r.tipo)?.label ?? r.tipo },
  {
    key: 'estado',
    label: 'Estado',
    render: (r) => <Badge estado={r.estado}>{r.estado.replace('_', ' ').toUpperCase()}</Badge>,
  },
  { key: 'created_at', label: 'Data', render: (r) => new Date(r.created_at).toLocaleDateString('pt-AO') },
]

export default function SolicitacoesPage() {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([])
  const [mostrarForm, setMostrarForm] = useState(false)
  const [tipo, setTipo] = useState('declaracao')
  const [observacoes, setObservacoes] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState('')

  const carregar = () => {
    fetchAPI<Solicitacao[]>('/solicitacoes')
      .then(setSolicitacoes)
      .catch((e) => setErro(e instanceof Error ? e.message : 'Erro'))
  }

  useEffect(() => { carregar() }, [])

  const submeter = async () => {
    try {
      await fetchAPI('/solicitacoes', {
        method: 'POST',
        body: JSON.stringify({ tipo, observacoes: observacoes || null }),
      })
      setMensagem('Solicitação enviada com sucesso!')
      setMostrarForm(false)
      setObservacoes('')
      carregar()
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao enviar')
    }
  }

  return (
    <div>
      <PageHeader title="Solicitações de Documentos" subtitle="Peça documentos oficiais online" />

      {mensagem && <Alert tone="success">{mensagem}</Alert>}
      {erro && <Alert tone="danger">{erro}</Alert>}

      <div style={{ marginBottom: 20 }}>
        <Button onClick={() => setMostrarForm(!mostrarForm)}>Nova Solicitação</Button>
      </div>

      {mostrarForm && (
        <div style={{ background: '#fff', padding: 20, borderRadius: 10, marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginTop: 0 }}>Nova Solicitação</h3>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Tipo de Documento</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd' }}
            >
              {TIPOS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Observações (opcional)</label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={3}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd' }}
              placeholder="Indique motivo ou informação adicional..."
            />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Button onClick={submeter} >Enviar Solicitação</Button>
            <Button onClick={() => setMostrarForm(false)}>Cancelar</Button>
          </div>
        </div>
      )}

      <DataTable
        columns={COLUMNS}
        rows={solicitacoes}
        emptyMessage="Ainda não tem solicitações."
      />
    </div>
  )
}
