// app/(public)/inscricao/page.tsx
'use client'

import { useState } from 'react'
import { publicAPI } from '@/lib/api'

const card: React.CSSProperties = {
  background: '#fff',
  padding: 24,
  borderRadius: 12,
  maxWidth: 520,
  boxShadow: '0 1px 6px rgba(0,0,0,.06)',
}
const input: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: 10,
  margin: '6px 0 16px',
  border: '1px solid #ddd',
  borderRadius: 8,
}
const btn: React.CSSProperties = {
  padding: '10px 16px',
  background: 'var(--primary)',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
}

export default function InscricaoPage() {
  const [form, setForm] = useState({
    nome_completo: '',
    telefone: '',
    email: '',
    curso_interesse: '',
    mensagem: '',
  })
  const [enviado, setEnviado] = useState(false)
  const [erro, setErro] = useState('')

  function set(campo: string, valor: string) {
    setForm((f) => ({ ...f, [campo]: valor }))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    try {
      await publicAPI.preInscricao(form)
      setEnviado(true)
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao enviar')
    }
  }

  if (enviado) {
    return (
      <div style={card}>
        <h1 style={{ color: '#27ae60', marginTop: 0 }}>Pedido enviado!</h1>
        <p>Obrigado, {form.nome_completo}. A secretaria entrara em contacto consigo.</p>
      </div>
    )
  }

  return (
    <div>
      <h1 style={{ color: 'var(--primary)' }}>Pedido de inscricao</h1>
      <form onSubmit={onSubmit} style={card}>
        <label htmlFor="nome">Nome completo</label>
        <input id="nome" aria-label="Nome completo" style={input}
          value={form.nome_completo} onChange={(e) => set('nome_completo', e.target.value)} required />

        <label htmlFor="tel">Telefone</label>
        <input id="tel" aria-label="Telefone" style={input}
          value={form.telefone} onChange={(e) => set('telefone', e.target.value)} required />

        <label htmlFor="email">Email (opcional)</label>
        <input id="email" aria-label="Email" type="email" style={input}
          value={form.email} onChange={(e) => set('email', e.target.value)} />

        <label htmlFor="curso">Curso de interesse</label>
        <input id="curso" aria-label="Curso de interesse" style={input}
          value={form.curso_interesse} onChange={(e) => set('curso_interesse', e.target.value)} />

        <label htmlFor="msg">Mensagem (opcional)</label>
        <textarea id="msg" aria-label="Mensagem" style={{ ...input, minHeight: 80 }}
          value={form.mensagem} onChange={(e) => set('mensagem', e.target.value)} />

        {erro && <p style={{ color: '#c0392b' }}>{erro}</p>}
        <button type="submit" style={btn}>Enviar pedido</button>
      </form>
    </div>
  )
}
