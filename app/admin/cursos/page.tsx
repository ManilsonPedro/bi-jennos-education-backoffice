// app/admin/cursos/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { cursosAPI, type Curso } from '@/lib/api'

const card: React.CSSProperties = {
  background: 'var(--surface)', padding: 24, borderRadius: 12, maxWidth: 640,
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

export default function CursosPage() {
  const [cursos, setCursos] = useState<Curso[]>([])
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [erro, setErro] = useState('')

  async function carregar() {
    try { setCursos(await cursosAPI.listar()) }
    catch (e) { setErro((e as Error).message) }
  }
  useEffect(() => { carregar() }, [])

  async function criar(e: React.FormEvent) {
    e.preventDefault()
    try {
      await cursosAPI.criar({ nome, descricao: descricao || undefined })
      setNome(''); setDescricao(''); await carregar()
    } catch (err) { setErro((err as Error).message) }
  }

  return (
    <>
      <h1>Cursos</h1>
      {erro && <p style={{ color: 'var(--danger)' }}>{erro}</p>}

      <section style={card}>
        <h3>Novo curso</h3>
        <form onSubmit={criar}>
          <label>Nome</label>
          <input style={input} value={nome} onChange={(e) => setNome(e.target.value)} required />
          <label>Descricao</label>
          <input style={input} value={descricao} onChange={(e) => setDescricao(e.target.value)} />
          <button style={btn}>Criar</button>
        </form>
      </section>

      <section style={{ ...card, maxWidth: 'unset' }}>
        <h3>Lista ({cursos.length})</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr><th align="left">Nome</th><th align="left">Descricao</th><th align="left">ID</th></tr></thead>
          <tbody>
            {cursos.map((c) => (
              <tr key={c.id}>
                <td>{c.nome}</td>
                <td>{c.descricao ?? '-'}</td>
                <td style={{ fontFamily: 'monospace', fontSize: 11 }}>{c.id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  )
}
