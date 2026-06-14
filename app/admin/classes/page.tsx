'use client'

import { useEffect, useState } from 'react'
import { academicoAPI, classesAPI, cursosAPI, type AnoAcademico, type Classe, type Curso } from '@/lib/api'
import { InactivarModal } from '@/components/ui/InactivarModal'

const s = {
  card: { background: 'var(--surface)', padding: 24, borderRadius: 12, maxWidth: 720, boxShadow: 'var(--shadow-sm)', marginBottom: 24 } as React.CSSProperties,
  input: { display: 'block', width: '100%', padding: 10, margin: '6px 0 14px', border: '1px solid var(--border-strong)', borderRadius: 8 } as React.CSSProperties,
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 } as React.CSSProperties,
  modal: { background: 'var(--surface)', borderRadius: 14, padding: 28, width: 480, boxShadow: '0 8px 32px rgba(0,0,0,.25)' } as React.CSSProperties,
}
const btn = (bg = 'var(--primary)', color = '#fff'): React.CSSProperties => ({
  padding: '7px 14px', background: bg, color, border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13,
})

export default function ClassesPage() {
  const [anos, setAnos] = useState<AnoAcademico[]>([])
  const [cursos, setCursos] = useState<Curso[]>([])
  const [classes, setClasses] = useState<Classe[]>([])
  const [form, setForm] = useState({ nome: '', curso_id: '', ano_academico_id: '', turno: 'manha', sala: '', vagas: '30' })
  const [erro, setErro] = useState('')
  const [editTarget, setEditTarget] = useState<Classe | null>(null)
  const [editForm, setEditForm] = useState({ nome: '', turno: 'manha', sala: '', max_alunos: '30' })
  const [confirmDelete, setConfirmDelete] = useState<Classe | null>(null)
  const [saving, setSaving] = useState(false)

  async function carregar() {
    try {
      setAnos(await academicoAPI.listarAnos())
      setCursos(await cursosAPI.listar())
      setClasses(await classesAPI.listar())
    } catch (e) { setErro((e as Error).message) }
  }
  useEffect(() => { carregar() }, [])

  async function criar(e: React.FormEvent) {
    e.preventDefault()
    try {
      await classesAPI.criar({ ...form, vagas: Number(form.vagas) })
      setForm({ ...form, nome: '', sala: '' })
      await carregar()
    } catch (err) { setErro((err as Error).message) }
  }

  function abrirEditar(c: Classe) {
    setEditTarget(c)
    setEditForm({ nome: c.nome, turno: c.turno ?? 'manha', sala: c.sala ?? '', max_alunos: String(c.vagas ?? 30) })
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault()
    if (!editTarget) return
    setSaving(true)
    try {
      await classesAPI.actualizar(editTarget.id, {
        nome: editForm.nome,
        turno: editForm.turno,
        sala: editForm.sala || undefined,
        max_alunos: Number(editForm.max_alunos),
      })
      setEditTarget(null)
      await carregar()
    } catch (err) { setErro((err as Error).message) }
    finally { setSaving(false) }
  }

  async function inactivar(motivo: string) {
    if (!confirmDelete) return
    await classesAPI.inactivar(confirmDelete.id, motivo)
    setConfirmDelete(null)
    await carregar()
  }

  const nomeCurso = (id: string) => cursos.find(c => c.id === id)?.nome ?? id.slice(0, 8)

  return (
    <>
      <h1>Classes</h1>
      {erro && <p style={{ color: 'var(--danger)' }}>{erro}</p>}

      <section style={s.card}>
        <h3 style={{ marginTop: 0 }}>Nova classe</h3>
        <form onSubmit={criar}>
          <label>Nome</label>
          <input style={s.input} value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} required />
          <label>Curso</label>
          <select style={s.input} value={form.curso_id} onChange={e => setForm({ ...form, curso_id: e.target.value })} required>
            <option value="">--</option>
            {cursos.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
          <label>Ano academico</label>
          <select style={s.input} value={form.ano_academico_id} onChange={e => setForm({ ...form, ano_academico_id: e.target.value })} required>
            <option value="">--</option>
            {anos.map(a => <option key={a.id} value={a.id}>{a.designacao}</option>)}
          </select>
          <label>Turno</label>
          <select style={s.input} value={form.turno} onChange={e => setForm({ ...form, turno: e.target.value })}>
            <option value="manha">Manha</option>
            <option value="tarde">Tarde</option>
            <option value="noite">Noite</option>
          </select>
          <label>Sala</label>
          <input style={s.input} value={form.sala} onChange={e => setForm({ ...form, sala: e.target.value })} />
          <label>Vagas</label>
          <input style={s.input} type="number" min="1" value={form.vagas} onChange={e => setForm({ ...form, vagas: e.target.value })} />
          <button style={btn()}>Criar</button>
        </form>
      </section>

      <section style={{ ...s.card, maxWidth: 'unset' }}>
        <h3 style={{ marginTop: 0 }}>Lista ({classes.length})</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--surface-alt, #f5f5f5)' }}>
              <th align="left" style={{ padding: '10px 12px' }}>Nome</th>
              <th align="left" style={{ padding: '10px 12px' }}>Curso</th>
              <th align="left" style={{ padding: '10px 12px' }}>Turno</th>
              <th align="left" style={{ padding: '10px 12px' }}>Sala</th>
              <th align="left" style={{ padding: '10px 12px' }}>Vagas</th>
              <th style={{ padding: '10px 12px' }}>Acoes</th>
            </tr>
          </thead>
          <tbody>
            {classes.map(c => (
              <tr key={c.id} style={{ borderTop: '1px solid var(--border)' }}>
                <td style={{ padding: '9px 12px' }}>{c.nome}</td>
                <td style={{ padding: '9px 12px' }}>{nomeCurso(c.curso_id)}</td>
                <td style={{ padding: '9px 12px' }}>{c.turno ?? '-'}</td>
                <td style={{ padding: '9px 12px' }}>{c.sala ?? '-'}</td>
                <td style={{ padding: '9px 12px' }}>{c.vagas ?? '-'}</td>
                <td style={{ padding: '9px 12px', display: 'flex', gap: 6, justifyContent: 'center' }}>
                  <button style={btn()} onClick={() => abrirEditar(c)}>Editar</button>
                  <button style={btn('#e74c3c')} onClick={() => setConfirmDelete(c)}>Inactivar</button>
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
            <h3 style={{ marginTop: 0 }}>Editar classe — {editTarget.nome}</h3>
            <form onSubmit={guardar}>
              <label>Nome</label>
              <input style={s.input} value={editForm.nome} onChange={e => setEditForm({ ...editForm, nome: e.target.value })} required />
              <label>Turno</label>
              <select style={s.input} value={editForm.turno} onChange={e => setEditForm({ ...editForm, turno: e.target.value })}>
                <option value="manha">Manha</option>
                <option value="tarde">Tarde</option>
                <option value="noite">Noite</option>
              </select>
              <label>Sala</label>
              <input style={s.input} value={editForm.sala} onChange={e => setEditForm({ ...editForm, sala: e.target.value })} />
              <label>Vagas</label>
              <input style={s.input} type="number" min="1" value={editForm.max_alunos} onChange={e => setEditForm({ ...editForm, max_alunos: e.target.value })} />
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="submit" style={btn()} disabled={saving}>{saving ? 'A guardar...' : 'Guardar'}</button>
                <button type="button" style={btn('#888')} onClick={() => setEditTarget(null)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDelete && (
        <InactivarModal
          titulo={`Inactivar classe — ${confirmDelete.nome}`}
          descricao="A classe ficará inactiva. Indique o motivo."
          onConfirm={inactivar}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </>
  )
}
