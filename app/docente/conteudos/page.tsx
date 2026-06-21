// app/docente/conteudos/page.tsx
'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { conteudosAPI, type Cumprimento, type Unidade } from '@/lib/api'

const card: React.CSSProperties = {
  background: 'var(--surface)', padding: 24, borderRadius: 12, maxWidth: 720,
  boxShadow: 'var(--shadow-sm)', marginBottom: 24,
}
const input: React.CSSProperties = {
  display: 'block', width: '100%', padding: 10, margin: '6px 0 16px',
  border: '1px solid var(--border-strong)', borderRadius: 8,
}
const btn: React.CSSProperties = {
  padding: '8px 14px', background: 'var(--primary)', color: '#fff',
  border: 'none', borderRadius: 8, marginRight: 8,
}

export default function ConteudosPage() {
  const [disciplinaId, setDisciplinaId] = useState('')
  const [anoId, setAnoId] = useState('')
  const [unidades, setUnidades] = useState<Unidade[]>([])
  const [cumprimento, setCumprimento] = useState<Cumprimento | null>(null)
  const [titulo, setTitulo] = useState('')
  const [carga, setCarga] = useState('4')
  const [sumario, setSumario] = useState({ titulo: '', data_aula: '', unidade_id: '' })
  const [erro, setErro] = useState('')

  async function carregar() {
    try {
      setUnidades(await conteudosAPI.unidades(disciplinaId, anoId))
      setCumprimento(await conteudosAPI.cumprimento(disciplinaId, anoId))
    } catch (e) { setErro((e as Error).message) }
  }
  async function novaUnidade() {
    try {
      await conteudosAPI.criarUnidade({
        disciplina_id: disciplinaId, ano_academico_id: anoId,
        titulo, ordem: unidades.length + 1, carga_horaria: Number(carga),
      })
      setTitulo(''); await carregar()
    } catch (e) { setErro((e as Error).message) }
  }
  async function novoSumario(e: React.FormEvent) {
    e.preventDefault()
    try {
      await conteudosAPI.registarSumario({
        disciplina_id: disciplinaId, ano_academico_id: anoId, ...sumario,
      })
      setSumario({ titulo: '', data_aula: '', unidade_id: '' })
      await carregar()
    } catch (err) { setErro((err as Error).message) }
  }

  return (
    <>
      <PageHeader title="Conteudos programaticos" />
      {erro && <p style={{ color: 'var(--danger)' }}>{erro}</p>}

      <section style={card}>
        <label>Disciplina ID</label>
        <input style={input} value={disciplinaId} onChange={(e) => setDisciplinaId(e.target.value)} />
        <label>Ano academico ID</label>
        <input style={input} value={anoId} onChange={(e) => setAnoId(e.target.value)} />
        <button style={btn} disabled={!disciplinaId || !anoId} onClick={carregar}>Carregar</button>
      </section>

      {cumprimento && (
        <section style={card}>
          <h3>Cumprimento</h3>
          <p>Unidades: <b>{cumprimento.total_unidades}</b></p>
          <p>Sumarios: <b>{cumprimento.total_sumarios}</b></p>
          <p>Percentagem: <b>{cumprimento.percentagem}%</b></p>
        </section>
      )}

      {disciplinaId && anoId && (
        <>
          <section style={card}>
            <h3>Nova unidade tematica</h3>
            <input style={input} placeholder="Titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
            <input style={input} placeholder="Carga horaria" value={carga} onChange={(e) => setCarga(e.target.value)} />
            <button style={btn} onClick={novaUnidade}>Criar</button>
          </section>

          {unidades.length > 0 && (
            <section style={card}>
              <h3>Novo sumario</h3>
              <form onSubmit={novoSumario}>
                <label>Unidade</label>
                <select style={input} value={sumario.unidade_id} onChange={(e) => setSumario({ ...sumario, unidade_id: e.target.value })}>
                  <option value="">--</option>
                  {unidades.map((u) => <option key={u.id} value={u.id}>{u.titulo}</option>)}
                </select>
                <label>Titulo do sumario</label>
                <input style={input} value={sumario.titulo} onChange={(e) => setSumario({ ...sumario, titulo: e.target.value })} required />
                <label>Data da aula</label>
                <input style={input} value={sumario.data_aula} onChange={(e) => setSumario({ ...sumario, data_aula: e.target.value })} placeholder="YYYY-MM-DD" required />
                <button style={btn}>Registar</button>
              </form>
            </section>
          )}

          <section style={card}>
            <h3>Unidades ({unidades.length})</h3>
            <ul>{unidades.map((u) => <li key={u.id}>#{u.ordem} — {u.titulo} ({u.carga_horaria}h)</li>)}</ul>
          </section>
        </>
      )}
    </>
  )
}
