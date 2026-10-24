import Image from 'next/image';

export function AppLogo({ className }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-lg shadow-sm border border-border/50 shrink-0 ${className || 'h-7 w-7'}`}>
      <Image
        src="/icons/icon-192x192.png"
        alt="AI Retro Studio"
        width={32}
        height={32}
        className="h-full w-full object-cover"
        priority
      />
    </div>
  );
}
