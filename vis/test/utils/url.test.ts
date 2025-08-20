import { describe, vi } from "vitest";
import {
  checkIsCurrentHostIsLocalhost,
  ensureThatURLStartsWithHTTP,
} from "../../js/utils/url";

// Mocking of the window location
const setWindowHost = (host: string) => {
  Object.defineProperty(window, "location", {
    value: { host },
    writable: true,
  });
};

describe("Tests for the ensureThatURLStartsWithHTTP function", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Works correctly with localhost", () => {
    beforeEach(() => {
      setWindowHost("localhost:8085");
    });

    it("Should add http if it is missing", () => {
      const result = ensureThatURLStartsWithHTTP("//some_domain.com");
      expect(result).toBe("http://some_domain.com");
    });

    it("Should not change if url already has http", () => {
      const result = ensureThatURLStartsWithHTTP("http://some_domain.com");
      expect(result).toBe("http://some_domain.com");
    });

    it("Should not change if url already has https", () => {
      const result = ensureThatURLStartsWithHTTP("https://some_domain.com");
      expect(result).toBe("https://some_domain.com");
    });
  });

  describe("Works correctly with not localhost", () => {
    beforeEach(() => {
      setWindowHost("some_domain.com");
    });

    it("Should add https if missing", () => {
      const result = ensureThatURLStartsWithHTTP("//some_domain.com");
      expect(result).toBe("https://some_domain.com");
    });

    it("Should not change if url already has http", () => {
      const result = ensureThatURLStartsWithHTTP("http://some_domain.com");
      expect(result).toBe("http://some_domain.com");
    });

    it("Should not change if url already has https", () => {
      const result = ensureThatURLStartsWithHTTP("https://some_domain.com");
      expect(result).toBe("https://some_domain.com");
    });
  });
});

describe("Tests for the checkIsCurrentHostIsLocalhost function", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("Return boolean true if we using localhost", () => {
    setWindowHost("localhost:8085");
    expect(checkIsCurrentHostIsLocalhost()).toBe(true);
  });

  it("Return boolean false if we don't using localhost", () => {
    setWindowHost("some_domain.com");
    expect(checkIsCurrentHostIsLocalhost()).toBe(false);
  });
});
