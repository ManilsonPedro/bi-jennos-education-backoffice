'use client'

import { useEffect, useState } from 'react'
import { fetchAPI } from '@/lib/api'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'

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

  useEffect(() => {
    fetchAPI<Perfil>('/aluno/perfil')
      .then(setPerfil)
      .catch((e) => setErro(e instanceof Error ? e.message : 'Erro ao carregar perfil'))
  }, [])

  if (erro) return <p style={{ color: 'var(--danger)' }}>{erro}</p>
  if (!perfil) return <p>A carregar...</p>

  return (
    <div>
      <PageHeader title="O Meu Perfil" subtitle={perfil.numero_aluno} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard label="Curso" value={perfil.curso ?? '—'} />
        <StatCard label="Classe" value={perfil.classe ?? '—'} />
        <StatCard label="Ano Lectivo" value={perfil.ano_academico ?? '—'} />
      </div>

      <Card>
        <h3 style={{ marginTop: 0 }}>Dados Pessoais</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {[
              ['Nome Completo', perfil.nome_completo],
              ['Data de Nascimento', perfil.data_nascimento],
              ['BI', perfil.bi_numero ?? '—'],
              ['Email', perfil.email ?? '—'],
              ['Telefone', perfil.telefone ?? '—'],
            ].map(([label, value]) => (
              <tr key={label} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: '10px 0', fontWeight: 600, color: '#666', width: 200 }}>{label}</td>
                <td style={{ padding: '10px 0' }}>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {(perfil.enc_nome || perfil.enc_telefone) && (
          <>
            <h3>Encarregado de Educação</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {[
                  ['Nome', perfil.enc_nome ?? '—'],
                  ['Telefone', perfil.enc_telefone ?? '—'],
                ].map(([label, value]) => (
                  <tr key={label} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '10px 0', fontWeight: 600, color: '#666', width: 200 }}>{label}</td>
                    <td style={{ padding: '10px 0' }}>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </Card>
    </div>
  )
}
