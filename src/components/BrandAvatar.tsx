import type { FC } from 'react';

export const BrandAvatar: FC = () => (
  <span
    className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-sky-500"
    aria-hidden="true"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      className="h-6 w-6"
      role="img"
      aria-label="Engine IA logo"
    >
      <rect x="12" y="12" width="76" height="76" rx="18" fill="#0ea5e9" />
      <path
        d="M35 60 L50 35 L65 60"
        stroke="white"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  </span>
);
