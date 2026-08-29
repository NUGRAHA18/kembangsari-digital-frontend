import { Field, inputClasses } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import type { MapIconGroup } from "@/types/api";

/**
 * Pemilih ikon peta, dipakai bersama form kategori dan form titik lokasi.
 *
 * **Pilihannya harus datang dari `GET /maps/icon`, bukan diketik.** Sejak
 * katalognya divalidasi backend, nama di luar daftar dijawab `400` — dan input
 * teks bebas yang dulu dipakai membuat pengelola baru tahu ikonnya salah
 * setelah menekan simpan, setelah seluruh form diisi.
 *
 * Sengaja `<select>` biasa, bukan kisi ikon yang bisa diklik: form dashboard
 * ini tetap harus terkirim tanpa JavaScript, dan `<optgroup>` sudah cukup
 * mengelompokkan katalognya. Bentuk respons backend memang sudah sesuai
 * susunan itu.
 *
 * Bebas hook, jadi ia ikut apa adanya baik ke form klien maupun — nanti — ke
 * form server biasa.
 */
export function IconSelect({
  groups,
  defaultValue,
  emptyLabel,
  label = "Ikon",
  hint,
  id = "icon",
  name = "icon",
}: {
  groups: MapIconGroup[];
  defaultValue?: string | null;
  /** Teks pilihan kosong — artinya berbeda di kategori dan di titik lokasi. */
  emptyLabel: string;
  label?: string;
  hint?: string;
  id?: string;
  name?: string;
}) {
  const current = defaultValue ?? "";

  // Nilai yang sudah tersimpan tetapi tidak ada di katalog tidak boleh hilang
  // diam-diam: `<select>` yang tidak menemukan `defaultValue` akan jatuh ke
  // pilihan pertama, dan menekan simpan menuliskan pilihan itu tanpa seorang
  // pun memilihnya. Ikon lama diberi tempatnya sendiri, dengan keterangan.
  const isKnown = groups.some((group) => group.icons.some((icon) => icon.name === current));

  return (
    <Field label={label} htmlFor={id} hint={hint}>
      <select
        id={id}
        name={name}
        defaultValue={current}
        className={cn(inputClasses, "appearance-none")}
      >
        <option value="">{emptyLabel}</option>

        {current && !isKnown ? (
          <optgroup label="Tersimpan sebelumnya">
            <option value={current}>{current} — tidak ada di katalog</option>
          </optgroup>
        ) : null}

        {groups.map((group) => (
          <optgroup key={group.group} label={group.group}>
            {group.icons.map((icon) => (
              <option key={icon.name} value={icon.name}>
                {icon.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </Field>
  );
}
