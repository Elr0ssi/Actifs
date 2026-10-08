import { OG_SIZE, ogImage } from "@/lib/marketing/og";
import { getT, setRequestLocale } from "@/lib/i18n/server";
import { isLocale } from "@/lib/i18n";

export const size = OG_SIZE;
export const contentType = "image/png";

export async function generateImageMetadata({ params }: { params: { lang: string } }) {
  if (isLocale(params.lang)) setRequestLocale(params.lang);
  return [{ id: "og", alt: getT()("Flozea : agenda, repas et finances dans une seule appli"), size: OG_SIZE, contentType: "image/png" }];
}

export default function Image({ params }: { params: { lang: string } }) {
  return ogImage(params.lang);
}
