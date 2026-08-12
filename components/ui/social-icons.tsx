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

/**
 * Google — satu-satunya di berkas ini yang memakai warna aslinya, bukan
 * `currentColor`.
 *
 * Pedoman merek Google menuntut logo empat warna di atas latar putih atau
 * abu-abu terang pada tombol "Masuk dengan Google", dan tombol itu adalah
 * satu-satunya tempat ikon ini dipakai. Keempat warnanya karena itu ditulis
 * langsung dan tidak mengikuti token tema — sama alasannya dengan lembar QR
 * yang dipatok hitam-putih: yang menentukan bukan selera, melainkan syarat
 * dari luar.
 */
export function GoogleIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="#4285F4"
        d="M23.5 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.87c2.27-2.09 3.56-5.17 3.56-8.87z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.08 7.94-2.91l-3.87-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.95H1.27v3.09A12 12 0 0 0 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58V6.62H1.27a12 12 0 0 0 0 10.76l4-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.27 6.62l4 3.09C6.22 6.87 8.87 4.75 12 4.75z"
      />
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
