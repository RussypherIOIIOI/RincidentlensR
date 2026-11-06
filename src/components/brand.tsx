import type { ReactNode } from 'react';

/*
 * TMC outline icon set (24px grid, 1.5px stroke, currentColor), copied from the
 * TMC brand package `svg/icons/`. Every use here sits beside a text label, so
 * icons are decorative and hidden from assistive technology.
 */
const paths = {
  record: (
    <>
      <rect x="4" y="3.5" width="16" height="17" rx="2" />
      <path d="M8 3.5v17M11 8h6M11 12h6M11 16h4" />
    </>
  ),
  action: (
    <>
      <circle cx="5.5" cy="6" r="2" />
      <circle cx="5.5" cy="18" r="2" />
      <circle cx="18.5" cy="12" r="2.5" />
      <path d="M7.5 6.5c4 .5 6 2.5 8.6 4.6M7.5 17.5c4-.5 6-2.5 8.6-4.6" />
    </>
  ),
  trust: (
    <>
      <path d="M12 3l7 3v5c0 4.6-3 8.2-7 10-4-1.8-7-5.4-7-10V6z" />
      <path d="M9 12l2.2 2.2L15.5 10" />
    </>
  ),
  insight: (
    <>
      <path d="M4 4v16h16" />
      <path d="M7.5 15l3.5-4 3 2.5 5-6" />
      <circle cx="19" cy="7.5" r="1" />
    </>
  ),
  orbit: (
    <>
      <circle cx="12" cy="12" r="4" />
      <ellipse cx="12" cy="12" rx="9.5" ry="4" transform="rotate(-24 12 12)" />
      <circle cx="19.6" cy="7.2" r="1.3" />
    </>
  ),
  pipeline: (
    <>
      <rect x="3" y="9" width="5" height="6" rx="1" />
      <rect x="10" y="9" width="5" height="6" rx="1" />
      <rect x="17" y="9" width="4" height="6" rx="1" />
      <path d="M8 12h2M15 12h2" />
    </>
  ),
  reconcile: <path d="M4 8h13l-3-3M20 16H7l3 3" />,
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="10" rx="2" />
      <path d="M8 10.5V8a4 4 0 018 0v2.5" />
      <circle cx="12" cy="15.5" r="1.2" />
    </>
  ),
  document: (
    <>
      <path d="M6 3h8l4 4v14H6z" />
      <path d="M14 3v4h4M9 12h6M9 15.5h6" />
    </>
  ),
  signal: (
    <>
      <circle cx="6" cy="6" r="1.4" />
      <circle cx="12" cy="6" r="1.4" />
      <circle cx="18" cy="6" r="1.4" />
      <circle cx="6" cy="12" r="1.4" />
      <circle cx="12" cy="12" r="1.4" />
      <circle cx="6" cy="18" r="1.4" />
    </>
  ),
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof paths;

export function Icon({ name, size = 24 }: { name: IconName; size?: 16 | 20 | 24 | 32 | 48 }) {
  return (
    <svg
      className="icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {paths[name]}
    </svg>
  );
}

/** TMC compact mark: the brand's mark for sizes under 48px. Never recolored. */
export function CompactMark({ size = 32 }: { size?: number }) {
  return (
    <img
      className="compact-mark"
      src="/brand/tmc-mark-compact-dark.svg"
      width={size}
      height={size}
      alt=""
      aria-hidden="true"
    />
  );
}
