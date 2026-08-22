export function Logo({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <circle cx="24" cy="24" r="22.5" stroke="url(#logo-ring)" strokeWidth="1.5" />
      <circle cx="24" cy="24" r="18" fill="url(#logo-fill)" />
      <text
        x="24"
        y="30.5"
        textAnchor="middle"
        fontFamily="var(--font-display, serif)"
        fontWeight={700}
        fontSize="17"
        fill="var(--color-gold-100, #faf0cd)"
      >
        RK
      </text>
      <defs>
        <linearGradient id="logo-ring" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ecc65e" />
          <stop offset="1" stopColor="#a86f18" />
        </linearGradient>
        <linearGradient id="logo-fill" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#147d69" />
          <stop offset="1" stopColor="#0a3f38" />
        </linearGradient>
      </defs>
    </svg>
  );
}
