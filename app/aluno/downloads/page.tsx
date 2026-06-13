'use client'

import { useEffect, useState } from 'react'
import { fetchAPI } from '@/lib/api'
import { PageHeader } from '@/components/ui/PageHeader'
import { DataTable, type Column } from '@/components/shared/DataTable'

interface Download {
  id: string
  tipo: string
  descricao: string | null
  ficheiro_url: string | null
  created_at: string
}

const COLUMNS: Column<Download>[] = [
  { key: 'tipo', label: 'Tipo' },
  { key: 'descricao', label: 'Descrição', render: (r) => r.descricao ?? '—' },
  { key: 'created_at', label: 'Data', render: (r) => new Date(r.created_at).toLocaleDateString('pt-AO') },
  {
    key: 'ficheiro_url',
    label: 'Ficheiro',
    render: (r) =>
      r.ficheiro_url ? (
        <a href={r.ficheiro_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>
          Descarregar
        </a>
      ) : (
        <span style={{ color: '#aaa' }}>—</span>
      ),
  },
]

export default function DownloadsPage() {
  const [downloads, setDownloads] = useState<Download[]>([])
  const [erro, setErro] = useState('')

  useEffect(() => {
    fetchAPI<Download[]>('/aluno/downloads')
      .then(setDownloads)
      .catch((e) => setErro(e instanceof Error ? e.message : 'Erro'))
  }, [])

  return (
    <div>
      <PageHeader title="Os Meus Downloads" subtitle="Histórico de documentos descarregados" />
      {erro && <p style={{ color: 'var(--danger)' }}>{erro}</p>}
      <DataTable
        columns={COLUMNS}
        rows={downloads}
        emptyMessage="Ainda não tem downloads registados."
      />
    </div>
  )
}
