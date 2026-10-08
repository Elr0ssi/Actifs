"use client";

import NextLink from "next/link";
import type { ComponentProps } from "react";
import { useLocale } from "@/components/i18n/provider";
import { localizePath } from "@/lib/i18n";

/** Lien du site public : garde la langue de la page (`/tarifs` devient `/en/tarifs` en anglais). */
export default function Link({ href, ...props }: ComponentProps<typeof NextLink>) {
  const locale = useLocale();
  return <NextLink href={typeof href === "string" ? localizePath(href, locale) : href} {...props} />;
}
