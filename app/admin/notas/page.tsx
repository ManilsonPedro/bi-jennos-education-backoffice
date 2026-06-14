'use client'

import { useEffect, useState } from 'react'
import { academicoAPI, turmasAPI, avaliacoesAPI, docenteAPI, type AnoAcademico, type Trimestre } from '@/lib/api'

interface Disciplina { id: string; nome: string; turma_id: string; docente_id: string | null; carga_horaria: number | null }
interface AlunoTurma { aluno_id: string; numero_aluno: string; nome_completo: string }
interface NotaLote { aluno_id: string; nota: number }

const s = {
  input: { display: 'block', width: '100%', padding: 10, margin: '4px 0 12px', border: '1px solid var(--border-strong)', borderRadius: 8, boxSizing: 'border-box' as const } as React.CSSProperties,
  card: { background: 'var(--surface)', padding: 20, borderRadius: 12, marginBottom: 20, boxShadow: 'var(--shadow-sm)' } as React.CSSProperties,
}
const btn = (bg = 'var(--primary)', color = '#fff', extra?: React.CSSProperties): React.CSSProperties => ({
  padding: '8px 16px', background: bg, color, border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, ...extra,
})

const TIPOS_AVALIACAO = ['MAC', 'PAC', 'FAC', 'NPP', 'exame']

export default function NotasPage() {
  const [anos, setAnos] = useState<AnoAcademico[]>([])
  const [trimestres, setTrimestres] = useState<Trimestre[]>([])
  const [turmas, setTurmas] = useState<{ id: string; nome: string; ano_academico_id: string; max_alunos: number }[]>([])
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([])
  const [alunos, setAlunos] = useState<AlunoTurma[]>([])

  const [anoId, setAnoId] = useState('')
  const [triId, setTriId] = useState('')
  const [turmaId, setTurmaId] = useState('')
  const [discId, setDiscId] = useState('')
  const [tipo, setTipo] = useState('MAC')

  const [notas, setNotas] = useState<Record<string, string>>({})
  const [erro, setErro] = useState('')
  const [msg, setMsg] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    academicoAPI.listarAnos().then(setAnos).catch(() => {})
  }, [])

  useEffect(() => {
    if (!anoId) { setTrimestres([]); setTurmas([]); return }
    academicoAPI.listarTrimestres(anoId).then(setTrimestres).catch(() => {})
    turmasAPI.listar(anoId).then(setTurmas).catch(() => {})
    setTriId(''); setTurmaId(''); setDiscId('')
  }, [anoId])

  useEffect(() => {
    if (!turmaId) { setDisciplinas([]); setAlunos([]); return }
    turmasAPI.listarDisciplinas(turmaId).then(setDisciplinas).catch(() => {})
    if (anoId) {
      docenteAPI.alunosDaClasse(turmaId, anoId).then(setAlunos).catch(() => {})
    }
    setDiscId('')
  }, [turmaId, anoId])

  async function lancarNotas(e: React.FormEvent) {
    e.preventDefault()
    if (!discId || !triId) { setErro('Seleccione disciplina e trimestre.'); return }
    setSaving(true); setErro(''); setMsg('')
    try {
      const lote: NotaLote[] = alunos
        .filter(a => notas[a.aluno_id] !== undefined && notas[a.aluno_id] !== '')
        .map(a => ({ aluno_id: a.aluno_id, nota: Number(notas[a.aluno_id]) }))
      if (lote.length === 0) { setErro('Nenhuma nota preenchida.'); return }
      await docenteAPI.lancarNotasLote(discId, triId, tipo, lote)
      setMsg(`${lote.length} notas lancadas com sucesso.`)
      setNotas({})
    } catch (err) { setErro((err as Error).message) }
    finally { setSaving(false) }
  }

  const discNome = disciplinas.find(d => d.id === discId)?.nome ?? ''

  return (
    <div>
      <h1 style={{ color: 'var(--primary)' }}>Lancamento de Notas</h1>
      {erro && <p style={{ color: 'var(--danger)', marginBottom: 12 }}>{erro}</p>}
      {msg && <p style={{ color: '#27ae60', marginBottom: 12 }}>{msg}</p>}

      {/* Filtros */}
      <div style={{ ...s.card, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
        <div>
          <label htmlFor="n-ano">Ano academico</label>
          <select id="n-ano" style={s.input} value={anoId} onChange={e => setAnoId(e.target.value)}>
            <option value="">-- Seleccione --</option>
            {anos.map(a => <option key={a.id} value={a.id}>{a.designacao}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="n-tri">Trimestre</label>
          <select id="n-tri" style={s.input} value={triId} onChange={e => setTriId(e.target.value)} disabled={!anoId}>
            <option value="">-- Seleccione --</option>
            {trimestres.map(t => <option key={t.id} value={t.id}>{t.designacao ?? `${t.numero}.o Trimestre`}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="n-turma">Turma</label>
          <select id="n-turma" style={s.input} value={turmaId} onChange={e => setTurmaId(e.target.value)} disabled={!anoId}>
            <option value="">-- Seleccione --</option>
            {turmas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="n-disc">Disciplina</label>
          <select id="n-disc" style={s.input} value={discId} onChange={e => setDiscId(e.target.value)} disabled={!turmaId}>
            <option value="">-- Seleccione --</option>
            {disciplinas.map(d => <option key={d.id} value={d.id}>{d.nome}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="n-tipo">Tipo de avaliacao</label>
          <select id="n-tipo" style={s.input} value={tipo} onChange={e => setTipo(e.target.value)}>
            {TIPOS_AVALIACAO.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* Tabela de notas */}
      {alunos.length > 0 && discId && triId ? (
        <form onSubmit={lancarNotas}>
          <div style={s.card}>
            <h3 style={{ marginTop: 0 }}>
              {discNome} — {TIPOS_AVALIACAO.find(t => t === tipo)} — {trimestres.find(t => t.id === triId)?.designacao ?? ''}
            </h3>
            <p style={{ color: '#888', fontSize: 13, marginBottom: 16 }}>Escala 0–20. Deixe em branco para nao lancar.</p>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--surface-alt,#f5f5f5)' }}>
                  <th align="left" style={{ padding: '10px 12px' }}>N.o</th>
                  <th align="left" style={{ padding: '10px 12px' }}>Nome do aluno</th>
                  <th style={{ padding: '10px 12px', width: 120 }}>Nota (0–20)</th>
                </tr>
              </thead>
              <tbody>
                {alunos.map(a => (
                  <tr key={a.aluno_id} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '8px 12px', color: '#888', fontSize: 13 }}>{a.numero_aluno}</td>
                    <td style={{ padding: '8px 12px' }}>{a.nome_completo}</td>
                    <td style={{ padding: '8px 12px' }}>
                      <input
                        type="number"
                        min="0" max="20" step="0.5"
                        placeholder="—"
                        style={{ width: 80, padding: '6px 8px', border: '1px solid var(--border-strong)', borderRadius: 6, textAlign: 'center' }}
                        value={notas[a.aluno_id] ?? ''}
                        onChange={e => setNotas(prev => ({ ...prev, [a.aluno_id]: e.target.value }))}
                        aria-label={`Nota de ${a.nome_completo}`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ marginTop: 16 }}>
              <button type="submit" style={btn()} disabled={saving}>{saving ? 'A lancar...' : 'Lancar notas'}</button>
            </div>
          </div>
        </form>
      ) : (
        <div style={{ ...s.card, color: '#888', textAlign: 'center', padding: 40 }}>
          Seleccione ano academico, trimestre, turma e disciplina para lancar notas.
        </div>
      )}
    </div>
  )
}
