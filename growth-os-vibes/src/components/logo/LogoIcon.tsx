interface LogoIconProps {
  size?: 128 | 64 | 48 | 32 | 16
  className?: string
}

export function LogoIcon({ size = 64, className }: LogoIconProps) {
  if (size === 16) {
    // Simplified favicon version
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <rect width="16" height="16" rx="3" fill="#10b981" />
        <text
          x="1"
          y="12"
          fontFamily="JetBrains Mono, monospace"
          fontSize="9"
          fontWeight="700"
          fill="#0a0a0a"
        >
          go
        </text>
      </svg>
    )
  }

  const viewBox = `0 0 ${size} ${size}`
  const rx = size === 128 ? 22 : size === 64 ? 11 : size === 48 ? 9 : 6
  const fontSize = size === 128 ? 46 : size === 64 ? 28 : size === 48 ? 22 : 15
  const x1 = size === 128 ? 20 : size === 64 ? 8 : size === 48 ? 5 : 3
  const x2 = size === 128 ? 56 : size === 64 ? 28 : size === 48 ? 20 : 13
  const y = size === 128 ? 90 : size === 64 ? 44 : size === 48 ? 34 : 23

  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width={size} height={size} rx={rx} fill="#111111" />
      <rect
        x={size >= 48 ? 0.75 : 0.75}
        y={size >= 48 ? 0.75 : 0.75}
        width={size - 1.5}
        height={size - 1.5}
        rx={rx - 1.25}
        stroke="#10b981"
        strokeWidth={size >= 48 ? 1.5 : 1}
        strokeOpacity={size === 128 ? 0.3 : size === 64 ? 0.35 : 0.4}
      />
      {size === 128 && (
        <text
          x="22"
          y="50"
          fontFamily="JetBrains Mono, monospace"
          fontSize="14"
          fontWeight="400"
          fill="#10b981"
          opacity="0.6"
        >
          $_
        </text>
      )}
      <text
        x={x1}
        y={y}
        fontFamily="JetBrains Mono, monospace"
        fontSize={fontSize}
        fontWeight="700"
        letterSpacing={size === 128 ? -2 : 0}
        fill="#f0f0f0"
      >
        g
      </text>
      <text
        x={x2}
        y={y}
        fontFamily="JetBrains Mono, monospace"
        fontSize={fontSize}
        fontWeight="700"
        fill="#10b981"
      >
        _o
      </text>
    </svg>
  )
}
