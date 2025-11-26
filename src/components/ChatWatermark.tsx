import type { FC } from 'react';

export const ChatWatermark: FC = () => (
  <div
    aria-hidden="true"
    className="pointer-events-none absolute inset-0 flex items-center justify-center"
  >
    <div className="flex h-[180px] w-[180px] items-center justify-center opacity-[var(--watermark-opacity)] transition-opacity duration-200 ease-in-out">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        fill="none"
        className="h-full w-full"
      >
        <rect x="10" y="10" width="80" height="80" rx="20" fill="#0ea5e9" />
        <path d="M35 60 L50 35 L65 60" stroke="white" strokeWidth="8" strokeLinecap="round" />
      </svg>
    </div>
  </div>
);
