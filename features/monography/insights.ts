import type { PopulationStat } from "@/types/api";
import { toEmploymentItems } from "@/features/monography/employment";

/**
 * Angka turunan monografi — dihitung dari kolom yang ada, tidak disimpan.
 *
 * Setiap fungsi mengembalikan `null` kalau salah satu bahannya tidak didata.
 * Itu disengaja: rata-rata jiwa per keluarga dari `familyCount` yang kosong
 * bukan nol, melainkan angka yang memang tidak bisa dihitung, dan kartunya
 * disembunyikan alih-alih menampilkan "0".
 *
 * Bebas React supaya bisa dipakai beranda dan halaman monografi sekaligus.
 */

export interface ShareItem {
  label: string;
  value: number;
}

function sum(values: (number | null | undefined)[]): number | null {
  const filled = values.filter((value): value is number => typeof value === "number");
  return filled.length === 0 ? null : filled.reduce((total, value) => total + value, 0);
}

/**
 * Pendidikan diringkas menjadi empat jenjang. Delapan irisan dalam satu batang
 * tidak lagi terbedakan warnanya; rinciannya tetap ada di grafik batang di bawah.
 * Jenjang yang seluruh kolomnya tidak didata dibuang, bukan diisi 0.
 */
export function educationBands(stat: PopulationStat): ShareItem[] {
  const bands = [
    { label: "Belum/tidak sekolah", value: sum([stat.educationNoSchool]) },
    {
      label: "Dasar (SD–SLTP)",
      value: sum([stat.educationSD, stat.educationSLTP]),
    },
    { label: "Menengah (SLTA)", value: sum([stat.educationSLTA]) },
    {
      label: "Perguruan tinggi",
      value: sum([stat.educationD1_D3, stat.educationS1, stat.educationS2, stat.educationS3]),
    },
  ];
  return bands.filter((band): band is ShareItem => band.value !== null);
}

/**
 * Agama untuk grafik donat: paling banyak empat irisan bernama, sisanya dilipat
 * ke "Lainnya". Lebih dari lima warna dalam satu donat tidak terbaca, dan
 * palet `chart-N` memang hanya lima.
 */
export function religionShares(stat: PopulationStat): ShareItem[] {
  const items = [
    { label: "Islam", value: stat.religionIslam },
    { label: "Kristen Protestan", value: stat.religionProtestant },
    { label: "Katolik", value: stat.religionCatholic },
    { label: "Hindu", value: stat.religionHindu },
    { label: "Buddha", value: stat.religionBuddha },
    { label: "Konghucu", value: stat.religionKonghucu },
  ].filter((item): item is ShareItem => typeof item.value === "number" && item.value > 0);

  // Urutan tetap mengikuti daftar di atas, bukan besarnya angka: warna mengikuti
  // agamanya, jadi "Islam" tidak berganti warna ketika tahun lain dipilih.
  const named = [...items].sort((a, b) => b.value - a.value).slice(0, 4);
  const kept = items.filter((item) => named.includes(item));
  const folded = sum([
    ...items.filter((item) => !named.includes(item)).map((item) => item.value),
    stat.religionOther,
  ]);

  return folded ? [...kept, { label: "Lainnya", value: folded }] : kept;
}

export interface Insight {
  label: string;
  value: string;
  hint: string;
}

const decimal = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 });

/** Empat angka "sekilas" yang tidak tertulis langsung di data mana pun. */
export function monographyInsights(stat: PopulationStat): Insight[] {
  const insights: Insight[] = [];

  if (stat.familyCount) {
    insights.push({
      label: "Rata-rata anggota keluarga",
      value: `${decimal.format(stat.totalPopulation / stat.familyCount)} jiwa`,
      hint: "Jumlah penduduk dibagi jumlah keluarga",
    });
  }

  if (stat.femaleCount > 0) {
    insights.push({
      label: "Rasio jenis kelamin",
      value: decimal.format((stat.maleCount / stat.femaleCount) * 100),
      hint: "Laki-laki per 100 perempuan",
    });
  }

  const bands = educationBands(stat);
  const educated = bands.find((band) => band.label === "Perguruan tinggi");
  const bandTotal = sum(bands.map((band) => band.value));
  if (educated && bandTotal) {
    insights.push({
      label: "Lulusan perguruan tinggi",
      value: `${decimal.format((educated.value / bandTotal) * 100)}%`,
      hint: "Dari warga yang pendidikannya terdata",
    });
  }

  const employment = toEmploymentItems(stat.employmentData).filter(
    (item): item is ShareItem => typeof item.value === "number" && item.value > 0,
  );
  const top = [...employment].sort((a, b) => b.value - a.value)[0];
  if (top) {
    insights.push({
      label: "Pekerjaan terbanyak",
      value: top.label,
      hint: `${new Intl.NumberFormat("id-ID").format(top.value)} warga`,
    });
  }

  return insights;
}
