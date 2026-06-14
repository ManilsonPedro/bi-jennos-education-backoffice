'use client'

import { useEffect, useState } from 'react'
import { alunosAPI, type PaginatedAlunos } from '@/lib/api'
import { InactivarModal } from '@/components/ui/InactivarModal'

type Aluno = PaginatedAlunos['items'][number]

const input: React.CSSProperties = {
  display: 'block', width: '100%', padding: 10,
  margin: '6px 0 14px', border: '1px solid var(--border-strong)', borderRadius: 8,
}
const btn = (bg = 'var(--primary)', color = '#fff'): React.CSSProperties => ({
  padding: '7px 14px', background: bg, color, border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13,
})
const overlay: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
}
const modal: React.CSSProperties = {
  background: 'var(--surface)', borderRadius: 14, padding: 28,
  width: 480, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,.25)',
}

interface EditForm {
  nome_completo: string
  email: string
  telefone: string
}

export default function AlunosPage() {
  const [data, setData] = useState<PaginatedAlunos | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [erro, setErro] = useState('')
  const [editTarget, setEditTarget] = useState<Aluno | null>(null)
  const [form, setForm] = useState<EditForm>({ nome_completo: '', email: '', telefone: '' })
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<Aluno | null>(null)

  function carregar() {
    alunosAPI
      .listar(page, 20, search)
      .then(setData)
      .catch((e) => setErro(e instanceof Error ? e.message : 'Erro ao carregar'))
  }

  useEffect(() => { carregar() }, [page, search])

  function abrirEditar(aluno: Aluno) {
    setEditTarget(aluno)
    setForm({ nome_completo: aluno.nome_completo, email: aluno.email ?? '', telefone: aluno.telefone ?? '' })
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault()
    if (!editTarget) return
    setSaving(true)
    try {
      await alunosAPI.actualizar(editTarget.id, {
        nome_completo: form.nome_completo || undefined,
        email: form.email || undefined,
        telefone: form.telefone || undefined,
      })
      setEditTarget(null)
      carregar()
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao guardar')
    } finally { setSaving(false) }
  }

  async function inactivar(motivo: string) {
    if (!confirmDelete) return
    await alunosAPI.inactivar(confirmDelete.id, motivo)
    setConfirmDelete(null)
    if (data && data.items.length === 1 && page > 1) setPage(p => p - 1)
    else carregar()
  }

  return (
    <div>
      <h1 style={{ color: 'var(--primary)' }}>Alunos</h1>

      <input
        placeholder="Pesquisar por nome ou numero..."
        value={search}
        onChange={(e) => { setPage(1); setSearch(e.target.value) }}
        style={{ padding: 10, width: 320, borderRadius: 8, border: '1px solid var(--border-strong)', marginBottom: 16 }}
      />

      {erro && <p style={{ color: 'var(--danger)' }}>{erro}</p>}

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--surface-alt, #f5f5f5)' }}>
              <th align="left" style={{ padding: '10px 12px' }}>Numero</th>
              <th align="left" style={{ padding: '10px 12px' }}>Nome</th>
              <th align="left" style={{ padding: '10px 12px' }}>Email</th>
              <th align="left" style={{ padding: '10px 12px' }}>Telefone</th>
              <th style={{ padding: '10px 12px' }}>Acoes</th>
            </tr>
          </thead>
          <tbody>
            {(data?.items ?? []).map((a) => (
              <tr key={a.id} style={{ borderTop: '1px solid var(--border)' }}>
                <td style={{ padding: '9px 12px', fontFamily: 'monospace', fontSize: 13 }}>{a.numero_aluno}</td>
                <td style={{ padding: '9px 12px' }}>{a.nome_completo}</td>
                <td style={{ padding: '9px 12px' }}>{a.email ?? '-'}</td>
                <td style={{ padding: '9px 12px' }}>{a.telefone ?? '-'}</td>
                <td style={{ padding: '9px 12px', textAlign: 'center', display: 'flex', gap: 6, justifyContent: 'center' }}>
                  <button style={btn()} onClick={() => abrirEditar(a)}>Editar</button>
                  <button style={btn('#e74c3c')} onClick={() => setConfirmDelete(a)}>Inactivar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data && (
        <div style={{ marginTop: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Anterior</button>
          <span>Pagina {data.page} de {data.pages || 1} ({data.total} alunos)</span>
          <button disabled={page >= data.pages} onClick={() => setPage(p => p + 1)}>Seguinte</button>
        </div>
      )}

      {/* Modal editar */}
      {editTarget && (
        <div style={overlay} onClick={() => setEditTarget(null)}>
          <div style={modal} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>Editar aluno — {editTarget.numero_aluno}</h3>
            <form onSubmit={guardar}>
              <label>Nome completo</label>
              <input style={input} value={form.nome_completo}
                onChange={e => setForm({ ...form, nome_completo: e.target.value })} required />
              <label>Email</label>
              <input style={input} type="email" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} />
              <label>Telefone</label>
              <input style={input} value={form.telefone}
                onChange={e => setForm({ ...form, telefone: e.target.value })} />
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="submit" style={btn()} disabled={saving}>
                  {saving ? 'A guardar...' : 'Guardar'}
                </button>
                <button type="button" style={btn('#888')} onClick={() => setEditTarget(null)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDelete && (
        <InactivarModal
          titulo={`Inactivar aluno — ${confirmDelete.nome_completo}`}
          descricao="O aluno ficará inactivo mas o registo é mantido. Indique o motivo."
          onConfirm={inactivar}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  )
}
