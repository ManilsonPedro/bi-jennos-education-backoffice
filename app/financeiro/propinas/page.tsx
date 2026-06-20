// app/(financeiro)/propinas/page.tsx
'use client'

import { useEffect, useState } from 'react'
import {
  academicoAPI,
  financeiroAPI,
  type AnoAcademico,
  type RelatorioFinanceiro,
} from '@/lib/api'
import { PageHeader } from '@/components/ui/PageHeader'

const card: React.CSSProperties = {
  background: 'var(--surface)',
  padding: 24,
  borderRadius: 12,
  maxWidth: 520,
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
  padding: '10px 16px',
  background: 'var(--primary)',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
}

export default function PropinasPage() {
  const [anos, setAnos] = useState<AnoAcademico[]>([])
  const [anoId, setAnoId] = useState('')
  const [mes, setMes] = useState('1')
  const [ano, setAno] = useState('2026')
  const [valor, setValor] = useState('')
  const [venc, setVenc] = useState('')
  const [rel, setRel] = useState<RelatorioFinanceiro | null>(null)
  const [msg, setMsg] = useState<{ ok: boolean; texto: string } | null>(null)

  useEffect(() => {
    academicoAPI.listarAnos().then(setAnos).catch(() => setAnos([]))
  }, [])

  async function carregarRelatorio(id: string) {
    if (!id) return
    try {
      setRel(await financeiroAPI.relatorio(id))
    } catch {
      setRel(null)
    }
  }

  async function gerar(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)
    try {
      const r = await financeiroAPI.gerarMensal({
        ano_academico_id: anoId,
        mes: Number(mes),
        ano: Number(ano),
        valor,
        data_vencimento: venc,
      })
      setMsg({ ok: true, texto: `${r.criadas} propinas geradas para ${r.mes}/${r.ano}` })
      carregarRelatorio(anoId)
    } catch (err) {
      setMsg({ ok: false, texto: err instanceof Error ? err.message : 'Erro' })
    }
  }

  return (
    <div>
      <PageHeader title="Propinas" subtitle="Gestão de mensalidades e cobranças" />

      <form onSubmit={gerar} style={card}>
        <h3 style={{ marginTop: 0 }}>Gerar propinas mensais</h3>
        <label htmlFor="ano-acad">Ano academico</label>
        <select id="ano-acad" aria-label="Ano academico" style={input} value={anoId}
          onChange={(e) => { setAnoId(e.target.value); carregarRelatorio(e.target.value) }} required>
          <option value="">— selecionar —</option>
          {anos.map((a) => (
            <option key={a.id} value={a.id}>{a.designacao}</option>
          ))}
        </select>

        <label htmlFor="mes">Mes</label>
        <input id="mes" aria-label="Mes" type="number" min="1" max="12" style={input}
          value={mes} onChange={(e) => setMes(e.target.value)} required />

        <label htmlFor="ano-civil">Ano</label>
        <input id="ano-civil" aria-label="Ano" type="number" style={input}
          value={ano} onChange={(e) => setAno(e.target.value)} required />

        <label htmlFor="valor">Valor (Kz)</label>
        <input id="valor" aria-label="Valor" type="number" step="0.01" style={input}
          value={valor} onChange={(e) => setValor(e.target.value)} required />

        <label htmlFor="venc">Data de vencimento</label>
        <input id="venc" aria-label="Data de vencimento" type="date" style={input}
          value={venc} onChange={(e) => setVenc(e.target.value)} required />

        <button type="submit" style={btn}>Gerar</button>
      </form>

      {msg && <p style={{ color: msg.ok ? '#27ae60' : '#c0392b' }}>{msg.texto}</p>}

      {rel && (
        <div style={card}>
          <h3 style={{ marginTop: 0 }}>Relatorio financeiro</h3>
          <p>Total esperado: <b>{rel.total_esperado}</b></p>
          <p>Total recebido: <b>{rel.total_recebido}</b></p>
          <p>Total pendente: <b>{rel.total_pendente}</b></p>
          <p>Total vencido: <b>{rel.total_vencido}</b></p>
          <p>Taxa de cobranca: <b>{rel.taxa_cobranca}%</b></p>
        </div>
      )}
    </div>
  )
}
