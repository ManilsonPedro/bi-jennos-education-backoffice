'use client'

import { useEffect, useState } from 'react'
import { academicoAPI, type AnoAcademico, type Trimestre } from '@/lib/api'

const s = {
  card: { background: 'var(--surface)', padding: 24, borderRadius: 12, maxWidth: 680, boxShadow: 'var(--shadow-sm)', marginBottom: 24 } as React.CSSProperties,
  input: { display: 'block', width: '100%', padding: 10, margin: '6px 0 14px', border: '1px solid var(--border-strong)', borderRadius: 8 } as React.CSSProperties,
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 } as React.CSSProperties,
  modal: { background: 'var(--surface)', borderRadius: 14, padding: 28, width: 500, maxHeight: '90vh', overflowY: 'auto' as const, boxShadow: '0 8px 32px rgba(0,0,0,.25)' } as React.CSSProperties,
}
const btn = (bg = 'var(--primary)', color = '#fff', extra?: React.CSSProperties): React.CSSProperties => ({
  padding: '7px 14px', background: bg, color, border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, ...extra,
})

const ESTADO_COLOR: Record<string, string> = { configuracao: '#888', aberto: '#27ae60', encerrado: '#e74c3c' }

export default function AnosAcademicosPage() {
  const [anos, setAnos] = useState<AnoAcademico[]>([])
  const [trimestres, setTrimestres] = useState<Record<string, Trimestre[]>>({})
  const [anoAberto, setAnoAberto] = useState<string | null>(null)
  const [erro, setErro] = useState('')
  const [msg, setMsg] = useState('')

  // Form criar ano
  const [formAno, setFormAno] = useState({ designacao: '', data_inicio: '', data_fim: '' })

  // Modal editar ano
  const [editAno, setEditAno] = useState<AnoAcademico | null>(null)
  const [editAnoForm, setEditAnoForm] = useState({ designacao: '', data_inicio: '', data_fim: '' })

  // Confirm delete
  const [confirmDel, setConfirmDel] = useState<AnoAcademico | null>(null)

  // Modal trimestre
  const [modalTrimestre, setModalTrimestre] = useState<{ ano: AnoAcademico; tri?: Trimestre } | null>(null)
  const [triForm, setTriForm] = useState({ numero: '1', designacao: '', data_inicio: '', data_fim: '' })

  // Confirm fechar trimestre
  const [confirmFechar, setConfirmFechar] = useState<{ anoId: string; tri: Trimestre } | null>(null)
  const [confirmDelTri, setConfirmDelTri] = useState<{ anoId: string; tri: Trimestre } | null>(null)

  const [saving, setSaving] = useState(false)

  async function carregar() {
    try { setAnos(await academicoAPI.listarAnos()) }
    catch (e) { setErro((e as Error).message) }
  }

  async function carregarTrimestres(anoId: string) {
    try {
      const ts = await academicoAPI.listarTrimestres(anoId)
      setTrimestres(prev => ({ ...prev, [anoId]: ts }))
    } catch { /* silencioso */ }
  }

  useEffect(() => { carregar() }, [])

  function toggleAno(anoId: string) {
    if (anoAberto === anoId) { setAnoAberto(null); return }
    setAnoAberto(anoId)
    carregarTrimestres(anoId)
  }

  async function criarAno(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setErro(''); setMsg('')
    try {
      await academicoAPI.criarAno(formAno)
      setFormAno({ designacao: '', data_inicio: '', data_fim: '' })
      setMsg('Ano academico criado.')
      await carregar()
    } catch (err) { setErro((err as Error).message) }
    finally { setSaving(false) }
  }

  async function guardarAno(e: React.FormEvent) {
    e.preventDefault(); if (!editAno) return; setSaving(true)
    try {
      await academicoAPI.actualizarAno(editAno.id, editAnoForm)
      setEditAno(null); await carregar()
    } catch (err) { setErro((err as Error).message) }
    finally { setSaving(false) }
  }

  async function removerAno() {
    if (!confirmDel) return
    try { await academicoAPI.removerAno(confirmDel.id); setConfirmDel(null); await carregar() }
    catch (err) { setErro((err as Error).message) }
  }

  async function transicionarAno(id: string, acao: 'abrir' | 'encerrar') {
    setErro(''); setMsg('')
    try {
      if (acao === 'abrir') await academicoAPI.abrirAno(id)
      else await academicoAPI.encerrarAno(id)
      setMsg(acao === 'abrir' ? 'Ano aberto.' : 'Ano encerrado.')
      await carregar()
    } catch (err) { setErro((err as Error).message) }
  }

  function abrirModalTrimestre(ano: AnoAcademico, tri?: Trimestre) {
    setModalTrimestre({ ano, tri })
    if (tri) setTriForm({ numero: String(tri.numero), designacao: tri.designacao ?? '', data_inicio: tri.data_inicio, data_fim: tri.data_fim })
    else setTriForm({ numero: '1', designacao: '', data_inicio: '', data_fim: '' })
  }

  async function guardarTrimestre(e: React.FormEvent) {
    e.preventDefault(); if (!modalTrimestre) return; setSaving(true)
    try {
      const { ano, tri } = modalTrimestre
      if (tri) {
        await academicoAPI.actualizarTrimestre(ano.id, tri.id, { designacao: triForm.designacao || undefined, data_inicio: triForm.data_inicio, data_fim: triForm.data_fim })
      } else {
        await academicoAPI.criarTrimestre(ano.id, { numero: Number(triForm.numero), designacao: triForm.designacao || undefined, data_inicio: triForm.data_inicio, data_fim: triForm.data_fim })
      }
      setModalTrimestre(null)
      await carregarTrimestres(ano.id)
    } catch (err) { setErro((err as Error).message) }
    finally { setSaving(false) }
  }

  async function fecharTrimestre() {
    if (!confirmFechar) return
    try {
      await academicoAPI.fecharTrimestre(confirmFechar.anoId, confirmFechar.tri.id)
      setConfirmFechar(null)
      await carregarTrimestres(confirmFechar.anoId)
      setMsg('Trimestre fechado com sucesso.')
    } catch (err) { setErro((err as Error).message) }
  }

  async function removerTrimestre() {
    if (!confirmDelTri) return
    try {
      await academicoAPI.removerTrimestre(confirmDelTri.anoId, confirmDelTri.tri.id)
      setConfirmDelTri(null)
      await carregarTrimestres(confirmDelTri.anoId)
    } catch (err) { setErro((err as Error).message) }
  }

  return (
    <div>
      <h1 style={{ color: 'var(--primary)' }}>Anos Academicos & Trimestres</h1>
      {erro && <p style={{ color: 'var(--danger)', marginBottom: 12 }}>{erro}</p>}
      {msg && <p style={{ color: '#27ae60', marginBottom: 12 }}>{msg}</p>}

      {/* Criar ano */}
      <form onSubmit={criarAno} style={s.card}>
        <h3 style={{ marginTop: 0 }}>Novo ano academico</h3>
        <label htmlFor="ano-des">Designacao (ex: 2025/2026)</label>
        <input id="ano-des" style={s.input} value={formAno.designacao} onChange={e => setFormAno({ ...formAno, designacao: e.target.value })} required />
        <label htmlFor="ano-ini">Data inicio</label>
        <input id="ano-ini" type="date" style={s.input} value={formAno.data_inicio} onChange={e => setFormAno({ ...formAno, data_inicio: e.target.value })} required />
        <label htmlFor="ano-fim">Data fim</label>
        <input id="ano-fim" type="date" style={s.input} value={formAno.data_fim} onChange={e => setFormAno({ ...formAno, data_fim: e.target.value })} required />
        <button type="submit" style={btn()} disabled={saving}>Criar</button>
      </form>

      {/* Lista anos */}
      {anos.map(ano => (
        <div key={ano.id} style={{ ...s.card, maxWidth: 'unset' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, fontSize: 17 }}>{ano.designacao}</span>
            <span style={{ background: ESTADO_COLOR[ano.estado] ?? '#888', color: '#fff', borderRadius: 20, padding: '2px 12px', fontSize: 12 }}>{ano.estado}</span>
            <span style={{ color: '#888', fontSize: 13 }}>{ano.data_inicio} → {ano.data_fim}</span>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button style={btn('#6c757d')} onClick={() => toggleAno(ano.id)}>
                {anoAberto === ano.id ? 'Ocultar trimestres' : 'Ver trimestres'}
              </button>
              <button style={btn()} onClick={() => { setEditAno(ano); setEditAnoForm({ designacao: ano.designacao, data_inicio: ano.data_inicio, data_fim: ano.data_fim }) }}>Editar</button>
              {ano.estado === 'configuracao' && <button style={btn('#27ae60')} onClick={() => transicionarAno(ano.id, 'abrir')}>Abrir</button>}
              {ano.estado === 'aberto' && <button style={btn('#e67e22')} onClick={() => transicionarAno(ano.id, 'encerrar')}>Encerrar ano lectivo</button>}
              {ano.estado !== 'aberto' && <button style={btn('#e74c3c')} onClick={() => setConfirmDel(ano)}>Apagar</button>}
            </div>
          </div>

          {/* Trimestres */}
          {anoAberto === ano.id && (
            <div style={{ marginTop: 18, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <h4 style={{ margin: 0 }}>Trimestres</h4>
                <button style={btn('var(--primary)', '#fff', { fontSize: 12, padding: '5px 10px' })} onClick={() => abrirModalTrimestre(ano)}>+ Adicionar</button>
              </div>
              {(trimestres[ano.id] ?? []).length === 0
                ? <p style={{ color: '#888', fontSize: 13 }}>Sem trimestres criados.</p>
                : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'var(--surface-alt,#f5f5f5)' }}>
                        <th align="left" style={{ padding: '8px 10px' }}>N.o</th>
                        <th align="left" style={{ padding: '8px 10px' }}>Designacao</th>
                        <th align="left" style={{ padding: '8px 10px' }}>Periodo</th>
                        <th align="left" style={{ padding: '8px 10px' }}>Estado</th>
                        <th style={{ padding: '8px 10px' }}>Acoes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(trimestres[ano.id] ?? []).map(t => (
                        <tr key={t.id} style={{ borderTop: '1px solid var(--border)' }}>
                          <td style={{ padding: '8px 10px' }}>{t.numero}.o</td>
                          <td style={{ padding: '8px 10px' }}>{t.designacao ?? '-'}</td>
                          <td style={{ padding: '8px 10px', fontSize: 13 }}>{t.data_inicio} → {t.data_fim}</td>
                          <td style={{ padding: '8px 10px' }}>
                            <span style={{ background: t.estado === 'fechado' ? '#e74c3c' : '#27ae60', color: '#fff', borderRadius: 20, padding: '2px 10px', fontSize: 11 }}>{t.estado}</span>
                          </td>
                          <td style={{ padding: '8px 10px', display: 'flex', gap: 6, justifyContent: 'center' }}>
                            {t.estado !== 'fechado' && (
                              <>
                                <button style={btn('', '#333', { background: '#eee' })} onClick={() => abrirModalTrimestre(ano, t)}>Editar</button>
                                <button style={btn('#e67e22')} onClick={() => setConfirmFechar({ anoId: ano.id, tri: t })}>Fechar trimestre</button>
                              </>
                            )}
                            <button style={btn('#e74c3c')} onClick={() => setConfirmDelTri({ anoId: ano.id, tri: t })}>Apagar</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
            </div>
          )}
        </div>
      ))}

      {/* Modal editar ano */}
      {editAno && (
        <div style={s.overlay} onClick={() => setEditAno(null)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>Editar ano academico</h3>
            <form onSubmit={guardarAno}>
              <label htmlFor="edit-ano-des">Designacao</label>
              <input id="edit-ano-des" style={s.input} value={editAnoForm.designacao} onChange={e => setEditAnoForm({ ...editAnoForm, designacao: e.target.value })} required />
              <label htmlFor="edit-ano-ini">Data inicio</label>
              <input id="edit-ano-ini" type="date" style={s.input} value={editAnoForm.data_inicio} onChange={e => setEditAnoForm({ ...editAnoForm, data_inicio: e.target.value })} required />
              <label htmlFor="edit-ano-fim">Data fim</label>
              <input id="edit-ano-fim" type="date" style={s.input} value={editAnoForm.data_fim} onChange={e => setEditAnoForm({ ...editAnoForm, data_fim: e.target.value })} required />
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" style={btn()} disabled={saving}>{saving ? 'A guardar...' : 'Guardar'}</button>
                <button type="button" style={btn('#888')} onClick={() => setEditAno(null)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal trimestre */}
      {modalTrimestre && (
        <div style={s.overlay} onClick={() => setModalTrimestre(null)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>{modalTrimestre.tri ? 'Editar trimestre' : 'Novo trimestre'} — {modalTrimestre.ano.designacao}</h3>
            <form onSubmit={guardarTrimestre}>
              {!modalTrimestre.tri && (
                <>
                  <label htmlFor="tri-num">Numero</label>
                  <select id="tri-num" style={s.input} value={triForm.numero} onChange={e => setTriForm({ ...triForm, numero: e.target.value })}>
                    <option value="1">1.o Trimestre</option>
                    <option value="2">2.o Trimestre</option>
                    <option value="3">3.o Trimestre</option>
                  </select>
                </>
              )}
              <label htmlFor="tri-des">Designacao (opcional)</label>
              <input id="tri-des" style={s.input} value={triForm.designacao} onChange={e => setTriForm({ ...triForm, designacao: e.target.value })} placeholder="ex: 1.o Trimestre 2025" />
              <label htmlFor="tri-ini">Data inicio</label>
              <input id="tri-ini" type="date" style={s.input} value={triForm.data_inicio} onChange={e => setTriForm({ ...triForm, data_inicio: e.target.value })} required />
              <label htmlFor="tri-fim">Data fim</label>
              <input id="tri-fim" type="date" style={s.input} value={triForm.data_fim} onChange={e => setTriForm({ ...triForm, data_fim: e.target.value })} required />
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" style={btn()} disabled={saving}>{saving ? 'A guardar...' : 'Guardar'}</button>
                <button type="button" style={btn('#888')} onClick={() => setModalTrimestre(null)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmar apagar ano */}
      {confirmDel && (
        <div style={s.overlay} onClick={() => setConfirmDel(null)}>
          <div style={{ ...s.modal, width: 380 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>Remover ano academico</h3>
            <p>Remover <strong>{confirmDel.designacao}</strong>? Esta acao e irreversivel.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={btn('#e74c3c')} onClick={removerAno}>Remover</button>
              <button style={btn('#888')} onClick={() => setConfirmDel(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmar fechar trimestre */}
      {confirmFechar && (
        <div style={s.overlay} onClick={() => setConfirmFechar(null)}>
          <div style={{ ...s.modal, width: 420 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>Fechar trimestre</h3>
            <p>Fechar o <strong>{confirmFechar.tri.designacao ?? `${confirmFechar.tri.numero}.o Trimestre`}</strong>?</p>
            <p style={{ color: '#888', fontSize: 13 }}>Apos o fecho, o lancamento de notas fica bloqueado para este periodo.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={btn('#e67e22')} onClick={fecharTrimestre}>Fechar trimestre</button>
              <button style={btn('#888')} onClick={() => setConfirmFechar(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmar apagar trimestre */}
      {confirmDelTri && (
        <div style={s.overlay} onClick={() => setConfirmDelTri(null)}>
          <div style={{ ...s.modal, width: 380 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>Remover trimestre</h3>
            <p>Remover <strong>{confirmDelTri.tri.designacao ?? `${confirmDelTri.tri.numero}.o Trimestre`}</strong>?</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={btn('#e74c3c')} onClick={removerTrimestre}>Remover</button>
              <button style={btn('#888')} onClick={() => setConfirmDelTri(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
