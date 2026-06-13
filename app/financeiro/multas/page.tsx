// app/financeiro/multas/page.tsx
'use client'

import { useState } from 'react'
import { multasAPI, type Multa } from '@/lib/api'

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
  marginRight: 8,
}
const TIPOS = ['atraso_propina', 'dano_material', 'disciplinar', 'livro_nao_devolvido', 'outro']

export default function MultasPage() {
  const [alunoId, setAlunoId] = useState('')
  const [tipo, setTipo] = useState('outro')
  const [valor, setValor] = useState('')
  const [descricao, setDescricao] = useState('')
  const [multas, setMultas] = useState<Multa[]>([])
  const [erro, setErro] = useState('')
  const [msg, setMsg] = useState('')

  async function listar() {
    try {
      setErro('')
      setMultas(await multasAPI.porAluno(alunoId))
    } catch (e) {
      setErro((e as Error).message)
    }
  }
  async function emitir(e: React.FormEvent) {
    e.preventDefault()
    try {
      setErro('')
      await multasAPI.emitir({ aluno_id: alunoId, tipo, valor, descricao })
      setMsg('Multa emitida')
      await listar()
    } catch (err) {
      setErro((err as Error).message)
    }
  }
  async function pagar(id: string, v: string) {
    await multasAPI.pagar(id, v)
    await listar()
  }
  async function isentar(id: string) {
    const motivo = prompt('Motivo da isencao?') ?? ''
    if (!motivo) return
    await multasAPI.isentar(id, motivo)
    await listar()
  }
  async function gerarAtraso() {
    const r = await multasAPI.gerarAtraso()
    setMsg(`Geradas ${r.multas_geradas} multas de atraso`)
  }

  return (
    <>
      <h1>Multas</h1>
      {erro && <p style={{ color: 'var(--danger)' }}>{erro}</p>}
      {msg && <p style={{ color: 'var(--success)' }}>{msg}</p>}

      <section style={card}>
        <h3>Emitir multa</h3>
        <form onSubmit={emitir}>
          <label>Aluno ID</label>
          <input style={input} value={alunoId} onChange={(e) => setAlunoId(e.target.value)} required />
          <label>Tipo</label>
          <select style={input} value={tipo} onChange={(e) => setTipo(e.target.value)}>
            {TIPOS.map((t) => <option key={t}>{t}</option>)}
          </select>
          <label>Valor (AOA)</label>
          <input style={input} value={valor} onChange={(e) => setValor(e.target.value)} required />
          <label>Descricao</label>
          <input style={input} value={descricao} onChange={(e) => setDescricao(e.target.value)} />
          <button style={btn}>Emitir</button>
          <button type="button" style={btn} onClick={listar}>Listar do aluno</button>
          <button type="button" style={btn} onClick={gerarAtraso}>Gerar multas de atraso</button>
        </form>
      </section>

      {multas.length > 0 && (
        <section style={{ ...card, maxWidth: 'unset' }}>
          <h3>Multas do aluno</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr><th>N°</th><th>Tipo</th><th>Estado</th><th>Valor</th><th>Pago</th><th></th></tr>
            </thead>
            <tbody>
              {multas.map((m) => (
                <tr key={m.id}>
                  <td>{m.numero_multa}</td>
                  <td>{m.tipo}</td>
                  <td>{m.estado}</td>
                  <td>{m.valor}</td>
                  <td>{m.valor_pago}</td>
                  <td>
                    {m.estado === 'pendente' && (
                      <>
                        <button style={btn} onClick={() => pagar(m.id, m.valor)}>Pagar</button>
                        <button style={btn} onClick={() => isentar(m.id)}>Isentar</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </>
  )
}
