'use client'

import { useEffect, useState } from 'react'
import { fetchAPI } from '@/lib/api'
import { PageHeader } from '@/components/ui/PageHeader'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { Badge } from '@/components/ui/Badge'

interface HistoricoItem {
  ano_academico: string
  classe: string | null
  estado_final: string | null
  media_final: string | null
}

const COLUMNS: Column<HistoricoItem>[] = [
  { key: 'ano_academico', label: 'Ano Lectivo' },
  { key: 'classe', label: 'Classe' },
  {
    key: 'estado_final',
    label: 'Resultado',
    render: (row) => {
      const estado = row.estado_final
      if (!estado) return <span style={{ color: '#888' }}>—</span>
      const color = estado === 'aprovado' ? '#22c55e' : estado === 'reprovado' ? '#ef4444' : '#f59e0b'
      return <Badge label={estado.toUpperCase()} color={color} />
    },
  },
  {
    key: 'media_final',
    label: 'Média Final',
    render: (row) => row.media_final ? `${row.media_final} valores` : '—',
  },
]

export default function HistoricoPage() {
  const [historico, setHistorico] = useState<HistoricoItem[]>([])
  const [erro, setErro] = useState('')

  useEffect(() => {
    fetchAPI<HistoricoItem[]>('/aluno/historico-escolar')
      .then(setHistorico)
      .catch((e) => setErro(e instanceof Error ? e.message : 'Erro'))
  }, [])

  return (
    <div>
      <PageHeader title="Histórico Escolar" subtitle="Registo completo do percurso académico" />
      {erro && <p style={{ color: 'var(--danger)' }}>{erro}</p>}
      <DataTable
        columns={COLUMNS}
        rows={historico}
        emptyMessage="Sem histórico escolar registado."
      />
    </div>
  )
}
