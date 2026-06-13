// app/financeiro/relatorio/page.tsx
'use client'

import { useEffect, useState } from 'react'
import {
  academicoAPI, financeiroAPI,
  type AnoAcademico, type RelatorioFinanceiro,
} from '@/lib/api'

const card: React.CSSProperties = {
  background: 'var(--surface)', padding: 24, borderRadius: 12, maxWidth: 640,
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
const linha: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }

export default function RelatorioFinanceiroPage() {
  const [anos, setAnos] = useState<AnoAcademico[]>([])
  const [anoId, setAnoId] = useState('')
  const [relatorio, setRelatorio] = useState<RelatorioFinanceiro | null>(null)
  const [erro, setErro] = useState('')

  useEffect(() => {
    academicoAPI.listarAnos().then(setAnos).catch((e) => setErro(e.message))
  }, [])

  async function carregar() {
    try { setRelatorio(await financeiroAPI.relatorio(anoId)) }
    catch (e) { setErro((e as Error).message) }
  }

  return (
    <>
      <h1>Relatorio financeiro</h1>
      {erro && <p style={{ color: 'var(--danger)' }}>{erro}</p>}

      <section style={card}>
        <label>Ano academico</label>
        <select style={input} value={anoId} onChange={(e) => setAnoId(e.target.value)}>
          <option value="">--</option>
          {anos.map((a) => <option key={a.id} value={a.id}>{a.designacao}</option>)}
        </select>
        <button style={btn} disabled={!anoId} onClick={carregar}>Carregar</button>
      </section>

      {relatorio && (
        <section style={card}>
          <h3>Resultado</h3>
          <div style={linha}><span>Total esperado</span><b>{relatorio.total_esperado}</b></div>
          <div style={linha}><span>Total recebido</span><b>{relatorio.total_recebido}</b></div>
          <div style={linha}><span>Total pendente</span><b>{relatorio.total_pendente}</b></div>
          <div style={linha}><span>Total vencido</span><b>{relatorio.total_vencido}</b></div>
          <div style={{ ...linha, borderBottom: 'none', marginTop: 12 }}>
            <span>Taxa de cobranca</span>
            <b>{(relatorio.taxa_cobranca * 100).toFixed(1)}%</b>
          </div>
        </section>
      )}
    </>
  )
}
