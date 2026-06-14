'use client'

import { useEffect, useState } from 'react'
import { portalAlunoAPI, avaliacoesAPI, financeiroAPI } from '@/lib/api'
import { StatCard } from '@/components/ui/StatCard'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import Link from 'next/link'

const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export default function AlunoDashboard() {
  const [perfil, setPerfil] = useState<Awaited<ReturnType<typeof portalAlunoAPI.perfil>> | null>(null)
  const [horario, setHorario] = useState<Awaited<ReturnType<typeof portalAlunoAPI.horario>>>([])
  const [frequencias, setFrequencias] = useState<Awaited<ReturnType<typeof portalAlunoAPI.frequencias>>>([])
  const [notas, setNotas] = useState<Array<{ id: string; tipo: string; nota: string; nota_maxima: string }>>([])
  const [erro, setErro] = useState('')

  useEffect(() => {
    Promise.all([
      portalAlunoAPI.perfil(),
      portalAlunoAPI.horario(),
      portalAlunoAPI.frequencias(),
      avaliacoesAPI.minhasNotas(),
    ])
      .then(([p, h, f, n]) => {
        setPerfil(p)
        setHorario(h)
        setFrequencias(f)
        setNotas(Array.isArray(n) ? n : [])
      })
      .catch((e) => setErro(e instanceof Error ? e.message : 'Erro ao carregar'))
  }, [])

  const hoje = new Date().getDay()
  const aulasHoje = horario.filter((h) => h.dia_semana === hoje)
  const propinasVencidas = frequencias.filter((f) => f.percentagem_presenca < 75).length
  const mediaNotas = notas.length
    ? (notas.reduce((s, n) => s + Number(n.nota), 0) / notas.length).toFixed(1)
    : '—'

  const quickLinks = [
    { label: 'As minhas Notas',      href: '/aluno/notas',        color: 'var(--cat-academico)' },
    { label: 'Frequência',           href: '/aluno/frequencia',   color: 'var(--primary)' },
    { label: 'Horário',              href: '/aluno/horario',      color: 'var(--cat-rh)' },
    { label: 'Propinas',             href: '/aluno/pagamento',    color: 'var(--cat-financeiro)' },
    { label: 'Solicitações',         href: '/aluno/solicitacoes', color: 'var(--cat-secretaria)' },
    { label: 'Downloads',            href: '/aluno/downloads',    color: 'var(--text-muted)' },
  ]

  return (
    <div className="animate-fade">
      <PageHeader
        title={perfil ? `Bem-vindo, ${perfil.nome_completo.split(' ')[0]}` : 'Dashboard Aluno'}
        subtitle={perfil ? `Nº ${perfil.numero_aluno} · ${perfil.curso ?? ''} · ${perfil.classe ?? ''}` : 'A carregar...'}
        breadcrumb={['Portal Aluno', 'Dashboard']}
        accent="var(--cat-academico)"
      />

      {erro && <Alert tone="danger">{erro}</Alert>}

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
        <StatCard label="Média Actual"         value={mediaNotas}              accent="var(--cat-academico)" />
        <StatCard label="Aulas Hoje"           value={aulasHoje.length}         accent="var(--primary)" />
        <StatCard label="Disciplinas"          value={frequencias.length}       accent="var(--cat-rh)" />
        <StatCard label="Abaixo 75% Presença"  value={propinasVencidas}
          accent={propinasVencidas > 0 ? 'var(--danger)' : 'var(--success)'}
          hint={propinasVencidas > 0 ? 'Risco de reprovação' : 'Presença OK'}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Aulas de Hoje */}
        <Card title="Aulas de Hoje" accent="var(--primary)">
          {aulasHoje.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
              {new Date().getDay() === 0 || new Date().getDay() === 6
                ? 'Fim de semana — sem aulas'
                : 'Sem aulas agendadas para hoje'}
            </p>
          ) : (
            aulasHoje.map((a, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 0', borderBottom: i < aulasHoje.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{a.disciplina}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{a.sala ?? 'Sala n/d'} · {a.docente ?? ''}</div>
                </div>
                <Badge tone="info">{a.hora_inicio.slice(0, 5)}–{a.hora_fim.slice(0, 5)}</Badge>
              </div>
            ))
          )}
        </Card>

        {/* Frequência por disciplina */}
        <Card title="Frequência por Disciplina" accent="var(--cat-academico)">
          {frequencias.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Sem dados de frequência</p>
          ) : (
            frequencias.slice(0, 5).map((f, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: 'var(--text)' }}>{f.disciplina}</span>
                  <span style={{
                    fontWeight: 700,
                    color: f.percentagem_presenca >= 75 ? 'var(--success)' : 'var(--danger)',
                  }}>{f.percentagem_presenca}%</span>
                </div>
                <div style={{ background: 'var(--border)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                  <div style={{
                    width: `${f.percentagem_presenca}%`, height: '100%',
                    background: f.percentagem_presenca >= 75 ? 'var(--success)' : 'var(--danger)',
                    borderRadius: 4,
                  }} />
                </div>
              </div>
            ))
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
