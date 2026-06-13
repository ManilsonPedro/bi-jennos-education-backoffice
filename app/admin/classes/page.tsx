// app/admin/classes/page.tsx
'use client'

import { useEffect, useState } from 'react'
import {
  academicoAPI, classesAPI, cursosAPI,
  type AnoAcademico, type Classe, type Curso,
} from '@/lib/api'

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
  border: 'none', borderRadius: 8,
}

export default function ClassesPage() {
  const [anos, setAnos] = useState<AnoAcademico[]>([])
  const [cursos, setCursos] = useState<Curso[]>([])
  const [classes, setClasses] = useState<Classe[]>([])
  const [form, setForm] = useState({
    nome: '', curso_id: '', ano_academico_id: '',
    turno: 'manha', sala: '', vagas: '30',
  })
  const [erro, setErro] = useState('')

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

  return (
    <>
      <h1>Classes</h1>
      {erro && <p style={{ color: 'var(--danger)' }}>{erro}</p>}

      <section style={card}>
        <h3>Nova classe</h3>
        <form onSubmit={criar}>
          <label>Nome</label>
          <input style={input} value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
          <label>Curso</label>
          <select style={input} value={form.curso_id} onChange={(e) => setForm({ ...form, curso_id: e.target.value })} required>
            <option value="">--</option>
            {cursos.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
          <label>Ano academico</label>
          <select style={input} value={form.ano_academico_id} onChange={(e) => setForm({ ...form, ano_academico_id: e.target.value })} required>
            <option value="">--</option>
            {anos.map((a) => <option key={a.id} value={a.id}>{a.designacao}</option>)}
          </select>
          <label>Turno</label>
          <select style={input} value={form.turno} onChange={(e) => setForm({ ...form, turno: e.target.value })}>
            <option value="manha">manha</option>
            <option value="tarde">tarde</option>
            <option value="noite">noite</option>
          </select>
          <label>Sala</label>
          <input style={input} value={form.sala} onChange={(e) => setForm({ ...form, sala: e.target.value })} />
          <label>Vagas</label>
          <input style={input} value={form.vagas} onChange={(e) => setForm({ ...form, vagas: e.target.value })} />
          <button style={btn}>Criar</button>
        </form>
      </section>

      <section style={{ ...card, maxWidth: 'unset' }}>
        <h3>Lista ({classes.length})</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr><th align="left">Nome</th><th align="left">Turno</th><th align="left">Sala</th><th>Vagas</th></tr></thead>
          <tbody>
            {classes.map((c) => (
              <tr key={c.id}>
                <td>{c.nome}</td>
                <td>{c.turno ?? '-'}</td>
                <td>{c.sala ?? '-'}</td>
                <td>{c.vagas ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  )
}
