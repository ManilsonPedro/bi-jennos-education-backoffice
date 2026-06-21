'use client'

import { useState, useRef } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { documentosAPI, type LerBiResponse } from '@/lib/api'

const card: React.CSSProperties = {
  background: 'var(--surface)', padding: 24, borderRadius: 12,
  boxShadow: 'var(--shadow-sm)', marginBottom: 24, maxWidth: 640,
}
const input: React.CSSProperties = {
  display: 'block', width: '100%', padding: 10,
  margin: '6px 0 14px', border: '1px solid var(--border-strong)', borderRadius: 8,
}
const btn = (bg = 'var(--primary)'): React.CSSProperties => ({
  padding: '8px 16px', background: bg, color: '#fff',
  border: 'none', borderRadius: 8, cursor: 'pointer', marginRight: 8,
})
const fieldRow: React.CSSProperties = {
  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 4,
}

type Tab = 'cartao' | 'declaracao' | 'caderneta' | 'bi'

export default function DocumentosPage() {
  const [tab, setTab] = useState<Tab>('cartao')

  // Cartão
  const [cartaoAlunoId, setCartaoAlunoId] = useState('')
  const [cartaoAnoId, setCartaoAnoId] = useState('')
  const [cartaoFoto, setCartaoFoto] = useState('')
  const [cartaoLoading, setCartaoLoading] = useState(false)
  const fotoInputRef = useRef<HTMLInputElement>(null)

  // Declaração
  const [declAlunoId, setDeclAlunoId] = useState('')
  const [declAnoId, setDeclAnoId] = useState('')
  const [declTipo, setDeclTipo] = useState('matricula')
  const [declFinalidade, setDeclFinalidade] = useState('')
  const [declLoading, setDeclLoading] = useState(false)

  // Caderneta
  const [cadAlunoId, setCadAlunoId] = useState('')
  const [cadAnoId, setCadAnoId] = useState('')
  const [cadLoading, setCadLoading] = useState(false)

  // BI
  const [biMrz1, setBiMrz1] = useState('')
  const [biMrz2, setBiMrz2] = useState('')
  const [biResult, setBiResult] = useState<LerBiResponse | null>(null)
  const [biLoading, setBiLoading] = useState(false)

  const [erro, setErro] = useState('')

  async function downloadBlob(res: Response, filename: string) {
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Erro' }))
      throw new Error(err.detail ?? `HTTP ${res.status}`)
    }
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  async function gerarCartao() {
    setErro('')
    setCartaoLoading(true)
    try {
      const res = await documentosAPI.gerarCartao({
        aluno_id: cartaoAlunoId.trim(),
        ano_academico_id: cartaoAnoId.trim(),
        foto_base64: cartaoFoto,
      })
      await downloadBlob(res, `cartao_${cartaoAlunoId}.pdf`)
    } catch (e) {
      setErro((e as Error).message)
    } finally {
      setCartaoLoading(false)
    }
  }

  async function gerarDeclaracao() {
    setErro('')
    setDeclLoading(true)
    try {
      const res = await documentosAPI.gerarDeclaracao({
        aluno_id: declAlunoId.trim(),
        tipo: declTipo,
        ano_academico_id: declAnoId.trim(),
        finalidade: declFinalidade,
      })
      await downloadBlob(res as Response, `declaracao_${declAlunoId}.pdf`)
    } catch (e) {
      setErro((e as Error).message)
    } finally {
      setDeclLoading(false)
    }
  }

  async function gerarCaderneta() {
    setErro('')
    setCadLoading(true)
    try {
      const res = await documentosAPI.gerarCaderneta(cadAlunoId.trim(), cadAnoId.trim())
      await downloadBlob(res, `caderneta_${cadAlunoId}.pdf`)
    } catch (e) {
      setErro((e as Error).message)
    } finally {
      setCadLoading(false)
    }
  }

  async function lerBi() {
    setErro('')
    setBiLoading(true)
    try {
      const result = await documentosAPI.lerBi({ mrz_linha1: biMrz1.trim(), mrz_linha2: biMrz2.trim() })
      setBiResult(result)
    } catch (e) {
      setErro((e as Error).message)
    } finally {
      setBiLoading(false)
    }
  }

  function onFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setCartaoFoto(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const tabStyle = (t: Tab): React.CSSProperties => ({
    padding: '8px 16px', marginRight: 4, border: 'none', borderRadius: '8px 8px 0 0',
    background: tab === t ? 'var(--primary)' : 'var(--surface)',
    color: tab === t ? '#fff' : 'var(--text-muted)',
    cursor: 'pointer', fontWeight: tab === t ? 600 : 400,
  })

  return (
    <>
      <PageHeader title="Documentos PDF" />
      {erro && <p style={{ color: 'var(--danger)', marginBottom: 16 }}>{erro}</p>}

      <div style={{ display: 'flex', marginBottom: 0, borderBottom: '2px solid var(--border)' }}>
        <button style={tabStyle('cartao')} onClick={() => setTab('cartao')}>Cartão de aluno</button>
        <button style={tabStyle('declaracao')} onClick={() => setTab('declaracao')}>Declaração</button>
        <button style={tabStyle('caderneta')} onClick={() => setTab('caderneta')}>Caderneta</button>
        <button style={tabStyle('bi')} onClick={() => setTab('bi')}>Leitura de BI</button>
      </div>

      {tab === 'cartao' && (
        <section style={{ ...card, borderRadius: '0 12px 12px 12px' }}>
          <h3 style={{ marginBottom: 16 }}>Cartão de Estudante (CR80)</h3>
          <div style={fieldRow}>
            <div>
              <label>ID do Aluno</label>
              <input style={input} value={cartaoAlunoId} onChange={(e) => setCartaoAlunoId(e.target.value)} placeholder="UUID do aluno" />
            </div>
            <div>
              <label>ID do Ano Académico</label>
              <input style={input} value={cartaoAnoId} onChange={(e) => setCartaoAnoId(e.target.value)} placeholder="UUID do ano" />
            </div>
          </div>
          <label>Foto do aluno (opcional)</label>
          <input ref={fotoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onFotoChange} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '6px 0 16px' }}>
            <button style={btn('#555')} onClick={() => fotoInputRef.current?.click()}>
              {cartaoFoto ? 'Foto carregada ✓' : 'Escolher foto'}
            </button>
            {cartaoFoto && (
              <button style={{ ...btn('#e74c3c'), marginRight: 0 }} onClick={() => setCartaoFoto('')}>
                Remover foto
              </button>
            )}
          </div>
          <button style={btn()} onClick={gerarCartao} disabled={!cartaoAlunoId || !cartaoAnoId || cartaoLoading}>
            {cartaoLoading ? 'A gerar...' : 'Descarregar Cartão PDF'}
          </button>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12 }}>
            O PDF contém frente + verso em formato ID card (85.6 × 54 mm) com QR de verificação.
          </p>
        </section>
      )}

      {tab === 'declaracao' && (
        <section style={{ ...card, borderRadius: '0 12px 12px 12px' }}>
          <h3 style={{ marginBottom: 16 }}>Declaração</h3>
          <div style={fieldRow}>
            <div>
              <label>ID do Aluno</label>
              <input style={input} value={declAlunoId} onChange={(e) => setDeclAlunoId(e.target.value)} placeholder="UUID do aluno" />
            </div>
            <div>
              <label>ID do Ano Académico</label>
              <input style={input} value={declAnoId} onChange={(e) => setDeclAnoId(e.target.value)} placeholder="UUID do ano" />
            </div>
          </div>
          <label>Tipo de declaração</label>
          <select style={{ ...input, cursor: 'pointer' }} value={declTipo} onChange={(e) => setDeclTipo(e.target.value)}>
            <option value="matricula">Declaração de matrícula</option>
            <option value="frequencia">Declaração de frequência</option>
            <option value="aproveitamento">Declaração de aproveitamento</option>
            <option value="outro">Outro</option>
          </select>
          <label>Finalidade (opcional)</label>
          <input style={input} value={declFinalidade} onChange={(e) => setDeclFinalidade(e.target.value)} placeholder="Ex.: apresentar ao banco, INEFOP..." />
          <button style={btn()} onClick={gerarDeclaracao} disabled={!declAlunoId || !declAnoId || declLoading}>
            {declLoading ? 'A gerar...' : 'Descarregar Declaração PDF'}
          </button>
        </section>
      )}

      {tab === 'caderneta' && (
        <section style={{ ...card, borderRadius: '0 12px 12px 12px' }}>
          <h3 style={{ marginBottom: 16 }}>Caderneta / Boletim de Notas</h3>
          <div style={fieldRow}>
            <div>
              <label>ID do Aluno</label>
              <input style={input} value={cadAlunoId} onChange={(e) => setCadAlunoId(e.target.value)} placeholder="UUID do aluno" />
            </div>
            <div>
              <label>ID do Ano Académico</label>
              <input style={input} value={cadAnoId} onChange={(e) => setCadAnoId(e.target.value)} placeholder="UUID do ano" />
            </div>
          </div>
          <button style={btn()} onClick={gerarCaderneta} disabled={!cadAlunoId || !cadAnoId || cadLoading}>
            {cadLoading ? 'A gerar...' : 'Descarregar Caderneta PDF'}
          </button>
        </section>
      )}

      {tab === 'bi' && (
        <section style={{ ...card, borderRadius: '0 12px 12px 12px' }}>
          <h3 style={{ marginBottom: 8 }}>Leitura de Bilhete de Identidade</h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
            Introduza as linhas MRZ do BI angolano (zona legível por máquina, geralmente na base do documento).
            Se não tiver MRZ, pode preencher os campos manualmente abaixo.
          </p>
          <label>Linha MRZ 1</label>
          <input
            style={{ ...input, fontFamily: 'monospace', letterSpacing: 1 }}
            value={biMrz1}
            onChange={(e) => setBiMrz1(e.target.value)}
            placeholder="IDAGO12345678<<<<<<<<<<<<<<"
          />
          <label>Linha MRZ 2</label>
          <input
            style={{ ...input, fontFamily: 'monospace', letterSpacing: 1 }}
            value={biMrz2}
            onChange={(e) => setBiMrz2(e.target.value)}
            placeholder="8901011M2601010AOL<<<<<<<<"
          />
          <button style={btn()} onClick={lerBi} disabled={biLoading}>
            {biLoading ? 'A processar...' : 'Extrair dados do BI'}
          </button>

          {biResult && (
            <div style={{ marginTop: 20, background: '#f4f7fb', borderRadius: 8, padding: 16, border: '1px solid var(--border)' }}>
              <p style={{ fontWeight: 600, marginBottom: 10 }}>
                Dados extraídos {biResult.fonte === 'mrz' ? '(via MRZ)' : '(entrada manual)'}
              </p>
              <div style={fieldRow}>
                <div><span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Nome</span><br /><b>{biResult.nome || '—'}</b></div>
                <div><span style={{ fontSize: 11, color: 'var(--text-muted)' }}>N.º BI</span><br /><b>{biResult.bi_numero || '—'}</b></div>
              </div>
              <div style={fieldRow}>
                <div><span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Data de nascimento</span><br /><b>{biResult.data_nascimento || '—'}</b></div>
                <div><span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Sexo</span><br /><b>{biResult.sexo || '—'}</b></div>
              </div>
              {biResult.nif && (
                <div><span style={{ fontSize: 11, color: 'var(--text-muted)' }}>NIF</span><br /><b>{biResult.nif}</b></div>
              )}
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 10 }}>
                Copie estes dados para o formulário de criação de aluno.
              </p>
            </div>
          )}
        </section>
      )}
    </>
  )
}
