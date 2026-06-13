'use client'

import { useEffect, useState } from 'react'
import { fetchAPI } from '@/lib/api'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { Card } from '@/components/ui/Card'

interface Turma {
  classe_id: string
  ano_academico_id: string
  disciplinas: Array<{ id: string; nome: string }>
}

interface Sumario {
  id: string
  titulo: string
  data_aula: string
}

export default function DiarioPage() {
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [classeId, setClasseId] = useState('')
  const [disciplinaId, setDisciplinaId] = useState('')
  const [sumarios, setSumarios] = useState<Sumario[]>([])
  const [titulo, setTitulo] = useState('')
  const [dataAula, setDataAula] = useState(new Date().toISOString().split('T')[0])
  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState('')

  useEffect(() => {
    fetchAPI<Turma[]>('/docente/minhas-turmas')
      .then(setTurmas)
      .catch((e) => setErro(e instanceof Error ? e.message : 'Erro'))
  }, [])

  useEffect(() => {
    if (!disciplinaId || !classeId) return
    fetchAPI<Sumario[]>(`/docente/diario/${disciplinaId}/${classeId}`)
      .then(setSumarios)
      .catch(() => setSumarios([]))
  }, [disciplinaId, classeId])

  const registar = async () => {
    if (!disciplinaId || !titulo) return
    try {
      await fetchAPI('/docente/diario/sumario', {
        method: 'POST',
        body: JSON.stringify({ disciplina_id: disciplinaId, titulo, data_aula: dataAula }),
      })
      setMensagem('Sumário registado!')
      setTitulo('')
      fetchAPI<Sumario[]>(`/docente/diario/${disciplinaId}/${classeId}`).then(setSumarios)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro')
    }
  }

  const turmaSeleccionada = turmas.find((t) => t.classe_id === classeId)

  return (
    <div>
      <PageHeader title="Diário de Classe" subtitle="Registo de sumários" />

      {mensagem && <Alert tone="success">{mensagem}</Alert>}
      {erro && <Alert tone="danger">{erro}</Alert>}

      <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        <div>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Turma</label>
          <select
            value={classeId}
            onChange={(e) => { setClasseId(e.target.value); setDisciplinaId('') }}
            style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', minWidth: 180 }}
          >
            <option value="">Seleccione...</option>
            {turmas.map((t) => (
              <option key={t.classe_id} value={t.classe_id}>{t.classe_id.slice(0, 8)}...</option>
            ))}
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
              {turmaSeleccionada.disciplinas.map((d) => (
                <option key={d.id} value={d.id}>{d.nome}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {disciplinaId && (
        <Card>
          <h3 style={{ marginTop: 0 }}>Registar Sumário</h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Título do Sumário</label>
              <input
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd' }}
                placeholder="Ex: Introdução ao tema..."
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Data</label>
              <input
                type="date"
                value={dataAula}
                onChange={(e) => setDataAula(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd' }}
              />
            </div>
            <Button onClick={registar} >Registar</Button>
          </div>
        </Card>
      )}

      {sumarios.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h3>Sumários Registados</h3>
          {sumarios.map((s) => (
            <div key={s.id} style={{ padding: '10px 16px', background: '#fff', borderRadius: 8, marginBottom: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
              <div style={{ fontWeight: 600 }}>{s.titulo}</div>
              <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{s.data_aula}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
