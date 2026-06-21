// app/admin/horarios/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { horariosAPI, type ItemCronograma, type Sala } from '@/lib/api'
import { InactivarModal } from '@/components/ui/InactivarModal'

const card: React.CSSProperties = {
  background: 'var(--surface)', padding: 24, borderRadius: 12, maxWidth: 720,
  boxShadow: 'var(--shadow-sm)', marginBottom: 24,
}
const input: React.CSSProperties = {
  display: 'block', width: '100%', padding: 10, margin: '6px 0 16px',
  border: '1px solid var(--border-strong)', borderRadius: 8,
}
const btn: React.CSSProperties = {
  padding: '8px 14px', background: 'var(--primary)', color: '#fff',
  border: 'none', borderRadius: 8, marginRight: 8,
}
const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab']

export default function HorariosPage() {
  const [salas, setSalas] = useState<Sala[]>([])
  const [novaSala, setNovaSala] = useState('')
  const [classeId, setClasseId] = useState('')
  const [anoId, setAnoId] = useState('')
  const [cronograma, setCronograma] = useState('')
  const [itens, setItens] = useState<ItemCronograma[]>([])
  const [form, setForm] = useState({
    disciplina_id: '', docente_id: '', sala_id: '',
    dia_semana: '1', hora_inicio: '08:00', hora_fim: '09:00',
  })
  const [erro, setErro] = useState('')
  const [editSala, setEditSala] = useState<Sala | null>(null)
  const [editSalaForm, setEditSalaForm] = useState({ nome: '', capacidade: '0' })
  const [confirmDeleteSala, setConfirmDeleteSala] = useState<Sala | null>(null)
  const [savingSala, setSavingSala] = useState(false)

  async function carregarSalas() {
    try { setSalas(await horariosAPI.salas()) }
    catch (e) { setErro((e as Error).message) }
  }
  useEffect(() => { carregarSalas() }, [])

  async function criarSala() {
    try {
      await horariosAPI.criarSala({ nome: novaSala })
      setNovaSala(''); await carregarSalas()
    } catch (e) { setErro((e as Error).message) }
  }
  async function criarCronograma() {
    try {
      const c = await horariosAPI.criarCronograma({
        classe_id: classeId, ano_academico_id: anoId,
      })
      setCronograma(c.id); setItens([])
    } catch (e) { setErro((e as Error).message) }
  }
  async function listar() {
    try { setItens(await horariosAPI.itens(cronograma)) }
    catch (e) { setErro((e as Error).message) }
  }
  async function adicionar(e: React.FormEvent) {
    e.preventDefault()
    try {
      await horariosAPI.adicionarItem(cronograma, {
        ...form, dia_semana: Number(form.dia_semana),
      })
      await listar()
    } catch (err) { setErro((err as Error).message) }
  }
  async function removerItem(id: string) {
    await horariosAPI.inactivarItem(id, 'Removido do cronograma'); await listar()
  }

  async function guardarSala(e: React.FormEvent) {
    e.preventDefault()
    if (!editSala) return
    setSavingSala(true)
    try {
      await horariosAPI.actualizarSala(editSala.id, { nome: editSalaForm.nome, capacidade: Number(editSalaForm.capacidade) })
      setEditSala(null)
      await carregarSalas()
    } catch (err) { setErro((err as Error).message) }
    finally { setSavingSala(false) }
  }

  async function inactivarSala(motivo: string) {
    if (!confirmDeleteSala) return
    await horariosAPI.inactivarSala(confirmDeleteSala.id, motivo)
    setConfirmDeleteSala(null)
    await carregarSalas()
  }

  const overlay: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }
  const modal: React.CSSProperties = { background: 'var(--surface)', borderRadius: 14, padding: 28, width: 420, boxShadow: '0 8px 32px rgba(0,0,0,.25)' }

  return (
    <>
      <PageHeader title="Horarios" />
      {erro && <p style={{ color: 'var(--danger)' }}>{erro}</p>}

      <section style={card}>
        <h3>Salas ({salas.length})</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
          <thead>
            <tr style={{ background: 'var(--surface-alt, #f5f5f5)' }}>
              <th align="left" style={{ padding: '8px 10px' }}>Nome</th>
              <th align="left" style={{ padding: '8px 10px' }}>Capacidade</th>
              <th style={{ padding: '8px 10px' }}>Acoes</th>
            </tr>
          </thead>
          <tbody>
            {salas.map(sala => (
              <tr key={sala.id} style={{ borderTop: '1px solid var(--border)' }}>
                <td style={{ padding: '8px 10px' }}>{sala.nome}</td>
                <td style={{ padding: '8px 10px' }}>{sala.capacidade ?? '-'}</td>
                <td style={{ padding: '8px 10px', display: 'flex', gap: 6, justifyContent: 'center' }}>
                  <button style={{ ...btn, marginRight: 0 }} onClick={() => { setEditSala(sala); setEditSalaForm({ nome: sala.nome, capacidade: String(sala.capacidade ?? 0) }) }}>Editar</button>
                  <button style={{ ...btn, background: '#e74c3c', marginRight: 0 }} onClick={() => setConfirmDeleteSala(sala)}>Inactivar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display: 'flex', gap: 8 }}>
          <input style={{ ...input, margin: 0, flex: 1 }} placeholder="Nome da nova sala" value={novaSala} onChange={(e) => setNovaSala(e.target.value)} />
          <button style={btn} disabled={!novaSala} onClick={criarSala}>Criar</button>
        </div>
      </section>

      <section style={card}>
        <h3>Cronograma</h3>
        <label>Classe ID</label>
        <input style={input} value={classeId} onChange={(e) => setClasseId(e.target.value)} />
        <label>Ano academico ID</label>
        <input style={input} value={anoId} onChange={(e) => setAnoId(e.target.value)} />
        <button style={btn} onClick={criarCronograma}>Criar cronograma</button>
        <label>Ou cronograma existente:</label>
        <input style={input} value={cronograma} onChange={(e) => setCronograma(e.target.value)} />
        <button style={btn} disabled={!cronograma} onClick={listar}>Listar itens</button>
      </section>

      {cronograma && (
        <section style={card}>
          <h3>Adicionar item</h3>
          <form onSubmit={adicionar}>
            <label>Disciplina ID</label>
            <input style={input} value={form.disciplina_id} onChange={(e) => setForm({ ...form, disciplina_id: e.target.value })} />
            <label>Docente ID</label>
            <input style={input} value={form.docente_id} onChange={(e) => setForm({ ...form, docente_id: e.target.value })} />
            <label>Sala</label>
            <select style={input} value={form.sala_id} onChange={(e) => setForm({ ...form, sala_id: e.target.value })}>
              <option value="">--</option>
              {salas.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
            </select>
            <label>Dia da semana</label>
            <select style={input} value={form.dia_semana} onChange={(e) => setForm({ ...form, dia_semana: e.target.value })}>
              {DIAS.map((d, i) => <option key={i} value={i}>{i} — {d}</option>)}
            </select>
            <label>Hora inicio (HH:MM)</label>
            <input style={input} value={form.hora_inicio} onChange={(e) => setForm({ ...form, hora_inicio: e.target.value })} />
            <label>Hora fim (HH:MM)</label>
            <input style={input} value={form.hora_fim} onChange={(e) => setForm({ ...form, hora_fim: e.target.value })} />
            <button style={btn}>Adicionar (valida colisoes)</button>
          </form>
        </section>
      )}

      {itens.length > 0 && (
        <section style={{ ...card, maxWidth: 'unset' }}>
          <h3>Itens ({itens.length})</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr><th>Dia</th><th>Inicio</th><th>Fim</th><th>Sala</th><th></th></tr></thead>
            <tbody>
              {itens.map((it) => (
                <tr key={it.id}>
                  <td>{DIAS[it.dia_semana]}</td>
                  <td>{it.hora_inicio}</td>
                  <td>{it.hora_fim}</td>
                  <td>{salas.find((s) => s.id === it.sala_id)?.nome ?? it.sala_id}</td>
                  <td><button style={btn} onClick={() => removerItem(it.id)}>x</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
      {/* Modal editar sala */}
      {editSala && (
        <div style={overlay} onClick={() => setEditSala(null)}>
          <div style={modal} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>Editar sala</h3>
            <form onSubmit={guardarSala}>
              <label htmlFor="edit-sala-nome">Nome</label>
              <input id="edit-sala-nome" style={input} value={editSalaForm.nome} onChange={e => setEditSalaForm({ ...editSalaForm, nome: e.target.value })} required />
              <label htmlFor="edit-sala-cap">Capacidade</label>
              <input id="edit-sala-cap" style={input} type="number" min="0" value={editSalaForm.capacidade} onChange={e => setEditSalaForm({ ...editSalaForm, capacidade: e.target.value })} />
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" style={btn} disabled={savingSala}>{savingSala ? 'A guardar...' : 'Guardar'}</button>
                <button type="button" style={{ ...btn, background: '#888' }} onClick={() => setEditSala(null)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDeleteSala && (
        <InactivarModal
          titulo={`Inactivar sala — ${confirmDeleteSala.nome}`}
          descricao="A sala ficará inactiva. Indique o motivo."
          onConfirm={inactivarSala}
          onCancel={() => setConfirmDeleteSala(null)}
        />
      )}
    </>
  )
}
