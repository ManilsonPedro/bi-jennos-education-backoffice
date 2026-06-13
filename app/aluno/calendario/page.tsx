'use client'

import { useEffect, useState } from 'react'
import { fetchAPI } from '@/lib/api'
import { PageHeader } from '@/components/ui/PageHeader'
import { Badge } from '@/components/ui/Badge'

interface EventoCalendario {
  id: string
  tipo: string
  titulo: string
  data_inicio: string
  data_fim: string | null
  descricao: string | null
}

const TIPO_CORES: Record<string, string> = {
  feriado: '#ef4444',
  aula: '#22c55e',
  exame: '#f59e0b',
  reuniao: '#6366f1',
  outro: '#6b7280',
}

export default function CalendarioPage() {
  const [eventos, setEventos] = useState<EventoCalendario[]>([])
  const [erro, setErro] = useState('')

  useEffect(() => {
    fetchAPI<EventoCalendario[]>('/aluno/calendario')
      .then(setEventos)
      .catch((e) => setErro(e instanceof Error ? e.message : 'Erro'))
  }, [])

  return (
    <div>
      <PageHeader title="Calendário Académico" subtitle="Eventos e datas importantes" />
      {erro && <p style={{ color: 'var(--danger)' }}>{erro}</p>}

      {eventos.length === 0 ? (
        <p style={{ color: '#888' }}>Sem eventos no calendário académico.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {eventos.map((ev) => (
            <div
              key={ev.id}
              style={{
                padding: '14px 18px',
                background: '#fff',
                borderRadius: 10,
                boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                borderLeft: `5px solid ${TIPO_CORES[ev.tipo] ?? '#6b7280'}`,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 16,
              }}
            >
              <div style={{ minWidth: 90, textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase' }}>
                  {new Date(ev.data_inicio).toLocaleDateString('pt-AO', { month: 'short' })}
                </div>
                <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--primary)', lineHeight: 1 }}>
                  {new Date(ev.data_inicio).getDate()}
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600 }}>{ev.titulo}</span>
                  <Badge label={ev.tipo} color={TIPO_CORES[ev.tipo] ?? '#6b7280'} />
                </div>
                {ev.descricao && <p style={{ margin: 0, fontSize: 13, color: '#555' }}>{ev.descricao}</p>}
                {ev.data_fim && (
                  <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
                    Até {new Date(ev.data_fim).toLocaleDateString('pt-AO')}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
