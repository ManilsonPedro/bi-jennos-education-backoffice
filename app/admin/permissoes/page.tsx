// app/admin/permissoes/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { permissoesAPI, type Permissao } from '@/lib/api'

const card: React.CSSProperties = {
  background: 'var(--surface)', padding: 24, borderRadius: 12, maxWidth: 'unset',
  boxShadow: 'var(--shadow-sm)', marginBottom: 24,
}

export default function PermissoesPage() {
  const [perms, setPerms] = useState<Permissao[]>([])
  const [erro, setErro] = useState('')

  useEffect(() => {
    permissoesAPI.listar().then(setPerms).catch((e) => setErro(e.message))
  }, [])

  const porModulo = perms.reduce<Record<string, Permissao[]>>((acc, p) => {
    const k = p.modulo ?? 'Outros'
    ;(acc[k] ??= []).push(p)
    return acc
  }, {})

  return (
    <>
      <PageHeader title="Permissoes registadas" />
      {erro && <p style={{ color: 'var(--danger)' }}>{erro}</p>}
      <section style={card}>
        {Object.entries(porModulo).map(([modulo, lista]) => (
          <div key={modulo} style={{ marginBottom: 24 }}>
            <h3>{modulo} ({lista.length})</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr><th align="left">Codigo</th><th align="left">Descricao</th></tr></thead>
              <tbody>
                {lista.map((p) => (
                  <tr key={p.id}>
                    <td><code>{p.codigo}</code></td>
                    <td>{p.descricao}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </section>
    </>
  )
}
