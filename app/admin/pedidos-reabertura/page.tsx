'use client'

import { useEffect, useState } from 'react'
import { pedidosReaberturaAPI, type PedidoReabertura } from '@/lib/api'
import { PageHeader } from '@/components/ui/PageHeader'
import { Badge } from '@/components/ui/Badge'

const TIPO_LABEL: Record<string, string> = {
  trimestre: 'Trimestre',
  ano_academico: 'Ano Academico',
  pauta: 'Pauta',
}

const ESTADO_COLOR: Record<string, string> = {
  pendente: '#e67e22',
  aprovado: '#27ae60',
  rejeitado: '#e74c3c',
}

const s = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 } as React.CSSProperties,
  modal: { background: 'var(--surface)', borderRadius: 14, padding: 28, width: 480, boxShadow: '0 8px 32px rgba(0,0,0,.25)' } as React.CSSProperties,
  input: { display: 'block', width: '100%', padding: 10, margin: '4px 0 12px', border: '1px solid var(--border-strong)', borderRadius: 8, boxSizing: 'border-box' as const } as React.CSSProperties,
}
const btn = (bg = 'var(--primary)', color = '#fff', extra?: React.CSSProperties): React.CSSProperties => ({
  padding: '7px 14px', background: bg, color, border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, ...extra,
})

export default function PedidosReaberturaPage() {
  const [lista, setLista] = useState<PedidoReabertura[]>([])
  const [filtroEstado, setFiltroEstado] = useState('pendente')
  const [erro, setErro] = useState('')
  const [msg, setMsg] = useState('')
  const [saving, setSaving] = useState(false)

  const [modalAprovar, setModalAprovar] = useState<PedidoReabertura | null>(null)
  const [modalRejeitar, setModalRejeitar] = useState<PedidoReabertura | null>(null)
  const [motivoDecisao, setMotivoDecisao] = useState('')

  async function carregar() {
    try {
      setErro('')
      setLista(await pedidosReaberturaAPI.listar(filtroEstado || undefined))
    } catch (e) { setErro((e as Error).message) }
  }

  useEffect(() => { carregar() }, [filtroEstado])

  async function aprovar() {
    if (!modalAprovar) return
    setSaving(true); setErro(''); setMsg('')
    try {
      await pedidosReaberturaAPI.aprovar(modalAprovar.id, motivoDecisao || undefined)
      setMsg(`Pedido aprovado — ${TIPO_LABEL[modalAprovar.tipo]} reaberto.`)
      setModalAprovar(null); setMotivoDecisao('')
      await carregar()
    } catch (e) { setErro((e as Error).message) }
    finally { setSaving(false) }
  }

  async function rejeitar() {
    if (!modalRejeitar) return
    if (!motivoDecisao.trim()) { setErro('Motivo de rejeicao obrigatorio.'); return }
    setSaving(true); setErro(''); setMsg('')
    try {
      await pedidosReaberturaAPI.rejeitar(modalRejeitar.id, motivoDecisao)
      setMsg('Pedido rejeitado.')
      setModalRejeitar(null); setMotivoDecisao('')
      await carregar()
    } catch (e) { setErro((e as Error).message) }
    finally { setSaving(false) }
  }

  function abrirAprovar(p: PedidoReabertura) {
    setMotivoDecisao(''); setModalAprovar(p)
  }
  function abrirRejeitar(p: PedidoReabertura) {
    setMotivoDecisao(''); setModalRejeitar(p)
  }

  const pendentes = lista.filter(p => p.estado === 'pendente').length

  return (
    <div>
      <PageHeader
        title="Pedidos de Reabertura"
        actions={
          pendentes > 0 ? (
            <Badge tone="danger">{pendentes} pendente{pendentes !== 1 ? 's' : ''}</Badge>
          ) : undefined
        }
      />

      {erro && <p style={{ color: 'var(--danger)', marginBottom: 12 }}>{erro}</p>}
      {msg && <p style={{ color: '#27ae60', marginBottom: 12 }}>{msg}</p>}

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {['pendente', 'aprovado', 'rejeitado', ''].map(e => (
          <button key={e} style={btn(filtroEstado === e ? 'var(--primary)' : '#eee', filtroEstado === e ? '#fff' : '#444')} onClick={() => setFiltroEstado(e)}>
            {e === '' ? 'Todos' : e.charAt(0).toUpperCase() + e.slice(1)}
          </button>
        ))}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--surface)', borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          <thead>
            <tr style={{ background: 'var(--primary)', color: '#fff' }}>
              <th align="left" style={{ padding: '12px 14px' }}>Tipo</th>
              <th align="left" style={{ padding: '12px 14px' }}>Referencia ID</th>
              <th align="left" style={{ padding: '12px 14px' }}>Motivo</th>
              <th align="left" style={{ padding: '12px 14px' }}>Estado</th>
              <th align="left" style={{ padding: '12px 14px' }}>Data</th>
              <th style={{ padding: '12px 14px' }}>Acoes</th>
            </tr>
          </thead>
          <tbody>
            {lista.length === 0 && (
              <tr><td colSpan={6} style={{ padding: 24, textAlign: 'center', color: '#888' }}>
                {filtroEstado === 'pendente' ? 'Nenhum pedido pendente.' : 'Sem pedidos.'}
              </td></tr>
            )}
            {lista.map(p => (
              <tr key={p.id} style={{ borderTop: '1px solid var(--border)' }}>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ background: '#eee', borderRadius: 20, padding: '2px 10px', fontSize: 12 }}>{TIPO_LABEL[p.tipo] ?? p.tipo}</span>
                </td>
                <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontSize: 12, color: '#666' }}>{p.referencia_id.slice(0, 8)}…</td>
                <td style={{ padding: '10px 14px', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.motivo}>{p.motivo}</td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ background: ESTADO_COLOR[p.estado] + '22', color: ESTADO_COLOR[p.estado], borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 600 }}>
                    {p.estado}
                  </span>
                </td>
                <td style={{ padding: '10px 14px', fontSize: 13, color: '#666' }}>{p.created_at.slice(0, 10)}</td>
                <td style={{ padding: '10px 14px', display: 'flex', gap: 6, justifyContent: 'center' }}>
                  {p.estado === 'pendente' && (
                    <>
                      <button style={btn('#27ae60')} onClick={() => abrirAprovar(p)}>Aprovar</button>
                      <button style={btn('#e74c3c')} onClick={() => abrirRejeitar(p)}>Rejeitar</button>
                    </>
                  )}
                  {p.estado !== 'pendente' && (
                    <span style={{ fontSize: 12, color: '#888' }}>{p.decisao_motivo?.slice(0, 40) ?? '—'}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal aprovar */}
      {modalAprovar && (
        <div style={s.overlay} onClick={() => setModalAprovar(null)}>
          <div style={{ ...s.modal, borderTop: '4px solid #27ae60' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginTop: 0, color: '#27ae60' }}>Aprovar pedido de reabertura</h3>
            <p style={{ color: '#555', marginBottom: 4 }}>
              <strong>Tipo:</strong> {TIPO_LABEL[modalAprovar.tipo]}<br />
              <strong>Motivo do pedido:</strong> {modalAprovar.motivo}
            </p>
            <label htmlFor="apr-motivo">Nota da Direccao (opcional)</label>
            <textarea
              id="apr-motivo"
              rows={3}
              style={s.input}
              placeholder="ex: Aprovado por erro de lancamento detectado..."
              value={motivoDecisao}
              onChange={e => setMotivoDecisao(e.target.value)}
            />
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button style={btn('#27ae60')} onClick={aprovar} disabled={saving}>{saving ? 'A aprovar...' : 'Confirmar aprovacao'}</button>
              <button style={btn('#888')} onClick={() => setModalAprovar(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal rejeitar */}
      {modalRejeitar && (
        <div style={s.overlay} onClick={() => setModalRejeitar(null)}>
          <div style={{ ...s.modal, borderTop: '4px solid #e74c3c' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginTop: 0, color: '#e74c3c' }}>Rejeitar pedido de reabertura</h3>
            <p style={{ color: '#555', marginBottom: 4 }}>
              <strong>Tipo:</strong> {TIPO_LABEL[modalRejeitar.tipo]}<br />
              <strong>Motivo do pedido:</strong> {modalRejeitar.motivo}
            </p>
            <label htmlFor="rej-motivo">Motivo da rejeicao *</label>
            <textarea
              id="rej-motivo"
              rows={3}
              style={s.input}
              placeholder="ex: O trimestre nao pode ser reaberto pois a pauta ja foi homologada..."
              value={motivoDecisao}
              onChange={e => setMotivoDecisao(e.target.value)}
              required
            />
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button style={btn('#e74c3c')} onClick={rejeitar} disabled={saving || !motivoDecisao.trim()}>{saving ? 'A rejeitar...' : 'Confirmar rejeicao'}</button>
              <button style={btn('#888')} onClick={() => setModalRejeitar(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
