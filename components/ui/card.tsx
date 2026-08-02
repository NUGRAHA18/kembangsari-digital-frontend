import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-surface shadow-sm",
        className,
      )}
      {...props}
    />
  );
}

export function CardBody({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("p-4 md:p-6", className)} {...props} />;
}

/**
 * Kartu yang seluruh permukaannya bisa diketuk. Tautan aslinya diberi
 * `after:absolute inset-0` supaya area sentuhnya selebar kartu, tapi teks
 * tautannya tetap yang dibaca pembaca layar.
 */
export function CardLinkOverlay({ className, ...props }: React.ComponentProps<"span">) {
  return <span className={cn("absolute inset-0", className)} aria-hidden="true" {...props} />;
}
