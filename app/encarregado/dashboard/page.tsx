'use client'

import { useEffect, useState } from 'react'
import { encarregadoAPI, authAPI } from '@/lib/api'
import { StatCard } from '@/components/ui/StatCard'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import Link from 'next/link'
import { kz } from '@/lib/fmt'

type Aluno = { id: string; aluno_id: string; nome_aluno: string; numero_aluno: string; grau_parentesco: string | null }
type Propina = { id: string; mes: number; ano: number; valor: string; estado: string }

const MESES = ['', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

export default function EncarregadoDashboard() {
  const [nome, setNome] = useState('')
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [propinasMap, setPropinasMap] = useState<Record<string, Propina[]>>({})
  const [selectedAluno, setSelectedAluno] = useState<string | null>(null)
  const [erro, setErro] = useState('')

  useEffect(() => {
    authAPI.me().then((u) => setNome(u.nome_completo)).catch(() => {})
    encarregadoAPI.alunos()
      .then(async (lista) => {
        setAlunos(lista)
        if (lista.length > 0) setSelectedAluno(lista[0].aluno_id)
        const map: Record<string, Propina[]> = {}
        await Promise.all(lista.map(async (a) => {
          try {
            const p = await encarregadoAPI.financeiro(a.aluno_id)
            map[a.aluno_id] = Array.isArray(p) ? p : []
          } catch { map[a.aluno_id] = [] }
        }))
        setPropinasMap(map)
      })
      .catch((e) => setErro(e instanceof Error ? e.message : 'Erro ao carregar'))
  }, [])

  const propinasAtrasadas = Object.values(propinasMap)
    .flat()
    .filter((p) => p.estado === 'VENCIDO' || p.estado === 'PENDENTE').length

  const propinasSel = selectedAluno ? (propinasMap[selectedAluno] ?? []) : []

  return (
    <div className="animate-fade">
      <PageHeader
        title={nome ? `Bem-vindo, ${nome.split(' ')[0]}` : 'Portal Encarregado'}
        subtitle="Acompanhe os seus educandos"
        breadcrumb={['Encarregado', 'Dashboard']}
        accent="var(--primary)"
      />

      {erro && <Alert tone="danger">{erro}</Alert>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
        <StatCard label="Educandos"          value={alunos.length}      accent="var(--cat-academico)" />
        <StatCard label="Propinas em Atraso" value={propinasAtrasadas}
          accent={propinasAtrasadas > 0 ? 'var(--danger)' : 'var(--success)'}
          hint={propinasAtrasadas > 0 ? 'Pagamento necessário' : 'Tudo em dia'}
        />
      </div>

      {alunos.length > 1 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {alunos.map((a) => (
            <button
              key={a.aluno_id}
              onClick={() => setSelectedAluno(a.aluno_id)}
              style={{
                padding: '8px 16px', borderRadius: 'var(--radius)',
                border: `2px solid ${selectedAluno === a.aluno_id ? 'var(--primary)' : 'var(--border)'}`,
                background: selectedAluno === a.aluno_id ? 'var(--primary)' : 'var(--surface)',
                color: selectedAluno === a.aluno_id ? '#fff' : 'var(--text)',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}
            >
              {a.nome_aluno}
            </button>
          ))}
        </div>
      )}

      {alunos.filter((a) => a.aluno_id === selectedAluno).map((aluno) => (
        <div key={aluno.aluno_id}>
          <div style={{
            padding: '14px 18px', marginBottom: 20,
            background: 'var(--surface-2)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', display: 'flex', gap: 16, alignItems: 'center',
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: 'var(--primary)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, fontWeight: 700, flexShrink: 0,
            }}>
              {aluno.nome_aluno.charAt(0)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{aluno.nome_aluno}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Nº {aluno.numero_aluno} · {aluno.grau_parentesco ?? 'Encarregado'}
              </div>
            </div>
            <Link href="/encarregado/notas" style={{
              padding: '8px 14px', background: 'var(--primary)', color: '#fff',
              borderRadius: 'var(--radius)', fontSize: 12, fontWeight: 600, textDecoration: 'none',
            }}>Ver Notas</Link>
          </div>

          <Card title="Situação de Propinas" accent="var(--cat-financeiro)">
            {propinasSel.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Sem propinas registadas</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 10 }}>
                {propinasSel.slice(0, 12).map((p) => (
                  <div key={p.id} style={{
                    padding: '10px 12px', borderRadius: 'var(--radius)', textAlign: 'center',
                    border: `1px solid ${p.estado === 'PAGO' ? 'var(--success)' : p.estado === 'VENCIDO' ? 'var(--danger)' : 'var(--border)'}`,
                    background: p.estado === 'PAGO' ? 'rgba(34,197,94,0.06)' : p.estado === 'VENCIDO' ? 'rgba(220,38,38,0.06)' : 'var(--surface-2)',
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>{MESES[p.mes]}/{p.ano}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', margin: '4px 0' }}>{kz(p.valor)}</div>
                    <Badge tone={p.estado === 'PAGO' ? 'success' : p.estado === 'VENCIDO' ? 'danger' : 'warn'}>
                      {p.estado === 'PAGO' ? 'Pago' : p.estado === 'VENCIDO' ? 'Vencido' : 'Pendente'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      ))}

      <div style={{ marginTop: 24 }}>
        <div style={{
          fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
          color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', paddingBottom: 8, marginBottom: 14,
        }}>Acesso Rápido</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
          {[
            { label: 'Notas',       href: '/encarregado/notas',      color: 'var(--cat-academico)' },
            { label: 'Financeiro',  href: '/encarregado/financeiro',  color: 'var(--cat-financeiro)' },
          ].map((l) => (
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
