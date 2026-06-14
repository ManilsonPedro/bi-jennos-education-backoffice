'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { encarregadoAPI } from '@/lib/api'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'

interface Educando {
  id: string
  aluno_id: string
  nome_aluno: string
  numero_aluno: string
  grau_parentesco: string | null
}

const GRAUS = ['Pai', 'Mae', 'Tio/Tia', 'Avo/Avo', 'Tutor Legal', 'Outro']

export default function MeusEducandosPage() {
  const router = useRouter()
  const [educandos, setEducandos] = useState<Educando[]>([])
  const [erro, setErro] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [loading, setLoading] = useState(true)

  const [mostrarForm, setMostrarForm] = useState(false)
  const [alunoId, setAlunoId] = useState('')
  const [grau, setGrau] = useState('Pai')
  const [a_submeter, setASubmeter] = useState(false)

  const carregar = () => {
    setLoading(true)
    encarregadoAPI.alunos()
      .then(setEducandos)
      .catch((e) => setErro(e instanceof Error ? e.message : 'Erro ao carregar educandos'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { carregar() }, [])

  const associar = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')
    setMensagem('')
    setASubmeter(true)
    try {
      await encarregadoAPI.associar(alunoId.trim(), grau)
      setMensagem('Educando associado com sucesso.')
      setMostrarForm(false)
      setAlunoId('')
      carregar()
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao associar educando')
    } finally {
      setASubmeter(false)
    }
  }

  const iniciais = (nome: string) =>
    nome.split(' ').slice(0, 2).map((p) => p[0]).join('').toUpperCase()

  return (
    <div className="animate-fade">
      <PageHeader
        title="Os Meus Educandos"
        subtitle="Educandos associados ao seu perfil de encarregado"
        breadcrumb={['Portal Encarregado', 'Educandos']}
        accent="var(--cat-estudante)"
      />

      {mensagem && <Alert tone="success">{mensagem}</Alert>}
      {erro && <Alert tone="danger">{erro}</Alert>}

      {/* Lista de educandos */}
      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>A carregar...</p>
      ) : educandos.length === 0 ? (
        <Card title="Sem educandos" subtitle="Ainda nao tem nenhum educando associado.">
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            Use o botao abaixo para associar o numero de matricula do seu educando.
          </p>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginBottom: 24 }}>
          {educandos.map((ed) => (
            <div key={ed.id} style={{
              background: 'var(--surface)',
              borderRadius: 12,
              padding: 20,
              boxShadow: 'var(--shadow-sm)',
              border: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: '50%',
                  background: 'var(--brand-gradient)',
                  color: '#fff', display: 'grid', placeItems: 'center',
                  fontWeight: 800, fontSize: 18, flexShrink: 0,
                }}>
                  {iniciais(ed.nome_aluno)}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{ed.nome_aluno}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    Nº <code style={{ fontSize: 12 }}>{ed.numero_aluno}</code>
                  </div>
                </div>
              </div>

              {ed.grau_parentesco && (
                <Badge tone="info">{ed.grau_parentesco}</Badge>
              )}

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                <button
                  onClick={() => router.push(`/encarregado/notas?aluno=${ed.aluno_id}`)}
                  style={{
                    flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)',
                    background: 'var(--surface-raised)', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                    color: 'var(--text)',
                  }}
                >
                  Notas
                </button>
                <button
                  onClick={() => router.push(`/encarregado/financeiro?aluno=${ed.aluno_id}`)}
                  style={{
                    flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)',
                    background: 'var(--surface-raised)', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                    color: 'var(--text)',
                  }}
                >
                  Financeiro
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Botao para adicionar */}
      {!mostrarForm && (
        <Button onClick={() => setMostrarForm(true)}>
          + Associar Educando
        </Button>
      )}

      {/* Formulario de associacao */}
      {mostrarForm && (
        <Card title="Associar Educando" subtitle="Indique o numero de matricula do seu educando" maxWidth={480}>
          <form onSubmit={associar} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                Numero de Matricula do Aluno
              </label>
              <input
                value={alunoId}
                onChange={(e) => setAlunoId(e.target.value)}
                placeholder="ex: ALU-2025-00042"
                required
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: 8,
                  border: '1px solid var(--border-strong)', fontSize: 14,
                  background: 'var(--input-bg)', color: 'var(--text)',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                Grau de Parentesco
              </label>
              <select
                value={grau}
                onChange={(e) => setGrau(e.target.value)}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: 8,
                  border: '1px solid var(--border-strong)', fontSize: 14,
                  background: 'var(--input-bg)', color: 'var(--text)',
                }}
              >
                {GRAUS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => { setMostrarForm(false); setErro('') }}
                style={{
                  padding: '10px 18px', borderRadius: 8, border: '1px solid var(--border)',
                  background: 'transparent', cursor: 'pointer', fontSize: 14,
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={a_submeter}
                style={{
                  padding: '10px 22px', borderRadius: 8, border: 'none',
                  background: 'var(--primary)', color: '#fff', cursor: 'pointer',
                  fontSize: 14, fontWeight: 600, opacity: a_submeter ? 0.7 : 1,
                }}
              >
                {a_submeter ? 'A associar...' : 'Associar'}
              </button>
            </div>
          </form>
        </Card>
      )}
    </div>
  )
}
