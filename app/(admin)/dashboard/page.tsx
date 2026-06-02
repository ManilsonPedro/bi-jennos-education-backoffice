// app/(admin)/dashboard/page.tsx
export default function DashboardPage() {
  const cards = [
    { titulo: 'Alunos', valor: '—' },
    { titulo: 'Matriculas activas', valor: '—' },
    { titulo: 'Propinas pendentes', valor: '—' },
    { titulo: 'Certificados gerados', valor: '—' },
  ]
  return (
    <div>
      <h1 style={{ color: 'var(--primary)' }}>Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {cards.map((c) => (
          <div
            key={c.titulo}
            style={{ background: '#fff', padding: 20, borderRadius: 12, boxShadow: '0 1px 6px rgba(0,0,0,.06)' }}
          >
            <p style={{ color: '#888', margin: 0, fontSize: 13 }}>{c.titulo}</p>
            <p style={{ fontSize: 28, fontWeight: 700, margin: '8px 0 0' }}>{c.valor}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
