import Link from "next/link";
import type { ReactNode } from "react";
import { Columns03, Edit05, File06, Home02, Microphone01, PlayCircle, SearchMd } from "@untitledui/icons";

export type Step = "script" | "read" | "review";
export type View = "take1" | "take2" | "compare";

// The app window: title bar, sidebar, work area. The landing page renders the same frame with the sample.
export function AppFrame({ title, sidebar, children, className = "" }: { title: string; sidebar: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col overflow-hidden rounded-[20px] bg-white shadow-[var(--shadow-float)] ${className}`}>
      <div className="flex shrink-0 items-center gap-2 border-b border-line px-4 py-3">
        <span className="flex gap-1.5">
          <i className="size-3 rounded-full bg-[#FF5F57]" />
          <i className="size-3 rounded-full bg-[#FEBC2E]" />
          <i className="size-3 rounded-full bg-[#28C840]" />
        </span>
        <span className="mx-auto rounded-md bg-panel px-3 py-0.5 text-xs text-subtle">{title}</span>
        <span className="w-[52px]" />
      </div>
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        {sidebar}
        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

function Item({ icon, children, active, onClick, disabled }: { icon?: ReactNode; children: ReactNode; active?: boolean; onClick?: () => void; disabled?: boolean }) {
  const look = `flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-2 py-1.5 text-left text-[13px] md:w-full ${active ? "bg-panel font-medium" : ""} ${
    disabled ? "text-subtle opacity-50" : onClick ? "hover:bg-panel" : ""
  }`;
  return onClick ? (
    <button type="button" className={look} onClick={onClick} disabled={disabled}>
      {icon}
      {children}
    </button>
  ) : (
    <p className={look}>
      {icon}
      {children}
    </p>
  );
}

const Heading = ({ children }: { children: ReactNode }) => <p className="mb-1 mt-4 hidden px-2 text-xs font-semibold text-subtle md:block">{children}</p>;

export function AppSidebar({
  step,
  view,
  canRead,
  canReview,
  takeSeconds,
  retakes,
  sample,
  onNew,
  onStep,
  onView,
  onSample,
}: {
  step: Step;
  view?: View;
  canRead: boolean;
  canReview: boolean;
  takeSeconds?: number;
  retakes: number;
  sample?: boolean;
  // Without handlers the sidebar is a static picture (landing page).
  onNew?: () => void;
  onStep?: (s: Step) => void;
  onView?: (v: View) => void;
  onSample?: () => void;
}) {
  const go = (s: Step) => (onStep ? () => onStep(s) : undefined);
  const see = (v: View) => (onView ? () => onView(v) : undefined);
  const clock = takeSeconds === undefined ? "" : ` · ${Math.floor(takeSeconds / 60)}:${String(Math.round(takeSeconds) % 60).padStart(2, "0")}`;
  return (
    // On a phone the sidebar becomes one scrolling row above the work area.
    <aside className="flex shrink-0 gap-1 overflow-x-auto border-b border-line bg-[#FAFAFA] p-2 md:w-[200px] md:flex-col md:gap-0 md:overflow-visible md:border-b-0 md:border-r md:p-3">
      <Item icon={<Edit05 size={14} />} onClick={onNew}>
        New script
      </Item>
      <Heading>Steps</Heading>
      <Item icon={<File06 size={14} />} active={step === "script"} onClick={go("script")}>
        Script
      </Item>
      <Item icon={<Microphone01 size={14} />} active={step === "read"} onClick={go("read")} disabled={!canRead}>
        Read
      </Item>
      <Item icon={<SearchMd size={14} />} active={step === "review"} onClick={go("review")} disabled={!canReview}>
        Review
      </Item>
      {canReview && (
        <>
          <Heading>Takes</Heading>
          <Item active={step === "review" && view === "take1"} onClick={see("take1")}>
            Take 1{clock}
          </Item>
          {retakes > 0 && (
            <>
              <Item active={step === "review" && view === "take2"} onClick={see("take2")}>
                Take 2 · {retakes} {retakes === 1 ? "line" : "lines"}
              </Item>
              <Item icon={<Columns03 size={14} />} active={step === "review" && view === "compare"} onClick={see("compare")}>
                Compare
              </Item>
            </>
          )}
        </>
      )}
      <div className="flex gap-1 md:mt-auto md:flex-col">
        {sample ? (
          <p className="shrink-0 whitespace-nowrap rounded-lg bg-card-yellow px-2 py-1.5 text-xs md:mx-2 md:mb-2 md:whitespace-normal">Sample · the maker&apos;s own voice</p>
        ) : (
          onSample && (
            <Item icon={<PlayCircle size={14} />} onClick={onSample}>
              Try the sample
            </Item>
          )
        )}
        {onNew && (
          <Link href="/" className="flex shrink-0 items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] text-muted hover:bg-panel">
            <Home02 size={14} /> Home
          </Link>
        )}
      </div>
    </aside>
  );
}

export const STEP_NAME: Record<Step, string> = { script: "Script", read: "Read", review: "Review" };
export const VIEW_NAME: Record<View, string> = { take1: "Take 1", take2: "Take 2", compare: "Compare" };
