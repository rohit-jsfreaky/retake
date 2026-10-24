---
doc: spec
status: approved
---

# Retake — Technical Spec

## How This Works, In Plain Language
Retake is one web page plus one small server function.

- **The page** (runs in your browser) holds your script, records your voice with the browser's built-in recorder, and
  draws the marked script.
- **The listener** is Deepgram, a speech-to-text service. We send it the recording; it sends back every word it heard,
  with the time each word started and ended and how sure it was (a number from 0 to 1).
- **The server function** sits between the page and Deepgram so the Deepgram key never reaches the browser. It only
  passes the audio through and returns Deepgram's words.
- **The comparer** is our own code in the page. It lines up the script words with the heard words — like a spell
  checker's "which letters changed", but for whole words — and finds what was missed, swapped, or added. Then it reads
  the timings to find long pauses and speed, and the "how sure" numbers to find unclear words.

Why this shape: one service, no database, no login. Everything that makes Retake *Retake* — the comparing and the
marks — is our code, small enough to test with plain examples.

## The Core Journey Through the System
PRD ref: `prd.md > The Core Journey`.

```
Script step ──paste──▶ lib/lines.ts splits into lines + words ──▶ saved to localStorage
Read step   ──Record/Stop──▶ MediaRecorder gives an audio blob (webm/opus in Chrome)
            ──POST blob──▶ /api/listen ──▶ Deepgram /v1/listen ──▶ words[{word,start,end,confidence}]
Review step ◀── lib/align.ts (script words vs heard words) ◀── lib/marks.ts (missed, unclear, fillers,
                added, pauses, speed, Ready) ──▶ MarkedLine × N on screen, results saved to localStorage
Retake line ──record that line──▶ same /api/listen ──▶ align against THAT line only ──▶ replaces line in take 2
Compare     ──▶ take 1 line vs take 2 line; play = take 1 audio from the line's first word start to last word end,
                or the retake clip
Sample      ──▶ public/sample/sample.json (real Deepgram responses + audio) ──▶ same align + marks code, no API call
```

## Stack
Agent recommendation, accepted when this spec is approved:
- **Next.js (App Router) + TypeScript + Tailwind CSS**, created with the official `npx create-next-app@latest`
  (`--ts --tailwind --eslint --app --use-npm --disable-git`). Learner already ships Next.js; the API route keeps the
  key server-side. Docs: https://nextjs.org/docs
- **Deepgram pre-recorded API over plain `fetch`** — no SDK, one call. Docs:
  https://developers.deepgram.com/docs/pre-recorded-audio
- **Browser `MediaRecorder`** for recording — built in, no library. Docs:
  https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder
- **Tests: Node's built-in test runner** (`node --test`). Node 22.20 on this laptop runs `.ts` test files directly
  (type stripping is on by default from Node 22.18) — no test library needed. Docs: https://nodejs.org/api/test.html
- **Fonts via `next/font/google`**: Geist (UI), Atkinson Hyperlegible Next (the script text), Geist Mono (timings).
- **Icons: Untitled UI icons**, monochrome (`@untitledui/icons` — verify the package name and licence on npm in slice 1).

## Where It Runs and How Someone Tries It
- Local: `npm install`, put `DEEPGRAM_API_KEY=...` in `.env.local`, `npm run dev`, open http://localhost:3000.
  Chrome, laptop mic.
- Online (chosen — judges should try it without cloning): Vercel, deployed by the learner's own push to `main` through
  Vercel's GitHub integration. The learner adds `DEEPGRAM_API_KEY` in the Vercel project settings.
- Anyone can open the sample with no mic and no key cost.
- Required anyway: public GitHub repo + 1–3 minute demo video (recorded by the learner, with Retake on screen).
- Tests: `npm test` → `node --test lib/*.test.ts`.

## Look and Feel
Carries `prd.md > Look and Feel`. Learner decision (24 Oct): build the core first with these as starting values; the
learner designs the final UI himself mid-build, once the core works. Agent recommendation for the starting values:
- **Light, calm, structured.** White page `#FFFFFF`, soft panel `#F5F7FA`, borders `#E4E7EC`, ink `#101828`,
  secondary text `#475467`.
- **One accent: deep ink-blue `#1F3A8A`** for the primary button and active step only. No gradients, no glow, no
  cream, no orange accent.
- **Mark colours are the only strong colours:** missed = red text + light red underline (`#D92D20` / `#FEE4E2`),
  unclear = amber underline (`#B54708` / `#FEF0C7`), fillers/added = grey chips (`#F2F4F7`, text `#344054`), pause =
  thin grey marker with seconds in Geist Mono, speed = small neutral badge.
- **Type:** script text in Atkinson Hyperlegible Next, large (about 22–26 px, line-height 1.6) — built for easy
  reading, which is the job. UI in Geist. Numbers and timings in Geist Mono.
- **Density:** spacious; the script column is centred and about 70 characters wide. Summary bar sticky on top in
  Review.
- **Copy tone:** plain, short, human. "Listening back…", "Heard: pro duck", "Ready to record". No tech words on screen.
- **Icons:** Untitled UI, one line weight, monochrome, on neutral tiles.

## Components

### Page shell and steps — `app/page.tsx`
Holds the session state and which step is showing (Script → Read → Review). Loads/saves through `lib/storage.ts`.
PRD ref: `prd.md > Screens and Layout`.

### Script step — `components/ScriptStep.tsx`
Headline (what + who), text box, live "N lines · N words", 600-word limit, Start and "Try the sample" buttons.
PRD ref: `prd.md > Script input`, `prd.md > States and Boundaries` (empty script).

### Recorder — `components/useRecorder.ts`
A React hook around `getUserMedia` + `MediaRecorder`: start, stop → `Blob`, elapsed time, mic-blocked error. Used by
the Read step and by line retakes.
PRD ref: `prd.md > Recording a take`, `prd.md > States and Boundaries` (mic blocked).

### Read step — `components/ReadStep.tsx`
Script in large type, Record/Stop, timer, "Listening back…" while the request runs.
PRD ref: `prd.md > Recording a take`.

### Listen API route — `app/api/listen/route.ts`
`POST` with the raw audio body and its `Content-Type`. Rejects empty bodies and bodies over 5 MB. Forwards to
Deepgram (see **External Services**) and returns `{ words }` (Deepgram's `results.channels[0].alternatives[0].words`)
or `{ error }` with a status code.
PRD ref: `prd.md > Recording a take`, `prd.md > Retake a line`.

### Listen client — `lib/listen.ts`
`listen(blob): Promise<HeardWord[]>` — posts to `/api/listen`, throws a typed error for network/service failure.

### Lines — `lib/lines.ts`
`splitScript(text): Line[]` — blank lines and sentence ends (`.` `?` `!`) start a new line. Each line keeps its
display text and its normalised word list. `normalise(word)`: lowercase, strip punctuation and hyphens, keep
apostrophes.
Plain numbers in the script ("3", "200", "$200") are spelled out as words in the word list ("three", "two
hundred") because Deepgram returns spoken numbers as words when `smart_format` is off; the display text keeps the
digits. Years ("2026" said "twenty twenty six") may still show as missed — accepted for the POC.
PRD ref: `prd.md > Script input`.

### Aligner — `lib/align.ts`
`align(scriptWords: string[], heard: HeardWord[]): Step[]` — word-level edit distance (Levenshtein) with a backtrace.
Each step is `match` (same word), `swap` (script word ↔ different heard word), `missed` (script word, nothing heard) or
`added` (heard word not in script). Pure function, no imports.
PRD ref: `prd.md > The marked script`. Tests: `lib/align.test.ts`.

### Marker — `lib/marks.ts`
`markLine(line, steps): LineResult` and `isReady(lines): ReadyStatus`. Rules (starting values, tuned in the build):
- **Missed (red):** `missed` or `swap` steps; a swap stores what was heard.
- **Unclear (amber):** `match` with confidence `< 0.65` (Deepgram's docs suggest ~0.65 as a reliable error cut-off).
- **Filler:** `added` words in `FILLERS` = Deepgram's filler set (`uh`, `um`, `mhmm`, `mm-mm`, `uh-uh`, `uh-huh`,
  `nuh-uh`) plus our phrases `basically`, `actually`, `like`, `you know`, `so basically`, `matlab` — only when not in
  the script.
- **Added:** every other `added` word.
- **Long pause:** gap between two heard words `≥ 1.2 s`, where the earlier script word does not end a sentence.
- **Speed:** heard words ÷ (last end − first start) × 60. "Too fast" above 165 wpm, "too slow" below 110 wpm.
- **Ready:** no missed, no fillers, no long pauses, overall speed inside the band. Unclear words are shown but don't
  block Ready.
PRD ref: `prd.md > The marked script`, `prd.md > Ready check`. Tests: `lib/marks.test.ts`.

### Review step — `components/ReviewStep.tsx`
Sticky summary bar (counts + Ready status), legend, "Take 1 / Compare" switch, list of `MarkedLine`.
PRD ref: `prd.md > The marked script`, `prd.md > Ready check`.

### Marked line — `components/MarkedLine.tsx`
Renders one line: words with mark styles, filler/added chips and pause markers in place, tooltip "Heard: ___" /
"Not heard", speed badge, Play, "Retake line" (records with `useRecorder`, aligns against this line only, stores in
take 2).
PRD ref: `prd.md > Retake a line`.

### Compare view — `components/CompareView.tsx`
Two columns per line (take 1 | take 2), "same as take 1" for lines not retaken, Play on each side.
Line playback: one shared `<audio>`; take 1 seeks to the line's first heard word `start − 0.15 s` and stops at the
last word `end + 0.25 s`; a retake plays its own clip.
PRD ref: `prd.md > Compare takes`.

### Storage — `lib/storage.ts`
`load()` / `save(session)` with `localStorage` key `retake:v1`, wrapped in try/catch (works without it).
PRD ref: `prd.md > States and Boundaries` (what persists).

### Sample — `public/sample/sample.json` + dev-only export
The sample is a real session of the learner's voice: script, Deepgram's raw `words` for take 1 and for each retaken
line, and the audio as base64 data URLs. The app runs the same aligner + marker on it at load, so the sample is the
real pipeline, not a picture. Made in dev with an "Export session as sample" button shown only when
`process.env.NODE_ENV === 'development'`. Labelled "Sample" in the UI.
PRD ref: `prd.md > Sample mode`.

## Data Model
All in the browser. No database.

```ts
type HeardWord = { word: string; start: number; end: number; confidence: number; punctuated_word?: string }
type Line = { index: number; text: string; words: string[]; endsSentence: boolean[] }
type WordMark = { script: string; kind: 'ok' | 'missed' | 'unclear'; heard?: string; start?: number; end?: number }
type Insert = { afterWord: number; text: string; kind: 'filler' | 'added' }
type Pause = { afterWord: number; seconds: number }
type LineResult = { words: WordMark[]; inserts: Insert[]; pauses: Pause[]; wpm: number | null; heard: HeardWord[] }
type Session = {
  script: string
  lines: Line[]
  take1: LineResult[] | null
  take2: Record<number, LineResult>   // only retaken lines; latest retake wins
  sample: boolean
}
```
- **Script, lines, results** — live in React state in `app/page.tsx`, saved to `localStorage` after every change,
  loaded on open. Survive a reload.
- **Audio** — object URLs in memory only (take 1 blob, one blob per retaken line). Gone on reload; play buttons turn
  off with a note. Sample audio comes from `sample.json` and always plays.
- Take 1's heard words are split across lines by the alignment: whole-script alignment first, then each step is
  assigned to the line of its script word (added words go with the line they fall inside).

## File Structure
```
retake/
├── app/
│   ├── layout.tsx            # fonts (next/font), page title + description
│   ├── page.tsx              # session state + Script → Read → Review steps
│   ├── globals.css           # Tailwind + colour tokens from Look and Feel
│   └── api/listen/route.ts   # POST audio → Deepgram → { words }
├── components/
│   ├── ScriptStep.tsx
│   ├── ReadStep.tsx
│   ├── ReviewStep.tsx        # summary bar, legend, Take 1 / Compare switch
│   ├── MarkedLine.tsx        # one line: marks, chips, pauses, speed, play, retake
│   ├── CompareView.tsx
│   └── useRecorder.ts        # mic + MediaRecorder hook
├── lib/
│   ├── lines.ts              # split script into lines + normalised words
│   ├── align.ts              # word alignment (pure)
│   ├── marks.ts              # marks, thresholds, Ready check (pure)
│   ├── listen.ts             # client call to /api/listen
│   ├── storage.ts            # localStorage load/save
│   ├── align.test.ts         # node --test
│   └── marks.test.ts         # node --test
├── public/sample/sample.json # real sample session (words + audio)
├── devpost/                  # Devpost learning workspace
├── .env.example              # DEEPGRAM_API_KEY=
├── LICENSE                   # MIT
├── README.md
└── package.json              # "test": "node --test lib/*.test.ts"
```
`lib/*.ts` files import each other with relative `.ts` paths (needs `"allowImportingTsExtensions": true` in
`tsconfig.json`, fine with Next's `noEmit`) so `node --test` runs them without a build step.

## External Services and Dependencies

### Deepgram — pre-recorded transcription
- **Call:** `POST https://api.deepgram.com/v1/listen?model=nova-3&language=en&filler_words=true`
  - Headers: `Authorization: Token $DEEPGRAM_API_KEY`, `Content-Type: <the blob's mime type, e.g. audio/webm>`
  - Body: the raw audio bytes.
- **Response (used part):** `results.channels[0].alternatives[0].words[]` →
  `{ word, start, end, confidence, punctuated_word }` (seconds; confidence 0–1).
- **Options deliberately NOT used:** `smart_format` (would turn spoken words into formatted numbers/dates and break
  word-by-word comparing) and **keyterm prompting with the script** (it would bias the listener toward the right words
  — the opposite of what Retake must measure).
- **Verified on Deepgram's official docs (24 Oct 2026):** the endpoint, `model=nova-3`, `Token` auth, the `words`
  array shape (pre-recorded getting started); `filler_words` exists for pre-recorded English Nova-3, returns `uh`,
  `um`, `mhmm`, `mm-mm`, `uh-uh`, `uh-huh`, `nuh-uh`, and without it "uh"/"um" are stripped (filler words page);
  per-word confidence is calibrated and ~0.65 is a good error cut-off (word confidence page).
- **Checked 24 Oct 2026 (slice 1):** the Supported Audio Formats page lists WebM and Opus (and advises testing new
  sources — confirmed by a real Chrome webm/opus call, see `evidence/`); the Smart Format page shows that without
  `smart_format` numbers come back as words ("thirty three grams").
- **Cost (checked 24 Oct 2026):** deepgram.com/pricing lists a free $200 credit, no credit card, then pay-as-you-go;
  Nova-3 Monolingual shows $0.0048/min (current price, regular $0.0077/min). The learner's new account shows $200.00
  credit on the console dashboard.
- **Key:** `DEEPGRAM_API_KEY`, learner creates it in the Deepgram console; only in `.env.local` and Vercel settings.
- Docs: https://developers.deepgram.com/docs/pre-recorded-audio ·
  https://developers.deepgram.com/docs/filler-words · https://developers.deepgram.com/docs/confidence

### Vercel — hosting
Free Hobby plan; Next.js API route runs as a function. Check the function request-body size limit (expected a few MB;
a 4-minute opus recording is about 1 MB). Docs: https://vercel.com/docs/functions/limitations

## Important Failure Modes
- **Mic blocked or no mic** → message on how to allow it + "Try the sample instead".
- **Deepgram or network fails** → "Couldn't check this take. Your recording is kept — try again." The blob stays in
  memory and Try again re-sends it.
- **Silent / nothing heard** (empty `words`) → "We didn't hear anything — check your mic and try again."
- **Public API route gets abused and burns credit** → 5 MB body cap on the route; the sample never calls the API, so
  judges can always see the product.

## What Was Simplified and Why
- **Pre-recorded API** instead of live streaming — the marks need the full take anyway; one request, easy to retry.
  Live would need websockets.
- **localStorage for script + results, audio in memory** instead of saving audio — enough to prove the loop; saving
  audio would need IndexedDB.
- **Sentences as lines** instead of letting users mark lines by hand — automatic and matches how people read.
- **Fixed thresholds** instead of per-speaker calibration — starting values from Deepgram's docs and common speaking
  pace, tuned on real takes.
- **No SDK** — one `fetch` call is smaller than a dependency.

## Decisions and Open Issues
- **Learner decisions (stated earlier):** one web app, no login, Deepgram as the listener, online on Vercel, sample
  mode from the learner's real takes, the learner does all git and records the video himself.
- **Agent recommendations (accepted on approval):** Next.js + Tailwind via create-next-app, plain fetch instead of the
  SDK, Node's built-in test runner, the fonts/colours in Look and Feel, the threshold starting values.
- **Learning unknown — word alignment.** The learner wants to understand how a script is lined up against heard words.
  Clarified as: edit distance on words — build a table of "cheapest way to turn the script into what was heard" with
  keep / swap / delete / add steps, then walk back through it. Checked in the build by `lib/align.test.ts` with small
  hand-made cases (one swapped word, one missing word, one added "um", a repeated word).
- **Open (can wait for the build):**
  - Thresholds (0.65 unclear, 1.2 s pause, 110–165 wpm) — tune on the learner's first real takes.
  - Does Deepgram's English model catch "matlab"? Check on a real take; if not, it is simply not marked.
  - Compound words ("everyday" vs "every day") will show as a swap — accept for the POC unless it shows up often.
  - If `create-next-app` refuses the non-empty folder (skill pack, devpost/), scaffold into a temp folder and move the
    files in, merging `.gitignore`.
