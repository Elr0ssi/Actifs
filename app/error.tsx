"use client";

import Link from "next/link";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="text-5xl">😕</p>
      <h1 className="mt-4 text-2xl font-bold text-stone-900">Un problème est survenu</h1>
      <p className="mt-2 max-w-sm text-stone-600">Ce n'est pas de ton fait. Réessaie, ou reviens à l'accueil.</p>
      <div className="mt-6 flex items-center gap-4">
        <button onClick={reset} className="btn-primary px-5 py-2.5">Réessayer</button>
        <Link href="/" className="text-sm font-semibold text-brand-700 hover:underline">Accueil</Link>
      </div>
    </div>
  );
}
