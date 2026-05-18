export function StarCluster({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 32" fill="none" aria-hidden>
      <path
        d="M12 4l1.8 5.5h5.8L15.9 13l1.8 5.5L12 15.9 6.3 18.5 8.1 13 3.4 9.5h5.8L12 4Z"
        className="fill-orange-500/90"
      />
      <path
        d="M60 2l1.4 4.2h4.4L62.2 9.4l1.4 4.2L60 11.5l-3.6 2.1 1.4-4.2-3.6-3.2h4.4L60 2Z"
        className="fill-emerald-700/90"
      />
      <path
        d="M108 6l1.2 3.6h3.8l-3 2.4 1.2 3.6-3.2-2.3-3.2 2.3 1.2-3.6-3-2.4h3.8L108 6Z"
        className="fill-orange-400/80"
      />
    </svg>
  );
}
