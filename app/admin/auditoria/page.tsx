// app/admin/auditoria/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { auditoriaAPI, type AuditLog } from '@/lib/api'

const card: React.CSSProperties = {
  background: 'var(--surface)', padding: 24, borderRadius: 12, maxWidth: 'unset',
  boxShadow: 'var(--shadow-sm)', marginBottom: 24,
}
const input: React.CSSProperties = {
  padding: 8, marginRight: 8, border: '1px solid var(--border-strong)', borderRadius: 8,
}
const btn: React.CSSProperties = {
  padding: '8px 14px', background: 'var(--primary)', color: '#fff',
  border: 'none', borderRadius: 8,
}

export default function AuditoriaPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [tabela, setTabela] = useState('')
  const [accao, setAccao] = useState('')
  const [erro, setErro] = useState('')

  async function carregar() {
    try {
      setLogs(await auditoriaAPI.log({
        tabela: tabela || undefined,
        accao: accao || undefined,
        limite: 100,
      }))
    } catch (e) { setErro((e as Error).message) }
  }
  useEffect(() => { carregar() }, [])

  return (
    <>
      <PageHeader title="Auditoria" />
      {erro && <p style={{ color: 'var(--danger)' }}>{erro}</p>}

      <section style={card}>
        <input style={input} placeholder="tabela (ex: alunos)" value={tabela} onChange={(e) => setTabela(e.target.value)} />
        <select style={input} value={accao} onChange={(e) => setAccao(e.target.value)}>
          <option value="">qualquer accao</option>
          <option value="CREATE">CREATE</option>
          <option value="UPDATE">UPDATE</option>
          <option value="DELETE">DELETE</option>
        </select>
        <button style={btn} onClick={carregar}>Filtrar</button>
      </section>

      <section style={card}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              <th align="left">Quando</th>
              <th align="left">Tabela</th>
              <th align="left">Registo</th>
              <th align="left">Accao</th>
              <th align="left">User</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id}>
                <td>{new Date(l.created_at).toLocaleString('pt-PT')}</td>
                <td><code>{l.tabela}</code></td>
                <td style={{ fontFamily: 'monospace', fontSize: 11 }}>{l.registo_id}</td>
                <td><b>{l.accao}</b></td>
                <td style={{ fontFamily: 'monospace', fontSize: 11 }}>{l.user_id ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && <p style={{ color: 'var(--text-muted)' }}>Sem registos.</p>}
      </section>
    </>
  )
}
