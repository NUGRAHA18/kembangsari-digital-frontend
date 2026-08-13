import Image from "next/image";
import { ArrowRight, MapPin } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { LandscapeBackdrop } from "@/features/home/landscape";

/**
 * Hero beranda: panorama padukuhan sebagai latar, judul, dan dua aksi.
 *
 * `-mt-16` menarik hero ke belakang navbar yang posisinya fixed, sesuai konsep
 * "navbar transparan yang berubah solid saat digulir" di dokumen UI/UX.
 * Tingginya memakai `svh`, bukan `vh`: di ponsel `100vh` mengabaikan bilah
 * alamat sehingga bagian bawah hero selalu terpotong.
 *
 * Latarnya dua kemungkinan, dan urutannya disengaja: **foto yang diunggah
 * pengelola selalu menang**, karena itu foto padukuhan yang sebenarnya.
 * Ilustrasi lanskap hanya berlaku selama `site_banner` masih kosong —
 * menggantikan blok hijau polos yang dulu mengisi keadaan itu.
 */
export function Hero({
  title,
  description,
  imageUrl,
}: {
  title: string;
  description?: string;
  imageUrl?: string;
}) {
  return (
    <section className="relative -mt-16 flex min-h-[34rem] items-end overflow-hidden md:min-h-[85svh]">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt=""
          fill
          // Gambar terbesar di atas lipatan layar — dimuat lebih awal karena
          // inilah yang menentukan angka Largest Contentful Paint.
          priority
          sizes="100vw"
          className="object-cover"
        />
      ) : (
        <LandscapeBackdrop className="absolute inset-0 size-full" />
      )}

      {/*
        Gradien gelap menjamin kontras teks putih apa pun foto yang diunggah admin.
        Kepekatannya dihitung untuk kasus terburuk — foto yang seluruhnya putih.
        Di ketinggian tempat judul berada, lapisan slate-950 berada di sekitar 75%,
        sehingga latar efektifnya tetap gelap (≈70/255) dan rasio kontras terhadap
        teks putih tetap di atas 9:1. Alat pemeriksa kontras otomatis tidak bisa
        menilai teks di atas gambar, jadi angka ini dijamin lewat perhitungan,
        bukan lewat pengukuran satu foto tertentu.

        Ilustrasi lanskap tidak perlu selubung sepekat itu: warnanya kita sendiri
        yang menentukan, dan tidak ada satu pun yang terang. Kalau kepekatan foto
        dipakai apa adanya, ilustrasinya justru tidak terlihat — jadi lapisannya
        diringankan, cukup untuk menenangkan bagian bawah tempat teks berada.

        Yang perlu dijaga hanya bagian bawah, dan di sana warna paling terang
        adalah hijau sawah #15803D: 5.02:1 terhadap teks putih bahkan **sebelum**
        lapisan gelap ditambahkan, dan lapisan itu hanya menaikkannya. Kuning
        matahari (1.67:1) berada di sepertiga atas, jauh dari teks mana pun.
      */}
      <div
        aria-hidden="true"
        className={
          imageUrl
            ? "absolute inset-0 bg-linear-to-t from-slate-950/95 via-slate-950/75 to-slate-950/35"
            : "absolute inset-0 bg-linear-to-t from-slate-950/75 via-slate-950/35 to-transparent"
        }
      />

      <Container className="relative pt-28 pb-16 md:pb-24">
        <p className="flex items-center gap-2 text-sm font-medium text-white/80">
          <MapPin className="size-4" aria-hidden="true" />
          Kalurahan Banjararum, Kapanewon Kalibawang, Kulon Progo
        </p>

        <h1 className="mt-3 max-w-3xl text-[2rem] leading-tight font-bold tracking-tight text-balance text-white md:text-5xl lg:text-6xl">
          {title}
        </h1>

        {description ? (
          <p className="mt-4 max-w-2xl text-lg text-white/90 text-pretty">{description}</p>
        ) : null}

        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/profil" size="lg">
            Kenali Padukuhan
            <ArrowRight className="size-5" aria-hidden="true" />
          </ButtonLink>
          <ButtonLink
            href="/peta"
            size="lg"
            variant="outline"
            className="border-white/40 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
          >
            Buka Peta Digital
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
