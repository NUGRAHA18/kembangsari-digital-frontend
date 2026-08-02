/**
 * Ikon media sosial.
 *
 * lucide-react sudah menghapus seluruh ikon merek dari paketnya, jadi ketiganya
 * digambar sendiri di sini dengan konvensi yang sama seperti ikon Lucide lain
 * (viewBox 24, garis 2px, ujung membulat) supaya tidak terlihat menempel dari
 * himpunan ikon yang berbeda.
 */

type IconProps = React.SVGProps<SVGSVGElement>;

function base(props: IconProps) {
  return {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    ...props,
  };
}

export function InstagramIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function FacebookIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <path d="M15.5 7.5H14a2.5 2.5 0 0 0-2.5 2.5v9.5" />
      <path d="M9.5 13h5" />
    </svg>
  );
}

export function YoutubeIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="2" y="5" width="20" height="14" rx="4" />
      <path d="M10.5 9.5v5l4.5-2.5z" fill="currentColor" />
    </svg>
  );
}

export function WhatsappIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 21l1.7-4.2A8.5 8.5 0 1 1 7.9 20L3 21z" />
      <path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.4-2-1-.8.8a4.7 4.7 0 0 1-2.1-2.1l.8-.8-1-2L9 9.5z" />
    </svg>
  );
}
