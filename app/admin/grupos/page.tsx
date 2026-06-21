// app/admin/grupos/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { gruposAPI, permissoesAPI, type Grupo, type Permissao } from '@/lib/api'

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

export default function GruposPage() {
  const [grupos, setGrupos] = useState<Grupo[]>([])
  const [perms, setPerms] = useState<Permissao[]>([])
  const [nome, setNome] = useState('')
  const [seleccao, setSeleccao] = useState<Record<string, Set<string>>>({})
  const [erro, setErro] = useState('')

  async function carregar() {
    try {
      setGrupos(await gruposAPI.listar())
      setPerms(await permissoesAPI.listar())
    } catch (e) { setErro((e as Error).message) }
  }
  useEffect(() => { carregar() }, [])

  function toggle(grupoId: string, codigo: string) {
    setSeleccao((s) => {
      const set = new Set(s[grupoId] ?? [])
      set.has(codigo) ? set.delete(codigo) : set.add(codigo)
      return { ...s, [grupoId]: set }
    })
  }
  async function criar() {
    try { await gruposAPI.criar(nome); setNome(''); await carregar() }
    catch (e) { setErro((e as Error).message) }
  }
  async function aplicar(grupoId: string) {
    try {
      await gruposAPI.definirPermissoes(grupoId, Array.from(seleccao[grupoId] ?? []))
      alert('Permissoes actualizadas.')
    } catch (e) { setErro((e as Error).message) }
  }

  return (
    <>
      <PageHeader title="Grupos & Permissoes" />
      {erro && <p style={{ color: 'var(--danger)' }}>{erro}</p>}

      <section style={card}>
        <h3>Novo grupo</h3>
        <input style={input} placeholder="Nome do grupo" value={nome} onChange={(e) => setNome(e.target.value)} />
        <button style={btn} disabled={!nome} onClick={criar}>Criar</button>
      </section>

      {grupos.map((g) => (
        <section key={g.id} style={card}>
          <h3>{g.nome}</h3>
          <p style={{ color: 'var(--text-muted)' }}>{g.descricao}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 4 }}>
            {perms.map((p) => (
              <label key={p.id} style={{ display: 'flex', gap: 6, fontSize: 13 }}>
                <input
                  type="checkbox"
                  checked={seleccao[g.id]?.has(p.codigo) ?? false}
                  onChange={() => toggle(g.id, p.codigo)}
                />
                <span><code>{p.codigo}</code> — {p.descricao}</span>
              </label>
            ))}
          </div>
          <div style={{ marginTop: 12 }}>
            <button style={btn} onClick={() => aplicar(g.id)}>Aplicar permissoes</button>
          </div>
        </section>
      ))}
    </>
  )
}
