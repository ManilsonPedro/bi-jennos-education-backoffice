// app/admin/calendario/page.tsx
'use client'

import { useEffect, useState } from 'react'
import {
  academicoAPI,
  calendarioAPI,
  type AnoAcademico,
  type EventoCalendario,
} from '@/lib/api'

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
const TIPOS = ['feriado', 'exame', 'reuniao', 'suspensao_aulas', 'actividade',
  'entrega_notas', 'inicio_trimestre', 'fim_trimestre', 'outro']

export default function CalendarioPage() {
  const [anos, setAnos] = useState<AnoAcademico[]>([])
  const [anoId, setAnoId] = useState('')
  const [calendarioId, setCalendarioId] = useState('')
  const [eventos, setEventos] = useState<EventoCalendario[]>([])
  const [tipo, setTipo] = useState('feriado')
  const [titulo, setTitulo] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [erro, setErro] = useState('')

  useEffect(() => {
    academicoAPI.listarAnos().then(setAnos).catch((e) => setErro(e.message))
  }, [])

  async function criar() {
    try {
      const c = await calendarioAPI.criar(anoId, 'Calendario')
      setCalendarioId(c.id)
      setEventos([])
    } catch (e) { setErro((e as Error).message) }
  }
  async function listar() {
    try { setEventos(await calendarioAPI.eventos(calendarioId)) }
    catch (e) { setErro((e as Error).message) }
  }
  async function adicionar(e: React.FormEvent) {
    e.preventDefault()
    try {
      await calendarioAPI.adicionarEvento(calendarioId, {
        tipo, titulo, data_inicio: dataInicio,
      })
      setTitulo(''); setDataInicio('')
      await listar()
    } catch (err) { setErro((err as Error).message) }
  }
  async function publicar() {
    try { await calendarioAPI.publicar(calendarioId); alert('Publicado.') }
    catch (e) { setErro((e as Error).message) }
  }

  return (
    <>
      <h1>Calendario academico</h1>
      {erro && <p style={{ color: 'var(--danger)' }}>{erro}</p>}

      <section style={card}>
        <h3>1. Criar calendario</h3>
        <label>Ano academico</label>
        <select style={input} value={anoId} onChange={(e) => setAnoId(e.target.value)}>
          <option value="">-- escolher --</option>
          {anos.map((a) => <option key={a.id} value={a.id}>{a.designacao}</option>)}
        </select>
        <button style={btn} disabled={!anoId} onClick={criar}>Criar calendario</button>
        <p style={{ color: 'var(--text-muted)' }}>ou cole o ID dum calendario ja existente:</p>
        <input style={input} value={calendarioId} onChange={(e) => setCalendarioId(e.target.value)} />
        <button style={btn} disabled={!calendarioId} onClick={listar}>Carregar eventos</button>
        <button style={btn} disabled={!calendarioId} onClick={publicar}>Publicar</button>
      </section>

      {calendarioId && (
        <section style={card}>
          <h3>2. Adicionar evento</h3>
          <form onSubmit={adicionar}>
            <label>Tipo</label>
            <select style={input} value={tipo} onChange={(e) => setTipo(e.target.value)}>
              {TIPOS.map((t) => <option key={t}>{t}</option>)}
            </select>
            <label>Titulo</label>
            <input style={input} value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
            <label>Data inicio (YYYY-MM-DD)</label>
            <input style={input} value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} required />
            <button style={btn}>Adicionar</button>
          </form>
        </section>
      )}

      {eventos.length > 0 && (
        <section style={{ ...card, maxWidth: 'unset' }}>
          <h3>Eventos</h3>
          <ul>
            {eventos.map((ev) => (
              <li key={ev.id}>
                <b>{ev.data_inicio}</b> — [{ev.tipo}] {ev.titulo}
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  )
}
