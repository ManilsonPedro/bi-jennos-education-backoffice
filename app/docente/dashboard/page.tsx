'use client'

import { useEffect, useState } from 'react'
import { docenteAPI, authAPI } from '@/lib/api'
import { StatCard } from '@/components/ui/StatCard'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import Link from 'next/link'

const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export default function DocenteDashboard() {
  const [nome, setNome] = useState('')
  const [turmas, setTurmas] = useState<Awaited<ReturnType<typeof docenteAPI.minhasTurmas>>>([])
  const [erro, setErro] = useState('')

  useEffect(() => {
    authAPI.me().then((u) => setNome(u.nome_completo)).catch(() => {})
    docenteAPI.minhasTurmas()
      .then(setTurmas)
      .catch((e) => setErro(e instanceof Error ? e.message : 'Erro ao carregar'))
  }, [])

  const totalDisciplinas = turmas.reduce((s, t) => s + (t.disciplinas?.length ?? 0), 0)
  const hoje = DIAS[new Date().getDay()]

  const quickLinks = [
    { label: 'Lançar Notas',    href: '/docente/avaliacoes',  color: 'var(--cat-academico)' },
    { label: 'Frequência',      href: '/docente/frequencia',  color: 'var(--primary)' },
    { label: 'Diário de Aula',  href: '/docente/diario',      color: 'var(--cat-rh)' },
    { label: 'Plano de Aula',   href: '/docente/plano-aula',  color: 'var(--cat-secretaria)' },
    { label: 'Conteúdos',       href: '/docente/conteudos',   color: 'var(--text-muted)' },
    { label: 'Minhas Turmas',   href: '/docente/turmas',      color: 'var(--cat-financeiro)' },
  ]

  return (
    <div className="animate-fade">
      <PageHeader
        title={nome ? `Bem-vindo, ${nome.split(' ').slice(0, 2).join(' ')}` : 'Dashboard Docente'}
        subtitle={`${hoje} — Área do Professor`}
        breadcrumb={['Portal Docente', 'Dashboard']}
        accent="var(--cat-rh)"
      />

      {erro && <Alert tone="danger">{erro}</Alert>}

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
        <StatCard label="Turmas Atribuídas"   value={turmas.length}        accent="var(--cat-rh)" />
        <StatCard label="Disciplinas"          value={totalDisciplinas}      accent="var(--cat-academico)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Turmas e Disciplinas */}
        <Card title="As Minhas Turmas" accent="var(--cat-rh)">
          {turmas.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Sem turmas atribuídas</p>
          ) : (
            turmas.map((t, i) => (
              <div key={i} style={{
                padding: '10px 0',
                borderBottom: i < turmas.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Turma {i + 1}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {(t.disciplinas ?? []).map((d) => (
                    <Badge key={d.id} tone="info">{d.nome}</Badge>
                  ))}
                </div>
              </div>
            ))
          )}
        </Card>

        {/* Tarefas pendentes */}
        <Card title="Tarefas Pendentes" accent="var(--cat-academico)">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Lançar notas do trimestre',  href: '/docente/avaliacoes', urgent: true },
              { label: 'Registar sumários em atraso', href: '/docente/diario',     urgent: false },
              { label: 'Actualizar frequências',      href: '/docente/frequencia', urgent: false },
            ].map((t, i) => (
              <Link key={i} href={t.href} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 14px',
                background: t.urgent ? 'rgba(var(--danger-rgb, 220,38,38), 0.06)' : 'var(--surface-2)',
                border: `1px solid ${t.urgent ? 'var(--danger)' : 'var(--border)'}`,
                borderRadius: 'var(--radius)', fontSize: 13, fontWeight: 500,
                color: 'var(--text)', textDecoration: 'none',
              }}>
                <span>{t.label}</span>
                {t.urgent && <Badge tone="danger">Urgente</Badge>}
              </Link>
            ))}
          </div>
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
