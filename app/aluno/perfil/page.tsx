'use client'

import { useEffect, useState } from 'react'
import { fetchAPI } from '@/lib/api'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'
import { Button } from '@/components/ui/Button'
import { FormField, Input } from '@/components/ui/Field'
import { Alert } from '@/components/ui/Alert'

interface Perfil {
  id: string
  numero_aluno: string
  nome_completo: string
  data_nascimento: string
  email: string | null
  telefone: string | null
  bi_numero: string | null
  enc_nome: string | null
  enc_telefone: string | null
  curso: string | null
  classe: string | null
  ano_academico: string | null
}

export default function PerfilPage() {
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [erro, setErro] = useState('')

  // Alterar senha
  const [senhaActual, setSenhaActual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [senhaLoading, setSenhaLoading] = useState(false)
  const [senhaMsg, setSenhaMsg] = useState('')
  const [senhaErro, setSenhaErro] = useState('')

  useEffect(() => {
    fetchAPI<Perfil>('/aluno/perfil')
      .then(setPerfil)
      .catch((e) => setErro(e instanceof Error ? e.message : 'Erro ao carregar perfil'))
  }, [])

  async function onAlterarSenha(e: React.FormEvent) {
    e.preventDefault()
    setSenhaErro('')
    setSenhaMsg('')
    if (novaSenha.length < 8) { setSenhaErro('A nova senha deve ter no mínimo 8 caracteres.'); return }
    if (novaSenha !== confirmar) { setSenhaErro('As senhas não coincidem.'); return }
    setSenhaLoading(true)
    try {
      await fetchAPI('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ senha_actual: senhaActual, nova_senha: novaSenha }),
      })
      setSenhaMsg('Senha alterada com sucesso!')
      setSenhaActual(''); setNovaSenha(''); setConfirmar('')
    } catch (err) {
      setSenhaErro(err instanceof Error ? err.message : 'Erro ao alterar senha.')
    } finally {
      setSenhaLoading(false)
    }
  }

  if (erro) return <p style={{ color: 'var(--danger)' }}>{erro}</p>
  if (!perfil) return <p>A carregar...</p>

  return (
    <div>
      <PageHeader
        title="O Meu Perfil"
        subtitle={perfil.numero_aluno}
        breadcrumb={['Portal Aluno', 'Perfil']}
        accent="var(--cat-estudante)"
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard label="Curso" value={perfil.curso ?? '—'} />
        <StatCard label="Classe" value={perfil.classe ?? '—'} />
        <StatCard label="Ano Lectivo" value={perfil.ano_academico ?? '—'} />
      </div>

      <Card title="Dados Pessoais" style={{ marginBottom: 24 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {[
              ['Nome Completo', perfil.nome_completo],
              ['Data de Nascimento', perfil.data_nascimento],
              ['BI', perfil.bi_numero ?? '—'],
              ['Email', perfil.email ?? '—'],
              ['Telefone', perfil.telefone ?? '—'],
            ].map(([label, value]) => (
              <tr key={label} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '10px 0', fontWeight: 600, color: 'var(--text-muted)', width: 200, fontSize: 14 }}>{label}</td>
                <td style={{ padding: '10px 0', fontSize: 14 }}>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {(perfil.enc_nome || perfil.enc_telefone) && (
          <>
            <h4 style={{ marginTop: 20, marginBottom: 10 }}>Encarregado de Educação</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {[
                  ['Nome', perfil.enc_nome ?? '—'],
                  ['Telefone', perfil.enc_telefone ?? '—'],
                ].map(([label, value]) => (
                  <tr key={label} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 0', fontWeight: 600, color: 'var(--text-muted)', width: 200, fontSize: 14 }}>{label}</td>
                    <td style={{ padding: '10px 0', fontSize: 14 }}>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </Card>

      {/* Alterar senha */}
      <Card title="Alterar Palavra-passe" subtitle="Defina uma nova senha de acesso" maxWidth={480}>
        {senhaMsg && <Alert tone="success">{senhaMsg}</Alert>}
        {senhaErro && <Alert tone="danger">{senhaErro}</Alert>}

        <form onSubmit={onAlterarSenha} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <FormField label="Senha actual">
            <Input
              type="password"
              value={senhaActual}
              onChange={(e) => setSenhaActual(e.target.value)}
              placeholder="••••••••"
              required
            />
          </FormField>
          <FormField label="Nova senha">
            <Input
              type="password"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              required
            />
          </FormField>
          <FormField label="Confirmar nova senha">
            <Input
              type="password"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              placeholder="Repita a nova senha"
              required
            />
          </FormField>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="submit" disabled={senhaLoading}>
              {senhaLoading ? 'A guardar...' : 'Guardar nova senha'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
