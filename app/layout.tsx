// app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'
import { themeBootstrapScript } from '@/components/ui/ThemeToggle'

export const metadata: Metadata = {
  title: 'Bi Jennos Investiment',
  description: 'Plataforma de gestão Bi Jennos Investiment',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
