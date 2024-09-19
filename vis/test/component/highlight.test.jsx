import { expect, describe, it, vitest } from 'vitest';

import { getQueryTermMatcher } from "../../js/components/Highlight";

/**
 * Tests for the query term matcher in the highlight component.
 * 
 * A word in the text matches only if it's exactly the same as the term.
 * 
 * Supported boundaries are whitespace, period, comma, question mark, 
 * exclamation mark, hyphen, slash and brackets.
 * 
 * I had to list the supported characters like this, since matching the
 * non-words and non-soft-hyphens does not work.
 * 
 * Also described here:
 * https://stackoverflow.com/questions/7176921/looking-for-regex-soft-hyphen-or-not-a-word-character
 */
describe("Highlight query term matcher", () => {
  it("matches a single word", () => {
    const TEXT = "car";
    const TERM = "car";

    const matcher = getQueryTermMatcher(TERM, true);
    const result = TEXT.match(matcher);

    expect(result).not.toBe(null);
  });

  it("matches a word at start", () => {
    const TEXT = "car with no roof";
    const TERM = "car";

    const matcher = getQueryTermMatcher(TERM, true);
    const result = TEXT.match(matcher);

    expect(result).not.toBe(null);
  });

  it("matches a word at the end", () => {
    const TEXT = "a blue car";
    const TERM = "car";

    const matcher = getQueryTermMatcher(TERM, true);
    const result = TEXT.match(matcher);

    expect(result).not.toBe(null);
  });

  it("matches a word in the middle", () => {
    const TEXT = "a blue car with no roof";
    const TERM = "car";

    const matcher = getQueryTermMatcher(TERM, true);
    const result = TEXT.match(matcher);

    expect(result).not.toBe(null);
  });

  it("doesn't match a substring at start", () => {
    const TEXT = "the carbonic acid";
    const TERM = "car";

    const matcher = getQueryTermMatcher(TERM, true);
    const result = TEXT.match(matcher);

    expect(result).toBe(null);
  });

  it("doesn't match a substring at the end", () => {
    const TEXT = "a substring at the end";
    const TERM = "string";

    const matcher = getQueryTermMatcher(TERM, true);
    const result = TEXT.match(matcher);

    expect(result).toBe(null);
  });

  it("doesn't match a substring in the middle", () => {
    const TEXT = "substrings in the middle";
    const TERM = "string";

    const matcher = getQueryTermMatcher(TERM, true);
    const result = TEXT.match(matcher);

    expect(result).toBe(null);
  });

  it("doesn't match a substring with a soft hyphen at start", () => {
    const TEXT = "a sub\u00ADstring at the end";
    const TERM = "string";

    const matcher = getQueryTermMatcher(TERM, true);
    const result = TEXT.match(matcher);

    expect(result).toBe(null);
  });

  it("doesn't match a substring with a soft hyphen at the end", () => {
    const TEXT = "the car\u00ADbonic acid";
    const TERM = "car";

    const matcher = getQueryTermMatcher(TERM, true);
    const result = TEXT.match(matcher);

    expect(result).toBe(null);
  });

  it("doesn't match a substring with a soft hyphen in the middle", () => {
    const TEXT = "sub\u00ADstring\u00ADs in the middle";
    const TERM = "string";

    const matcher = getQueryTermMatcher(TERM, true);
    const result = TEXT.match(matcher);

    expect(result).toBe(null);
  });

  it("matches a substring with a hyphen at start", () => {
    const TEXT = "a sub-string at the end";
    const TERM = "string";

    const matcher = getQueryTermMatcher(TERM, true);
    const result = TEXT.match(matcher);

    expect(result).not.toBe(null);
  });

  it("matches a substring with a hyphen at the end", () => {
    const TEXT = "the car-bonic acid";
    const TERM = "car";

    const matcher = getQueryTermMatcher(TERM, true);
    const result = TEXT.match(matcher);

    expect(result).not.toBe(null);
  });

  it("matches a substring with a hyphen in the middle", () => {
    const TEXT = "sub-string-s in the middle";
    const TERM = "string";

    const matcher = getQueryTermMatcher(TERM, true);
    const result = TEXT.match(matcher);

    expect(result).not.toBe(null);
  });

  it("matches a substring with a period at the end", () => {
    const TEXT = "The car.";
    const TERM = "car";

    const matcher = getQueryTermMatcher(TERM, true);
    const result = TEXT.match(matcher);

    expect(result).not.toBe(null);
  });

  it("matches a substring with a comma at the end", () => {
    const TEXT = "The car, whatever.";
    const TERM = "car";

    const matcher = getQueryTermMatcher(TERM, true);
    const result = TEXT.match(matcher);

    expect(result).not.toBe(null);
  });

  it("matches a substring with a slash at the end", () => {
    const TEXT = "a car/motorbike";
    const TERM = "car";

    const matcher = getQueryTermMatcher(TERM, true);
    const result = TEXT.match(matcher);

    expect(result).not.toBe(null);
  });

  it("matches a substring with a question mark at the end", () => {
    const TEXT = "a car?";
    const TERM = "car";

    const matcher = getQueryTermMatcher(TERM, true);
    const result = TEXT.match(matcher);

    expect(result).not.toBe(null);
  });

  it("matches a substring with a exclamation mark at the end", () => {
    const TEXT = "a car!";
    const TERM = "car";

    const matcher = getQueryTermMatcher(TERM, true);
    const result = TEXT.match(matcher);

    expect(result).not.toBe(null);
  });

  it("matches a substring in (brackets)", () => {
    const TEXT = "(car)";
    const TERM = "car";

    const matcher = getQueryTermMatcher(TERM, true);
    const result = TEXT.match(matcher);

    expect(result).not.toBe(null);
  });
 
  it("matches a substring in [brackets]", () => {
    const TEXT = "[car]";
    const TERM = "car";

    const matcher = getQueryTermMatcher(TERM, true);
    const result = TEXT.match(matcher);

    expect(result).not.toBe(null);
  });

  it("matches a substring in {brackets}", () => {
    const TEXT = "{car}";
    const TERM = "car";

    const matcher = getQueryTermMatcher(TERM, true);
    const result = TEXT.match(matcher);

    expect(result).not.toBe(null);
  });
});
