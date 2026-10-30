// Icone SVG inline, dai tracciati del design. Tutte decorative (aria-hidden).
import type { SVGProps } from "react";

type IconProps = { size?: number; sw?: number } & Omit<SVGProps<SVGSVGElement>, "width" | "height">;

function Svg({ size = 18, sw = 1.7, children, ...rest }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

/** Marchio di Nest (uovo nel nido). */
export function LogoMark({ size = 30, dot = "var(--ink)" }: { size?: number; dot?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <circle cx="16" cy="12.5" r="5.75" fill={dot} />
      <path d="M5.5 15.5a10.5 10.5 0 0 0 21 0" fill="none" stroke="var(--ink)" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

export const IconCheck = (p: IconProps) => (
  <Svg sw={3} size={12} {...p}>
    <path d="M5 12.5l4.2 4.2L19 7" />
  </Svg>
);
export const IconDoc = (p: IconProps) => (
  <Svg {...p}>
    <path d="M7 3h7l5 5v13H7z" />
    <path d="M14 3v5h5" />
    <path d="M10 13h6M10 17h4" />
  </Svg>
);
export const IconFile = (p: IconProps) => (
  <Svg {...p}>
    <path d="M7 3h7l5 5v13H7z" />
    <path d="M14 3v5h5" />
  </Svg>
);
export const IconCalendar = (p: IconProps) => (
  <Svg {...p}>
    <rect x="4" y="5" width="16" height="15" rx="3" />
    <path d="M8 3v4M16 3v4M4 10h16" />
  </Svg>
);
export const IconCalendarPlus = (p: IconProps) => (
  <Svg {...p}>
    <rect x="4" y="5" width="16" height="15" rx="3" />
    <path d="M8 3v4M16 3v4M4 10h16M12 13v4M10 15h4" />
  </Svg>
);
export const IconLock = (p: IconProps) => (
  <Svg sw={1.8} size={16} {...p}>
    <rect x="5" y="10" width="14" height="10" rx="3" />
    <path d="M8 10V7.5a4 4 0 0 1 8 0V10" />
  </Svg>
);
export const IconPeople = (p: IconProps) => (
  <Svg size={16} {...p}>
    <circle cx="9" cy="8.5" r="3.2" />
    <circle cx="16.5" cy="9.5" r="2.6" />
    <path d="M3.5 19c.8-3.2 3-5 5.5-5s4.7 1.8 5.5 5" />
    <path d="M15 14.2c2.4-.3 4.6 1.2 5.5 4.3" />
  </Svg>
);
export const IconBell = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z" />
    <path d="M10 20.5a2 2 0 0 0 4 0" />
  </Svg>
);
export const IconPath = (p: IconProps) => (
  <Svg sw={1.8} {...p}>
    <circle cx="12" cy="12" r="8" />
    <path d="M12 4a8 8 0 0 1 8 8" />
  </Svg>
);
export const IconFlask = (p: IconProps) => (
  <Svg {...p}>
    <path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-9V3" />
    <path d="M7.5 15h9" />
  </Svg>
);
export const IconFolder = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 7a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
  </Svg>
);
export const IconChat = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-8l-4.5 3.5V17H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" />
  </Svg>
);
export const IconUpload = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 16V5M7.5 9.5L12 5l4.5 4.5" />
    <path d="M5 15v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" />
  </Svg>
);
export const IconDownload = (p: IconProps) => (
  <Svg sw={1.8} {...p}>
    <path d="M12 5v11M7.5 11.5L12 16l4.5-4.5" />
    <path d="M5 19h14" />
  </Svg>
);
export const IconShield = (p: IconProps) => (
  <Svg sw={1.6} size={20} {...p}>
    <path d="M12 3l7 3v5.5c0 4.4-3 8-7 9.5-4-1.5-7-5.1-7-9.5V6z" />
    <path d="M9 12l2.2 2.2L15.5 10" />
  </Svg>
);
export const IconSwap = (p: IconProps) => (
  <Svg sw={1.8} size={16} {...p}>
    <path d="M7 7h11l-3-3M17 17H6l3 3" />
  </Svg>
);
export const IconPlus = (p: IconProps) => (
  <Svg sw={1.8} size={16} {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);
export const IconClose = (p: IconProps) => (
  <Svg sw={1.8} size={16} {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Svg>
);
export const IconReset = (p: IconProps) => (
  <Svg sw={1.8} size={16} {...p}>
    <path d="M4 12a8 8 0 1 0 2.4-5.7" />
    <path d="M4 4v4h4" />
  </Svg>
);
export const IconChevronLeft = (p: IconProps) => (
  <Svg sw={2} size={16} {...p}>
    <path d="M15 6l-6 6 6 6" />
  </Svg>
);
export const IconChevronRight = (p: IconProps) => (
  <Svg sw={2} size={16} {...p}>
    <path d="M9 6l6 6-6 6" />
  </Svg>
);
export const IconChevronDown = (p: IconProps) => (
  <Svg sw={2} size={14} {...p}>
    <path d="M6 9l6 6 6-6" />
  </Svg>
);
export const IconArrowDown = (p: IconProps) => (
  <Svg sw={2} size={16} {...p}>
    <path d="M12 5v14M6 13l6 6 6-6" />
  </Svg>
);
export const IconArrowRight = (p: IconProps) => (
  <Svg sw={2} {...p}>
    <path d="M5 12h13M13 6l6 6-6 6" />
  </Svg>
);
export const IconGrid = (p: IconProps) => (
  <Svg {...p}>
    <rect x="4" y="4" width="7" height="7" rx="2" />
    <rect x="13" y="4" width="7" height="7" rx="2" />
    <rect x="4" y="13" width="7" height="7" rx="2" />
    <rect x="13" y="13" width="7" height="7" rx="2" />
  </Svg>
);
export const IconUser = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="8.5" r="3.5" />
    <path d="M5 20c1-3.6 3.8-5.5 7-5.5s6 1.9 7 5.5" />
  </Svg>
);
export const IconStethoscope = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 3v6a4 4 0 0 0 8 0V3" />
    <path d="M10 13v2a5 5 0 0 0 10 0v-2" />
    <circle cx="20" cy="11" r="2" />
  </Svg>
);
export const IconLogout = (p: IconProps) => (
  <Svg {...p}>
    <path d="M10 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4" />
    <path d="M15 16l4-4-4-4M19 12H9" />
  </Svg>
);
export const IconTrash = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 7h16M10 11v6M14 11v6" />
    <path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" />
    <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </Svg>
);
export const IconMail = (p: IconProps) => (
  <Svg sw={1.6} size={20} {...p}>
    <rect x="3" y="5" width="18" height="14" rx="3" />
    <path d="M4 7l8 6 8-6" />
  </Svg>
);
export const IconDots = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
    <circle cx="5" cy="12" r="1.8" />
    <circle cx="12" cy="12" r="1.8" />
    <circle cx="19" cy="12" r="1.8" />
  </svg>
);
