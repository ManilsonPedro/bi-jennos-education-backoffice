// app/admin/horarios/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { horariosAPI, type ItemCronograma, type Sala } from '@/lib/api'

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
const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab']

export default function HorariosPage() {
  const [salas, setSalas] = useState<Sala[]>([])
  const [novaSala, setNovaSala] = useState('')
  const [classeId, setClasseId] = useState('')
  const [anoId, setAnoId] = useState('')
  const [cronograma, setCronograma] = useState('')
  const [itens, setItens] = useState<ItemCronograma[]>([])
  const [form, setForm] = useState({
    disciplina_id: '', docente_id: '', sala_id: '',
    dia_semana: '1', hora_inicio: '08:00', hora_fim: '09:00',
  })
  const [erro, setErro] = useState('')

  async function carregarSalas() {
    try { setSalas(await horariosAPI.salas()) }
    catch (e) { setErro((e as Error).message) }
  }
  useEffect(() => { carregarSalas() }, [])

  async function criarSala() {
    try {
      await horariosAPI.criarSala({ nome: novaSala })
      setNovaSala(''); await carregarSalas()
    } catch (e) { setErro((e as Error).message) }
  }
  async function criarCronograma() {
    try {
      const c = await horariosAPI.criarCronograma({
        classe_id: classeId, ano_academico_id: anoId,
      })
      setCronograma(c.id); setItens([])
    } catch (e) { setErro((e as Error).message) }
  }
  async function listar() {
    try { setItens(await horariosAPI.itens(cronograma)) }
    catch (e) { setErro((e as Error).message) }
  }
  async function adicionar(e: React.FormEvent) {
    e.preventDefault()
    try {
      await horariosAPI.adicionarItem(cronograma, {
        ...form, dia_semana: Number(form.dia_semana),
      })
      await listar()
    } catch (err) { setErro((err as Error).message) }
  }
  async function remover(id: string) {
    await horariosAPI.removerItem(id); await listar()
  }

  return (
    <>
      <h1>Horarios</h1>
      {erro && <p style={{ color: 'var(--danger)' }}>{erro}</p>}

      <section style={card}>
        <h3>Salas ({salas.length})</h3>
        <ul>{salas.map((s) => <li key={s.id}>{s.nome}</li>)}</ul>
        <input style={input} placeholder="Nova sala" value={novaSala} onChange={(e) => setNovaSala(e.target.value)} />
        <button style={btn} disabled={!novaSala} onClick={criarSala}>Criar sala</button>
      </section>

      <section style={card}>
        <h3>Cronograma</h3>
        <label>Classe ID</label>
        <input style={input} value={classeId} onChange={(e) => setClasseId(e.target.value)} />
        <label>Ano academico ID</label>
        <input style={input} value={anoId} onChange={(e) => setAnoId(e.target.value)} />
        <button style={btn} onClick={criarCronograma}>Criar cronograma</button>
        <label>Ou cronograma existente:</label>
        <input style={input} value={cronograma} onChange={(e) => setCronograma(e.target.value)} />
        <button style={btn} disabled={!cronograma} onClick={listar}>Listar itens</button>
      </section>

      {cronograma && (
        <section style={card}>
          <h3>Adicionar item</h3>
          <form onSubmit={adicionar}>
            <label>Disciplina ID</label>
            <input style={input} value={form.disciplina_id} onChange={(e) => setForm({ ...form, disciplina_id: e.target.value })} />
            <label>Docente ID</label>
            <input style={input} value={form.docente_id} onChange={(e) => setForm({ ...form, docente_id: e.target.value })} />
            <label>Sala</label>
            <select style={input} value={form.sala_id} onChange={(e) => setForm({ ...form, sala_id: e.target.value })}>
              <option value="">--</option>
              {salas.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
            </select>
            <label>Dia da semana</label>
            <select style={input} value={form.dia_semana} onChange={(e) => setForm({ ...form, dia_semana: e.target.value })}>
              {DIAS.map((d, i) => <option key={i} value={i}>{i} — {d}</option>)}
            </select>
            <label>Hora inicio (HH:MM)</label>
            <input style={input} value={form.hora_inicio} onChange={(e) => setForm({ ...form, hora_inicio: e.target.value })} />
            <label>Hora fim (HH:MM)</label>
            <input style={input} value={form.hora_fim} onChange={(e) => setForm({ ...form, hora_fim: e.target.value })} />
            <button style={btn}>Adicionar (valida colisoes)</button>
          </form>
        </section>
      )}

      {itens.length > 0 && (
        <section style={{ ...card, maxWidth: 'unset' }}>
          <h3>Itens ({itens.length})</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr><th>Dia</th><th>Inicio</th><th>Fim</th><th>Sala</th><th></th></tr></thead>
            <tbody>
              {itens.map((it) => (
                <tr key={it.id}>
                  <td>{DIAS[it.dia_semana]}</td>
                  <td>{it.hora_inicio}</td>
                  <td>{it.hora_fim}</td>
                  <td>{salas.find((s) => s.id === it.sala_id)?.nome ?? it.sala_id}</td>
                  <td><button style={btn} onClick={() => remover(it.id)}>x</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </>
  )
}
