'use client'

import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { fetchAPI } from '@/lib/api'

interface Matricula {
  id: string
  numero_matricula: string
  estado: string
  tipo: string
  data_matricula: string
  aluno_id: string
  ano_academico_id: string
}

const card: React.CSSProperties = {
  background: 'var(--surface)', borderRadius: 12,
  boxShadow: 'var(--shadow-sm)', overflow: 'hidden',
}
const th: React.CSSProperties = {
  padding: '10px 14px', textAlign: 'left', fontSize: 12,
  fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase',
  borderBottom: '1px solid var(--border)',
}
const td: React.CSSProperties = {
  padding: '10px 14px', fontSize: 13,
  borderBottom: '1px solid var(--border)',
}
const badge = (estado: string): React.CSSProperties => ({
  display: 'inline-block', padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
  background: estado === 'activa' ? '#d4edda' : estado === 'pendente' ? '#fff3cd' : '#f8d7da',
  color: estado === 'activa' ? '#155724' : estado === 'pendente' ? '#856404' : '#721c24',
})

export default function MatriculasAdminPage() {
  const [dados, setDados] = useState<Matricula[]>([])
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAPI<Matricula[]>('/matriculas')
      .then(setDados)
      .catch(e => setErro(e instanceof Error ? e.message : 'Erro'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <PageHeader title="Matrículas" />
      {erro && <p style={{ color: 'var(--danger)', marginBottom: 16 }}>{erro}</p>}
      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>A carregar...</p>
      ) : (
        <div style={card}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={th}>N.º Matrícula</th>
                <th style={th}>Tipo</th>
                <th style={th}>Estado</th>
                <th style={th}>Data</th>
              </tr>
            </thead>
            <tbody>
              {dados.length === 0 ? (
                <tr><td colSpan={4} style={{ ...td, textAlign: 'center', color: 'var(--text-muted)' }}>Sem matrículas</td></tr>
              ) : dados.map(m => (
                <tr key={m.id}>
                  <td style={td}><b>{m.numero_matricula}</b></td>
                  <td style={td}>{m.tipo}</td>
                  <td style={td}><span style={badge(m.estado)}>{m.estado}</span></td>
                  <td style={td}>{m.data_matricula}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
