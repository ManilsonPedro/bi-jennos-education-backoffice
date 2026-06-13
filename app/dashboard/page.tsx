// app/dashboard/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { authAPI, type MeDetalhado } from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { PageHeader } from '@/components/ui/PageHeader'

const ROLE_LABEL: Record<string, string> = {
  admin: 'Administrador',
  direcao: 'Direcção',
  secretaria: 'Secretaria',
  docente: 'Professor',
  aluno: 'Estudante',
  encarregado: 'Encarregado de Educação',
  financeiro: 'Financeiro',
}
const ROLE_TONE: Record<string, 'info' | 'success' | 'warn' | 'accent' | 'neutral'> = {
  admin: 'accent', direcao: 'accent',
  docente: 'info', aluno: 'success',
  secretaria: 'warn', financeiro: 'warn',
  encarregado: 'neutral',
}

const ESTUDANTE_ROLES = new Set(['aluno', 'encarregado'])
const DOCENTE_ROLES = new Set(['docente'])
const FUNCIONARIO_ROLES = new Set(['admin', 'direcao', 'secretaria', 'financeiro'])

const labelStyle: React.CSSProperties = {
  fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em',
  color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4,
}
const valueStyle: React.CSSProperties = {
  fontSize: 16, fontWeight: 600, color: 'var(--text)',
}

function InfoRow({ label, value }: { label: string; value: string | React.ReactNode }) {
  return (
    <div style={{
      padding: '14px 0',
      borderBottom: '1px solid var(--border)',
      display: 'grid',
      gridTemplateColumns: '160px 1fr',
      gap: 16,
      alignItems: 'center',
    }}>
      <div style={labelStyle}>{label}</div>
      <div style={valueStyle}>{value}</div>
    </div>
  )
}

export default function DashboardPage() {
  const [me, setMe] = useState<MeDetalhado | null>(null)
  const [erro, setErro] = useState('')

  useEffect(() => {
    authAPI.meDetalhado()
      .then(setMe)
      .catch((e) => setErro((e as Error).message))
  }, [])

  if (erro) return <Alert tone="danger">{erro}</Alert>
  if (!me) return <p style={{ color: 'var(--text-muted)' }}>A carregar...</p>

  const roleLabel = ROLE_LABEL[me.role] ?? me.role
  const isEstudante = ESTUDANTE_ROLES.has(me.role)
  const isDocente = DOCENTE_ROLES.has(me.role)
  const isFuncionario = FUNCIONARIO_ROLES.has(me.role)
  const accent = isEstudante ? 'var(--cat-estudante)'
    : isDocente ? 'var(--cat-academico)'
    : isFuncionario ? 'var(--cat-administrativo)'
    : 'var(--primary)'

  return (
    <div className="animate-fade">
      <PageHeader
        title={`Bem-vindo, ${me.nome_completo.split(' ')[0]}`}
        subtitle="Aqui estão os teus dados essenciais."
        breadcrumb={['Bi Jennos Investiment', 'Início']}
        accent={accent}
      />

      {/* Cartão de identidade — comum a todos */}
      <Card
        title="Identidade"
        subtitle={isEstudante ? 'Dados do estudante'
          : isDocente ? 'Dados do professor'
          : 'Dados do funcionário'}
        accent={accent}
        maxWidth={720}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 8 }}>
          {/* Avatar com iniciais */}
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'var(--brand-gradient)',
            color: '#fff', display: 'grid', placeItems: 'center',
            fontWeight: 800, fontSize: 22,
            boxShadow: 'var(--shadow-md)',
          }}>
            {me.nome_completo.split(' ').slice(0, 2).map((p) => p[0]).join('').toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{me.nome_completo}</div>
            <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Badge tone={ROLE_TONE[me.role] ?? 'neutral'}>{roleLabel}</Badge>
              {me.numero_aluno && (
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  Nº <code>{me.numero_aluno}</code>
                </span>
              )}
            </div>
          </div>
        </div>

        <InfoRow label="Nome completo" value={me.nome_completo} />
        <InfoRow label="Email" value={<a href={`mailto:${me.email}`}>{me.email}</a>} />
        <InfoRow label="Função" value={roleLabel} />

        {/* Estudante: + curso, classe, ano academico */}
        {isEstudante && (
          <>
            <InfoRow
              label="Curso"
              value={me.curso ?? <em style={{ color: 'var(--text-muted)' }}>Sem matrícula activa</em>}
            />
            {me.classe && <InfoRow label="Classe" value={me.classe} />}
            {me.ano_academico && <InfoRow label="Ano académico" value={me.ano_academico} />}
          </>
        )}
      </Card>

      {/* Docente: disciplinas */}
      {isDocente && (
        <Card
          title="Disciplinas que lecciona"
          subtitle={me.disciplinas && me.disciplinas.length > 0
            ? `${me.disciplinas.length} disciplina(s) atribuída(s)`
            : 'Sem disciplinas atribuídas'}
          accent="var(--cat-academico)"
          maxWidth={720}
        >
          {me.disciplinas && me.disciplinas.length > 0 ? (
            <table>
              <thead>
                <tr><th>Disciplina</th><th>Turma</th></tr>
              </thead>
              <tbody>
                {me.disciplinas.map((d) => (
                  <tr key={d.id}>
                    <td style={{ fontWeight: 600 }}>{d.nome}</td>
                    <td>{d.turma_nome ?? <em style={{ color: 'var(--text-muted)' }}>—</em>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>
              Ainda não há disciplinas associadas à tua conta.
            </p>
          )}
        </Card>
      )}
    </div>
  )
}
