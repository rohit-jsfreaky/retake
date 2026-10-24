import { test } from "node:test";
import assert from "node:assert/strict";
import { splitScript, sayNumber } from "./lines.ts";

test("sentences and blank lines become lines", () => {
  const lines = splitScript("Hi, I'm Rohit. This is Retake!\n\nIt listens\nto you");
  assert.deepEqual(lines.map((l) => l.text), ["Hi, I'm Rohit.", "This is Retake!", "It listens to you"]);
  assert.deepEqual(lines[0].words, ["hi", "i'm", "rohit"]);
  assert.deepEqual(lines[0].endsSentence, [false, false, true]);
});

test("numbers compare as spoken words but show as written", () => {
  const [line] = splitScript("I saved $200 in 3 days, 50% faster.");
  assert.deepEqual(line.words, ["i", "saved", "two", "hundred", "dollars", "in", "three", "days", "fifty", "percent", "faster"]);
  assert.deepEqual(line.shown, ["I", "saved", "$200", "", "", "in", "3", "days,", "50%", "", "faster."]);
});

test("sayNumber", () => {
  assert.deepEqual(sayNumber(0), ["zero"]);
  assert.deepEqual(sayNumber(25), ["twenty", "five"]);
  assert.deepEqual(sayNumber(110), ["one", "hundred", "ten"]);
  assert.deepEqual(sayNumber(1500), ["one", "thousand", "five", "hundred"]);
});

test("empty script has no lines", () => {
  assert.deepEqual(splitScript("  \n\n "), []);
});
