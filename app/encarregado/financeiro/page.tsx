'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { fetchAPI } from '@/lib/api'
import { PageHeader } from '@/components/ui/PageHeader'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { Badge } from '@/components/ui/Badge'

interface Propina {
  id: string
  mes: number
  ano: number
  valor: string
  valor_pago: string
  estado: string
  data_vencimento: string
}

const MESES = ['', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

const COLUMNS: Column<Propina>[] = [
  { key: 'mes', label: 'Mês', render: (r) => `${MESES[r.mes]} ${r.ano}` },
  { key: 'valor', label: 'Valor', render: (r) => `Kz ${r.valor}` },
  { key: 'valor_pago', label: 'Pago', render: (r) => `Kz ${r.valor_pago}` },
  {
    key: 'estado',
    label: 'Estado',
    render: (r) => <Badge estado={r.estado}>{r.estado.toUpperCase()}</Badge>,
  },
  { key: 'data_vencimento', label: 'Vencimento' },
]

function FinanceiroContent() {
  const params = useSearchParams()
  const alunoId = params.get('aluno')
  const [propinas, setPropinas] = useState<Propina[]>([])
  const [erro, setErro] = useState('')

  useEffect(() => {
    if (!alunoId) return
    fetchAPI<Propina[]>(`/encarregado/financeiro/${alunoId}`)
      .then(setPropinas)
      .catch((e) => setErro(e instanceof Error ? e.message : 'Erro'))
  }, [alunoId])

  if (!alunoId) return <p style={{ color: 'var(--danger)' }}>Seleccione um educando no dashboard.</p>

  return (
    <div>
      <PageHeader title="Situação Financeira do Educando" />
      {erro && <p style={{ color: 'var(--danger)' }}>{erro}</p>}
      <DataTable columns={COLUMNS} rows={propinas} emptyMessage="Sem propinas registadas." />
    </div>
  )
}

export default function EncarregadoFinanceiroPage() {
  return (
    <Suspense fallback={<p>A carregar...</p>}>
      <FinanceiroContent />
    </Suspense>
  )
}
