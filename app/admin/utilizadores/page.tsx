'use client'

import { useEffect, useState } from 'react'
import { fetchAPI } from '@/lib/api'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { FormField, Input, Select } from '@/components/ui/Field'

interface User {
  id: string
  nome_completo: string
  email: string
  role: string
  is_active: boolean
  ultimo_acesso: string | null
}

const ROLES = ['ADMIN', 'SECRETARIA', 'DOCENTE', 'ALUNO', 'ENCARREGADO', 'FINANCEIRO', 'DIRECAO', 'COORDENADOR']

const ROLE_TONE: Record<string, 'accent' | 'info' | 'success' | 'warn' | 'danger' | 'neutral'> = {
  ADMIN: 'accent', DIRECAO: 'accent', COORDENADOR: 'info',
  DOCENTE: 'success', SECRETARIA: 'info', FINANCEIRO: 'warn',
  ALUNO: 'neutral', ENCARREGADO: 'neutral',
}

function iniciais(nome: string) {
  return nome.split(' ').slice(0, 2).map((p) => p[0]).join('').toUpperCase()
}

function formatData(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('pt-AO', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function UtilizadoresPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [msg, setMsg] = useState('')
  const [erro, setErro] = useState('')

  // Modal reset senha
  const [resetUser, setResetUser] = useState<User | null>(null)
  const [resetResult, setResetResult] = useState<{ nova_senha: string; enviado_email: boolean } | null>(null)
  const [resetLoading, setResetLoading] = useState(false)
  const [copiado, setCopiado] = useState(false)

  const carregar = () => {
    setLoading(true)
    const qs = new URLSearchParams()
    if (search) qs.append('search', search)
    if (roleFilter) qs.append('role', roleFilter)
    fetchAPI<User[]>(`/utilizadores?${qs}`)
      .then(setUsers)
      .catch((e) => setErro(e instanceof Error ? e.message : 'Erro ao carregar'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { carregar() }, [search, roleFilter]) // eslint-disable-line react-hooks/exhaustive-deps

  const toggleAtivo = async (u: User) => {
    setErro(''); setMsg('')
    try {
      await fetchAPI(`/utilizadores/${u.id}/toggle-ativo`, { method: 'PATCH' })
      setMsg(`${u.nome_completo} ${u.is_active ? 'desactivado' : 'activado'} com sucesso.`)
      carregar()
    } catch (e) { setErro(e instanceof Error ? e.message : 'Erro') }
  }

  const resetSenha = async () => {
    if (!resetUser) return
    setResetLoading(true)
    setResetResult(null)
    try {
      const res = await fetchAPI<{ nova_senha: string; enviado_email: boolean }>(
        `/utilizadores/${resetUser.id}/reset-senha`, { method: 'POST' }
      )
      setResetResult(res)
    } catch (e) { setErro(e instanceof Error ? e.message : 'Erro ao resetar senha') }
    finally { setResetLoading(false) }
  }

  const copiar = (texto: string) => {
    navigator.clipboard.writeText(texto).then(() => {
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    })
  }

  const fecharModal = () => { setResetUser(null); setResetResult(null); setCopiado(false) }

  const col: React.CSSProperties = { padding: '12px 14px', borderBottom: '1px solid var(--border)', verticalAlign: 'middle', fontSize: 13 }
  const th: React.CSSProperties = { ...col, fontWeight: 700, fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', background: 'var(--surface-2)' }

  return (
    <div className="animate-fade">
      <PageHeader
        title="Utilizadores"
        subtitle="Gestão de contas e permissões"
        breadcrumb={['Admin', 'Utilizadores']}
        accent="var(--primary)"
      />

      {msg && <Alert tone="success">{msg}</Alert>}
      {erro && <Alert tone="danger">{erro}</Alert>}

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <FormField label="Pesquisar">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nome ou email..."
            />
          </FormField>
        </div>
        <div>
          <FormField label="Role">
          <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={{ minWidth: 160 }}>
            <option value="">Todos</option>
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </Select>
          </FormField>
        </div>
        <Button onClick={carregar}>Actualizar</Button>
      </div>

      {/* Tabela */}
      <Card>
        {loading ? (
          <p style={{ color: 'var(--text-muted)', padding: 16 }}>A carregar...</p>
        ) : users.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', padding: 16 }}>Nenhum utilizador encontrado.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={th}>Utilizador</th>
                  <th style={th}>Email</th>
                  <th style={th}>Role</th>
                  <th style={th}>Estado</th>
                  <th style={th}>Último Acesso</th>
                  <th style={{ ...th, textAlign: 'right' }}>Acções</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={{ opacity: u.is_active ? 1 : 0.55 }}>
                    <td style={col}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%',
                          background: 'var(--brand-gradient)', color: '#fff',
                          display: 'grid', placeItems: 'center',
                          fontWeight: 700, fontSize: 13, flexShrink: 0,
                        }}>
                          {iniciais(u.nome_completo)}
                        </div>
                        <span style={{ fontWeight: 600 }}>{u.nome_completo}</span>
                      </div>
                    </td>
                    <td style={{ ...col, color: 'var(--text-muted)' }}>{u.email}</td>
                    <td style={col}>
                      <Badge tone={ROLE_TONE[u.role] ?? 'neutral'}>{u.role}</Badge>
                    </td>
                    <td style={col}>
                      <Badge tone={u.is_active ? 'success' : 'danger'}>
                        {u.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    <td style={{ ...col, color: 'var(--text-muted)' }}>{formatData(u.ultimo_acesso)}</td>
                    <td style={{ ...col, textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => { setResetUser(u); setResetResult(null) }}
                          style={{
                            padding: '6px 12px', borderRadius: 6, border: '1px solid var(--border)',
                            background: 'var(--surface-2)', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                            color: 'var(--primary)',
                          }}
                        >
                          Reset Senha
                        </button>
                        <button
                          onClick={() => toggleAtivo(u)}
                          style={{
                            padding: '6px 12px', borderRadius: 6, border: 'none',
                            background: u.is_active ? 'var(--danger)' : 'var(--success)',
                            cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#fff',
                          }}
                        >
                          {u.is_active ? 'Desactivar' : 'Activar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal Reset Senha */}
      {resetUser && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'grid', placeItems: 'center', zIndex: 200,
        }}>
          <div className="animate-fade" style={{
            background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
            padding: 36, width: '100%', maxWidth: 440,
            boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)',
          }}>
            <h3 style={{ margin: '0 0 6px', color: 'var(--primary)' }}>Reset de Senha</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>
              Gerar nova senha aleatória para <strong>{resetUser.nome_completo}</strong>?
            </p>

            {!resetResult ? (
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button onClick={fecharModal}
                  style={{ padding: '10px 18px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', fontSize: 14 }}>
                  Cancelar
                </button>
                <button onClick={resetSenha} disabled={resetLoading}
                  style={{ padding: '10px 22px', borderRadius: 8, border: 'none', background: 'var(--primary)', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600, opacity: resetLoading ? 0.7 : 1 }}>
                  {resetLoading ? 'A gerar...' : 'Gerar Nova Senha'}
                </button>
              </div>
            ) : (
              <>
                <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: 20, marginBottom: 16, textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Nova Senha Gerada</div>
                  <div style={{ fontFamily: 'monospace', fontSize: 22, fontWeight: 800, letterSpacing: 3, color: 'var(--primary)', marginBottom: 12 }}>
                    {resetResult.nova_senha}
                  </div>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                    <button onClick={() => copiar(resetResult.nova_senha)}
                      style={{ padding: '8px 16px', borderRadius: 7, border: '1px solid var(--border)', background: copiado ? 'var(--success)' : 'var(--surface)', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: copiado ? '#fff' : 'var(--text)', transition: 'all 0.2s' }}>
                      {copiado ? 'Copiado!' : 'Copiar'}
                    </button>
                  </div>
                </div>
                <div style={{ fontSize: 13, color: resetResult.enviado_email ? 'var(--success)' : 'var(--text-muted)', marginBottom: 16, textAlign: 'center' }}>
                  {resetResult.enviado_email
                    ? `Email enviado para ${resetUser.email}`
                    : `Email não enviado (M365 não configurado) — copie a senha manualmente.`}
                </div>
                <button onClick={fecharModal} style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', fontSize: 14 }}>
                  Fechar
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
