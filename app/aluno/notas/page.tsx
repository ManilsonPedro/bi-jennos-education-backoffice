// app/aluno/notas/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { authAPI, avaliacoesAPI, type Nota } from '@/lib/api'
import { DataTable, type Column } from '@/components/shared/DataTable'

interface Me {
  nome_completo: string
  email: string
  role: string
}

const COLUMNS: Column<Nota>[] = [
  { key: 'tipo', label: 'Tipo' },
  { key: 'nota', label: 'Nota' },
  { key: 'nota_maxima', label: 'Maxima' },
  { key: 'percentagem', label: 'Peso (%)' },
]

export default function NotasPage() {
  const [me, setMe] = useState<Me | null>(null)
  const [notas, setNotas] = useState<Nota[]>([])
  const [erro, setErro] = useState('')

  useEffect(() => {
    authAPI
      .me()
      .then((d) => setMe(d as Me))
      .catch((e) => setErro(e instanceof Error ? e.message : 'Erro'))
    avaliacoesAPI
      .minhasNotas()
      .then(setNotas)
      .catch((e) => setErro(e instanceof Error ? e.message : 'Erro'))
  }, [])

  return (
    <div>
      <PageHeader title="As minhas notas" />
      {erro && <p style={{ color: 'var(--danger)' }}>{erro}</p>}
      {me && (
        <p>
          Bem-vindo, <b>{me.nome_completo}</b> ({me.email}).
        </p>
      )}
      <DataTable
        columns={COLUMNS}
        rows={notas}
        emptyMessage="Ainda nao existem notas lancadas (ou a conta nao esta associada a um aluno)."
      />
    </div>
  )
}
