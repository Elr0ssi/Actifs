"use client";

import { usePathname } from "next/navigation";

/** Fondu + légère montée à chaque changement de section. */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="animate-pageIn">
      {children}
    </div>
  );
}
