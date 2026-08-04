/**
 * Pemformatan untuk pembaca Indonesia.
 *
 * Semua tanggal dari API bertipe `string` ISO 8601, bukan `Date`. Zona waktu
 * dikunci ke Asia/Jakarta supaya hasil render di server dan di browser identik —
 * kalau dibiarkan mengikuti zona perangkat, React akan melaporkan hydration mismatch.
 */

const TIME_ZONE = "Asia/Jakarta";
const LOCALE = "id-ID";

function toDate(value: string | Date): Date | null {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Contoh: "4 Agustus 2026" */
export function formatDate(value: string | Date): string {
  const date = toDate(value);
  if (!date) return "-";
  return new Intl.DateTimeFormat(LOCALE, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: TIME_ZONE,
  }).format(date);
}

/** Contoh: "4 Agu 2026" — untuk metadata kartu yang ruangnya sempit. */
export function formatDateShort(value: string | Date): string {
  const date = toDate(value);
  if (!date) return "-";
  return new Intl.DateTimeFormat(LOCALE, {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: TIME_ZONE,
  }).format(date);
}

/** Contoh: "07.00" */
export function formatTime(value: string | Date): string {
  const date = toDate(value);
  if (!date) return "-";
  return new Intl.DateTimeFormat(LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TIME_ZONE,
  }).format(date);
}

/** Bagian tanggal terpisah, untuk badge kalender pada kartu agenda. */
export function getDateParts(value: string | Date): { day: string; month: string; year: string } {
  const date = toDate(value);
  if (!date) return { day: "-", month: "-", year: "-" };

  const parts = new Intl.DateTimeFormat(LOCALE, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: TIME_ZONE,
  }).formatToParts(date);

  const find = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "-";

  return { day: find("day"), month: find("month"), year: find("year") };
}

function isSameDay(a: Date, b: Date): boolean {
  const key = (date: Date) =>
    new Intl.DateTimeFormat("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: TIME_ZONE,
    }).format(date);
  return key(a) === key(b);
}

/**
 * Rentang waktu kegiatan.
 * Sehari      : "4 Agustus 2026, 07.00–11.00 WIB"
 * Beda hari   : "4 Agustus 2026, 07.00 WIB – 6 Agustus 2026, 11.00 WIB"
 * Tanpa akhir : "4 Agustus 2026, 07.00 WIB"
 */
export function formatDateRange(start: string | Date, end?: string | Date | null): string {
  const startDate = toDate(start);
  if (!startDate) return "-";

  const startLabel = `${formatDate(startDate)}, ${formatTime(startDate)}`;
  const endDate = end ? toDate(end) : null;

  if (!endDate) return `${startLabel} WIB`;

  if (isSameDay(startDate, endDate)) {
    return `${startLabel}–${formatTime(endDate)} WIB`;
  }

  return `${startLabel} WIB – ${formatDate(endDate)}, ${formatTime(endDate)} WIB`;
}

/**
 * ISO string → nilai untuk `<input type="datetime-local">`, dibaca sebagai WIB.
 *
 * Input itu tidak mengenal zona waktu sama sekali: ia hanya menampilkan dan
 * mengembalikan "2026-08-24T13:00". Karena itu konversinya dikunci ke
 * Asia/Jakarta di kedua arah, bukan dibiarkan mengikuti zona server — di
 * produksi backend berjalan di UTC, dan tanpa penguncian ini setiap jadwal
 * akan bergeser tujuh jam begitu disimpan.
 */
export function toDateTimeLocal(value: string | Date): string {
  const date = toDate(value);
  if (!date) return "";

  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: TIME_ZONE,
  }).formatToParts(date);

  const find = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${find("year")}-${find("month")}-${find("day")}T${find("hour")}:${find("minute")}`;
}

/**
 * Kebalikannya: nilai `datetime-local` → ISO string beserta offset WIB.
 *
 * Offsetnya ditulis tetap `+07:00` karena Indonesia bagian barat tidak
 * mengenal daylight saving, sehingga tidak ada tanggal yang perlu dikecualikan.
 * Mengembalikan `null` kalau bentuknya tidak dikenali.
 */
export function fromDateTimeLocal(value: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null;

  const iso = `${value}:00+07:00`;
  return Number.isNaN(new Date(iso).getTime()) ? null : iso;
}

/**
 * Pasangan yang sama untuk `<input type="date">`, dipakai tanggal kegiatan KKN
 * yang memang tidak punya jam.
 *
 * Penguncian ke WIB tetap diperlukan meski jamnya dibuang: yang tersimpan di
 * backend tetap sebuah momen. Tanpa itu, tanggal yang diketik "4 Agustus" bisa
 * terbaca kembali sebagai 3 Agustus saat formulirnya dibuka lagi — `formatDate`
 * membacanya sebagai WIB, jadi konversinya harus memakai zona yang sama.
 */
export function toDateInput(value: string | Date): string {
  const date = toDate(value);
  if (!date) return "";

  // en-CA memberi bentuk "2026-08-04" apa adanya, persis yang diminta input date.
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: TIME_ZONE,
  }).format(date);
}

/** Kebalikannya: "2026-08-04" → tengah malam WIB pada tanggal itu. */
export function fromDateInput(value: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;

  const iso = `${value}T00:00:00+07:00`;
  return Number.isNaN(new Date(iso).getTime()) ? null : iso;
}

/** Contoh: 1234 → "1.234" */
export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
  return new Intl.NumberFormat(LOCALE).format(value);
}

/** Persentase dengan satu angka desimal, untuk grafik monografi. */
export function formatPercent(part: number, total: number): string {
  if (!total) return "0%";
  return `${new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 1 }).format(
    (part / total) * 100,
  )}%`;
}

/** Memotong teks panjang untuk ringkasan kartu, tanpa memotong di tengah kata. */
export function excerpt(text: string, maxLength = 140): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) return clean;
  const cut = clean.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : maxLength)}…`;
}

/**
 * Membuang penanda Markdown agar isi bisa dipakai sebagai ringkasan
 * atau meta description tanpa memperlihatkan tanda `#` dan `**`.
 */
export function stripMarkdown(text: string): string {
  return text
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_`~>]/g, "")
    .replace(/^\s*[-+]\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Tautan WhatsApp. Backend menyimpan nomor dalam format internasional tanpa
 * tanda plus (contoh "6281234567890"), tapi data lama bisa saja memakai "08...".
 */
export function whatsappLink(number: string, message?: string): string {
  let normalized = number.replace(/[^\d]/g, "");
  if (normalized.startsWith("0")) normalized = `62${normalized.slice(1)}`;
  const query = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${normalized}${query}`;
}

/** Tautan navigasi ke Google Maps — tetap tersedia meski peta memakai OpenStreetMap. */
export function googleMapsDirectionsLink(latitude: number, longitude: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
}

export function telLink(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

/** Label kategori dari enum backend (SCREAMING_SNAKE_CASE) menjadi teks yang layak dibaca. */
export function humanizeEnum(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
