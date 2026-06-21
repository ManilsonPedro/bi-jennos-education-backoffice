'use client'

import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { academicoAPI, pedidosReaberturaAPI, type AnoAcademico, type Trimestre } from '@/lib/api'
import { InactivarModal } from '@/components/ui/InactivarModal'

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

  // Pedido de reabertura
  const [pedirReaberturaModal, setPedirReaberturaModal] = useState<{ anoId: string; tri: Trimestre } | null>(null)
  const [motivoReabertura, setMotivoReabertura] = useState('')

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

  async function inactivarAno(motivo: string) {
    if (!confirmDel) return
    await academicoAPI.inactivarAno(confirmDel.id, motivo)
    setConfirmDel(null)
    await carregar()
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

  async function fecharTrimestre(motivo: string) {
    if (!confirmFechar) return
    await academicoAPI.fecharTrimestre(confirmFechar.anoId, confirmFechar.tri.id, motivo)
    setConfirmFechar(null)
    await carregarTrimestres(confirmFechar.anoId)
    setMsg('Trimestre fechado com sucesso.')
  }

  async function inactivarTrimestre(motivo: string) {
    if (!confirmDelTri) return
    await academicoAPI.inactivarTrimestre(confirmDelTri.anoId, confirmDelTri.tri.id, motivo)
    setConfirmDelTri(null)
    await carregarTrimestres(confirmDelTri.anoId)
  }

  async function submeterPedidoReabertura() {
    if (!pedirReaberturaModal) return
    if (motivoReabertura.trim().length < 10) { setErro('Motivo deve ter pelo menos 10 caracteres.'); return }
    setSaving(true); setErro(''); setMsg('')
    try {
      await pedidosReaberturaAPI.criar({ tipo: 'trimestre', referencia_id: pedirReaberturaModal.tri.id, motivo: motivoReabertura })
      setMsg('Pedido de reabertura submetido. Aguarda aprovacao da Direccao.')
      setPedirReaberturaModal(null); setMotivoReabertura('')
    } catch (e) { setErro((e as Error).message) }
    finally { setSaving(false) }
  }

  return (
    <div>
      <PageHeader title="Anos Academicos & Trimestres" />
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
              {ano.estado !== 'aberto' && <button style={btn('#e74c3c')} onClick={() => setConfirmDel(ano)}>Inactivar</button>}
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
                            {t.estado === 'fechado' && (
                              <button style={btn('#3498db')} onClick={() => { setMotivoReabertura(''); setPedirReaberturaModal({ anoId: ano.id, tri: t }) }}>Pedir reabertura</button>
                            )}
                            <button style={btn('#e74c3c')} onClick={() => setConfirmDelTri({ anoId: ano.id, tri: t })}>Inactivar</button>
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

      {confirmDel && (
        <InactivarModal
          titulo={`Inactivar ano academico — ${confirmDel.designacao}`}
          descricao="O ano academico ficará inactivo. Indique o motivo."
          onConfirm={inactivarAno}
          onCancel={() => setConfirmDel(null)}
        />
      )}

      {confirmFechar && (
        <InactivarModal
          titulo={`Fechar trimestre — ${confirmFechar.tri.designacao ?? `${confirmFechar.tri.numero}.o Trimestre`}`}
          descricao="Apos o fecho, o lancamento de notas fica bloqueado para este periodo. Indique o motivo (opcional)."
          onConfirm={fecharTrimestre}
          onCancel={() => setConfirmFechar(null)}
        />
      )}

      {confirmDelTri && (
        <InactivarModal
          titulo={`Inactivar trimestre — ${confirmDelTri.tri.designacao ?? `${confirmDelTri.tri.numero}.o Trimestre`}`}
          descricao="O trimestre ficará inactivo. Indique o motivo."
          onConfirm={inactivarTrimestre}
          onCancel={() => setConfirmDelTri(null)}
        />
      )}

      {pedirReaberturaModal && (
        <div style={s.overlay} onClick={() => setPedirReaberturaModal(null)}>
          <div style={{ ...s.modal, borderTop: '4px solid #3498db' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginTop: 0, color: '#3498db' }}>Pedir reabertura de trimestre</h3>
            <p style={{ color: '#555', fontSize: 14, marginBottom: 12 }}>
              <strong>{pedirReaberturaModal.tri.designacao ?? `${pedirReaberturaModal.tri.numero}.o Trimestre`}</strong><br />
              O pedido sera enviado para aprovacao da Direccao.
            </p>
            <label htmlFor="pr-motivo">Motivo do pedido *</label>
            <textarea
              id="pr-motivo"
              rows={4}
              style={{ display: 'block', width: '100%', padding: 10, margin: '4px 0 12px', border: '1px solid var(--border-strong)', borderRadius: 8, boxSizing: 'border-box' }}
              placeholder="ex: Erro de lancamento detectado na nota de Matematica do aluno X..."
              value={motivoReabertura}
              onChange={e => setMotivoReabertura(e.target.value)}
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                style={btn('#3498db')}
                onClick={submeterPedidoReabertura}
                disabled={saving || motivoReabertura.trim().length < 10}
              >
                {saving ? 'A submeter...' : 'Submeter pedido'}
              </button>
              <button type="button" style={btn('#888')} onClick={() => setPedirReaberturaModal(null)}>Cancelar</button>
            </div>
            {motivoReabertura.trim().length > 0 && motivoReabertura.trim().length < 10 && (
              <p style={{ color: '#e74c3c', fontSize: 12, marginTop: 6 }}>Minimo 10 caracteres.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
