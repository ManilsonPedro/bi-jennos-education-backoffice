'use client'

import { useEffect, useState } from 'react'
import { fetchAPI } from '@/lib/api'
import { PageHeader } from '@/components/ui/PageHeader'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Alert } from '@/components/ui/Alert'
import { Card } from '@/components/ui/Card'

interface CursoOnline {
  id: string
  titulo: string
  descricao: string | null
  is_publicado: boolean
}

const COLUMNS: Column<CursoOnline>[] = [
  { key: 'titulo', label: 'Título' },
  { key: 'descricao', label: 'Descrição', render: (r) => r.descricao ?? '—' },
  {
    key: 'is_publicado',
    label: 'Estado',
    render: (r) => <Badge tone={r.is_publicado ? 'success' : 'warning'}>{r.is_publicado ? 'PUBLICADO' : 'RASCUNHO'}</Badge>,
  },
]

export default function LMSPage() {
  const [cursos, setCursos] = useState<CursoOnline[]>([])
  const [mostrarNovo, setMostrarNovo] = useState(false)
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState('')

  const carregar = () => {
    fetchAPI<CursoOnline[]>('/lms/cursos').then(setCursos).catch((e) => setErro(e instanceof Error ? e.message : 'Erro'))
  }

  useEffect(() => { carregar() }, [])

  const criar = async () => {
    try {
      await fetchAPI('/lms/cursos', { method: 'POST', body: JSON.stringify({ titulo, descricao: descricao || null }) })
      setMensagem('Curso criado!'); setMostrarNovo(false); setTitulo(''); setDescricao(''); carregar()
    } catch (e) { setErro(e instanceof Error ? e.message : 'Erro') }
  }

  const publicar = async (id: string) => {
    try {
      await fetchAPI(`/lms/cursos/${id}/publicar`, { method: 'POST' })
      setMensagem('Curso publicado!'); carregar()
    } catch (e) { setErro(e instanceof Error ? e.message : 'Erro') }
  }

  const colsComAccao: Column<CursoOnline>[] = [
    ...COLUMNS,
    {
      key: 'id',
      label: 'Acção',
      render: (r) => !r.is_publicado ? <Button label="Publicar" onClick={() => publicar(r.id)} /> : null,
    },
  ]

  return (
    <div>
      <PageHeader title="LMS — Cursos Online" subtitle="Gestão de conteúdos de ensino online" />

      {mensagem && <Alert type="success" message={mensagem} onClose={() => setMensagem('')} />}
      {erro && <Alert type="error" message={erro} onClose={() => setErro('')} />}

      <div style={{ marginBottom: 20 }}>
        <Button label="Novo Curso" onClick={() => setMostrarNovo(!mostrarNovo)} />
      </div>

      {mostrarNovo && (
        <Card>
          <h3 style={{ marginTop: 0 }}>Novo Curso Online</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 400 }}>
            <input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Título do curso"
              style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd' }}
            />
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descrição..."
              rows={3}
              style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd' }}
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <Button label="Criar" onClick={criar} />
              <Button label="Cancelar" onClick={() => setMostrarNovo(false)} />
            </div>
          </div>
        </Card>
      )}

      <DataTable columns={colsComAccao} rows={cursos} emptyMessage="Sem cursos online criados." />
    </div>
  )
}
