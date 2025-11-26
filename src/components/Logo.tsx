export default function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      fill="none"
      width={size}
      height={size}
    >
      <rect x="10" y="10" width="80" height="80" rx="20" fill="#0ea5e9" />
      <path d="M35 60 L50 35 L65 60" stroke="white" strokeWidth="8" strokeLinecap="round" />
    </svg>
  );
}
