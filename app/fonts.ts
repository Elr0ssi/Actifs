import localFont from "next/font/local";

/**
 * Geist (SIL OFL, voir fonts/LICENSE-Geist.txt) réduite aux caractères latins utilisés par le site (fr, en, es, de, flèches et
 * symboles courants) : 36 Ko au lieu de 70 Ko, avec les mêmes graisses 100–900. Un caractère hors de cette liste s'affiche
 * simplement avec la police système. La variable CSS reste `--font-geist-sans`, rien d'autre à changer.
 */
export const GeistSans = localFont({
  src: "./fonts/Geist-Variable-latin.woff2",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap",
});
