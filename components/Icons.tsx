type P = { size?: number; className?: string };
const base = (size = 18) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
});

export const ArrowIcon = ({ size, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M4 12h15M13 6l6 6-6 6" />
  </svg>
);
export const BagIcon = ({ size, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M5 8h14l-1.2 12H6.2L5 8Z" />
    <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
  </svg>
);
export const InstagramIcon = ({ size, className }: P) => (
  <svg {...base(size)} className={className}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.3" cy="6.7" r=".6" fill="currentColor" />
  </svg>
);
const promise: Record<string, React.ReactNode> = {
  hand: <path d="M8 13V6.5a1.5 1.5 0 0 1 3 0V12m0-6.5V5a1.5 1.5 0 0 1 3 0v7m0-5.5a1.5 1.5 0 0 1 3 0V14a7 7 0 0 1-7 7h-.5A6.5 6.5 0 0 1 4 16l-1-3.5a1.5 1.5 0 0 1 2.7-1.2L8 14" />,
  spark: <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Zm6 12 .8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8L18 15Z" />,
  box: <path d="M3.5 8.5 12 4l8.5 4.5v7L12 20l-8.5-4.5v-7Zm0 0L12 13l8.5-4.5M12 13v7" />,
  return: <path d="M9 14 4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3" />,
};
export const PromiseIcon = ({ name, className }: { name: string; className?: string }) => (
  <svg {...base(34)} strokeWidth={1} className={className}>
    {promise[name]}
  </svg>
);
