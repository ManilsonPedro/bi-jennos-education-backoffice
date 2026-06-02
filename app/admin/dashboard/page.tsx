// app/(admin)/dashboard/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { dashboardAPI, type DashboardResumo } from '@/lib/api'

export default function DashboardPage() {
  const [resumo, setResumo] = useState<DashboardResumo | null>(null)
  const [erro, setErro] = useState('')

  useEffect(() => {
    dashboardAPI
      .resumo()
      .then(setResumo)
      .catch((e) => setErro(e instanceof Error ? e.message : 'Erro ao carregar'))
  }, [])

  const cards = [
    { titulo: 'Alunos', valor: resumo?.total_alunos },
    { titulo: 'Turmas', valor: resumo?.total_turmas },
    { titulo: 'Matriculas activas', valor: resumo?.matriculas_activas },
    { titulo: 'Propinas pendentes', valor: resumo?.propinas_pendentes },
    { titulo: 'Total recebido (Kz)', valor: resumo?.total_recebido },
    { titulo: 'Certificados gerados', valor: resumo?.certificados_gerados },
  ]

  return (
    <div>
      <h1 style={{ color: 'var(--primary)' }}>Dashboard</h1>
      {erro && <p style={{ color: '#c0392b' }}>{erro}</p>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {cards.map((c) => (
          <div
            key={c.titulo}
            style={{
              background: '#fff',
              padding: 20,
              borderRadius: 12,
              boxShadow: '0 1px 6px rgba(0,0,0,.06)',
            }}
          >
            <p style={{ color: '#888', margin: 0, fontSize: 13 }}>{c.titulo}</p>
            <p style={{ fontSize: 28, fontWeight: 700, margin: '8px 0 0' }}>
              {c.valor ?? '—'}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
