'use client'

import { useEffect, useState } from 'react'
import { fetchAPI } from '@/lib/api'
import { PageHeader } from '@/components/ui/PageHeader'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { Badge } from '@/components/ui/Badge'

interface FrequenciaItem {
  disciplina: string
  trimestre: string
  total_aulas: number
  faltas: number
  justificadas: number
  percentagem_presenca: number
}

const COLUMNS: Column<FrequenciaItem>[] = [
  { key: 'disciplina', label: 'Disciplina' },
  { key: 'trimestre', label: 'Trimestre' },
  { key: 'total_aulas', label: 'Total Aulas' },
  { key: 'faltas', label: 'Faltas' },
  { key: 'justificadas', label: 'Justificadas' },
  {
    key: 'percentagem_presenca',
    label: 'Presença',
    render: (row) => {
      const pct = row.percentagem_presenca
      const tone = pct >= 75 ? 'success' : pct >= 60 ? 'warn' : 'danger'
      return <Badge tone={tone as 'success' | 'warn' | 'danger'}>{`${pct}%`}</Badge>
    },
  },
]

export default function FrequenciaPage() {
  const [frequencias, setFrequencias] = useState<FrequenciaItem[]>([])
  const [erro, setErro] = useState('')

  useEffect(() => {
    fetchAPI<FrequenciaItem[]>('/aluno/frequencias')
      .then(setFrequencias)
      .catch((e) => setErro(e instanceof Error ? e.message : 'Erro'))
  }, [])

  return (
    <div>
      <PageHeader title="Frequência" subtitle="Presenças e faltas por disciplina" />
      {erro && <p style={{ color: 'var(--danger)' }}>{erro}</p>}
      <DataTable
        columns={COLUMNS}
        rows={frequencias}
        emptyMessage="Sem registos de frequência."
      />
    </div>
  )
}
