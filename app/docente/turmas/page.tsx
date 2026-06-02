// app/(docente)/turmas/page.tsx
'use client'

import { useEffect, useState } from 'react'
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
      <h1 style={{ color: 'var(--primary)' }}>As minhas turmas</h1>
      {erro && <p style={{ color: '#c0392b' }}>{erro}</p>}
      <DataTable columns={COLUMNS} rows={turmas} emptyMessage="Sem turmas atribuidas." />
    </div>
  )
}
