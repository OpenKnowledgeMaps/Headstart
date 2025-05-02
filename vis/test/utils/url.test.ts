import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  addQueryParam,
  addRemoveQueryParams,
  removeQueryParams,
} from "../../js/utils/url";

let currentUrl: URL;

const mockPushState = vi.fn((_: any, __: any, url: string) => {
  currentUrl = new URL("https://example.com" + url);
});

const setWindowHref = (href: string) => {
  currentUrl = new URL(href);
  Object.defineProperty(window, "location", {
    configurable: true,
    value: currentUrl,
  });
};

beforeEach(() => {
  currentUrl = new URL(
    "https://example.com/?first_parameter=1&second_parameter=2"
  );
  Object.defineProperty(window, "location", {
    configurable: true,
    value: currentUrl,
  });

  vi.stubGlobal("history", {
    pushState: mockPushState,
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Tests for query param functions", () => {
  beforeEach(() => {
    setWindowHref("https://example.com/?first_parameter=1&second_parameter=2");
  });

  describe("The addQueryParam function", () => {
    it("Adding a new parameter correctly", () => {
      addQueryParam("external_parameter", "3");
      expect(currentUrl.searchParams.get("external_parameter")).toBe("3");
      expect(mockPushState).toHaveBeenCalled();
    });

    it("Rewrite existing parameter", () => {
      addQueryParam("first_parameter", "updated");
      expect(currentUrl.searchParams.get("first_parameter")).toBe("updated");
    });

    it("Works with empty string", () => {
      addQueryParam("newParam", "");
      expect(currentUrl.searchParams.get("newParam")).toBe("");
    });
  });

  describe("The removeQueryParams function", () => {
    it("Deletes parameters", () => {
      removeQueryParams("first_parameter", "second_parameter");
      expect(currentUrl.searchParams.get("first_parameter")).toBeNull();
      expect(currentUrl.searchParams.get("second_parameter")).toBeNull();
    });

    it("Don't crashes when parameter is not exists", () => {
      removeQueryParams("not_there");
      expect(currentUrl.searchParams.get("first_parameter")).toBe("1");
    });

    it("Works without arguments", () => {
      removeQueryParams();
      expect(currentUrl.search).toBe("?first_parameter=1&second_parameter=2");
    });
  });

  describe("The addRemoveQueryParams function", () => {
    it("Adding and removing parameters", () => {
      setWindowHref("https://example.com/?x=9&y=8");
      addRemoveQueryParams({ a: "1", b: "2" }, ["x"]);

      expect(currentUrl.searchParams.get("a")).toBe("1");
      expect(currentUrl.searchParams.get("b")).toBe("2");
      expect(currentUrl.searchParams.get("x")).toBeNull();
      expect(currentUrl.searchParams.get("y")).toBe("8");
    });

    it("Works with empty arguments", () => {
      setWindowHref("https://example.com/?keep=1");
      addRemoveQueryParams({}, []);
      expect(currentUrl.searchParams.get("keep")).toBe("1");
    });

    it("Replace and remove existing parameters", () => {
      setWindowHref(
        "https://example.com/?first_parameter=second_parameter&remove=me"
      );
      addRemoveQueryParams({ first_parameter: "new" }, ["remove"]);
      expect(currentUrl.searchParams.get("first_parameter")).toBe("new");
      expect(currentUrl.searchParams.has("remove")).toBe(false);
    });
  });
});
