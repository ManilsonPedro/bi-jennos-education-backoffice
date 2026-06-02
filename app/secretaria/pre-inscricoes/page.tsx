// app/secretaria/pre-inscricoes/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { publicAPI, type PreInscricao } from '@/lib/api'

const ESTADOS = ['nova', 'contactada', 'convertida', 'descartada']

const th: React.CSSProperties = {
  textAlign: 'left',
  padding: '12px 16px',
  background: 'var(--primary)',
  color: '#fff',
  fontSize: 14,
}
const td: React.CSSProperties = {
  padding: '10px 16px',
  borderBottom: '1px solid #f0f0f0',
  fontSize: 14,
}

export default function PreInscricoesPage() {
  const [leads, setLeads] = useState<PreInscricao[]>([])
  const [erro, setErro] = useState('')

  function carregar() {
    publicAPI
      .listarPreInscricoes()
      .then(setLeads)
      .catch((e) => setErro(e instanceof Error ? e.message : 'Erro'))
  }

  useEffect(carregar, [])

  async function mudarEstado(id: string, estado: string) {
    setErro('')
    try {
      await publicAPI.actualizarEstado(id, estado)
      carregar()
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro')
    }
  }

  return (
    <div>
      <h1 style={{ color: 'var(--primary)' }}>Pedidos de inscricao (leads)</h1>
      {erro && <p style={{ color: '#c0392b' }}>{erro}</p>}
      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
        <thead>
          <tr>
            <th style={th}>Nome</th>
            <th style={th}>Telefone</th>
            <th style={th}>Curso</th>
            <th style={th}>Estado</th>
          </tr>
        </thead>
        <tbody>
          {leads.length === 0 ? (
            <tr>
              <td style={{ ...td, textAlign: 'center', color: '#888' }} colSpan={4}>
                Sem pedidos.
              </td>
            </tr>
          ) : (
            leads.map((l) => (
              <tr key={l.id}>
                <td style={td}>{l.nome_completo}</td>
                <td style={td}>{l.telefone}</td>
                <td style={td}>{l.curso_interesse ?? '—'}</td>
                <td style={td}>
                  <select
                    aria-label={`Estado de ${l.nome_completo}`}
                    value={l.estado}
                    onChange={(e) => mudarEstado(l.id, e.target.value)}
                    style={{ padding: 6, borderRadius: 6, border: '1px solid #ddd' }}
                  >
                    {ESTADOS.map((e) => (
                      <option key={e} value={e}>
                        {e}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
