import { hoverPaper } from "../../js/actions";

import reducer from "../../js/reducers/paperOrder";

describe("paper order state", () => {
  describe("reducers", () => {
    it("should return the initial state", () => {
      const EXPECTED_RESULT = { hoveredPaper: null, order: [], enlargeFactor: 1 };

      const result = reducer(undefined, {});

      expect(result).toEqual(EXPECTED_RESULT);
    });

    it("should change the paper order on paper hover", () => {
      const INITIAL_STATE = { hoveredPaper: null, order: ["some-uri"], enlargeFactor: 1 };

      const result = reducer(INITIAL_STATE, hoverPaper("some-uri", 2));

      const EXPECTED_RESULT = { hoveredPaper: "some-uri", order: ["some-uri"], enlargeFactor: 2 };

      expect(result).toEqual(EXPECTED_RESULT);
    });

    it("should change the hovered paper on paper unhover", () => {
      const INITIAL_STATE = { hoveredPaper: "some-uri", order: ["some-uri"] };

      const result = reducer(INITIAL_STATE, hoverPaper(null));

      const EXPECTED_RESULT = { hoveredPaper: null, order: ["some-uri"] };

      expect(result).toEqual(EXPECTED_RESULT);
    });

    it("should not change the state if the action is canceled", () => {
      const INITIAL_STATE = { some_state: 1 };

      const result = reducer(INITIAL_STATE, { canceled: true });

      expect(result).toEqual(INITIAL_STATE);
    });
  });
});
