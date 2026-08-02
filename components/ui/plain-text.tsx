import { cn } from "@/lib/utils";

/**
 * Menampilkan teks biasa dari API sebagai paragraf.
 *
 * Isi berita dan pengumuman bertipe teks polos, bukan Markdown — dirender
 * sebagai teks, bukan HTML, jadi tidak ada jalan masuk bagi markup berbahaya
 * dari dashboard admin.
 */
export function PlainText({ children, className }: { children: string; className?: string }) {
  const paragraphs = children
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <div className={cn("max-w-[68ch] space-y-4 text-pretty", className)}>
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="whitespace-pre-line">
          {paragraph}
        </p>
      ))}
    </div>
  );
}
