'use client'

import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { palestrasAPI, workshopsAPI, olimpiadasAPI, reunioesAPI } from '@/lib/api'
import { InactivarModal } from '@/components/ui/InactivarModal'

interface Evento {
  id: string
  titulo: string
  data_evento: string
  descricao: string | null
  local: string | null
  palestrante: string | null
  vagas: number
}

interface Inscricao {
  id: string
  participante_nome: string
  participante_email: string | null
  aluno_id: string | null
  evento_tipo: string
}

const TABS = [
  { key: 'palestras', label: 'Palestras', api: palestrasAPI },
  { key: 'workshops', label: 'Workshops', api: workshopsAPI },
  { key: 'olimpiadas', label: 'Olimpiadas', api: olimpiadasAPI },
  { key: 'reunioes', label: 'Reunioes', api: reunioesAPI },
] as const

type TabKey = 'palestras' | 'workshops' | 'olimpiadas' | 'reunioes'

const s = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 } as React.CSSProperties,
  modal: { background: 'var(--surface)', borderRadius: 14, padding: 28, width: 500, maxHeight: '90vh', overflowY: 'auto' as const, boxShadow: '0 8px 32px rgba(0,0,0,.25)' } as React.CSSProperties,
  input: { display: 'block', width: '100%', padding: 10, margin: '4px 0 12px', border: '1px solid var(--border-strong)', borderRadius: 8, boxSizing: 'border-box' as const } as React.CSSProperties,
}
const btn = (bg = 'var(--primary)', color = '#fff', extra?: React.CSSProperties): React.CSSProperties => ({
  padding: '7px 14px', background: bg, color, border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, ...extra,
})

type EventoForm = { titulo: string; data_evento: string; descricao: string; local: string; palestrante: string; vagas: string }
const formVazio = (): EventoForm => ({ titulo: '', data_evento: '', descricao: '', local: '', palestrante: '', vagas: '0' })

export default function EventosPage() {
  const [tab, setTab] = useState<TabKey>('palestras')
  const [dados, setDados] = useState<Record<TabKey, Evento[]>>({ palestras: [], workshops: [], olimpiadas: [], reunioes: [] })
  const [erro, setErro] = useState('')
  const [msg, setMsg] = useState('')
  const [saving, setSaving] = useState(false)

  const [modalCriar, setModalCriar] = useState(false)
  const [formCriar, setFormCriar] = useState<EventoForm>(formVazio())

  const [editEvento, setEditEvento] = useState<Evento | null>(null)
  const [editForm, setEditForm] = useState<EventoForm>(formVazio())

  const [confirmDel, setConfirmDel] = useState<Evento | null>(null)

  const [inscModal, setInscModal] = useState<Evento | null>(null)
  const [inscricoes, setInscricoes] = useState<Inscricao[]>([])
  const [inscForm, setInscForm] = useState({ participante_nome: '', participante_email: '', aluno_id: '' })

  function api() { return TABS.find(t => t.key === tab)!.api }

  async function carregar() {
    try { setDados(prev => ({ ...prev, [tab]: [] })); const r = await api().listar(); setDados(prev => ({ ...prev, [tab]: r as Evento[] })) }
    catch (e) { setErro((e as Error).message) }
  }
  useEffect(() => { carregar() }, [tab])

  async function criar(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setErro(''); setMsg('')
    try {
      await api().criar({ titulo: formCriar.titulo, data_evento: formCriar.data_evento, descricao: formCriar.descricao || undefined, local: formCriar.local || undefined, palestrante: formCriar.palestrante || undefined, vagas: Number(formCriar.vagas) })
      setModalCriar(false); setFormCriar(formVazio()); setMsg('Evento criado.')
      await carregar()
    } catch (err) { setErro((err as Error).message) }
    finally { setSaving(false) }
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault(); if (!editEvento) return; setSaving(true)
    try {
      await api().actualizar(editEvento.id, { titulo: editForm.titulo, data_evento: editForm.data_evento, descricao: editForm.descricao || undefined, local: editForm.local || undefined, palestrante: editForm.palestrante || undefined, vagas: Number(editForm.vagas) })
      setEditEvento(null); await carregar()
    } catch (err) { setErro((err as Error).message) }
    finally { setSaving(false) }
  }

  async function inactivar(motivo: string) {
    if (!confirmDel) return
    await api().inactivar(confirmDel.id, motivo)
    setConfirmDel(null)
    await carregar()
  }

  async function abrirInscricoes(ev: Evento) {
    setInscModal(ev)
    try { setInscricoes(await api().inscricoes(ev.id) as Inscricao[]) }
    catch { setInscricoes([]) }
  }

  async function inscrever(e: React.FormEvent) {
    e.preventDefault(); if (!inscModal) return; setSaving(true)
    try {
      await api().inscrever(inscModal.id, { participante_nome: inscForm.participante_nome, participante_email: inscForm.participante_email || undefined, aluno_id: inscForm.aluno_id || undefined })
      setInscForm({ participante_nome: '', participante_email: '', aluno_id: '' })
      setInscricoes(await api().inscricoes(inscModal.id) as Inscricao[])
    } catch (err) { setErro((err as Error).message) }
    finally { setSaving(false) }
  }

  async function cancelarInscricao(inscId: string) {
    if (!inscModal) return
    try { await api().cancelarInscricao(inscId, 'Cancelado pela secretaria'); setInscricoes(await api().inscricoes(inscModal.id) as Inscricao[]) }
    catch (err) { setErro((err as Error).message) }
  }

  const lista = dados[tab] ?? []

  const camposForm = (form: EventoForm, set: (f: EventoForm) => void) => (
    <>
      <label htmlFor="ev-tit">Titulo *</label>
      <input id="ev-tit" style={s.input} value={form.titulo} onChange={e => set({ ...form, titulo: e.target.value })} required />
      <label htmlFor="ev-dat">Data do evento *</label>
      <input id="ev-dat" type="date" style={s.input} value={form.data_evento} onChange={e => set({ ...form, data_evento: e.target.value })} required />
      <label htmlFor="ev-loc">Local</label>
      <input id="ev-loc" style={s.input} value={form.local} onChange={e => set({ ...form, local: e.target.value })} />
      <label htmlFor="ev-pal">Palestrante / Responsavel</label>
      <input id="ev-pal" style={s.input} value={form.palestrante} onChange={e => set({ ...form, palestrante: e.target.value })} />
      <label htmlFor="ev-vag">Vagas (0 = ilimitado)</label>
      <input id="ev-vag" type="number" min="0" style={s.input} value={form.vagas} onChange={e => set({ ...form, vagas: e.target.value })} />
      <label htmlFor="ev-des">Descricao</label>
      <textarea id="ev-des" rows={3} style={{ ...s.input }} value={form.descricao} onChange={e => set({ ...form, descricao: e.target.value })} />
    </>
  )

  return (
    <div>
      <PageHeader title="Eventos Academicos" />
      {erro && <p style={{ color: 'var(--danger)', marginBottom: 12 }}>{erro}</p>}
      {msg && <p style={{ color: '#27ae60', marginBottom: 12 }}>{msg}</p>}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#f0f0f0', borderRadius: 10, padding: 4, width: 'fit-content' }}>
        {TABS.map(t => (
          <button key={t.key} style={{ padding: '8px 20px', border: 'none', borderRadius: 8, cursor: 'pointer', background: tab === t.key ? 'var(--primary)' : 'transparent', color: tab === t.key ? '#fff' : '#555', fontWeight: tab === t.key ? 700 : 400 }} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', marginBottom: 16 }}>
        <button style={btn()} onClick={() => { setModalCriar(true); setFormCriar(formVazio()) }}>+ Novo evento</button>
      </div>

      {/* Tabela */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--surface)', borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          <thead>
            <tr style={{ background: 'var(--primary)', color: '#fff' }}>
              <th align="left" style={{ padding: '12px 14px' }}>Titulo</th>
              <th align="left" style={{ padding: '12px 14px' }}>Data</th>
              <th align="left" style={{ padding: '12px 14px' }}>Local</th>
              <th align="left" style={{ padding: '12px 14px' }}>Vagas</th>
              <th style={{ padding: '12px 14px' }}>Acoes</th>
            </tr>
          </thead>
          <tbody>
            {lista.length === 0 && <tr><td colSpan={5} style={{ padding: 24, textAlign: 'center', color: '#888' }}>Sem eventos registados.</td></tr>}
            {lista.map(ev => (
              <tr key={ev.id} style={{ borderTop: '1px solid var(--border)' }}>
                <td style={{ padding: '10px 14px', fontWeight: 600 }}>{ev.titulo}</td>
                <td style={{ padding: '10px 14px' }}>{ev.data_evento}</td>
                <td style={{ padding: '10px 14px', color: '#555' }}>{ev.local ?? '—'}</td>
                <td style={{ padding: '10px 14px' }}>{ev.vagas === 0 ? 'Ilimitado' : ev.vagas}</td>
                <td style={{ padding: '10px 14px', display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button style={btn('#6c757d')} onClick={() => { setEditEvento(ev); setEditForm({ titulo: ev.titulo, data_evento: ev.data_evento, descricao: ev.descricao ?? '', local: ev.local ?? '', palestrante: ev.palestrante ?? '', vagas: String(ev.vagas) }) }}>Editar</button>
                  <button style={btn('#27ae60')} onClick={() => abrirInscricoes(ev)}>Inscricoes</button>
                  <button style={btn('#e74c3c')} onClick={() => setConfirmDel(ev)}>Inactivar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal criar */}
      {modalCriar && (
        <div style={s.overlay} onClick={() => setModalCriar(false)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>Novo — {TABS.find(t => t.key === tab)!.label}</h3>
            <form onSubmit={criar}>{camposForm(formCriar, setFormCriar)}
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="submit" style={btn()} disabled={saving}>{saving ? 'A criar...' : 'Criar'}</button>
                <button type="button" style={btn('#888')} onClick={() => setModalCriar(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal editar */}
      {editEvento && (
        <div style={s.overlay} onClick={() => setEditEvento(null)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>Editar evento</h3>
            <form onSubmit={guardar}>{camposForm(editForm, setEditForm)}
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="submit" style={btn()} disabled={saving}>{saving ? 'A guardar...' : 'Guardar'}</button>
                <button type="button" style={btn('#888')} onClick={() => setEditEvento(null)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDel && (
        <InactivarModal
          titulo={`Inactivar evento — ${confirmDel.titulo}`}
          descricao="O evento ficará inactivo. Indique o motivo."
          onConfirm={inactivar}
          onCancel={() => setConfirmDel(null)}
        />
      )}

      {/* Modal inscricoes */}
      {inscModal && (
        <div style={s.overlay} onClick={() => setInscModal(null)}>
          <div style={{ ...s.modal, width: 580 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>Inscricoes — {inscModal.titulo}</h3>
            <form onSubmit={inscrever} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              <input placeholder="Nome do participante *" style={{ ...s.input, margin: 0, flex: '1 1 200px' }} value={inscForm.participante_nome} onChange={e => setInscForm({ ...inscForm, participante_nome: e.target.value })} required />
              <input placeholder="Email (opcional)" style={{ ...s.input, margin: 0, flex: '1 1 180px' }} value={inscForm.participante_email} onChange={e => setInscForm({ ...inscForm, participante_email: e.target.value })} />
              <button type="submit" style={{ ...btn(), height: 40 }} disabled={saving}>+ Inscrever</button>
            </form>
            {inscricoes.length === 0 ? <p style={{ color: '#888' }}>Sem inscricoes.</p> : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr style={{ background: '#f0f0f0' }}>
                  <th align="left" style={{ padding: '8px 10px' }}>Nome</th>
                  <th align="left" style={{ padding: '8px 10px' }}>Email</th>
                  <th style={{ padding: '8px 10px' }}></th>
                </tr></thead>
                <tbody>{inscricoes.map(i => (
                  <tr key={i.id} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '8px 10px' }}>{i.participante_nome}</td>
                    <td style={{ padding: '8px 10px', fontSize: 13, color: '#555' }}>{i.participante_email ?? '—'}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                      <button style={btn('#e74c3c', '#fff', { fontSize: 12, padding: '4px 10px' })} onClick={() => cancelarInscricao(i.id)}>Cancelar</button>
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            )}
            <button style={{ ...btn('#888'), marginTop: 16 }} onClick={() => setInscModal(null)}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  )
}
