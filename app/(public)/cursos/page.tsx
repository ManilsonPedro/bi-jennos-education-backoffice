// app/(public)/cursos/page.tsx
import Link from 'next/link'

const CURSOS = [
  {
    nome: 'Ensino Primario',
    descricao: 'Da 1.a a 6.a classe, com acompanhamento individualizado.',
  },
  {
    nome: 'Ensino Secundario (I Ciclo)',
    descricao: '7.a a 9.a classe, base solida para o ensino medio.',
  },
  {
    nome: 'Ensino Medio',
    descricao: 'Cursos tecnicos e de ciencias com preparacao para o ensino superior.',
  },
  {
    nome: 'Informatica',
    descricao: 'Formacao tecnica em programacao, redes e ofimatica.',
  },
]

export default function CursosPage() {
  return (
    <div>
      <h1 style={{ color: 'var(--primary)' }}>Cursos disponiveis</h1>
      <p style={{ color: '#555' }}>
        Conheca a nossa oferta formativa. Para se inscrever, preencha o{' '}
        <Link href="/inscricao">pedido de inscricao</Link>.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        {CURSOS.map((c) => (
          <div
            key={c.nome}
            style={{
              background: 'var(--surface)',
              padding: 20,
              borderRadius: 12,
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <h3 style={{ margin: '0 0 8px', color: 'var(--primary)' }}>{c.nome}</h3>
            <p style={{ margin: 0, color: '#555' }}>{c.descricao}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
