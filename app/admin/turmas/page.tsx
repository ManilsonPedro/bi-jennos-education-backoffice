// app/(admin)/turmas/page.tsx
'use client'

import { useEffect, useState } from 'react'
import {
  academicoAPI,
  turmasAPI,
  type AnoAcademico,
  type Turma,
} from '@/lib/api'
import { DataTable, type Column } from '@/components/shared/DataTable'

const card: React.CSSProperties = {
  background: '#fff',
  padding: 24,
  borderRadius: 12,
  maxWidth: 520,
  boxShadow: '0 1px 6px rgba(0,0,0,.06)',
  marginBottom: 24,
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

const COLUMNS: Column<Turma>[] = [
  { key: 'nome', label: 'Nome' },
  { key: 'max_alunos', label: 'Capacidade' },
]

export default function TurmasPage() {
  const [anos, setAnos] = useState<AnoAcademico[]>([])
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [anoId, setAnoId] = useState('')
  const [nome, setNome] = useState('')
  const [maxAlunos, setMaxAlunos] = useState('35')
  const [msg, setMsg] = useState<{ ok: boolean; texto: string } | null>(null)

  useEffect(() => {
    academicoAPI.listarAnos().then(setAnos).catch(() => setAnos([]))
  }, [])

  function carregarTurmas(id: string) {
    if (id) turmasAPI.listar(id).then(setTurmas).catch(() => setTurmas([]))
  }

  async function criar(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)
    try {
      await turmasAPI.criar({
        nome,
        ano_academico_id: anoId,
        max_alunos: Number(maxAlunos),
      })
      setMsg({ ok: true, texto: `Turma "${nome}" criada` })
      setNome('')
      carregarTurmas(anoId)
    } catch (err) {
      setMsg({ ok: false, texto: err instanceof Error ? err.message : 'Erro' })
    }
  }

  return (
    <div>
      <h1 style={{ color: 'var(--primary)' }}>Turmas</h1>

      <form onSubmit={criar} style={card}>
        <h3 style={{ marginTop: 0 }}>Nova turma</h3>
        <label htmlFor="ano">Ano academico</label>
        <select id="ano" aria-label="Ano academico" style={input} value={anoId}
          onChange={(e) => { setAnoId(e.target.value); carregarTurmas(e.target.value) }} required>
          <option value="">— selecionar —</option>
          {anos.map((a) => (
            <option key={a.id} value={a.id}>{a.designacao}</option>
          ))}
        </select>

        <label htmlFor="nome">Nome da turma</label>
        <input id="nome" aria-label="Nome da turma" style={input}
          value={nome} onChange={(e) => setNome(e.target.value)} required />

        <label htmlFor="max">Capacidade</label>
        <input id="max" aria-label="Capacidade" type="number" min="1" style={input}
          value={maxAlunos} onChange={(e) => setMaxAlunos(e.target.value)} />

        <button type="submit" style={btn}>Criar turma</button>
      </form>

      {msg && <p style={{ color: msg.ok ? '#27ae60' : '#c0392b' }}>{msg.texto}</p>}

      <h3>Turmas do ano selecionado</h3>
      <DataTable columns={COLUMNS} rows={turmas} emptyMessage="Selecione um ano academico." />
    </div>
  )
}
