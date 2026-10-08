import type { Locale } from "@/lib/i18n";

/**
 * Drapeaux en SVG : les emojis de drapeaux ne s'affichent pas sous Windows (on y voit « GB », « FR »…).
 */
export function Flag({ code, className = "h-6 w-6" }: { code: Locale; className?: string }) {
  const clip = `flag-${code}`;
  return (
    <svg viewBox="0 0 24 24" className={className} role="img" aria-hidden focusable="false">
      <defs><clipPath id={clip}><circle cx="12" cy="12" r="11.5" /></clipPath></defs>
      <g clipPath={`url(#${clip})`}>
        {code === "fr" && (<><rect width="24" height="24" fill="#fff" /><rect width="8" height="24" fill="#1f3f9e" /><rect x="16" width="8" height="24" fill="#e1303a" /></>)}
        {code === "es" && (<><rect width="24" height="24" fill="#c8202f" /><rect y="6" width="24" height="12" fill="#f7c600" /></>)}
        {code === "de" && (<><rect width="24" height="8" fill="#1a1a1a" /><rect y="8" width="24" height="8" fill="#d8231c" /><rect y="16" width="24" height="8" fill="#f7c600" /></>)}
        {code === "en" && (
          <>
            <rect width="24" height="24" fill="#1f3f9e" />
            <path d="M0 0L24 24M24 0L0 24" stroke="#fff" strokeWidth="4.5" />
            <path d="M0 0L24 24M24 0L0 24" stroke="#d8231c" strokeWidth="1.6" />
            <path d="M12 0V24M0 12H24" stroke="#fff" strokeWidth="7" />
            <path d="M12 0V24M0 12H24" stroke="#d8231c" strokeWidth="4" />
          </>
        )}
      </g>
      <circle cx="12" cy="12" r="11.5" fill="none" stroke="rgba(0,0,0,.12)" />
    </svg>
  );
}
