// components/ui/Logo.tsx
import Image from 'next/image'
import { CSSProperties } from 'react'

interface Props {
  /** Tamanho do monograma (px) */
  size?: number
  /** Mostrar texto à direita */
  showText?: boolean
  /** Override de cor do texto principal (auto se omitido) */
  textColor?: string
  /** Texto principal. Default: "BI JENNOS" */
  brand?: string
  /** Texto secundário (tagline). Default: "INVESTIMENT" */
  tagline?: string
  /** Versão para fundos escuros: texto branco + disco claro a envolver o monograma */
  inverted?: boolean
  /** Se a versão inverted envolve o monograma num disco. Default true. */
  plate?: boolean
  style?: CSSProperties
}

/**
 * Logo Bi Jennos. Usa /public/logo.png como monograma.
 * Layout: monograma à esquerda + "BI JENNOS" + tagline "INVESTIMENT".
 */
export function Logo({
  size = 48,
  showText = true,
  textColor,
  brand = 'BI JENNOS',
  tagline = 'INVESTIMENT',
  inverted = false,
  plate = true,
  style,
}: Props) {
  const resolvedTextColor =
    textColor ?? (inverted ? '#ffffff' : 'var(--brand-deep)')
  const taglineColor = inverted ? 'rgba(255,255,255,0.85)' : 'var(--text-muted)'

  const usePlate = inverted && plate
  const plateSize = Math.round(size * 1.18)
  const imageSize = Math.round(size * 0.92)

  const brandFontSize = Math.max(18, Math.round(size * 0.6))
  const taglineFontSize = Math.max(10, Math.round(brandFontSize * 0.32))

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: Math.round(size * 0.22),
        ...style,
      }}
    >
      <div
        style={{
          width: usePlate ? plateSize : size,
          height: usePlate ? plateSize : size,
          borderRadius: usePlate ? '50%' : 0,
          background: usePlate
            ? 'radial-gradient(circle at 35% 30%, #ffffff 0%, #f3eaff 60%, #e9d8ff 100%)'
            : 'transparent',
          boxShadow: usePlate
            ? '0 10px 30px rgba(76, 12, 117, 0.35), inset 0 0 0 1px rgba(255,255,255,0.45)'
            : 'none',
          display: 'grid',
          placeItems: 'center',
          flexShrink: 0,
        }}
      >
        <Image
          src="/logo.png"
          alt="Bi Jennos Investiment"
          width={imageSize}
          height={imageSize}
          priority
          style={{ width: imageSize, height: imageSize, objectFit: 'contain' }}
        />
      </div>

      {showText && (
        <div style={{ lineHeight: 1, display: 'flex', flexDirection: 'column', gap: Math.round(brandFontSize * 0.18) }}>
          <div
            style={{
              fontSize: brandFontSize,
              fontWeight: 800,
              color: resolvedTextColor,
              letterSpacing: '0.06em',
              whiteSpace: 'nowrap',
            }}
          >
            {brand}
          </div>
          <div
            style={{
              fontSize: taglineFontSize,
              fontWeight: 600,
              color: taglineColor,
              letterSpacing: '0.42em',
              whiteSpace: 'nowrap',
            }}
          >
            {tagline}
          </div>
        </div>
      )}
    </div>
  )
}
