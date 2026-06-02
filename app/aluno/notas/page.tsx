// app/(aluno)/notas/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { authAPI } from '@/lib/api'

interface Me {
  nome_completo: string
  email: string
  role: string
}

export default function NotasPage() {
  const [me, setMe] = useState<Me | null>(null)
  const [erro, setErro] = useState('')

  useEffect(() => {
    authAPI
      .me()
      .then((d) => setMe(d as Me))
      .catch((e) => setErro(e instanceof Error ? e.message : 'Erro'))
  }, [])

  return (
    <div>
      <h1 style={{ color: 'var(--primary)' }}>As minhas notas</h1>
      {erro && <p style={{ color: '#c0392b' }}>{erro}</p>}
      {me && (
        <p>
          Bem-vindo, <b>{me.nome_completo}</b> ({me.email}).
        </p>
      )}
      <div
        style={{
          background: '#fff',
          padding: 24,
          borderRadius: 12,
          boxShadow: '0 1px 6px rgba(0,0,0,.06)',
        }}
      >
        <p style={{ color: '#888' }}>
          A consulta de notas e pautas por trimestre fica disponivel apos a
          publicacao das pautas pelo docente.
        </p>
      </div>
    </div>
  )
}
