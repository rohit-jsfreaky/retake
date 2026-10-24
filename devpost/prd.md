---
doc: prd
status: approved
---

# Retake — Product Requirements

A web app for anyone who must say prepared words in English when it isn't their first language: read your script once,
see the words a listener would miss, retake only those lines.
Source: `scope.md > The Unique Kernel`, `scope.md > Who It's For`.

## The Core Journey
1. **Arrive.** The first screen says what Retake is and who it's for in one line, with a script box and a "Try the
   sample" button. No login. (`scope.md > The POC Boundary`)
2. **Paste the script** — the exact words they will say. Retake splits it into lines (one per sentence).
3. **Read it.** Press Record, read the script shown large on screen, press Stop. The browser asks for the mic once.
4. **Wait a moment.** "Listening back…" while the recording is transcribed.
5. **See the marked script.** Every script word is shown in place: red = the listener missed it or heard a different
   word, amber = heard but unclear, grey chips = fillers and added words, pause markers between words, a speed badge
   per line. A summary at the top counts each kind of mark. (`scope.md > What "Working" Looks Like`)
6. **Retake the marked lines.** Each line with a mark has a "Retake line" button. They read just that line again;
   the new result replaces the old one in take 2.
7. **Compare.** Take 1 and take 2 side by side, line by line. Play either version of any line.
8. **Ready check.** When nothing important is left marked, the summary turns to "Ready to record". Success = they go
   and record the real thing with confidence.

## Screens and Layout
One page that moves through three steps (a step bar shows where you are: Script → Read → Review).
- **Script step** — headline (what + who), a large text box, word count, "Start reading" button, "Try the sample".
- **Read step** — the script in big readable type, a Record / Stop button, a timer. "Back to script" link.
- **Review step** — summary bar at the top (counts + Ready status), the marked script line by line in the middle, a
  legend that explains each mark, and a "Take 1 / Compare" switch. Each line: its marks, speed badge, play button,
  "Retake line" button.

## Look and Feel
Agreed direction (from earlier answers): light mode, clean and professional like a real product, structure over
decoration. NOT the cream/beige + rust/orange look; no gradients or glow; no Inter. Icons: one monochrome line set.
The script text is the hero; the marks are the only strong colours on the page.
*Concrete fonts and colours are a recommendation in `spec.md > Look and Feel`, approved with the spec.*

## Features and Behavior

### Script input
- Paste or type up to 600 words (about 4 minutes of speech).
- Lines = sentences; a blank line in the pasted text also starts a new line.
  - [ ] Pasting a 5-sentence script shows "5 lines · N words" under the box.
  - [ ] Over 600 words: a plain message and the Start button is disabled.

### Recording a take
- Record / Stop in the browser with the laptop mic. Timer while recording.
  - [ ] After Stop, "Listening back…" shows, then the Review step opens with the marked script.

### The marked script
The heart of the product. For every script word:
- **Missed (red)** — the listener didn't hear it, or heard a different word. Hover / tap shows "Heard: ___" or
  "Not heard".
- **Unclear (amber)** — the listener heard the right word but wasn't sure of it.
- **Fillers (grey chip)** — "um", "uh" and filler phrases ("so basically", "you know", "actually", "like", "matlab")
  spoken but not in the script.
- **Added words (grey chip)** — other words spoken that aren't in the script (repeats, slips).
- **Long pause (marker)** — a gap inside a sentence long enough to break the flow, shown with its length.
- **Speed (badge per line + overall)** — words per minute, labelled "too fast" or "too slow" outside a comfortable band.
- **Summary bar** — counts: missed, unclear, fillers, pauses, overall speed.
  - [ ] Reading the script with one word deliberately swapped shows that word in red with "Heard: <swapped word>".
  - [ ] Saying "umm" between two words shows a filler chip in that spot.
  - [ ] Stopping for ~2 seconds mid-sentence shows a pause marker with the length.
  - [ ] Reading a line very fast shows "too fast" on that line.

### Retake a line
- Any line can be retaken; marked lines show the button first. Retaking records only that line and checks it only
  against that line's words.
- Take 2 = take 1 with every retaken line replaced. A line can be retaken more than once (latest wins).
  - [ ] Retaking a red line cleanly makes that line clean in take 2; other lines stay as they were.

### Compare takes
- Side by side: take 1 line vs take 2 line, with marks on both. Play button on each.
  - [ ] Pressing play on a take 1 line plays just that line's audio; same for take 2.
  - [ ] Lines that were not retaken show "same as take 1".

### Ready check
- "Ready to record" when take 2 (or take 1 if no retakes) has no missed words, no fillers, no long pauses and overall
  speed in the comfortable band. Otherwise "Not yet" with what is left ("2 missed words, 1 filler").
  - [ ] Clearing every mark through retakes turns the summary to "Ready to record".

### Sample mode
- "Try the sample" opens the Review step with a real script and two real takes of the maker's voice (take 1 with marks,
  take 2 after retakes) — no mic, no signup, no waiting. Clearly labelled "Sample".
  - [ ] A judge can open the sample, see marks, play lines and compare takes without allowing the mic.

## States and Boundaries
- **First use** — empty script box, the "Try the sample" button is the second obvious action.
- **Empty script** — Start button disabled, hint "Paste what you're going to say".
- **Mic blocked** — plain message on how to allow the mic, plus "Try the sample instead".
- **Nothing heard** (silent or very short recording) — "We didn't hear anything — check your mic and try again."
- **Listener unreachable** (network / service error) — "Couldn't check this take. Your recording is kept — try
  again." with a Try again button; the recording is not lost.
- **What persists** — the script and the latest marked results stay in this browser after a reload. Audio stays only
  for the current visit; after a reload the marks are still there but play buttons are off, with a short note.
- **Privacy** — no account; audio goes only to the speech-to-text service to be transcribed.

## Product Decisions
- One web app, no login — judges and real users try it in one click. (Learner, 24 Oct)
- Retake only the marked lines, not the whole script — that is the time saver. (Learner)
- Sample mode uses real takes of the maker's own voice, not made-up data. (Learner)
- The script is never rewritten by AI — you practise your own words. (Learner)
- **Assumption, tune in build:** the exact cut-offs for "unclear", "long pause" and the comfortable speed band are
  starting values in the spec, tuned on real takes during the build.

## What We're Building
Script input, recording a take, the marked script with all five mark types, retake a line, compare takes with
playback, the Ready check, sample mode, the three error states above, saving script + results in the browser.

## Deferred From the POC
- History of past scripts and takes — needs saved audio and a list screen; one session proves the idea.
- Saving audio across reloads — browser storage for audio adds work; marks are enough to come back to.
- Downloading the take — not needed to prove the kernel.

## Possible Later Enhancements
- Tips per missed word (how to say it more clearly).
- Teleprompter that scrolls with your voice.
- Other languages.

## Non-Goals
- No accounts or login — blocks the one-click try.
- No live captions while speaking — not needed for the marks.
- No AI rewriting of the script — changes the user's words.
- No video recording — audio is what the listener judges.
- No mobile app.

## Open Questions
- Can the listener reliably catch Hindi fillers like "matlab"? — can wait; check on a real take during the build.
- Exact thresholds (unclear / pause / speed) — can wait; tuned in the build.
