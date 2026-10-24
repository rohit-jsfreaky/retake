import Link from "next/link";

export const PRACTISE = "/practice";
export const SAMPLE = "/practice?sample";

export function Logo({ className = "" }: { className?: string }) {
  return <span className={`font-logo text-[22px] leading-none tracking-[-0.02em] ${className}`}>RETAKE</span>;
}

export function Nav() {
  return (
    <header className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <nav className="flex h-[52px] w-full max-w-[920px] items-center gap-6 rounded-full bg-white/80 pl-5 pr-1.5 shadow-[var(--shadow-float)] backdrop-blur-xl">
        <Link href="/" aria-label="Retake home">
          <Logo />
        </Link>
        <div className="mx-auto hidden items-center gap-4 text-base md:flex">
          <Link href="/#how" className="hover:opacity-60">How it works</Link>
          <Link href="/#listen" className="hover:opacity-60">Features</Link>
          <Link href="/#who" className="hover:opacity-60">Who it&apos;s for</Link>
          {/* Plain <a>: a full load, so ?sample opens even when already on /practice. */}
          <a href={SAMPLE} className="hover:opacity-60">Sample</a>
        </div>
        <div className="ml-auto flex items-center gap-3 md:ml-0">
          {/* Plain <a>: a full load, so ?sample opens even when already on /practice. */}
          <a href={SAMPLE} className="hidden text-base hover:opacity-60 sm:block">
            See a take
          </a>
          <Link
            href={PRACTISE}
            className="rounded-full bg-accent px-3.5 py-2 text-base font-medium text-white shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.1)] hover:bg-accent-hover"
          >
            Try Retake Free
          </Link>
        </div>
      </nav>
    </header>
  );
}
