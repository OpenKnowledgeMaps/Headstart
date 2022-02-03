import {
  getDateTimeFromTimestamp,
  getDateFromTimestamp,
  getTimeFromTimestamp,
} from "../../js/utils/dates";

describe("Dates utility functions", () => {
  const mockWarn = jest.fn();

  global.console = {
    log: console.log,
    warn: mockWarn,
    error: console.error,
    info: console.info,
    debug: console.debug,
  };

  it("formats timestamp to date and time", () => {
    const TIMESTAMP = "2020-07-09 18:20:14";
    const EXPECTED_RESULT = "on 9 Jul 2020 at 18:20";

    const actualResult = getDateTimeFromTimestamp(TIMESTAMP);

    expect(actualResult).toEqual(EXPECTED_RESULT);
  });

  it("returns empty string for a wrong input type", () => {
    const TIMESTAMP = 123456789;
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
    const TIMESTAMP = 123456789;
    const EXPECTED_RESULT = "";

    const actualResult = getDateFromTimestamp(TIMESTAMP);

    expect(actualResult).toEqual(EXPECTED_RESULT);
  });

  it("returns empty string for a wrong input type (time only)", () => {
    const TIMESTAMP = 123456789;
    const EXPECTED_RESULT = "";

    const actualResult = getTimeFromTimestamp(TIMESTAMP);

    expect(actualResult).toEqual(EXPECTED_RESULT);
  });
});
