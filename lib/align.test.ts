import { test } from "node:test";
import assert from "node:assert/strict";
import { align, type HeardWord } from "./align.ts";

const heard = (...words: string[]): HeardWord[] => words.map((word, i) => ({ word, start: i, end: i + 0.5, confidence: 0.99 }));
const kinds = (script: string, ...said: string[]) => align(script.split(" "), heard(...said)).map((s) => s.kind);

test("every word heard", () => {
  assert.deepEqual(kinds("ship the demo", "ship", "the", "demo"), ["match", "match", "match"]);
});

test("one swapped word keeps what was heard", () => {
  const steps = align("my product works".split(" "), heard("my", "pro", "works"));
  assert.deepEqual(steps.map((s) => s.kind), ["match", "swap", "match"]);
  assert.equal(steps[1].kind === "swap" && steps[1].heard.word, "pro");
});

test("one missing word", () => {
  assert.deepEqual(kinds("ship the demo today", "ship", "demo", "today"), ["match", "missed", "match", "match"]);
});

test("one added um", () => {
  assert.deepEqual(kinds("ship the demo", "ship", "um", "the", "demo"), ["match", "added", "match", "match"]);
});

test("a repeated word is one added word", () => {
  const steps = kinds("the cat sat", "the", "the", "cat", "sat");
  assert.equal(steps.filter((k) => k === "added").length, 1);
  assert.equal(steps.filter((k) => k === "match").length, 3);
});

test("heard words are compared case and punctuation free", () => {
  assert.deepEqual(kinds("i'm ready", "I'm", "Ready."), ["match", "match"]);
});

test("nothing heard means every word missed", () => {
  assert.deepEqual(kinds("hello there"), ["missed", "missed"]);
});
