import { cn } from "@/lib/utils";

type Tone = "primary" | "secondary" | "neutral";

const TONES: Record<Tone, string> = {
  primary: "bg-primary-soft text-primary-soft-foreground",
  secondary: "bg-secondary-soft text-secondary-soft-foreground",
  neutral: "bg-surface-muted text-muted",
};

export function Badge({
  tone = "primary",
  className,
  ...props
}: React.ComponentProps<"span"> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-sm font-medium",
        TONES[tone],
        className,
      )}
      {...props}
    />
  );
}
