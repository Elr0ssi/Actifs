"use client";

import { usePathname } from "next/navigation";

/** Fondu léger à chaque changement de section — juste assez pour que la navigation se sente vivante. */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="animate-pageIn">
      {children}
    </div>
  );
}
