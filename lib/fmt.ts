// lib/fmt.ts — formatadores centralizados (moeda, notas, datas)

export function kz(valor: number | string | null | undefined): string {
  const n = Number(valor ?? 0)
  if (isNaN(n)) return '0,00 Kz'
  // Formato manual para garantir "1.350.000,00 Kz" em qualquer browser/SO,
  // sem depender do locale do ambiente (pt-PT usa espaço em alguns SO).
  const [intPart, decPart] = n.toFixed(2).split('.')
  const intFormatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${intFormatted},${decPart} Kz`
}

export function nota(valor: number | string | null | undefined): string {
  const n = Number(valor ?? 0)
  return isNaN(n) ? '—' : n.toFixed(1)
}

export function pct(valor: number | string | null | undefined): string {
  const n = Number(valor ?? 0)
  return isNaN(n) ? '—' : n.toFixed(1) + '%'
}
