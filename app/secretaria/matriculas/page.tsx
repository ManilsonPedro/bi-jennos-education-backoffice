// app/secretaria/matriculas/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { academicoAPI, matriculasAPI, turmasAPI, type AnoAcademico, type Turma } from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { FormField, Input, Select } from '@/components/ui/Field'
import { Alert } from '@/components/ui/Alert'
import { PageHeader } from '@/components/ui/PageHeader'

export default function MatriculasPage() {
  const [anos, setAnos] = useState<AnoAcademico[]>([])
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [alunoId, setAlunoId] = useState('')
  const [anoId, setAnoId] = useState('')
  const [turmaId, setTurmaId] = useState('')
  const [tipo, setTipo] = useState('nova')
  const [msg, setMsg] = useState<{ ok: boolean; texto: string } | null>(null)

  useEffect(() => {
    academicoAPI.listarAnos().then(setAnos).catch(() => setAnos([]))
  }, [])

  useEffect(() => {
    if (anoId) turmasAPI.listar(anoId).then(setTurmas).catch(() => setTurmas([]))
  }, [anoId])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)
    try {
      const m = (await matriculasAPI.criar({
        aluno_id: alunoId,
        turma_id: turmaId,
        ano_academico_id: anoId,
        tipo,
      })) as { numero_matricula: string }
      setMsg({ ok: true, texto: `Matrícula criada: ${m.numero_matricula}` })
      setAlunoId('')
    } catch (err) {
      setMsg({ ok: false, texto: err instanceof Error ? err.message : 'Erro' })
    }
  }

  return (
    <div className="animate-fade">
      <PageHeader
        title="Nova matrícula"
        subtitle="Cria, rematricula ou transfere um aluno"
        breadcrumb={['Secretaria', 'Matrículas']}
        accent="var(--cat-secretaria)"
      />

      {msg && <Alert tone={msg.ok ? 'success' : 'danger'}>{msg.texto}</Alert>}

      <Card accent="var(--cat-secretaria)" maxWidth={560}>
        <form onSubmit={onSubmit}>
          <FormField label="ID do aluno">
            <Input
              value={alunoId}
              onChange={(e) => setAlunoId(e.target.value)}
              placeholder="UUID do aluno"
              required
            />
          </FormField>

          <FormField label="Ano académico">
            <Select value={anoId} onChange={(e) => setAnoId(e.target.value)} required>
              <option value="">— selecionar —</option>
              {anos.map((a) => (
                <option key={a.id} value={a.id}>{a.designacao}</option>
              ))}
            </Select>
          </FormField>

          <FormField label="Turma">
            <Select value={turmaId} onChange={(e) => setTurmaId(e.target.value)} required>
              <option value="">— selecionar —</option>
              {turmas.map((t) => (
                <option key={t.id} value={t.id}>{t.nome}</option>
              ))}
            </Select>
          </FormField>

          <FormField label="Tipo">
            <Select value={tipo} onChange={(e) => setTipo(e.target.value)}>
              <option value="nova">Nova</option>
              <option value="rematricula">Rematrícula</option>
              <option value="transferencia">Transferência</option>
            </Select>
          </FormField>

          <Button type="submit" variant="primary">Criar matrícula</Button>
        </form>
      </Card>
    </div>
  )
}
