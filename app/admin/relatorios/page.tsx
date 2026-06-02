// app/(admin)/relatorios/page.tsx
'use client'

import { useEffect, useState } from 'react'
import {
  academicoAPI,
  financeiroAPI,
  type AnoAcademico,
  type RelatorioFinanceiro,
} from '@/lib/api'

const card: React.CSSProperties = {
  background: '#fff',
  padding: 24,
  borderRadius: 12,
  maxWidth: 520,
  boxShadow: '0 1px 6px rgba(0,0,0,.06)',
}
const input: React.CSSProperties = {
  display: 'block',
  width: 320,
  padding: 10,
  margin: '6px 0 16px',
  border: '1px solid #ddd',
  borderRadius: 8,
}

export default function RelatoriosPage() {
  const [anos, setAnos] = useState<AnoAcademico[]>([])
  const [rel, setRel] = useState<RelatorioFinanceiro | null>(null)
  const [erro, setErro] = useState('')

  useEffect(() => {
    academicoAPI.listarAnos().then(setAnos).catch(() => setAnos([]))
  }, [])

  async function carregar(id: string) {
    setErro('')
    setRel(null)
    if (!id) return
    try {
      setRel(await financeiroAPI.relatorio(id))
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro')
    }
  }

  return (
    <div>
      <h1 style={{ color: 'var(--primary)' }}>Relatorios financeiros</h1>
      <label htmlFor="ano">Ano academico</label>
      <select
        id="ano"
        aria-label="Ano academico"
        style={input}
        onChange={(e) => carregar(e.target.value)}
        defaultValue=""
      >
        <option value="">— selecionar —</option>
        {anos.map((a) => (
          <option key={a.id} value={a.id}>
            {a.designacao}
          </option>
        ))}
      </select>

      {erro && <p style={{ color: '#c0392b' }}>{erro}</p>}

      {rel && (
        <div style={card}>
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
