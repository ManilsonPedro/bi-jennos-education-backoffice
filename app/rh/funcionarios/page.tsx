// app/rh/funcionarios/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { rhAPI, type Funcionario } from '@/lib/api'

const card: React.CSSProperties = {
  background: 'var(--surface)',
  padding: 24,
  borderRadius: 12,
  maxWidth: 640,
  boxShadow: 'var(--shadow-sm)',
  marginBottom: 24,
}
const input: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: 10,
  margin: '6px 0 16px',
  border: '1px solid var(--border-strong)',
  borderRadius: 8,
}
const btn: React.CSSProperties = {
  padding: '8px 14px',
  background: 'var(--primary)',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
}

export default function FuncionariosPage() {
  const [lista, setLista] = useState<Funcionario[]>([])
  const [nome, setNome] = useState('')
  const [categoria, setCategoria] = useState('')
  const [salario, setSalario] = useState('')
  const [erro, setErro] = useState('')

  async function carregar() {
    try {
      setLista(await rhAPI.listarFuncionarios())
    } catch (e) { setErro((e as Error).message) }
  }
  useEffect(() => { carregar() }, [])

  async function criar(e: React.FormEvent) {
    e.preventDefault()
    try {
      await rhAPI.criarFuncionario({
        nome_completo: nome,
        categoria_profissional: categoria,
        salario_base: salario,
      })
      setNome(''); setCategoria(''); setSalario('')
      await carregar()
    } catch (err) { setErro((err as Error).message) }
  }

  return (
    <>
      <h1>Funcionarios</h1>
      {erro && <p style={{ color: 'var(--danger)' }}>{erro}</p>}

      <section style={card}>
        <h3>Novo funcionario</h3>
        <form onSubmit={criar}>
          <label>Nome completo</label>
          <input style={input} value={nome} onChange={(e) => setNome(e.target.value)} required />
          <label>Categoria profissional</label>
          <input style={input} value={categoria} onChange={(e) => setCategoria(e.target.value)} />
          <label>Salario base (AOA)</label>
          <input style={input} value={salario} onChange={(e) => setSalario(e.target.value)} required />
          <button style={btn}>Criar</button>
        </form>
      </section>

      <section style={{ ...card, maxWidth: 'unset' }}>
        <h3>Lista ({lista.length})</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr><th>Nome</th><th>Categoria</th><th>Salario base</th></tr>
          </thead>
          <tbody>
            {lista.map((f) => (
              <tr key={f.id}>
                <td>{f.nome_completo}</td>
                <td>{f.categoria_profissional ?? '-'}</td>
                <td>{f.salario_base}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  )
}
