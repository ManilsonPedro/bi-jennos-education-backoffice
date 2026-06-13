// app/(docente)/avaliacoes/page.tsx
'use client'

import { useState } from 'react'
import { avaliacoesAPI } from '@/lib/api'

const card: React.CSSProperties = {
  background: 'var(--surface)',
  padding: 24,
  borderRadius: 12,
  maxWidth: 520,
  boxShadow: 'var(--shadow-sm)',
}
const input: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: 10,
  margin: '6px 0 16px',
  border: '1px solid var(--border-strong)',
  borderRadius: 8,
}
const btn: React.CSSProperties = {
  padding: '10px 16px',
  background: 'var(--primary)',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
}

export default function AvaliacoesPage() {
  const [form, setForm] = useState({
    aluno_id: '',
    disciplina_id: '',
    trimestre_id: '',
    tipo: 'teste',
    nota: '',
    nota_maxima: '20',
  })
  const [msg, setMsg] = useState<{ ok: boolean; texto: string } | null>(null)

  function set(campo: string, valor: string) {
    setForm((f) => ({ ...f, [campo]: valor }))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)
    try {
      await avaliacoesAPI.lancarNota(form)
      setMsg({ ok: true, texto: 'Nota lancada com sucesso' })
      set('nota', '')
    } catch (err) {
      setMsg({ ok: false, texto: err instanceof Error ? err.message : 'Erro' })
    }
  }

  return (
    <div>
      <h1 style={{ color: 'var(--primary)' }}>Lancar nota</h1>
      <form onSubmit={onSubmit} style={card}>
        <label htmlFor="aluno">ID do aluno</label>
        <input id="aluno" aria-label="ID do aluno" style={input}
          value={form.aluno_id} onChange={(e) => set('aluno_id', e.target.value)} required />

        <label htmlFor="disc">ID da disciplina</label>
        <input id="disc" aria-label="ID da disciplina" style={input}
          value={form.disciplina_id} onChange={(e) => set('disciplina_id', e.target.value)} required />

        <label htmlFor="tri">ID do trimestre</label>
        <input id="tri" aria-label="ID do trimestre" style={input}
          value={form.trimestre_id} onChange={(e) => set('trimestre_id', e.target.value)} required />

        <label htmlFor="tipo">Tipo de avaliacao</label>
        <select id="tipo" aria-label="Tipo de avaliacao" style={input}
          value={form.tipo} onChange={(e) => set('tipo', e.target.value)}>
          <option value="continua">Continua</option>
          <option value="teste">Teste</option>
          <option value="exame">Exame</option>
          <option value="trabalho">Trabalho</option>
          <option value="oral">Oral</option>
        </select>

        <label htmlFor="nota">Nota</label>
        <input id="nota" aria-label="Nota" type="number" step="0.01" style={input}
          value={form.nota} onChange={(e) => set('nota', e.target.value)} required />

        <label htmlFor="max">Nota maxima</label>
        <input id="max" aria-label="Nota maxima" type="number" step="0.01" style={input}
          value={form.nota_maxima} onChange={(e) => set('nota_maxima', e.target.value)} />

        <button type="submit" style={btn}>Lancar nota</button>
      </form>
      {msg && <p style={{ color: msg.ok ? '#27ae60' : '#c0392b', marginTop: 16 }}>{msg.texto}</p>}
    </div>
  )
}
