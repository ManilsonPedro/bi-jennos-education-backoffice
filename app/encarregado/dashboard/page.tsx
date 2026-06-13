'use client'

import { useEffect, useState } from 'react'
import { fetchAPI } from '@/lib/api'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatCard } from '@/components/ui/StatCard'
import { Card } from '@/components/ui/Card'

interface Educando {
  id: string
  aluno_id: string
  nome_aluno: string
  numero_aluno: string
  grau_parentesco: string | null
}

export default function EncarregadoDashboard() {
  const [educandos, setEducandos] = useState<Educando[]>([])
  const [erro, setErro] = useState('')

  useEffect(() => {
    fetchAPI<Educando[]>('/encarregado/alunos')
      .then(setEducandos)
      .catch((e) => setErro(e instanceof Error ? e.message : 'Erro'))
  }, [])

  return (
    <div>
      <PageHeader title="Portal do Encarregado" subtitle="Acompanhe o percurso dos seus educandos" />
      {erro && <p style={{ color: 'var(--danger)' }}>{erro}</p>}

      <StatCard label="Educandos" value={educandos.length} />

      <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
        {educandos.map((e) => (
          <Card key={e.id}>
            <h3 style={{ marginTop: 0 }}>{e.nome_aluno}</h3>
            <p style={{ margin: '4px 0', fontSize: 13, color: '#666' }}>N.º {e.numero_aluno}</p>
            {e.grau_parentesco && (
              <p style={{ margin: '4px 0', fontSize: 13, color: '#888' }}>{e.grau_parentesco}</p>
            )}
            <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
              {[
                { label: 'Notas', href: `/encarregado/notas?aluno=${e.aluno_id}` },
                { label: 'Frequência', href: `/encarregado/frequencia?aluno=${e.aluno_id}` },
                { label: 'Financeiro', href: `/encarregado/financeiro?aluno=${e.aluno_id}` },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  style={{
                    padding: '6px 14px',
                    background: 'var(--primary)',
                    color: '#fff',
                    borderRadius: 6,
                    fontSize: 13,
                    textDecoration: 'none',
                  }}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
