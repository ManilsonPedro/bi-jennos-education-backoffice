'use client'

import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { academicoAPI, turmasAPI, type AnoAcademico, type Turma } from '@/lib/api'
import { InactivarModal } from '@/components/ui/InactivarModal'

const s = {
  card: { background: 'var(--surface)', padding: 24, borderRadius: 12, maxWidth: 520, boxShadow: 'var(--shadow-sm)', marginBottom: 24 } as React.CSSProperties,
  input: { display: 'block', width: '100%', padding: 10, margin: '6px 0 14px', border: '1px solid var(--border-strong)', borderRadius: 8 } as React.CSSProperties,
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 } as React.CSSProperties,
  modal: { background: 'var(--surface)', borderRadius: 14, padding: 28, width: 440, boxShadow: '0 8px 32px rgba(0,0,0,.25)' } as React.CSSProperties,
}
const btn = (bg = 'var(--primary)', color = '#fff'): React.CSSProperties => ({
  padding: '7px 14px', background: bg, color, border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13,
})

export default function TurmasPage() {
  const [anos, setAnos] = useState<AnoAcademico[]>([])
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [anoId, setAnoId] = useState('')
  const [nome, setNome] = useState('')
  const [maxAlunos, setMaxAlunos] = useState('35')
  const [msg, setMsg] = useState<{ ok: boolean; texto: string } | null>(null)
  const [editTarget, setEditTarget] = useState<Turma | null>(null)
  const [editForm, setEditForm] = useState({ nome: '', max_alunos: '35' })
  const [confirmDelete, setConfirmDelete] = useState<Turma | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    academicoAPI.listarAnos().then(setAnos).catch(() => setAnos([]))
  }, [])

  function carregar(id: string) {
    if (id) turmasAPI.listar(id).then(setTurmas).catch(() => setTurmas([]))
  }

  async function criar(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)
    try {
      await turmasAPI.criar({ nome, ano_academico_id: anoId, max_alunos: Number(maxAlunos) })
      setMsg({ ok: true, texto: `Turma "${nome}" criada` })
      setNome('')
      carregar(anoId)
    } catch (err) {
      setMsg({ ok: false, texto: err instanceof Error ? err.message : 'Erro' })
    }
  }

  function abrirEditar(t: Turma) {
    setEditTarget(t)
    setEditForm({ nome: t.nome, max_alunos: String(t.max_alunos) })
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault()
    if (!editTarget) return
    setSaving(true)
    try {
      await turmasAPI.actualizar(editTarget.id, { nome: editForm.nome, max_alunos: Number(editForm.max_alunos) })
      setEditTarget(null)
      carregar(anoId)
    } catch (err) {
      setMsg({ ok: false, texto: err instanceof Error ? err.message : 'Erro ao guardar' })
    } finally { setSaving(false) }
  }

  async function inactivar(motivo: string) {
    if (!confirmDelete) return
    await turmasAPI.inactivar(confirmDelete.id, motivo)
    setConfirmDelete(null)
    carregar(anoId)
  }

  return (
    <div>
      <PageHeader title="Turmas" />

      <form onSubmit={criar} style={s.card}>
        <h3 style={{ marginTop: 0 }}>Nova turma</h3>
        <label>Ano academico</label>
        <select style={s.input} value={anoId}
          onChange={e => { setAnoId(e.target.value); carregar(e.target.value) }} required>
          <option value="">— selecionar —</option>
          {anos.map(a => <option key={a.id} value={a.id}>{a.designacao}</option>)}
        </select>
        <label>Nome da turma</label>
        <input style={s.input} value={nome} onChange={e => setNome(e.target.value)} required />
        <label>Capacidade</label>
        <input style={s.input} type="number" min="1" value={maxAlunos} onChange={e => setMaxAlunos(e.target.value)} />
        <button type="submit" style={btn()}>Criar turma</button>
      </form>

      {msg && <p style={{ color: msg.ok ? '#27ae60' : '#c0392b' }}>{msg.texto}</p>}

      <h3>Turmas do ano selecionado ({turmas.length})</h3>
      {turmas.length === 0
        ? <p style={{ color: '#888' }}>Selecione um ano academico.</p>
        : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--surface-alt, #f5f5f5)' }}>
                <th align="left" style={{ padding: '10px 12px' }}>Nome</th>
                <th align="left" style={{ padding: '10px 12px' }}>Capacidade</th>
                <th style={{ padding: '10px 12px' }}>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {turmas.map(t => (
                <tr key={t.id} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: '9px 12px' }}>{t.nome}</td>
                  <td style={{ padding: '9px 12px' }}>{t.max_alunos}</td>
                  <td style={{ padding: '9px 12px', display: 'flex', gap: 6, justifyContent: 'center' }}>
                    <button style={btn()} onClick={() => abrirEditar(t)}>Editar</button>
                    <button style={btn('#e74c3c')} onClick={() => setConfirmDelete(t)}>Inactivar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

      {/* Modal editar */}
      {editTarget && (
        <div style={s.overlay} onClick={() => setEditTarget(null)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>Editar turma</h3>
            <form onSubmit={guardar}>
              <label>Nome</label>
              <input style={s.input} value={editForm.nome}
                onChange={e => setEditForm({ ...editForm, nome: e.target.value })} required />
              <label>Capacidade</label>
              <input style={s.input} type="number" min="1" value={editForm.max_alunos}
                onChange={e => setEditForm({ ...editForm, max_alunos: e.target.value })} />
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
          titulo={`Inactivar turma — ${confirmDelete.nome}`}
          descricao="A turma ficará inactiva. Indique o motivo."
          onConfirm={inactivar}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  )
}
