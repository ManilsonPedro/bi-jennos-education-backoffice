'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { alunosAPI } from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { FormField, Input } from '@/components/ui/Field'
import { Alert } from '@/components/ui/Alert'
import { PageHeader } from '@/components/ui/PageHeader'

export default function NovoAlunoPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    nome_completo: '',
    data_nascimento: '',
    bi_numero: '',
    telefone: '',
    email: '',
    enc_nome: '',
    enc_telefone: '',
  })
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  async function submeter(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nome_completo || !form.data_nascimento) {
      setErro('Nome completo e data de nascimento são obrigatórios.')
      return
    }
    setLoading(true)
    setErro('')
    try {
      await alunosAPI.criar(form)
      setSucesso('Aluno criado com sucesso!')
      setTimeout(() => router.push('/admin/alunos'), 1500)
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao criar aluno')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade">
      <PageHeader
        title="Novo Aluno"
        subtitle="Preencha os dados para registar um novo aluno."
        breadcrumb={['Academico', 'Alunos', 'Novo']}
        accent="var(--cat-academico)"
      />
      <Card title="Dados do Aluno" maxWidth={640} accent="var(--cat-academico)">
        {erro && <Alert tone="danger">{erro}</Alert>}
        {sucesso && <Alert tone="success">{sucesso}</Alert>}
        <form onSubmit={submeter} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <FormField label="Nome Completo *">
            <Input value={form.nome_completo} onChange={set('nome_completo')} required placeholder="Ex: João Manuel Silva" />
          </FormField>
          <FormField label="Data de Nascimento *">
            <Input type="date" value={form.data_nascimento} onChange={set('data_nascimento')} required />
          </FormField>
          <FormField label="BI / Documento de Identidade">
            <Input value={form.bi_numero} onChange={set('bi_numero')} placeholder="Ex: 005123456LA042" />
          </FormField>
          <FormField label="Telefone">
            <Input value={form.telefone} onChange={set('telefone')} placeholder="Ex: 9XX XXX XXX" />
          </FormField>
          <FormField label="Email">
            <Input type="email" value={form.email} onChange={set('email')} placeholder="Ex: joao@email.com" />
          </FormField>
          <div style={{ borderTop: '1px solid var(--border)', margin: '8px 0', paddingTop: 8 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12 }}>
              Encarregado de Educação
            </p>
          </div>
          <FormField label="Nome do Encarregado">
            <Input value={form.enc_nome} onChange={set('enc_nome')} placeholder="Ex: Maria Silva" />
          </FormField>
          <FormField label="Telefone do Encarregado">
            <Input value={form.enc_telefone} onChange={set('enc_telefone')} placeholder="Ex: 9XX XXX XXX" />
          </FormField>
          <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
            <Button type="submit" disabled={loading}>
              {loading ? 'A guardar...' : 'Criar Aluno'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push('/admin/alunos')}>
              Cancelar
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
