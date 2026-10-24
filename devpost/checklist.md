---
doc: checklist
status: approved
---

# Build Checklist

Build mode: fast (learner's choice, 24 Oct). Learner does all git: at the end of each slice the agent stops, hands a
one-line commit message, and waits for "next".

## Slices

- [x] **1. Read your script and see what the listener heard**
  Becomes usable: Paste a script, press Record, read, press Stop — the page shows the words Deepgram heard, with times and confidence. Plain UI.
  Why now: The listener is the biggest risk (does Deepgram take Chrome's webm, what do words look like). Proving it first means every later slice builds on real data. Scaffold lives here.
  PRD ref: `prd.md > The Core Journey` (steps 1–4), `prd.md > Recording a take`
  Spec ref: `spec.md > Stack`, `spec.md > Components` (Recorder, Read step, Listen API route, Listen client), `spec.md > External Services and Dependencies` (Deepgram), `spec.md > File Structure`
  Build: `create-next-app` with `--disable-git` (temp folder + move if the folder is refused), `useRecorder`, `/api/listen` (5 MB cap, empty-body reject, key server-side), `lib/listen.ts`, a plain Script → Read page that lists heard words, `.env.example`, MIT `LICENSE`, `"test"` script.
  Verify (mechanical): `npm run build` passes; one real Chrome webm/opus recording POSTed through `/api/listen` returns words; the raw response is saved in `evidence/` (no key in it).
  Learner check: Run `npm run dev`, open http://localhost:3000, paste two sentences, record yourself, and see the heard words appear.
  Commit: `Record a take and get heard words from Deepgram`

- [x] **2. The marked script**
  Becomes usable: After a take, the Review step shows the script with red (missed / heard as something else, with "Heard: ___"), amber (unclear), filler and added chips, pause markers, speed per line, a summary bar and the Ready status.
  Why now: This is the unique kernel — it comes right after the listener works, before any extras.
  PRD ref: `prd.md > The marked script`, `prd.md > Ready check`, `prd.md > Script input`
  Spec ref: `spec.md > Components` (Lines, Aligner, Marker, Review step, Marked line), `spec.md > Data Model`
  Build: `lib/lines.ts` (sentence lines, normalised words, 600-word limit, line/word count), `lib/align.ts` (word edit distance + backtrace), `lib/marks.ts` (rules + Ready), whole-take split across lines, `ReviewStep` + `MarkedLine` in plain styling.
  Verify (mechanical): `npm test` passes `lib/align.test.ts` (one swap, one missing, one added "um", a repeated word) and `lib/marks.test.ts` (each mark type + Ready); a real take with one deliberately swapped word shows that word red with "Heard: <word>", saved in `evidence/`.
  Learner check: Record your real demo script. Swap one word on purpose, say "umm" once, stop for 2 seconds mid-sentence — see each one marked in the right place.
  Commit: `Mark the script: missed, unclear, fillers, pauses, speed, Ready`

- [x] **3. Retake a line and compare**
  Becomes usable: Any line has "Retake line"; the new result replaces that line in take 2. A Compare view shows take 1 vs take 2 per line, "same as take 1" for untouched lines, and Play on both sides.
  Why now: Retaking only marked lines is the time saver in the kernel; it needs the marks from slice 2.
  PRD ref: `prd.md > Retake a line`, `prd.md > Compare takes`, `prd.md > Ready check`
  Spec ref: `spec.md > Components` (Marked line, Compare view), `spec.md > Data Model` (take2)
  Build: line retake through the same recorder + `/api/listen`, aligned against that line only; `CompareView` with one shared `<audio>` seeking take 1 to the line's word times; Ready uses take 2 when present.
  Verify (mechanical): `npm run build` passes; a real line retake via the API replaces only that line in take 2; a `marks` test covers Ready over take 1 + take 2.
  Learner check: Retake a red line cleanly — it turns clean in take 2, other lines stay, and Play on each side plays just that line.
  Commit: `Retake a line and compare take 1 with take 2`

- [x] **4. Survives reload, and failures don't lose the take**
  Becomes usable: Script and results stay after a reload (play buttons off with a note). Mic blocked, nothing heard, and listener down each show their plain message; Try again re-sends the kept recording.
  Why now: Real use breaks here first; the happy path must exist before its edges.
  PRD ref: `prd.md > States and Boundaries`
  Spec ref: `spec.md > Components` (Storage), `spec.md > Important Failure Modes`
  Build: `lib/storage.ts` (`retake:v1`, try/catch), load on open / save on change, the three error states, empty-script hint.
  Verify (mechanical): `npm run build` passes; in the browser, reload keeps the marks; a forced API failure shows the message and Try again succeeds; a silent recording shows "We didn't hear anything".
  Learner check: Reload mid-review, then block the mic in Chrome site settings and try to record.
  Commit: `Keep the session on reload and handle mic, silence and network failures`

- [ ] **5. Sample mode**
  Becomes usable: "Try the sample" opens a real session of the learner's voice (take 1 with marks, take 2 after retakes), labelled "Sample", with no mic and no API call.
  Why now: Judges need it, and it can only be made from a real session once slices 2–4 exist.
  PRD ref: `prd.md > Sample mode`
  Spec ref: `spec.md > Components` (Sample), `spec.md > Data Model`
  Build: dev-only "Export session as sample" (words + audio as data URLs), `public/sample/sample.json` loader that runs the same align + marks code.
  Verify (mechanical): `npm run build` passes; with the mic blocked and no network call to `/api/listen`, the sample shows marks, plays lines and compares takes.
  Learner check: Record your real sample, export it, then open the app in a fresh tab and press "Try the sample".
  Commit: `Add sample mode from a real recorded session`

## Hands-on Checkpoints

- [x] Early usable behavior explored — after slice 2: learner records his real script, judges the marks, tunes thresholds, and then designs the final UI himself
- [ ] Final kick-the-tires exploration and feedback completed

Checkpoint 1 (24 Oct): learner's first real take came back almost empty (mic not picking him up) → added mic name +
level bar, recording playback and the heard transcript; second take worked and surfaced two bugs ("grey"/"gray",
speed without breaks) — fixed — and real misses ("fillers" → "pillers", "chips" → "tips"). He asked to keep
building; the UI design comes later.

## Final Review

- [ ] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [ ] Learning activity complete — guided route, focused alternative, prior practice connected, or brief recap
- [ ] Optional edit and transfer reflection addressed — offered/declined/already covered/not applicable as appropriate
- [ ] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence:
Route and stops:
Edit outcome:
Reflection:
Activity mode:

## Revisions

- `lib/lines.ts` spells out plain numbers as words for comparing only (display text unchanged); years read as "twenty twenty six" may still show red, accepted for the POC — Deepgram's Smart Format page shows numbers come back as spoken words when `smart_format` is off, so script digits would never match.
- `Line` gained `shown` (display text per compared word) and a `lib/lines.test.ts` was added — the number fix makes one shown word ("$200") stand for several compared words, so the display needs its own list, and the number converter is new logic that needs a test.
- Added words between two sentences go with the next sentence (`markTake`) — an "um" before a sentence belongs to it; the spec only said "the line they fall inside".
- Review step shows the recording + the full heard transcript, and the Read step shows the mic name + a live level bar — learner's first real take came back almost empty (only "hi" heard, 93 missed) and he could not tell whether audio was recorded; he asked to hear it and see the transcript.
- Speed now counts the break after each sentence (capped at 1.2 s) — the learner's first real take showed every line "too fast" (187 wpm) when his real pace was ~169 wpm (93 words in 33 s); timing only the words inflates the rate, and the 110–165 band assumes breaks are counted.
- British spellings map to US spelling in `normalise` — the real take marked "Grey" red because Deepgram wrote "gray".
- Playback decodes the recording with Web Audio (`lib/play.ts`) instead of seeking one `<audio>` — Chrome's MediaRecorder webm has no seek index, so jumping to a line's time is unreliable; a decoded buffer plays exact segments.
- The heard word is shown under each red word and any word can be clicked to hear it — after checkpoint 1 the learner felt red words were "said clearly"; hearing exactly what the listener heard answers that (learner agreed).
- Line speed is labelled only from 6 heard words — a 4-word greeting showed "too slow" because one breath swings a short line's rate.
- `/api/listen` turns Deepgram's 400 into 422 "No speech" — a recording with no sound reaches Deepgram as a ~110-byte file that it rejects as "corrupt or unsupported data"; without this, a silent take said "try again", which can never help.
