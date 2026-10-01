import { useId } from "react";

/**
 * Logo SIMULO — motif "mirroring" : un téléphone dont l'écran est
 * projeté sur un écran PC, relié par un flux. Dégradé qui suit le thème
 * (bleu ciel / vert clair). Un seul composant, utilisable nav + footer.
 */
export default function Logo({
  className = "h-8 w-8",
  withWord = false,
}: {
  className?: string;
  withWord?: boolean;
}) {
  const gid = useId().replace(/:/g, "");
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg
        className={className}
        viewBox="0 0 64 64"
        role="img"
        aria-label="Simulo"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`tile-${gid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--logo-a)" />
            <stop offset="1" stopColor="var(--logo-b)" />
          </linearGradient>
          <linearGradient id={`scr-${gid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#eaf7ff" />
            <stop offset="1" stopColor="var(--accent)" />
          </linearGradient>
        </defs>
        <rect x="3" y="3" width="58" height="58" rx="15" fill={`url(#tile-${gid})`} />
        <rect
          x="3"
          y="3"
          width="58"
          height="58"
          rx="15"
          fill="none"
          stroke="rgba(255,255,255,0.14)"
        />
        {/* téléphone (gauche) */}
        <rect x="14" y="17" width="18" height="30" rx="4.5" fill="#06131f" />
        <rect x="17" y="21" width="12" height="20" rx="1.6" fill={`url(#scr-${gid})`} />
        <circle cx="23" cy="43" r="1.3" fill="#06131f" />
        {/* flux téléphone → écran */}
        <g stroke="#06131f" strokeWidth="1.9" strokeLinecap="round">
          <path d="M34 25h5" />
          <path d="M34 32h7" />
          <path d="M34 39h5" />
        </g>
        {/* écran PC projeté (droite) */}
        <rect x="42" y="22" width="16" height="20" rx="3" fill="#06131f" />
        <rect x="44.5" y="25" width="11" height="14" rx="1.5" fill={`url(#scr-${gid})`} />
      </svg>
      {withWord && (
        <span className="text-base font-extrabold tracking-[0.14em] text-white">
          SIMULO
        </span>
      )}
    </span>
  );
}
