import d3 from "d3";
import { describe } from "vitest";
import {
  addEmbedParam,
  capitalize,
  checkIsEmptyString,
  formatString,
  removeEmbedParam,
  shorten,
  stringCompare,
} from "../../js/utils/string";

describe("String utils tests", () => {
  describe("Tests for the capitalize function", () => {
    it("Correctly capitalized a string that starts from a lowercased letter", () => {
      const result = capitalize("some test");
      expect(result).toBe("Some test");
    });

    it("Correctly capitalized a string that starts from a uppercase letter", () => {
      const result = capitalize("Some test");
      expect(result).toBe("Some test");
    });

    it("Returning the empty string if not string was provided", () => {
      const resultWithNumber = capitalize(15 as unknown as string);
      expect(resultWithNumber).toBe("");

      const resultWithBoolean = capitalize(true as unknown as string);
      expect(resultWithBoolean).toBe("");

      const resultWithObject = capitalize({} as unknown as string);
      expect(resultWithObject).toBe("");
    });
  });

  describe("Tests for the string compare function", () => {
    it("Should return zero (number) for the equal strings", () => {
      const result = stringCompare("string", "string");
      expect(result).toBe(0);
    });

    it("Should return minus one (number) when first string is less than second string in asc order", () => {
      const result = stringCompare("aa", "ab", "asc");
      expect(result).toBe(-1);
    });

    it("Should return one (number) when first string is greater than second string in asc order", () => {
      const result = stringCompare("ab", "aa", "asc");
      expect(result).toBe(1);
    });

    it("Should return one (number) when first string is empty", () => {
      const result = stringCompare("", "aa");
      expect(result).toBe(1);
    });

    it("Should return minus one (number) when second string is empty", () => {
      const result = stringCompare("aa", "");
      expect(result).toBe(-1);
    });

    it("Should return minus one (number) when first string is less than second string in desc order", () => {
      const result = stringCompare("aa", "ab", "desc");
      expect(result).toBe(1);
    });

    it("Should return 1 when first string is greater than second string in desc order", () => {
      const result = stringCompare("ab", "aa", "desc");
      expect(result).toBe(-1);
    });

    it("Should handle same string but with different cases", () => {
      const result = stringCompare("SoMe string", "some string");
      expect(result).toBe(0);
    });

    it("Should work correctly with numbers as strings", () => {
      const result = stringCompare("10", "5", "asc");
      expect(result).toBe(-1);
    });

    it("Should work correctly with numbers", () => {
      const resultInAscCompare = stringCompare(
        10 as unknown as string,
        5 as unknown as string,
        "asc",
      );
      expect(resultInAscCompare).toBe(d3.ascending(10, 5));

      const resultInDescCompare = stringCompare(
        10 as unknown as string,
        5 as unknown as string,
        "desc",
      );
      expect(resultInDescCompare).toBe(d3.descending(10, 5));
    });

    it("Should work correctly with different types", () => {
      const resultWithIncorrectFirstArg = stringCompare(
        10 as unknown as string,
        "string",
      );
      expect(resultWithIncorrectFirstArg).toBe(-1);

      const resultWithIncorrectSecondArg = stringCompare(
        "string",
        10 as unknown as string,
      );
      expect(resultWithIncorrectSecondArg).toBe(1);
    });

    it("Should return undefined if undefined values were provided", () => {
      const resultWithFirstArg = stringCompare(
        undefined as unknown as string,
        "string",
      );
      expect(resultWithFirstArg).toBeUndefined();

      const resultWithSecondArg = stringCompare(
        "string",
        undefined as unknown as string,
      );
      expect(resultWithSecondArg).toBeUndefined();
    });
  });

  describe("Tests for the shorted function", () => {
    it("Correctly make string shorter", () => {
      const result = shorten("string", 3, "");
      expect(result).toBe("str");
    });

    it("Correctly make string shorter and adding default ending with three dots", () => {
      const result = shorten("string", 4);
      expect(result).toBe("stri...");
    });

    it("Correctly make string shorter and adding custom ending with three dots", () => {
      const result = shorten("string", 3, "...continue...");
      expect(result).toBe("str...continue...");
    });

    it("Returning full string if length value is bigger than real string length", () => {
      const result = shorten("string", 20);
      expect(result).toBe("string");
    });
  });

  describe("Tests for the format string function", () => {
    it("Should replace special places with values", () => {
      const result = formatString("Hello, ${name}!", { name: "World" });
      expect(result).toBe("Hello, World!");
    });

    it("Should replace multiple special places with values", () => {
      const result = formatString("${greeting}, ${name}!", {
        greeting: "Hello",
        name: "World",
      });

      expect(result).toBe("Hello, World!");
    });

    it("Should handle special places appearing multiple times", () => {
      const result = formatString("${word} ${word}", { word: "Hello" });
      expect(result).toBe("Hello Hello");
    });
  });

  describe("Tests for the add embed param function", () => {
    it("Should correctly work with other query params", () => {
      const result = addEmbedParam("https://example.com/?param=value");
      expect(result).toBe("https://example.com/?param=value&embed=true");
    });

    it("Should add embed param to clear URL", () => {
      const result = addEmbedParam("https://example.com");
      expect(result).toBe("https://example.com/?embed=true");
    });

    it("Should replace existing embed param with true", () => {
      const result = addEmbedParam("https://example.com/?embed=false");
      expect(result).toBe("https://example.com/?embed=true");
    });
  });

  describe("Tests for the remove embed param function", () => {
    it("Should correctly remove embed param", () => {
      const result = removeEmbedParam("https://example.com/?embed=true");
      expect(result).toBe("https://example.com/");
    });

    it("Should not modify URL if it is not contains embed param", () => {
      const result = removeEmbedParam("https://example.com/?param=value");
      expect(result).toBe("https://example.com/?param=value");
    });

    it("Should work correctly with URLs without params", () => {
      const result = removeEmbedParam("https://example.com");
      expect(result).toBe("https://example.com/");
    });
  });

  describe("Tests for the function that checks that string is empty", () => {
    it("Should work with empty string", () => {
      const result = checkIsEmptyString("");
      expect(result).toBe(true);
    });

    it("Should work with string without letters, but with space", () => {
      const result = checkIsEmptyString("  ");
      expect(result).toBe(true);
    });

    it("Should work with not empty string", () => {
      const result = checkIsEmptyString("Content in the string!");
      expect(result).toBe(false);
    });

    it("Should work with different data types", () => {
      const resultForBoolean = checkIsEmptyString(true);
      expect(resultForBoolean).toBe(false);

      const resultForNumber = checkIsEmptyString(1);
      expect(resultForNumber).toBe(false);

      const resultForObject = checkIsEmptyString({});
      expect(resultForObject).toBe(false);

      const resultForFunction = checkIsEmptyString(() => {});
      expect(resultForFunction).toBe(false);
    });
  });
});
