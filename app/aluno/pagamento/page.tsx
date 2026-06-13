'use client'

import { useEffect, useState } from 'react'
import { fetchAPI, multasAPI } from '@/lib/api'
import { PageHeader } from '@/components/ui/PageHeader'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Alert } from '@/components/ui/Alert'
import { Card } from '@/components/ui/Card'

interface Propina {
  id: string
  mes: number
  ano: number
  valor: string
  valor_pago: string
  estado: string
  data_vencimento: string
}

interface Gateway { id: string; nome: string; tipo: string }

interface ResultadoPagamento {
  transacao_id: string
  referencia: string
  valor: string
  gateway: string
  estado: string
  instrucoes: {
    metodo: string
    passos: string[]
    referencia: string
  }
}

const MESES = ['', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
const ESTADO_CORES: Record<string, string> = { pendente: '#f59e0b', pago: '#22c55e', vencido: '#ef4444' }

export default function PagamentoPage() {
  const [gateways, setGateways] = useState<Gateway[]>([])
  const [propinas, setPropinas] = useState<Propina[]>([])
  const [propinaId, setPropinaId] = useState('')
  const [gatewayTipo, setGatewayTipo] = useState('')
  const [resultado, setResultado] = useState<ResultadoPagamento | null>(null)
  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState('')

  useEffect(() => {
    fetchAPI<Gateway[]>('/pagamentos/gateways').then(setGateways).catch(() => {})
    // Carregar propinas do aluno logado via /aluno/perfil + propinas
    fetchAPI<Propina[]>('/financeiro/minhas-propinas').catch(() => {})
  }, [])

  const iniciarPagamento = async () => {
    if (!propinaId || !gatewayTipo) return
    try {
      const res = await fetchAPI<ResultadoPagamento>('/pagamentos/iniciar', {
        method: 'POST',
        body: JSON.stringify({ propina_id: propinaId, gateway_tipo: gatewayTipo }),
      })
      setResultado(res)
      setMensagem('Referência gerada com sucesso!')
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao iniciar pagamento')
    }
  }

  return (
    <div>
      <PageHeader title="Pagamento Online" subtitle="Pague as suas propinas de forma segura" />

      {mensagem && <Alert tone="success">{mensagem}</Alert>}
      {erro && <Alert tone="danger">{erro}</Alert>}

      {resultado ? (
        <Card>
          <h3 style={{ marginTop: 0, color: 'var(--primary)' }}>Referência de Pagamento</h3>
          <div style={{ background: '#f0fdf4', padding: 16, borderRadius: 8, marginBottom: 16, border: '1px solid #86efac' }}>
            <div style={{ fontSize: 13, color: '#166534', marginBottom: 4 }}>Método: {resultado.instrucoes.metodo}</div>
            <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: 4, color: '#166534' }}>
              {resultado.instrucoes.referencia}
            </div>
            <div style={{ fontSize: 14, color: '#166534', marginTop: 4 }}>Valor: Kz {resultado.valor}</div>
          </div>
          <h4>Instruções:</h4>
          <ol>
            {resultado.instrucoes.passos.map((p, i) => (
              <li key={i} style={{ marginBottom: 6, fontSize: 14 }}>{p}</li>
            ))}
          </ol>
          <Button onClick={() => setResultado(null)}>Novo Pagamento</Button>
        </Card>
      ) : (
        <Card>
          <h3 style={{ marginTop: 0 }}>Iniciar Pagamento</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 400 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Propina</label>
              <input
                placeholder="ID da Propina"
                value={propinaId}
                onChange={(e) => setPropinaId(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Método de Pagamento</label>
              <select
                value={gatewayTipo}
                onChange={(e) => setGatewayTipo(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd' }}
              >
                <option value="">Seleccione...</option>
                {gateways.map((g) => <option key={g.id} value={g.tipo}>{g.nome}</option>)}
                {gateways.length === 0 && (
                  <>
                    <option value="multicaixa_express">Multicaixa Express</option>
                    <option value="emis">EMIS / ATM</option>
                    <option value="unitel_money">Unitel Money</option>
                  </>
                )}
              </select>
            </div>
            <Button onClick={iniciarPagamento} >Gerar Referência</Button>
          </div>
        </Card>
      )}
    </div>
  )
}
