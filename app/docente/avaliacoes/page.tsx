'use client'

import { useEffect, useState } from 'react'
import { docenteAPI, avaliacoesAPI } from '@/lib/api'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'

interface Turma {
  classe_id: string
  disciplinas: Array<{ id: string; nome: string }>
}

interface Aluno {
  aluno_id: string
  numero_aluno: string
  nome_completo: string
}

interface LinhaLote {
  aluno_id: string
  numero_aluno: string
  nome_completo: string
  nota: string
}

const TIPOS = ['continua', 'teste', 'exame', 'trabalho', 'oral']
const TIPO_LABEL: Record<string, string> = {
  continua: 'Contínua', teste: 'Teste', exame: 'Exame', trabalho: 'Trabalho', oral: 'Oral',
}

const sel: React.CSSProperties = {
  padding: '9px 12px', borderRadius: 8, border: '1px solid var(--border-strong)',
  background: 'var(--input-bg)', color: 'var(--text)', fontSize: 14, width: '100%',
}

export default function AvaliacoesPage() {
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [classeId, setClasseId] = useState('')
  const [anoId, setAnoId] = useState('')
  const [disciplinaId, setDisciplinaId] = useState('')
  const [trimestreId, setTrimestreId] = useState('')
  const [tipo, setTipo] = useState('teste')
  const [notaMaxima, setNotaMaxima] = useState('20')

  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [linhas, setLinhas] = useState<LinhaLote[]>([])

  const [carregandoAlunos, setCarregandoAlunos] = useState(false)
  const [a_submeter, setASubmeter] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; texto: string } | null>(null)

  // Modo individual (fallback)
  const [modoIndividual, setModoIndividual] = useState(false)
  const [formInd, setFormInd] = useState({ aluno_id: '', disciplina_id: '', trimestre_id: '', tipo: 'teste', nota: '', nota_maxima: '20' })

  useEffect(() => {
    docenteAPI.minhasTurmas().then(setTurmas).catch(() => {})
  }, [])

  const turmaActual = turmas.find((t) => t.classe_id === classeId)
  const disciplinas = turmaActual?.disciplinas ?? []

  const carregarAlunos = async () => {
    if (!classeId || !anoId) return
    setCarregandoAlunos(true)
    setMsg(null)
    try {
      const lista = await docenteAPI.alunosDaClasse(classeId, anoId)
      setAlunos(lista)
      setLinhas(lista.map((a) => ({ aluno_id: a.aluno_id, numero_aluno: a.numero_aluno, nome_completo: a.nome_completo, nota: '' })))
    } catch (e) {
      setMsg({ ok: false, texto: e instanceof Error ? e.message : 'Erro ao carregar alunos' })
    } finally {
      setCarregandoAlunos(false)
    }
  }

  const atualizarNota = (idx: number, valor: string) => {
    setLinhas((prev) => prev.map((l, i) => i === idx ? { ...l, nota: valor } : l))
  }

  const preencherTodos = (valor: string) => {
    setLinhas((prev) => prev.map((l) => ({ ...l, nota: valor })))
  }

  const lancarLote = async () => {
    if (!disciplinaId || !trimestreId) {
      setMsg({ ok: false, texto: 'Seleccione a disciplina e o trimestre.' })
      return
    }
    const max = parseFloat(notaMaxima) || 20
    const notas = linhas
      .filter((l) => l.nota.trim() !== '')
      .map((l) => ({ aluno_id: l.aluno_id, nota: Math.min(parseFloat(l.nota), max) }))

    if (notas.length === 0) {
      setMsg({ ok: false, texto: 'Preencha pelo menos uma nota.' })
      return
    }

    setASubmeter(true)
    setMsg(null)
    try {
      await docenteAPI.lancarNotasLote(disciplinaId, trimestreId, tipo, notas)
      setMsg({ ok: true, texto: `${notas.length} nota(s) lancada(s) com sucesso.` })
      setLinhas((prev) => prev.map((l) => ({ ...l, nota: '' })))
    } catch (e) {
      setMsg({ ok: false, texto: e instanceof Error ? e.message : 'Erro ao lancar notas' })
    } finally {
      setASubmeter(false)
    }
  }

  const lancarIndividual = async (ev: React.FormEvent) => {
    ev.preventDefault()
    setMsg(null)
    setASubmeter(true)
    try {
      await avaliacoesAPI.lancarNota(formInd)
      setMsg({ ok: true, texto: 'Nota lancada com sucesso.' })
      setFormInd((f) => ({ ...f, nota: '' }))
    } catch (e) {
      setMsg({ ok: false, texto: e instanceof Error ? e.message : 'Erro' })
    } finally {
      setASubmeter(false)
    }
  }

  const preenchidos = linhas.filter((l) => l.nota.trim() !== '').length

  return (
    <div className="animate-fade">
      <PageHeader
        title="Lancamento de Notas"
        subtitle="Lance notas em lote para toda a turma ou individualmente"
        breadcrumb={['Portal Docente', 'Avaliacoes']}
        accent="var(--cat-academico)"
      />

      {msg && <Alert tone={msg.ok ? 'success' : 'danger'}>{msg.texto}</Alert>}

      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <button
          onClick={() => setModoIndividual(false)}
          style={{
            padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: !modoIndividual ? 'var(--primary)' : 'var(--surface-raised)',
            color: !modoIndividual ? '#fff' : 'var(--text)', fontWeight: 600, fontSize: 14,
          }}
        >
          Lancamento em Lote
        </button>
        <button
          onClick={() => setModoIndividual(true)}
          style={{
            padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: modoIndividual ? 'var(--primary)' : 'var(--surface-raised)',
            color: modoIndividual ? '#fff' : 'var(--text)', fontWeight: 600, fontSize: 14,
          }}
        >
          Individual
        </button>
      </div>

      {/* ── MODO LOTE ── */}
      {!modoIndividual && (
        <>
          <Card title="Configuracao" subtitle="Seleccione turma, disciplina e tipo de avaliacao">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Turma/Classe</label>
                <select style={sel} value={classeId} onChange={(e) => { setClasseId(e.target.value); setDisciplinaId('') }}>
                  <option value="">Seleccionar...</option>
                  {turmas.map((t) => <option key={t.classe_id} value={t.classe_id}>{t.classe_id.slice(0, 8)}...</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Ano Academico ID</label>
                <input
                  style={{ ...sel, width: 'auto', boxSizing: 'border-box', display: 'block' }}
                  value={anoId}
                  onChange={(e) => setAnoId(e.target.value)}
                  placeholder="UUID do ano"
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Disciplina</label>
                <select style={sel} value={disciplinaId} onChange={(e) => setDisciplinaId(e.target.value)} disabled={!classeId}>
                  <option value="">Seleccionar...</option>
                  {disciplinas.map((d) => <option key={d.id} value={d.id}>{d.nome}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Trimestre ID</label>
                <input
                  style={{ ...sel, width: 'auto', boxSizing: 'border-box', display: 'block' }}
                  value={trimestreId}
                  onChange={(e) => setTrimestreId(e.target.value)}
                  placeholder="UUID do trimestre"
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Tipo de Avaliacao</label>
                <select style={sel} value={tipo} onChange={(e) => setTipo(e.target.value)}>
                  {TIPOS.map((t) => <option key={t} value={t}>{TIPO_LABEL[t]}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Nota Maxima</label>
                <input
                  type="number"
                  style={{ ...sel, width: 'auto', boxSizing: 'border-box', display: 'block' }}
                  value={notaMaxima}
                  onChange={(e) => setNotaMaxima(e.target.value)}
                  min={1} max={100}
                />
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <button
                onClick={carregarAlunos}
                disabled={!classeId || !anoId || carregandoAlunos}
                style={{
                  padding: '10px 22px', borderRadius: 8, border: 'none',
                  background: 'var(--primary)', color: '#fff', cursor: 'pointer',
                  fontWeight: 600, fontSize: 14, opacity: (!classeId || !anoId) ? 0.5 : 1,
                }}
              >
                {carregandoAlunos ? 'A carregar...' : 'Carregar Alunos da Turma'}
              </button>
            </div>
          </Card>

          {/* Tabela de notas */}
          {linhas.length > 0 && (
            <Card
              title={`Notas — ${TIPO_LABEL[tipo]} (max: ${notaMaxima})`}
              subtitle={`${preenchidos} de ${linhas.length} alunos preenchidos`}
            >
              <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Preencher todos com:</span>
                {['0', '10', '12', '14', '16', '18', '20'].map((v) => (
                  <button
                    key={v}
                    onClick={() => preencherTodos(v)}
                    style={{
                      padding: '4px 12px', borderRadius: 6, border: '1px solid var(--border)',
                      background: 'var(--surface-raised)', cursor: 'pointer', fontSize: 13,
                    }}
                  >
                    {v}
                  </button>
                ))}
                <button
                  onClick={() => preencherTodos('')}
                  style={{
                    padding: '4px 12px', borderRadius: 6, border: '1px solid var(--border)',
                    background: 'var(--surface-raised)', cursor: 'pointer', fontSize: 13, color: 'var(--text-muted)',
                  }}
                >
                  Limpar
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--surface-raised)' }}>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', width: 40 }}>#</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Nº</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Nome</th>
                      <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', width: 100 }}>
                        Nota (/{notaMaxima})
                      </th>
                      <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', width: 80 }}>%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {linhas.map((l, i) => {
                      const n = parseFloat(l.nota)
                      const max = parseFloat(notaMaxima) || 20
                      const pct = !isNaN(n) && l.nota !== '' ? Math.round((n / max) * 100) : null
                      const cor = pct === null ? 'transparent' : pct >= 50 ? '#22c55e' : '#ef4444'
                      return (
                        <tr key={l.aluno_id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '8px 12px', fontSize: 13, color: 'var(--text-muted)' }}>{i + 1}</td>
                          <td style={{ padding: '8px 12px', fontSize: 13 }}><code>{l.numero_aluno}</code></td>
                          <td style={{ padding: '8px 12px', fontSize: 14, fontWeight: 500 }}>{l.nome_completo}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                            <input
                              type="number"
                              min={0}
                              max={max}
                              step={0.5}
                              value={l.nota}
                              onChange={(e) => atualizarNota(i, e.target.value)}
                              style={{
                                width: 72, padding: '6px 8px', borderRadius: 6, textAlign: 'center',
                                border: `2px solid ${l.nota !== '' ? cor : 'var(--border)'}`,
                                background: 'var(--input-bg)', color: 'var(--text)', fontSize: 15, fontWeight: 700,
                              }}
                            />
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                            {pct !== null && (
                              <span style={{
                                fontSize: 13, fontWeight: 700, color: cor,
                                background: cor + '18', padding: '2px 8px', borderRadius: 20,
                              }}>
                                {pct}%
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end', gap: 12, alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  {preenchidos}/{linhas.length} preenchidos
                </span>
                <button
                  onClick={lancarLote}
                  disabled={a_submeter || preenchidos === 0}
                  style={{
                    padding: '11px 28px', borderRadius: 8, border: 'none',
                    background: 'var(--primary)', color: '#fff', cursor: 'pointer',
                    fontWeight: 700, fontSize: 15, opacity: (a_submeter || preenchidos === 0) ? 0.6 : 1,
                  }}
                >
                  {a_submeter ? 'A lancar...' : `Lancar ${preenchidos} Nota(s)`}
                </button>
              </div>
            </Card>
          )}
        </>
      )}

      {/* ── MODO INDIVIDUAL ── */}
      {modoIndividual && (
        <Card title="Lancamento Individual" subtitle="Lanca uma nota de cada vez" maxWidth={500}>
          <form onSubmit={lancarIndividual} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { id: 'aluno_id', label: 'ID do Aluno', placeholder: 'UUID do aluno' },
              { id: 'disciplina_id', label: 'ID da Disciplina', placeholder: 'UUID da disciplina' },
              { id: 'trimestre_id', label: 'ID do Trimestre', placeholder: 'UUID do trimestre' },
            ].map(({ id, label, placeholder }) => (
              <div key={id}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>{label}</label>
                <input
                  style={{ ...sel, boxSizing: 'border-box' }}
                  value={(formInd as Record<string, string>)[id]}
                  onChange={(e) => setFormInd((f) => ({ ...f, [id]: e.target.value }))}
                  placeholder={placeholder}
                  required
                />
              </div>
            ))}

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Tipo</label>
              <select style={sel} value={formInd.tipo} onChange={(e) => setFormInd((f) => ({ ...f, tipo: e.target.value }))}>
                {TIPOS.map((t) => <option key={t} value={t}>{TIPO_LABEL[t]}</option>)}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Nota</label>
                <input type="number" step="0.5" style={sel} value={formInd.nota}
                  onChange={(e) => setFormInd((f) => ({ ...f, nota: e.target.value }))} required />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Nota Maxima</label>
                <input type="number" step="0.5" style={sel} value={formInd.nota_maxima}
                  onChange={(e) => setFormInd((f) => ({ ...f, nota_maxima: e.target.value }))} />
              </div>
            </div>

            <button
              type="submit"
              disabled={a_submeter}
              style={{
                padding: '11px', borderRadius: 8, border: 'none',
                background: 'var(--primary)', color: '#fff', cursor: 'pointer',
                fontWeight: 700, fontSize: 15, opacity: a_submeter ? 0.7 : 1,
              }}
            >
              {a_submeter ? 'A lancar...' : 'Lancar Nota'}
            </button>
          </form>
        </Card>
      )}
    </div>
  )
}
