'use client'

import { useEffect, useState } from 'react'
import { inscricoesAPI, solicitacoesAPI, authAPI, type Inscricao } from '@/lib/api'
import { StatCard } from '@/components/ui/StatCard'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import Link from 'next/link'

export default function SecretariaDashboard() {
  const [nome, setNome] = useState('')
  const [inscricoesPendentes, setInscricoesPendentes] = useState<number>(0)
  const [solicitacoesAbertas, setSolicitacoesAbertas] = useState<number>(0)
  const [solicitacoes, setSolicitacoes] = useState<Array<{ id: string; numero_solicitacao: string; tipo: string; estado: string; created_at: string }>>([])
  const [inscricoes, setInscricoes] = useState<Inscricao[]>([])
  const [erro, setErro] = useState('')

  useEffect(() => {
    authAPI.me().then((u) => setNome(u.nome_completo)).catch(() => {})
    Promise.all([
      inscricoesAPI.listar('PENDENTE'),
      solicitacoesAPI.listar('PENDENTE'),
    ])
      .then(([ins, sol]) => {
        setInscricoes(Array.isArray(ins) ? ins : [])
        setInscricoesPendentes(Array.isArray(ins) ? ins.length : 0)
        setSolicitacoes(Array.isArray(sol) ? sol : [])
        setSolicitacoesAbertas(Array.isArray(sol) ? sol.length : 0)
      })
      .catch((e) => setErro(e instanceof Error ? e.message : 'Erro ao carregar'))
  }, [])

  const quickLinks = [
    { label: 'Matrículas',       href: '/secretaria/matriculas',       color: 'var(--primary)' },
    { label: 'Inscrições',       href: '/secretaria/inscricoes',       color: 'var(--cat-academico)' },
    { label: 'Pré-Inscrições',   href: '/secretaria/pre-inscricoes',   color: 'var(--cat-rh)' },
    { label: 'Solicitações',     href: '/secretaria/solicitacoes',     color: 'var(--cat-secretaria)' },
    { label: 'Certificados',     href: '/admin/certificados',          color: 'var(--cat-financeiro)' },
    { label: 'Calendário',       href: '/admin/calendario',            color: 'var(--text-muted)' },
  ]

  const TIPO_LABELS: Record<string, string> = {
    DECLARACAO: 'Declaração', CERTIFICADO: 'Certificado',
    HISTORICO: 'Histórico', BOLETIM: 'Boletim',
  }

  return (
    <div className="animate-fade">
      <PageHeader
        title={nome ? `Secretaria — ${nome.split(' ')[0]}` : 'Dashboard Secretaria'}
        subtitle="Gestão de matrículas, inscrições e documentos"
        breadcrumb={['Secretaria', 'Dashboard']}
        accent="var(--cat-secretaria, var(--primary))"
      />

      {erro && <Alert tone="danger">{erro}</Alert>}

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
        <StatCard label="Inscrições Pendentes"
          value={inscricoesPendentes}
          accent={inscricoesPendentes > 0 ? 'var(--warning)' : 'var(--success)'}
          hint={inscricoesPendentes > 0 ? 'Aguardam aprovação' : 'Nenhuma pendente'}
        />
        <StatCard label="Solicitações Abertas"
          value={solicitacoesAbertas}
          accent={solicitacoesAbertas > 0 ? 'var(--warning)' : 'var(--success)'}
          hint={solicitacoesAbertas > 0 ? 'Aguardam resposta' : 'Tudo respondido'}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Inscrições recentes */}
        <Card title="Inscrições Pendentes" accent="var(--primary)">
          {inscricoes.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Nenhuma inscrição pendente</p>
          ) : (
            inscricoes.slice(0, 5).map((ins, i) => (
              <div key={ins.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 0', borderBottom: i < Math.min(inscricoes.length, 5) - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <div style={{ fontSize: 13, color: 'var(--text)' }}>Inscrição #{ins.id.slice(0, 8)}</div>
                <Badge tone="warn">{ins.estado}</Badge>
              </div>
            ))
          )}
          {inscricoes.length > 5 && (
            <Link href="/secretaria/inscricoes" style={{ display: 'block', marginTop: 10, fontSize: 12, color: 'var(--primary)' }}>
              Ver todas ({inscricoes.length})
            </Link>
          )}
        </Card>

        {/* Solicitações recentes */}
        <Card title="Solicitações Abertas" accent="var(--cat-secretaria, var(--primary))">
          {solicitacoes.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Nenhuma solicitação pendente</p>
          ) : (
            solicitacoes.slice(0, 5).map((s, i) => (
              <div key={s.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 0', borderBottom: i < Math.min(solicitacoes.length, 5) - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{TIPO_LABELS[s.tipo] ?? s.tipo}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>#{s.numero_solicitacao}</div>
                </div>
                <Badge tone="warn">{s.estado}</Badge>
              </div>
            ))
          )}
          {solicitacoes.length > 5 && (
            <Link href="/secretaria/solicitacoes" style={{ display: 'block', marginTop: 10, fontSize: 12, color: 'var(--primary)' }}>
              Ver todas ({solicitacoes.length})
            </Link>
          )}
        </Card>
      </div>

      {/* Acesso Rápido */}
      <div style={{ marginTop: 24 }}>
        <div style={{
          fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
          color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', paddingBottom: 8, marginBottom: 14,
        }}>Acesso Rápido</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
          {quickLinks.map((l) => (
            <Link key={l.href} href={l.href} style={{
              display: 'block', padding: '12px 16px',
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderLeft: `4px solid ${l.color}`,
              borderRadius: 'var(--radius)', fontSize: 13, fontWeight: 600,
              color: 'var(--text)', textDecoration: 'none',
            }}>{l.label}</Link>
          ))}
        </div>
      </div>
    </div>
  )
}
