import { LandscapeBackdrop } from "@/features/home/landscape";

/**
 * Kepala halaman bergambar untuk dashboard (`design-idea.md` §8).
 *
 * Memakai ilustrasi yang sama dengan hero beranda, bukan gambar kedua: satu
 * lanskap untuk seluruh portal membuat dashboard terbaca sebagai bagian dari
 * situs yang sama, dan tidak ada aset tambahan yang harus dipelihara.
 *
 * Tingginya 200px di dalam rentang 180–220px yang diminta dokumen. Isinya
 * sengaja hanya judul dan satu kalimat — §8 tidak menaruh aksi di sini, dan
 * tombol di atas gambar selalu lebih sulit dibaca daripada tombol di atas
 * latar polos.
 *
 * Kontras teks putih di sini lebih longgar daripada di beranda: kotaknya jauh
 * lebih pendek, sehingga yang tampak hanya bagian bawah ilustrasi — sawah dan
 * punggungan terdekat, dua bidang tergelap. Lapisan gelapnya tetap dipasang
 * karena rumah berjendela menyala bisa masuk ke potongan itu.
 */
export function PageHero({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    // `print:hidden` sepola dengan bilah atas dan sidebar: satu-satunya halaman
    // yang dicetak adalah lembar QR monografi, dan gambar lanskap sebesar ini
    // menghabiskan tinta tanpa menambah apa pun di kertas.
    <section className="relative isolate flex min-h-50 flex-col justify-end overflow-hidden rounded-2xl print:hidden">
      <LandscapeBackdrop className="absolute inset-0 -z-10 size-full" />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-linear-to-t from-slate-950/80 via-slate-950/45 to-slate-950/20"
      />

      <div className="flex flex-col gap-4 p-5 md:p-7">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-balance text-white md:text-3xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-1.5 max-w-xl text-white/85 text-pretty">{description}</p>
          ) : null}
        </div>

        {/* Aksi dibungkus baris tersendiri, bukan diletakkan langsung sebagai
            anak kolom flex: anak flex meregang mengikuti lebar induknya secara
            bawaan, dan sebuah `<ButtonLink>` yang ditaruh apa adanya di sini
            melebar sepanjang hero. Terlihat jelas di halaman Ringkasan. */}
        {children ? <div className="flex flex-wrap items-center gap-2">{children}</div> : null}
      </div>
    </section>
  );
}
