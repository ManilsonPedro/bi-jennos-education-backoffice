// app/sem-permissao/page.tsx
export default function SemPermissaoPage() {
  return (
    <main style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ color: 'var(--danger)' }}>403 — Sem permissao</h1>
        <p>Nao tem autorizacao para aceder a esta area.</p>
        <a href="/login">Voltar ao login</a>
      </div>
    </main>
  )
}
