import { cn } from "@/lib/utils";

/**
 * Kartu: latar `surface`, satu garis tepi, bayangan yang nyaris tak terlihat.
 *
 * Yang membentuk kedalaman di portal ini **garis tepi, bukan bayangan**
 * (`design-idea.md` §19–§20) — bayangan tebal membuat halaman yang penuh kartu
 * terlihat berantakan, dan di mode gelap ia praktis tidak terbaca sama sekali.
 *
 * `interactive` untuk kartu yang seluruhnya bisa diketuk: tepinya menghijau dan
 * kartunya terangkat satu piksel. Satu piksel, bukan lebih — §22 meminta
 * microinteraction yang ringan, dan kisi kartu yang melompat saat kursor lewat
 * justru mengganggu. Gerakannya berhenti sendiri di bawah
 * `prefers-reduced-motion` lewat aturan global di `globals.css`.
 */
export function Card({
  className,
  interactive = false,
  ...props
}: React.ComponentProps<"div"> & { interactive?: boolean }) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-surface shadow-sm",
        interactive &&
          "transition-[transform,border-color,box-shadow] duration-150 ease-out hover:-translate-y-px hover:border-primary-border-hover hover:shadow-md",
        className,
      )}
      {...props}
    />
  );
}

export function CardBody({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("p-4 md:p-6", className)} {...props} />;
}
