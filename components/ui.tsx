import type { ButtonHTMLAttributes, ReactNode } from "react";

// The app's buttons, matching the landing page: black pill, frosted glass pill, quiet text pill.
const PILL = {
  dark: "bg-accent text-white hover:bg-accent-hover shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.1)]",
  glass: "glass-pill hover:bg-white/70",
  ghost: "text-muted hover:bg-black/5 hover:text-foreground",
  danger: "bg-[#D92D20] text-white hover:bg-[#B42318]",
};
const SIZE = { md: "h-12 px-7 text-base", sm: "h-9 px-4 text-sm" };

export function Pill({
  variant = "dark",
  size = "md",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof PILL; size?: keyof typeof SIZE }) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors disabled:pointer-events-none disabled:opacity-40 ${PILL[variant]} ${SIZE[size]} ${className}`}
      {...props}
    />
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-[28px] bg-white shadow-[var(--shadow-float)] ${className}`}>{children}</div>;
}

const STEPS = ["Script", "Read", "Review"] as const;

export function StepHeader({ step, title, sub }: { step: (typeof STEPS)[number]; title: ReactNode; sub?: ReactNode }) {
  return (
    <header className="flex flex-col items-center text-center">
      <ol className="flex items-center gap-1 rounded-full bg-white/80 p-1 text-sm shadow-[var(--shadow-float)]">
        {STEPS.map((s, i) => (
          <li
            key={s}
            aria-current={s === step ? "step" : undefined}
            className={`rounded-full px-4 py-1.5 ${s === step ? "bg-accent font-medium text-white" : "text-muted"}`}
          >
            <span className="font-mono text-xs opacity-60">0{i + 1}</span> {s}
          </li>
        ))}
      </ol>
      <h1 className="mt-8 max-w-[760px] font-serif text-[40px] leading-[1.1] tracking-[-0.02em] sm:text-[54px]">{title}</h1>
      {sub && <p className="mt-4 max-w-[560px] text-lg leading-[1.4] tracking-[-0.02em] text-muted">{sub}</p>}
    </header>
  );
}

// The desktop-window frame used for the script and the marked takes.
export function AppWindow({ title, children, right, className = "" }: { title: string; children: ReactNode; right?: ReactNode; className?: string }) {
  return (
    <div className={`rounded-[28px] bg-panel p-3 shadow-[var(--shadow-float)] ${className}`}>
      <div className="flex items-center gap-3 px-2 pb-3 pt-1">
        <span className="flex gap-1.5">
          <i className="size-3 rounded-full bg-black/10" />
          <i className="size-3 rounded-full bg-black/10" />
          <i className="size-3 rounded-full bg-black/10" />
        </span>
        <span className="mx-auto rounded-lg bg-black/5 px-3 py-1 text-[13px]">{title}</span>
        <span className="flex min-w-12 justify-end">{right}</span>
      </div>
      <div className="rounded-2xl bg-white">{children}</div>
    </div>
  );
}
