type LocationIconProps = {
  location: string;
  className?: string;
};

function AsoRockIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className={className}>
      <path d="M5 39h38L30 21l-6-11-6 11L5 39Z" fill="currentColor" opacity=".18" />
      <path d="M8 37h32L29 21l-5-9-5 9L8 37Z" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M14 37h20M19 30h10M21 25h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function LagoonIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className={className}>
      <path d="M7 34c6-5 11 4 17-1 6-5 10 3 17-2" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M7 40c6-5 11 4 17-1 6-5 10 3 17-2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity=".65" />
      <path d="M15 29V14l7-6 7 6v15M18 29V18h8v11M13 29h20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M19 14h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function KanoWallIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className={className}>
      <path d="M6 39h36M9 39V21l6-4 6 4v18M27 39V18l6-5 6 5v21" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M9 26h12M27 25h12M9 31h12M27 30h12" stroke="currentColor" strokeWidth="2" opacity=".65" />
      <path d="M15 21v-7M33 18v-7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function DefaultLocationIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className={className}>
      <path d="M24 42s13-12 13-23a13 13 0 1 0-26 0c0 11 13 23 13 23Z" fill="currentColor" opacity=".14" />
      <circle cx="24" cy="19" r="5" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <path d="M24 32V27" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function LocationIcon({ location, className = "h-5 w-5" }: LocationIconProps) {
  const value = location.toLowerCase();

  if (value.includes("abuja")) return <AsoRockIcon className={className} />;
  if (value.includes("lagos")) return <LagoonIcon className={className} />;
  if (value.includes("kano")) return <KanoWallIcon className={className} />;

  return <DefaultLocationIcon className={className} />;
}
