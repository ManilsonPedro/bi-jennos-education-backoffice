// app/admin/certificados/page.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import {
  academicoAPI,
  certificadosAPI,
  type AnoAcademico,
} from '@/lib/api'

const card: React.CSSProperties = {
  background: '#fff',
  padding: 24,
  borderRadius: 12,
  maxWidth: 560,
  boxShadow: '0 1px 6px rgba(0,0,0,.06)',
}
const input: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: 10,
  margin: '6px 0 16px',
  border: '1px solid #ddd',
  borderRadius: 8,
}
const btn: React.CSSProperties = {
  padding: '10px 16px',
  background: 'var(--primary)',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
}

interface Progresso {
  estado: string
  total?: number
  processados?: number
  percentagem?: number
}

export default function CertificadosPage() {
  const [anos, setAnos] = useState<AnoAcademico[]>([])
  const [anoId, setAnoId] = useState('')
  const [alunoIds, setAlunoIds] = useState('')
  const [tipo, setTipo] = useState('conclusao')
  const [taskId, setTaskId] = useState<string | null>(null)
  const [progresso, setProgresso] = useState<Progresso | null>(null)
  const [erro, setErro] = useState('')
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    academicoAPI.listarAnos().then(setAnos).catch(() => setAnos([]))
    return () => {
      if (timer.current) clearInterval(timer.current)
    }
  }, [])

  async function gerar(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setProgresso(null)
    const ids = alunoIds
      .split(/[\s,]+/)
      .map((s) => s.trim())
      .filter(Boolean)
    try {
      const r = await certificadosAPI.gerarMassivo(ids, anoId, tipo)
      setTaskId(r.task_id)
      iniciarPolling(r.task_id)
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro')
    }
  }

  function iniciarPolling(id: string) {
    if (timer.current) clearInterval(timer.current)
    timer.current = setInterval(async () => {
      try {
        const p = await certificadosAPI.progresso(id)
        setProgresso(p)
        if (p.estado === 'concluido' || p.estado === 'erro') {
          if (timer.current) clearInterval(timer.current)
        }
      } catch {
        if (timer.current) clearInterval(timer.current)
      }
    }, 2000)
  }

  return (
    <div>
      <h1 style={{ color: 'var(--primary)' }}>Certificados (geracao massiva)</h1>
      <form onSubmit={gerar} style={card}>
        <label htmlFor="ano">Ano academico</label>
        <select id="ano" aria-label="Ano academico" style={input} value={anoId}
          onChange={(e) => setAnoId(e.target.value)} required>
          <option value="">— selecionar —</option>
          {anos.map((a) => (
            <option key={a.id} value={a.id}>{a.designacao}</option>
          ))}
        </select>

        <label htmlFor="tipo">Tipo</label>
        <select id="tipo" aria-label="Tipo de certificado" style={input}
          value={tipo} onChange={(e) => setTipo(e.target.value)}>
          <option value="conclusao">Conclusao</option>
          <option value="aproveitamento">Aproveitamento</option>
          <option value="honra">Honra</option>
          <option value="participacao">Participacao</option>
        </select>

        <label htmlFor="ids">IDs dos alunos (separados por virgula ou espaco)</label>
        <textarea id="ids" aria-label="IDs dos alunos" style={{ ...input, minHeight: 90 }}
          value={alunoIds} onChange={(e) => setAlunoIds(e.target.value)} required />

        <button type="submit" style={btn}>Gerar certificados</button>
      </form>

      {erro && <p style={{ color: '#c0392b', marginTop: 16 }}>{erro}</p>}

      {taskId && (
        <div style={{ ...card, marginTop: 24 }}>
          <h3 style={{ marginTop: 0 }}>Progresso</h3>
          <p>Tarefa: <code>{taskId}</code></p>
          <p>Estado: <b>{progresso?.estado ?? 'a iniciar...'}</b></p>
          {progresso?.percentagem != null && (
            <div style={{ background: '#eee', borderRadius: 8, overflow: 'hidden' }}>
              <div
                style={{
                  width: `${progresso.percentagem}%`,
                  background: 'var(--primary)',
                  color: '#fff',
                  padding: '4px 8px',
                  fontSize: 12,
                }}
              >
                {progresso.percentagem}%
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
