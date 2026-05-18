export function ShieldOutline({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 220" fill="none" aria-hidden>
      <path
        d="M100 8 L188 40 V110 C188 165 140 198 100 212 C60 198 12 165 12 110 V40 Z"
        stroke="currentColor"
        strokeWidth="2.5"
        className="text-orange-500/40"
        fill="rgba(255,255,255,0.65)"
      />
    </svg>
  );
}
