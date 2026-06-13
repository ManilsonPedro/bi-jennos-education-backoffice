// app/admin/modulos/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { modulosAdminAPI, uiAPI, type ModuloTree } from '@/lib/api'

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

export default function ModulosUIPage() {
  const [tree, setTree] = useState<ModuloTree[]>([])
  const [erro, setErro] = useState('')
  const [novoMod, setNovoMod] = useState({ nome: '', icone: '', ordem: '0' })
  const [novoMenu, setNovoMenu] = useState({ modulo_id: '', nome: '', icone: '', ordem: '0' })
  const [novaPag, setNovaPag] = useState({
    menu_id: '', nome: '', rota: '', icone: '', permissao_codigo: '', ordem: '0',
  })

  async function carregar() {
    try { setTree(await uiAPI.menus()) }
    catch (e) { setErro((e as Error).message) }
  }
  useEffect(() => { carregar() }, [])

  async function criarMod() {
    try {
      await modulosAdminAPI.criarModulo({
        nome: novoMod.nome, icone: novoMod.icone || undefined, ordem: Number(novoMod.ordem),
      })
      setNovoMod({ nome: '', icone: '', ordem: '0' })
      await carregar()
    } catch (e) { setErro((e as Error).message) }
  }
  async function criarMenu() {
    try {
      await modulosAdminAPI.criarMenu({
        modulo_id: novoMenu.modulo_id, nome: novoMenu.nome,
        icone: novoMenu.icone || undefined, ordem: Number(novoMenu.ordem),
      })
      setNovoMenu({ modulo_id: '', nome: '', icone: '', ordem: '0' })
      await carregar()
    } catch (e) { setErro((e as Error).message) }
  }
  async function criarPag() {
    try {
      await modulosAdminAPI.criarPagina({
        menu_id: novaPag.menu_id, nome: novaPag.nome, rota: novaPag.rota,
        icone: novaPag.icone || undefined,
        permissao_codigo: novaPag.permissao_codigo || undefined,
        ordem: Number(novaPag.ordem),
      })
      setNovaPag({ menu_id: '', nome: '', rota: '', icone: '', permissao_codigo: '', ordem: '0' })
      await carregar()
    } catch (e) { setErro((e as Error).message) }
  }

  // Lista plana de todos os menus para os selects
  const todosMenus = tree.flatMap((m) => m.menus.map((mn) => ({ ...mn, modulo: m.nome })))

  return (
    <>
      <h1>Modulos / Menus / Paginas (UI dinamica)</h1>
      {erro && <p style={{ color: 'var(--danger)' }}>{erro}</p>}

      <section style={card}>
        <h3>+ Modulo</h3>
        <input style={input} placeholder="Nome" value={novoMod.nome} onChange={(e) => setNovoMod({ ...novoMod, nome: e.target.value })} />
        <input style={input} placeholder="Icone (lucide)" value={novoMod.icone} onChange={(e) => setNovoMod({ ...novoMod, icone: e.target.value })} />
        <input style={input} placeholder="Ordem" value={novoMod.ordem} onChange={(e) => setNovoMod({ ...novoMod, ordem: e.target.value })} />
        <button style={btn} onClick={criarMod}>Criar modulo</button>
      </section>

      <section style={card}>
        <h3>+ Menu</h3>
        <select style={input} value={novoMenu.modulo_id} onChange={(e) => setNovoMenu({ ...novoMenu, modulo_id: e.target.value })}>
          <option value="">-- modulo --</option>
          {tree.map((m) => <option key={m.id} value={m.id}>{m.nome}</option>)}
        </select>
        <input style={input} placeholder="Nome" value={novoMenu.nome} onChange={(e) => setNovoMenu({ ...novoMenu, nome: e.target.value })} />
        <input style={input} placeholder="Icone" value={novoMenu.icone} onChange={(e) => setNovoMenu({ ...novoMenu, icone: e.target.value })} />
        <input style={input} placeholder="Ordem" value={novoMenu.ordem} onChange={(e) => setNovoMenu({ ...novoMenu, ordem: e.target.value })} />
        <button style={btn} onClick={criarMenu}>Criar menu</button>
      </section>

      <section style={card}>
        <h3>+ Pagina</h3>
        <select style={input} value={novaPag.menu_id} onChange={(e) => setNovaPag({ ...novaPag, menu_id: e.target.value })}>
          <option value="">-- menu --</option>
          {todosMenus.map((m) => <option key={m.id} value={m.id}>{m.modulo} / {m.nome}</option>)}
        </select>
        <input style={input} placeholder="Nome" value={novaPag.nome} onChange={(e) => setNovaPag({ ...novaPag, nome: e.target.value })} />
        <input style={input} placeholder="Rota (ex: /admin/foo)" value={novaPag.rota} onChange={(e) => setNovaPag({ ...novaPag, rota: e.target.value })} />
        <input style={input} placeholder="Codigo de permissao (opcional)" value={novaPag.permissao_codigo} onChange={(e) => setNovaPag({ ...novaPag, permissao_codigo: e.target.value })} />
        <input style={input} placeholder="Ordem" value={novaPag.ordem} onChange={(e) => setNovaPag({ ...novaPag, ordem: e.target.value })} />
        <button style={btn} onClick={criarPag}>Criar pagina</button>
      </section>

      <section style={{ ...card, maxWidth: 'unset' }}>
        <h3>Arvore actual</h3>
        {tree.map((mod) => (
          <div key={mod.id} style={{ marginBottom: 12 }}>
            <b>{mod.nome}</b>
            <ul>
              {mod.menus.map((menu) => (
                <li key={menu.id}>
                  {menu.nome}
                  <ul>
                    {menu.paginas.map((p) => (
                      <li key={p.id}>{p.nome} — <code>{p.rota}</code></li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </>
  )
}
