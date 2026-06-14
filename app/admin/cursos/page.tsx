'use client'

import { useEffect, useState } from 'react'
import { cursosAPI, type Curso } from '@/lib/api'

const s = {
  card: { background: 'var(--surface)', padding: 24, borderRadius: 12, maxWidth: 640, boxShadow: 'var(--shadow-sm)', marginBottom: 24 } as React.CSSProperties,
  input: { display: 'block', width: '100%', padding: 10, margin: '6px 0 14px', border: '1px solid var(--border-strong)', borderRadius: 8 } as React.CSSProperties,
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 } as React.CSSProperties,
  modal: { background: 'var(--surface)', borderRadius: 14, padding: 28, width: 480, boxShadow: '0 8px 32px rgba(0,0,0,.25)' } as React.CSSProperties,
}
const btn = (bg = 'var(--primary)', color = '#fff'): React.CSSProperties => ({
  padding: '7px 14px', background: bg, color, border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13,
})

export default function CursosPage() {
  const [cursos, setCursos] = useState<Curso[]>([])
  const [form, setForm] = useState({ nome: '', codigo: '', descricao: '', nivel: 'secundario', duracao_anos: '1' })
  const [erro, setErro] = useState('')
  const [editTarget, setEditTarget] = useState<Curso | null>(null)
  const [editForm, setEditForm] = useState({ nome: '', descricao: '', nivel: 'secundario', duracao_anos: '1' })
  const [confirmDelete, setConfirmDelete] = useState<Curso | null>(null)
  const [saving, setSaving] = useState(false)

  async function carregar() {
    try { setCursos(await cursosAPI.listar()) }
    catch (e) { setErro((e as Error).message) }
  }
  useEffect(() => { carregar() }, [])

  async function criar(e: React.FormEvent) {
    e.preventDefault()
    try {
      await cursosAPI.criar({ nome: form.nome, codigo: form.codigo, descricao: form.descricao || undefined, nivel: form.nivel, duracao_anos: Number(form.duracao_anos) })
      setForm({ nome: '', codigo: '', descricao: '', nivel: 'secundario', duracao_anos: '1' })
      await carregar()
    } catch (err) { setErro((err as Error).message) }
  }

  function abrirEditar(c: Curso) {
    setEditTarget(c)
    setEditForm({ nome: c.nome, descricao: c.descricao ?? '', nivel: (c as unknown as { nivel?: string }).nivel ?? 'secundario', duracao_anos: String((c as unknown as { duracao_anos?: number }).duracao_anos ?? 1) })
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault()
    if (!editTarget) return
    setSaving(true)
    try {
      await cursosAPI.actualizar(editTarget.id, { nome: editForm.nome, descricao: editForm.descricao || undefined, nivel: editForm.nivel, duracao_anos: Number(editForm.duracao_anos) })
      setEditTarget(null)
      await carregar()
    } catch (err) { setErro((err as Error).message) }
    finally { setSaving(false) }
  }

  async function apagar() {
    if (!confirmDelete) return
    try {
      await cursosAPI.remover(confirmDelete.id)
      setConfirmDelete(null)
      await carregar()
    } catch (err) { setErro((err as Error).message) }
  }

  return (
    <>
      <h1>Cursos</h1>
      {erro && <p style={{ color: 'var(--danger)' }}>{erro}</p>}

      <section style={s.card}>
        <h3 style={{ marginTop: 0 }}>Novo curso</h3>
        <form onSubmit={criar}>
          <label>Nome</label>
          <input style={s.input} value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} required />
          <label>Codigo</label>
          <input style={s.input} value={form.codigo} onChange={e => setForm({ ...form, codigo: e.target.value })} required placeholder="ex: INF-01" />
          <label>Descricao</label>
          <input style={s.input} value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} />
          <label>Nivel</label>
          <select style={s.input} value={form.nivel} onChange={e => setForm({ ...form, nivel: e.target.value })}>
            <option value="primario">Primario</option>
            <option value="secundario">Secundario</option>
            <option value="tecnico">Tecnico</option>
          </select>
          <label>Duracao (anos)</label>
          <input style={s.input} type="number" min="1" value={form.duracao_anos} onChange={e => setForm({ ...form, duracao_anos: e.target.value })} />
          <button style={btn()}>Criar</button>
        </form>
      </section>

      <section style={{ ...s.card, maxWidth: 'unset' }}>
        <h3 style={{ marginTop: 0 }}>Lista ({cursos.length})</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--surface-alt, #f5f5f5)' }}>
              <th align="left" style={{ padding: '10px 12px' }}>Nome</th>
              <th align="left" style={{ padding: '10px 12px' }}>Codigo</th>
              <th align="left" style={{ padding: '10px 12px' }}>Nivel</th>
              <th align="left" style={{ padding: '10px 12px' }}>Duracao</th>
              <th style={{ padding: '10px 12px' }}>Acoes</th>
            </tr>
          </thead>
          <tbody>
            {cursos.map(c => (
              <tr key={c.id} style={{ borderTop: '1px solid var(--border)' }}>
                <td style={{ padding: '9px 12px' }}>{c.nome}</td>
                <td style={{ padding: '9px 12px', fontFamily: 'monospace', fontSize: 13 }}>{(c as unknown as { codigo?: string }).codigo ?? '-'}</td>
                <td style={{ padding: '9px 12px' }}>{(c as unknown as { nivel?: string }).nivel ?? '-'}</td>
                <td style={{ padding: '9px 12px' }}>{(c as unknown as { duracao_anos?: number }).duracao_anos ?? '-'} ano(s)</td>
                <td style={{ padding: '9px 12px', display: 'flex', gap: 6, justifyContent: 'center' }}>
                  <button style={btn()} onClick={() => abrirEditar(c)}>Editar</button>
                  <button style={btn('#e74c3c')} onClick={() => setConfirmDelete(c)}>Apagar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Modal editar */}
      {editTarget && (
        <div style={s.overlay} onClick={() => setEditTarget(null)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>Editar curso</h3>
            <form onSubmit={guardar}>
              <label>Nome</label>
              <input style={s.input} value={editForm.nome} onChange={e => setEditForm({ ...editForm, nome: e.target.value })} required />
              <label>Descricao</label>
              <input style={s.input} value={editForm.descricao} onChange={e => setEditForm({ ...editForm, descricao: e.target.value })} />
              <label>Nivel</label>
              <select style={s.input} value={editForm.nivel} onChange={e => setEditForm({ ...editForm, nivel: e.target.value })}>
                <option value="primario">Primario</option>
                <option value="secundario">Secundario</option>
                <option value="tecnico">Tecnico</option>
              </select>
              <label>Duracao (anos)</label>
              <input style={s.input} type="number" min="1" value={editForm.duracao_anos} onChange={e => setEditForm({ ...editForm, duracao_anos: e.target.value })} />
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="submit" style={btn()} disabled={saving}>{saving ? 'A guardar...' : 'Guardar'}</button>
                <button type="button" style={btn('#888')} onClick={() => setEditTarget(null)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmar apagar */}
      {confirmDelete && (
        <div style={s.overlay} onClick={() => setConfirmDelete(null)}>
          <div style={{ ...s.modal, width: 380 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>Confirmar remocao</h3>
            <p>Remover curso <strong>{confirmDelete.nome}</strong>?</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={btn('#e74c3c')} onClick={apagar}>Remover</button>
              <button style={btn('#888')} onClick={() => setConfirmDelete(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
