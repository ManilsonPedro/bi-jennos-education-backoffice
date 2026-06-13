'use client'

import { useEffect, useState } from 'react'
import { fetchAPI } from '@/lib/api'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'

interface Unidade {
  id: string
  titulo: string
  ordem: number
  carga_horaria: number
  sumarios: Array<{ id: string; titulo: string; data_aula: string }>
}

interface Disciplina { id: string; nome: string }
interface Turma { classe_id: string; disciplinas: Disciplina[] }

export default function PlanoAulaPage() {
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [disciplinaId, setDisciplinaId] = useState('')
  const [anoId, setAnoId] = useState('')
  const [unidades, setUnidades] = useState<Unidade[]>([])
  const [classeId, setClasseId] = useState('')

  useEffect(() => {
    fetchAPI<Turma[]>('/docente/minhas-turmas').then(setTurmas).catch(() => {})
    fetchAPI<Array<{ id: string; designacao: string }>>('/anos-academicos')
      .then((anos) => anos[0] && setAnoId(anos[0].id))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!disciplinaId || !anoId) return
    fetchAPI<Unidade[]>(`/docente/plano-aula/${disciplinaId}?ano_academico_id=${anoId}`)
      .then(setUnidades)
      .catch(() => setUnidades([]))
  }, [disciplinaId, anoId])

  const turmaSeleccionada = turmas.find((t) => t.classe_id === classeId)

  return (
    <div>
      <PageHeader title="Plano de Aulas" subtitle="Unidades temáticas e sumários" />

      <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        <div>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Turma</label>
          <select
            value={classeId}
            onChange={(e) => { setClasseId(e.target.value); setDisciplinaId('') }}
            style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', minWidth: 180 }}
          >
            <option value="">Seleccione...</option>
            {turmas.map((t) => <option key={t.classe_id} value={t.classe_id}>{t.classe_id.slice(0, 8)}...</option>)}
          </select>
        </div>
        {turmaSeleccionada && (
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Disciplina</label>
            <select
              value={disciplinaId}
              onChange={(e) => setDisciplinaId(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', minWidth: 180 }}
            >
              <option value="">Seleccione...</option>
              {turmaSeleccionada.disciplinas.map((d) => <option key={d.id} value={d.id}>{d.nome}</option>)}
            </select>
          </div>
        )}
      </div>

      {unidades.length === 0 && disciplinaId && <p style={{ color: '#888' }}>Sem unidades temáticas definidas.</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {unidades.map((u) => (
          <Card key={u.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ marginTop: 0 }}>{u.ordem}. {u.titulo}</h3>
                <span style={{ fontSize: 13, color: '#888' }}>{u.carga_horaria}h</span>
              </div>
              <span style={{
                background: '#e0f2fe', color: '#0369a1', padding: '4px 10px',
                borderRadius: 20, fontSize: 12, fontWeight: 600,
              }}>
                {u.sumarios.length} aulas
              </span>
            </div>
            {u.sumarios.length > 0 && (
              <div style={{ marginTop: 12, borderTop: '1px solid #f0f0f0', paddingTop: 12 }}>
                {u.sumarios.map((s) => (
                  <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f9f9f9' }}>
                    <span style={{ fontSize: 13 }}>{s.titulo}</span>
                    <span style={{ fontSize: 12, color: '#888' }}>{s.data_aula}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
