'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { fetchAPI } from '@/lib/api'
import { PageHeader } from '@/components/ui/PageHeader'
import { DataTable, type Column } from '@/components/shared/DataTable'

interface Nota { id: string; tipo: string; nota: string; nota_maxima: string; percentagem: string }

const COLUMNS: Column<Nota>[] = [
  { key: 'tipo', label: 'Tipo' },
  { key: 'nota', label: 'Nota' },
  { key: 'nota_maxima', label: 'Máxima' },
  { key: 'percentagem', label: 'Peso (%)' },
]

function NotasContent() {
  const params = useSearchParams()
  const alunoId = params.get('aluno')
  const [notas, setNotas] = useState<Nota[]>([])
  const [erro, setErro] = useState('')

  useEffect(() => {
    if (!alunoId) return
    fetchAPI<Nota[]>(`/encarregado/notas/${alunoId}`)
      .then(setNotas)
      .catch((e) => setErro(e instanceof Error ? e.message : 'Erro'))
  }, [alunoId])

  if (!alunoId) return <p style={{ color: 'var(--danger)' }}>Seleccione um educando no dashboard.</p>

  return (
    <div>
      <PageHeader title="Notas do Educando" />
      {erro && <p style={{ color: 'var(--danger)' }}>{erro}</p>}
      <DataTable columns={COLUMNS} rows={notas} emptyMessage="Sem notas registadas." />
    </div>
  )
}

export default function EncarregadoNotasPage() {
  return (
    <Suspense fallback={<p>A carregar...</p>}>
      <NotasContent />
    </Suspense>
  )
}
