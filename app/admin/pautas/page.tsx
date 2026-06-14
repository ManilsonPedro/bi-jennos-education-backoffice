// app/admin/pautas/page.tsx
'use client'

import { useState } from 'react'
import { pautasAPI, type Pauta } from '@/lib/api'

const card: React.CSSProperties = {
  background: 'var(--surface)', padding: 24, borderRadius: 12, maxWidth: 640,
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

export default function PautasPage() {
  const [classeId, setClasseId] = useState('')
  const [disciplinaId, setDisciplinaId] = useState('')
  const [trimestreId, setTrimestreId] = useState('')
  const [anoId, setAnoId] = useState('')
  const [pauta, setPauta] = useState<Pauta | null>(null)
  const [erro, setErro] = useState('')

  async function gerarTrimestral() {
    try {
      setErro('')
      setPauta(await pautasAPI.gerarTrimestral({
        classe_id: classeId, disciplina_id: disciplinaId, trimestre_id: trimestreId,
      }))
    } catch (e) { setErro((e as Error).message) }
  }
  async function gerarFinal() {
    try {
      setErro('')
      setPauta(await pautasAPI.gerarFinal({ classe_id: classeId, ano_academico_id: anoId }))
    } catch (e) { setErro((e as Error).message) }
  }
  async function validar() {
    if (pauta) setPauta(await pautasAPI.validar(pauta.id))
  }
  async function publicar() {
    if (pauta) setPauta(await pautasAPI.publicar(pauta.id))
  }

  return (
    <>
      <h1>Pautas</h1>
      {erro && <p style={{ color: 'var(--danger)' }}>{erro}</p>}

      <section style={card}>
        <h3>Pauta trimestral</h3>
        <label>Classe ID</label>
        <input style={input} value={classeId} onChange={(e) => setClasseId(e.target.value)} />
        <label>Disciplina ID</label>
        <input style={input} value={disciplinaId} onChange={(e) => setDisciplinaId(e.target.value)} />
        <label>Trimestre ID</label>
        <input style={input} value={trimestreId} onChange={(e) => setTrimestreId(e.target.value)} />
        <button style={btn} onClick={gerarTrimestral}>Gerar trimestral</button>
      </section>

      <section style={card}>
        <h3>Pauta final (ano)</h3>
        <label>Ano academico ID</label>
        <input style={input} value={anoId} onChange={(e) => setAnoId(e.target.value)} />
        <button style={btn} onClick={gerarFinal}>Gerar final</button>
      </section>

      {pauta && (
        <section style={card}>
          <h3>Pauta gerada</h3>
          <p>Serie: <b>{pauta.numero_serie}</b></p>
          <p>Tipo: {pauta.tipo} · Estado: <b>{pauta.estado}</b></p>
          <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            <button style={btn} onClick={validar}>Validar</button>
            <button style={btn} onClick={publicar}>Publicar</button>
            <a
              href={`${process.env.NEXT_PUBLIC_API_URL ?? 'https://bijennos-api.onrender.com/api/v1'}/pautas/${pauta.id}/pdf`}
              target="_blank"
              rel="noreferrer"
              style={{ ...btn, background: '#e74c3c', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
            >
              Descarregar PDF
            </a>
          </div>
        </section>
      )}
    </>
  )
}
