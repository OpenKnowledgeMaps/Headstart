import { expect, describe, it, vitest } from "vitest";

import {
  getDateTimeFromTimestamp,
  getDateFromTimestamp,
  getTimeFromTimestamp,
} from "../../js/utils/dates";

describe("Dates utility functions", () => {
  const mockWarn = vitest.fn();

  global.console = Object.assign({}, console, { warn: mockWarn });

  it("formats timestamp to date and time", () => {
    const TIMESTAMP = "2020-07-09 18:20:14";
    const EXPECTED_RESULT = "on 9 Jul 2020 at 18:20";

    const actualResult = getDateTimeFromTimestamp(TIMESTAMP);

    expect(actualResult).toEqual(EXPECTED_RESULT);
  });

  it("returns empty string for a wrong input type", () => {
    const TIMESTAMP = 123456789 as unknown as string;
    const EXPECTED_RESULT = "";

    const actualResult = getDateTimeFromTimestamp(TIMESTAMP);

    expect(actualResult).toEqual(EXPECTED_RESULT);
  });

  it("returns empty string for a wrong input format", () => {
    const TIMESTAMP = "hello world";
    const EXPECTED_RESULT = "";

    const actualResult = getDateTimeFromTimestamp(TIMESTAMP);

    expect(actualResult).toEqual(EXPECTED_RESULT);
  });

  it("returns empty string for a wrong input type (date only)", () => {
    const TIMESTAMP = 123456789 as unknown as string;
    const EXPECTED_RESULT = "";

    const actualResult = getDateFromTimestamp(TIMESTAMP);

    expect(actualResult).toEqual(EXPECTED_RESULT);
  });

  it("returns empty string for a wrong input type (time only)", () => {
    const TIMESTAMP = 123456789 as unknown as string;
    const EXPECTED_RESULT = "";

    const actualResult = getTimeFromTimestamp(TIMESTAMP);

    expect(actualResult).toEqual(EXPECTED_RESULT);
  });

  it("formats timestamp to date in a custom format", () => {
    const TIMESTAMP = "2020-07-09 18:20:14";
    const EXPECTED_RESULT = "2020-07-09";

    const actualResult = getDateFromTimestamp(TIMESTAMP, {
      format: "yyyy-mm-dd",
    });

    expect(actualResult).toEqual(EXPECTED_RESULT);
  });

  it("formats timestamp to time in a custom format", () => {
    const TIMESTAMP = "2020-07-09 08:20:14";
    const EXPECTED_RESULT = "08:20";

    const actualResult = getTimeFromTimestamp(TIMESTAMP, {
      format: "HH:MM",
    });

    expect(actualResult).toEqual(EXPECTED_RESULT);
  });

  it("formats timestamp to time in a custom format in a local timezone", () => {
    const TIMESTAMP = "2020-07-09T08:20:14Z";
    const EXPECTED_RESULT = "10:20";

    const actualResult = getTimeFromTimestamp(TIMESTAMP, {
      format: "HH:MM",
    });

    expect(actualResult).toEqual(EXPECTED_RESULT);
  });

  it("formats timestamp to date in a custom format in UTC", () => {
    const TIMESTAMP = "2020-07-09T23:59:59Z";
    const EXPECTED_RESULT = "2020-07-09";

    const actualResult = getDateFromTimestamp(TIMESTAMP, {
      format: "yyyy-mm-dd",
      inUTC: true,
    });

    expect(actualResult).toEqual(EXPECTED_RESULT);
  });

  it("formats timestamp to time in a custom format in UTC", () => {
    const TIMESTAMP = "2020-07-09T23:59:59Z";
    const EXPECTED_RESULT = "23:59";

    const actualResult = getTimeFromTimestamp(TIMESTAMP, {
      format: "HH:MM",
      inUTC: true,
    });

    expect(actualResult).toEqual(EXPECTED_RESULT);
  });
});
