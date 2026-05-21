import type { ReactElement } from "react";

export type BrandCompany =
  | "anthropic"
  | "openai"
  | "google"
  | "bytedance"
  | "kuaishou"
  | "elevenlabs";

export function BrandLogo({
  company,
  className,
}: {
  company: BrandCompany;
  className?: string;
}): ReactElement {
  const svgProps = {
    "aria-hidden": true as const,
    className,
    width: "1em",
    height: "1em",
    viewBox: "0 0 24 24",
    fill: "currentColor",
  };

  switch (company) {
    case "anthropic":
      // Angular "A" / starburst with triangular rays
      return (
        <svg {...svgProps}>
          <polygon points="12,2 14.5,9 22,9 16,13.5 18.5,21 12,16.5 5.5,21 8,13.5 2,9 9.5,9" />
        </svg>
      );

    case "openai":
      // Six-petal knot / hexafoil rosette
      return (
        <svg {...svgProps}>
          <path d="M12 2.5a3 3 0 0 1 2.6 1.5l1.4 2.42 2.8-.02a3 3 0 0 1 2.6 4.5l-1.4 2.42 1.4 2.42a3 3 0 0 1-2.6 4.5l-2.8-.02-1.4 2.42a3 3 0 0 1-5.2 0L7.8 18.3l-2.8.02a3 3 0 0 1-2.6-4.5L3.8 11.4 2.4 8.98a3 3 0 0 1 2.6-4.5l2.8.02L9.4 2.08A3 3 0 0 1 12 2.5zm0 3.5L10.7 8.4 7.5 8.38 9 11l-1.5 2.62 3.2-.02 1.3 2.9 1.3-2.9 3.2.02L15 11l1.5-2.62-3.2.02L12 6z" />
        </svg>
      );

    case "google":
      // Gemini four-point spark / diamond star
      return (
        <svg {...svgProps} fill="none">
          <defs>
            <linearGradient id="gemini-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#4285F4" />
              <stop offset="100%" stopColor="#A142F4" />
            </linearGradient>
          </defs>
          <path
            d="M12 2C12 2 13.5 8.5 20 12C13.5 15.5 12 22 12 22C12 22 10.5 15.5 4 12C10.5 8.5 12 2 12 2Z"
            fill="url(#gemini-grad)"
          />
        </svg>
      );

    case "bytedance":
      // Stylised "d" — circle with ascending stem
      return (
        <svg {...svgProps}>
          <path d="M14 3h-4v7.5a3.5 3.5 0 1 0 4 0V3zm-2 13a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
        </svg>
      );

    case "kuaishou":
      // Stylised "K" — vertical bar + two diagonal arms
      return (
        <svg {...svgProps}>
          <rect x="5" y="3" width="3" height="18" rx="1.5" />
          <path d="M9.5 12 17 4.5a1.5 1.5 0 0 1 2.1 2.1L14 12l5.1 5.4a1.5 1.5 0 0 1-2.1 2.1L9.5 12z" />
        </svg>
      );

    case "elevenlabs":
      // Two vertical bars / "II" mark
      return (
        <svg {...svgProps}>
          <rect x="6" y="4" width="4" height="16" rx="2" />
          <rect x="14" y="4" width="4" height="16" rx="2" />
        </svg>
      );

    default: {
      // Exhaustive check — TypeScript ensures this is unreachable for valid BrandCompany values,
      // but we keep a runtime fallback for safety.
      const _: never = company;
      void _;
      return (
        <svg {...svgProps}>
          <circle cx="12" cy="12" r="9" fillOpacity="0.3" />
          <circle cx="12" cy="12" r="4" />
        </svg>
      );
    }
  }
}
