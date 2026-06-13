// app/(admin)/alunos/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { alunosAPI, type PaginatedAlunos } from '@/lib/api'
import { DataTable, type Column } from '@/components/shared/DataTable'

type Aluno = PaginatedAlunos['items'][number]

const COLUMNS: Column<Aluno>[] = [
  { key: 'numero_aluno', label: 'Numero' },
  { key: 'nome_completo', label: 'Nome' },
  { key: 'email', label: 'Email' },
  { key: 'telefone', label: 'Telefone' },
]

export default function AlunosPage() {
  const [data, setData] = useState<PaginatedAlunos | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [erro, setErro] = useState('')

  useEffect(() => {
    alunosAPI
      .listar(page, 20, search)
      .then(setData)
      .catch((e) => setErro(e instanceof Error ? e.message : 'Erro ao carregar'))
  }, [page, search])

  return (
    <div>
      <h1 style={{ color: 'var(--primary)' }}>Alunos</h1>
      <input
        placeholder="Pesquisar por nome ou numero..."
        value={search}
        onChange={(e) => {
          setPage(1)
          setSearch(e.target.value)
        }}
        style={{ padding: 10, width: 320, borderRadius: 8, border: '1px solid var(--border-strong)', marginBottom: 16 }}
      />
      {erro && <p style={{ color: 'var(--danger)' }}>{erro}</p>}
      <DataTable columns={COLUMNS} rows={data?.items ?? []} />
      {data && (
        <div style={{ marginTop: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Anterior
          </button>
          <span>
            Pagina {data.page} de {data.pages || 1} ({data.total} alunos)
          </span>
          <button disabled={page >= data.pages} onClick={() => setPage((p) => p + 1)}>
            Seguinte
          </button>
        </div>
      )}
    </div>
  )
}
