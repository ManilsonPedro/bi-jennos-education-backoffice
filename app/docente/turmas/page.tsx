// app/(docente)/turmas/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { turmasAPI, type Turma } from '@/lib/api'
import { DataTable, type Column } from '@/components/shared/DataTable'

const COLUMNS: Column<Turma>[] = [
  { key: 'nome', label: 'Turma' },
  { key: 'max_alunos', label: 'Capacidade' },
]

export default function DocenteTurmasPage() {
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [erro, setErro] = useState('')

  useEffect(() => {
    turmasAPI
      .listar()
      .then(setTurmas)
      .catch((e) => setErro(e instanceof Error ? e.message : 'Erro'))
  }, [])

  return (
    <div>
      <PageHeader title="As minhas turmas" />
      {erro && <p style={{ color: 'var(--danger)' }}>{erro}</p>}
      <DataTable columns={COLUMNS} rows={turmas} emptyMessage="Sem turmas atribuidas." />
    </div>
  )
}
