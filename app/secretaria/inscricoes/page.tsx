// app/secretaria/inscricoes/page.tsx
'use client'

import { useEffect, useState } from 'react'
import {
  academicoAPI, classesAPI, inscricoesAPI,
  type AnoAcademico, type Classe, type Inscricao,
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
  border: 'none', borderRadius: 8, marginRight: 8,
}

const ESTADOS = ['', 'pendente', 'aprovada', 'rejeitada', 'convertida']

export default function InscricoesPage() {
  const [anos, setAnos] = useState<AnoAcademico[]>([])
  const [classes, setClasses] = useState<Classe[]>([])
  const [lista, setLista] = useState<Inscricao[]>([])
  const [filtro, setFiltro] = useState('')
  const [form, setForm] = useState({
    nome_candidato: '', data_nascimento: '', ano_academico_id: '', classe_id: '',
    bi_numero: '', telefone: '', email: '',
    enc_nome: '', enc_telefone: '', tipo: 'nova',
  })
  const [erro, setErro] = useState('')
  const [msg, setMsg] = useState('')

  async function carregar() {
    try {
      setAnos(await academicoAPI.listarAnos())
      setClasses(await classesAPI.listar())
      setLista(await inscricoesAPI.listar(filtro || undefined))
    } catch (e) { setErro((e as Error).message) }
  }
  useEffect(() => { carregar() }, [filtro])

  async function criar(e: React.FormEvent) {
    e.preventDefault()
    setErro(''); setMsg('')
    try {
      const i = await inscricoesAPI.criar({
        ...form,
        classe_id: form.classe_id || undefined,
        bi_numero: form.bi_numero || undefined,
        telefone: form.telefone || undefined,
        email: form.email || undefined,
        enc_nome: form.enc_nome || undefined,
        enc_telefone: form.enc_telefone || undefined,
      })
      setMsg(`Inscricao ${i.numero_inscricao} criada.`)
      setForm({ ...form, nome_candidato: '', data_nascimento: '', bi_numero: '', telefone: '', email: '', enc_nome: '', enc_telefone: '' })
      await carregar()
    } catch (err) { setErro((err as Error).message) }
  }

  async function aprovar(id: string) {
    try { await inscricoesAPI.aprovar(id); await carregar() }
    catch (e) { setErro((e as Error).message) }
  }
  async function rejeitar(id: string) {
    const motivo = prompt('Motivo da rejeicao?') ?? ''
    if (!motivo) return
    try { await inscricoesAPI.rejeitar(id, motivo); await carregar() }
    catch (e) { setErro((e as Error).message) }
  }
  async function converter(id: string) {
    try {
      const r = await inscricoesAPI.converter(id)
      setMsg(`Convertido em aluno ${r.numero_aluno} (matricula ${r.numero_matricula}).`)
      await carregar()
    } catch (e) { setErro((e as Error).message) }
  }

  return (
    <>
      <h1>Inscricoes</h1>
      {erro && <p style={{ color: 'var(--danger)' }}>{erro}</p>}
      {msg && <p style={{ color: 'var(--success)' }}>{msg}</p>}

      <section style={card}>
        <h3>Nova inscricao</h3>
        <form onSubmit={criar}>
          <label>Nome do candidato</label>
          <input style={input} value={form.nome_candidato} onChange={(e) => setForm({ ...form, nome_candidato: e.target.value })} required />
          <label>Data de nascimento (YYYY-MM-DD)</label>
          <input style={input} value={form.data_nascimento} onChange={(e) => setForm({ ...form, data_nascimento: e.target.value })} required />
          <label>Ano academico</label>
          <select style={input} value={form.ano_academico_id} onChange={(e) => setForm({ ...form, ano_academico_id: e.target.value })} required>
            <option value="">--</option>
            {anos.map((a) => <option key={a.id} value={a.id}>{a.designacao}</option>)}
          </select>
          <label>Classe (opcional)</label>
          <select style={input} value={form.classe_id} onChange={(e) => setForm({ ...form, classe_id: e.target.value })}>
            <option value="">--</option>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
          <label>BI</label>
          <input style={input} value={form.bi_numero} onChange={(e) => setForm({ ...form, bi_numero: e.target.value })} />
          <label>Telefone</label>
          <input style={input} value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
          <label>Email</label>
          <input style={input} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <label>Enc. de educacao</label>
          <input style={input} value={form.enc_nome} onChange={(e) => setForm({ ...form, enc_nome: e.target.value })} />
          <label>Telefone enc.</label>
          <input style={input} value={form.enc_telefone} onChange={(e) => setForm({ ...form, enc_telefone: e.target.value })} />
          <label>Tipo</label>
          <select style={input} value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
            <option value="nova">nova</option>
            <option value="rematricula">rematricula</option>
            <option value="transferencia">transferencia</option>
          </select>
          <button style={btn}>Criar</button>
        </form>
      </section>

      <section style={{ ...card, maxWidth: 'unset' }}>
        <h3>Lista</h3>
        <label>Filtrar por estado</label>
        <select style={input} value={filtro} onChange={(e) => setFiltro(e.target.value)}>
          {ESTADOS.map((s) => <option key={s} value={s}>{s || 'todos'}</option>)}
        </select>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr><th align="left">N°</th><th align="left">Candidato</th><th align="left">Estado</th><th align="left">Tipo</th><th></th></tr>
          </thead>
          <tbody>
            {lista.map((i) => (
              <tr key={i.id}>
                <td>{i.numero_inscricao}</td>
                <td>{i.nome_candidato}</td>
                <td><b>{i.estado}</b></td>
                <td>{i.tipo}</td>
                <td>
                  {i.estado === 'pendente' && (
                    <>
                      <button style={btn} onClick={() => aprovar(i.id)}>Aprovar</button>
                      <button style={btn} onClick={() => rejeitar(i.id)}>Rejeitar</button>
                    </>
                  )}
                  {i.estado === 'aprovada' && (
                    <button style={btn} onClick={() => converter(i.id)}>Converter em aluno</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  )
}
