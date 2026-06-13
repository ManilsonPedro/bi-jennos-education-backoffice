'use client'

import { useEffect, useState } from 'react'
import { fetchAPI } from '@/lib/api'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'

interface HorarioItem {
  dia_semana: number
  hora_inicio: string
  hora_fim: string
  disciplina: string
  sala: string | null
  docente: string | null
}

const DIAS = ['', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']

export default function HorarioPage() {
  const [horario, setHorario] = useState<HorarioItem[]>([])
  const [erro, setErro] = useState('')

  useEffect(() => {
    fetchAPI<HorarioItem[]>('/aluno/horario')
      .then(setHorario)
      .catch((e) => setErro(e instanceof Error ? e.message : 'Erro'))
  }, [])

  const porDia = DIAS.slice(1, 7).map((dia, i) => ({
    dia,
    items: horario.filter((h) => h.dia_semana === i + 1),
  }))

  return (
    <div>
      <PageHeader title="Horário" subtitle="Horário semanal de aulas" />
      {erro && <p style={{ color: 'var(--danger)' }}>{erro}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {porDia.map(({ dia, items }) => (
          <Card key={dia}>
            <h3 style={{ marginTop: 0, color: 'var(--primary)' }}>{dia}</h3>
            {items.length === 0 ? (
              <p style={{ color: '#aaa', fontSize: 13 }}>Sem aulas</p>
            ) : (
              items.map((item, i) => (
                <div
                  key={i}
                  style={{
                    padding: '10px 12px',
                    background: '#f8f9fa',
                    borderRadius: 8,
                    marginBottom: 8,
                    borderLeft: '4px solid var(--primary)',
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{item.disciplina}</div>
                  <div style={{ fontSize: 13, color: '#555', marginTop: 4 }}>
                    🕐 {item.hora_inicio} – {item.hora_fim}
                  </div>
                  {item.sala && <div style={{ fontSize: 12, color: '#888' }}>📍 {item.sala}</div>}
                  {item.docente && <div style={{ fontSize: 12, color: '#888' }}>👤 {item.docente}</div>}
                </div>
              ))
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
