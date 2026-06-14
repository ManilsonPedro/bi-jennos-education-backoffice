// lib/fmt.ts — formatadores centralizados (moeda, notas, datas)

/**
 * Formata valor monetário em Kwanzas.
 * Exemplo: 1350000 → "1.350.000,00 Kz"
 */
export function kz(valor: number | string | null | undefined): string {
  const n = Number(valor ?? 0)
  if (isNaN(n)) return '0,00 Kz'
  return (
    n.toLocaleString('pt-PT', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + ' Kz'
  )
}

/**
 * Formata nota escolar (0–20) com 1 decimal.
 */
export function nota(valor: number | string | null | undefined): string {
  const n = Number(valor ?? 0)
  return isNaN(n) ? '—' : n.toFixed(1)
}

/**
 * Formata percentagem com 1 decimal.
 */
export function pct(valor: number | string | null | undefined): string {
  const n = Number(valor ?? 0)
  return isNaN(n) ? '—' : n.toFixed(1) + '%'
}
