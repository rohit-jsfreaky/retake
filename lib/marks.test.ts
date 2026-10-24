import { test } from "node:test";
import assert from "node:assert/strict";
import type { HeardWord } from "./align.ts";
import { splitScript } from "./lines.ts";
import { markTake, isReady } from "./marks.ts";

// [word, start] pairs; each word lasts 0.3 s unless the next one starts sooner.
function take(...pairs: [string, number, number?][]): HeardWord[] {
  return pairs.map(([word, start, confidence = 0.99]) => ({ word, start, end: start + 0.3, confidence }));
}

// About 150 wpm: one word every 0.4 s.
const even = (words: string, from = 0) => words.split(" ").map((w, i) => [w, from + i * 0.4] as [string, number]);

test("a clean read is ready", () => {
  const lines = splitScript("Ship the demo today. Then rest a bit.");
  const results = markTake(lines, take(...even("ship the demo today"), ...even("then rest a bit", 2)));
  assert.equal(results.length, 2);
  assert.ok(results.every((r) => r.words.every((w) => w.kind === "ok")));
  const status = isReady(results);
  assert.equal(status.ready, true, status.left.join());
});

test("a swapped word is missed with what was heard", () => {
  const [r] = markTake(splitScript("My product works well."), take(...even("my pro works well")));
  assert.deepEqual(r.words[1], { script: "product", kind: "missed", heard: "pro", start: 0.4, end: 0.7 });
  assert.equal(isReady([r]).missed, 1);
  assert.equal(isReady([r]).ready, false);
});

test("a low-confidence word is unclear but does not block Ready", () => {
  const [r] = markTake(splitScript("Ship the demo today."), take(["ship", 0], ["the", 0.4, 0.4], ["demo", 0.8], ["today", 1.2]));
  assert.equal(r.words[1].kind, "unclear");
  const status = isReady([r]);
  assert.equal(status.unclear, 1);
  assert.equal(status.ready, true);
});

test("um and so basically are fillers in place; a repeat is added", () => {
  const [r] = markTake(
    splitScript("We built it for you."),
    take(["we", 0], ["um", 0.4], ["built", 0.8], ["it", 1.2], ["so", 1.6], ["basically", 2.0], ["for", 2.4], ["for", 2.8], ["you", 3.2]),
  );
  assert.deepEqual(r.inserts, [
    { afterWord: 0, text: "um", kind: "filler" },
    { afterWord: 2, text: "so basically", kind: "filler" },
    { afterWord: 2, text: "for", kind: "added" }, // either "for" can be the extra one; the aligner picks the first
  ]);
  const status = isReady([r]);
  assert.equal(status.fillers, 2);
  assert.equal(status.added, 1);
  assert.equal(status.ready, false);
});

test("a filler word that is in the script is not a filler", () => {
  const [r] = markTake(splitScript("I like it a lot."), take(...even("i like like it a lot")));
  assert.deepEqual(r.inserts.map((x) => x.kind), ["added"]);
});

test("a long stop mid-sentence is a pause; between sentences it is not", () => {
  const lines = splitScript("Ship the demo today. Then rest.");
  const results = markTake(lines, take(["ship", 0], ["the", 0.4], ["demo", 2.7], ["today", 3.1], ["then", 6], ["rest", 6.4]));
  assert.deepEqual(results[0].pauses, [{ afterWord: 1, seconds: 2 }]);
  assert.deepEqual(results[1].pauses, []);
});

test("speed per line: too fast and too slow", () => {
  const [fast] = markTake(splitScript("One two three four five six."), take(...even("one two three four five six").map(([w, s]) => [w, s / 2] as [string, number])));
  assert.ok(fast.wpm! > 165);
  assert.ok(isReady([fast]).left.includes("too fast"));
  const [slow] = markTake(splitScript("One two three."), take(["one", 0], ["two", 0.9], ["three", 1.8]));
  assert.ok(slow.wpm! < 110);
});

test("an um before a sentence goes with that sentence", () => {
  const results = markTake(splitScript("Hi there. Next line."), take(["hi", 0], ["there", 0.4], ["um", 0.8], ["next", 1.2], ["line", 1.6]));
  assert.equal(results[0].inserts.length, 0);
  assert.deepEqual(results[1].inserts, [{ afterWord: -1, text: "um", kind: "filler" }]);
});

test("nothing heard: every word missed, not ready", () => {
  const results = markTake(splitScript("Hello there."), []);
  assert.ok(results[0].words.every((w) => w.kind === "missed"));
  assert.equal(isReady(results).ready, false);
});

test("speed counts the break after a sentence, capped at a long pause", () => {
  // 4 words over 1.5 s, then 0.5 s before the next sentence: 4 / 2.0 s = 120 wpm, not 160.
  const lines = splitScript("Ship the demo today. Then rest a bit.");
  const results = markTake(lines, take(...even("ship the demo today"), ...even("then rest a bit", 2)));
  assert.ok(Math.abs(results[0].restAfter - 0.5) < 1e-9);
  assert.equal(results[0].wpm, 120);
  assert.equal(results[1].restAfter, 0); // last line: nothing after it
  // A 5 s stop between sentences only counts 1.2 s.
  const [first] = markTake(lines, take(...even("ship the demo today"), ...even("then rest a bit", 6.5)));
  assert.equal(first.restAfter, 1.2);
});
