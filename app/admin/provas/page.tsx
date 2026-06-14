'use client'

import { useEffect, useState } from 'react'
import { academicoAPI, turmasAPI, pautasAPI, type AnoAcademico, type Trimestre } from '@/lib/api'

interface Turma { id: string; nome: string; ano_academico_id: string; max_alunos: number }
interface Disciplina { id: string; nome: string; turma_id: string; docente_id: string | null; carga_horaria: number | null }
interface Pauta { id: string; numero_serie: string; tipo: string; estado: string; pdf_url?: string | null }

const s = {
  input: { display: 'block', width: '100%', padding: 10, margin: '4px 0 12px', border: '1px solid var(--border-strong)', borderRadius: 8, boxSizing: 'border-box' as const } as React.CSSProperties,
  card: { background: 'var(--surface)', padding: 20, borderRadius: 12, marginBottom: 20, boxShadow: 'var(--shadow-sm)' } as React.CSSProperties,
}
const btn = (bg = 'var(--primary)', color = '#fff', extra?: React.CSSProperties): React.CSSProperties => ({
  padding: '8px 16px', background: bg, color, border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, ...extra,
})

const ESTADO_COLOR: Record<string, string> = { rascunho: '#888', validada: '#3498db', publicada: '#27ae60' }

export default function ProvasPage() {
  const [anos, setAnos] = useState<AnoAcademico[]>([])
  const [trimestres, setTrimestres] = useState<Trimestre[]>([])
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([])
  const [pautas, setPautas] = useState<Pauta[]>([])

  const [anoId, setAnoId] = useState('')
  const [triId, setTriId] = useState('')
  const [turmaId, setTurmaId] = useState('')
  const [discId, setDiscId] = useState('')

  const [erro, setErro] = useState('')
  const [msg, setMsg] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => { academicoAPI.listarAnos().then(setAnos).catch(() => {}) }, [])

  useEffect(() => {
    if (!anoId) { setTrimestres([]); setTurmas([]); return }
    academicoAPI.listarTrimestres(anoId).then(setTrimestres).catch(() => {})
    turmasAPI.listar(anoId).then(setTurmas).catch(() => {})
    setTriId(''); setTurmaId(''); setDiscId('')
  }, [anoId])

  useEffect(() => {
    if (!turmaId) { setDisciplinas([]); return }
    turmasAPI.listarDisciplinas(turmaId).then(setDisciplinas).catch(() => {})
    setDiscId('')
  }, [turmaId])

  async function gerarTrimestral(e: React.FormEvent) {
    e.preventDefault()
    if (!turmaId || !discId || !triId) { setErro('Seleccione turma, disciplina e trimestre.'); return }
    setSaving(true); setErro(''); setMsg('')
    try {
      const p = await pautasAPI.gerarTrimestral({ classe_id: turmaId, disciplina_id: discId, trimestre_id: triId })
      setPautas(prev => [p as Pauta, ...prev])
      setMsg('Pauta trimestral gerada: ' + (p as Pauta).numero_serie)
    } catch (err) { setErro((err as Error).message) }
    finally { setSaving(false) }
  }

  async function gerarFinal(e: React.FormEvent) {
    e.preventDefault()
    if (!turmaId || !anoId) { setErro('Seleccione turma e ano academico.'); return }
    setSaving(true); setErro(''); setMsg('')
    try {
      const p = await pautasAPI.gerarFinal({ classe_id: turmaId, ano_academico_id: anoId })
      setPautas(prev => [p as Pauta, ...prev])
      setMsg('Pauta final gerada: ' + (p as Pauta).numero_serie)
    } catch (err) { setErro((err as Error).message) }
    finally { setSaving(false) }
  }

  async function validar(id: string) {
    try {
      const p = await pautasAPI.validar(id)
      setPautas(prev => prev.map(x => x.id === id ? p as Pauta : x))
      setMsg('Pauta validada.')
    } catch (err) { setErro((err as Error).message) }
  }

  async function publicar(id: string) {
    try {
      const p = await pautasAPI.publicar(id)
      setPautas(prev => prev.map(x => x.id === id ? p as Pauta : x))
      setMsg('Pauta publicada.')
    } catch (err) { setErro((err as Error).message) }
  }

  return (
    <div>
      <h1 style={{ color: 'var(--primary)' }}>Pautas & Provas</h1>
      {erro && <p style={{ color: 'var(--danger)', marginBottom: 12 }}>{erro}</p>}
      {msg && <p style={{ color: '#27ae60', marginBottom: 12 }}>{msg}</p>}

      {/* Seleccao */}
      <div style={{ ...s.card, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
        <div>
          <label htmlFor="p-ano">Ano academico</label>
          <select id="p-ano" style={s.input} value={anoId} onChange={e => setAnoId(e.target.value)}>
            <option value="">-- Seleccione --</option>
            {anos.map(a => <option key={a.id} value={a.id}>{a.designacao}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="p-tri">Trimestre</label>
          <select id="p-tri" style={s.input} value={triId} onChange={e => setTriId(e.target.value)} disabled={!anoId}>
            <option value="">-- Seleccione --</option>
            {trimestres.map(t => <option key={t.id} value={t.id}>{t.designacao ?? `${t.numero}.o Trimestre`}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="p-turma">Turma</label>
          <select id="p-turma" style={s.input} value={turmaId} onChange={e => setTurmaId(e.target.value)} disabled={!anoId}>
            <option value="">-- Seleccione --</option>
            {turmas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="p-disc">Disciplina</label>
          <select id="p-disc" style={s.input} value={discId} onChange={e => setDiscId(e.target.value)} disabled={!turmaId}>
            <option value="">-- Seleccione --</option>
            {disciplinas.map(d => <option key={d.id} value={d.id}>{d.nome}</option>)}
          </select>
        </div>
      </div>

      {/* Acoes gerar */}
      <div style={{ ...s.card, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <form onSubmit={gerarTrimestral} style={{ display: 'flex', gap: 8 }}>
          <button type="submit" style={btn()} disabled={saving || !turmaId || !discId || !triId}>
            Gerar pauta trimestral
          </button>
        </form>
        <form onSubmit={gerarFinal} style={{ display: 'flex', gap: 8 }}>
          <button type="submit" style={btn('#8e44ad')} disabled={saving || !turmaId || !anoId}>
            Gerar pauta final (ano)
          </button>
        </form>
      </div>

      {/* Lista pautas geradas nesta sessao */}
      {pautas.length > 0 && (
        <div style={s.card}>
          <h3 style={{ marginTop: 0 }}>Pautas geradas nesta sessao</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--surface-alt,#f5f5f5)' }}>
                <th align="left" style={{ padding: '10px 12px' }}>N.o Serie</th>
                <th align="left" style={{ padding: '10px 12px' }}>Tipo</th>
                <th align="left" style={{ padding: '10px 12px' }}>Estado</th>
                <th style={{ padding: '10px 12px' }}>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {pautas.map(p => (
                <tr key={p.id} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 12px', fontFamily: 'monospace' }}>{p.numero_serie}</td>
                  <td style={{ padding: '10px 12px' }}>{p.tipo}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ background: (ESTADO_COLOR[p.estado] ?? '#888') + '22', color: ESTADO_COLOR[p.estado] ?? '#888', borderRadius: 20, padding: '3px 12px', fontSize: 12 }}>{p.estado}</span>
                  </td>
                  <td style={{ padding: '10px 12px', display: 'flex', gap: 8, justifyContent: 'center' }}>
                    {p.estado === 'rascunho' && <button style={btn('#3498db')} onClick={() => validar(p.id)}>Validar</button>}
                    {p.estado === 'validada' && <button style={btn('#27ae60')} onClick={() => publicar(p.id)}>Publicar</button>}
                    {p.pdf_url && <a href={p.pdf_url} target="_blank" rel="noreferrer" style={{ ...btn('#6c757d'), textDecoration: 'none' }}>PDF</a>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pautas.length === 0 && (
        <div style={{ ...s.card, color: '#888', textAlign: 'center', padding: 40 }}>
          Seleccione os filtros e clique em &quot;Gerar pauta&quot; para criar uma nova pauta.
        </div>
      )}
    </div>
  )
}
