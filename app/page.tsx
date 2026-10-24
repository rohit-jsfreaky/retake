import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import cloud from "@/public/landing/cloud.png";
import collage from "@/public/landing/hero-collage.png";
import useDemo from "@/public/landing/use-demo.png";
import useInterview from "@/public/landing/use-interview.png";
import usePodcast from "@/public/landing/use-podcast.png";
import useSales from "@/public/landing/use-sales.png";
import useTalk from "@/public/landing/use-talk.png";
import useTeam from "@/public/landing/use-team.png";
import {
  AlertCircle,
  Briefcase01,
  CheckCircle,
  Clock,
  Edit05,
  Globe01,
  Lock01,
  Microphone01,
  Phone01,
  PlayCircle,
  PresentationChart01,
  RefreshCw01,
  VideoRecorder,
  VolumeMax,
  Zap,
} from "@untitledui/icons";
import { MarkedLine } from "@/components/MarkedLine";
import { Logo, Nav, PRACTISE, SAMPLE } from "@/components/landing/Nav";
import { Reveal } from "@/components/landing/Reveal";
import {
  clock,
  lines,
  markedLines,
  missedExample,
  retakenLine,
  status1,
  status2,
  take1,
  take2,
  takeSeconds,
  unclearExample,
} from "@/components/landing/sample-data";
import { countWords } from "@/lib/lines";
import { speedLabel } from "@/lib/marks";

function GlassButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="glass-pill inline-flex h-12 items-center rounded-full px-8 text-base font-medium hover:bg-white/70">
      {children}
    </Link>
  );
}

function DarkButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="inline-flex h-12 items-center rounded-full bg-accent px-8 text-base font-medium text-white hover:bg-accent-hover">
      {children}
    </Link>
  );
}

// A desktop-app window frame, the way the product is shown throughout the page.
function AppWindow({ title, children, tint = "#F5F5F7", inner = "#FFFFFF", className = "" }: { title: string; children: ReactNode; tint?: string; inner?: string; className?: string }) {
  return (
    <div className={`rounded-3xl p-4 shadow-[var(--shadow-float)] ${className}`} style={{ background: tint }}>
      <div className="mb-3 flex items-center gap-3 px-1">
        <span className="flex gap-1.5">
          <i className="size-3 rounded-full bg-black/10" />
          <i className="size-3 rounded-full bg-black/10" />
          <i className="size-3 rounded-full bg-black/10" />
        </span>
        <span className="mx-auto rounded-lg bg-black/5 px-3 py-1 text-[13px]">{title}</span>
        <span className="w-12" />
      </div>
      <div className="rounded-xl px-6 py-2" style={{ background: inner }}>
        {children}
      </div>
    </div>
  );
}

function FeatureCard({ id, tint, eyebrow, title, text, cta, side, children }: { id?: string; tint: string; eyebrow: string; title: ReactNode; text: string; cta: ReactNode; side: ReactNode; children?: ReactNode }) {
  return (
    <section id={id} className="mx-auto w-full max-w-[1080px] scroll-mt-28 px-4">
      <Reveal>
        <div className="paper grid gap-12 rounded-[32px] p-8 shadow-[var(--shadow-float)] md:p-12 lg:grid-cols-[368px_1fr]" style={{ background: tint }}>
          <div>
            <h4 className="font-medium tracking-[0.01em] text-muted">{eyebrow}</h4>
            <h3 className="mt-4 font-serif text-[36px] leading-[1.22] tracking-[-0.03em]">{title}</h3>
            <p className="mt-6 text-base leading-[1.4] tracking-[-0.02em] text-muted">{text}</p>
            <div className="mt-8">{cta}</div>
            {children}
          </div>
          <div>{side}</div>
        </div>
      </Reveal>
    </section>
  );
}

function Tile({ icon, title, children, className = "" }: { icon: ReactNode; title: string; children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-white/90 p-6 ${className}`}>
      <div className="flex items-center gap-3 text-xl font-medium tracking-[-0.02em]">
        {icon}
        {title}
      </div>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function Quote({ text, who, role, reverse = false }: { text: string; who: string; role: string; reverse?: boolean }) {
  return (
    <section className="mx-auto w-full max-w-[1000px] px-6 py-32">
      <Reveal>
        <div className={`flex flex-col gap-8 md:items-start ${reverse ? "md:flex-row-reverse" : "md:flex-row"}`}>
          <div className={`flex shrink-0 items-center gap-4 ${reverse ? "md:flex-row-reverse" : ""}`}>
            <span className="grid size-14 place-items-center rounded-full bg-card-yellow font-medium shadow-[var(--shadow-float)]">
              {who[0]}
            </span>
            <span className="text-xl tracking-[-0.03em] text-muted">
              {who}
              <span className="block text-sm">{role}</span>
            </span>
            <span className="hidden h-px w-32 bg-black/15 md:block" />
          </div>
          <blockquote className="font-serif text-[32px] italic leading-[1.5] tracking-[-0.04em]">&ldquo;{text}&rdquo;</blockquote>
        </div>
      </Reveal>
    </section>
  );
}

const USE_CASES = [
  { label: "Demo videos", lines: "Product walkthroughs, launch videos, hackathon demos", img: useDemo },
  { label: "Job interviews", lines: "Your self intro, project stories, why this role", img: useInterview },
  { label: "Sales calls", lines: "Openers, pitch lines, answers to hard questions", img: useSales },
  { label: "Presentations", lines: "Talk intros, slide notes, closing lines", img: useTalk },
  { label: "Podcasts", lines: "Show intros, ad reads, guest questions", img: usePodcast },
  { label: "Team updates", lines: "Stand-up notes, weekly updates, all-hands lines", img: useTeam },
];

export default function Landing() {
  const speed2 = speedLabel(status2.wpm);
  return (
    <div className="flex flex-col">
      <Nav />

      <main className="flex flex-col">
        {/* Hero */}
        <section className="px-5 pt-5">
          <div className="paper relative overflow-hidden rounded-3xl bg-[linear-gradient(in_oklab,var(--sky-from),var(--sky-to))] shadow-[var(--shadow-float)]">
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-b from-transparent to-white/30" />
            <div className="relative z-10 flex flex-col items-center px-6 pt-44 text-center">
              <Reveal>
                <h1 className="max-w-[760px] font-serif text-[44px] leading-none tracking-[-0.03em] sm:text-[66px]">
                  Hear what a listener would miss, before you hit record
                </h1>
              </Reveal>
              <Reveal delay={0.1} className="mt-10">
                <GlassButton href={PRACTISE}>Try Retake Free</GlassButton>
              </Reveal>
            </div>
            <Image src={cloud} alt="" priority className="pointer-events-none absolute -left-28 top-48 w-[420px] opacity-90" />
            <Image src={cloud} alt="" priority className="pointer-events-none absolute -right-24 top-24 w-[340px] -scale-x-100 opacity-90" />
            <Image src={collage} alt="" priority className="pointer-events-none absolute -bottom-[88px] left-1/2 w-[1700px] max-w-none -translate-x-1/2" />
            <Reveal delay={0.2} className="relative z-10 mx-auto mt-24 w-full max-w-[880px] px-4">
              <div className="overflow-hidden rounded-t-[20px] bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.08)]">
                <div className="flex items-center gap-2 border-b border-line px-4 py-3">
                  <span className="flex gap-1.5">
                    <i className="size-3 rounded-full bg-[#FF5F57]" />
                    <i className="size-3 rounded-full bg-[#FEBC2E]" />
                    <i className="size-3 rounded-full bg-[#28C840]" />
                  </span>
                  <span className="mx-auto rounded-md bg-panel px-3 py-0.5 text-xs text-subtle">Review · Take 1</span>
                </div>
                <div className="grid grid-cols-[180px_1fr] text-left">
                  <aside className="hidden border-r border-line bg-[#FAFAFA] p-4 text-[13px] sm:block">
                    <p className="flex items-center gap-2 py-1"><Edit05 size={14} /> New script</p>
                    <p className="mt-3 text-xs font-semibold text-subtle">Steps</p>
                    <p className="py-1">Script</p>
                    <p className="py-1">Read</p>
                    <p className="-mx-2 rounded-md bg-panel px-2 py-1 font-medium">Review</p>
                    <p className="mt-3 text-xs font-semibold text-subtle">Takes</p>
                    <p className="py-1">Take 1 · {clock(takeSeconds)}</p>
                    <p className="py-1">Take 2 · {Object.keys(take2).length} lines</p>
                  </aside>
                  <div className="px-6 pb-2 pt-4">
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-[#FEE4E2] px-2.5 py-1 text-[#B42318]">{status1.missed} missed</span>
                      <span className="rounded-full bg-[#FEF0C7] px-2.5 py-1 text-[#B54708]">{status1.unclear} unclear</span>
                      <span className="rounded-full bg-panel px-2.5 py-1">{status1.added} added</span>
                      <span className="rounded-full bg-panel px-2.5 py-1 font-mono">{status1.wpm} wpm</span>
                    </div>
                    {markedLines.slice(0, 3).map((i) => (
                      <MarkedLine key={i} line={lines[i]} result={take1[i]} audioUrl={null} wholeClip={false} />
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* For your moments */}
        <section className="mx-auto w-full max-w-[1000px] px-6 pb-24 pt-40 text-center">
          <Reveal>
            <h3 className="font-serif text-[46px] leading-[1.22] tracking-[-0.03em]">
              Retake isn&apos;t just for one script,
              <br />
              it&apos;s for <em>your</em> moments.
            </h3>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mx-auto mt-16 grid max-w-[880px] grid-cols-2 gap-y-10 sm:grid-cols-5">
              {[
                [<VideoRecorder key="v" size={44} strokeWidth={1.5} />, "Demo videos"],
                [<Briefcase01 key="b" size={44} strokeWidth={1.5} />, "Interviews"],
                [<Phone01 key="p" size={44} strokeWidth={1.5} />, "Sales calls"],
                [<PresentationChart01 key="t" size={44} strokeWidth={1.5} />, "Talks"],
                [<Microphone01 key="m" size={44} strokeWidth={1.5} />, "Podcasts"],
              ].map(([icon, label]) => (
                <div key={label as string} className="flex flex-col items-center gap-4">
                  {icon}
                  <p className="font-medium tracking-[-0.02em]">{label}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        {/* How people use Retake */}
        <section id="who" className="scroll-mt-28 overflow-hidden pb-32 pt-24">
          <Reveal>
            <h2 className="text-center font-serif text-[54px] leading-[1.1] tracking-[-0.02em]">How people use Retake</h2>
          </Reveal>
          <div className="mt-16 flex w-max animate-marquee gap-[60px] hover:[animation-play-state:paused]">
            {[...USE_CASES, ...USE_CASES].map((c, i) => (
              <div key={i} className="w-[240px] text-center">
                <Image src={c.img} alt="" sizes="240px" className="h-[300px] w-[240px] rounded-3xl object-cover shadow-[var(--shadow-float)]" />
                <p className="mt-16 font-medium uppercase">{c.label}</p>
                <p className="mt-4 font-serif text-2xl italic leading-[1.2] tracking-[-0.03em]">{c.lines}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Listen */}
        <FeatureCard
          id="listen"
          tint="var(--card-blue)"
          eyebrow="LISTEN"
          title={<>From your first read<br />to words that land</>}
          text="Read your script once. Retake listens like a stranger would and marks every word that didn't come through — with what was heard instead."
          cta={<GlassButton href={SAMPLE}>See a real take</GlassButton>}
          side={
            <div className="relative">
              <AppWindow title="Your script" className="w-[86%]">
                <div className="py-4 font-read text-lg leading-relaxed text-muted">
                  {lines.slice(0, 3).map((l) => l.text).join(" ")}
                  <p className="mt-3 font-sans text-xs text-subtle">{lines.length} lines · {countWords(lines)} words</p>
                </div>
              </AppWindow>
              <AppWindow title="Take 1 · marked" tint="#FFDBC5" inner="#FFF3E7" className="relative -mt-16 ml-[14%]">
                {markedLines.slice(-2).map((i) => (
                  <MarkedLine key={i} line={lines[i]} result={take1[i]} audioUrl={null} wholeClip={false} />
                ))}
              </AppWindow>
            </div>
          }
        >
          <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-8 text-xl font-medium tracking-[-0.02em]">
            <p className="flex items-center gap-3"><AlertCircle size={32} strokeWidth={1.5} /> Missed words</p>
            <p className="flex items-center gap-3"><VolumeMax size={32} strokeWidth={1.5} /> Unclear words</p>
            <p className="flex items-center gap-3"><Microphone01 size={32} strokeWidth={1.5} /> Fillers</p>
            <p className="flex items-center gap-3"><Clock size={32} strokeWidth={1.5} /> Long pauses</p>
          </div>
        </FeatureCard>

        <Quote
          text="I record every hackathon demo myself, in English, which is my second language. I never know which words people won't catch."
          who="Rohit"
          role="Maker of Retake"
        />

        {/* Retake */}
        <FeatureCard
          tint="var(--card-green)"
          eyebrow="RETAKE"
          title="Fix only the lines that need it"
          text="Every marked line gets its own Retake button. Read just that line again; it replaces the old one, and the rest of your take stays as it was."
          cta={<GlassButton href={PRACTISE}>Start practising</GlassButton>}
          side={
            <div className="grid gap-5 sm:grid-cols-2">
              <Tile icon={<RefreshCw01 size={24} />} title="Take 1" className="sm:col-span-1">
                <div className="font-read">
                  <MarkedLine line={lines[retakenLine]} result={take1[retakenLine]} audioUrl={null} wholeClip={false} />
                </div>
              </Tile>
              <Tile icon={<CheckCircle size={24} />} title="Take 2">
                {take2[retakenLine] && <MarkedLine line={lines[retakenLine]} result={take2[retakenLine]} audioUrl={null} wholeClip />}
              </Tile>
              <Tile icon={<PlayCircle size={24} />} title="Hear any word" className="sm:col-span-2">
                <div className="grid grid-cols-2 gap-3">
                  {["Play the line", "Click a red word", "Compare takes", "Retake again"].map((t) => (
                    <span key={t} className="grid h-11 place-items-center rounded-[14px] bg-card-green text-sm font-medium">
                      {t}
                    </span>
                  ))}
                </div>
              </Tile>
            </div>
          }
        />

        {/* Facts row, in the place of an awards strip */}
        <section className="mx-auto grid w-full max-w-[1000px] grid-cols-2 gap-10 px-6 py-32 text-center md:grid-cols-4">
          {[
            [<Zap key="z" size={40} />, "Free", "No plans, no card"],
            [<Lock01 key="l" size={40} />, "No account", "Open it and start"],
            [<Globe01 key="g" size={40} />, "In your browser", "Chrome and your laptop mic"],
            [<CheckCircle key="c" size={40} />, "Private", "Script and marks stay with you"],
          ].map(([icon, title, sub]) => (
            <Reveal key={title as string}>
              <div className="flex flex-col items-center">
                <span className="grid size-[72px] place-items-center rounded-2xl bg-white shadow-[var(--shadow-float)]">{icon}</span>
                <p className="mt-6 text-lg font-medium tracking-[-0.02em]">{title}</p>
                <p className="mt-1 text-muted">{sub}</p>
              </div>
            </Reveal>
          ))}
        </section>

        {/* Ready */}
        <FeatureCard
          tint="var(--card-yellow)"
          eyebrow="GET READY"
          title="Practice that tells you when you're done"
          text="Speed for every line, long pauses marked where they happen, and one clear answer at the top: ready to record, or what is still left."
          cta={<GlassButton href={SAMPLE}>See the sample</GlassButton>}
          side={
            <div className="grid gap-5 sm:grid-cols-2">
              <Tile icon={<Zap size={28} />} title="Speed">
                <div className="rounded-[18px] bg-[#DBEDFE] p-5">
                  <p className="text-xl font-medium">Take 2</p>
                  <p className="font-mono text-2xl text-[#0087FF]">{status2.wpm} wpm</p>
                  <p className="text-xl text-subtle">{speed2 ?? "comfortable"}</p>
                </div>
              </Tile>
              <Tile icon={<CheckCircle size={28} />} title="Ready check">
                <p className="text-lg">{status2.ready ? "Ready to record" : "Not yet"}</p>
                <ul className="mt-3 space-y-2 text-muted">
                  <li>✓ {status2.missed} missed words</li>
                  <li>✓ {status2.fillers} fillers</li>
                  <li>{status2.pauses ? "•" : "✓"} {status2.pauses} long pauses</li>
                  <li>{speed2 ? "•" : "✓"} speed {speed2 ?? "in range"}</li>
                </ul>
              </Tile>
              <Tile icon={<Clock size={28} />} title="Pauses">
                <p className="font-read text-xl">
                  record my <span className="font-mono text-sm text-muted">‖ 1.5 s</span> demo video
                </p>
              </Tile>
              <Tile icon={<Lock01 size={28} />} title="Saved for you">
                <p className="text-muted">Your script and marks stay in this browser after a reload.</p>
              </Tile>
            </div>
          }
        />

        {/* Three steps, in the place of the three tinted cards */}
        <section id="how" className="mx-auto w-full max-w-[1080px] scroll-mt-28 px-4 py-40">
          <Reveal>
            <p className="text-center font-medium tracking-[0.01em] text-muted">HOW IT WORKS</p>
            <h2 className="mt-4 text-center font-serif text-[54px] leading-[1.1] tracking-[-0.02em]">
              From script to ready
              <br />
              in three steps
            </h2>
          </Reveal>
          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {[
              { tint: "var(--card-blue)", title: "Paste", sub: "The exact words you plan to say", body: <p className="font-read text-base text-muted">{lines[0].text} {lines[1].text}</p> },
              { tint: "#9ED4EF", title: "Read once", sub: "Out loud, the way you will on the day", body: <p className="flex items-center gap-3 text-sm"><span className="rounded-md bg-accent px-3 py-1.5 text-white">● Stop</span><span className="font-mono">{clock(takeSeconds)}</span></p> },
              { tint: "#C9EBCF", title: "Retake", sub: "Only the red lines, then compare", body: missedExample ? (
                <p className="font-read text-2xl">
                  <ruby className="[ruby-position:under]">
                    <span className="rounded bg-[#FEE4E2] px-1 text-[#D92D20] underline decoration-[#D92D20] decoration-2 underline-offset-4">{missedExample.script}</span>
                    <rt className="text-sm text-[#D92D20]">{missedExample.heard}</rt>
                  </ruby>{" "}
                  →{" "}
                  <span>{missedExample.script}</span>
                </p>
              ) : null },
            ].map((c, i) => (
              <Reveal key={c.title} delay={i * 0.08}>
                <div className="paper flex h-[380px] flex-col overflow-hidden rounded-3xl p-8 text-center shadow-[var(--shadow-float)]" style={{ background: c.tint }}>
                  <h3 className="font-serif text-[32px] tracking-[-0.03em]">{c.title}</h3>
                  <p className="mt-2 text-lg text-muted">{c.sub}</p>
                  <div className="mt-auto rounded-2xl bg-white p-5 text-left shadow-[var(--shadow-float)]">{c.body}</div>
                </div>
              </Reveal>
            ))}
          </div>
          {unclearExample && <span className="sr-only">Example of an unclear word: {unclearExample.script}</span>}
        </section>

        {/* CTA */}
        <section className="mx-auto w-full max-w-[1080px] px-4 pb-24">
          <Reveal>
            <div className="paper flex flex-col gap-8 overflow-hidden rounded-[32px] bg-card-green p-12 shadow-[var(--shadow-float)] md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-serif text-[56px] italic leading-[1.1] tracking-[-0.03em]">Let&apos;s get started</h2>
                <p className="mt-4 font-serif text-[36px] leading-[1.1] tracking-[-0.04em] text-muted">Free. No sign-up needed.</p>
              </div>
              <div className="flex flex-col gap-4 md:items-end">
                <GlassButton href={PRACTISE}>Start practising</GlassButton>
                <DarkButton href={SAMPLE}>See a real take</DarkButton>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="px-4 pb-4">
        <div className="rounded-3xl bg-accent px-6 py-12 text-white md:px-28">
          <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
            {[
              ["PRODUCT", [["How it works", "#how"], ["Features", "#listen"], ["Sample", SAMPLE], ["Start practising", PRACTISE]]],
              ["MADE FOR", [["Demo videos", "#who"], ["Job interviews", "#who"], ["Sales calls", "#who"], ["Podcasts", "#who"]]],
              ["PROJECT", [["Build With AI: Basics", "#"], ["Open source · MIT", "#"]]],
            ].map(([head, links]) => (
              <div key={head as string}>
                <p className="border-b border-white/15 pb-4 font-semibold">{head as string}</p>
                <ul className="mt-6 space-y-2 text-[15px] text-white/80">
                  {(links as string[][]).map(([t, h]) => (
                    <li key={t}><Link href={h} className="hover:text-white">{t}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="md:text-right">
              <Logo className="text-[28px]" />
            </div>
          </div>
          <div className="mt-16 border-t border-white/15 pt-6 text-[15px] text-white/80">© 2026 Retake · made by Rohit Kashyap</div>
        </div>
      </footer>
    </div>
  );
}
