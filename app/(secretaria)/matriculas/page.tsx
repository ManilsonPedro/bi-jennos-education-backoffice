// app/(secretaria)/matriculas/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { academicoAPI, matriculasAPI, turmasAPI, type AnoAcademico, type Turma } from '@/lib/api'

const card: React.CSSProperties = {
  background: '#fff',
  padding: 24,
  borderRadius: 12,
  maxWidth: 520,
  boxShadow: '0 1px 6px rgba(0,0,0,.06)',
}
const input: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: 10,
  margin: '6px 0 16px',
  border: '1px solid #ddd',
  borderRadius: 8,
}
const btn: React.CSSProperties = {
  padding: '10px 16px',
  background: 'var(--primary)',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
}

export default function MatriculasPage() {
  const [anos, setAnos] = useState<AnoAcademico[]>([])
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [alunoId, setAlunoId] = useState('')
  const [anoId, setAnoId] = useState('')
  const [turmaId, setTurmaId] = useState('')
  const [tipo, setTipo] = useState('nova')
  const [msg, setMsg] = useState<{ ok: boolean; texto: string } | null>(null)

  useEffect(() => {
    academicoAPI.listarAnos().then(setAnos).catch(() => setAnos([]))
  }, [])

  useEffect(() => {
    if (anoId) turmasAPI.listar(anoId).then(setTurmas).catch(() => setTurmas([]))
  }, [anoId])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)
    try {
      const m = (await matriculasAPI.criar({
        aluno_id: alunoId,
        turma_id: turmaId,
        ano_academico_id: anoId,
        tipo,
      })) as { numero_matricula: string }
      setMsg({ ok: true, texto: `Matricula criada: ${m.numero_matricula}` })
      setAlunoId('')
    } catch (err) {
      setMsg({ ok: false, texto: err instanceof Error ? err.message : 'Erro' })
    }
  }

  return (
    <div>
      <h1 style={{ color: 'var(--primary)' }}>Nova matricula</h1>
      <form onSubmit={onSubmit} style={card}>
        <label htmlFor="aluno">ID do aluno</label>
        <input
          id="aluno"
          aria-label="ID do aluno"
          style={input}
          value={alunoId}
          onChange={(e) => setAlunoId(e.target.value)}
          required
        />

        <label htmlFor="ano">Ano academico</label>
        <select
          id="ano"
          aria-label="Ano academico"
          style={input}
          value={anoId}
          onChange={(e) => setAnoId(e.target.value)}
          required
        >
          <option value="">— selecionar —</option>
          {anos.map((a) => (
            <option key={a.id} value={a.id}>
              {a.designacao}
            </option>
          ))}
        </select>

        <label htmlFor="turma">Turma</label>
        <select
          id="turma"
          aria-label="Turma"
          style={input}
          value={turmaId}
          onChange={(e) => setTurmaId(e.target.value)}
          required
        >
          <option value="">— selecionar —</option>
          {turmas.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nome}
            </option>
          ))}
        </select>

        <label htmlFor="tipo">Tipo</label>
        <select
          id="tipo"
          aria-label="Tipo de matricula"
          style={input}
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
        >
          <option value="nova">Nova</option>
          <option value="rematricula">Rematricula</option>
          <option value="transferencia">Transferencia</option>
        </select>

        <button type="submit" style={btn}>
          Criar matricula
        </button>
      </form>
      {msg && (
        <p style={{ color: msg.ok ? '#27ae60' : '#c0392b', marginTop: 16 }}>{msg.texto}</p>
      )}
    </div>
  )
}
