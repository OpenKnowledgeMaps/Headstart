import { expect, describe, it } from 'vitest';

import { isNonTextDocument } from "../../js/templates/Paper";

describe("Paper utility functions", () => {
  describe("isNonTextDocument function", () => {
    // testing the following complex logic:
    // https://docs.google.com/document/d/11ybT41oceMA29tplmBsyXxqswio-WFdpebcR7qhWoH0/edit#heading=h.y9ftuuxdxyx0
    it("is a non-text document (1)", () => {
      const PAPER = {
        resulttype: ["Other/Unknown material"],
      };

      const result = isNonTextDocument(PAPER);

      expect(result).toEqual(true);
    });

    it("is a non-text document (2)", () => {
      const PAPER = {
        resulttype: ["Other/Unknown material", "Dataset"],
      };

      const result = isNonTextDocument(PAPER);

      expect(result).toEqual(true);
    });

    it("is a non-text document (3)", () => {
      const PAPER = {
        resulttype: ["Map", "Other/Unknown material"],
      };

      const result = isNonTextDocument(PAPER);

      expect(result).toEqual(true);
    });

    it("is not a non-text document (4)", () => {
      const PAPER = {
        resulttype: ["Other/Unknown material", "Journal/newspaper article"],
      };

      const result = isNonTextDocument(PAPER);

      expect(result).toEqual(false);
    });

    it("is not a non-text document (5)", () => {
      const PAPER = {
        resulttype: ["Text", "Other/Unknown material"],
      };

      const result = isNonTextDocument(PAPER);

      expect(result).toEqual(false);
    });

    it("is a non-text document (6)", () => {
      const PAPER = {
        resulttype: ["Other/Unknown material", "Musical notation", "Text"],
      };

      const result = isNonTextDocument(PAPER);

      expect(result).toEqual(true);
    });

    it("is not a non-text document (6)", () => {
      const PAPER = {
        resulttype: ["Other/Unknown material", "Text", "Musical notation"],
      };

      const result = isNonTextDocument(PAPER);

      expect(result).toEqual(false);
    });
  });
});
