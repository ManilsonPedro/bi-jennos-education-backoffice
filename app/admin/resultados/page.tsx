// app/admin/resultados/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { academicoAPI, resultadosAPI, type AnoAcademico, type ResultadoAluno } from '@/lib/api'

const card: React.CSSProperties = {
  background: 'var(--surface)', padding: 24, borderRadius: 12, maxWidth: 640,
  boxShadow: 'var(--shadow-sm)', marginBottom: 24,
}
const input: React.CSSProperties = {
  display: 'block', width: '100%', padding: 10, margin: '6px 0 16px',
  border: '1px solid var(--border-strong)', borderRadius: 8,
}
const btn: React.CSSProperties = {
  padding: '8px 14px', background: 'var(--primary)', color: '#fff',
  border: 'none', borderRadius: 8, marginRight: 8,
}

export default function ResultadosPage() {
  const [anos, setAnos] = useState<AnoAcademico[]>([])
  const [anoId, setAnoId] = useState('')
  const [alunoId, setAlunoId] = useState('')
  const [resultado, setResultado] = useState<ResultadoAluno | null>(null)
  const [erro, setErro] = useState('')
  const [msg, setMsg] = useState('')

  useEffect(() => { academicoAPI.listarAnos().then(setAnos).catch((e) => setErro(e.message)) }, [])

  async function calcularLote() {
    try {
      const r = await resultadosAPI.calcularLote(anoId)
      setMsg(`Processados ${r.alunos_processados} alunos.`)
    } catch (e) { setErro((e as Error).message) }
  }
  async function obter() {
    try { setResultado(await resultadosAPI.obter(alunoId, anoId)) }
    catch (e) { setErro((e as Error).message) }
  }
  async function recalcular() {
    try { setResultado(await resultadosAPI.calcular(alunoId, anoId)) }
    catch (e) { setErro((e as Error).message) }
  }
  async function confirmar() {
    try { setResultado(await resultadosAPI.confirmar(alunoId, anoId)) }
    catch (e) { setErro((e as Error).message) }
  }

  return (
    <>
      <PageHeader title="Resultados finais" />
      {erro && <p style={{ color: 'var(--danger)' }}>{erro}</p>}
      {msg && <p style={{ color: 'var(--success)' }}>{msg}</p>}

      <section style={card}>
        <h3>Calculo em lote</h3>
        <label>Ano academico</label>
        <select style={input} value={anoId} onChange={(e) => setAnoId(e.target.value)}>
          <option value="">--</option>
          {anos.map((a) => <option key={a.id} value={a.id}>{a.designacao}</option>)}
        </select>
        <button style={btn} disabled={!anoId} onClick={calcularLote}>Calcular lote</button>
      </section>

      <section style={card}>
        <h3>Por aluno</h3>
        <label>Aluno ID</label>
        <input style={input} value={alunoId} onChange={(e) => setAlunoId(e.target.value)} />
        <button style={btn} onClick={obter}>Obter</button>
        <button style={btn} onClick={recalcular}>Recalcular</button>
        <button style={btn} onClick={confirmar}>Confirmar</button>
      </section>

      {resultado && (
        <section style={card}>
          <h3>Resultado</h3>
          <p>Estado final: <b>{resultado.estado_final}</b></p>
          {resultado.media_final != null && <p>Media final: {resultado.media_final}</p>}
          {resultado.motivo && <p>Motivo: {resultado.motivo}</p>}
        </section>
      )}
    </>
  )
}
