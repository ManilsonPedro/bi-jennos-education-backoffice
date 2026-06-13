// app/financeiro/caixa/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { tesourariaAPI, type RelatorioCaixa } from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { FormField, Input, Select } from '@/components/ui/Field'
import { StatCard } from '@/components/ui/StatCard'
import { PageHeader } from '@/components/ui/PageHeader'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'

export default function CaixaPage() {
  const [aberta, setAberta] = useState<boolean | null>(null)
  const [saldoAbertura, setSaldoAbertura] = useState('0')
  const [tipo, setTipo] = useState('entrada')
  const [categoria, setCategoria] = useState('propina')
  const [valor, setValor] = useState('')
  const [descricao, setDescricao] = useState('')
  const [relatorio, setRelatorio] = useState<RelatorioCaixa | null>(null)
  const [erro, setErro] = useState('')

  async function carregar() {
    try {
      setErro('')
      const h = await tesourariaAPI.hoje()
      setAberta(h.aberta)
      if (h.aberta) setRelatorio(await tesourariaAPI.relatorioDiario())
    } catch (e) { setErro((e as Error).message) }
  }
  useEffect(() => { carregar() }, [])

  async function abrir() {
    try { await tesourariaAPI.abrir(saldoAbertura); await carregar() }
    catch (e) { setErro((e as Error).message) }
  }
  async function fechar() {
    try { await tesourariaAPI.fechar(); await carregar() }
    catch (e) { setErro((e as Error).message) }
  }
  async function lancar(e: React.FormEvent) {
    e.preventDefault()
    try {
      await tesourariaAPI.movimento({ tipo, categoria, valor, descricao })
      setValor(''); setDescricao(''); await carregar()
    } catch (err) { setErro((err as Error).message) }
  }

  return (
    <div className="animate-fade">
      <PageHeader
        title="Caixa diária"
        subtitle="Abertura, lançamentos e fecho do caixa do dia"
        breadcrumb={['Financeiro', 'Tesouraria', 'Caixa diária']}
        accent="var(--cat-financeiro)"
        actions={
          aberta && relatorio
            ? <Button variant="outline" onClick={fechar}>Fechar caixa</Button>
            : undefined
        }
      />

      {erro && <Alert tone="danger">{erro}</Alert>}

      {/* Abrir caixa */}
      {aberta === false && (
        <Card title="Abrir caixa" subtitle="Indica o saldo inicial em mão" maxWidth={520} accent="var(--cat-financeiro)">
          <FormField label="Saldo de abertura (AOA)">
            <Input value={saldoAbertura} onChange={(e) => setSaldoAbertura(e.target.value)} />
          </FormField>
          <Button variant="accent" onClick={abrir}>Abrir caixa</Button>
        </Card>
      )}

      {/* Caixa aberta */}
      {aberta && relatorio && (
        <>
          {/* Estado do caixa */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Badge estado={relatorio.estado} />
            <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>
              {relatorio.data}
            </span>
          </div>

          {/* KPIs */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16, marginBottom: 24,
          }}>
            <StatCard
              label="Saldo de abertura"
              value={relatorio.saldo_abertura}
              accent="var(--text-muted)"
            />
            <StatCard
              label="Entradas"
              value={relatorio.total_entradas}
              accent="var(--success)"
            />
            <StatCard
              label="Saídas"
              value={relatorio.total_saidas}
              accent="var(--danger)"
            />
            <StatCard
              label="Saldo actual"
              value={relatorio.saldo_actual}
              accent="var(--cat-financeiro)"
              hint="Disponível em caixa agora"
            />
          </div>

          {/* Novo movimento */}
          <Card
            title="Novo movimento"
            subtitle="Regista uma entrada ou saída de dinheiro"
            maxWidth={640}
          >
            <form onSubmit={lancar}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <FormField label="Tipo">
                  <Select value={tipo} onChange={(e) => setTipo(e.target.value)}>
                    <option value="entrada">Entrada</option>
                    <option value="saida">Saída</option>
                  </Select>
                </FormField>
                <FormField label="Categoria">
                  <Input value={categoria} onChange={(e) => setCategoria(e.target.value)} />
                </FormField>
              </div>
              <FormField label="Valor (AOA)">
                <Input value={valor} onChange={(e) => setValor(e.target.value)} required />
              </FormField>
              <FormField label="Descrição">
                <Input value={descricao} onChange={(e) => setDescricao(e.target.value)} />
              </FormField>
              <Button type="submit" variant="primary">Registar movimento</Button>
            </form>
          </Card>
        </>
      )}
    </div>
  )
}
