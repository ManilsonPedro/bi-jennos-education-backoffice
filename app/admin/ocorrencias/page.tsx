'use client'

import { useEffect, useState } from 'react'
import { ocorrenciasAPI } from '@/lib/api'

interface Ocorrencia {
  id: string
  titulo: string
  descricao: string | null
  tipo: string | null
  gravidade: string | null
  data_ocorrencia: string
  aluno_id: string | null
  resolucao: string | null
  data_resolucao: string | null
}

const TIPOS = ['disciplinar', 'academica', 'administrativa', 'outra']
const GRAVIDADES = ['leve', 'moderada', 'grave']

const s = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 } as React.CSSProperties,
  modal: { background: 'var(--surface)', borderRadius: 14, padding: 28, width: 520, maxHeight: '90vh', overflowY: 'auto' as const, boxShadow: '0 8px 32px rgba(0,0,0,.25)' } as React.CSSProperties,
  input: { display: 'block', width: '100%', padding: 10, margin: '4px 0 12px', border: '1px solid var(--border-strong)', borderRadius: 8, boxSizing: 'border-box' as const } as React.CSSProperties,
}
const btn = (bg = 'var(--primary)', color = '#fff', extra?: React.CSSProperties): React.CSSProperties => ({
  padding: '7px 14px', background: bg, color, border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, ...extra,
})
const GRAV_COLOR: Record<string, string> = { leve: '#27ae60', moderada: '#e67e22', grave: '#e74c3c' }

type OcForm = { titulo: string; descricao: string; tipo: string; gravidade: string; data_ocorrencia: string; aluno_id: string; resolucao: string; data_resolucao: string }
const vazio = (): OcForm => ({ titulo: '', descricao: '', tipo: 'disciplinar', gravidade: 'leve', data_ocorrencia: '', aluno_id: '', resolucao: '', data_resolucao: '' })

export default function OcorrenciasPage() {
  const [lista, setLista] = useState<Ocorrencia[]>([])
  const [filtro, setFiltro] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')
  const [filtroGrav, setFiltroGrav] = useState('')
  const [erro, setErro] = useState('')
  const [msg, setMsg] = useState('')
  const [saving, setSaving] = useState(false)

  const [modalCriar, setModalCriar] = useState(false)
  const [formCriar, setFormCriar] = useState<OcForm>(vazio())

  const [editOc, setEditOc] = useState<Ocorrencia | null>(null)
  const [editForm, setEditForm] = useState<OcForm>(vazio())

  const [confirmDel, setConfirmDel] = useState<Ocorrencia | null>(null)

  async function carregar() {
    try { setLista(await ocorrenciasAPI.listar()) }
    catch (e) { setErro((e as Error).message) }
  }
  useEffect(() => { carregar() }, [])

  function clean(f: OcForm) {
    return {
      titulo: f.titulo,
      descricao: f.descricao || undefined,
      tipo: f.tipo || undefined,
      gravidade: f.gravidade || undefined,
      data_ocorrencia: f.data_ocorrencia,
      aluno_id: f.aluno_id || undefined,
      resolucao: f.resolucao || undefined,
      data_resolucao: f.data_resolucao || undefined,
    }
  }

  async function criar(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setErro(''); setMsg('')
    try {
      await ocorrenciasAPI.criar(clean(formCriar))
      setModalCriar(false); setFormCriar(vazio()); setMsg('Ocorrencia registada.')
      await carregar()
    } catch (err) { setErro((err as Error).message) }
    finally { setSaving(false) }
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault(); if (!editOc) return; setSaving(true)
    try {
      await ocorrenciasAPI.actualizar(editOc.id, clean(editForm))
      setEditOc(null); await carregar()
    } catch (err) { setErro((err as Error).message) }
    finally { setSaving(false) }
  }

  async function remover() {
    if (!confirmDel) return
    try { await ocorrenciasAPI.remover(confirmDel.id); setConfirmDel(null); await carregar() }
    catch (err) { setErro((err as Error).message) }
  }

  const filtrados = lista.filter(oc => {
    const q = filtro.toLowerCase()
    const okQ = oc.titulo.toLowerCase().includes(q)
    const okT = filtroTipo ? oc.tipo === filtroTipo : true
    const okG = filtroGrav ? oc.gravidade === filtroGrav : true
    return okQ && okT && okG
  })

  const campos = (form: OcForm, set: (f: OcForm) => void) => (
    <>
      <label htmlFor="oc-tit">Titulo *</label>
      <input id="oc-tit" style={s.input} value={form.titulo} onChange={e => set({ ...form, titulo: e.target.value })} required />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label htmlFor="oc-tipo">Tipo</label>
          <select id="oc-tipo" style={s.input} value={form.tipo} onChange={e => set({ ...form, tipo: e.target.value })}>
            {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="oc-grav">Gravidade</label>
          <select id="oc-grav" style={s.input} value={form.gravidade} onChange={e => set({ ...form, gravidade: e.target.value })}>
            {GRAVIDADES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
      </div>
      <label htmlFor="oc-dat">Data da ocorrencia *</label>
      <input id="oc-dat" type="date" style={s.input} value={form.data_ocorrencia} onChange={e => set({ ...form, data_ocorrencia: e.target.value })} required />
      <label htmlFor="oc-aluno">ID do aluno (opcional)</label>
      <input id="oc-aluno" style={s.input} value={form.aluno_id} onChange={e => set({ ...form, aluno_id: e.target.value })} placeholder="UUID do aluno" />
      <label htmlFor="oc-des">Descricao</label>
      <textarea id="oc-des" rows={3} style={{ ...s.input }} value={form.descricao} onChange={e => set({ ...form, descricao: e.target.value })} />
      <label htmlFor="oc-res">Resolucao</label>
      <textarea id="oc-res" rows={2} style={{ ...s.input }} value={form.resolucao} onChange={e => set({ ...form, resolucao: e.target.value })} />
      <label htmlFor="oc-dres">Data resolucao</label>
      <input id="oc-dres" type="date" style={s.input} value={form.data_resolucao} onChange={e => set({ ...form, data_resolucao: e.target.value })} />
    </>
  )

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        <h1 style={{ color: 'var(--primary)', margin: 0 }}>Ocorrencias</h1>
        <button style={btn()} onClick={() => { setModalCriar(true); setFormCriar(vazio()) }}>+ Registar ocorrencia</button>
      </div>

      {erro && <p style={{ color: 'var(--danger)', marginBottom: 12 }}>{erro}</p>}
      {msg && <p style={{ color: '#27ae60', marginBottom: 12 }}>{msg}</p>}

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <input placeholder="Pesquisar titulo..." style={{ ...s.input, margin: 0, maxWidth: 280 }} value={filtro} onChange={e => setFiltro(e.target.value)} />
        <select style={{ ...s.input, margin: 0, width: 150 }} value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}>
          <option value="">Todos os tipos</option>
          {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select style={{ ...s.input, margin: 0, width: 150 }} value={filtroGrav} onChange={e => setFiltroGrav(e.target.value)}>
          <option value="">Qualquer gravidade</option>
          {GRAVIDADES.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--surface)', borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          <thead>
            <tr style={{ background: 'var(--primary)', color: '#fff' }}>
              <th align="left" style={{ padding: '12px 14px' }}>Titulo</th>
              <th align="left" style={{ padding: '12px 14px' }}>Tipo</th>
              <th align="left" style={{ padding: '12px 14px' }}>Gravidade</th>
              <th align="left" style={{ padding: '12px 14px' }}>Data</th>
              <th align="left" style={{ padding: '12px 14px' }}>Resolucao</th>
              <th style={{ padding: '12px 14px' }}>Acoes</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 && <tr><td colSpan={6} style={{ padding: 24, textAlign: 'center', color: '#888' }}>Sem ocorrencias registadas.</td></tr>}
            {filtrados.map(oc => (
              <tr key={oc.id} style={{ borderTop: '1px solid var(--border)' }}>
                <td style={{ padding: '10px 14px', fontWeight: 600 }}>{oc.titulo}</td>
                <td style={{ padding: '10px 14px' }}><span style={{ background: '#eee', borderRadius: 20, padding: '2px 10px', fontSize: 12 }}>{oc.tipo ?? '—'}</span></td>
                <td style={{ padding: '10px 14px' }}>
                  {oc.gravidade && <span style={{ background: GRAV_COLOR[oc.gravidade] + '22', color: GRAV_COLOR[oc.gravidade], borderRadius: 20, padding: '2px 10px', fontSize: 12 }}>{oc.gravidade}</span>}
                </td>
                <td style={{ padding: '10px 14px', fontSize: 13 }}>{oc.data_ocorrencia}</td>
                <td style={{ padding: '10px 14px', fontSize: 12, color: oc.resolucao ? '#27ae60' : '#aaa' }}>{oc.resolucao ? 'Resolvida' : 'Pendente'}</td>
                <td style={{ padding: '10px 14px', display: 'flex', gap: 8, justifyContent: 'center' }}>
                  <button style={btn('#6c757d')} onClick={() => { setEditOc(oc); setEditForm({ titulo: oc.titulo, descricao: oc.descricao ?? '', tipo: oc.tipo ?? 'disciplinar', gravidade: oc.gravidade ?? 'leve', data_ocorrencia: oc.data_ocorrencia, aluno_id: oc.aluno_id ?? '', resolucao: oc.resolucao ?? '', data_resolucao: oc.data_resolucao ?? '' }) }}>Editar</button>
                  <button style={btn('#e74c3c')} onClick={() => setConfirmDel(oc)}>Apagar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalCriar && (
        <div style={s.overlay} onClick={() => setModalCriar(false)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>Registar ocorrencia</h3>
            <form onSubmit={criar}>{campos(formCriar, setFormCriar)}
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="submit" style={btn()} disabled={saving}>{saving ? 'A guardar...' : 'Registar'}</button>
                <button type="button" style={btn('#888')} onClick={() => setModalCriar(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editOc && (
        <div style={s.overlay} onClick={() => setEditOc(null)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>Editar ocorrencia</h3>
            <form onSubmit={guardar}>{campos(editForm, setEditForm)}
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="submit" style={btn()} disabled={saving}>{saving ? 'A guardar...' : 'Guardar'}</button>
                <button type="button" style={btn('#888')} onClick={() => setEditOc(null)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDel && (
        <div style={s.overlay} onClick={() => setConfirmDel(null)}>
          <div style={{ ...s.modal, width: 380 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>Remover ocorrencia</h3>
            <p>Remover <strong>{confirmDel.titulo}</strong>?</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={btn('#e74c3c')} onClick={remover}>Remover</button>
              <button style={btn('#888')} onClick={() => setConfirmDel(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
