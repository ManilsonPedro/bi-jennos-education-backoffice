// components/shared/DataTable.tsx
'use client'

export interface Column<T> {
  key: keyof T | string
  label: string
  render?: (row: T) => React.ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  rows: T[]
  emptyMessage?: string
}

export function DataTable<T>({
  columns,
  rows,
  emptyMessage = 'Sem registos.',
}: DataTableProps<T>) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
      <thead>
        <tr>
          {columns.map((c) => (
            <th key={String(c.key)} style={thStyle}>
              {c.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td colSpan={columns.length} style={{ ...tdStyle, textAlign: 'center', color: '#888' }}>
              {emptyMessage}
            </td>
          </tr>
        ) : (
          rows.map((row, i) => (
            <tr key={i}>
              {columns.map((c) => (
                <td key={String(c.key)} style={tdStyle}>
                  {c.render
                    ? c.render(row)
                    : String((row as Record<string, unknown>)[c.key as string] ?? '')}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  )
}

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '12px 16px',
  borderBottom: '2px solid #eee',
  background: 'var(--primary)',
  color: '#fff',
  fontSize: 14,
}

const tdStyle: React.CSSProperties = {
  padding: '10px 16px',
  borderBottom: '1px solid #f0f0f0',
  fontSize: 14,
}
