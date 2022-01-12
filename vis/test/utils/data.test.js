import {
  commentArrayValidator,
  commentsSanitizer,
  dateValidator,
  getInternalMetric,
  getVisibleMetric,
  oaStateValidator,
  resultTypeSanitizer,
  stringArrayValidator,
} from "../../js/utils/data";

describe("Data utility functions", () => {
  describe("date validator", () => {
    it("returns true for a valid input (yyyy)", () => {
      const data = "2021";

      const result = dateValidator(data);

      expect(result).toEqual(true);
    });

    it("returns true for a valid input (yyyy-mm)", () => {
      const data = "2021-12";

      const result = dateValidator(data);

      expect(result).toEqual(true);
    });

    it("returns true for a valid input (yyyy-mm-dd)", () => {
      const data = "2021-12-07";

      const result = dateValidator(data);

      expect(result).toEqual(true);
    });

    it("returns true for a valid input (iso 8601)", () => {
      const data = "2021-12-07T14:57:53Z";

      const result = dateValidator(data);

      expect(result).toEqual(true);
    });

    it("returns false for an invalid input", () => {
      const data = "today";

      const result = dateValidator(data);

      expect(result).toEqual(false);
    });
  });

  describe("oa_state validator", () => {
    it("returns true for a valid input", () => {
      const data = "1";

      const result = oaStateValidator(data);

      expect(result).toEqual(true);
    });

    it("returns false for an invalid input", () => {
      const data = "4";

      const result = oaStateValidator(data);

      expect(result).toEqual(false);
    });
  });

  describe("string array validator", () => {
    it("returns true for a valid input", () => {
      const data = ["1", "2", "3"];

      const result = stringArrayValidator(data);

      expect(result).toEqual(true);
    });

    it("returns false for an invalid element", () => {
      const data = ["1", 2, "3"];

      const result = stringArrayValidator(data);

      expect(result).toEqual(false);
    });

    it("returns false for an invalid input type", () => {
      const data = NaN;

      const result = stringArrayValidator(data);

      expect(result).toEqual(false);
    });
  });

  describe("resulttype sanitizer", () => {
    it("successfully sanitizes a string", () => {
      const data = "test";

      const result = resultTypeSanitizer(data);

      expect(result).toEqual([data]);
    });

    it("doesn't sanitize a number", () => {
      const data = 1;

      const result = resultTypeSanitizer(data);

      expect(result).toEqual(undefined);
    });
  });

  describe("comment validator", () => {
    it("returns true for a valid input", () => {
      const data = [
        { comment: "test" },
        { comment: "another test", author: "John Doe" },
      ];

      const result = commentArrayValidator(data);

      expect(result).toEqual(true);
    });

    it("returns false for an invalid input", () => {
      const data = null;

      const result = commentArrayValidator(data);

      expect(result).toEqual(false);
    });

    it("returns false for an invalid element (missing comment)", () => {
      const data = [{ comment: "test" }, { author: "John Doe" }];

      const result = commentArrayValidator(data);

      expect(result).toEqual(false);
    });

    it("returns false for an invalid element (wrong comment type)", () => {
      const data = [{ comment: "test" }, { comment: 1, author: "John Doe" }];

      const result = commentArrayValidator(data);

      expect(result).toEqual(false);
    });

    it("returns false for an invalid element (wrong author type)", () => {
      const data = [{ comment: "test" }, { comment: "test 2", author: 8 }];

      const result = commentArrayValidator(data);

      expect(result).toEqual(false);
    });
  });

  describe("comment sanitizer", () => {
    it("doesn't sanitize non-array input", () => {
      const data = "something";

      const result = commentsSanitizer(data);

      expect(result).toEqual(undefined);
    });

    it("sanitizes array input", () => {
      const data = [{ comment: "good comment" }, { cement: "wrong comment" }];

      const result = commentsSanitizer(data);

      expect(result).toHaveLength(1);
    });
  });

  describe("metric getters", () => {
    it("returns a visible metric from the data (defined value)", () => {
      const data = { testMetric: 42 };

      const result = getVisibleMetric(data, "testMetric");

      expect(result).toEqual(data.testMetric);
    });

    it("returns a visible metric from the data (n/a)", () => {
      const data = { testMetric: "N/A" };

      const result = getVisibleMetric(data, "testMetric");

      expect(result).toEqual("n/a");
    });

    it("returns an internal metric from the data (defined value)", () => {
      const data = { testMetric: 42 };

      const result = getInternalMetric(data, "testMetric");

      expect(result).toEqual(data.testMetric);
    });

    it("returns an internal metric from the data (undefined)", () => {
      const data = { testMetric: "N/A" };

      const result = getInternalMetric(data, "someOtherMetric");

      expect(result).toEqual(0);
    });

    it("returns an internal metric from the data (n/a)", () => {
      const data = { testMetric: "N/A" };

      const result = getInternalMetric(data, "testMetric");

      expect(result).toEqual(0);
    });
  });
});
