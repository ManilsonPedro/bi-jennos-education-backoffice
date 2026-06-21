'use client'

import { useEffect, useState } from 'react'
import { rhAPI } from '@/lib/api'
import { InactivarModal } from '@/components/ui/InactivarModal'
import { PageHeader } from '@/components/ui/PageHeader'
import { kz } from '@/lib/fmt'

interface Funcionario {
  id: string
  nome_completo: string
  categoria_profissional: string | null
  salario_base: string
}

const s = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 } as React.CSSProperties,
  modal: { background: 'var(--surface)', borderRadius: 14, padding: 28, width: 480, maxHeight: '90vh', overflowY: 'auto' as const, boxShadow: '0 8px 32px rgba(0,0,0,.25)' } as React.CSSProperties,
  input: { display: 'block', width: '100%', padding: 10, margin: '4px 0 12px', border: '1px solid var(--border-strong)', borderRadius: 8, boxSizing: 'border-box' as const } as React.CSSProperties,
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 } as React.CSSProperties,
}
const btn = (bg = 'var(--primary)', color = '#fff', extra?: React.CSSProperties): React.CSSProperties => ({
  padding: '7px 14px', background: bg, color, border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, ...extra,
})

const VINCULOS = ['efectivo', 'contratado', 'prestacao_servicos', 'estagiario']

type FForm = { nome_completo: string; bi_numero: string; nif: string; data_admissao: string; categoria_profissional: string; vinculo: string; salario_base: string }
const vazio = (): FForm => ({ nome_completo: '', bi_numero: '', nif: '', data_admissao: '', categoria_profissional: '', vinculo: 'contratado', salario_base: '0' })
const fromF = (f: Funcionario): FForm => ({ nome_completo: f.nome_completo, bi_numero: '', nif: '', data_admissao: '', categoria_profissional: f.categoria_profissional ?? '', vinculo: 'contratado', salario_base: f.salario_base })

export default function FuncionariosPage() {
  const [lista, setLista] = useState<Funcionario[]>([])
  const [filtro, setFiltro] = useState('')
  const [erro, setErro] = useState('')
  const [msg, setMsg] = useState('')
  const [saving, setSaving] = useState(false)

  const [modalCriar, setModalCriar] = useState(false)
  const [formCriar, setFormCriar] = useState<FForm>(vazio())

  const [editF, setEditF] = useState<Funcionario | null>(null)
  const [editForm, setEditForm] = useState<FForm>(vazio())

  const [confirmDel, setConfirmDel] = useState<Funcionario | null>(null)

  async function carregar() {
    try { setLista(await rhAPI.listarFuncionarios()) }
    catch (e) { setErro((e as Error).message) }
  }
  useEffect(() => { carregar() }, [])

  function payload(f: FForm, include_create = false) {
    const base: Record<string, unknown> = {
      nome_completo: f.nome_completo,
      categoria_profissional: f.categoria_profissional || undefined,
      vinculo: f.vinculo || undefined,
      salario_base: f.salario_base,
    }
    if (f.bi_numero) base.bi_numero = f.bi_numero
    if (f.nif) base.nif = f.nif
    if (include_create && f.data_admissao) base.data_admissao = f.data_admissao
    return base
  }

  async function criar(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setErro(''); setMsg('')
    try {
      await rhAPI.criarFuncionario(payload(formCriar, true) as Parameters<typeof rhAPI.criarFuncionario>[0])
      setModalCriar(false); setFormCriar(vazio()); setMsg('Funcionario criado.')
      await carregar()
    } catch (err) { setErro((err as Error).message) }
    finally { setSaving(false) }
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault(); if (!editF) return; setSaving(true)
    try {
      await rhAPI.actualizarFuncionario(editF.id, payload(editForm))
      setEditF(null); await carregar()
    } catch (err) { setErro((err as Error).message) }
    finally { setSaving(false) }
  }

  async function inactivar(motivo: string) {
    if (!confirmDel) return
    await rhAPI.inactivarFuncionario(confirmDel.id, motivo)
    setConfirmDel(null)
    await carregar()
  }

  const filtrados = lista.filter(f => f.nome_completo.toLowerCase().includes(filtro.toLowerCase()))

  const campos = (form: FForm, set: (f: FForm) => void, isCriar = false) => (
    <>
      <label htmlFor="fn-nome">Nome completo *</label>
      <input id="fn-nome" style={s.input} value={form.nome_completo} onChange={e => set({ ...form, nome_completo: e.target.value })} required />
      <div style={s.grid2}>
        <div>
          <label htmlFor="fn-cat">Categoria profissional</label>
          <input id="fn-cat" style={s.input} value={form.categoria_profissional} onChange={e => set({ ...form, categoria_profissional: e.target.value })} placeholder="ex: Professor, Admin" />
        </div>
        <div>
          <label htmlFor="fn-vin">Vinculo</label>
          <select id="fn-vin" style={s.input} value={form.vinculo} onChange={e => set({ ...form, vinculo: e.target.value })}>
            {VINCULOS.map(v => <option key={v} value={v}>{v.replace('_', ' ')}</option>)}
          </select>
        </div>
      </div>
      <div style={s.grid2}>
        <div>
          <label htmlFor="fn-bi">BI / Passaporte</label>
          <input id="fn-bi" style={s.input} value={form.bi_numero} onChange={e => set({ ...form, bi_numero: e.target.value })} />
        </div>
        <div>
          <label htmlFor="fn-nif">NIF</label>
          <input id="fn-nif" style={s.input} value={form.nif} onChange={e => set({ ...form, nif: e.target.value })} />
        </div>
      </div>
      <div style={s.grid2}>
        <div>
          <label htmlFor="fn-sal">Salario base (Kz) *</label>
          <input id="fn-sal" type="number" min="0" step="0.01" style={s.input} value={form.salario_base} onChange={e => set({ ...form, salario_base: e.target.value })} required />
        </div>
        {isCriar && (
          <div>
            <label htmlFor="fn-adm">Data admissao</label>
            <input id="fn-adm" type="date" style={s.input} value={form.data_admissao} onChange={e => set({ ...form, data_admissao: e.target.value })} />
          </div>
        )}
      </div>
    </>
  )

  return (
    <div>
      <PageHeader
        title="Funcionarios & Docentes"
        actions={
          <button style={btn()} onClick={() => { setModalCriar(true); setFormCriar(vazio()) }}>+ Novo funcionario</button>
        }
      />
      {erro && <p style={{ color: 'var(--danger)', marginBottom: 12 }}>{erro}</p>}
      {msg && <p style={{ color: '#27ae60', marginBottom: 12 }}>{msg}</p>}

      <input placeholder="Pesquisar nome..." style={{ ...s.input, margin: '0 0 16px', maxWidth: 300 }} value={filtro} onChange={e => setFiltro(e.target.value)} />

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--surface)', borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          <thead>
            <tr style={{ background: 'var(--primary)', color: '#fff' }}>
              <th align="left" style={{ padding: '12px 14px' }}>Nome</th>
              <th align="left" style={{ padding: '12px 14px' }}>Categoria</th>
              <th align="left" style={{ padding: '12px 14px' }}>Salario base</th>
              <th style={{ padding: '12px 14px' }}>Acoes</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 && <tr><td colSpan={4} style={{ padding: 24, textAlign: 'center', color: '#888' }}>Sem funcionarios registados.</td></tr>}
            {filtrados.map(f => (
              <tr key={f.id} style={{ borderTop: '1px solid var(--border)' }}>
                <td style={{ padding: '10px 14px', fontWeight: 600 }}>{f.nome_completo}</td>
                <td style={{ padding: '10px 14px', color: '#555' }}>{f.categoria_profissional ?? '—'}</td>
                <td style={{ padding: '10px 14px' }}>{kz(f.salario_base)}</td>
                <td style={{ padding: '10px 14px', display: 'flex', gap: 8, justifyContent: 'center' }}>
                  <button style={btn('#6c757d')} onClick={() => { setEditF(f); setEditForm(fromF(f)) }}>Editar</button>
                  <button style={btn('#e74c3c')} onClick={() => setConfirmDel(f)}>Inactivar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalCriar && (
        <div style={s.overlay} onClick={() => setModalCriar(false)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>Novo funcionario</h3>
            <form onSubmit={criar}>{campos(formCriar, setFormCriar, true)}
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="submit" style={btn()} disabled={saving}>{saving ? 'A criar...' : 'Criar'}</button>
                <button type="button" style={btn('#888')} onClick={() => setModalCriar(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editF && (
        <div style={s.overlay} onClick={() => setEditF(null)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>Editar — {editF.nome_completo}</h3>
            <form onSubmit={guardar}>{campos(editForm, setEditForm)}
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="submit" style={btn()} disabled={saving}>{saving ? 'A guardar...' : 'Guardar'}</button>
                <button type="button" style={btn('#888')} onClick={() => setEditF(null)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDel && (
        <InactivarModal
          titulo={`Inactivar funcionario — ${confirmDel.nome_completo}`}
          descricao="O funcionario ficará inactivo. Indique o motivo."
          onConfirm={inactivar}
          onCancel={() => setConfirmDel(null)}
        />
      )}
    </div>
  )
}
