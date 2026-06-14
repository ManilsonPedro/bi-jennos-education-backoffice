'use client'

import { useState } from 'react'

// ── ConfirmarModal — pergunta simples Sim/Não antes de uma ação ──────────────
interface ConfirmarProps {
  titulo: string
  mensagem: string
  labelConfirmar?: string
  corConfirmar?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmarModal({
  titulo,
  mensagem,
  labelConfirmar = 'Confirmar',
  corConfirmar = '#e74c3c',
  onConfirm,
  onCancel,
}: ConfirmarProps) {
  return (
    <div style={overlay}>
      <div style={box}>
        <h2 style={{ margin: '0 0 8px', fontSize: 17, color: '#1a1a1a' }}>{titulo}</h2>
        <p style={{ margin: '0 0 24px', fontSize: 14, color: '#555', lineHeight: 1.5 }}>{mensagem}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onCancel} style={btnCancelar}>Cancelar</button>
          <button onClick={onConfirm} style={{ ...btnBase, background: corConfirmar }}>{labelConfirmar}</button>
        </div>
      </div>
    </div>
  )
}

// ── InactivarModal — confirmação + motivo obrigatório ────────────────────────
interface InactivarProps {
  titulo: string
  descricao?: string
  onConfirm: (motivo: string) => Promise<void>
  onCancel: () => void
}

export function InactivarModal({ titulo, descricao, onConfirm, onCancel }: InactivarProps) {
  const [step, setStep] = useState<'confirm' | 'motivo'>('confirm')
  const [motivo, setMotivo] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  async function handleSubmit() {
    if (motivo.trim().length < 3) {
      setErro('Motivo obrigatório (mínimo 3 caracteres)')
      return
    }
    setLoading(true)
    setErro('')
    try {
      await onConfirm(motivo.trim())
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro ao inactivar')
      setLoading(false)
    }
  }

  if (step === 'confirm') {
    return (
      <div style={overlay}>
        <div style={box}>
          <h2 style={{ margin: '0 0 8px', fontSize: 17, color: '#1a1a1a' }}>{titulo}</h2>
          <p style={{ margin: '0 0 4px', fontSize: 14, color: '#555', lineHeight: 1.5 }}>
            {descricao ?? 'Esta acção irá inactivar o registo. Deseja continuar?'}
          </p>
          <p style={{ margin: '0 0 24px', fontSize: 13, color: '#e74c3c' }}>
            O registo poderá ser reactivado posteriormente com motivo.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button onClick={onCancel} style={btnCancelar}>Cancelar</button>
            <button onClick={() => setStep('motivo')} style={{ ...btnBase, background: '#e74c3c' }}>
              Sim, continuar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={overlay}>
      <div style={box}>
        <h2 style={{ margin: '0 0 8px', fontSize: 17, color: '#1a1a1a' }}>{titulo}</h2>
        <p style={{ margin: '0 0 12px', fontSize: 13, color: '#555' }}>
          Indique o motivo da inactivação para continuar.
        </p>
        <label style={labelStyle}>Motivo <span style={{ color: '#e74c3c' }}>*</span></label>
        <textarea
          style={textarea}
          rows={3}
          placeholder="Indique o motivo da inactivação..."
          value={motivo}
          onChange={e => setMotivo(e.target.value)}
          autoFocus
        />
        {erro && <p style={{ color: '#e74c3c', fontSize: 12, margin: '4px 0 0' }}>{erro}</p>}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
          <button onClick={onCancel} disabled={loading} style={btnCancelar}>Cancelar</button>
          <button
            onClick={handleSubmit}
            disabled={loading || motivo.trim().length < 3}
            style={{ ...btnBase, background: '#e74c3c', opacity: loading || motivo.trim().length < 3 ? 0.5 : 1 }}
          >
            {loading ? 'A inactivar...' : 'Inactivar'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── ReactivarModal — confirmação + motivo obrigatório ────────────────────────
interface ReactivarProps {
  titulo: string
  onConfirm: (motivo: string) => Promise<void>
  onCancel: () => void
}

export function ReactivarModal({ titulo, onConfirm, onCancel }: ReactivarProps) {
  const [step, setStep] = useState<'confirm' | 'motivo'>('confirm')
  const [motivo, setMotivo] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  async function handleSubmit() {
    if (motivo.trim().length < 3) {
      setErro('Motivo obrigatório (mínimo 3 caracteres)')
      return
    }
    setLoading(true)
    setErro('')
    try {
      await onConfirm(motivo.trim())
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro ao activar')
      setLoading(false)
    }
  }

  if (step === 'confirm') {
    return (
      <div style={overlay}>
        <div style={box}>
          <h2 style={{ margin: '0 0 8px', fontSize: 17, color: '#1a1a1a' }}>{titulo}</h2>
          <p style={{ margin: '0 0 24px', fontSize: 14, color: '#555', lineHeight: 1.5 }}>
            Esta acção irá reactivar o registo. Deseja continuar?
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button onClick={onCancel} style={btnCancelar}>Cancelar</button>
            <button onClick={() => setStep('motivo')} style={{ ...btnBase, background: '#27ae60' }}>
              Sim, reactivar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={overlay}>
      <div style={box}>
        <h2 style={{ margin: '0 0 8px', fontSize: 17, color: '#1a1a1a' }}>{titulo}</h2>
        <label style={labelStyle}>Motivo <span style={{ color: '#e74c3c' }}>*</span></label>
        <textarea
          style={textarea}
          rows={3}
          placeholder="Indique o motivo da reactivação..."
          value={motivo}
          onChange={e => setMotivo(e.target.value)}
          autoFocus
        />
        {erro && <p style={{ color: '#e74c3c', fontSize: 12, margin: '4px 0 0' }}>{erro}</p>}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
          <button onClick={onCancel} disabled={loading} style={btnCancelar}>Cancelar</button>
          <button
            onClick={handleSubmit}
            disabled={loading || motivo.trim().length < 3}
            style={{ ...btnBase, background: '#27ae60', opacity: loading || motivo.trim().length < 3 ? 0.5 : 1 }}
          >
            {loading ? 'A activar...' : 'Activar'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Estilos partilhados ──────────────────────────────────────────────────────
const overlay: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
}
const box: React.CSSProperties = {
  background: '#fff', borderRadius: 14, padding: 28,
  width: 460, maxWidth: '95vw', boxShadow: '0 8px 32px rgba(0,0,0,.22)',
}
const btnBase: React.CSSProperties = {
  padding: '9px 20px', border: 'none', borderRadius: 8,
  color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600,
}
const btnCancelar: React.CSSProperties = {
  ...btnBase, background: '#f4f4f4', color: '#333',
  border: '1px solid #ddd',
}
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 13, fontWeight: 600,
  color: '#333', marginBottom: 6,
}
const textarea: React.CSSProperties = {
  width: '100%', padding: '10px 12px',
  border: '1px solid #d0d0d0', borderRadius: 8,
  fontSize: 13, resize: 'vertical', boxSizing: 'border-box',
}
