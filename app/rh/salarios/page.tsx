// app/rh/salarios/page.tsx
'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { rhAPI } from '@/lib/api'

const card: React.CSSProperties = {
  background: 'var(--surface)', padding: 24, borderRadius: 12, maxWidth: 520,
  boxShadow: 'var(--shadow-sm)', marginBottom: 24,
}
const input: React.CSSProperties = {
  display: 'block', width: '100%', padding: 10, margin: '6px 0 16px',
  border: '1px solid var(--border-strong)', borderRadius: 8,
}
const btn: React.CSSProperties = {
  padding: '10px 16px', background: 'var(--primary)', color: '#fff',
  border: 'none', borderRadius: 8,
}

export default function SalariosPage() {
  const hoje = new Date()
  const [mes, setMes] = useState(String(hoje.getMonth() + 1))
  const [ano, setAno] = useState(String(hoje.getFullYear()))
  const [msg, setMsg] = useState('')
  const [erro, setErro] = useState('')

  async function processar(e: React.FormEvent) {
    e.preventDefault()
    setErro(''); setMsg('')
    try {
      const r = await rhAPI.processarMensal(Number(mes), Number(ano))
      setMsg(`Processados ${r.processados} funcionarios para ${r.mes}/${r.ano}.`)
    } catch (err) { setErro((err as Error).message) }
  }

  return (
    <>
      <PageHeader title="Processamento de salarios" />
      {erro && <p style={{ color: 'var(--danger)' }}>{erro}</p>}
      {msg && <p style={{ color: 'var(--success)' }}>{msg}</p>}

      <section style={card}>
        <form onSubmit={processar}>
          <label>Mes</label>
          <input style={input} value={mes} onChange={(e) => setMes(e.target.value)} />
          <label>Ano</label>
          <input style={input} value={ano} onChange={(e) => setAno(e.target.value)} />
          <button style={btn}>Processar mes</button>
        </form>
        <p style={{ color: 'var(--text-muted)', marginTop: 12 }}>
          Gera processamentos de salario para todos os funcionarios. Se houver
          caixa aberta, regista tambem as saidas correspondentes.
        </p>
      </section>
    </>
  )
}
