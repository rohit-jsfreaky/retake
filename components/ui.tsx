import type { ButtonHTMLAttributes, ReactNode } from "react";

// The app's buttons, matching the landing page: black pill, frosted glass pill, quiet text pill.
const PILL = {
  dark: "bg-accent text-white hover:bg-accent-hover shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.1)]",
  glass: "glass-pill hover:bg-white/70",
  ghost: "text-muted hover:bg-black/5 hover:text-foreground",
  danger: "bg-[#D92D20] text-white hover:bg-[#B42318]",
};
const SIZE = { md: "h-11 px-6 text-[15px]", sm: "h-8 px-3 text-sm" };

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

// The heading at the top of each step's work area.
export function PaneHeader({ title, sub, children }: { title: string; sub?: string; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="min-w-0 flex-1">
        <h1 className="font-serif text-[32px] leading-tight tracking-[-0.02em]">{title}</h1>
        {sub && <p className="mt-1 text-muted">{sub}</p>}
      </div>
      {children}
    </div>
  );
}
