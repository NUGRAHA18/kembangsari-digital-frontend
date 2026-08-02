"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * Dark mode wajib tersedia menurut dokumen UI/UX.
 * `attribute="class"` memasang class `.dark` di <html>, yang dibaca varian
 * `dark:` di globals.css.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </NextThemesProvider>
  );
}
