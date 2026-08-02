import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

/**
 * Isi `content` pada Profil dan Program KKN berupa Markdown.
 *
 * Lebar dibatasi 68ch supaya baris teks tinggal 65–75 karakter. Di ponsel lebar
 * layar sudah membatasi sendiri, jadi aturan ini praktis hanya bekerja di
 * desktop — dan di situlah ia penting.
 */
export function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div
      className={cn(
        "prose prose-kembangsari max-w-[68ch] prose-headings:scroll-mt-24",
        "prose-img:rounded-xl prose-a:underline-offset-2",
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Setiap halaman sudah punya <h1> dari PageHeader, sementara isi
          // Markdown dari backend biasanya diawali "# Judul". Tanpa penurunan
          // tingkat ini halaman jadi punya dua <h1>, yang membingungkan
          // pembaca layar sekaligus melemahkan struktur halaman di mesin pencari.
          h1: ({ children: heading }) => (
            <h2 className="text-2xl font-semibold tracking-tight">{heading}</h2>
          ),
          h2: ({ children: heading }) => (
            <h3 className="text-xl font-semibold tracking-tight">{heading}</h3>
          ),
          h3: ({ children: heading }) => (
            <h4 className="text-lg font-semibold tracking-tight">{heading}</h4>
          ),
          h4: ({ children: heading }) => <h5 className="font-semibold">{heading}</h5>,
          // Tabel dalam Markdown adalah penyebab scroll horizontal paling sering
          // di layar sempit; yang menggulir harus pembungkusnya, bukan halaman.
          table: ({ children: cells }) => (
            <div className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
              <table className="min-w-[36rem]">{cells}</table>
            </div>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
